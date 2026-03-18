//! Logical operations (ported from src/wasm/logical/operations.ts)

#[export_name = "and"]
pub unsafe extern "C" fn wasm_and(a: i32, b: i32) -> i32 {
    if a != 0 && b != 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn andArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(i);
        *result_ptr.add(i) = if a != 0 && b != 0 { 1 } else { 0 };
    }
}

#[export_name = "or"]
pub unsafe extern "C" fn wasm_or(a: i32, b: i32) -> i32 {
    if a != 0 || b != 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn orArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(i);
        *result_ptr.add(i) = if a != 0 || b != 0 { 1 } else { 0 };
    }
}

#[export_name = "not"]
pub unsafe extern "C" fn wasm_not(a: i32) -> i32 {
    if a == 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn notArray(a_ptr: *const i32, n: i32, result_ptr: *mut i32) {
    for i in 0..n as usize {
        *result_ptr.add(i) = if *a_ptr.add(i) == 0 { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn xor(a: i32, b: i32) -> i32 {
    let a_bool = a != 0;
    let b_bool = b != 0;
    if a_bool != b_bool {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn xorArray(
    a_ptr: *const i32,
    b_ptr: *const i32,
    n: i32,
    result_ptr: *mut i32,
) {
    for i in 0..n as usize {
        let a_bool = *a_ptr.add(i) != 0;
        let b_bool = *b_ptr.add(i) != 0;
        *result_ptr.add(i) = if a_bool != b_bool { 1 } else { 0 };
    }
}

#[no_mangle]
pub unsafe extern "C" fn nand(a: i32, b: i32) -> i32 {
    if a != 0 && b != 0 {
        0
    } else {
        1
    }
}

#[no_mangle]
pub unsafe extern "C" fn nor(a: i32, b: i32) -> i32 {
    if a == 0 && b == 0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn xnor(a: i32, b: i32) -> i32 {
    let a_bool = a != 0;
    let b_bool = b != 0;
    if a_bool == b_bool {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn countTrue(a_ptr: *const i32, n: i32) -> i32 {
    let mut count = 0;
    for i in 0..n as usize {
        if *a_ptr.add(i) != 0 {
            count += 1;
        }
    }
    count
}

#[no_mangle]
pub unsafe extern "C" fn all(a_ptr: *const i32, n: i32) -> i32 {
    for i in 0..n as usize {
        if *a_ptr.add(i) == 0 {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn any(a_ptr: *const i32, n: i32) -> i32 {
    for i in 0..n as usize {
        if *a_ptr.add(i) != 0 {
            return 1;
        }
    }
    0
}

#[no_mangle]
pub unsafe extern "C" fn findFirst(a_ptr: *const i32, n: i32) -> i32 {
    for i in 0..n as usize {
        if *a_ptr.add(i) != 0 {
            return i as i32;
        }
    }
    -1
}

#[no_mangle]
pub unsafe extern "C" fn findLast(a_ptr: *const i32, n: i32) -> i32 {
    for i in (0..n as usize).rev() {
        if *a_ptr.add(i) != 0 {
            return i as i32;
        }
    }
    -1
}

#[no_mangle]
pub unsafe extern "C" fn findAll(a_ptr: *const i32, n: i32, result_ptr: *mut i32) -> i32 {
    let mut j = 0usize;
    for i in 0..n as usize {
        if *a_ptr.add(i) != 0 {
            *result_ptr.add(j) = i as i32;
            j += 1;
        }
    }
    j as i32
}

#[no_mangle]
pub unsafe extern "C" fn select(condition: i32, a: f64, b: f64) -> f64 {
    if condition != 0 {
        a
    } else {
        b
    }
}

#[no_mangle]
pub unsafe extern "C" fn selectArray(
    condition_ptr: *const i32,
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        let condition = *condition_ptr.add(i);
        *result_ptr.add(i) = if condition != 0 {
            *a_ptr.add(i)
        } else {
            *b_ptr.add(i)
        };
    }
}
