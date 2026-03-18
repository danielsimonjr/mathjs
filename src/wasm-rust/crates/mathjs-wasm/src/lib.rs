//! Rust WASM backend for math.js
//!
//! Provides high-performance mathematical operations compiled to WebAssembly.
//! All exported functions use `#[no_mangle] extern "C"` with camelCase names
//! to match the JavaScript calling convention.

#![no_std]

extern crate alloc;

// ============================================================
// Existing modules (from prior phases)
// ============================================================
pub mod matrix;

// Re-export existing matrix functions
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
// Phase 3: Signal + SIMD modules
// ============================================================
pub mod signal;
pub mod simd;

// Re-export Phase 3 functions
pub use signal::fft::*;
pub use signal::processing::*;
pub use simd::operations::*;

// ============================================================
// Phase 4: Statistics + Numeric + Special modules
// ============================================================
pub mod numeric;
pub mod special;
pub mod statistics;

// Re-export Phase 4 functions
pub use numeric::calculus::*;
pub use numeric::interpolation::*;
pub use numeric::ode::*;
pub use numeric::rational::*;
pub use numeric::rootfinding::*;
pub use special::functions::*;
pub use statistics::basic::*;
pub use statistics::select::*;

// ============================================================
// Phase 2: Algebra modules
// ============================================================
pub mod algebra;

// Re-export algebra functions
pub use algebra::decomposition::*;
pub use algebra::equations::*;
pub use algebra::polynomial::*;
pub use algebra::schur::*;
pub use algebra::solver::*;
pub use algebra::sparse::amd::*;
pub use algebra::sparse::operations::*;
pub use algebra::sparse::utilities::*;
// pub use algebra::sparse_chol::*; // TODO: re-enable once sparse_chol.rs compiles
pub use algebra::sparse_lu::*;

// ============================================================
// Phase 5: Pure Rust port modules
// ============================================================
pub mod arithmetic;
pub mod bitwise;
pub mod combinatorics;
pub mod complex;
pub mod geometry;
pub mod logical;
pub mod plain;
pub mod probability;
pub mod relational;
pub mod set;
pub mod string_ops;
pub mod unit;
pub mod utils;

// Re-export all Phase 5 functions
pub use plain::arithmetic::*;
pub use plain::probability::*;
pub use plain::trigonometry::*;

pub use arithmetic::advanced::*;
pub use arithmetic::basic::*;
pub use arithmetic::logarithmic::*;

pub use bitwise::operations::*;
pub use combinatorics::basic::*;
pub use complex::operations::*;
pub use geometry::operations::*;
pub use logical::operations::*;
pub use probability::distributions::*;
pub use relational::operations::*;
pub use set::operations::*;
pub use string_ops::operations::*;
pub use unit::conversion::*;
pub use utils::checks::*;

// ============================================================
// Spike probes (temporary -- kept for compatibility)
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
