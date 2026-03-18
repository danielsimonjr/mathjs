//! Complex number operations (ported from src/wasm/complex/operations.ts)

use libm;

#[export_name = "complex_arg"]
pub unsafe extern "C" fn complex_arg(re: f64, im: f64) -> f64 {
    libm::atan2(im, re)
}

#[no_mangle]
pub unsafe extern "C" fn argArray(data_ptr: *const f64, len: i32, result_ptr: *mut f64) {
    for i in 0..len as usize {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = libm::atan2(im, re);
    }
}

#[no_mangle]
pub unsafe extern "C" fn conj(re: f64, im: f64, result_ptr: *mut f64) {
    *result_ptr = re;
    *result_ptr.add(1) = -im;
}

#[no_mangle]
pub unsafe extern "C" fn conjArray(data_ptr: *const f64, len: i32, result_ptr: *mut f64) {
    for i in 0..len as usize {
        let off = i * 2;
        *result_ptr.add(off) = *data_ptr.add(off);
        *result_ptr.add(off + 1) = -*data_ptr.add(off + 1);
    }
}

#[export_name = "complex_re"]
pub unsafe extern "C" fn complex_re(re: f64, _im: f64) -> f64 {
    re
}

#[no_mangle]
pub unsafe extern "C" fn reArray(data_ptr: *const f64, len: i32, result_ptr: *mut f64) {
    for i in 0..len as usize {
        *result_ptr.add(i) = *data_ptr.add(i * 2);
    }
}

#[export_name = "complex_im"]
pub unsafe extern "C" fn complex_im(_re: f64, im: f64) -> f64 {
    im
}

#[no_mangle]
pub unsafe extern "C" fn imArray(data_ptr: *const f64, len: i32, result_ptr: *mut f64) {
    for i in 0..len as usize {
        *result_ptr.add(i) = *data_ptr.add(i * 2 + 1);
    }
}

#[export_name = "complex_abs"]
pub unsafe extern "C" fn complex_abs(re: f64, im: f64) -> f64 {
    libm::sqrt(re * re + im * im)
}

#[export_name = "complex_absArray"]
pub unsafe extern "C" fn complex_abs_array(data_ptr: *const f64, len: i32, result_ptr: *mut f64) {
    for i in 0..len as usize {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = libm::sqrt(re * re + im * im);
    }
}

#[no_mangle]
pub unsafe extern "C" fn addComplex(re1: f64, im1: f64, re2: f64, im2: f64, result_ptr: *mut f64) {
    *result_ptr = re1 + re2;
    *result_ptr.add(1) = im1 + im2;
}

#[no_mangle]
pub unsafe extern "C" fn subComplex(re1: f64, im1: f64, re2: f64, im2: f64, result_ptr: *mut f64) {
    *result_ptr = re1 - re2;
    *result_ptr.add(1) = im1 - im2;
}

#[no_mangle]
pub unsafe extern "C" fn mulComplex(re1: f64, im1: f64, re2: f64, im2: f64, result_ptr: *mut f64) {
    *result_ptr = re1 * re2 - im1 * im2;
    *result_ptr.add(1) = re1 * im2 + im1 * re2;
}

#[no_mangle]
pub unsafe extern "C" fn divComplex(re1: f64, im1: f64, re2: f64, im2: f64, result_ptr: *mut f64) {
    let denom = re2 * re2 + im2 * im2;
    *result_ptr = (re1 * re2 + im1 * im2) / denom;
    *result_ptr.add(1) = (im1 * re2 - re1 * im2) / denom;
}

#[no_mangle]
pub unsafe extern "C" fn sqrtComplex(re: f64, im: f64, result_ptr: *mut f64) {
    let r = libm::sqrt(re * re + im * im);
    if im == 0.0 {
        if re >= 0.0 {
            *result_ptr = libm::sqrt(re);
            *result_ptr.add(1) = 0.0;
        } else {
            *result_ptr = 0.0;
            *result_ptr.add(1) = libm::sqrt(-re);
        }
    } else {
        *result_ptr = libm::sqrt((r + re) / 2.0);
        *result_ptr.add(1) = (if im >= 0.0 { 1.0 } else { -1.0 }) * libm::sqrt((r - re) / 2.0);
    }
}

#[no_mangle]
pub unsafe extern "C" fn expComplex(re: f64, im: f64, result_ptr: *mut f64) {
    let exp_re = libm::exp(re);
    *result_ptr = exp_re * libm::cos(im);
    *result_ptr.add(1) = exp_re * libm::sin(im);
}

#[no_mangle]
pub unsafe extern "C" fn logComplex(re: f64, im: f64, result_ptr: *mut f64) {
    *result_ptr = libm::log(libm::sqrt(re * re + im * im));
    *result_ptr.add(1) = libm::atan2(im, re);
}

#[no_mangle]
pub unsafe extern "C" fn sinComplex(re: f64, im: f64, result_ptr: *mut f64) {
    *result_ptr = libm::sin(re) * libm::cosh(im);
    *result_ptr.add(1) = libm::cos(re) * libm::sinh(im);
}

#[no_mangle]
pub unsafe extern "C" fn cosComplex(re: f64, im: f64, result_ptr: *mut f64) {
    *result_ptr = libm::cos(re) * libm::cosh(im);
    *result_ptr.add(1) = -libm::sin(re) * libm::sinh(im);
}

#[no_mangle]
pub unsafe extern "C" fn tanComplex(re: f64, im: f64, result_ptr: *mut f64) {
    let sin_re = libm::sin(re) * libm::cosh(im);
    let sin_im = libm::cos(re) * libm::sinh(im);
    let cos_re = libm::cos(re) * libm::cosh(im);
    let cos_im = -libm::sin(re) * libm::sinh(im);
    let denom = cos_re * cos_re + cos_im * cos_im;
    *result_ptr = (sin_re * cos_re + sin_im * cos_im) / denom;
    *result_ptr.add(1) = (sin_im * cos_re - sin_re * cos_im) / denom;
}

#[no_mangle]
pub unsafe extern "C" fn powComplexReal(re: f64, im: f64, n: f64, result_ptr: *mut f64) {
    let r = libm::sqrt(re * re + im * im);
    let theta = libm::atan2(im, re);
    let rn = libm::pow(r, n);
    let ntheta = n * theta;
    *result_ptr = rn * libm::cos(ntheta);
    *result_ptr.add(1) = rn * libm::sin(ntheta);
}
