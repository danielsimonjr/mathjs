//! Plain number trigonometric functions (ported from src/wasm/plain/trigonometry.ts)

use libm;

// ============================================================================
// Basic Trigonometric Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn sinNumber(x: f64) -> f64 {
    libm::sin(x)
}

#[no_mangle]
pub unsafe extern "C" fn cosNumber(x: f64) -> f64 {
    libm::cos(x)
}

#[no_mangle]
pub unsafe extern "C" fn tanNumber(x: f64) -> f64 {
    libm::tan(x)
}

#[no_mangle]
pub unsafe extern "C" fn asinNumber(x: f64) -> f64 {
    libm::asin(x)
}

#[no_mangle]
pub unsafe extern "C" fn acosNumber(x: f64) -> f64 {
    libm::acos(x)
}

#[no_mangle]
pub unsafe extern "C" fn atanNumber(x: f64) -> f64 {
    libm::atan(x)
}

#[no_mangle]
pub unsafe extern "C" fn atan2Number(y: f64, x: f64) -> f64 {
    libm::atan2(y, x)
}

// ============================================================================
// Hyperbolic Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn sinhNumber(x: f64) -> f64 {
    libm::sinh(x)
}

#[no_mangle]
pub unsafe extern "C" fn coshNumber(x: f64) -> f64 {
    libm::cosh(x)
}

#[no_mangle]
pub unsafe extern "C" fn tanhNumber(x: f64) -> f64 {
    libm::tanh(x)
}

#[no_mangle]
pub unsafe extern "C" fn asinhNumber(x: f64) -> f64 {
    libm::asinh(x)
}

#[no_mangle]
pub unsafe extern "C" fn acoshNumber(x: f64) -> f64 {
    libm::acosh(x)
}

#[no_mangle]
pub unsafe extern "C" fn atanhNumber(x: f64) -> f64 {
    libm::atanh(x)
}

// ============================================================================
// Reciprocal Trigonometric Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn cotNumber(x: f64) -> f64 {
    1.0 / libm::tan(x)
}

#[no_mangle]
pub unsafe extern "C" fn secNumber(x: f64) -> f64 {
    1.0 / libm::cos(x)
}

#[no_mangle]
pub unsafe extern "C" fn cscNumber(x: f64) -> f64 {
    1.0 / libm::sin(x)
}

// ============================================================================
// Inverse Reciprocal Trigonometric Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn acotNumber(x: f64) -> f64 {
    libm::atan(1.0 / x)
}

#[no_mangle]
pub unsafe extern "C" fn asecNumber(x: f64) -> f64 {
    libm::acos(1.0 / x)
}

#[no_mangle]
pub unsafe extern "C" fn acscNumber(x: f64) -> f64 {
    libm::asin(1.0 / x)
}

// ============================================================================
// Reciprocal Hyperbolic Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn cothNumber(x: f64) -> f64 {
    let e = libm::exp(2.0 * x);
    (e + 1.0) / (e - 1.0)
}

#[no_mangle]
pub unsafe extern "C" fn sechNumber(x: f64) -> f64 {
    2.0 / (libm::exp(x) + libm::exp(-x))
}

#[no_mangle]
pub unsafe extern "C" fn cschNumber(x: f64) -> f64 {
    if x == 0.0 {
        return f64::INFINITY;
    }
    let exp_x = libm::exp(x);
    let exp_neg_x = libm::exp(-x);
    libm::fabs(2.0 / (exp_x - exp_neg_x)) * if x > 0.0 { 1.0 } else { -1.0 }
}

// ============================================================================
// Inverse Reciprocal Hyperbolic Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn acothNumber(x: f64) -> f64 {
    if x.is_finite() {
        (libm::log((x + 1.0) / x) + libm::log(x / (x - 1.0))) / 2.0
    } else {
        0.0
    }
}

#[no_mangle]
pub unsafe extern "C" fn asechNumber(x: f64) -> f64 {
    let x_inv = 1.0 / x;
    let ret = libm::sqrt(x_inv * x_inv - 1.0);
    libm::log(ret + x_inv)
}

#[no_mangle]
pub unsafe extern "C" fn acschNumber(x: f64) -> f64 {
    let x_inv = 1.0 / x;
    libm::log(x_inv + libm::sqrt(x_inv * x_inv + 1.0))
}
