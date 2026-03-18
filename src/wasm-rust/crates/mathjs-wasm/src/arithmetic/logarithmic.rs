//! Logarithmic and exponential operations (ported from src/wasm/arithmetic/logarithmic.ts)

use libm;

#[export_name = "exp"]
pub unsafe extern "C" fn wasm_exp(x: f64) -> f64 {
    libm::exp(x)
}

#[no_mangle]
pub unsafe extern "C" fn expm1(x: f64) -> f64 {
    libm::expm1(x)
}

#[export_name = "log"]
pub unsafe extern "C" fn wasm_log(x: f64) -> f64 {
    libm::log(x)
}

#[no_mangle]
pub unsafe extern "C" fn log10(x: f64) -> f64 {
    libm::log10(x)
}

#[no_mangle]
pub unsafe extern "C" fn log2(x: f64) -> f64 {
    libm::log2(x)
}

#[no_mangle]
pub unsafe extern "C" fn log1p(x: f64) -> f64 {
    libm::log1p(x)
}

#[no_mangle]
pub unsafe extern "C" fn logBase(x: f64, base: f64) -> f64 {
    libm::log(x) / libm::log(base)
}

#[no_mangle]
pub unsafe extern "C" fn sqrt(x: f64) -> f64 {
    libm::sqrt(x)
}

#[no_mangle]
pub unsafe extern "C" fn pow(x: f64, y: f64) -> f64 {
    libm::pow(x, y)
}

// ============================================================================
// Vectorized operations
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn expArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::exp(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn logArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::log(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn log10Array(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::log10(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn log2Array(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::log2(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn sqrtArray(input_ptr: *const f64, output_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::sqrt(*input_ptr.add(i));
    }
}

#[no_mangle]
pub unsafe extern "C" fn powConstantArray(
    input_ptr: *const f64,
    exponent: f64,
    output_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *output_ptr.add(i) = libm::pow(*input_ptr.add(i), exponent);
    }
}
