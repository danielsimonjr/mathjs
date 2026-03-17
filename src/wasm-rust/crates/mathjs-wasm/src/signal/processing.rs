//! Signal processing functions: frequency response, filter analysis.
//!
//! All functions use raw memory pointers for WASM interop.

use core::f64::consts::PI;

/// Frequency response H(e^jw) = B(e^jw) / A(e^jw).
///
/// # Safety
/// All pointers must be valid for their declared lengths.
#[no_mangle]
pub unsafe extern "C" fn freqz(
    b_ptr: *const f64,
    b_len: i32,
    a_ptr: *const f64,
    a_len: i32,
    w_ptr: *const f64,
    w_len: i32,
    h_real_ptr: *mut f64,
    h_imag_ptr: *mut f64,
) {
    let b_len = b_len as usize;
    let a_len = a_len as usize;
    let w_len = w_len as usize;

    for i in 0..w_len {
        let omega = *w_ptr.add(i);

        let mut num_re = 0.0_f64;
        let mut num_im = 0.0_f64;
        for k in 0..b_len {
            let angle = -(k as f64) * omega;
            let bk = *b_ptr.add(k);
            num_re += bk * libm::cos(angle);
            num_im += bk * libm::sin(angle);
        }

        let mut den_re = 0.0_f64;
        let mut den_im = 0.0_f64;
        for k in 0..a_len {
            let angle = -(k as f64) * omega;
            let ak = *a_ptr.add(k);
            den_re += ak * libm::cos(angle);
            den_im += ak * libm::sin(angle);
        }

        let den_mag_sq = den_re * den_re + den_im * den_im;
        *h_real_ptr.add(i) = (num_re * den_re + num_im * den_im) / den_mag_sq;
        *h_imag_ptr.add(i) = (num_im * den_re - num_re * den_im) / den_mag_sq;
    }
}

/// Optimized freqz for equally spaced frequencies 0..PI.
///
/// # Safety
/// All pointers must be valid for their declared lengths.
#[no_mangle]
pub unsafe extern "C" fn freqzUniform(
    b_ptr: *const f64,
    b_len: i32,
    a_ptr: *const f64,
    a_len: i32,
    n: i32,
    h_real_ptr: *mut f64,
    h_imag_ptr: *mut f64,
) {
    let b_len = b_len as usize;
    let a_len = a_len as usize;
    let n = n as usize;
    let dw = PI / n as f64;

    for i in 0..n {
        let omega = (i as f64) * dw;

        let mut num_re = 0.0_f64;
        let mut num_im = 0.0_f64;
        for k in 0..b_len {
            let angle = -(k as f64) * omega;
            let bk = *b_ptr.add(k);
            num_re += bk * libm::cos(angle);
            num_im += bk * libm::sin(angle);
        }

        let mut den_re = 0.0_f64;
        let mut den_im = 0.0_f64;
        for k in 0..a_len {
            let angle = -(k as f64) * omega;
            let ak = *a_ptr.add(k);
            den_re += ak * libm::cos(angle);
            den_im += ak * libm::sin(angle);
        }

        let den_mag_sq = den_re * den_re + den_im * den_im;
        *h_real_ptr.add(i) = (num_re * den_re + num_im * den_im) / den_mag_sq;
        *h_imag_ptr.add(i) = (num_im * den_re - num_re * den_im) / den_mag_sq;
    }
}

/// Complex polynomial multiplication c = a * b (convolution).
///
/// # Safety
/// Output arrays must have length aLen + bLen - 1.
#[no_mangle]
pub unsafe extern "C" fn polyMultiply(
    a_real_ptr: *const f64,
    a_imag_ptr: *const f64,
    a_len: i32,
    b_real_ptr: *const f64,
    b_imag_ptr: *const f64,
    b_len: i32,
    c_real_ptr: *mut f64,
    c_imag_ptr: *mut f64,
) {
    let a_len = a_len as usize;
    let b_len = b_len as usize;
    let c_len = a_len + b_len - 1;

    for i in 0..c_len {
        *c_real_ptr.add(i) = 0.0;
        *c_imag_ptr.add(i) = 0.0;
    }

    for i in 0..c_len {
        for j in 0..a_len {
            let k = i as isize - j as isize;
            if k >= 0 && (k as usize) < b_len {
                let ku = k as usize;
                let ar = *a_real_ptr.add(j);
                let ai = *a_imag_ptr.add(j);
                let br = *b_real_ptr.add(ku);
                let bi = *b_imag_ptr.add(ku);
                *c_real_ptr.add(i) += ar * br - ai * bi;
                *c_imag_ptr.add(i) += ar * bi + ai * br;
            }
        }
    }
}

/// Convert zero-pole-gain to transfer function coefficients.
///
/// # Safety
/// All pointers must be valid. workPtr needs 4*(max(zLen,pLen)+2) f64.
#[no_mangle]
pub unsafe extern "C" fn zpk2tf(
    z_real_ptr: *const f64,
    z_imag_ptr: *const f64,
    z_len: i32,
    p_real_ptr: *const f64,
    p_imag_ptr: *const f64,
    p_len: i32,
    k: f64,
    num_real_ptr: *mut f64,
    num_imag_ptr: *mut f64,
    den_real_ptr: *mut f64,
    den_imag_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let z_len = z_len as usize;
    let p_len = p_len as usize;
    let max_len = if z_len > p_len { z_len } else { p_len };
    let temp_size = max_len + 2;

    let t_re1 = work_ptr;
    let t_im1 = work_ptr.add(temp_size);
    let t_re2 = work_ptr.add(temp_size * 2);
    let t_im2 = work_ptr.add(temp_size * 3);

    // Build numerator from zeros
    *t_re1 = 1.0;
    *t_im1 = 0.0;
    let mut num_len: usize = 1;

    for i in 0..z_len {
        let zr = *z_real_ptr.add(i);
        let zi = *z_imag_ptr.add(i);
        let new_len = num_len + 1;

        for j in 0..new_len {
            *t_re2.add(j) = 0.0;
            *t_im2.add(j) = 0.0;
        }

        for j in 0..num_len {
            let ar = *t_re1.add(j);
            let ai = *t_im1.add(j);
            // * factor[0] = 1+0i
            *t_re2.add(j) += ar;
            *t_im2.add(j) += ai;
            // * factor[1] = -zr - zi*i
            *t_re2.add(j + 1) += -ar * zr + ai * zi;
            *t_im2.add(j + 1) += -ar * zi - ai * zr;
        }

        for j in 0..new_len {
            *t_re1.add(j) = *t_re2.add(j);
            *t_im1.add(j) = *t_im2.add(j);
        }
        num_len = new_len;
    }

    // Apply gain and copy to output
    for i in 0..num_len {
        *num_real_ptr.add(i) = *t_re1.add(i) * k;
        *num_imag_ptr.add(i) = *t_im1.add(i) * k;
    }

    // Build denominator from poles
    *t_re1 = 1.0;
    *t_im1 = 0.0;
    let mut den_len: usize = 1;

    for i in 0..p_len {
        let pr = *p_real_ptr.add(i);
        let pi = *p_imag_ptr.add(i);
        let new_len = den_len + 1;

        for j in 0..new_len {
            *t_re2.add(j) = 0.0;
            *t_im2.add(j) = 0.0;
        }

        for j in 0..den_len {
            let ar = *t_re1.add(j);
            let ai = *t_im1.add(j);
            *t_re2.add(j) += ar;
            *t_im2.add(j) += ai;
            *t_re2.add(j + 1) += -ar * pr + ai * pi;
            *t_im2.add(j + 1) += -ar * pi - ai * pr;
        }

        for j in 0..new_len {
            *t_re1.add(j) = *t_re2.add(j);
            *t_im1.add(j) = *t_im2.add(j);
        }
        den_len = new_len;
    }

    for i in 0..den_len {
        *den_real_ptr.add(i) = *t_re1.add(i);
        *den_imag_ptr.add(i) = *t_im1.add(i);
    }
}

/// Magnitude of complex frequency response.
#[no_mangle]
pub unsafe extern "C" fn magnitude(
    h_real_ptr: *const f64,
    h_imag_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        let re = *h_real_ptr.add(i);
        let im = *h_imag_ptr.add(i);
        *result_ptr.add(i) = libm::sqrt(re * re + im * im);
    }
}

/// Magnitude in dB: 20*log10(|H|).
#[no_mangle]
pub unsafe extern "C" fn magnitudeDb(
    h_real_ptr: *const f64,
    h_imag_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    let log10_factor = 20.0 / core::f64::consts::LN_10;
    for i in 0..n as usize {
        let re = *h_real_ptr.add(i);
        let im = *h_imag_ptr.add(i);
        let mag = libm::sqrt(re * re + im * im);
        if mag > 1e-300 {
            *result_ptr.add(i) = log10_factor * libm::log(mag);
        } else {
            *result_ptr.add(i) = -300.0;
        }
    }
}

/// Phase of complex frequency response (radians).
#[no_mangle]
pub unsafe extern "C" fn phase(
    h_real_ptr: *const f64,
    h_imag_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    for i in 0..n as usize {
        *result_ptr.add(i) = libm::atan2(*h_imag_ptr.add(i), *h_real_ptr.add(i));
    }
}

/// Unwrap phase to eliminate discontinuities.
#[no_mangle]
pub unsafe extern "C" fn unwrapPhase(phase_in_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let n = n as usize;
    if n < 1 {
        return;
    }
    *result_ptr = *phase_in_ptr;
    if n < 2 {
        return;
    }

    let two_pi = 2.0 * PI;
    for i in 1..n {
        let mut current = *phase_in_ptr.add(i);
        let prev = *result_ptr.add(i - 1);
        let mut diff = current - prev;
        while diff > PI {
            current -= two_pi;
            diff -= two_pi;
        }
        while diff < -PI {
            current += two_pi;
            diff += two_pi;
        }
        *result_ptr.add(i) = current;
    }
}

/// Group delay: tau(w) = -d(phase)/dw.
///
/// # Safety
/// workPtr needs 2*n f64.
#[no_mangle]
pub unsafe extern "C" fn groupDelay(
    h_real_ptr: *const f64,
    h_imag_ptr: *const f64,
    w_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    if n < 2 {
        for i in 0..n {
            *result_ptr.add(i) = 0.0;
        }
        return;
    }

    let phase_ptr = work_ptr;
    let unwrapped_ptr = work_ptr.add(n);

    phase(h_real_ptr, h_imag_ptr, n as i32, phase_ptr);
    unwrapPhase(phase_ptr, n as i32, unwrapped_ptr);

    // Central differences for interior points
    for i in 1..(n - 1) {
        let d_phase = *unwrapped_ptr.add(i + 1) - *unwrapped_ptr.add(i - 1);
        let dw = *w_ptr.add(i + 1) - *w_ptr.add(i - 1);
        *result_ptr.add(i) = -d_phase / dw;
    }

    // Endpoints: one-sided differences
    let p0 = *unwrapped_ptr;
    let p1 = *unwrapped_ptr.add(1);
    let w0 = *w_ptr;
    let w1 = *w_ptr.add(1);
    *result_ptr = -(p1 - p0) / (w1 - w0);

    let pn1 = *unwrapped_ptr.add(n - 1);
    let pn2 = *unwrapped_ptr.add(n - 2);
    let wn1 = *w_ptr.add(n - 1);
    let wn2 = *w_ptr.add(n - 2);
    *result_ptr.add(n - 1) = -(pn1 - pn2) / (wn1 - wn2);
}
