//! Rust WASM backend for math.js
//!
//! Provides high-performance matrix operations compiled to WebAssembly.
//! All exported functions use `#[no_mangle] extern "C"` with camelCase names
//! to match the JavaScript calling convention.

#![no_std]

extern crate alloc;

pub mod matrix;

// Re-export all public functions from modules
pub use matrix::algorithms::*;
pub use matrix::basic::*;
pub use matrix::broadcast::*;
pub use matrix::complex_eigs::*;
pub use matrix::eigs::*;
pub use matrix::expm::*;
pub use matrix::linalg::*;
pub use matrix::multiply::*;
pub use matrix::rotation::*;
pub use matrix::sparse::*;
pub use matrix::sqrtm::*;

// ============================================================
// Spike probes (temporary — kept for compatibility)
// ============================================================

use alloc::vec;

/// faer: 2x2 matrix multiply probe
#[no_mangle]
pub unsafe extern "C" fn rust_mat_mul_2x2(a_ptr: *const f64, b_ptr: *const f64, out_ptr: *mut f64) {
    use faer::Mat;

    let a = Mat::from_fn(2, 2, |i, j| *a_ptr.add(i * 2 + j));
    let b = Mat::from_fn(2, 2, |i, j| *b_ptr.add(i * 2 + j));
    let c = &a * &b;

    for i in 0..2 {
        for j in 0..2 {
            *out_ptr.add(i * 2 + j) = c[(i, j)];
        }
    }
}

/// rustfft: FFT of 4 elements probe
#[no_mangle]
pub unsafe extern "C" fn rust_fft_4(in_ptr: *const f64, out_ptr: *mut f64) {
    use rustfft::num_complex::Complex64;
    use rustfft::FftPlanner;

    let mut planner = FftPlanner::<f64>::new();
    let fft = planner.plan_fft_forward(4);

    let mut buffer: alloc::vec::Vec<Complex64> = vec![Complex64::new(0.0, 0.0); 4];
    for i in 0..4 {
        buffer[i] = Complex64::new(*in_ptr.add(i * 2), *in_ptr.add(i * 2 + 1));
    }

    fft.process(&mut buffer);

    for i in 0..4 {
        *out_ptr.add(i * 2) = buffer[i].re;
        *out_ptr.add(i * 2 + 1) = buffer[i].im;
    }
}

/// statrs: gamma function probe
#[no_mangle]
pub unsafe extern "C" fn rust_gamma(x: f64, out_ptr: *mut f64) {
    use statrs::function::gamma::gamma;
    *out_ptr = gamma(x);
}
