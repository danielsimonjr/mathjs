//! Numerical calculus: differentiation and integration.

use core::f64::consts::PI;

/// Forward difference: f'(x) ~ (f(x+h) - f(x)) / h.
#[no_mangle]
pub extern "C" fn forwardDifference(fx: f64, fxh: f64, h: f64) -> f64 {
    if h == 0.0 {
        f64::NAN
    } else {
        (fxh - fx) / h
    }
}

/// Backward difference: f'(x) ~ (f(x) - f(x-h)) / h.
#[no_mangle]
pub extern "C" fn backwardDifference(fx: f64, fxmh: f64, h: f64) -> f64 {
    if h == 0.0 {
        f64::NAN
    } else {
        (fx - fxmh) / h
    }
}

/// Central difference: f'(x) ~ (f(x+h) - f(x-h)) / (2h).
#[no_mangle]
pub extern "C" fn centralDifference(fxph: f64, fxmh: f64, h: f64) -> f64 {
    if h == 0.0 {
        f64::NAN
    } else {
        (fxph - fxmh) / (2.0 * h)
    }
}

/// Second derivative via central difference.
#[no_mangle]
pub extern "C" fn secondDerivative(fxph: f64, fx: f64, fxmh: f64, h: f64) -> f64 {
    if h == 0.0 {
        f64::NAN
    } else {
        (fxph - 2.0 * fx + fxmh) / (h * h)
    }
}

/// 5-point stencil derivative.
#[no_mangle]
pub extern "C" fn fivePointStencil(fxp2h: f64, fxph: f64, fxmh: f64, fxm2h: f64, h: f64) -> f64 {
    if h == 0.0 {
        f64::NAN
    } else {
        (-fxp2h + 8.0 * fxph - 8.0 * fxmh + fxm2h) / (12.0 * h)
    }
}

/// Richardson extrapolation.
#[no_mangle]
pub extern "C" fn richardsonExtrapolation(d1: f64, d2: f64, order: i32) -> f64 {
    let factor = libm::pow(2.0, order as f64);
    (factor * d2 - d1) / (factor - 1.0)
}

/// Numerical gradient using central differences.
#[no_mangle]
pub unsafe extern "C" fn gradient(f_values_ptr: *const f64, h: f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        let fminus = *f_values_ptr.add(i * 2);
        let fplus = *f_values_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = (fplus - fminus) / (2.0 * h);
    }
}

/// Numerical Hessian matrix.
#[no_mangle]
pub unsafe extern "C" fn hessian(
    f_values_ptr: *const f64,
    fx: f64,
    h: f64,
    n: i32,
    result_ptr: *mut f64,
) {
    let n = n as usize;
    let h2 = h * h;
    let mut idx = 0_usize;
    for i in 0..n {
        for j in 0..n {
            if i == j {
                let fp = *f_values_ptr.add(idx);
                let fm = *f_values_ptr.add(idx + 1);
                *result_ptr.add(i * n + j) = (fp - 2.0 * fx + fm) / h2;
                idx += 2;
            } else if j > i {
                let fpp = *f_values_ptr.add(idx);
                let fpm = *f_values_ptr.add(idx + 1);
                let fmp = *f_values_ptr.add(idx + 2);
                let fmm = *f_values_ptr.add(idx + 3);
                let val = (fpp - fpm - fmp + fmm) / (4.0 * h2);
                *result_ptr.add(i * n + j) = val;
                *result_ptr.add(j * n + i) = val;
                idx += 4;
            }
        }
    }
}

/// Trapezoidal rule integration.
#[no_mangle]
pub unsafe extern "C" fn trapezoidalRule(f_values_ptr: *const f64, h: f64, n: i32) -> f64 {
    let n = n as usize;
    if n < 2 {
        return 0.0;
    }
    let mut sum = (*f_values_ptr + *f_values_ptr.add(n - 1)) / 2.0;
    for i in 1..(n - 1) {
        sum += *f_values_ptr.add(i);
    }
    sum * h
}

/// Simpson's 1/3 rule (n must be odd).
#[no_mangle]
pub unsafe extern "C" fn simpsonsRule(f_values_ptr: *const f64, h: f64, n: i32) -> f64 {
    let n = n as usize;
    if n < 3 || n % 2 == 0 {
        return f64::NAN;
    }
    let mut sum = *f_values_ptr + *f_values_ptr.add(n - 1);
    for i in 1..(n - 1) {
        if i % 2 == 1 {
            sum += 4.0 * *f_values_ptr.add(i);
        } else {
            sum += 2.0 * *f_values_ptr.add(i);
        }
    }
    (sum * h) / 3.0
}

/// Simpson's 3/8 rule (n must be 3k+1).
#[no_mangle]
pub unsafe extern "C" fn simpsons38Rule(f_values_ptr: *const f64, h: f64, n: i32) -> f64 {
    let n = n as usize;
    if n < 4 || (n - 1) % 3 != 0 {
        return f64::NAN;
    }
    let mut sum = *f_values_ptr + *f_values_ptr.add(n - 1);
    for i in 1..(n - 1) {
        if i % 3 == 0 {
            sum += 2.0 * *f_values_ptr.add(i);
        } else {
            sum += 3.0 * *f_values_ptr.add(i);
        }
    }
    (sum * 3.0 * h) / 8.0
}

/// Boole's rule (n must be 4k+1).
#[no_mangle]
pub unsafe extern "C" fn boolesRule(f_values_ptr: *const f64, h: f64, n: i32) -> f64 {
    let n = n as usize;
    if n < 5 || (n - 1) % 4 != 0 {
        return f64::NAN;
    }
    let num_panels = (n - 1) / 4;
    let mut sum = 0.0_f64;
    for panel in 0..num_panels {
        let base = panel * 4;
        sum += 7.0 * *f_values_ptr.add(base);
        sum += 32.0 * *f_values_ptr.add(base + 1);
        sum += 12.0 * *f_values_ptr.add(base + 2);
        sum += 32.0 * *f_values_ptr.add(base + 3);
        sum += 7.0 * *f_values_ptr.add(base + 4);
    }
    if num_panels > 1 {
        for i in 1..num_panels {
            sum -= 7.0 * *f_values_ptr.add(i * 4);
        }
    }
    (sum * 2.0 * h) / 45.0
}

// Gauss-Legendre nodes/weights
static GL_NODES: [[f64; 5]; 4] = [
    [-0.5773502691896257, 0.5773502691896257, 0.0, 0.0, 0.0],
    [-0.7745966692414834, 0.0, 0.7745966692414834, 0.0, 0.0],
    [
        -0.8611363115940526,
        -0.3399810435848563,
        0.3399810435848563,
        0.8611363115940526,
        0.0,
    ],
    [
        -0.906179845938664,
        -0.5384693101056831,
        0.0,
        0.5384693101056831,
        0.906179845938664,
    ],
];
static GL_WEIGHTS: [[f64; 5]; 4] = [
    [1.0, 1.0, 0.0, 0.0, 0.0],
    [
        0.5555555555555556,
        0.8888888888888888,
        0.5555555555555556,
        0.0,
        0.0,
    ],
    [
        0.3478548451374538,
        0.6521451548625461,
        0.6521451548625461,
        0.3478548451374538,
        0.0,
    ],
    [
        0.2369268850561891,
        0.4786286704993665,
        0.5688888888888889,
        0.4786286704993665,
        0.2369268850561891,
    ],
];

/// Get Gauss-Legendre nodes for interval [a,b].
#[no_mangle]
pub unsafe extern "C" fn gaussLegendreNodes(
    a: f64,
    b: f64,
    n_points: i32,
    result_ptr: *mut f64,
) -> i32 {
    if n_points < 2 || n_points > 5 {
        return 0;
    }
    let idx = (n_points - 2) as usize;
    let mid = (a + b) / 2.0;
    let hw = (b - a) / 2.0;
    for i in 0..n_points as usize {
        *result_ptr.add(i) = mid + hw * GL_NODES[idx][i];
    }
    n_points
}

/// Get Gauss-Legendre weights for interval [a,b].
#[no_mangle]
pub unsafe extern "C" fn gaussLegendreWeights(
    a: f64,
    b: f64,
    n_points: i32,
    result_ptr: *mut f64,
) -> i32 {
    if n_points < 2 || n_points > 5 {
        return 0;
    }
    let idx = (n_points - 2) as usize;
    let hw = (b - a) / 2.0;
    for i in 0..n_points as usize {
        *result_ptr.add(i) = hw * GL_WEIGHTS[idx][i];
    }
    n_points
}

/// Gauss-Legendre quadrature from pre-computed values.
#[no_mangle]
pub unsafe extern "C" fn gaussLegendre(
    f_values_ptr: *const f64,
    weights_ptr: *const f64,
    n_points: i32,
) -> f64 {
    let mut sum = 0.0_f64;
    for i in 0..n_points as usize {
        sum += *weights_ptr.add(i) * *f_values_ptr.add(i);
    }
    sum
}

/// Composite Gauss-Legendre quadrature.
#[no_mangle]
pub unsafe extern "C" fn compositeGaussLegendre(
    f_values_ptr: *const f64,
    a: f64,
    b: f64,
    n_subintervals: i32,
    n_points: i32,
    work_ptr: *mut f64,
) -> f64 {
    let sub_width = (b - a) / n_subintervals as f64;
    let mut sum = 0.0_f64;
    for sub in 0..n_subintervals {
        let sub_a = a + sub as f64 * sub_width;
        let sub_b = sub_a + sub_width;
        gaussLegendreWeights(sub_a, sub_b, n_points, work_ptr);
        for i in 0..n_points as usize {
            let f_idx = (sub as usize) * (n_points as usize) + i;
            sum += *work_ptr.add(i) * *f_values_ptr.add(f_idx);
        }
    }
    sum
}

/// Romberg integration.
#[no_mangle]
pub unsafe extern "C" fn romberg(trap_values_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    let n = n as usize;
    if n < 1 {
        return f64::NAN;
    }
    if n == 1 {
        return *trap_values_ptr;
    }
    for i in 0..n {
        *work_ptr.add(i * n) = *trap_values_ptr.add(i);
    }
    for j in 1..n {
        let factor = libm::pow(4.0, j as f64);
        for i in j..n {
            let v1 = *work_ptr.add(i * n + j - 1);
            let v2 = *work_ptr.add((i - 1) * n + j - 1);
            *work_ptr.add(i * n + j) = (factor * v1 - v2) / (factor - 1.0);
        }
    }
    *work_ptr.add((n - 1) * n + n - 1)
}

/// Numerical Jacobian matrix.
#[no_mangle]
pub unsafe extern "C" fn jacobian(
    f_values_ptr: *const f64,
    h: f64,
    n_functions: i32,
    n_variables: i32,
    result_ptr: *mut f64,
) {
    let nf = n_functions as usize;
    let nv = n_variables as usize;
    for i in 0..nf {
        for j in 0..nv {
            let idx = (i * nv + j) * 2;
            let fp = *f_values_ptr.add(idx);
            let fm = *f_values_ptr.add(idx + 1);
            *result_ptr.add(i * nv + j) = (fp - fm) / (2.0 * h);
        }
    }
}

/// Laplacian using finite differences.
#[no_mangle]
pub unsafe extern "C" fn laplacian(f_values_ptr: *const f64, fx: f64, h: f64, n_dim: i32) -> f64 {
    let h2 = h * h;
    let mut sum = -2.0 * n_dim as f64 * fx;
    for i in 0..n_dim as usize {
        sum += *f_values_ptr.add(i * 2) + *f_values_ptr.add(i * 2 + 1);
    }
    sum / h2
}

/// Divergence of a vector field.
#[no_mangle]
pub unsafe extern "C" fn divergence(field_values_ptr: *const f64, h: f64, n_dim: i32) -> f64 {
    let mut sum = 0.0_f64;
    for i in 0..n_dim as usize {
        let fp = *field_values_ptr.add(i * 2);
        let fm = *field_values_ptr.add(i * 2 + 1);
        sum += (fp - fm) / (2.0 * h);
    }
    sum
}

/// Curl of a 3D vector field.
#[no_mangle]
pub unsafe extern "C" fn curl3D(field_values_ptr: *const f64, result_ptr: *mut f64) {
    *result_ptr = *field_values_ptr - *field_values_ptr.add(1);
    *result_ptr.add(1) = *field_values_ptr.add(2) - *field_values_ptr.add(3);
    *result_ptr.add(2) = *field_values_ptr.add(4) - *field_values_ptr.add(5);
}
