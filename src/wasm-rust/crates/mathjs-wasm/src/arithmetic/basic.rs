//! Basic arithmetic operations (ported from src/wasm/arithmetic/basic.ts)

use libm;

#[no_mangle]
pub unsafe extern "C" fn unaryMinus(x: f64) -> f64 {
    -x
}

#[no_mangle]
pub unsafe extern "C" fn unaryPlus(x: f64) -> f64 {
    x
}

#[no_mangle]
pub unsafe extern "C" fn cbrt(x: f64) -> f64 {
    if x < 0.0 {
        -libm::pow(-x, 1.0 / 3.0)
    } else {
        libm::pow(x, 1.0 / 3.0)
    }
}

#[no_mangle]
pub unsafe extern "C" fn cube(x: f64) -> f64 {
    x * x * x
}

#[no_mangle]
pub unsafe extern "C" fn square(x: f64) -> f64 {
    x * x
}

#[no_mangle]
pub unsafe extern "C" fn fix(x: f64) -> f64 {
    if x > 0.0 {
        libm::floor(x)
    } else {
        libm::ceil(x)
    }
}

#[no_mangle]
pub unsafe extern "C" fn fixDecimals(x: f64, n: i32) -> f64 {
    let shift = libm::pow(10.0, n as f64);
    fix(x * shift) / shift
}

#[no_mangle]
pub unsafe extern "C" fn ceil(x: f64) -> f64 {
    libm::ceil(x)
}

#[no_mangle]
pub unsafe extern "C" fn ceilDecimals(x: f64, n: i32) -> f64 {
    let shift = libm::pow(10.0, n as f64);
    libm::ceil(x * shift) / shift
}

#[no_mangle]
pub unsafe extern "C" fn floor(x: f64) -> f64 {
    libm::floor(x)
}

#[no_mangle]
pub unsafe extern "C" fn floorDecimals(x: f64, n: i32) -> f64 {
    let shift = libm::pow(10.0, n as f64);
    libm::floor(x * shift) / shift
}

#[no_mangle]
pub unsafe extern "C" fn round(x: f64) -> f64 {
    libm::round(x)
}

#[no_mangle]
pub unsafe extern "C" fn roundDecimals(x: f64, n: i32) -> f64 {
    let shift = libm::pow(10.0, n as f64);
    libm::round(x * shift) / shift
}

#[no_mangle]
#[export_name = "abs"]
pub unsafe extern "C" fn wasm_abs(x: f64) -> f64 {
    libm::fabs(x)
}

#[no_mangle]
pub unsafe extern "C" fn sign(x: f64) -> f64 {
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        0.0
    }
}

#[no_mangle]
pub unsafe extern "C" fn add(x: f64, y: f64) -> f64 {
    x + y
}

#[no_mangle]
pub unsafe extern "C" fn subtract(x: f64, y: f64) -> f64 {
    x - y
}

#[no_mangle]
pub unsafe extern "C" fn multiply(x: f64, y: f64) -> f64 {
    x * y
}

#[no_mangle]
pub unsafe extern "C" fn divide(x: f64, y: f64) -> f64 {
    x / y
}

#[no_mangle]
pub unsafe extern "C" fn addInt(x: i32, y: i32) -> i32 {
    x.wrapping_add(y)
}

#[no_mangle]
pub unsafe extern "C" fn subtractInt(x: i32, y: i32) -> i32 {
    x.wrapping_sub(y)
}

#[no_mangle]
pub unsafe extern "C" fn multiplyInt(x: i32, y: i32) -> i32 {
    x.wrapping_mul(y)
}

#[no_mangle]
pub unsafe extern "C" fn divideInt(x: i32, y: i32) -> i32 {
    if y == 0 {
        0
    } else {
        x / y
    }
}

// ============================================================================
// Vectorized operations
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn unaryMinusArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = -*input_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn squareArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        let x = *input_ptr.add(i);
        *output_ptr.add(i) = x * x;
    }
}

#[no_mangle]
pub unsafe extern "C" fn cubeArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        let x = *input_ptr.add(i);
        *output_ptr.add(i) = x * x * x;
    }
}

#[no_mangle]
pub unsafe extern "C" fn absArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::fabs(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn signArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        let x = *input_ptr.add(i);
        *output_ptr.add(i) = if x > 0.0 {
            1.0
        } else if x < 0.0 {
            -1.0
        } else {
            0.0
        };
    }
}

#[no_mangle]
pub unsafe extern "C" fn addArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *a_ptr.add(i) + *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn subtractArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *a_ptr.add(i) - *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn multiplyArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *a_ptr.add(i) * *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn divideArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *a_ptr.add(i) / *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn addScalarArray(
    input_ptr: *const f64,
    scalar: f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *input_ptr.add(i) + scalar;
    }
}

#[no_mangle]
pub unsafe extern "C" fn multiplyScalarArray(
    input_ptr: *const f64,
    scalar: f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = *input_ptr.add(i) * scalar;
    }
}
