//! Bitwise operations (ported from src/wasm/bitwise/operations.ts)

#[no_mangle]
pub unsafe extern "C" fn bitAnd(x: i32, y: i32) -> i32 {
    x & y
}

#[no_mangle]
pub unsafe extern "C" fn bitOr(x: i32, y: i32) -> i32 {
    x | y
}

#[no_mangle]
pub unsafe extern "C" fn bitXor(x: i32, y: i32) -> i32 {
    x ^ y
}

#[no_mangle]
pub unsafe extern "C" fn bitNot(x: i32) -> i32 {
    !x
}

#[no_mangle]
pub unsafe extern "C" fn leftShift(x: i32, y: i32) -> i32 {
    x << y
}

#[no_mangle]
pub unsafe extern "C" fn rightArithShift(x: i32, y: i32) -> i32 {
    x >> y
}

#[no_mangle]
pub unsafe extern "C" fn rightLogShift(x: i32, y: i32) -> i32 {
    (x as u32 >> y as u32) as i32
}

// Vectorized operations

#[no_mangle]
pub unsafe extern "C" fn bitAndArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) & *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn bitOrArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) | *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn bitXorArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) ^ *b_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn bitNotArray(input_ptr: *const i32, result_ptr: *mut i32, length: i32) {
    for i in 0..length as usize {
        *result_ptr.add(i) = !*input_ptr.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn leftShiftArray(
    values_ptr: *const i32,
    shift: i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *values_ptr.add(i) << shift;
    }
}

#[no_mangle]
pub unsafe extern "C" fn rightArithShiftArray(
    values_ptr: *const i32,
    shift: i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *values_ptr.add(i) >> shift;
    }
}

#[no_mangle]
pub unsafe extern "C" fn rightLogShiftArray(
    values_ptr: *const i32,
    shift: i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = (*values_ptr.add(i) as u32 >> shift as u32) as i32;
    }
}

#[no_mangle]
pub unsafe extern "C" fn popcount(x: i32) -> i32 {
    (x as u32).count_ones() as i32
}

#[no_mangle]
pub unsafe extern "C" fn ctz(x: i32) -> i32 {
    if x == 0 {
        32
    } else {
        (x as u32).trailing_zeros() as i32
    }
}

#[no_mangle]
pub unsafe extern "C" fn clz(x: i32) -> i32 {
    (x as u32).leading_zeros() as i32
}

#[no_mangle]
pub unsafe extern "C" fn rotl(x: i32, n: i32) -> i32 {
    (x as u32).rotate_left(n as u32) as i32
}

#[no_mangle]
pub unsafe extern "C" fn rotr(x: i32, n: i32) -> i32 {
    (x as u32).rotate_right(n as u32) as i32
}
