//! Relational operations (ported from src/wasm/relational/operations.ts)

use libm;

#[no_mangle]
pub unsafe extern "C" fn compare(a: f64, b: f64) -> i32 {
    if a < b {
        -1
    } else if a > b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn compareArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(i);
        *result_ptr.add(i) = if a < b {
            -1
        } else if a > b {
            1
        } else {
            0
        };
    }
}

#[no_mangle]
pub unsafe extern "C" fn equal(a: f64, b: f64) -> i32 {
    if a == b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn nearlyEqual(a: f64, b: f64, tolerance: f64) -> i32 {
    if libm::fabs(a - b) <= tolerance {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn equalArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) == *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn unequal(a: f64, b: f64) -> i32 {
    if a != b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn unequalArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) != *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn larger(a: f64, b: f64) -> i32 {
    if a > b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn largerArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) > *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn largerEq(a: f64, b: f64) -> i32 {
    if a >= b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn largerEqArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) >= *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn smaller(a: f64, b: f64) -> i32 {
    if a < b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn smallerArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) < *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn smallerEq(a: f64, b: f64) -> i32 {
    if a <= b {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn smallerEqArray(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) <= *b_ptr.add(i) { 1 } else { 0 };
    }
}

#[export_name = "relationalMin"]
pub unsafe extern "C" fn relational_min(a_ptr: *const f64, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    let mut min_val = *a_ptr;
    for i in 1..n as usize {
        let val = *a_ptr.add(i);
        if val < min_val {
            min_val = val;
        }
    }
    min_val
}

#[export_name = "relationalMax"]
pub unsafe extern "C" fn relational_max(a_ptr: *const f64, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    let mut max_val = *a_ptr;
    for i in 1..n as usize {
        let val = *a_ptr.add(i);
        if val > max_val {
            max_val = val;
        }
    }
    max_val
}

#[no_mangle]
pub unsafe extern "C" fn argmin(a_ptr: *const f64, n: i32) -> i32 {
    if n == 0 {
        return -1;
    }
    let mut min_idx = 0;
    let mut min_val = *a_ptr;
    for i in 1..n as usize {
        let val = *a_ptr.add(i);
        if val < min_val {
            min_val = val;
            min_idx = i;
        }
    }
    min_idx as i32
}

#[export_name = "relArgmax"]
pub unsafe extern "C" fn rel_argmax(a_ptr: *const f64, n: i32) -> i32 {
    if n == 0 {
        return -1;
    }
    let mut max_idx = 0;
    let mut max_val = *a_ptr;
    for i in 1..n as usize {
        let val = *a_ptr.add(i);
        if val > max_val {
            max_val = val;
            max_idx = i;
        }
    }
    max_idx as i32
}

#[no_mangle]
pub unsafe extern "C" fn clamp(value: f64, min_val: f64, max_val: f64) -> f64 {
    if value < min_val {
        min_val
    } else if value > max_val {
        max_val
    } else {
        value
    }
}

#[no_mangle]
pub unsafe extern "C" fn clampArray(
    a_ptr: *const f64,
    min_val: f64,
    max_val: f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        let mut v = *a_ptr.add(i);
        if v < min_val {
            v = min_val;
        }
        if v > max_val {
            v = max_val;
        }
        *result_ptr.add(i) = v;
    }
}

#[no_mangle]
pub unsafe extern "C" fn inRange(value: f64, min_val: f64, max_val: f64) -> i32 {
    if value >= min_val && value <= max_val {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn inRangeArray(
    a_ptr: *const f64,
    min_val: f64,
    max_val: f64,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        let val = *a_ptr.add(i);
        *result_ptr.add(i) = if val >= min_val && val <= max_val {
            1
        } else {
            0
        };
    }
}

#[no_mangle]
pub unsafe extern "C" fn isPositive(a: f64) -> i32 {
    if a > 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isNegative(a: f64) -> i32 {
    if a < 0.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isZero(a: f64) -> i32 {
    if a == 0.0 {
        1
    } else {
        0
    }
}

#[export_name = "isNaN"]
pub unsafe extern "C" fn wasm_is_nan(a: f64) -> i32 {
    if a != a {
        1
    } else {
        0
    }
}

#[export_name = "isFinite"]
pub unsafe extern "C" fn wasm_is_finite(a: f64) -> i32 {
    if a == a && a != f64::INFINITY && a != f64::NEG_INFINITY {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isInteger(a: f64) -> i32 {
    if libm::floor(a) == a {
        1
    } else {
        0
    }
}

#[export_name = "relational_sign"]
pub unsafe extern "C" fn relational_sign(a: f64) -> i32 {
    if a > 0.0 {
        1
    } else if a < 0.0 {
        -1
    } else {
        0
    }
}

#[export_name = "relational_signArray"]
pub unsafe extern "C" fn relational_sign_array(a_ptr: *const f64, n: i32, result_ptr: *mut i32) {
    for i in 0..n as usize {
        let val = *a_ptr.add(i);
        *result_ptr.add(i) = if val > 0.0 {
            1
        } else if val < 0.0 {
            -1
        } else {
            0
        };
    }
}
