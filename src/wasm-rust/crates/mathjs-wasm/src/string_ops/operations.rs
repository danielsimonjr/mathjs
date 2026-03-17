//! String/number operations (ported from src/wasm/string/operations.ts)

use libm;

const CHAR_0: i32 = 48;
const CHAR_9: i32 = 57;
const CHAR_A_UPPER: i32 = 65;
const CHAR_Z_UPPER: i32 = 90;
const CHAR_A_LOWER: i32 = 97;
const CHAR_Z_LOWER: i32 = 122;
const CHAR_MINUS: i32 = 45;
const CHAR_PLUS: i32 = 43;
const CHAR_DOT: i32 = 46;
const CHAR_E_UPPER: i32 = 69;
const CHAR_E_LOWER: i32 = 101;

#[no_mangle]
pub unsafe extern "C" fn isDigit(code: i32) -> i32 {
    if code >= CHAR_0 && code <= CHAR_9 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isLetter(code: i32) -> i32 {
    if (code >= CHAR_A_UPPER && code <= CHAR_Z_UPPER)
        || (code >= CHAR_A_LOWER && code <= CHAR_Z_LOWER)
    {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isAlphanumeric(code: i32) -> i32 {
    if isDigit(code) == 1 || isLetter(code) == 1 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn isWhitespace(code: i32) -> i32 {
    if code == 32 || code == 9 || code == 10 || code == 13 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn toLowerCode(code: i32) -> i32 {
    if code >= CHAR_A_UPPER && code <= CHAR_Z_UPPER {
        code + 32
    } else {
        code
    }
}

#[no_mangle]
pub unsafe extern "C" fn toUpperCode(code: i32) -> i32 {
    if code >= CHAR_A_LOWER && code <= CHAR_Z_LOWER {
        code - 32
    } else {
        code
    }
}

#[no_mangle]
pub unsafe extern "C" fn parseIntFromCodes(codes_ptr: *const i32, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    let mut i = 0usize;
    let n = n as usize;
    while i < n && isWhitespace(*codes_ptr.add(i)) == 1 {
        i += 1;
    }
    if i >= n {
        return f64::NAN;
    }
    let mut sign = 1.0;
    let first = *codes_ptr.add(i);
    if first == CHAR_MINUS {
        sign = -1.0;
        i += 1;
    } else if first == CHAR_PLUS {
        i += 1;
    }
    if i >= n || isDigit(*codes_ptr.add(i)) == 0 {
        return f64::NAN;
    }
    let mut result = 0.0;
    while i < n && isDigit(*codes_ptr.add(i)) == 1 {
        result = result * 10.0 + (*codes_ptr.add(i) - CHAR_0) as f64;
        i += 1;
    }
    sign * result
}

#[no_mangle]
pub unsafe extern "C" fn parseFloatFromCodes(codes_ptr: *const i32, n: i32) -> f64 {
    if n == 0 {
        return f64::NAN;
    }
    let mut i = 0usize;
    let n = n as usize;
    while i < n && isWhitespace(*codes_ptr.add(i)) == 1 {
        i += 1;
    }
    if i >= n {
        return f64::NAN;
    }
    let mut sign = 1.0;
    let first = *codes_ptr.add(i);
    if first == CHAR_MINUS {
        sign = -1.0;
        i += 1;
    } else if first == CHAR_PLUS {
        i += 1;
    }
    if i >= n {
        return f64::NAN;
    }
    let mut int_part = 0.0;
    let mut has_int = false;
    while i < n && isDigit(*codes_ptr.add(i)) == 1 {
        int_part = int_part * 10.0 + (*codes_ptr.add(i) - CHAR_0) as f64;
        has_int = true;
        i += 1;
    }
    let mut frac_part = 0.0;
    let mut frac_div = 1.0;
    let mut has_frac = false;
    if i < n && *codes_ptr.add(i) == CHAR_DOT {
        i += 1;
        while i < n && isDigit(*codes_ptr.add(i)) == 1 {
            frac_part = frac_part * 10.0 + (*codes_ptr.add(i) - CHAR_0) as f64;
            frac_div *= 10.0;
            has_frac = true;
            i += 1;
        }
    }
    if !has_int && !has_frac {
        return f64::NAN;
    }
    let mut result = int_part + frac_part / frac_div;
    if i < n {
        let exp_char = *codes_ptr.add(i);
        if exp_char == CHAR_E_UPPER || exp_char == CHAR_E_LOWER {
            i += 1;
            let mut exp_sign = 1.0;
            if i < n {
                let esc = *codes_ptr.add(i);
                if esc == CHAR_MINUS {
                    exp_sign = -1.0;
                    i += 1;
                } else if esc == CHAR_PLUS {
                    i += 1;
                }
            }
            let mut exp_val = 0.0;
            while i < n && isDigit(*codes_ptr.add(i)) == 1 {
                exp_val = exp_val * 10.0 + (*codes_ptr.add(i) - CHAR_0) as f64;
                i += 1;
            }
            result *= libm::pow(10.0, exp_sign * exp_val);
        }
    }
    sign * result
}

#[no_mangle]
pub unsafe extern "C" fn countDigits(value: i64) -> i32 {
    if value == 0 {
        return 1;
    }
    let mut v = if value < 0 { -value } else { value };
    let mut count = 0;
    while v > 0 {
        count += 1;
        v /= 10;
    }
    count
}

#[no_mangle]
pub unsafe extern "C" fn formatIntToCodes(value: i64, result_ptr: *mut i32) -> i32 {
    if value == 0 {
        *result_ptr = CHAR_0;
        return 1;
    }
    let negative = value < 0;
    let mut v = if negative { -value } else { value };
    let num_digits = countDigits(v);
    let total_len = if negative { num_digits + 1 } else { num_digits };
    let mut i = total_len - 1;
    while v > 0 {
        *result_ptr.add(i as usize) = CHAR_0 + (v % 10) as i32;
        v /= 10;
        i -= 1;
    }
    if negative {
        *result_ptr = CHAR_MINUS;
    }
    total_len
}

#[no_mangle]
pub unsafe extern "C" fn compareCodeArrays(
    a_ptr: *const i32,
    na: i32,
    b_ptr: *const i32,
    nb: i32,
) -> i32 {
    let min_len = if na < nb { na } else { nb } as usize;
    for i in 0..min_len {
        let a_val = *a_ptr.add(i);
        let b_val = *b_ptr.add(i);
        if a_val < b_val {
            return -1;
        }
        if a_val > b_val {
            return 1;
        }
    }
    if na < nb {
        -1
    } else if na > nb {
        1
    } else {
        0
    }
}

#[no_mangle]
pub unsafe extern "C" fn hashCodes(codes_ptr: *const i32, n: i32) -> u32 {
    const FNV_PRIME: u32 = 16777619;
    const FNV_OFFSET: u32 = 2166136261;
    let mut hash = FNV_OFFSET;
    for i in 0..n as usize {
        hash ^= *codes_ptr.add(i) as u32;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    hash
}

#[no_mangle]
pub unsafe extern "C" fn findPattern(
    text_ptr: *const i32,
    text_len: i32,
    pattern_ptr: *const i32,
    pattern_len: i32,
) -> i32 {
    if pattern_len == 0 {
        return 0;
    }
    if pattern_len > text_len {
        return -1;
    }
    for i in 0..=(text_len - pattern_len) as usize {
        let mut found = true;
        for j in 0..pattern_len as usize {
            if *text_ptr.add(i + j) != *pattern_ptr.add(j) {
                found = false;
                break;
            }
        }
        if found {
            return i as i32;
        }
    }
    -1
}

#[no_mangle]
pub unsafe extern "C" fn countPattern(
    text_ptr: *const i32,
    text_len: i32,
    pattern_ptr: *const i32,
    pattern_len: i32,
) -> i32 {
    if pattern_len == 0 || pattern_len > text_len {
        return 0;
    }
    let mut count = 0;
    let mut i = 0usize;
    while i <= (text_len - pattern_len) as usize {
        let mut found = true;
        for j in 0..pattern_len as usize {
            if *text_ptr.add(i + j) != *pattern_ptr.add(j) {
                found = false;
                break;
            }
        }
        if found {
            count += 1;
            i += pattern_len as usize;
        } else {
            i += 1;
        }
    }
    count
}

#[no_mangle]
pub unsafe extern "C" fn utf8ByteLength(codes_ptr: *const i32, n: i32) -> i32 {
    let mut byte_len = 0;
    for i in 0..n as usize {
        let code = *codes_ptr.add(i);
        if code <= 0x7f {
            byte_len += 1;
        } else if code <= 0x7ff {
            byte_len += 2;
        } else if code <= 0xffff {
            byte_len += 3;
        } else {
            byte_len += 4;
        }
    }
    byte_len
}

#[no_mangle]
pub unsafe extern "C" fn isNumericString(codes_ptr: *const i32, n: i32) -> i32 {
    if n == 0 {
        return 0;
    }
    let mut i = 0usize;
    let n = n as usize;
    while i < n && isWhitespace(*codes_ptr.add(i)) == 1 {
        i += 1;
    }
    if i >= n {
        return 0;
    }
    let sc = *codes_ptr.add(i);
    if sc == CHAR_MINUS || sc == CHAR_PLUS {
        i += 1;
    }
    if i >= n {
        return 0;
    }
    let mut has_digit = false;
    while i < n && isDigit(*codes_ptr.add(i)) == 1 {
        has_digit = true;
        i += 1;
    }
    if i < n && *codes_ptr.add(i) == CHAR_DOT {
        i += 1;
        while i < n && isDigit(*codes_ptr.add(i)) == 1 {
            has_digit = true;
            i += 1;
        }
    }
    if !has_digit {
        return 0;
    }
    if i < n {
        let ec = *codes_ptr.add(i);
        if ec == CHAR_E_UPPER || ec == CHAR_E_LOWER {
            i += 1;
            if i < n {
                let esc = *codes_ptr.add(i);
                if esc == CHAR_MINUS || esc == CHAR_PLUS {
                    i += 1;
                }
            }
            if i >= n || isDigit(*codes_ptr.add(i)) == 0 {
                return 0;
            }
            while i < n && isDigit(*codes_ptr.add(i)) == 1 {
                i += 1;
            }
        }
    }
    while i < n && isWhitespace(*codes_ptr.add(i)) == 1 {
        i += 1;
    }
    if i == n {
        1
    } else {
        0
    }
}
