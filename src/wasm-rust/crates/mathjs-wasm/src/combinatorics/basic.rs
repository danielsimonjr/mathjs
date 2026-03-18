//! Combinatorics operations (ported from src/wasm/combinatorics/basic.ts)

#[no_mangle]
pub unsafe extern "C" fn factorial(n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    const TABLE: [f64; 21] = [
        1.0,
        1.0,
        2.0,
        6.0,
        24.0,
        120.0,
        720.0,
        5040.0,
        40320.0,
        362880.0,
        3628800.0,
        39916800.0,
        479001600.0,
        6227020800.0,
        87178291200.0,
        1307674368000.0,
        20922789888000.0,
        355687428096000.0,
        6402373705728000.0,
        121645100408832000.0,
        2432902008176640000.0,
    ];
    if n <= 20 {
        return TABLE[n as usize];
    }
    let mut result = TABLE[20];
    for i in 21..=n {
        result *= i as f64;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn combinations(n: i32, k: i32) -> f64 {
    if k < 0 || k > n {
        return 0.0;
    }
    if k == 0 || k == n {
        return 1.0;
    }
    let mut k = k;
    if k > n - k {
        k = n - k;
    }
    let mut result = 1.0;
    for i in 0..k {
        result *= (n - i) as f64;
        result /= (i + 1) as f64;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn combinationsWithRep(n: i32, k: i32) -> f64 {
    combinations(n + k - 1, k)
}

#[no_mangle]
pub unsafe extern "C" fn permutations(n: i32, k: i32) -> f64 {
    if k < 0 || k > n {
        return 0.0;
    }
    if k == 0 {
        return 1.0;
    }
    let mut result = 1.0;
    for i in 0..k {
        result *= (n - i) as f64;
    }
    result
}

/// # Safety
/// `work_ptr` must point to at least `(n+1) * (k+1)` f64 values (8 bytes each).
#[no_mangle]
pub unsafe extern "C" fn stirlingS2(n: i32, k: i32, work_ptr: *mut f64) -> f64 {
    if n < 0 || k < 0 {
        return 0.0;
    }
    if n == 0 && k == 0 {
        return 1.0;
    }
    if n == 0 || k == 0 {
        return 0.0;
    }
    if k > n {
        return 0.0;
    }
    if k == 1 || k == n {
        return 1.0;
    }
    let kp1 = (k + 1) as usize;
    for i in 0..=(n as usize) {
        for j in 0..=(k as usize) {
            *work_ptr.add(i * kp1 + j) = 0.0;
        }
    }
    *work_ptr = 1.0;
    for i in 1..=(n as usize) {
        let upper = if i < k as usize { i } else { k as usize };
        for j in 1..=upper {
            if j == 1 || j == i {
                *work_ptr.add(i * kp1 + j) = 1.0;
            } else {
                let val1 = *work_ptr.add((i - 1) * kp1 + j);
                let val2 = *work_ptr.add((i - 1) * kp1 + (j - 1));
                *work_ptr.add(i * kp1 + j) = j as f64 * val1 + val2;
            }
        }
    }
    *work_ptr.add(n as usize * kp1 + k as usize)
}

#[no_mangle]
pub unsafe extern "C" fn bellNumbers(n: i32, work_ptr: *mut f64) -> f64 {
    if n < 0 {
        return 0.0;
    }
    if n == 0 {
        return 1.0;
    }
    let mut sum = 0.0;
    for k in 0..=n {
        sum += stirlingS2(n, k, work_ptr);
    }
    sum
}

#[no_mangle]
pub unsafe extern "C" fn catalan(n: i32) -> f64 {
    if n < 0 {
        return 0.0;
    }
    if n == 0 {
        return 1.0;
    }
    combinations(2 * n, n) / (n + 1) as f64
}

#[no_mangle]
pub unsafe extern "C" fn composition(n: i32, k: i32) -> f64 {
    if k < 0 || n < k {
        return 0.0;
    }
    if k == 0 {
        return if n == 0 { 1.0 } else { 0.0 };
    }
    combinations(n - 1, k - 1)
}

#[no_mangle]
pub unsafe extern "C" fn multinomial(n: i32, k_ptr: *const i32, m: i32) -> f64 {
    let mut result = 1.0;
    let mut sum = 0;
    for i in 0..m as usize {
        let ki = *k_ptr.add(i);
        result *= combinations(n - sum, ki);
        sum += ki;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn factorialArray(input_ptr: *const i32, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = factorial(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn combinationsArray(
    n_ptr: *const i32,
    k_ptr: *const i32,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = combinations(*n_ptr.add(i), *k_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn permutationsArray(
    n_ptr: *const i32,
    k_ptr: *const i32,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = permutations(*n_ptr.add(i), *k_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn doubleFactorial(n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n <= 1 {
        return 1.0;
    }
    let mut result = 1.0;
    let mut i = n;
    while i > 1 {
        result *= i as f64;
        i -= 2;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn subfactorial(n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n == 0 {
        return 1.0;
    }
    if n == 1 {
        return 0.0;
    }
    let mut prev2 = 1.0;
    let mut prev1 = 0.0;
    for i in 2..=n {
        let curr = (i - 1) as f64 * (prev1 + prev2);
        prev2 = prev1;
        prev1 = curr;
    }
    prev1
}

#[no_mangle]
pub unsafe extern "C" fn fallingFactorial(x: f64, n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n == 0 {
        return 1.0;
    }
    let mut result = 1.0;
    for i in 0..n {
        result *= x - i as f64;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn risingFactorial(x: f64, n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n == 0 {
        return 1.0;
    }
    let mut result = 1.0;
    for i in 0..n {
        result *= x + i as f64;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn fibonacci(n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n <= 1 {
        return n as f64;
    }
    let mut prev2 = 0.0;
    let mut prev1 = 1.0;
    for _ in 2..=n {
        let curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    prev1
}

#[no_mangle]
pub unsafe extern "C" fn lucas(n: i32) -> f64 {
    if n < 0 {
        return f64::NAN;
    }
    if n == 0 {
        return 2.0;
    }
    if n == 1 {
        return 1.0;
    }
    let mut prev2 = 2.0;
    let mut prev1 = 1.0;
    for _ in 2..=n {
        let curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    prev1
}
