//! Polynomial operations: evaluation, root-finding, derivative, multiply, divide.
//!
//! Polynomials are represented as coefficient arrays [a0, a1, a2, ...]
//! where p(x) = a0 + a1*x + a2*x^2 + ...

use core::f64::consts::PI;

// ============================================
// POLYNOMIAL EVALUATION (Horner's method)
// ============================================

/// Evaluate polynomial at x using Horner's method.
#[no_mangle]
pub unsafe extern "C" fn polyEval(coeffs_ptr: *const f64, n: i32, x: f64) -> f64 {
    let n = n as usize;
    if n == 0 {
        return 0.0;
    }
    let mut result = *coeffs_ptr.add(n - 1);
    for ii in 1..n {
        let i = n - 1 - ii;
        result = result * x + *coeffs_ptr.add(i);
    }
    result
}

/// Evaluate polynomial and its derivative at x.
/// resultPtr: [p(x), p'(x)].
#[no_mangle]
pub unsafe extern "C" fn polyEvalWithDerivative(
    coeffs_ptr: *const f64,
    n: i32,
    x: f64,
    result_ptr: *mut f64,
) {
    let n = n as usize;
    if n == 0 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 0.0;
        return;
    }
    if n == 1 {
        *result_ptr = *coeffs_ptr;
        *result_ptr.add(1) = 0.0;
        return;
    }

    let mut p = *coeffs_ptr.add(n - 1);
    let mut dp: f64 = 0.0;

    for ii in 1..n {
        let i = n - 1 - ii;
        dp = dp * x + p;
        p = p * x + *coeffs_ptr.add(i);
    }

    *result_ptr = p;
    *result_ptr.add(1) = dp;
}

// ============================================
// QUADRATIC ROOTS
// ============================================

/// Find roots of ax^2 + bx + c = 0.
/// resultPtr: [real1, imag1, real2, imag2].
#[no_mangle]
pub unsafe extern "C" fn quadraticRoots(a: f64, b: f64, c: f64, result_ptr: *mut f64) {
    if libm::fabs(a) < 1e-14 {
        if libm::fabs(b) < 1e-14 {
            *result_ptr = f64::NAN;
            *result_ptr.add(1) = 0.0;
            *result_ptr.add(2) = f64::NAN;
            *result_ptr.add(3) = 0.0;
            return;
        }
        let root = -c / b;
        *result_ptr = root;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = root;
        *result_ptr.add(3) = 0.0;
        return;
    }

    let disc = b * b - 4.0 * a * c;

    if disc >= 0.0 {
        let sqrt_d = libm::sqrt(disc);
        let sign_b = if b >= 0.0 { 1.0 } else { -1.0 };
        let q = -0.5 * (b + sign_b * sqrt_d);
        *result_ptr = q / a;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = c / q;
        *result_ptr.add(3) = 0.0;
    } else {
        let real_part = -b / (2.0 * a);
        let imag_part = libm::sqrt(-disc) / (2.0 * a);
        *result_ptr = real_part;
        *result_ptr.add(1) = imag_part;
        *result_ptr.add(2) = real_part;
        *result_ptr.add(3) = -imag_part;
    }
}

// ============================================
// CUBIC ROOTS (Cardano's formula)
// ============================================

/// Find roots of ax^3 + bx^2 + cx + d = 0.
/// resultPtr: [real1, imag1, real2, imag2, real3, imag3].
#[no_mangle]
pub unsafe extern "C" fn cubicRoots(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    if libm::fabs(a) < 1e-14 {
        quadraticRoots(b, c, d, work_ptr);
        for i in 0..4 {
            *result_ptr.add(i) = *work_ptr.add(i);
        }
        *result_ptr.add(4) = f64::NAN;
        *result_ptr.add(5) = 0.0;
        return;
    }

    let p = b / a;
    let q = c / a;
    let r = d / a;

    let p2 = p * p;
    let pp = (3.0 * q - p2) / 3.0;
    let qq = (2.0 * p2 * p - 9.0 * p * q + 27.0 * r) / 27.0;

    let disc = (qq * qq) / 4.0 + (pp * pp * pp) / 27.0;
    let shift = -p / 3.0;

    if disc > 1e-14 {
        let sqrt_d = libm::sqrt(disc);
        let u = libm::cbrt(-qq / 2.0 + sqrt_d);
        let v = libm::cbrt(-qq / 2.0 - sqrt_d);

        *result_ptr = u + v + shift;
        *result_ptr.add(1) = 0.0;

        let real_part = -(u + v) / 2.0 + shift;
        let imag_part = (libm::sqrt(3.0) * (u - v)) / 2.0;

        *result_ptr.add(2) = real_part;
        *result_ptr.add(3) = imag_part;
        *result_ptr.add(4) = real_part;
        *result_ptr.add(5) = -imag_part;
    } else if disc < -1e-14 {
        let m = 2.0 * libm::sqrt(-pp / 3.0);
        let theta = libm::acos((3.0 * qq) / (pp * m)) / 3.0;

        *result_ptr = m * libm::cos(theta) + shift;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = m * libm::cos(theta - 2.0 * PI / 3.0) + shift;
        *result_ptr.add(3) = 0.0;
        *result_ptr.add(4) = m * libm::cos(theta - 4.0 * PI / 3.0) + shift;
        *result_ptr.add(5) = 0.0;
    } else {
        if libm::fabs(qq) < 1e-14 {
            for i in 0..3 {
                *result_ptr.add(i * 2) = shift;
                *result_ptr.add(i * 2 + 1) = 0.0;
            }
        } else {
            let u = libm::cbrt(-qq / 2.0);
            *result_ptr = 2.0 * u + shift;
            *result_ptr.add(1) = 0.0;
            *result_ptr.add(2) = -u + shift;
            *result_ptr.add(3) = 0.0;
            *result_ptr.add(4) = -u + shift;
            *result_ptr.add(5) = 0.0;
        }
    }
}

// ============================================
// QUARTIC ROOTS (Ferrari's method)
// ============================================

/// Find roots of ax^4 + bx^3 + cx^2 + dx + e = 0.
/// resultPtr: [real1, imag1, ..., real4, imag4] (8 f64).
#[no_mangle]
pub unsafe extern "C" fn quarticRoots(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    e: f64,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    if libm::fabs(a) < 1e-14 {
        cubicRoots(b, c, d, e, work_ptr, work_ptr.add(48 / 8));
        for i in 0..6 {
            *result_ptr.add(i) = *work_ptr.add(i);
        }
        *result_ptr.add(6) = f64::NAN;
        *result_ptr.add(7) = 0.0;
        return;
    }

    let p = b / a;
    let q = c / a;
    let r = d / a;
    let s = e / a;

    let p2 = p * p;
    let alpha = q - (3.0 * p2) / 8.0;
    let beta = r - (p * q) / 2.0 + (p2 * p) / 8.0;
    let gamma = s - (p * r) / 4.0 + (p2 * q) / 16.0 - (3.0 * p2 * p2) / 256.0;
    let shift = -p / 4.0;

    if libm::fabs(beta) < 1e-14 {
        // Biquadratic
        quadraticRoots(1.0, alpha, gamma, work_ptr);
        let u1 = *work_ptr;
        let u1i = *work_ptr.add(1);
        let u2 = *work_ptr.add(2);
        let u2i = *work_ptr.add(3);

        // Roots from u1
        if u1i == 0.0 && u1 >= 0.0 {
            let sq = libm::sqrt(u1);
            *result_ptr = sq + shift;
            *result_ptr.add(1) = 0.0;
            *result_ptr.add(2) = -sq + shift;
            *result_ptr.add(3) = 0.0;
        } else if u1i == 0.0 {
            let sq = libm::sqrt(-u1);
            *result_ptr = shift;
            *result_ptr.add(1) = sq;
            *result_ptr.add(2) = shift;
            *result_ptr.add(3) = -sq;
        } else {
            let mag = libm::sqrt(u1 * u1 + u1i * u1i);
            let ang = libm::atan2(u1i, u1);
            let sqrt_mag = libm::sqrt(mag);
            *result_ptr = sqrt_mag * libm::cos(ang / 2.0) + shift;
            *result_ptr.add(1) = sqrt_mag * libm::sin(ang / 2.0);
            *result_ptr.add(2) = -sqrt_mag * libm::cos(ang / 2.0) + shift;
            *result_ptr.add(3) = -sqrt_mag * libm::sin(ang / 2.0);
        }

        // Roots from u2
        if u2i == 0.0 && u2 >= 0.0 {
            let sq = libm::sqrt(u2);
            *result_ptr.add(4) = sq + shift;
            *result_ptr.add(5) = 0.0;
            *result_ptr.add(6) = -sq + shift;
            *result_ptr.add(7) = 0.0;
        } else if u2i == 0.0 {
            let sq = libm::sqrt(-u2);
            *result_ptr.add(4) = shift;
            *result_ptr.add(5) = sq;
            *result_ptr.add(6) = shift;
            *result_ptr.add(7) = -sq;
        } else {
            let mag = libm::sqrt(u2 * u2 + u2i * u2i);
            let ang = libm::atan2(u2i, u2);
            let sqrt_mag = libm::sqrt(mag);
            *result_ptr.add(4) = sqrt_mag * libm::cos(ang / 2.0) + shift;
            *result_ptr.add(5) = sqrt_mag * libm::sin(ang / 2.0);
            *result_ptr.add(6) = -sqrt_mag * libm::cos(ang / 2.0) + shift;
            *result_ptr.add(7) = -sqrt_mag * libm::sin(ang / 2.0);
        }
    } else {
        // Ferrari: resolvent cubic
        cubicRoots(
            8.0,
            -4.0 * alpha,
            -8.0 * gamma,
            4.0 * alpha * gamma - beta * beta,
            work_ptr,
            work_ptr.add(6),
        );

        let mut y = *work_ptr;
        let c1i = *work_ptr.add(1);
        let c2r = *work_ptr.add(2);
        let c2i = *work_ptr.add(3);
        let c3r = *work_ptr.add(4);
        let c3i = *work_ptr.add(5);

        if c1i == 0.0 && c2i == 0.0 && libm::fabs(c2r) > libm::fabs(y) {
            y = c2r;
        }
        if c3i == 0.0 && libm::fabs(c3r) > libm::fabs(y) {
            y = c3r;
        }

        let w = 2.0 * y - alpha;
        if w >= 0.0 {
            let sqrt_w = libm::sqrt(w);
            quadraticRoots(1.0, sqrt_w, y + beta / (2.0 * sqrt_w), work_ptr);
            *result_ptr = *work_ptr + shift;
            *result_ptr.add(1) = *work_ptr.add(1);
            *result_ptr.add(2) = *work_ptr.add(2) + shift;
            *result_ptr.add(3) = *work_ptr.add(3);

            quadraticRoots(1.0, -sqrt_w, y - beta / (2.0 * sqrt_w), work_ptr);
            *result_ptr.add(4) = *work_ptr + shift;
            *result_ptr.add(5) = *work_ptr.add(1);
            *result_ptr.add(6) = *work_ptr.add(2) + shift;
            *result_ptr.add(7) = *work_ptr.add(3);
        } else {
            let sqrt_neg_w = libm::sqrt(-w);
            for i in 0..4 {
                *result_ptr.add(i * 2) = shift;
                *result_ptr.add(i * 2 + 1) = (sqrt_neg_w / 2.0) * if i < 2 { 1.0 } else { -1.0 };
            }
        }
    }
}

// ============================================
// GENERAL POLYNOMIAL ROOTS (Durand-Kerner)
// ============================================

/// Find all roots of polynomial using Durand-Kerner iteration.
/// rootsPtr: [real1, imag1, ...]. Returns number of roots (= degree).
#[no_mangle]
pub unsafe extern "C" fn polyRoots(
    coeffs_ptr: *const f64,
    n: i32,
    max_iter: i32,
    tol: f64,
    roots_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let degree = n - 1;

    if degree == 0 {
        return 0;
    }
    if degree == 1 {
        *roots_ptr = -*coeffs_ptr / *coeffs_ptr.add(1);
        *roots_ptr.add(1) = 0.0;
        return 1;
    }
    if degree == 2 {
        quadraticRoots(
            *coeffs_ptr.add(2),
            *coeffs_ptr.add(1),
            *coeffs_ptr,
            roots_ptr,
        );
        return 2;
    }
    if degree == 3 {
        cubicRoots(
            *coeffs_ptr.add(3),
            *coeffs_ptr.add(2),
            *coeffs_ptr.add(1),
            *coeffs_ptr,
            roots_ptr,
            work_ptr,
        );
        return 3;
    }
    if degree == 4 {
        quarticRoots(
            *coeffs_ptr.add(4),
            *coeffs_ptr.add(3),
            *coeffs_ptr.add(2),
            *coeffs_ptr.add(1),
            *coeffs_ptr,
            roots_ptr,
            work_ptr,
        );
        return 4;
    }

    // Normalize polynomial
    let an = *coeffs_ptr.add(degree);
    let norm_coeffs = work_ptr;
    for i in 0..n {
        *norm_coeffs.add(i) = *coeffs_ptr.add(i) / an;
    }

    // Initialize roots on a circle
    let radius = 1.0 + libm::fabs(*norm_coeffs.add(degree - 1));
    for i in 0..degree {
        let angle = 2.0 * PI * (i as f64) / (degree as f64) + 0.1;
        *roots_ptr.add(i * 2) = radius * libm::cos(angle);
        *roots_ptr.add(i * 2 + 1) = radius * libm::sin(angle);
    }

    // Durand-Kerner iteration
    for _iter in 0..max_iter as usize {
        let mut max_delta: f64 = 0.0;

        for i in 0..degree {
            let zi_re = *roots_ptr.add(i * 2);
            let zi_im = *roots_ptr.add(i * 2 + 1);

            // p(zi) via Horner
            let mut p_re = *norm_coeffs.add(degree);
            let mut p_im: f64 = 0.0;

            for jj in 1..n {
                let j = degree - jj;
                let temp_re = p_re * zi_re - p_im * zi_im;
                let temp_im = p_re * zi_im + p_im * zi_re;
                p_re = temp_re + *norm_coeffs.add(j);
                p_im = temp_im;
            }

            // Product of (zi - zj)
            let mut prod_re: f64 = 1.0;
            let mut prod_im: f64 = 0.0;

            for j in 0..degree {
                if j != i {
                    let diff_re = zi_re - *roots_ptr.add(j * 2);
                    let diff_im = zi_im - *roots_ptr.add(j * 2 + 1);
                    let new_re = prod_re * diff_re - prod_im * diff_im;
                    let new_im = prod_re * diff_im + prod_im * diff_re;
                    prod_re = new_re;
                    prod_im = new_im;
                }
            }

            let denom = prod_re * prod_re + prod_im * prod_im;
            if denom < 1e-30 {
                continue;
            }

            let delta_re = (p_re * prod_re + p_im * prod_im) / denom;
            let delta_im = (p_im * prod_re - p_re * prod_im) / denom;

            *roots_ptr.add(i * 2) = zi_re - delta_re;
            *roots_ptr.add(i * 2 + 1) = zi_im - delta_im;

            let delta_mag = libm::sqrt(delta_re * delta_re + delta_im * delta_im);
            if delta_mag > max_delta {
                max_delta = delta_mag;
            }
        }

        if max_delta < tol {
            break;
        }
    }

    // Clean up near-real roots
    for i in 0..degree {
        let imag = *roots_ptr.add(i * 2 + 1);
        if libm::fabs(imag) < tol {
            *roots_ptr.add(i * 2 + 1) = 0.0;
        }
    }

    degree as i32
}

// ============================================
// POLYNOMIAL DERIVATIVE
// ============================================

/// Compute derivative of polynomial. Returns number of output coefficients.
#[no_mangle]
pub unsafe extern "C" fn polyDerivative(
    coeffs_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    if n <= 1 {
        *result_ptr = 0.0;
        return 1;
    }
    for i in 1..n {
        *result_ptr.add(i - 1) = (i as f64) * *coeffs_ptr.add(i);
    }
    (n - 1) as i32
}

// ============================================
// POLYNOMIAL MULTIPLICATION
// ============================================

/// Multiply two polynomials. Returns length of result (na + nb - 1).
#[no_mangle]
pub unsafe extern "C" fn polyMultiply(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    result_ptr: *mut f64,
) -> i32 {
    let na = na as usize;
    let nb = nb as usize;
    let nc = na + nb - 1;

    for i in 0..nc {
        *result_ptr.add(i) = 0.0;
    }

    for i in 0..na {
        let ai = *a_ptr.add(i);
        for j in 0..nb {
            *result_ptr.add(i + j) += ai * *b_ptr.add(j);
        }
    }

    nc as i32
}

// ============================================
// POLYNOMIAL DIVISION
// ============================================

/// Divide polynomial a by b: a = b * quot + rem.
/// Returns length of quotient, or 0 if cannot divide.
#[no_mangle]
pub unsafe extern "C" fn polyDivide(
    a_ptr: *const f64,
    na: i32,
    b_ptr: *const f64,
    nb: i32,
    quot_ptr: *mut f64,
    rem_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let na = na as usize;
    let nb = nb as usize;

    if nb > na || nb == 0 {
        return 0;
    }

    let nq = na - nb + 1;
    let nr = nb - 1;

    // Copy a to work (remainder)
    for i in 0..na {
        *work_ptr.add(i) = *a_ptr.add(i);
    }

    for i in 0..nq {
        *quot_ptr.add(i) = 0.0;
    }

    let bn = *b_ptr.add(nb - 1);

    for ii in 0..nq {
        let i = na - 1 - ii;
        let q = *work_ptr.add(i) / bn;
        *quot_ptr.add(i - nb + 1) = q;

        for j in 0..nb {
            let idx = i - nb + 1 + j;
            *work_ptr.add(idx) -= q * *b_ptr.add(j);
        }
    }

    for i in 0..nr {
        *rem_ptr.add(i) = *work_ptr.add(i);
    }

    nq as i32
}
