//! ODE solvers: RK45 (Dormand-Prince), RK23 (Bogacki-Shampine).

/// RK45 (Dormand-Prince) single step.
#[no_mangle]
pub unsafe extern "C" fn rk45Step(
    y_ptr: *const f64,
    _t: f64,
    h: f64,
    n: i32,
    k_ptr: *const f64,
    y_next_ptr: *mut f64,
    y_error_ptr: *mut f64,
) {
    let n = n as usize;
    let b = [
        35.0 / 384.0,
        0.0,
        500.0 / 1113.0,
        125.0 / 192.0,
        -2187.0 / 6784.0,
        11.0 / 84.0,
        0.0,
    ];
    let bp = [
        5179.0 / 57600.0,
        0.0,
        7571.0 / 16695.0,
        393.0 / 640.0,
        -92097.0 / 339200.0,
        187.0 / 2100.0,
        1.0 / 40.0,
    ];

    for i in 0..n {
        let y = *y_ptr.add(i);
        let mut y_next = y;
        let mut y_p = y;
        for s in 0..7_usize {
            let k = *k_ptr.add(s * n + i);
            y_next += h * b[s] * k;
            y_p += h * bp[s] * k;
        }
        *y_next_ptr.add(i) = y_next;
        *y_error_ptr.add(i) = libm::fabs(y_next - y_p);
    }
}

/// RK23 (Bogacki-Shampine) single step.
#[no_mangle]
pub unsafe extern "C" fn rk23Step(
    y_ptr: *const f64,
    _t: f64,
    h: f64,
    n: i32,
    k_ptr: *const f64,
    y_next_ptr: *mut f64,
    y_error_ptr: *mut f64,
) {
    let n = n as usize;
    let b = [2.0 / 9.0, 1.0 / 3.0, 4.0 / 9.0, 0.0];
    let bp = [7.0 / 24.0, 1.0 / 4.0, 1.0 / 3.0, 1.0 / 8.0];

    for i in 0..n {
        let y = *y_ptr.add(i);
        let mut y_next = y;
        let mut y_p = y;
        for s in 0..4_usize {
            let k = *k_ptr.add(s * n + i);
            y_next += h * b[s] * k;
            y_p += h * bp[s] * k;
        }
        *y_next_ptr.add(i) = y_next;
        *y_error_ptr.add(i) = libm::fabs(y_next - y_p);
    }
}

/// Maximum absolute error.
#[no_mangle]
pub unsafe extern "C" fn maxError(error_ptr: *const f64, n: i32) -> f64 {
    let mut max_err = 0.0_f64;
    for i in 0..n as usize {
        let err = libm::fabs(*error_ptr.add(i));
        if err > max_err {
            max_err = err;
        }
    }
    max_err
}

/// Optimal step size adjustment factor.
#[no_mangle]
pub extern "C" fn computeStepAdjustment(
    error: f64,
    tolerance: f64,
    order: i32,
    min_delta: f64,
    max_delta: f64,
) -> f64 {
    let safety = 0.84;
    let mut delta = safety * libm::pow(tolerance / error, 1.0 / order as f64);
    if delta < min_delta {
        delta = min_delta;
    } else if delta > max_delta {
        delta = max_delta;
    }
    delta
}

/// Linear interpolation for dense output.
#[export_name = "interpolate"]
pub unsafe extern "C" fn ode_interpolate(
    y0_ptr: *const f64,
    y1_ptr: *const f64,
    t0: f64,
    t1: f64,
    t: f64,
    n: i32,
    result_ptr: *mut f64,
) {
    let alpha = (t - t0) / (t1 - t0);
    let beta = 1.0 - alpha;
    for i in 0..n as usize {
        *result_ptr.add(i) = beta * *y0_ptr.add(i) + alpha * *y1_ptr.add(i);
    }
}

/// Vector copy.
#[no_mangle]
pub unsafe extern "C" fn vectorCopy(src_ptr: *const f64, n: i32, dst_ptr: *mut f64) {
    for i in 0..n as usize {
        *dst_ptr.add(i) = *src_ptr.add(i);
    }
}

/// Vector scale: result = vec * scale.
#[no_mangle]
pub unsafe extern "C" fn vectorScale(
    vec_ptr: *const f64,
    scale: f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = *vec_ptr.add(i) * scale;
    }
}

/// Vector addition: result = a + b.
#[no_mangle]
pub unsafe extern "C" fn vectorAdd(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = *a_ptr.add(i) + *b_ptr.add(i);
    }
}

/// Check if step would overshoot.
#[no_mangle]
pub extern "C" fn wouldOvershoot(t: f64, tf: f64, h: f64, forward: i32) -> i32 {
    if forward != 0 {
        if t + h > tf {
            1
        } else {
            0
        }
    } else {
        if t + h < tf {
            1
        } else {
            0
        }
    }
}

/// Trim step size to avoid overshooting.
#[no_mangle]
pub extern "C" fn trimStep(t: f64, tf: f64, h: f64, forward: i32) -> f64 {
    if wouldOvershoot(t, tf, h, forward) != 0 {
        tf - t
    } else {
        h
    }
}
