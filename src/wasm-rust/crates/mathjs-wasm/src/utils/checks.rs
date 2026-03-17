//! Utility check functions (ported from src/wasm/utils/checks.ts)

use libm;

#[no_mangle]
#[export_name = "checks_isNaN"]
pub unsafe extern "C" fn checks_is_nan(x: f64) -> i32 {
    if x != x {
        1
    } else {
        0
    }
}

#[no_mangle]
#[export_name = "checks_isFinite"]
pub unsafe extern "C" fn checks_is_finite(x: f64) -> i32 {
    if x != x {
        return 0;
    }
    if x == f64::INFINITY || x == f64::NEG_INFINITY {
        return 0;
    }
    1
}

#[no_mangle]
#[export_name = "checks_isInteger"]
pub unsafe extern "C" fn checks_is_integer(x: f64) -> i32 {
    if x != x {
        return 0;
    }
    if libm::floor(x) == x {
        1
    } else {
        0
    }
}

#[no_mangle]
#[export_name = "checks_isPositive"]
pub unsafe extern "C" fn checks_is_positive(x: f64) -> i32 {
    if x > 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
#[export_name = "checks_isNegative"]
pub unsafe extern "C" fn checks_is_negative(x: f64) -> i32 {
    if x < 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
#[export_name = "checks_isZero"]
pub unsafe extern "C" fn checks_is_zero(x: f64) -> i32 {
    if x == 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isNonNegative(x: f64) -> i32 {
    if x >= 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isNonPositive(x: f64) -> i32 {
    if x <= 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isPrime(n: i64) -> i32 {
    if n < 2 {
        return 0;
    }
    if n == 2 {
        return 1;
    }
    if n % 2 == 0 {
        return 0;
    }
    if n == 3 {
        return 1;
    }
    if n % 3 == 0 {
        return 0;
    }
    let mut i: i64 = 5;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 {
            return 0;
        }
        i += 6;
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn isPrimeF64(x: f64) -> i32 {
    if x != x || x < 2.0 {
        return 0;
    }
    if libm::floor(x) != x {
        return 0;
    }
    isPrime(x as i64)
}

#[no_mangle]
pub unsafe extern "C" fn isEven(x: f64) -> i32 {
    if libm::floor(x) != x {
        return 0;
    }
    if (x as i64) % 2 == 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isOdd(x: f64) -> i32 {
    if libm::floor(x) != x {
        return 0;
    }
    if (x as i64) % 2 != 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isBounded(x: f64, min: f64, max: f64) -> i32 {
    if x >= min && x <= max {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isPerfectSquare(n: i64) -> i32 {
    if n < 0 {
        return 0;
    }
    if n == 0 {
        return 1;
    }
    let root = libm::sqrt(n as f64) as i64;
    if root * root == n {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isPowerOfTwo(n: i64) -> i32 {
    if n <= 0 {
        return 0;
    }
    if (n & (n - 1)) == 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn countCondition(arr_ptr: *const f64, length: i32, condition: i32) -> i32 {
    let mut count = 0;
    for i in 0..length as usize {
        let x = *arr_ptr.add(i);
        let m = match condition {
            0 => {
                if x == 0.0 {
                    1
                } else {
                    0
                }
            }
            1 => {
                if x > 0.0 {
                    1
                } else {
                    0
                }
            }
            2 => {
                if x < 0.0 {
                    1
                } else {
                    0
                }
            }
            3 => {
                if x != x {
                    1
                } else {
                    0
                }
            }
            4 => {
                if x == x && x != f64::INFINITY && x != f64::NEG_INFINITY {
                    1
                } else {
                    0
                }
            }
            _ => 0,
        };
        count += m;
    }
    count
}

#[no_mangle]
pub unsafe extern "C" fn allFinite(arr_ptr: *const f64, length: i32) -> i32 {
    for i in 0..length as usize {
        let x = *arr_ptr.add(i);
        if x != x || x == f64::INFINITY || x == f64::NEG_INFINITY {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn anyNaN(arr_ptr: *const f64, length: i32) -> i32 {
    for i in 0..length as usize {
        if *arr_ptr.add(i) != *arr_ptr.add(i) {
            return 1;
        }
    }
    0
}

#[no_mangle]
pub unsafe extern "C" fn allPositive(arr_ptr: *const f64, length: i32) -> i32 {
    for i in 0..length as usize {
        if *arr_ptr.add(i) <= 0.0 {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn allNonNegative(arr_ptr: *const f64, length: i32) -> i32 {
    for i in 0..length as usize {
        if *arr_ptr.add(i) < 0.0 {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn allIntegers(arr_ptr: *const f64, length: i32) -> i32 {
    for i in 0..length as usize {
        let x = *arr_ptr.add(i);
        if x != x || libm::floor(x) != x {
            return 0;
        }
    }
    1
}

#[no_mangle]
#[export_name = "checks_findFirst"]
pub unsafe extern "C" fn checks_find_first(
    arr_ptr: *const f64,
    length: i32,
    condition: i32,
) -> i32 {
    for i in 0..length as usize {
        let x = *arr_ptr.add(i);
        let m = match condition {
            0 => x == 0.0,
            1 => x > 0.0,
            2 => x < 0.0,
            3 => x != x,
            _ => false,
        };
        if m {
            return i as i32;
        }
    }
    -1
}

#[no_mangle]
#[export_name = "checks_sign"]
pub unsafe extern "C" fn checks_sign(x: f64) -> f64 {
    if x != x {
        return f64::NAN;
    }
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        0.0
    }
}

#[no_mangle]
#[export_name = "checks_signArray"]
pub unsafe extern "C" fn checks_sign_array(arr_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        let x = *arr_ptr.add(i);
        *output_ptr.add(i) = if x != x {
            f64::NAN
        } else if x > 0.0 {
            1.0
        } else if x < 0.0 {
            -1.0
        } else {
            0.0
        };
    }
}

#[no_mangle]
pub unsafe extern "C" fn countPrimesUpTo(n: i32, work_ptr: *mut u8) -> i32 {
    if n < 2 {
        return 0;
    }
    for i in 0..=n as usize {
        *work_ptr.add(i) = if i >= 2 { 1 } else { 0 };
    }
    let mut i = 2;
    while i * i <= n as usize {
        if *work_ptr.add(i) == 1 {
            let mut j = i * i;
            while j <= n as usize {
                *work_ptr.add(j) = 0;
                j += i;
            }
        }
        i += 1;
    }
    let mut count = 0;
    for i in 2..=n as usize {
        count += *work_ptr.add(i) as i32;
    }
    count
}

#[no_mangle]
pub unsafe extern "C" fn nthPrime(n: i32) -> i64 {
    if n < 1 {
        return 0;
    }
    let mut count = 0;
    let mut candidate: i64 = 1;
    while count < n {
        candidate += 1;
        if isPrime(candidate) == 1 {
            count += 1;
        }
    }
    candidate
}

#[no_mangle]
#[export_name = "checks_gcd"]
pub unsafe extern "C" fn checks_gcd(a: i64, b: i64) -> i64 {
    let mut a = if a < 0 { -a } else { a };
    let mut b = if b < 0 { -b } else { b };
    while b != 0 {
        let temp = b;
        b = a % b;
        a = temp;
    }
    a
}

#[no_mangle]
#[export_name = "checks_lcm"]
pub unsafe extern "C" fn checks_lcm(a: i64, b: i64) -> i64 {
    if a == 0 || b == 0 {
        return 0;
    }
    let a = if a < 0 { -a } else { a };
    let b = if b < 0 { -b } else { b };
    (a / checks_gcd(a, b)) * b
}

#[no_mangle]
pub unsafe extern "C" fn areCoprime(a: i64, b: i64) -> i32 {
    if checks_gcd(a, b) == 1 {
        1
    } else {
        0
    }
}
