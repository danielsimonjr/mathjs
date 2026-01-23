/**
 * WASM-optimized Fast Fourier Transform (FFT)
 * Cooley-Tukey radix-2 decimation-in-time algorithm
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 * Complex numbers are represented as interleaved [real0, imag0, real1, imag1, ...]
 */

/**
 * FFT (Cooley-Tukey radix-2) - in-place
 * @param dataPtr - Pointer to complex data array [real0, imag0, real1, imag1, ...]
 * @param n - Number of complex samples (must be power of 2)
 * @param inverse - 1 for IFFT, 0 for FFT
 */
export function fft(dataPtr: usize, n: i32, inverse: i32): void {
  // Bit-reversal permutation
  bitReverse(dataPtr, n)

  // Cooley-Tukey decimation-in-time
  let size: i32 = 2
  while (size <= n) {
    const halfSize: i32 = size >> 1
    const step: f64 = ((inverse ? 1.0 : -1.0) * 2.0 * Math.PI) / <f64>size

    for (let i: i32 = 0; i < n; i += size) {
      let angle: f64 = 0.0

      for (let j: i32 = 0; j < halfSize; j++) {
        const cos: f64 = Math.cos(angle)
        const sin: f64 = Math.sin(angle)

        const idx1: usize = (<usize>((i + j) << 1)) << 3
        const idx2: usize = (<usize>((i + j + halfSize) << 1)) << 3

        const real1: f64 = load<f64>(dataPtr + idx1)
        const imag1: f64 = load<f64>(dataPtr + idx1 + 8)
        const real2: f64 = load<f64>(dataPtr + idx2)
        const imag2: f64 = load<f64>(dataPtr + idx2 + 8)

        // Complex multiplication: twiddle * data[idx2]
        const tReal: f64 = real2 * cos - imag2 * sin
        const tImag: f64 = real2 * sin + imag2 * cos

        // Butterfly operation
        store<f64>(dataPtr + idx1, real1 + tReal)
        store<f64>(dataPtr + idx1 + 8, imag1 + tImag)
        store<f64>(dataPtr + idx2, real1 - tReal)
        store<f64>(dataPtr + idx2 + 8, imag1 - tImag)

        angle += step
      }
    }

    size <<= 1
  }

  // Normalize for IFFT
  if (inverse) {
    const scale: f64 = 1.0 / <f64>n
    const total: i32 = n << 1
    for (let i: i32 = 0; i < total; i++) {
      const offset: usize = (<usize>i) << 3
      store<f64>(dataPtr + offset, load<f64>(dataPtr + offset) * scale)
    }
  }
}

/**
 * Bit-reversal permutation for FFT (in-place)
 */
function bitReverse(dataPtr: usize, n: i32): void {
  let j: i32 = 0

  for (let i: i32 = 0; i < n - 1; i++) {
    if (i < j) {
      // Swap complex numbers at positions i and j
      const idx1: usize = (<usize>(i << 1)) << 3
      const idx2: usize = (<usize>(j << 1)) << 3

      let temp: f64 = load<f64>(dataPtr + idx1)
      store<f64>(dataPtr + idx1, load<f64>(dataPtr + idx2))
      store<f64>(dataPtr + idx2, temp)

      temp = load<f64>(dataPtr + idx1 + 8)
      store<f64>(dataPtr + idx1 + 8, load<f64>(dataPtr + idx2 + 8))
      store<f64>(dataPtr + idx2 + 8, temp)
    }

    let k: i32 = n >> 1
    while (k <= j) {
      j -= k
      k >>= 1
    }
    j += k
  }
}

/**
 * 2D FFT for image processing and matrix operations
 * @param dataPtr - Pointer to 2D complex data (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param inverse - 1 for IFFT, 0 for FFT
 * @param workPtr - Pointer to work buffer (must be at least max(rows,cols)*2*8 bytes)
 */
export function fft2d(
  dataPtr: usize,
  rows: i32,
  cols: i32,
  inverse: i32,
  workPtr: usize
): void {
  // FFT on rows
  for (let i: i32 = 0; i < rows; i++) {
    // Extract row into work buffer
    const rowOffset: usize = (<usize>((i * cols) << 1)) << 3
    for (let j: i32 = 0; j < cols; j++) {
      const srcOffset: usize = rowOffset + ((<usize>(j << 1)) << 3)
      const dstOffset: usize = (<usize>(j << 1)) << 3
      store<f64>(workPtr + dstOffset, load<f64>(dataPtr + srcOffset))
      store<f64>(workPtr + dstOffset + 8, load<f64>(dataPtr + srcOffset + 8))
    }

    // Transform row
    fft(workPtr, cols, inverse)

    // Write back
    for (let j: i32 = 0; j < cols; j++) {
      const srcOffset: usize = (<usize>(j << 1)) << 3
      const dstOffset: usize = rowOffset + ((<usize>(j << 1)) << 3)
      store<f64>(dataPtr + dstOffset, load<f64>(workPtr + srcOffset))
      store<f64>(dataPtr + dstOffset + 8, load<f64>(workPtr + srcOffset + 8))
    }
  }

  // FFT on columns
  for (let j: i32 = 0; j < cols; j++) {
    // Extract column into work buffer
    for (let i: i32 = 0; i < rows; i++) {
      const srcOffset: usize = ((<usize>(i * cols + j)) << 1) << 3
      const dstOffset: usize = (<usize>(i << 1)) << 3
      store<f64>(workPtr + dstOffset, load<f64>(dataPtr + srcOffset))
      store<f64>(workPtr + dstOffset + 8, load<f64>(dataPtr + srcOffset + 8))
    }

    // Transform column
    fft(workPtr, rows, inverse)

    // Write back
    for (let i: i32 = 0; i < rows; i++) {
      const srcOffset: usize = (<usize>(i << 1)) << 3
      const dstOffset: usize = ((<usize>(i * cols + j)) << 1) << 3
      store<f64>(dataPtr + dstOffset, load<f64>(workPtr + srcOffset))
      store<f64>(dataPtr + dstOffset + 8, load<f64>(workPtr + srcOffset + 8))
    }
  }
}

/**
 * Convolution using FFT (circular convolution)
 * @param signalPtr - Pointer to input signal (complex format)
 * @param n - Length of signal (complex samples)
 * @param kernelPtr - Pointer to convolution kernel (complex format)
 * @param m - Length of kernel (complex samples)
 * @param resultPtr - Pointer to result buffer (must be size*2*8 bytes where size is next power of 2 of n+m-1)
 * @param workPtr - Pointer to work buffer (must be size*2*8 bytes)
 * @param size - Padded size (must be power of 2 >= n+m-1)
 */
export function convolve(
  signalPtr: usize,
  n: i32,
  kernelPtr: usize,
  m: i32,
  resultPtr: usize,
  workPtr: usize,
  size: i32
): void {
  // Copy signal to result (zero-padded)
  const totalSize: i32 = size << 1
  for (let i: i32 = 0; i < totalSize; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }
  for (let i: i32 = 0; i < n << 1; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(signalPtr + ((<usize>i) << 3))
    )
  }

  // Copy kernel to work buffer (zero-padded)
  for (let i: i32 = 0; i < totalSize; i++) {
    store<f64>(workPtr + ((<usize>i) << 3), 0.0)
  }
  for (let i: i32 = 0; i < m << 1; i++) {
    store<f64>(
      workPtr + ((<usize>i) << 3),
      load<f64>(kernelPtr + ((<usize>i) << 3))
    )
  }

  // Transform both signals
  fft(resultPtr, size, 0)
  fft(workPtr, size, 0)

  // Multiply in frequency domain
  for (let i: i32 = 0; i < size; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const real1: f64 = load<f64>(resultPtr + idx)
    const imag1: f64 = load<f64>(resultPtr + idx + 8)
    const real2: f64 = load<f64>(workPtr + idx)
    const imag2: f64 = load<f64>(workPtr + idx + 8)

    store<f64>(resultPtr + idx, real1 * real2 - imag1 * imag2)
    store<f64>(resultPtr + idx + 8, real1 * imag2 + imag1 * real2)
  }

  // Inverse transform
  fft(resultPtr, size, 1)
}

/**
 * Real FFT (for real-valued input, more efficient)
 * @param dataPtr - Pointer to real input data
 * @param n - Number of samples (must be power of 2)
 * @param resultPtr - Pointer to complex output [real0, imag0, ...]
 */
export function rfft(dataPtr: usize, n: i32, resultPtr: usize): void {
  // Convert to complex format
  for (let i: i32 = 0; i < n; i++) {
    const srcOffset: usize = (<usize>i) << 3
    const dstOffset: usize = (<usize>(i << 1)) << 3
    store<f64>(resultPtr + dstOffset, load<f64>(dataPtr + srcOffset))
    store<f64>(resultPtr + dstOffset + 8, 0.0)
  }

  // Perform complex FFT
  fft(resultPtr, n, 0)
}

/**
 * Inverse real FFT
 * @param dataPtr - Pointer to complex input [real0, imag0, ...]
 * @param n - Number of complex samples
 * @param resultPtr - Pointer to real output
 * @param workPtr - Pointer to work buffer (must be n*2*8 bytes)
 */
export function irfft(
  dataPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize
): void {
  // Copy to work buffer
  const totalSize: i32 = n << 1
  for (let i: i32 = 0; i < totalSize; i++) {
    store<f64>(
      workPtr + ((<usize>i) << 3),
      load<f64>(dataPtr + ((<usize>i) << 3))
    )
  }

  // Perform inverse FFT
  fft(workPtr, n, 1)

  // Extract real part
  for (let i: i32 = 0; i < n; i++) {
    const srcOffset: usize = (<usize>(i << 1)) << 3
    const dstOffset: usize = (<usize>i) << 3
    store<f64>(resultPtr + dstOffset, load<f64>(workPtr + srcOffset))
  }
}

/**
 * Check if n is a power of 2
 */
export function isPowerOf2(n: i32): i32 {
  return n > 0 && (n & (n - 1)) === 0 ? 1 : 0
}

/**
 * Compute power spectrum (magnitude squared) of a signal
 * @param dataPtr - Pointer to complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @param resultPtr - Pointer to power spectrum output (real values, length n)
 */
export function powerSpectrum(dataPtr: usize, n: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const real: f64 = load<f64>(dataPtr + idx)
    const imag: f64 = load<f64>(dataPtr + idx + 8)
    store<f64>(resultPtr + ((<usize>i) << 3), real * real + imag * imag)
  }
}

/**
 * Compute magnitude spectrum of a signal
 * @param dataPtr - Pointer to complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @param resultPtr - Pointer to magnitude spectrum output (real values, length n)
 */
export function magnitudeSpectrum(
  dataPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const real: f64 = load<f64>(dataPtr + idx)
    const imag: f64 = load<f64>(dataPtr + idx + 8)
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      Math.sqrt(real * real + imag * imag)
    )
  }
}

/**
 * Compute phase spectrum of a signal
 * @param dataPtr - Pointer to complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @param resultPtr - Pointer to phase spectrum output (in radians, length n)
 */
export function phaseSpectrum(dataPtr: usize, n: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const real: f64 = load<f64>(dataPtr + idx)
    const imag: f64 = load<f64>(dataPtr + idx + 8)
    store<f64>(resultPtr + ((<usize>i) << 3), Math.atan2(imag, real))
  }
}

/**
 * Cross-correlation using FFT
 * @param aPtr - Pointer to first signal (complex format)
 * @param n - Length of first signal (complex samples)
 * @param bPtr - Pointer to second signal (complex format)
 * @param m - Length of second signal (complex samples)
 * @param resultPtr - Pointer to result buffer (size*2*8 bytes where size is power of 2)
 * @param workPtr - Pointer to work buffer (size*2*8 bytes)
 * @param size - Padded size (must be power of 2 >= n+m-1)
 */
export function crossCorrelation(
  aPtr: usize,
  n: i32,
  bPtr: usize,
  m: i32,
  resultPtr: usize,
  workPtr: usize,
  size: i32
): void {
  // Copy a to result (zero-padded)
  const totalSize: i32 = size << 1
  for (let i: i32 = 0; i < totalSize; i++) {
    store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
  }
  for (let i: i32 = 0; i < n << 1; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(aPtr + ((<usize>i) << 3))
    )
  }

  // Copy b to work buffer (zero-padded)
  for (let i: i32 = 0; i < totalSize; i++) {
    store<f64>(workPtr + ((<usize>i) << 3), 0.0)
  }
  for (let i: i32 = 0; i < m << 1; i++) {
    store<f64>(workPtr + ((<usize>i) << 3), load<f64>(bPtr + ((<usize>i) << 3)))
  }

  // FFT of both signals
  fft(resultPtr, size, 0)
  fft(workPtr, size, 0)

  // Multiply A(f) by conjugate of B(f)
  for (let i: i32 = 0; i < size; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const aReal: f64 = load<f64>(resultPtr + idx)
    const aImag: f64 = load<f64>(resultPtr + idx + 8)
    const bReal: f64 = load<f64>(workPtr + idx)
    const bImag: f64 = -load<f64>(workPtr + idx + 8) // Conjugate

    store<f64>(resultPtr + idx, aReal * bReal - aImag * bImag)
    store<f64>(resultPtr + idx + 8, aReal * bImag + aImag * bReal)
  }

  // Inverse FFT
  fft(resultPtr, size, 1)
}

/**
 * Auto-correlation using FFT
 * @param signalPtr - Pointer to input signal (complex format)
 * @param n - Length of signal (complex samples)
 * @param resultPtr - Pointer to result buffer (size*2*8 bytes where size is power of 2)
 * @param workPtr - Pointer to work buffer (size*2*8 bytes)
 * @param size - Padded size (must be power of 2 >= 2*n-1)
 */
export function autoCorrelation(
  signalPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize,
  size: i32
): void {
  crossCorrelation(signalPtr, n, signalPtr, n, resultPtr, workPtr, size)
}

// ============================================================================
// SIMD-Accelerated Signal Processing
// ============================================================================

/**
 * SIMD-accelerated FFT butterfly operation
 * Processes butterfly operations 2 at a time using f64x2
 *
 * @param dataPtr - Pointer to complex data array
 * @param n - Number of complex samples (must be power of 2)
 * @param inverse - 1 for IFFT, 0 for FFT
 */
export function fftSIMD(dataPtr: usize, n: i32, inverse: i32): void {
  // Bit-reversal permutation (scalar - not easily SIMD-able)
  bitReverse(dataPtr, n)

  // Cooley-Tukey decimation-in-time with SIMD-accelerated butterflies
  let size: i32 = 2
  while (size <= n) {
    const halfSize: i32 = size >> 1
    const step: f64 = ((inverse ? 1.0 : -1.0) * 2.0 * Math.PI) / <f64>size

    for (let i: i32 = 0; i < n; i += size) {
      let angle: f64 = 0.0

      // Process butterflies
      for (let j: i32 = 0; j < halfSize; j++) {
        const cos: f64 = Math.cos(angle)
        const sin: f64 = Math.sin(angle)

        const idx1: usize = (<usize>((i + j) << 1)) << 3
        const idx2: usize = (<usize>((i + j + halfSize) << 1)) << 3

        // Load complex numbers as v128 (real, imag pairs)
        const c1: v128 = v128.load(dataPtr + idx1)
        const c2: v128 = v128.load(dataPtr + idx2)

        // Twiddle factor multiplication: (cos + i*sin) * (re2 + i*im2)
        // real = re2*cos - im2*sin, imag = re2*sin + im2*cos
        const real2: f64 = f64x2.extract_lane(c2, 0)
        const imag2: f64 = f64x2.extract_lane(c2, 1)
        const tReal: f64 = real2 * cos - imag2 * sin
        const tImag: f64 = real2 * sin + imag2 * cos
        const twiddle: v128 = f64x2.replace_lane(
          f64x2.replace_lane(f64x2.splat(0.0), 0, tReal),
          1,
          tImag
        )

        // Butterfly: c1 +/- twiddle
        v128.store(dataPtr + idx1, f64x2.add(c1, twiddle))
        v128.store(dataPtr + idx2, f64x2.sub(c1, twiddle))

        angle += step
      }
    }

    size <<= 1
  }

  // Normalize for IFFT using SIMD
  if (inverse) {
    const scale: f64 = 1.0 / <f64>n
    const scaleVec: v128 = f64x2.splat(scale)
    const total: i32 = n << 1

    let ii: i32 = 0
    const limit: i32 = total - 1
    for (; ii < limit; ii += 2) {
      const offset: usize = (<usize>ii) << 3
      v128.store(
        dataPtr + offset,
        f64x2.mul(v128.load(dataPtr + offset), scaleVec)
      )
    }
    // Handle remaining
    for (; ii < total; ii++) {
      const offset: usize = (<usize>ii) << 3
      store<f64>(dataPtr + offset, load<f64>(dataPtr + offset) * scale)
    }
  }
}

/**
 * SIMD-accelerated convolution
 * Uses SIMD for frequency domain multiplication
 *
 * @param signalPtr - Pointer to input signal (complex format)
 * @param n - Length of signal
 * @param kernelPtr - Pointer to kernel (complex format)
 * @param m - Length of kernel
 * @param resultPtr - Pointer to result buffer
 * @param workPtr - Pointer to work buffer
 * @param size - Padded size (power of 2)
 */
export function convolveSIMD(
  signalPtr: usize,
  n: i32,
  kernelPtr: usize,
  m: i32,
  resultPtr: usize,
  workPtr: usize,
  size: i32
): void {
  // Copy signal to result (zero-padded) using SIMD
  const totalSize: i32 = size << 1
  const zeroVec: v128 = f64x2.splat(0.0)

  let ii: i32 = 0
  let limit: i32 = totalSize - 1
  for (; ii < limit; ii += 2) {
    v128.store(resultPtr + ((<usize>ii) << 3), zeroVec)
  }
  for (; ii < totalSize; ii++) {
    store<f64>(resultPtr + ((<usize>ii) << 3), 0.0)
  }

  // Copy signal data
  ii = 0
  limit = (n << 1) - 1
  for (; ii < limit; ii += 2) {
    v128.store(
      resultPtr + ((<usize>ii) << 3),
      v128.load(signalPtr + ((<usize>ii) << 3))
    )
  }
  for (; ii < n << 1; ii++) {
    store<f64>(
      resultPtr + ((<usize>ii) << 3),
      load<f64>(signalPtr + ((<usize>ii) << 3))
    )
  }

  // Copy kernel (zero-padded) using SIMD
  ii = 0
  limit = totalSize - 1
  for (; ii < limit; ii += 2) {
    v128.store(workPtr + ((<usize>ii) << 3), zeroVec)
  }
  for (; ii < totalSize; ii++) {
    store<f64>(workPtr + ((<usize>ii) << 3), 0.0)
  }

  ii = 0
  limit = (m << 1) - 1
  for (; ii < limit; ii += 2) {
    v128.store(
      workPtr + ((<usize>ii) << 3),
      v128.load(kernelPtr + ((<usize>ii) << 3))
    )
  }
  for (; ii < m << 1; ii++) {
    store<f64>(
      workPtr + ((<usize>ii) << 3),
      load<f64>(kernelPtr + ((<usize>ii) << 3))
    )
  }

  // Transform both using SIMD FFT
  fftSIMD(resultPtr, size, 0)
  fftSIMD(workPtr, size, 0)

  // SIMD frequency domain multiplication (complex multiply)
  for (let i: i32 = 0; i < size; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const r1: v128 = v128.load(resultPtr + idx)
    const r2: v128 = v128.load(workPtr + idx)

    const real1: f64 = f64x2.extract_lane(r1, 0)
    const imag1: f64 = f64x2.extract_lane(r1, 1)
    const real2: f64 = f64x2.extract_lane(r2, 0)
    const imag2: f64 = f64x2.extract_lane(r2, 1)

    const resReal: f64 = real1 * real2 - imag1 * imag2
    const resImag: f64 = real1 * imag2 + imag1 * real2

    v128.store(
      resultPtr + idx,
      f64x2.replace_lane(
        f64x2.replace_lane(f64x2.splat(0.0), 0, resReal),
        1,
        resImag
      )
    )
  }

  // Inverse transform
  fftSIMD(resultPtr, size, 1)
}

/**
 * SIMD-accelerated power spectrum computation
 * Computes |X[k]|² for all k using f64x2 operations
 *
 * @param dataPtr - Pointer to complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @param resultPtr - Pointer to power spectrum output
 */
export function powerSpectrumSIMD(
  dataPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const complex: v128 = v128.load(dataPtr + idx)
    // Compute real² + imag² using SIMD multiply and horizontal add
    const squared: v128 = f64x2.mul(complex, complex)
    const power: f64 =
      f64x2.extract_lane(squared, 0) + f64x2.extract_lane(squared, 1)
    store<f64>(resultPtr + ((<usize>i) << 3), power)
  }
}

/**
 * SIMD-accelerated cross-correlation
 *
 * @param aPtr - Pointer to first signal (complex format)
 * @param n - Length of first signal
 * @param bPtr - Pointer to second signal (complex format)
 * @param m - Length of second signal
 * @param resultPtr - Pointer to result buffer
 * @param workPtr - Pointer to work buffer
 * @param size - Padded size (power of 2)
 */
export function crossCorrelationSIMD(
  aPtr: usize,
  n: i32,
  bPtr: usize,
  m: i32,
  resultPtr: usize,
  workPtr: usize,
  size: i32
): void {
  // Zero and copy using SIMD
  const totalSize: i32 = size << 1
  const zeroVec: v128 = f64x2.splat(0.0)

  let ii: i32 = 0
  let limit: i32 = totalSize - 1
  for (; ii < limit; ii += 2) {
    v128.store(resultPtr + ((<usize>ii) << 3), zeroVec)
    v128.store(workPtr + ((<usize>ii) << 3), zeroVec)
  }
  for (; ii < totalSize; ii++) {
    store<f64>(resultPtr + ((<usize>ii) << 3), 0.0)
    store<f64>(workPtr + ((<usize>ii) << 3), 0.0)
  }

  // Copy data
  ii = 0
  limit = (n << 1) - 1
  for (; ii < limit; ii += 2) {
    v128.store(
      resultPtr + ((<usize>ii) << 3),
      v128.load(aPtr + ((<usize>ii) << 3))
    )
  }
  for (; ii < n << 1; ii++) {
    store<f64>(
      resultPtr + ((<usize>ii) << 3),
      load<f64>(aPtr + ((<usize>ii) << 3))
    )
  }

  ii = 0
  limit = (m << 1) - 1
  for (; ii < limit; ii += 2) {
    v128.store(
      workPtr + ((<usize>ii) << 3),
      v128.load(bPtr + ((<usize>ii) << 3))
    )
  }
  for (; ii < m << 1; ii++) {
    store<f64>(
      workPtr + ((<usize>ii) << 3),
      load<f64>(bPtr + ((<usize>ii) << 3))
    )
  }

  // FFT both
  fftSIMD(resultPtr, size, 0)
  fftSIMD(workPtr, size, 0)

  // Multiply A(f) by conjugate of B(f)
  for (let i: i32 = 0; i < size; i++) {
    const idx: usize = (<usize>(i << 1)) << 3
    const a: v128 = v128.load(resultPtr + idx)
    const b: v128 = v128.load(workPtr + idx)

    const aReal: f64 = f64x2.extract_lane(a, 0)
    const aImag: f64 = f64x2.extract_lane(a, 1)
    const bReal: f64 = f64x2.extract_lane(b, 0)
    const bImag: f64 = -f64x2.extract_lane(b, 1) // Conjugate

    const resReal: f64 = aReal * bReal - aImag * bImag
    const resImag: f64 = aReal * bImag + aImag * bReal

    v128.store(
      resultPtr + idx,
      f64x2.replace_lane(
        f64x2.replace_lane(f64x2.splat(0.0), 0, resReal),
        1,
        resImag
      )
    )
  }

  // Inverse FFT
  fftSIMD(resultPtr, size, 1)
}
