//! Basic statistics operations: mean, median, variance, std, etc.

/// Mean of array.
#[no_mangle]
pub unsafe extern "C" fn mean(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return 0.0;
    }
    let mut sum = 0.0_f64;
    for i in 0..length as usize {
        sum += *data_ptr.add(i);
    }
    sum / length as f64
}

/// Median of a sorted array.
#[no_mangle]
pub unsafe extern "C" fn median(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return 0.0;
    }
    if length == 1 {
        return *data_ptr;
    }
    let mid = (length / 2) as usize;
    if length & 1 != 0 {
        *data_ptr.add(mid)
    } else {
        (*data_ptr.add(mid - 1) + *data_ptr.add(mid)) / 2.0
    }
}

/// Variance of array.
#[no_mangle]
pub unsafe extern "C" fn variance(data_ptr: *const f64, length: i32, ddof: i32) -> f64 {
    if length == 0 {
        return 0.0;
    }
    if length <= ddof {
        return f64::NAN;
    }
    let m = mean(data_ptr, length);
    let mut sum_sq = 0.0_f64;
    for i in 0..length as usize {
        let diff = *data_ptr.add(i) - m;
        sum_sq += diff * diff;
    }
    sum_sq / (length - ddof) as f64
}

/// Standard deviation.
#[no_mangle]
pub unsafe extern "C" fn std(data_ptr: *const f64, length: i32, ddof: i32) -> f64 {
    libm::sqrt(unsafe { variance(data_ptr, length, ddof) })
}

/// Sum of array.
#[no_mangle]
pub unsafe extern "C" fn sum(data_ptr: *const f64, length: i32) -> f64 {
    let mut total = 0.0_f64;
    for i in 0..length as usize {
        total += *data_ptr.add(i);
    }
    total
}

/// Product of array.
#[no_mangle]
pub unsafe extern "C" fn prod(data_ptr: *const f64, length: i32) -> f64 {
    let mut product = 1.0_f64;
    for i in 0..length as usize {
        product *= *data_ptr.add(i);
    }
    product
}

/// Minimum value.
#[no_mangle]
pub unsafe extern "C" fn min(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut min_val = *data_ptr;
    for i in 1..length as usize {
        let v = *data_ptr.add(i);
        if v < min_val {
            min_val = v;
        }
    }
    min_val
}

/// Maximum value.
#[no_mangle]
pub unsafe extern "C" fn max(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut max_val = *data_ptr;
    for i in 1..length as usize {
        let v = *data_ptr.add(i);
        if v > max_val {
            max_val = v;
        }
    }
    max_val
}

/// Cumulative sum (in-place).
#[no_mangle]
pub unsafe extern "C" fn cumsum(data_ptr: *mut f64, length: i32) {
    for i in 1..length as usize {
        *data_ptr.add(i) += *data_ptr.add(i - 1);
    }
}

// Internal quicksort for raw f64 arrays
unsafe fn quicksort_raw(data_ptr: *mut f64, left: isize, right: isize) {
    if left >= right {
        return;
    }
    let pivot_index = partition_raw(data_ptr, left, right);
    quicksort_raw(data_ptr, left, pivot_index - 1);
    quicksort_raw(data_ptr, pivot_index + 1, right);
}

unsafe fn partition_raw(data_ptr: *mut f64, left: isize, right: isize) -> isize {
    let pivot = *data_ptr.offset(right);
    let mut i = left - 1;
    for j in left..right {
        if *data_ptr.offset(j) <= pivot {
            i += 1;
            let tmp = *data_ptr.offset(i);
            *data_ptr.offset(i) = *data_ptr.offset(j);
            *data_ptr.offset(j) = tmp;
        }
    }
    let tmp = *data_ptr.offset(i + 1);
    *data_ptr.offset(i + 1) = *data_ptr.offset(right);
    *data_ptr.offset(right) = tmp;
    i + 1
}

/// Median Absolute Deviation.
#[no_mangle]
pub unsafe extern "C" fn mad(data_ptr: *const f64, length: i32, work_ptr: *mut f64) -> f64 {
    if length == 0 {
        return 0.0;
    }
    let n = length as usize;
    // Copy to work, sort, find median
    for i in 0..n {
        *work_ptr.add(i) = *data_ptr.add(i);
    }
    quicksort_raw(work_ptr, 0, (n - 1) as isize);
    let med = median(work_ptr, length);

    // Compute absolute deviations
    for i in 0..n {
        *work_ptr.add(i) = libm::fabs(*data_ptr.add(i) - med);
    }
    quicksort_raw(work_ptr, 0, (n - 1) as isize);
    median(work_ptr, length)
}

/// Quantile of a sorted array.
#[no_mangle]
pub unsafe extern "C" fn quantile(data_ptr: *const f64, length: i32, p: f64) -> f64 {
    if length == 0 || p < 0.0 || p > 1.0 {
        return f64::NAN;
    }
    let index = p * (length - 1) as f64;
    let lower = libm::floor(index) as usize;
    let upper = libm::ceil(index) as usize;
    if lower == upper {
        return *data_ptr.add(lower);
    }
    let frac = index - lower as f64;
    *data_ptr.add(lower) * (1.0 - frac) + *data_ptr.add(upper) * frac
}

/// Covariance between two arrays.
#[no_mangle]
pub unsafe extern "C" fn covariance(
    x_ptr: *const f64,
    y_ptr: *const f64,
    length: i32,
    ddof: i32,
) -> f64 {
    if length == 0 || length <= ddof {
        return f64::NAN;
    }
    let mean_x = mean(x_ptr, length);
    let mean_y = mean(y_ptr, length);
    let mut sum_prod = 0.0_f64;
    for i in 0..length as usize {
        sum_prod += (*x_ptr.add(i) - mean_x) * (*y_ptr.add(i) - mean_y);
    }
    sum_prod / (length - ddof) as f64
}

/// Pearson correlation coefficient.
#[no_mangle]
pub unsafe extern "C" fn correlation(x_ptr: *const f64, y_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mean_x = mean(x_ptr, length);
    let mean_y = mean(y_ptr, length);
    let mut sum_xy = 0.0_f64;
    let mut sum_x2 = 0.0_f64;
    let mut sum_y2 = 0.0_f64;
    for i in 0..length as usize {
        let dx = *x_ptr.add(i) - mean_x;
        let dy = *y_ptr.add(i) - mean_y;
        sum_xy += dx * dy;
        sum_x2 += dx * dx;
        sum_y2 += dy * dy;
    }
    let denom = libm::sqrt(sum_x2 * sum_y2);
    if denom == 0.0 {
        return f64::NAN;
    }
    sum_xy / denom
}

/// Range: max - min.
#[export_name = "range"]
pub unsafe extern "C" fn stats_range(data_ptr: *const f64, length: i32) -> f64 {
    max(data_ptr, length) - min(data_ptr, length)
}

/// Geometric mean.
#[no_mangle]
pub unsafe extern "C" fn geometricMean(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut log_sum = 0.0_f64;
    for i in 0..length as usize {
        let v = *data_ptr.add(i);
        if v <= 0.0 {
            return f64::NAN;
        }
        log_sum += libm::log(v);
    }
    libm::exp(log_sum / length as f64)
}

/// Harmonic mean.
#[no_mangle]
pub unsafe extern "C" fn harmonicMean(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut recip_sum = 0.0_f64;
    for i in 0..length as usize {
        let v = *data_ptr.add(i);
        if v == 0.0 {
            return 0.0;
        }
        recip_sum += 1.0 / v;
    }
    length as f64 / recip_sum
}

/// Skewness (sample).
#[no_mangle]
pub unsafe extern "C" fn skewness(data_ptr: *const f64, length: i32) -> f64 {
    if length < 3 {
        return f64::NAN;
    }
    let m = mean(data_ptr, length);
    let s = std(data_ptr, length, 1);
    if s == 0.0 {
        return f64::NAN;
    }
    let mut sum3 = 0.0_f64;
    for i in 0..length as usize {
        let d = (*data_ptr.add(i) - m) / s;
        sum3 += d * d * d;
    }
    let n = length as f64;
    (n / ((n - 1.0) * (n - 2.0))) * sum3
}

/// Excess kurtosis (sample).
#[no_mangle]
pub unsafe extern "C" fn kurtosis(data_ptr: *const f64, length: i32) -> f64 {
    if length < 4 {
        return f64::NAN;
    }
    let m = mean(data_ptr, length);
    let s = std(data_ptr, length, 1);
    if s == 0.0 {
        return f64::NAN;
    }
    let mut sum4 = 0.0_f64;
    for i in 0..length as usize {
        let d = (*data_ptr.add(i) - m) / s;
        let d2 = d * d;
        sum4 += d2 * d2;
    }
    let n = length as f64;
    let t1 = (n * (n + 1.0)) / ((n - 1.0) * (n - 2.0) * (n - 3.0));
    let t2 = (3.0 * (n - 1.0) * (n - 1.0)) / ((n - 2.0) * (n - 3.0));
    t1 * sum4 - t2
}

/// Interquartile range (sorts data in-place).
#[no_mangle]
pub unsafe extern "C" fn interquartileRange(data_ptr: *mut f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    quicksort_raw(data_ptr, 0, (length - 1) as isize);
    let q1 = quantile(data_ptr, length, 0.25);
    let q3 = quantile(data_ptr, length, 0.75);
    q3 - q1
}

/// Z-scores: (x - mean) / std.
#[no_mangle]
pub unsafe extern "C" fn zscore(data_ptr: *const f64, result_ptr: *mut f64, length: i32) {
    if length == 0 {
        return;
    }
    let m = mean(data_ptr, length);
    let s = std(data_ptr, length, 1);
    if s == 0.0 {
        for i in 0..length as usize {
            *result_ptr.add(i) = 0.0;
        }
        return;
    }
    for i in 0..length as usize {
        *result_ptr.add(i) = (*data_ptr.add(i) - m) / s;
    }
}

/// Percentile (0-100 scale).
#[no_mangle]
pub unsafe extern "C" fn percentile(data_ptr: *const f64, length: i32, p: f64) -> f64 {
    quantile(data_ptr, length, p / 100.0)
}

/// Median of unsorted data (sorts work buffer).
#[no_mangle]
pub unsafe extern "C" fn medianUnsorted(data_ptr: *mut f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    quicksort_raw(data_ptr, 0, (length - 1) as isize);
    median(data_ptr, length)
}

/// Root mean square.
#[no_mangle]
pub unsafe extern "C" fn rms(data_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut sum_sq = 0.0_f64;
    for i in 0..length as usize {
        let v = *data_ptr.add(i);
        sum_sq += v * v;
    }
    libm::sqrt(sum_sq / length as f64)
}

/// Coefficient of variation: std / |mean|.
#[no_mangle]
pub unsafe extern "C" fn coefficientOfVariation(data_ptr: *const f64, length: i32) -> f64 {
    let m = mean(data_ptr, length);
    if m == 0.0 {
        return f64::NAN;
    }
    std(data_ptr, length, 1) / libm::fabs(m)
}
