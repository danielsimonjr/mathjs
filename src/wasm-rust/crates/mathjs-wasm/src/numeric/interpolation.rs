//! Interpolation algorithms: linear, Lagrange, Newton, cubic spline, Hermite, etc.

/// Simple linear interpolation between two points.
#[no_mangle]
pub extern "C" fn linearInterp(x0: f64, y0: f64, x1: f64, y1: f64, x: f64) -> f64 {
    if x1 == x0 {
        return y0;
    }
    let t = (x - x0) / (x1 - x0);
    y0 + t * (y1 - y0)
}

/// Linear interpolation in a table (binary search).
#[no_mangle]
pub unsafe extern "C" fn linearInterpTable(
    x_ptr: *const f64,
    y_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    if n < 2 {
        return *y_ptr;
    }
    let x0 = *x_ptr;
    let xn = *x_ptr.add(n - 1);
    if x <= x0 {
        return linearInterp(x0, *y_ptr, *x_ptr.add(1), *y_ptr.add(1), x);
    }
    if x >= xn {
        return linearInterp(
            *x_ptr.add(n - 2),
            *y_ptr.add(n - 2),
            xn,
            *y_ptr.add(n - 1),
            x,
        );
    }
    let mut lo = 0_usize;
    let mut hi = n - 1;
    while hi - lo > 1 {
        let mid = (lo + hi) >> 1;
        if *x_ptr.add(mid) > x {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    linearInterp(
        *x_ptr.add(lo),
        *y_ptr.add(lo),
        *x_ptr.add(hi),
        *y_ptr.add(hi),
        x,
    )
}

/// Bilinear interpolation on a 2D grid.
#[no_mangle]
pub extern "C" fn bilinearInterp(
    x1: f64,
    x2: f64,
    y1: f64,
    y2: f64,
    q11: f64,
    q12: f64,
    q21: f64,
    q22: f64,
    x: f64,
    y: f64,
) -> f64 {
    let denom = (x2 - x1) * (y2 - y1);
    if denom == 0.0 {
        return q11;
    }
    let t1 = (x2 - x) * (y2 - y) * q11;
    let t2 = (x - x1) * (y2 - y) * q21;
    let t3 = (x2 - x) * (y - y1) * q12;
    let t4 = (x - x1) * (y - y1) * q22;
    (t1 + t2 + t3 + t4) / denom
}

/// Lagrange polynomial interpolation.
#[no_mangle]
pub unsafe extern "C" fn lagrangeInterp(
    x_ptr: *const f64,
    y_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    let mut result = 0.0_f64;
    for i in 0..n {
        let mut term = *y_ptr.add(i);
        let xi = *x_ptr.add(i);
        for j in 0..n {
            if j != i {
                let xj = *x_ptr.add(j);
                term = (term * (x - xj)) / (xi - xj);
            }
        }
        result += term;
    }
    result
}

/// Lagrange basis polynomial L_i(x).
#[no_mangle]
pub unsafe extern "C" fn lagrangeBasis(x_ptr: *const f64, i: i32, x: f64, n: i32) -> f64 {
    let n = n as usize;
    let i = i as usize;
    let mut result = 1.0_f64;
    let xi = *x_ptr.add(i);
    for j in 0..n {
        if j != i {
            let xj = *x_ptr.add(j);
            result *= (x - xj) / (xi - xj);
        }
    }
    result
}

/// Newton's divided differences.
#[no_mangle]
pub unsafe extern "C" fn dividedDifferences(
    x_ptr: *const f64,
    y_ptr: *const f64,
    n: i32,
    coeffs_ptr: *mut f64,
) {
    let n = n as usize;
    for i in 0..n {
        *coeffs_ptr.add(i) = *y_ptr.add(i);
    }
    for j in 1..n {
        let mut i = n - 1;
        while i >= j {
            let xi = *x_ptr.add(i);
            let xij = *x_ptr.add(i - j);
            let ci = *coeffs_ptr.add(i);
            let cim1 = *coeffs_ptr.add(i - 1);
            *coeffs_ptr.add(i) = (ci - cim1) / (xi - xij);
            if i == j {
                break;
            }
            i -= 1;
        }
    }
}

/// Newton interpolation using Horner's method.
#[no_mangle]
pub unsafe extern "C" fn newtonInterp(
    x_ptr: *const f64,
    coeffs_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    let mut result = *coeffs_ptr.add(n - 1);
    if n >= 2 {
        let mut i = n - 2;
        loop {
            result = result * (x - *x_ptr.add(i)) + *coeffs_ptr.add(i);
            if i == 0 {
                break;
            }
            i -= 1;
        }
    }
    result
}

/// Combined Newton interpolation.
#[no_mangle]
pub unsafe extern "C" fn newtonInterpFull(
    x_ptr: *const f64,
    y_ptr: *const f64,
    x: f64,
    n: i32,
    work_ptr: *mut f64,
) -> f64 {
    dividedDifferences(x_ptr, y_ptr, n, work_ptr);
    newtonInterp(x_ptr, work_ptr, x, n)
}

/// Barycentric weights.
#[no_mangle]
pub unsafe extern "C" fn barycentricWeights(x_ptr: *const f64, n: i32, weights_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let mut w = 1.0_f64;
        let xi = *x_ptr.add(i);
        for j in 0..n {
            if j != i {
                w /= xi - *x_ptr.add(j);
            }
        }
        *weights_ptr.add(i) = w;
    }
}

/// Barycentric interpolation.
#[no_mangle]
pub unsafe extern "C" fn barycentricInterp(
    x_ptr: *const f64,
    y_ptr: *const f64,
    weights_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    for i in 0..n {
        if x == *x_ptr.add(i) {
            return *y_ptr.add(i);
        }
    }
    let mut num = 0.0_f64;
    let mut den = 0.0_f64;
    for i in 0..n {
        let diff = x - *x_ptr.add(i);
        let term = *weights_ptr.add(i) / diff;
        num += term * *y_ptr.add(i);
        den += term;
    }
    num / den
}

/// Natural cubic spline coefficients.
#[no_mangle]
pub unsafe extern "C" fn naturalCubicSplineCoeffs(
    x_ptr: *const f64,
    y_ptr: *const f64,
    n: i32,
    coeffs_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    if n < 2 {
        *coeffs_ptr = *y_ptr;
        return;
    }
    let seg = n - 1;
    let h_p = work_ptr;
    let l_p = work_ptr.add(n * 2);
    let mu_p = work_ptr.add(n * 3);
    let z_p = work_ptr.add(n * 4);
    let c_p = work_ptr.add(n * 5);

    for i in 0..seg {
        *h_p.add(i) = *x_ptr.add(i + 1) - *x_ptr.add(i);
    }

    *l_p = 1.0;
    *mu_p = 0.0;
    *z_p = 0.0;
    for i in 1..seg {
        let hi = *h_p.add(i);
        let him1 = *h_p.add(i - 1);
        let yi = *y_ptr.add(i);
        let yip1 = *y_ptr.add(i + 1);
        let yim1 = *y_ptr.add(i - 1);
        let alpha = (3.0 / hi) * (yip1 - yi) - (3.0 / him1) * (yi - yim1);
        let xip1 = *x_ptr.add(i + 1);
        let xim1 = *x_ptr.add(i - 1);
        let l = 2.0 * (xip1 - xim1) - him1 * *mu_p.add(i - 1);
        *l_p.add(i) = l;
        *mu_p.add(i) = hi / l;
        *z_p.add(i) = (alpha - him1 * *z_p.add(i - 1)) / l;
    }
    *l_p.add(n - 1) = 1.0;
    *z_p.add(n - 1) = 0.0;
    *c_p.add(n - 1) = 0.0;

    let mut j = seg as isize - 1;
    while j >= 0 {
        let ju = j as usize;
        *c_p.add(ju) = *z_p.add(ju) - *mu_p.add(ju) * *c_p.add(ju + 1);
        j -= 1;
    }

    for i in 0..seg {
        let hi = *h_p.add(i);
        let yi = *y_ptr.add(i);
        let yip1 = *y_ptr.add(i + 1);
        let ci = *c_p.add(i);
        let cip1 = *c_p.add(i + 1);
        let a = yi;
        let b = (yip1 - yi) / hi - (hi * (cip1 + 2.0 * ci)) / 3.0;
        let d = (cip1 - ci) / (3.0 * hi);
        let base = i * 4;
        *coeffs_ptr.add(base) = a;
        *coeffs_ptr.add(base + 1) = b;
        *coeffs_ptr.add(base + 2) = ci;
        *coeffs_ptr.add(base + 3) = d;
    }
}

/// Clamped cubic spline coefficients.
#[no_mangle]
pub unsafe extern "C" fn clampedCubicSplineCoeffs(
    x_ptr: *const f64,
    y_ptr: *const f64,
    n: i32,
    fp0: f64,
    fpn: f64,
    coeffs_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    if n < 2 {
        *coeffs_ptr = *y_ptr;
        *coeffs_ptr.add(1) = fp0;
        return;
    }
    let seg = n - 1;
    let h_p = work_ptr;
    let alpha_p = work_ptr.add(n);
    let l_p = work_ptr.add(n * 2);
    let mu_p = work_ptr.add(n * 3);
    let z_p = work_ptr.add(n * 4);
    let c_p = work_ptr.add(n * 5);

    for i in 0..seg {
        *h_p.add(i) = *x_ptr.add(i + 1) - *x_ptr.add(i);
    }

    let h0 = *h_p;
    *alpha_p = (3.0 * (*y_ptr.add(1) - *y_ptr)) / h0 - 3.0 * fp0;
    let hsm1 = *h_p.add(seg - 1);
    *alpha_p.add(n - 1) = 3.0 * fpn - (3.0 * (*y_ptr.add(n - 1) - *y_ptr.add(n - 2))) / hsm1;

    for i in 1..seg {
        let hi = *h_p.add(i);
        let him1 = *h_p.add(i - 1);
        *alpha_p.add(i) = (3.0 / hi) * (*y_ptr.add(i + 1) - *y_ptr.add(i))
            - (3.0 / him1) * (*y_ptr.add(i) - *y_ptr.add(i - 1));
    }

    *l_p = 2.0 * h0;
    *mu_p = 0.5;
    *z_p = *alpha_p / *l_p;

    for i in 1..seg {
        let hi = *h_p.add(i);
        let him1 = *h_p.add(i - 1);
        let l = 2.0 * (*x_ptr.add(i + 1) - *x_ptr.add(i - 1)) - him1 * *mu_p.add(i - 1);
        *l_p.add(i) = l;
        *mu_p.add(i) = hi / l;
        *z_p.add(i) = (*alpha_p.add(i) - him1 * *z_p.add(i - 1)) / l;
    }

    *l_p.add(n - 1) = hsm1 * (2.0 - *mu_p.add(seg - 1));
    *z_p.add(n - 1) = (*alpha_p.add(n - 1) - hsm1 * *z_p.add(seg - 1)) / *l_p.add(n - 1);
    *c_p.add(n - 1) = *z_p.add(n - 1);

    let mut j = seg as isize - 1;
    while j >= 0 {
        let ju = j as usize;
        *c_p.add(ju) = *z_p.add(ju) - *mu_p.add(ju) * *c_p.add(ju + 1);
        j -= 1;
    }

    for i in 0..seg {
        let hi = *h_p.add(i);
        let yi = *y_ptr.add(i);
        let ci = *c_p.add(i);
        let cip1 = *c_p.add(i + 1);
        let base = i * 4;
        *coeffs_ptr.add(base) = yi;
        *coeffs_ptr.add(base + 1) = (*y_ptr.add(i + 1) - yi) / hi - (hi * (cip1 + 2.0 * ci)) / 3.0;
        *coeffs_ptr.add(base + 2) = ci;
        *coeffs_ptr.add(base + 3) = (cip1 - ci) / (3.0 * hi);
    }
}

/// Evaluate cubic spline at a point.
#[no_mangle]
pub unsafe extern "C" fn cubicSplineEval(
    x_ptr: *const f64,
    coeffs_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    let seg = n - 1;
    let mut s = 0_usize;
    if x <= *x_ptr {
        s = 0;
    } else if x >= *x_ptr.add(n - 1) {
        s = seg - 1;
    } else {
        let mut lo = 0_usize;
        let mut hi = seg;
        while hi - lo > 1 {
            let mid = (lo + hi) >> 1;
            if *x_ptr.add(mid) > x {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        s = lo;
    }
    let dx = x - *x_ptr.add(s);
    let base = s * 4;
    let a = *coeffs_ptr.add(base);
    let b = *coeffs_ptr.add(base + 1);
    let c = *coeffs_ptr.add(base + 2);
    let d = *coeffs_ptr.add(base + 3);
    a + dx * (b + dx * (c + dx * d))
}

/// Evaluate cubic spline derivative.
#[no_mangle]
pub unsafe extern "C" fn cubicSplineDerivative(
    x_ptr: *const f64,
    coeffs_ptr: *const f64,
    x: f64,
    n: i32,
) -> f64 {
    let n = n as usize;
    let seg = n - 1;
    let mut s = 0_usize;
    if x <= *x_ptr {
        s = 0;
    } else if x >= *x_ptr.add(n - 1) {
        s = seg - 1;
    } else {
        let mut lo = 0_usize;
        let mut hi = seg;
        while hi - lo > 1 {
            let mid = (lo + hi) >> 1;
            if *x_ptr.add(mid) > x {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        s = lo;
    }
    let dx = x - *x_ptr.add(s);
    let base = s * 4;
    let b = *coeffs_ptr.add(base + 1);
    let c = *coeffs_ptr.add(base + 2);
    let d = *coeffs_ptr.add(base + 3);
    b + dx * (2.0 * c + 3.0 * d * dx)
}

/// Hermite interpolation between two points with derivatives.
#[no_mangle]
pub extern "C" fn hermiteInterp(
    x0: f64,
    y0: f64,
    dy0: f64,
    x1: f64,
    y1: f64,
    dy1: f64,
    x: f64,
) -> f64 {
    let h = x1 - x0;
    if h == 0.0 {
        return y0;
    }
    let t = (x - x0) / h;
    let t2 = t * t;
    let t3 = t2 * t;
    let h00 = 2.0 * t3 - 3.0 * t2 + 1.0;
    let h10 = t3 - 2.0 * t2 + t;
    let h01 = -2.0 * t3 + 3.0 * t2;
    let h11 = t3 - t2;
    h00 * y0 + h10 * h * dy0 + h01 * y1 + h11 * h * dy1
}

/// PCHIP interpolation.
#[no_mangle]
pub unsafe extern "C" fn pchipInterp(
    x_ptr: *const f64,
    y_ptr: *const f64,
    x: f64,
    n: i32,
    work_ptr: *mut f64,
) -> f64 {
    let n = n as usize;
    if n < 2 {
        return *y_ptr;
    }
    // Compute slopes
    for i in 1..(n - 1) {
        let xi = *x_ptr.add(i);
        let h0 = xi - *x_ptr.add(i - 1);
        let h1 = *x_ptr.add(i + 1) - xi;
        let d0 = (*y_ptr.add(i) - *y_ptr.add(i - 1)) / h0;
        let d1 = (*y_ptr.add(i + 1) - *y_ptr.add(i)) / h1;
        if d0 * d1 > 0.0 {
            let w0 = 2.0 * h1 + h0;
            let w1 = h1 + 2.0 * h0;
            *work_ptr.add(i) = (w0 + w1) / (w0 / d0 + w1 / d1);
        } else {
            *work_ptr.add(i) = 0.0;
        }
    }
    *work_ptr = (*y_ptr.add(1) - *y_ptr) / (*x_ptr.add(1) - *x_ptr);
    *work_ptr.add(n - 1) =
        (*y_ptr.add(n - 1) - *y_ptr.add(n - 2)) / (*x_ptr.add(n - 1) - *x_ptr.add(n - 2));

    let mut seg = 0_usize;
    if x <= *x_ptr {
        seg = 0;
    } else if x >= *x_ptr.add(n - 1) {
        seg = n - 2;
    } else {
        let mut lo = 0_usize;
        let mut hi = n - 1;
        while hi - lo > 1 {
            let mid = (lo + hi) >> 1;
            if *x_ptr.add(mid) > x {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        seg = lo;
    }
    hermiteInterp(
        *x_ptr.add(seg),
        *y_ptr.add(seg),
        *work_ptr.add(seg),
        *x_ptr.add(seg + 1),
        *y_ptr.add(seg + 1),
        *work_ptr.add(seg + 1),
        x,
    )
}

/// Akima interpolation.
#[no_mangle]
pub unsafe extern "C" fn akimaInterp(
    x_ptr: *const f64,
    y_ptr: *const f64,
    x: f64,
    n: i32,
    work_ptr: *mut f64,
) -> f64 {
    let n = n as usize;
    if n < 2 {
        return *y_ptr;
    }
    if n < 5 {
        return pchipInterp(x_ptr, y_ptr, x, n as i32, work_ptr);
    }

    let m_p = work_ptr;
    let t_p = work_ptr.add(n + 3);

    for i in 0..(n - 1) {
        *m_p.add(i + 2) = (*y_ptr.add(i + 1) - *y_ptr.add(i)) / (*x_ptr.add(i + 1) - *x_ptr.add(i));
    }
    let m2 = *m_p.add(2);
    let m3 = *m_p.add(3);
    *m_p.add(1) = 2.0 * m2 - m3;
    *m_p = 2.0 * *m_p.add(1) - m2;
    let mn = *m_p.add(n);
    let mnm1 = *m_p.add(n - 1);
    *m_p.add(n + 1) = 2.0 * mn - mnm1;
    *m_p.add(n + 2) = 2.0 * *m_p.add(n + 1) - mn;

    for i in 0..n {
        let w1 = libm::fabs(*m_p.add(i + 3) - *m_p.add(i + 2));
        let w2 = libm::fabs(*m_p.add(i + 1) - *m_p.add(i));
        if w1 + w2 != 0.0 {
            *t_p.add(i) = (w1 * *m_p.add(i + 1) + w2 * *m_p.add(i + 2)) / (w1 + w2);
        } else {
            *t_p.add(i) = 0.5 * (*m_p.add(i + 1) + *m_p.add(i + 2));
        }
    }

    let mut seg = 0_usize;
    if x <= *x_ptr {
        seg = 0;
    } else if x >= *x_ptr.add(n - 1) {
        seg = n - 2;
    } else {
        let mut lo = 0_usize;
        let mut hi = n - 1;
        while hi - lo > 1 {
            let mid = (lo + hi) >> 1;
            if *x_ptr.add(mid) > x {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        seg = lo;
    }
    hermiteInterp(
        *x_ptr.add(seg),
        *y_ptr.add(seg),
        *t_p.add(seg),
        *x_ptr.add(seg + 1),
        *y_ptr.add(seg + 1),
        *t_p.add(seg + 1),
        x,
    )
}

/// Polynomial evaluation using Horner's method.
#[export_name = "interpPolyEval"]
pub unsafe extern "C" fn interp_poly_eval(coeffs_ptr: *const f64, x: f64, degree: i32) -> f64 {
    let degree = degree as usize;
    let mut result = *coeffs_ptr.add(degree);
    if degree >= 1 {
        let mut i = degree - 1;
        loop {
            result = result * x + *coeffs_ptr.add(i);
            if i == 0 {
                break;
            }
            i -= 1;
        }
    }
    result
}

/// Polynomial derivative evaluation.
#[export_name = "interpPolyDerivEval"]
pub unsafe extern "C" fn interp_poly_deriv_eval(
    coeffs_ptr: *const f64,
    x: f64,
    degree: i32,
) -> f64 {
    if degree < 1 {
        return 0.0;
    }
    let degree = degree as usize;
    let mut result = degree as f64 * *coeffs_ptr.add(degree);
    if degree >= 2 {
        let mut i = degree - 1;
        loop {
            if i == 0 {
                break;
            }
            result = result * x + i as f64 * *coeffs_ptr.add(i);
            if i == 1 {
                break;
            }
            i -= 1;
        }
    }
    result
}

/// Polynomial least-squares fit.
#[no_mangle]
pub unsafe extern "C" fn polyFit(
    x_ptr: *const f64,
    y_ptr: *const f64,
    n: i32,
    degree: i32,
    coeffs_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    let m = (degree + 1) as usize;
    let ata = work_ptr;
    let aty = work_ptr.add(m * m);

    for i in 0..(m * m) {
        *ata.add(i) = 0.0;
    }
    for i in 0..m {
        *aty.add(i) = 0.0;
    }

    for i in 0..n {
        let xi = *x_ptr.add(i);
        let yi = *y_ptr.add(i);
        let mut xpow_j = 1.0_f64;
        for j in 0..m {
            *aty.add(j) += xpow_j * yi;
            let mut xpow_k = xpow_j;
            for k in j..m {
                *ata.add(j * m + k) += xpow_k;
                if k != j {
                    *ata.add(k * m + j) = *ata.add(j * m + k);
                }
                xpow_k *= xi;
            }
            xpow_j *= xi;
        }
    }

    // Gaussian elimination with partial pivoting
    for k in 0..m {
        let mut max_val = libm::fabs(*ata.add(k * m + k));
        let mut max_row = k;
        for i in (k + 1)..m {
            let v = libm::fabs(*ata.add(i * m + k));
            if v > max_val {
                max_val = v;
                max_row = i;
            }
        }
        if max_row != k {
            for j in 0..m {
                let t = *ata.add(k * m + j);
                *ata.add(k * m + j) = *ata.add(max_row * m + j);
                *ata.add(max_row * m + j) = t;
            }
            let t = *aty.add(k);
            *aty.add(k) = *aty.add(max_row);
            *aty.add(max_row) = t;
        }
        let pivot = *ata.add(k * m + k);
        if libm::fabs(pivot) < 1e-14 {
            continue;
        }
        for i in (k + 1)..m {
            let factor = *ata.add(i * m + k) / pivot;
            for j in (k + 1)..m {
                *ata.add(i * m + j) -= factor * *ata.add(k * m + j);
            }
            *aty.add(i) -= factor * *aty.add(k);
        }
    }
    // Back substitution
    let mut i = m as isize - 1;
    while i >= 0 {
        let iu = i as usize;
        let mut s = *aty.add(iu);
        for j in (iu + 1)..m {
            s -= *ata.add(iu * m + j) * *coeffs_ptr.add(j);
        }
        let diag = *ata.add(iu * m + iu);
        *coeffs_ptr.add(iu) = if libm::fabs(diag) > 1e-14 {
            s / diag
        } else {
            0.0
        };
        i -= 1;
    }
}

/// Batch interpolation.
#[no_mangle]
pub unsafe extern "C" fn batchInterpolate(
    x_ptr: *const f64,
    y_ptr: *const f64,
    n: i32,
    x_targets_ptr: *const f64,
    n_targets: i32,
    method: i32,
    results_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    if method == 2 {
        let spline_coeffs = work_ptr;
        let spline_work = work_ptr.add(((n - 1) * 4) as usize);
        naturalCubicSplineCoeffs(x_ptr, y_ptr, n, spline_coeffs, spline_work);
        for i in 0..n_targets as usize {
            let x = *x_targets_ptr.add(i);
            *results_ptr.add(i) = cubicSplineEval(x_ptr, spline_coeffs, x, n);
        }
    } else if method == 1 && n > 10 {
        barycentricWeights(x_ptr, n, work_ptr);
        for i in 0..n_targets as usize {
            let x = *x_targets_ptr.add(i);
            *results_ptr.add(i) = barycentricInterp(x_ptr, y_ptr, work_ptr, x, n);
        }
    } else {
        for i in 0..n_targets as usize {
            let x = *x_targets_ptr.add(i);
            *results_ptr.add(i) = match method {
                0 => linearInterpTable(x_ptr, y_ptr, x, n),
                1 => lagrangeInterp(x_ptr, y_ptr, x, n),
                3 => pchipInterp(x_ptr, y_ptr, x, n, work_ptr),
                4 => akimaInterp(x_ptr, y_ptr, x, n, work_ptr),
                _ => linearInterpTable(x_ptr, y_ptr, x, n),
            };
        }
    }
}
