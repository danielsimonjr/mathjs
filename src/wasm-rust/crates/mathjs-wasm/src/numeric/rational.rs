//! Rational arithmetic using i64 pairs [numerator, denominator].

/// GCD using binary GCD (Stein's algorithm).
#[no_mangle]
pub extern "C" fn gcd(mut a: i64, mut b: i64) -> i64 {
    if a < 0 {
        a = -a;
    }
    if b < 0 {
        b = -b;
    }
    if a == 0 {
        return b;
    }
    if b == 0 {
        return a;
    }
    let mut shift: u32 = 0;
    while ((a | b) & 1) == 0 {
        a >>= 1;
        b >>= 1;
        shift += 1;
    }
    while (a & 1) == 0 {
        a >>= 1;
    }
    while b != 0 {
        while (b & 1) == 0 {
            b >>= 1;
        }
        if a > b {
            let t = a;
            a = b;
            b = t;
        }
        b -= a;
    }
    a << shift
}

/// Least common multiple.
#[no_mangle]
pub extern "C" fn lcm(a: i64, b: i64) -> i64 {
    if a == 0 || b == 0 {
        return 0;
    }
    let g = gcd(a, b);
    (a / g) * b
}

/// Reduce rational to lowest terms.
#[no_mangle]
pub unsafe extern "C" fn reduce(mut num: i64, mut den: i64, result_ptr: *mut i64) {
    if den == 0 {
        *result_ptr = if num > 0 {
            1
        } else if num < 0 {
            -1
        } else {
            0
        };
        *result_ptr.add(1) = 0;
        return;
    }
    if num == 0 {
        *result_ptr = 0;
        *result_ptr.add(1) = 1;
        return;
    }
    if den < 0 {
        num = -num;
        den = -den;
    }
    let g = gcd(num, den);
    *result_ptr = num / g;
    *result_ptr.add(1) = den / g;
}

/// Add two rationals.
#[no_mangle]
pub unsafe extern "C" fn add(num1: i64, den1: i64, num2: i64, den2: i64, result_ptr: *mut i64) {
    let g = gcd(den1, den2);
    let d1 = den1 / g;
    let d2 = den2 / g;
    let num = num1 * d2 + num2 * d1;
    let den = den1 * d2;
    reduce(num, den, result_ptr);
}

/// Subtract two rationals.
#[no_mangle]
pub unsafe extern "C" fn subtract(
    num1: i64,
    den1: i64,
    num2: i64,
    den2: i64,
    result_ptr: *mut i64,
) {
    add(num1, den1, -num2, den2, result_ptr);
}

/// Multiply two rationals.
#[no_mangle]
pub unsafe extern "C" fn multiply(
    num1: i64,
    den1: i64,
    num2: i64,
    den2: i64,
    result_ptr: *mut i64,
) {
    let g1 = gcd(num1, den2);
    let g2 = gcd(num2, den1);
    let num = (num1 / g1) * (num2 / g2);
    let den = (den1 / g2) * (den2 / g1);
    reduce(num, den, result_ptr);
}

/// Divide two rationals.
#[no_mangle]
pub unsafe extern "C" fn divide(num1: i64, den1: i64, num2: i64, den2: i64, result_ptr: *mut i64) {
    multiply(num1, den1, den2, num2, result_ptr);
}

/// Negate a rational.
#[no_mangle]
pub unsafe extern "C" fn negate(num: i64, den: i64, result_ptr: *mut i64) {
    *result_ptr = -num;
    *result_ptr.add(1) = den;
}

/// Absolute value.
#[no_mangle]
#[export_name = "abs"]
pub unsafe extern "C" fn rational_abs(num: i64, den: i64, result_ptr: *mut i64) {
    *result_ptr = if num < 0 { -num } else { num };
    *result_ptr.add(1) = if den < 0 { -den } else { den };
}

/// Reciprocal.
#[no_mangle]
pub unsafe extern "C" fn reciprocal(num: i64, den: i64, result_ptr: *mut i64) {
    if num < 0 {
        *result_ptr = -den;
        *result_ptr.add(1) = -num;
    } else {
        *result_ptr = den;
        *result_ptr.add(1) = num;
    }
}

/// Compare two rationals: -1, 0, or 1.
#[no_mangle]
pub extern "C" fn compare(mut num1: i64, mut den1: i64, mut num2: i64, mut den2: i64) -> i32 {
    if den1 == 0 && den2 == 0 {
        return if num1 == num2 {
            0
        } else if num1 > num2 {
            1
        } else {
            -1
        };
    }
    if den1 == 0 {
        return if num1 >= 0 { 1 } else { -1 };
    }
    if den2 == 0 {
        return if num2 >= 0 { -1 } else { 1 };
    }
    if den1 < 0 {
        num1 = -num1;
        den1 = -den1;
    }
    if den2 < 0 {
        num2 = -num2;
        den2 = -den2;
    }
    let lhs = num1 * den2;
    let rhs = num2 * den1;
    if lhs < rhs {
        -1
    } else if lhs > rhs {
        1
    } else {
        0
    }
}

/// Check equality.
#[no_mangle]
pub extern "C" fn equals(num1: i64, den1: i64, num2: i64, den2: i64) -> i32 {
    if compare(num1, den1, num2, den2) == 0 {
        1
    } else {
        0
    }
}

/// Check if zero.
#[no_mangle]
pub extern "C" fn isZero(num: i64, den: i64) -> i32 {
    if num == 0 && den != 0 {
        1
    } else {
        0
    }
}

/// Check if positive.
#[no_mangle]
pub extern "C" fn isPositive(num: i64, den: i64) -> i32 {
    if den == 0 {
        return if num > 0 { 1 } else { 0 };
    }
    if (num > 0 && den > 0) || (num < 0 && den < 0) {
        1
    } else {
        0
    }
}

/// Check if negative.
#[no_mangle]
pub extern "C" fn isNegative(num: i64, den: i64) -> i32 {
    if den == 0 {
        return if num < 0 { 1 } else { 0 };
    }
    if (num > 0 && den < 0) || (num < 0 && den > 0) {
        1
    } else {
        0
    }
}

/// Check if integer.
#[no_mangle]
pub unsafe extern "C" fn isInteger(num: i64, den: i64, work_ptr: *mut i64) -> i32 {
    if den == 0 {
        return 0;
    }
    reduce(num, den, work_ptr);
    let r_den = *work_ptr.add(1);
    if r_den == 1 || r_den == -1 {
        1
    } else {
        0
    }
}

/// Convert to f64.
#[no_mangle]
pub extern "C" fn toFloat(num: i64, den: i64) -> f64 {
    if den == 0 {
        if num > 0 {
            return f64::INFINITY;
        }
        if num < 0 {
            return f64::NEG_INFINITY;
        }
        return f64::NAN;
    }
    num as f64 / den as f64
}

/// Convert f64 to rational via continued fractions.
#[no_mangle]
pub unsafe extern "C" fn fromFloat(mut value: f64, max_denom: i64, result_ptr: *mut i64) {
    if !value.is_finite() {
        *result_ptr = if value > 0.0 {
            1
        } else if value < 0.0 {
            -1
        } else {
            0
        };
        *result_ptr.add(1) = 0;
        return;
    }
    if value == 0.0 {
        *result_ptr = 0;
        *result_ptr.add(1) = 1;
        return;
    }
    let neg = value < 0.0;
    if neg {
        value = -value;
    }
    let (mut h0, mut h1): (i64, i64) = (0, 1);
    let (mut k0, mut k1): (i64, i64) = (1, 0);
    let mut x = value;
    for _ in 0..64 {
        let a = libm::floor(x) as i64;
        let h2 = a * h1 + h0;
        let k2 = a * k1 + k0;
        if k2 > max_denom || k2 < 0 {
            break;
        }
        h0 = h1;
        h1 = h2;
        k0 = k1;
        k1 = k2;
        let rem = x - a as f64;
        if libm::fabs(rem) < 1e-15 {
            break;
        }
        x = 1.0 / rem;
        if !x.is_finite() {
            break;
        }
    }
    *result_ptr = if neg { -h1 } else { h1 };
    *result_ptr.add(1) = k1;
}

/// Create from integer.
#[no_mangle]
pub unsafe extern "C" fn fromInteger(value: i64, result_ptr: *mut i64) {
    *result_ptr = value;
    *result_ptr.add(1) = 1;
}

/// Raise rational to integer power.
#[no_mangle]
pub unsafe extern "C" fn pow(mut num: i64, mut den: i64, mut exp: i32, result_ptr: *mut i64) {
    if exp == 0 {
        *result_ptr = 1;
        *result_ptr.add(1) = 1;
        return;
    }
    if exp < 0 {
        let t = num;
        num = den;
        den = t;
        exp = -exp;
    }
    let mut rn: i64 = 1;
    let mut rd: i64 = 1;
    while exp > 0 {
        if (exp & 1) == 1 {
            rn *= num;
            rd *= den;
        }
        num *= num;
        den *= den;
        exp >>= 1;
    }
    reduce(rn, rd, result_ptr);
}

/// Integer square root (floor).
#[no_mangle]
pub extern "C" fn isqrt(n: i64) -> i64 {
    if n < 0 {
        return -1;
    }
    if n < 2 {
        return n;
    }
    let mut x = n;
    let mut y = (x + 1) >> 1;
    while y < x {
        x = y;
        y = (x + n / x) >> 1;
    }
    x
}

/// Check if perfect square.
#[no_mangle]
pub extern "C" fn isPerfectSquare(n: i64) -> i32 {
    if n < 0 {
        return 0;
    }
    let s = isqrt(n);
    if s * s == n {
        1
    } else {
        0
    }
}

/// Simplify sqrt(n) = a * sqrt(b).
#[no_mangle]
pub unsafe extern "C" fn simplifySqrt(n: i64, result_ptr: *mut i64) {
    if n <= 0 {
        *result_ptr = 0;
        *result_ptr.add(1) = if n < 0 { -n } else { 0 };
        return;
    }
    let mut a: i64 = 1;
    let mut b = n;
    let mut d: i64 = 2;
    while d * d <= b {
        while b % (d * d) == 0 {
            a *= d;
            b /= d * d;
        }
        d += 1;
    }
    *result_ptr = a;
    *result_ptr.add(1) = b;
}

/// Modular inverse.
#[no_mangle]
pub extern "C" fn modInverse(a: i64, m: i64) -> i64 {
    if m <= 0 {
        return 0;
    }
    let a = ((a % m) + m) % m;
    let (mut t, mut newt): (i64, i64) = (0, 1);
    let (mut r, mut newr) = (m, a);
    while newr != 0 {
        let q = r / newr;
        let tt = t;
        t = newt;
        newt = tt - q * newt;
        let tr = r;
        r = newr;
        newr = tr - q * newr;
    }
    if r > 1 {
        return 0;
    }
    if t < 0 {
        t += m;
    }
    t
}

/// Rational modulo.
#[no_mangle]
#[export_name = "mod"]
pub unsafe extern "C" fn rational_mod(
    num: i64,
    den: i64,
    n: i64,
    work_ptr: *mut i64,
    result_ptr: *mut i64,
) {
    if n == 0 {
        *result_ptr = num;
        *result_ptr.add(1) = den;
        return;
    }
    reduce(num, den, work_ptr);
    let rn = *work_ptr;
    let rd = *work_ptr.add(1);
    let floored = (rn / (rd * n)) * n * rd;
    let new_num = rn - floored;
    reduce(new_num, rd, result_ptr);
}

/// Sum array of rationals (stored as f64 pairs).
#[no_mangle]
pub unsafe extern "C" fn sumArray(rationals_ptr: *const f64, count: i32, result_ptr: *mut i64) {
    if count == 0 {
        *result_ptr = 0;
        *result_ptr.add(1) = 1;
        return;
    }
    let mut rn = *rationals_ptr as i64;
    let mut rd = *rationals_ptr.add(1) as i64;
    for i in 1..count as usize {
        let off = i * 2;
        let num = *rationals_ptr.add(off) as i64;
        let den = *rationals_ptr.add(off + 1) as i64;
        let g = gcd(rd, den);
        let d1 = rd / g;
        let d2 = den / g;
        let nn = rn * d2 + num * d1;
        let nd = rd * d2;
        if nd == 0 {
            rn = if nn > 0 {
                1
            } else if nn < 0 {
                -1
            } else {
                0
            };
            rd = 0;
        } else if nn == 0 {
            rn = 0;
            rd = 1;
        } else {
            let mut n2 = nn;
            let mut d3 = nd;
            if d3 < 0 {
                n2 = -n2;
                d3 = -d3;
            }
            let g2 = gcd(n2, d3);
            rn = n2 / g2;
            rd = d3 / g2;
        }
    }
    *result_ptr = rn;
    *result_ptr.add(1) = rd;
}

/// Product array of rationals.
#[no_mangle]
pub unsafe extern "C" fn productArray(rationals_ptr: *const f64, count: i32, result_ptr: *mut i64) {
    if count == 0 {
        *result_ptr = 1;
        *result_ptr.add(1) = 1;
        return;
    }
    let mut rn = *rationals_ptr as i64;
    let mut rd = *rationals_ptr.add(1) as i64;
    for i in 1..count as usize {
        let off = i * 2;
        let num = *rationals_ptr.add(off) as i64;
        let den = *rationals_ptr.add(off + 1) as i64;
        let g1 = gcd(rn, den);
        let g2 = gcd(num, rd);
        let nn = (rn / g1) * (num / g2);
        let nd = (rd / g2) * (den / g1);
        if nd == 0 {
            rn = if nn > 0 {
                1
            } else if nn < 0 {
                -1
            } else {
                0
            };
            rd = 0;
        } else if nn == 0 {
            rn = 0;
            rd = 1;
        } else {
            let mut n2 = nn;
            let mut d3 = nd;
            if d3 < 0 {
                n2 = -n2;
                d3 = -d3;
            }
            let g3 = gcd(n2, d3);
            rn = n2 / g3;
            rd = d3 / g3;
        }
    }
    *result_ptr = rn;
    *result_ptr.add(1) = rd;
}

/// To continued fraction.
#[no_mangle]
pub unsafe extern "C" fn toContinuedFraction(
    mut num: i64,
    mut den: i64,
    max_terms: i32,
    result_ptr: *mut i32,
) -> i32 {
    let mut count = 0_i32;
    if den < 0 {
        num = -num;
        den = -den;
    }
    while den != 0 && count < max_terms {
        let q = num / den;
        *result_ptr.add(count as usize) = q as i32;
        count += 1;
        let r = num - q * den;
        num = den;
        den = r;
    }
    count
}

/// From continued fraction.
#[no_mangle]
pub unsafe extern "C" fn fromContinuedFraction(
    terms_ptr: *const i32,
    n: i32,
    result_ptr: *mut i64,
) {
    if n == 0 {
        *result_ptr = 0;
        *result_ptr.add(1) = 1;
        return;
    }
    let (mut h0, mut h1): (i64, i64) = (1, *terms_ptr as i64);
    let (mut k0, mut k1): (i64, i64) = (0, 1);
    for i in 1..n as usize {
        let a = *terms_ptr.add(i) as i64;
        let h2 = a * h1 + h0;
        let k2 = a * k1 + k0;
        h0 = h1;
        h1 = h2;
        k0 = k1;
        k1 = k2;
    }
    reduce(h1, k1, result_ptr);
}

/// Mediant of two fractions.
#[no_mangle]
pub unsafe extern "C" fn mediant(num1: i64, den1: i64, num2: i64, den2: i64, result_ptr: *mut i64) {
    reduce(num1 + num2, den1 + den2, result_ptr);
}

/// Best rational approximation (Stern-Brocot).
#[no_mangle]
pub unsafe extern "C" fn bestApproximation(mut value: f64, max_denom: i64, result_ptr: *mut i64) {
    if !value.is_finite() {
        *result_ptr = if value > 0.0 {
            1
        } else if value < 0.0 {
            -1
        } else {
            0
        };
        *result_ptr.add(1) = 0;
        return;
    }
    let neg = value < 0.0;
    if neg {
        value = -value;
    }
    let (mut a_n, mut a_d): (i64, i64) = (0, 1);
    let (mut b_n, mut b_d): (i64, i64) = (1, 0);
    loop {
        let mn = a_n + b_n;
        let md = a_d + b_d;
        if md > max_denom {
            break;
        }
        let mv = mn as f64 / md as f64;
        if libm::fabs(mv - value) < 1e-15 {
            *result_ptr = if neg { -mn } else { mn };
            *result_ptr.add(1) = md;
            return;
        }
        if mv < value {
            a_n = mn;
            a_d = md;
        } else {
            b_n = mn;
            b_d = md;
        }
    }
    let ae = libm::fabs(a_n as f64 / a_d as f64 - value);
    let be = if b_d > 0 {
        libm::fabs(b_n as f64 / b_d as f64 - value)
    } else {
        f64::INFINITY
    };
    if ae <= be {
        *result_ptr = if neg { -a_n } else { a_n };
        *result_ptr.add(1) = a_d;
    } else {
        *result_ptr = if neg { -b_n } else { b_n };
        *result_ptr.add(1) = b_d;
    }
}

// ===== f64 variants =====

/// GCD (f64 version).
#[no_mangle]
pub extern "C" fn gcdF64(mut a: f64, mut b: f64) -> f64 {
    a = libm::fabs(libm::floor(a));
    b = libm::fabs(libm::floor(b));
    if a == 0.0 {
        return b;
    }
    if b == 0.0 {
        return a;
    }
    while b != 0.0 {
        let t = b;
        b = libm::fmod(a, b);
        a = t;
    }
    a
}

/// LCM (f64 version).
#[no_mangle]
pub extern "C" fn lcmF64(a: f64, b: f64) -> f64 {
    let a = libm::fabs(libm::floor(a));
    let b = libm::fabs(libm::floor(b));
    if a == 0.0 || b == 0.0 {
        return 0.0;
    }
    let g = gcdF64(a, b);
    (a / g) * b
}

/// Reduce (f64 version).
#[no_mangle]
pub unsafe extern "C" fn reduceF64(mut num: f64, mut den: f64, result_ptr: *mut f64) {
    num = libm::floor(num);
    den = libm::floor(den);
    if den == 0.0 {
        *result_ptr = if num > 0.0 {
            1.0
        } else if num < 0.0 {
            -1.0
        } else {
            0.0
        };
        *result_ptr.add(1) = 0.0;
        return;
    }
    if num == 0.0 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 1.0;
        return;
    }
    if den < 0.0 {
        num = -num;
        den = -den;
    }
    let g = gcdF64(if num < 0.0 { -num } else { num }, den);
    *result_ptr = num / g;
    *result_ptr.add(1) = den / g;
}

/// Add (f64 version).
#[no_mangle]
pub unsafe extern "C" fn addF64(num1: f64, den1: f64, num2: f64, den2: f64, result_ptr: *mut f64) {
    let g = gcdF64(den1, den2);
    let d1 = den1 / g;
    let d2 = den2 / g;
    reduceF64(num1 * d2 + num2 * d1, den1 * d2, result_ptr);
}

/// Multiply (f64 version).
#[no_mangle]
pub unsafe extern "C" fn multiplyF64(
    num1: f64,
    den1: f64,
    num2: f64,
    den2: f64,
    result_ptr: *mut f64,
) {
    let g1 = gcdF64(libm::fabs(num1), libm::fabs(den2));
    let g2 = gcdF64(libm::fabs(num2), libm::fabs(den1));
    reduceF64(
        (num1 / g1) * (num2 / g2),
        (den1 / g2) * (den2 / g1),
        result_ptr,
    );
}

/// Compare (f64 version).
#[no_mangle]
pub extern "C" fn compareF64(mut num1: f64, mut den1: f64, mut num2: f64, mut den2: f64) -> i32 {
    if den1 == 0.0 && den2 == 0.0 {
        return if num1 == num2 {
            0
        } else if num1 > num2 {
            1
        } else {
            -1
        };
    }
    if den1 == 0.0 {
        return if num1 >= 0.0 { 1 } else { -1 };
    }
    if den2 == 0.0 {
        return if num2 >= 0.0 { -1 } else { 1 };
    }
    if den1 < 0.0 {
        num1 = -num1;
        den1 = -den1;
    }
    if den2 < 0.0 {
        num2 = -num2;
        den2 = -den2;
    }
    let lhs = num1 * den2;
    let rhs = num2 * den1;
    if lhs < rhs {
        -1
    } else if lhs > rhs {
        1
    } else {
        0
    }
}

/// fromFloat (f64 version via Stern-Brocot).
#[no_mangle]
pub unsafe extern "C" fn fromFloatF64(mut value: f64, max_denom: f64, result_ptr: *mut f64) {
    if !value.is_finite() {
        *result_ptr = if value > 0.0 {
            1.0
        } else if value < 0.0 {
            -1.0
        } else {
            0.0
        };
        *result_ptr.add(1) = 0.0;
        return;
    }
    let neg = value < 0.0;
    if neg {
        value = -value;
    }
    let (mut a_n, mut a_d) = (0.0_f64, 1.0_f64);
    let (mut b_n, mut b_d) = (1.0_f64, 0.0_f64);
    loop {
        let mn = a_n + b_n;
        let md = a_d + b_d;
        if md > max_denom {
            break;
        }
        let mv = mn / md;
        if libm::fabs(mv - value) < 1e-15 {
            *result_ptr = if neg { -mn } else { mn };
            *result_ptr.add(1) = md;
            return;
        }
        if mv < value {
            a_n = mn;
            a_d = md;
        } else {
            b_n = mn;
            b_d = md;
        }
    }
    let ae = libm::fabs(a_n / a_d - value);
    let be = if b_d > 0.0 {
        libm::fabs(b_n / b_d - value)
    } else {
        f64::INFINITY
    };
    if ae <= be {
        *result_ptr = if neg { -a_n } else { a_n };
        *result_ptr.add(1) = a_d;
    } else {
        *result_ptr = if neg { -b_n } else { b_n };
        *result_ptr.add(1) = b_d;
    }
}
