//! Set operations (ported from src/wasm/set/operations.ts)

fn quicksort(arr_ptr: *mut f64, left: i32, right: i32) {
    if left >= right {
        return;
    }
    unsafe {
        let pivot = *arr_ptr.add(((left + right) >> 1) as usize);
        let mut i = left;
        let mut j = right;
        while i <= j {
            while *arr_ptr.add(i as usize) < pivot {
                i += 1;
            }
            while *arr_ptr.add(j as usize) > pivot {
                j -= 1;
            }
            if i <= j {
                let tmp = *arr_ptr.add(i as usize);
                *arr_ptr.add(i as usize) = *arr_ptr.add(j as usize);
                *arr_ptr.add(j as usize) = tmp;
                i += 1;
                j -= 1;
            }
        }
        if left < j {
            quicksort(arr_ptr, left, j);
        }
        if i < right {
            quicksort(arr_ptr, i, right);
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn createSet(arr_ptr: *const f64, n: i32, result_ptr: *mut f64) -> i32 {
    if n == 0 {
        return 0;
    }
    for i in 0..n as usize {
        *result_ptr.add(i) = *arr_ptr.add(i);
    }
    quicksort(result_ptr, 0, n - 1);
    let mut unique = 1i32;
    for i in 1..n as usize {
        if *result_ptr.add(i) != *result_ptr.add((unique - 1) as usize) {
            *result_ptr.add(unique as usize) = *result_ptr.add(i);
            unique += 1;
        }
    }
    unique
}

#[no_mangle]
pub unsafe extern "C" fn setUnion(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    if na == 0 && nb == 0 {
        return 0;
    }
    if na == 0 {
        for i in 0..nb as usize {
            *result_ptr.add(i) = *b_ptr.add(i);
        }
        return nb;
    }
    if nb == 0 {
        for i in 0..na as usize {
            *result_ptr.add(i) = *a_ptr.add(i);
        }
        return na;
    }
    let (mut i, mut j, mut k) = (0usize, 0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            *result_ptr.add(k) = a;
            i += 1;
            k += 1;
        } else if a > b {
            *result_ptr.add(k) = b;
            j += 1;
            k += 1;
        } else {
            *result_ptr.add(k) = a;
            i += 1;
            j += 1;
            k += 1;
        }
    }
    while i < na as usize {
        *result_ptr.add(k) = *a_ptr.add(i);
        i += 1;
        k += 1;
    }
    while j < nb as usize {
        *result_ptr.add(k) = *b_ptr.add(j);
        j += 1;
        k += 1;
    }
    k as i32
}

#[no_mangle]
pub unsafe extern "C" fn setIntersect(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    if na == 0 || nb == 0 {
        return 0;
    }
    let (mut i, mut j, mut k) = (0usize, 0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            i += 1;
        } else if a > b {
            j += 1;
        } else {
            *result_ptr.add(k) = a;
            i += 1;
            j += 1;
            k += 1;
        }
    }
    k as i32
}

#[no_mangle]
pub unsafe extern "C" fn setDifference(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    if na == 0 {
        return 0;
    }
    if nb == 0 {
        for i in 0..na as usize {
            *result_ptr.add(i) = *a_ptr.add(i);
        }
        return na;
    }
    let (mut i, mut j, mut k) = (0usize, 0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            *result_ptr.add(k) = a;
            i += 1;
            k += 1;
        } else if a > b {
            j += 1;
        } else {
            i += 1;
            j += 1;
        }
    }
    while i < na as usize {
        *result_ptr.add(k) = *a_ptr.add(i);
        i += 1;
        k += 1;
    }
    k as i32
}

#[no_mangle]
pub unsafe extern "C" fn setSymDifference(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    if na == 0 && nb == 0 {
        return 0;
    }
    if na == 0 {
        for i in 0..nb as usize {
            *result_ptr.add(i) = *b_ptr.add(i);
        }
        return nb;
    }
    if nb == 0 {
        for i in 0..na as usize {
            *result_ptr.add(i) = *a_ptr.add(i);
        }
        return na;
    }
    let (mut i, mut j, mut k) = (0usize, 0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            *result_ptr.add(k) = a;
            i += 1;
            k += 1;
        } else if a > b {
            *result_ptr.add(k) = b;
            j += 1;
            k += 1;
        } else {
            i += 1;
            j += 1;
        }
    }
    while i < na as usize {
        *result_ptr.add(k) = *a_ptr.add(i);
        i += 1;
        k += 1;
    }
    while j < nb as usize {
        *result_ptr.add(k) = *b_ptr.add(j);
        j += 1;
        k += 1;
    }
    k as i32
}

#[no_mangle]
pub unsafe extern "C" fn setIsSubset(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
) -> i32 {
    if na == 0 {
        return 1;
    }
    if nb == 0 || na > nb {
        return 0;
    }
    let (mut i, mut j) = (0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            return 0;
        } else if a > b {
            j += 1;
        } else {
            i += 1;
            j += 1;
        }
    }
    if i == na as usize {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn setIsProperSubset(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
) -> i32 {
    if setIsSubset(a_ptr, na, b_ptr, nb) == 1 && na < nb {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn setIsSuperset(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
) -> i32 {
    setIsSubset(b_ptr, nb, a_ptr, na)
}

#[no_mangle]
pub unsafe extern "C" fn setIsProperSuperset(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
) -> i32 {
    setIsProperSubset(b_ptr, nb, a_ptr, na)
}

#[no_mangle]
pub unsafe extern "C" fn setEquals(a_ptr: *const f64, na: i32, b_ptr: *const f64, nb: i32) -> i32 {
    if na != nb {
        return 0;
    }
    for i in 0..na as usize {
        if *a_ptr.add(i) != *b_ptr.add(i) {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn setIsDisjoint(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
) -> i32 {
    if na == 0 || nb == 0 {
        return 1;
    }
    let (mut i, mut j) = (0usize, 0usize);
    while i < na as usize && j < nb as usize {
        let a = *a_ptr.add(i);
        let b = *b_ptr.add(j);
        if a < b {
            i += 1;
        } else if a > b {
            j += 1;
        } else {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn setSize(n: i32) -> i32 {
    n
}

#[no_mangle]
pub unsafe extern "C" fn setContains(a_ptr: *const f64, n: i32, value: f64) -> i32 {
    if n == 0 {
        return 0;
    }
    let (mut left, mut right) = (0i32, n - 1);
    while left <= right {
        let mid = (left + right) >> 1;
        let mid_val = *a_ptr.add(mid as usize);
        if mid_val == value {
            return 1;
        } else if mid_val < value {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    0
}

#[no_mangle]
pub unsafe extern "C" fn setAdd(
    a_ptr: *const f64,
    n: i32,
    value: f64,
    result_ptr: *mut f64,
) -> i32 {
    if n == 0 {
        *result_ptr = value;
        return 1;
    }
    let (mut left, mut right) = (0i32, n);
    while left < right {
        let mid = (left + right) >> 1;
        if *a_ptr.add(mid as usize) < value {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    if left < n && *a_ptr.add(left as usize) == value {
        for i in 0..n as usize {
            *result_ptr.add(i) = *a_ptr.add(i);
        }
        return n;
    }
    for i in 0..left as usize {
        *result_ptr.add(i) = *a_ptr.add(i);
    }
    *result_ptr.add(left as usize) = value;
    for i in left as usize..n as usize {
        *result_ptr.add(i + 1) = *a_ptr.add(i);
    }
    n + 1
}

#[no_mangle]
pub unsafe extern "C" fn setRemove(
    a_ptr: *const f64,
    n: i32,
    value: f64,
    result_ptr: *mut f64,
) -> i32 {
    if n == 0 {
        return 0;
    }
    let (mut left, mut right) = (0i32, n - 1);
    while left <= right {
        let mid = (left + right) >> 1;
        let mid_val = *a_ptr.add(mid as usize);
        if mid_val == value {
            for i in 0..mid as usize {
                *result_ptr.add(i) = *a_ptr.add(i);
            }
            for i in (mid + 1) as usize..n as usize {
                *result_ptr.add(i - 1) = *a_ptr.add(i);
            }
            return n - 1;
        } else if mid_val < value {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    for i in 0..n as usize {
        *result_ptr.add(i) = *a_ptr.add(i);
    }
    n
}

#[no_mangle]
pub unsafe extern "C" fn setCartesian(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    if na == 0 || nb == 0 {
        return 0;
    }
    let mut k = 0usize;
    for i in 0..na as usize {
        let a_val = *a_ptr.add(i);
        for j in 0..nb as usize {
            *result_ptr.add(k) = a_val;
            *result_ptr.add(k + 1) = *b_ptr.add(j);
            k += 2;
        }
    }
    na * nb
}

#[no_mangle]
pub unsafe extern "C" fn setPowerSetSize(n: i32) -> i32 {
    1 << n
}

#[no_mangle]
pub unsafe extern "C" fn setGetSubset(
    a_ptr: *const f64,
    n: i32,
    index: i32,
    result_ptr: *mut f64,
) -> i32 {
    let mut k = 0usize;
    for i in 0..n {
        if (index & (1 << i)) != 0 {
            *result_ptr.add(k) = *a_ptr.add(i as usize);
            k += 1;
        }
    }
    k as i32
}
