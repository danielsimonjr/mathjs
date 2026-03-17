//! Advanced arithmetic operations (ported from src/wasm/arithmetic/advanced.ts)

use libm;

#[no_mangle]
pub unsafe extern "C" fn gcd(a: i64, b: i64) -> i64 {
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
pub unsafe extern "C" fn lcm(a: i64, b: i64) -> i64 {
    if a == 0 || b == 0 {
        return 0;
    }
    let g = gcd(a, b);
    (a / g) * b
}

#[no_mangle]
pub unsafe extern "C" fn xgcd(a: i64, b: i64, result_ptr: *mut i64) {
    let mut old_r = a;
    let mut r = b;
    let mut old_s: i64 = 1;
    let mut s: i64 = 0;
    let mut old_t: i64 = 0;
    let mut t: i64 = 1;

    while r != 0 {
        let quotient = old_r / r;

        let temp = r;
        r = old_r - quotient * r;
        old_r = temp;

        let temp = s;
        s = old_s - quotient * s;
        old_s = temp;

        let temp = t;
        t = old_t - quotient * t;
        old_t = temp;
    }

    *result_ptr = old_r;
    *result_ptr.add(1) = old_s;
    *result_ptr.add(2) = old_t;
}

#[no_mangle]
pub unsafe extern "C" fn invmod(a: i64, m: i64, work_ptr: *mut i64) -> i64 {
    xgcd(a, m, work_ptr);
    let gcd_val = *work_ptr;
    let x = *work_ptr.add(1);
    if gcd_val != 1 {
        return 0;
    }
    ((x % m) + m) % m
}

#[no_mangle]
pub unsafe extern "C" fn hypot2(x: f64, y: f64) -> f64 {
    libm::hypot(x, y)
}

#[no_mangle]
pub unsafe extern "C" fn hypot3(x: f64, y: f64, z: f64) -> f64 {
    libm::sqrt(x * x + y * y + z * z)
}

#[no_mangle]
pub unsafe extern "C" fn hypotArray(values_ptr: *const f64, length: i32) -> f64 {
    let mut sum = 0.0;
    for i in 0..length as usize {
        let val = *values_ptr.add(i);
        sum += val * val;
    }
    libm::sqrt(sum)
}

#[no_mangle]
pub unsafe extern "C" fn norm1(values_ptr: *const f64, length: i32) -> f64 {
    let mut sum = 0.0;
    for i in 0..length as usize {
        sum += libm::fabs(*values_ptr.add(i));
    }
    sum
}

#[no_mangle]
pub unsafe extern "C" fn norm2(values_ptr: *const f64, length: i32) -> f64 {
    hypotArray(values_ptr, length)
}

#[no_mangle]
pub unsafe extern "C" fn normInf(values_ptr: *const f64, length: i32) -> f64 {
    let mut max = 0.0_f64;
    for i in 0..length as usize {
        let abs_val = libm::fabs(*values_ptr.add(i));
        if abs_val > max {
            max = abs_val;
        }
    }
    max
}

#[no_mangle]
pub unsafe extern "C" fn normP(values_ptr: *const f64, p: f64, length: i32) -> f64 {
    if p == 1.0 {
        return norm1(values_ptr, length);
    }
    if p == 2.0 {
        return norm2(values_ptr, length);
    }
    if p == f64::INFINITY {
        return normInf(values_ptr, length);
    }
    let mut sum = 0.0;
    for i in 0..length as usize {
        let abs_val = libm::fabs(*values_ptr.add(i));
        sum += libm::pow(abs_val, p);
    }
    libm::pow(sum, 1.0 / p)
}

#[no_mangle]
#[export_name = "mod"]
pub unsafe extern "C" fn wasm_mod(x: f64, y: f64) -> f64 {
    let result = x % y;
    if result < 0.0 {
        result + y
    } else {
        result
    }
}

#[no_mangle]
pub unsafe extern "C" fn modArray(
    input_ptr: *const f64,
    divisor: f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        let x = *input_ptr.add(i);
        let result = x % divisor;
        *output_ptr.add(i) = if result < 0.0 {
            result + divisor
        } else {
            result
        };
    }
}

#[no_mangle]
pub unsafe extern "C" fn gcdArray(
    input_a_ptr: *const i64,
    input_b_ptr: *const i64,
    output_ptr: *mut i64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = gcd(*input_a_ptr.add(i), *input_b_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn lcmArray(
    input_a_ptr: *const i64,
    input_b_ptr: *const i64,
    output_ptr: *mut i64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = lcm(*input_a_ptr.add(i), *input_b_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn nthRootsOfUnity(n: i32, output_ptr: *mut f64) {
    let two_pi_over_n = (2.0 * core::f64::consts::PI) / n as f64;
    for k in 0..n as usize {
        let angle = two_pi_over_n * k as f64;
        *output_ptr.add(k * 2) = libm::cos(angle);
        *output_ptr.add(k * 2 + 1) = libm::sin(angle);
    }
}

#[no_mangle]
pub unsafe extern "C" fn nthRootsReal(x: f64, n: i32, output_ptr: *mut f64) {
    if n <= 0 {
        for i in 0..(n * 2) as usize {
            *output_ptr.add(i) = f64::NAN;
        }
        return;
    }
    if x == 0.0 {
        for i in 0..(n * 2) as usize {
            *output_ptr.add(i) = 0.0;
        }
        return;
    }
    let abs_x = libm::fabs(x);
    let r = libm::pow(abs_x, 1.0 / n as f64);
    let theta = if x < 0.0 { core::f64::consts::PI } else { 0.0 };
    let two_pi_over_n = (2.0 * core::f64::consts::PI) / n as f64;
    for k in 0..n as usize {
        let angle = (theta + two_pi_over_n * k as f64) / n as f64;
        *output_ptr.add(k * 2) = r * libm::cos(angle);
        *output_ptr.add(k * 2 + 1) = r * libm::sin(angle);
    }
}

#[no_mangle]
pub unsafe extern "C" fn nthRootsComplex(re: f64, im: f64, n: i32, output_ptr: *mut f64) {
    if n <= 0 {
        for i in 0..(n * 2) as usize {
            *output_ptr.add(i) = f64::NAN;
        }
        return;
    }
    if re == 0.0 && im == 0.0 {
        for i in 0..(n * 2) as usize {
            *output_ptr.add(i) = 0.0;
        }
        return;
    }
    let r = libm::sqrt(re * re + im * im);
    let theta = libm::atan2(im, re);
    let root_r = libm::pow(r, 1.0 / n as f64);
    let two_pi_over_n = (2.0 * core::f64::consts::PI) / n as f64;
    for k in 0..n as usize {
        let angle = (theta + two_pi_over_n * k as f64) / n as f64;
        *output_ptr.add(k * 2) = root_r * libm::cos(angle);
        *output_ptr.add(k * 2 + 1) = root_r * libm::sin(angle);
    }
}

#[no_mangle]
pub unsafe extern "C" fn nthRoot(x: f64, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    if x == 0.0 {
        return 0.0;
    }
    if x > 0.0 {
        libm::pow(x, 1.0 / n as f64)
    } else if n % 2 == 1 {
        -libm::pow(-x, 1.0 / n as f64)
    } else {
        f64::NAN
    }
}

#[no_mangle]
pub unsafe extern "C" fn nthRootSigned(x: f64, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    if x == 0.0 {
        return 0.0;
    }
    let abs_root = libm::pow(libm::fabs(x), 1.0 / n as f64);
    if x < 0.0 && n % 2 == 1 {
        -abs_root
    } else {
        abs_root
    }
}

// F64 alternatives for JS interop
#[no_mangle]
pub unsafe extern "C" fn gcdF64(a: f64, b: f64) -> f64 {
    let mut a = libm::fabs(libm::floor(a));
    let mut b = libm::fabs(libm::floor(b));
    if a == 0.0 {
        return b;
    }
    if b == 0.0 {
        return a;
    }
    while b != 0.0 {
        let temp = b;
        b = a % b;
        a = temp;
    }
    a
}

#[no_mangle]
pub unsafe extern "C" fn lcmF64(a: f64, b: f64) -> f64 {
    let a = libm::fabs(libm::floor(a));
    let b = libm::fabs(libm::floor(b));
    if a == 0.0 || b == 0.0 {
        return 0.0;
    }
    let g = gcdF64(a, b);
    (a / g) * b
}

#[no_mangle]
pub unsafe extern "C" fn xgcdF64(a: f64, b: f64, result_ptr: *mut f64) {
    let a = libm::floor(a);
    let b = libm::floor(b);
    let mut old_r = a;
    let mut r = b;
    let mut old_s = 1.0;
    let mut s = 0.0;
    let mut old_t = 0.0;
    let mut t = 1.0;

    while r != 0.0 {
        let quotient = libm::floor(old_r / r);
        let temp = r;
        r = old_r - quotient * r;
        old_r = temp;
        let temp = s;
        s = old_s - quotient * s;
        old_s = temp;
        let temp = t;
        t = old_t - quotient * t;
        old_t = temp;
    }

    *result_ptr = old_r;
    *result_ptr.add(1) = old_s;
    *result_ptr.add(2) = old_t;
}

#[no_mangle]
pub unsafe extern "C" fn invmodF64(a: f64, m: f64, work_ptr: *mut f64) -> f64 {
    xgcdF64(a, m, work_ptr);
    let gcd_val = *work_ptr;
    let x = *work_ptr.add(1);
    if libm::fabs(gcd_val - 1.0) > 0.5 {
        return 0.0;
    }
    ((x % m) + m) % m
}
