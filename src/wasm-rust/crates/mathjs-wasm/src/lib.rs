//! Minimal spike to verify crate compatibility with wasm32-unknown-unknown.
//!
//! Each function tests that a key dependency compiles to WASM.
//! These are NOT production implementations — just compilation probes.

#![no_std]

extern crate alloc;

use alloc::vec;

// ============================================================
// Global allocator required for no_std + cdylib WASM
// ============================================================
// wee_alloc is tiny but we can use the default allocator approach.
// For now, we need a minimal allocator. We'll try without one first
// and add if needed.

// ============================================================
// faer: 2x2 matrix multiply probe
// ============================================================
// Reads two 2x2 matrices (4 f64 each) from input pointers,
// writes the product to the output pointer.
// Memory layout: row-major, [a00, a01, a10, a11]
#[no_mangle]
pub unsafe extern "C" fn rust_mat_mul_2x2(a_ptr: *const f64, b_ptr: *const f64, out_ptr: *mut f64) {
    use faer::Mat;

    // Read 2x2 matrices from raw pointers
    let a = Mat::from_fn(2, 2, |i, j| *a_ptr.add(i * 2 + j));
    let b = Mat::from_fn(2, 2, |i, j| *b_ptr.add(i * 2 + j));

    let c = &a * &b;

    // Write result
    for i in 0..2 {
        for j in 0..2 {
            *out_ptr.add(i * 2 + j) = c[(i, j)];
        }
    }
}

// ============================================================
// rustfft: FFT of 4 elements probe
// ============================================================
// Reads 4 complex numbers (8 f64: [re0, im0, re1, im1, ...]) from input,
// computes forward FFT in-place, writes result to output pointer.
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

// ============================================================
// statrs: gamma function probe
// ============================================================
// Computes gamma(x) and writes result to output pointer.
#[no_mangle]
pub unsafe extern "C" fn rust_gamma(x: f64, out_ptr: *mut f64) {
    use statrs::function::gamma::gamma;
    *out_ptr = gamma(x);
}
