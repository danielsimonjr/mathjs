//! FFT (Fast Fourier Transform) operations using rustfft.
//!
//! Complex numbers are interleaved [real0, imag0, real1, imag1, ...].
//! All pointers are raw WASM linear memory addresses.

use alloc::vec::Vec;
use rustfft::num_complex::Complex64;
use rustfft::FftPlanner;

/// In-place FFT/IFFT on interleaved complex data.
///
/// # Safety
/// `dataPtr` must point to `2*n` f64 values (interleaved real/imag).
#[no_mangle]
pub unsafe extern "C" fn fft(data_ptr: *mut f64, n: i32, inverse: i32) {
    let n = n as usize;
    if n == 0 {
        return;
    }

    let mut planner = FftPlanner::<f64>::new();
    let plan = if inverse != 0 {
        planner.plan_fft_inverse(n)
    } else {
        planner.plan_fft_forward(n)
    };

    // Build Complex64 buffer from interleaved data
    let mut buffer: Vec<Complex64> = Vec::with_capacity(n);
    for i in 0..n {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        buffer.push(Complex64::new(re, im));
    }

    plan.process(&mut buffer);

    // Write back, with IFFT normalization
    if inverse != 0 {
        let scale = 1.0 / n as f64;
        for i in 0..n {
            *data_ptr.add(i * 2) = buffer[i].re * scale;
            *data_ptr.add(i * 2 + 1) = buffer[i].im * scale;
        }
    } else {
        for i in 0..n {
            *data_ptr.add(i * 2) = buffer[i].re;
            *data_ptr.add(i * 2 + 1) = buffer[i].im;
        }
    }
}

/// 2D FFT on row-major interleaved complex data.
///
/// # Safety
/// - `dataPtr` must point to `2*rows*cols` f64 values.
/// - `workPtr` must point to `2*max(rows,cols)` f64 values.
#[no_mangle]
pub unsafe extern "C" fn fft2d(
    data_ptr: *mut f64,
    rows: i32,
    cols: i32,
    inverse: i32,
    work_ptr: *mut f64,
) {
    let rows = rows as usize;
    let cols = cols as usize;

    // FFT on each row
    for i in 0..rows {
        let row_off = i * cols * 2;
        for j in 0..(cols * 2) {
            *work_ptr.add(j) = *data_ptr.add(row_off + j);
        }
        fft(work_ptr, cols as i32, inverse);
        for j in 0..(cols * 2) {
            *data_ptr.add(row_off + j) = *work_ptr.add(j);
        }
    }

    // FFT on each column
    for j in 0..cols {
        for i in 0..rows {
            let src = (i * cols + j) * 2;
            *work_ptr.add(i * 2) = *data_ptr.add(src);
            *work_ptr.add(i * 2 + 1) = *data_ptr.add(src + 1);
        }
        fft(work_ptr, rows as i32, inverse);
        for i in 0..rows {
            let dst = (i * cols + j) * 2;
            *data_ptr.add(dst) = *work_ptr.add(i * 2);
            *data_ptr.add(dst + 1) = *work_ptr.add(i * 2 + 1);
        }
    }
}

/// Circular convolution via FFT.
///
/// # Safety
/// - `signalPtr` has `2*n` f64, `kernelPtr` has `2*m` f64.
/// - `resultPtr` and `workPtr` each have `2*size` f64.
/// - `size` must be power of 2 >= n+m-1.
#[no_mangle]
pub unsafe extern "C" fn convolve(
    signal_ptr: *const f64,
    n: i32,
    kernel_ptr: *const f64,
    m: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
    size: i32,
) {
    let n = n as usize;
    let m = m as usize;
    let size = size as usize;
    let total = size * 2;

    // Zero result, copy signal
    for i in 0..total {
        *result_ptr.add(i) = 0.0;
    }
    for i in 0..(n * 2) {
        *result_ptr.add(i) = *signal_ptr.add(i);
    }

    // Zero work, copy kernel
    for i in 0..total {
        *work_ptr.add(i) = 0.0;
    }
    for i in 0..(m * 2) {
        *work_ptr.add(i) = *kernel_ptr.add(i);
    }

    // Forward FFT both
    fft(result_ptr, size as i32, 0);
    fft(work_ptr, size as i32, 0);

    // Frequency-domain complex multiply
    for i in 0..size {
        let idx = i * 2;
        let r1 = *result_ptr.add(idx);
        let i1 = *result_ptr.add(idx + 1);
        let r2 = *work_ptr.add(idx);
        let i2 = *work_ptr.add(idx + 1);
        *result_ptr.add(idx) = r1 * r2 - i1 * i2;
        *result_ptr.add(idx + 1) = r1 * i2 + i1 * r2;
    }

    // Inverse FFT
    fft(result_ptr, size as i32, 1);
}

/// Real FFT: real input -> complex output.
///
/// # Safety
/// - `dataPtr` has `n` f64 (real values).
/// - `resultPtr` has `2*n` f64 (interleaved complex).
#[no_mangle]
pub unsafe extern "C" fn rfft(data_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        *result_ptr.add(i * 2) = *data_ptr.add(i);
        *result_ptr.add(i * 2 + 1) = 0.0;
    }
    fft(result_ptr, n as i32, 0);
}

/// Inverse real FFT: complex input -> real output.
///
/// # Safety
/// - `dataPtr` has `2*n` f64 (interleaved complex).
/// - `resultPtr` has `n` f64 (real output).
/// - `workPtr` has `2*n` f64.
#[no_mangle]
pub unsafe extern "C" fn irfft(
    data_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    for i in 0..(n * 2) {
        *work_ptr.add(i) = *data_ptr.add(i);
    }
    fft(work_ptr, n as i32, 1);
    for i in 0..n {
        *result_ptr.add(i) = *work_ptr.add(i * 2);
    }
}

/// Check if n is a power of 2.
#[no_mangle]
pub extern "C" fn isPowerOf2(n: i32) -> i32 {
    if n > 0 && (n & (n - 1)) == 0 {
        1
    } else {
        0
    }
}

/// Power spectrum: |X[k]|^2 for each k.
///
/// # Safety
/// - `dataPtr` has `2*n` f64 (interleaved complex).
/// - `resultPtr` has `n` f64.
#[no_mangle]
pub unsafe extern "C" fn powerSpectrum(data_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = re * re + im * im;
    }
}

/// Magnitude spectrum: |X[k]| for each k.
///
/// # Safety
/// - `dataPtr` has `2*n` f64 (interleaved complex).
/// - `resultPtr` has `n` f64.
#[no_mangle]
pub unsafe extern "C" fn magnitudeSpectrum(data_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = libm::sqrt(re * re + im * im);
    }
}

/// Phase spectrum: angle(X[k]) for each k.
///
/// # Safety
/// - `dataPtr` has `2*n` f64 (interleaved complex).
/// - `resultPtr` has `n` f64.
#[no_mangle]
pub unsafe extern "C" fn phaseSpectrum(data_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let re = *data_ptr.add(i * 2);
        let im = *data_ptr.add(i * 2 + 1);
        *result_ptr.add(i) = libm::atan2(im, re);
    }
}

/// Cross-correlation via FFT: corr(a, b) = IFFT(FFT(a) * conj(FFT(b))).
///
/// # Safety
/// Same layout as convolve.
#[no_mangle]
pub unsafe extern "C" fn crossCorrelation(
    a_ptr: *const f64,
    n: i32,
    b_ptr: *const f64,
    m: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
    size: i32,
) {
    let n_us = n as usize;
    let m_us = m as usize;
    let size_us = size as usize;
    let total = size_us * 2;

    // Zero and copy a -> result
    for i in 0..total {
        *result_ptr.add(i) = 0.0;
    }
    for i in 0..(n_us * 2) {
        *result_ptr.add(i) = *a_ptr.add(i);
    }

    // Zero and copy b -> work
    for i in 0..total {
        *work_ptr.add(i) = 0.0;
    }
    for i in 0..(m_us * 2) {
        *work_ptr.add(i) = *b_ptr.add(i);
    }

    fft(result_ptr, size, 0);
    fft(work_ptr, size, 0);

    // Multiply A(f) by conjugate of B(f)
    for i in 0..size_us {
        let idx = i * 2;
        let ar = *result_ptr.add(idx);
        let ai = *result_ptr.add(idx + 1);
        let br = *work_ptr.add(idx);
        let bi = -*work_ptr.add(idx + 1); // conjugate
        *result_ptr.add(idx) = ar * br - ai * bi;
        *result_ptr.add(idx + 1) = ar * bi + ai * br;
    }

    fft(result_ptr, size, 1);
}

/// Auto-correlation via FFT.
///
/// # Safety
/// Same as crossCorrelation but signal is correlated with itself.
#[no_mangle]
pub unsafe extern "C" fn autoCorrelation(
    signal_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
    size: i32,
) {
    crossCorrelation(signal_ptr, n, signal_ptr, n, result_ptr, work_ptr, size);
}

/// SIMD-accelerated FFT (in Rust, LLVM auto-vectorizes -- same impl as fft).
#[no_mangle]
pub unsafe extern "C" fn fftSIMD(data_ptr: *mut f64, n: i32, inverse: i32) {
    fft(data_ptr, n, inverse);
}

/// SIMD-accelerated convolution (delegates to convolve).
#[no_mangle]
pub unsafe extern "C" fn convolveSIMD(
    signal_ptr: *const f64,
    n: i32,
    kernel_ptr: *const f64,
    m: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
    size: i32,
) {
    convolve(signal_ptr, n, kernel_ptr, m, result_ptr, work_ptr, size);
}

/// SIMD-accelerated power spectrum (delegates to powerSpectrum).
#[no_mangle]
pub unsafe extern "C" fn powerSpectrumSIMD(data_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    powerSpectrum(data_ptr, n, result_ptr);
}

/// SIMD-accelerated cross-correlation (delegates to crossCorrelation).
#[no_mangle]
pub unsafe extern "C" fn crossCorrelationSIMD(
    a_ptr: *const f64,
    n: i32,
    b_ptr: *const f64,
    m: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
    size: i32,
) {
    crossCorrelation(a_ptr, n, b_ptr, m, result_ptr, work_ptr, size);
}
