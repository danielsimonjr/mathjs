//! Root-finding algorithms: bisection, Newton, secant, Brent, etc.

/// Bisection setup.
#[no_mangle]
pub unsafe extern "C" fn bisectionSetup(fa: f64, fb: f64, a: f64, b: f64, state_ptr: *mut f64) {
    if fa * fb > 0.0 {
        *state_ptr.add(5) = -1.0;
        return;
    }
    *state_ptr = (a + b) / 2.0;
    *state_ptr.add(1) = a;
    *state_ptr.add(2) = b;
    *state_ptr.add(3) = fa;
    *state_ptr.add(4) = fb;
    *state_ptr.add(5) = 1.0;
}

/// Bisection step.
#[no_mangle]
pub unsafe extern "C" fn bisectionStep(state_ptr: *mut f64, fmid: f64, tol: f64) {
    let mid = *state_ptr;
    let mut a = *state_ptr.add(1);
    let mut b = *state_ptr.add(2);
    let mut fa = *state_ptr.add(3);
    if libm::fabs(fmid) < tol || (b - a) / 2.0 < tol {
        *state_ptr = mid;
        *state_ptr.add(5) = 0.0;
        return;
    }
    if fa * fmid < 0.0 {
        b = mid;
    } else {
        a = mid;
        fa = fmid;
    }
    *state_ptr = (a + b) / 2.0;
    *state_ptr.add(1) = a;
    *state_ptr.add(2) = b;
    *state_ptr.add(3) = fa;
    *state_ptr.add(4) = if fa * fmid < 0.0 {
        *state_ptr.add(4)
    } else {
        fmid
    };
    *state_ptr.add(5) = 1.0;
}

/// Newton setup.
#[no_mangle]
pub unsafe extern "C" fn newtonSetup(x0: f64, state_ptr: *mut f64) {
    *state_ptr = x0;
    *state_ptr.add(1) = 1.0;
}

/// Newton step.
#[no_mangle]
pub unsafe extern "C" fn newtonStep(state_ptr: *mut f64, fx: f64, fpx: f64, tol: f64) {
    if libm::fabs(fx) < tol {
        *state_ptr.add(1) = 0.0;
        return;
    }
    if libm::fabs(fpx) < 1e-15 {
        *state_ptr.add(1) = -1.0;
        return;
    }
    *state_ptr = *state_ptr - fx / fpx;
    *state_ptr.add(1) = 1.0;
}

/// Secant setup.
#[no_mangle]
pub unsafe extern "C" fn secantSetup(x0: f64, x1: f64, fx0: f64, fx1: f64, state_ptr: *mut f64) {
    *state_ptr = x1;
    *state_ptr.add(1) = x0;
    *state_ptr.add(2) = fx1;
    *state_ptr.add(3) = fx0;
    *state_ptr.add(4) = 1.0;
}

/// Secant step.
#[no_mangle]
pub unsafe extern "C" fn secantStep(state_ptr: *mut f64, tol: f64) -> f64 {
    let x = *state_ptr;
    let x_prev = *state_ptr.add(1);
    let fx = *state_ptr.add(2);
    let fx_prev = *state_ptr.add(3);
    if libm::fabs(fx) < tol {
        *state_ptr.add(4) = 0.0;
        return x;
    }
    let denom = fx - fx_prev;
    if libm::fabs(denom) < 1e-15 {
        *state_ptr.add(4) = -1.0;
        return x;
    }
    let new_x = x - (fx * (x - x_prev)) / denom;
    *state_ptr = new_x;
    *state_ptr.add(1) = x;
    *state_ptr.add(2) = 0.0;
    *state_ptr.add(3) = fx;
    *state_ptr.add(4) = 2.0;
    new_x
}

/// Secant update.
#[no_mangle]
pub unsafe extern "C" fn secantUpdate(state_ptr: *mut f64, f_new_x: f64) {
    *state_ptr.add(2) = f_new_x;
    *state_ptr.add(4) = 1.0;
}

/// Brent setup.
#[no_mangle]
pub unsafe extern "C" fn brentSetup(a: f64, b: f64, fa: f64, fb: f64, state_ptr: *mut f64) {
    let (mut aa, mut bb, mut faa, mut fbb) = (a, b, fa, fb);
    if libm::fabs(fa) < libm::fabs(fb) {
        aa = b;
        bb = a;
        faa = fb;
        fbb = fa;
    }
    if faa * fbb > 0.0 {
        *state_ptr.add(8) = -1.0;
        return;
    }
    *state_ptr = aa;
    *state_ptr.add(1) = bb;
    *state_ptr.add(2) = aa;
    *state_ptr.add(3) = faa;
    *state_ptr.add(4) = fbb;
    *state_ptr.add(5) = faa;
    *state_ptr.add(6) = bb - aa;
    *state_ptr.add(7) = bb - aa;
    *state_ptr.add(8) = 1.0;
}

/// Brent step.
#[no_mangle]
pub unsafe extern "C" fn brentStep(state_ptr: *mut f64, tol: f64) -> f64 {
    let mut a = *state_ptr;
    let mut b = *state_ptr.add(1);
    let mut c = *state_ptr.add(2);
    let mut fa = *state_ptr.add(3);
    let fb = *state_ptr.add(4);
    let mut fc = *state_ptr.add(5);
    let mut d = *state_ptr.add(6);
    let mut e = *state_ptr.add(7);

    if libm::fabs(fb) < tol {
        *state_ptr.add(8) = 0.0;
        return b;
    }
    if (fb > 0.0 && fc > 0.0) || (fb < 0.0 && fc < 0.0) {
        c = a;
        fc = fa;
        d = b - a;
        e = d;
    }
    if libm::fabs(fc) < libm::fabs(fb) {
        a = b;
        b = c;
        c = a;
        fa = fb; // fb = fc; fc = fa;
                 // Swap fully
        let tmp = fa;
        fa = *state_ptr.add(4); // fb before swap
        *state_ptr.add(4) = fc;
        fc = tmp;
    }

    let tol_abs = 2.0 * 2.2e-16 * libm::fabs(b) + 0.5 * tol;
    let m = 0.5 * (c - b);
    if libm::fabs(m) <= tol_abs || fb == 0.0 {
        *state_ptr.add(1) = b;
        *state_ptr.add(8) = 0.0;
        return b;
    }

    let new_b;
    if libm::fabs(e) < tol_abs || libm::fabs(fa) <= libm::fabs(fb) {
        d = m;
        e = m;
        new_b = b + m;
    } else {
        let s;
        if a == c {
            s = fb / fa;
            new_b = b + (2.0 * m * s) / (1.0 - s);
        } else {
            let q = fa / fc;
            let r = fb / fc;
            s = fb / fa;
            new_b = b
                + (s * (2.0 * m * q * (q - r) - (b - a) * (r - 1.0)))
                    / ((q - 1.0) * (r - 1.0) * (s - 1.0));
        }
        let delta = new_b - b;
        let min_val = if libm::fabs(e) < 3.0 * m - tol_abs {
            libm::fabs(e)
        } else {
            3.0 * m - tol_abs
        };
        if 2.0 * libm::fabs(delta) < min_val {
            e = d;
            d = delta;
        } else {
            d = m;
            e = m;
            // new_b stays at b + m already computed
        }
    }

    a = b;
    fa = fb;
    let b_val = new_b;

    *state_ptr = a;
    *state_ptr.add(1) = b_val;
    *state_ptr.add(2) = c;
    *state_ptr.add(3) = fa;
    *state_ptr.add(4) = 0.0; // placeholder
    *state_ptr.add(5) = fc;
    *state_ptr.add(6) = d;
    *state_ptr.add(7) = e;
    *state_ptr.add(8) = 2.0;
    b_val
}

/// Brent update.
#[no_mangle]
pub unsafe extern "C" fn brentUpdate(state_ptr: *mut f64, f_new_b: f64) {
    *state_ptr.add(4) = f_new_b;
    *state_ptr.add(8) = 1.0;
}

/// Fixed-point setup.
#[no_mangle]
pub unsafe extern "C" fn fixedPointSetup(x0: f64, state_ptr: *mut f64) {
    *state_ptr = x0;
    *state_ptr.add(1) = 1.0;
}

/// Fixed-point step.
#[no_mangle]
pub unsafe extern "C" fn fixedPointStep(state_ptr: *mut f64, gx: f64, tol: f64) {
    let x = *state_ptr;
    if libm::fabs(gx - x) < tol {
        *state_ptr = gx;
        *state_ptr.add(1) = 0.0;
        return;
    }
    *state_ptr = gx;
    *state_ptr.add(1) = 1.0;
}

/// Illinois setup.
#[no_mangle]
pub unsafe extern "C" fn illinoisSetup(a: f64, b: f64, fa: f64, fb: f64, state_ptr: *mut f64) {
    if fa * fb > 0.0 {
        *state_ptr.add(5) = -1.0;
        return;
    }
    *state_ptr = a;
    *state_ptr.add(1) = b;
    *state_ptr.add(2) = fa;
    *state_ptr.add(3) = fb;
    *state_ptr.add(4) = 0.0;
    *state_ptr.add(5) = 1.0;
}

/// Illinois step.
#[no_mangle]
pub unsafe extern "C" fn illinoisStep(state_ptr: *mut f64, fc: f64, tol: f64) {
    let mut a = *state_ptr;
    let b = *state_ptr.add(1);
    let mut fa = *state_ptr.add(2);
    let fb = *state_ptr.add(3);
    let mut side = *state_ptr.add(4);
    let c = (fa * b - fb * a) / (fa - fb);
    if libm::fabs(fc) < tol || libm::fabs(b - a) < tol {
        *state_ptr = c;
        *state_ptr.add(5) = 0.0;
        return;
    }
    if fc * fb < 0.0 {
        a = b;
        fa = fb;
        side = 0.0;
    } else {
        if side == 1.0 {
            fa /= 2.0;
        }
        side = 1.0;
    }
    *state_ptr = a;
    *state_ptr.add(1) = c;
    *state_ptr.add(2) = fa;
    *state_ptr.add(3) = fc;
    *state_ptr.add(4) = side;
}

/// Illinois next X.
#[no_mangle]
pub unsafe extern "C" fn illinoisNextX(state_ptr: *const f64) -> f64 {
    let a = *state_ptr;
    let b = *state_ptr.add(1);
    let fa = *state_ptr.add(2);
    let fb = *state_ptr.add(3);
    (fa * b - fb * a) / (fa - fb)
}

/// Muller's method step.
#[no_mangle]
pub unsafe extern "C" fn mullerStep(
    x0: f64,
    x1: f64,
    x2: f64,
    f0: f64,
    f1: f64,
    f2: f64,
    tol: f64,
    result_ptr: *mut f64,
) {
    if libm::fabs(f2) < tol {
        *result_ptr = x2;
        *result_ptr.add(1) = 0.0;
        return;
    }
    let h1 = x1 - x0;
    let h2 = x2 - x1;
    let d1 = (f1 - f0) / h1;
    let d2 = (f2 - f1) / h2;
    let a = (d2 - d1) / (h2 + h1);
    let b = a * h2 + d2;
    let c = f2;
    let disc = b * b - 4.0 * a * c;
    let denom;
    if disc >= 0.0 {
        let sq = libm::sqrt(disc);
        denom = if libm::fabs(b + sq) > libm::fabs(b - sq) {
            b + sq
        } else {
            b - sq
        };
    } else {
        denom = b;
    }
    if libm::fabs(denom) < 1e-15 {
        *result_ptr = x2;
        *result_ptr.add(1) = -1.0;
        return;
    }
    *result_ptr = x2 - (2.0 * c) / denom;
    *result_ptr.add(1) = 1.0;
}

/// Steffensen's method step.
#[no_mangle]
pub unsafe extern "C" fn steffensenStep(
    x: f64,
    fx: f64,
    fxpfx: f64,
    tol: f64,
    result_ptr: *mut f64,
) {
    if libm::fabs(fx) < tol {
        *result_ptr = x;
        *result_ptr.add(1) = 0.0;
        return;
    }
    let denom = fxpfx - fx;
    if libm::fabs(denom) < 1e-15 {
        *result_ptr = x;
        *result_ptr.add(1) = -1.0;
        return;
    }
    *result_ptr = x - (fx * fx) / denom;
    *result_ptr.add(1) = 1.0;
}

/// Halley's method step.
#[no_mangle]
pub unsafe extern "C" fn halleyStep(
    x: f64,
    fx: f64,
    fpx: f64,
    fppx: f64,
    tol: f64,
    result_ptr: *mut f64,
) {
    if libm::fabs(fx) < tol {
        *result_ptr = x;
        *result_ptr.add(1) = 0.0;
        return;
    }
    let denom = 2.0 * fpx * fpx - fx * fppx;
    if libm::fabs(denom) < 1e-15 {
        *result_ptr = x;
        *result_ptr.add(1) = -1.0;
        return;
    }
    *result_ptr = x - (2.0 * fx * fpx) / denom;
    *result_ptr.add(1) = 1.0;
}

/// Get status from state array.
#[no_mangle]
pub unsafe extern "C" fn getStatus(state_ptr: *const f64, status_offset: i32) -> f64 {
    *state_ptr.add(status_offset as usize / 8)
}

/// Get current estimate from state array.
#[no_mangle]
pub unsafe extern "C" fn getEstimate(state_ptr: *const f64, estimate_offset: i32) -> f64 {
    *state_ptr.add(estimate_offset as usize / 8)
}
