//! Plain number arithmetic operations (ported from src/wasm/plain/arithmetic.ts)

use libm;

// ============================================================================
// Basic Arithmetic Operations
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn absNumber(a: f64) -> f64 {
    libm::fabs(a)
}

#[no_mangle]
pub unsafe extern "C" fn addNumber(a: f64, b: f64) -> f64 {
    a + b
}

#[no_mangle]
pub unsafe extern "C" fn subtractNumber(a: f64, b: f64) -> f64 {
    a - b
}

#[no_mangle]
pub unsafe extern "C" fn multiplyNumber(a: f64, b: f64) -> f64 {
    a * b
}

#[no_mangle]
pub unsafe extern "C" fn divideNumber(a: f64, b: f64) -> f64 {
    a / b
}

#[no_mangle]
pub unsafe extern "C" fn unaryMinusNumber(x: f64) -> f64 {
    -x
}

#[no_mangle]
pub unsafe extern "C" fn unaryPlusNumber(x: f64) -> f64 {
    x
}

// ============================================================================
// Power and Root Operations
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn cbrtNumber(x: f64) -> f64 {
    libm::cbrt(x)
}

#[no_mangle]
pub unsafe extern "C" fn cubeNumber(x: f64) -> f64 {
    x * x * x
}

#[no_mangle]
pub unsafe extern "C" fn sqrtNumber(x: f64) -> f64 {
    libm::sqrt(x)
}

#[no_mangle]
pub unsafe extern "C" fn squareNumber(x: f64) -> f64 {
    x * x
}

#[no_mangle]
pub unsafe extern "C" fn nthRootNumber(a: f64, root: f64) -> f64 {
    let mut root = root;
    let inv = root < 0.0;
    if inv {
        root = -root;
    }

    if root == 0.0 {
        return f64::NAN;
    }

    if a < 0.0 && libm::fabs(root) % 2.0 != 1.0 {
        return f64::NAN;
    }

    if a == 0.0 {
        return if inv { f64::INFINITY } else { 0.0 };
    }
    if !a.is_finite() {
        return if inv { 0.0 } else { a };
    }

    let mut x = libm::pow(libm::fabs(a), 1.0 / root);
    if a < 0.0 {
        x = -x;
    }
    if inv {
        1.0 / x
    } else {
        x
    }
}

// ============================================================================
// Exponential and Logarithmic Functions
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn expNumber(x: f64) -> f64 {
    libm::exp(x)
}

#[no_mangle]
pub unsafe extern "C" fn expm1Number(x: f64) -> f64 {
    libm::expm1(x)
}

#[no_mangle]
pub unsafe extern "C" fn logNumber(x: f64, base: f64) -> f64 {
    if base.is_nan() || base <= 0.0 || base == 1.0 {
        return f64::NAN;
    }
    libm::log(x) / libm::log(base)
}

#[no_mangle]
pub unsafe extern "C" fn lnNumber(x: f64) -> f64 {
    libm::log(x)
}

#[no_mangle]
pub unsafe extern "C" fn log10Number(x: f64) -> f64 {
    libm::log10(x)
}

#[no_mangle]
pub unsafe extern "C" fn log2Number(x: f64) -> f64 {
    libm::log2(x)
}

#[no_mangle]
pub unsafe extern "C" fn log1pNumber(x: f64) -> f64 {
    libm::log1p(x)
}

// ============================================================================
// Power Function
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn powNumber(x: f64, y: f64) -> f64 {
    if (x * x < 1.0 && y == f64::INFINITY) || (x * x > 1.0 && y == f64::NEG_INFINITY) {
        return 0.0;
    }
    libm::pow(x, y)
}

// ============================================================================
// Integer Operations
// ============================================================================

fn is_integer_number(x: f64) -> bool {
    x == libm::floor(x) && x.is_finite()
}

#[no_mangle]
pub unsafe extern "C" fn gcdNumber(a: f64, b: f64) -> f64 {
    if !is_integer_number(a) || !is_integer_number(b) {
        return f64::NAN;
    }
    let mut a = a;
    let mut b = b;
    while b != 0.0 {
        let r = a % b;
        a = b;
        b = r;
    }
    if a < 0.0 {
        -a
    } else {
        a
    }
}

#[no_mangle]
pub unsafe extern "C" fn lcmNumber(a: f64, b: f64) -> f64 {
    if !is_integer_number(a) || !is_integer_number(b) {
        return f64::NAN;
    }
    if a == 0.0 || b == 0.0 {
        return 0.0;
    }
    let prod = a * b;
    let mut a = a;
    let mut b = b;
    while b != 0.0 {
        let t = b;
        b = a % t;
        a = t;
    }
    libm::fabs(prod / a)
}

#[no_mangle]
pub unsafe extern "C" fn xgcdNumber(a: f64, b: f64, result_ptr: *mut f64) -> i32 {
    if !is_integer_number(a) || !is_integer_number(b) {
        *result_ptr = f64::NAN;
        *result_ptr.add(1) = f64::NAN;
        *result_ptr.add(2) = f64::NAN;
        return 0;
    }
    let mut a = a;
    let mut b = b;
    let mut x: f64 = 0.0;
    let mut lastx: f64 = 1.0;
    let mut y: f64 = 1.0;
    let mut lasty: f64 = 0.0;

    while b != 0.0 {
        let q = libm::floor(a / b);
        let r = a - q * b;

        let t = x;
        x = lastx - q * x;
        lastx = t;

        let t = y;
        y = lasty - q * y;
        lasty = t;

        a = b;
        b = r;
    }

    if a < 0.0 {
        *result_ptr = -a;
        *result_ptr.add(1) = -lastx;
        *result_ptr.add(2) = -lasty;
    } else {
        *result_ptr = a;
        *result_ptr.add(1) = if a != 0.0 { lastx } else { 0.0 };
        *result_ptr.add(2) = lasty;
    }
    1
}

// ============================================================================
// Modulo and Other Operations
// ============================================================================

#[no_mangle]
pub unsafe extern "C" fn modNumber(x: f64, y: f64) -> f64 {
    if y == 0.0 {
        x
    } else {
        x - y * libm::floor(x / y)
    }
}

#[no_mangle]
pub unsafe extern "C" fn signNumber(x: f64) -> f64 {
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        0.0
    }
}

#[no_mangle]
pub unsafe extern "C" fn roundNumber(value: f64, decimals: i32) -> f64 {
    if decimals < 0 || decimals > 15 {
        return f64::NAN;
    }
    let multiplier = libm::pow(10.0, decimals as f64);
    libm::round(value * multiplier) / multiplier
}

#[no_mangle]
pub unsafe extern "C" fn normNumber(x: f64) -> f64 {
    libm::fabs(x)
}
