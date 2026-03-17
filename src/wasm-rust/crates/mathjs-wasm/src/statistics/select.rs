//! Selection algorithms: QuickSelect and related.

unsafe fn partition(arr_ptr: *mut f64, left: i32, right: i32) -> i32 {
    let pivot = *arr_ptr.add(right as usize);
    let mut i = left;
    for j in left..right {
        if *arr_ptr.add(j as usize) <= pivot {
            let tmp = *arr_ptr.add(i as usize);
            *arr_ptr.add(i as usize) = *arr_ptr.add(j as usize);
            *arr_ptr.add(j as usize) = tmp;
            i += 1;
        }
    }
    let tmp = *arr_ptr.add(i as usize);
    *arr_ptr.add(i as usize) = *arr_ptr.add(right as usize);
    *arr_ptr.add(right as usize) = tmp;
    i
}

/// QuickSelect: find k-th smallest element (0-based).
#[no_mangle]
pub unsafe extern "C" fn partitionSelect(
    data_ptr: *const f64,
    n: i32,
    k: i32,
    work_ptr: *mut f64,
) -> f64 {
    if n == 0 || k < 0 || k >= n {
        return f64::NAN;
    }
    for i in 0..n as usize {
        *work_ptr.add(i) = *data_ptr.add(i);
    }
    let mut left = 0_i32;
    let mut right = n - 1;
    while left < right {
        let pi = partition(work_ptr, left, right);
        if pi == k {
            return *work_ptr.add(k as usize);
        } else if pi < k {
            left = pi + 1;
        } else {
            right = pi - 1;
        }
    }
    *work_ptr.add(k as usize)
}

/// Select median (lower median for even n).
#[no_mangle]
pub unsafe extern "C" fn selectMedian(data_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    let k = n / 2;
    partitionSelect(data_ptr, n, k, work_ptr)
}

/// Select minimum.
#[no_mangle]
pub unsafe extern "C" fn selectMin(data_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    partitionSelect(data_ptr, n, 0, work_ptr)
}

/// Select maximum.
#[no_mangle]
pub unsafe extern "C" fn selectMax(data_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    partitionSelect(data_ptr, n, n - 1, work_ptr)
}

/// Select k smallest elements (unsorted).
#[no_mangle]
pub unsafe extern "C" fn selectKSmallest(
    data_ptr: *const f64,
    n: i32,
    k: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    if k <= 0 || n == 0 {
        return 0;
    }
    if k >= n {
        for i in 0..n as usize {
            *result_ptr.add(i) = *data_ptr.add(i);
        }
        return n;
    }
    for i in 0..n as usize {
        *work_ptr.add(i) = *data_ptr.add(i);
    }
    let target = k - 1;
    let mut left = 0_i32;
    let mut right = n - 1;
    while left < right {
        let pi = partition(work_ptr, left, right);
        if pi == target {
            break;
        } else if pi < target {
            left = pi + 1;
        } else {
            right = pi - 1;
        }
    }
    for i in 0..k as usize {
        *result_ptr.add(i) = *work_ptr.add(i);
    }
    k
}

/// Select k largest elements (unsorted).
#[no_mangle]
pub unsafe extern "C" fn selectKLargest(
    data_ptr: *const f64,
    n: i32,
    k: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    if k <= 0 || n == 0 {
        return 0;
    }
    if k >= n {
        for i in 0..n as usize {
            *result_ptr.add(i) = *data_ptr.add(i);
        }
        return n;
    }
    for i in 0..n as usize {
        *work_ptr.add(i) = *data_ptr.add(i);
    }
    let target = n - k;
    let mut left = 0_i32;
    let mut right = n - 1;
    while left < right {
        let pi = partition(work_ptr, left, right);
        if pi == target {
            break;
        } else if pi < target {
            left = pi + 1;
        } else {
            right = pi - 1;
        }
    }
    for i in 0..k as usize {
        *result_ptr.add(i) = *work_ptr.add((target as usize) + i);
    }
    k
}

/// Select quantile value.
#[no_mangle]
pub unsafe extern "C" fn selectQuantile(
    data_ptr: *const f64,
    n: i32,
    q: f64,
    work_ptr: *mut f64,
) -> f64 {
    if n == 0 || q < 0.0 || q > 1.0 {
        return f64::NAN;
    }
    let k = libm::floor(q * (n - 1) as f64) as i32;
    partitionSelect(data_ptr, n, k, work_ptr)
}

/// Find index of k-th smallest element.
#[no_mangle]
pub unsafe extern "C" fn partitionSelectIndex(
    data_ptr: *const f64,
    n: i32,
    k: i32,
    indices_ptr: *mut i32,
) -> i32 {
    if n == 0 || k < 0 || k >= n {
        return -1;
    }
    for i in 0..n {
        *indices_ptr.add(i as usize) = i;
    }
    let mut left = 0_i32;
    let mut right = n - 1;
    while left < right {
        let pivot_idx = *indices_ptr.add(right as usize);
        let pivot = *data_ptr.add(pivot_idx as usize);
        let mut i = left;
        for j in left..right {
            let j_idx = *indices_ptr.add(j as usize);
            if *data_ptr.add(j_idx as usize) <= pivot {
                let tmp = *indices_ptr.add(i as usize);
                *indices_ptr.add(i as usize) = *indices_ptr.add(j as usize);
                *indices_ptr.add(j as usize) = tmp;
                i += 1;
            }
        }
        let tmp = *indices_ptr.add(i as usize);
        *indices_ptr.add(i as usize) = *indices_ptr.add(right as usize);
        *indices_ptr.add(right as usize) = tmp;

        if i == k {
            return *indices_ptr.add(k as usize);
        } else if i < k {
            left = i + 1;
        } else {
            right = i - 1;
        }
    }
    *indices_ptr.add(k as usize)
}
