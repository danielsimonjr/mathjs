/**
 * WASM-optimized Fast Fourier Transform (FFT)
 * Cooley-Tukey radix-2 decimation-in-time algorithm
 *
 * All functions return new arrays for proper WASM/JS interop
 */

/**
 * Complex number representation (interleaved real/imaginary)
 * [real0, imag0, real1, imag1, ...]
 */

/**
 * FFT (Cooley-Tukey radix-2)
 * @param data - Complex data array [real0, imag0, real1, imag1, ...]
 * @param n - Number of complex samples (must be power of 2)
 * @param inverse - 1 for IFFT, 0 for FFT
 * @returns Transformed complex data
 */
export function fft(data: Float64Array, n: i32, inverse: i32): Float64Array {
  // Copy data
  const result = new Float64Array(n << 1)
  for (let i: i32 = 0; i < n << 1; i++) {
    result[i] = data[i]
  }

  // Bit-reversal permutation
  bitReverse(result, n)

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

        const idx1: i32 = (i + j) << 1
        const idx2: i32 = (i + j + halfSize) << 1

        const real1: f64 = result[idx1]
        const imag1: f64 = result[idx1 + 1]
        const real2: f64 = result[idx2]
        const imag2: f64 = result[idx2 + 1]

        // Complex multiplication: twiddle * result[idx2]
        const tReal: f64 = real2 * cos - imag2 * sin
        const tImag: f64 = real2 * sin + imag2 * cos

        // Butterfly operation
        result[idx1] = real1 + tReal
        result[idx1 + 1] = imag1 + tImag
        result[idx2] = real1 - tReal
        result[idx2 + 1] = imag1 - tImag

        angle += step
      }
    }

    size <<= 1
  }

  // Normalize for IFFT
  if (inverse) {
    const scale: f64 = 1.0 / <f64>n
    for (let i: i32 = 0; i < n << 1; i++) {
      result[i] *= scale
    }
  }

  return result
}

/**
 * Bit-reversal permutation for FFT (in-place)
 */
function bitReverse(data: Float64Array, n: i32): void {
  let j: i32 = 0

  for (let i: i32 = 0; i < n - 1; i++) {
    if (i < j) {
      // Swap complex numbers at positions i and j
      const idx1: i32 = i << 1
      const idx2: i32 = j << 1

      let temp: f64 = data[idx1]
      data[idx1] = data[idx2]
      data[idx2] = temp

      temp = data[idx1 + 1]
      data[idx1 + 1] = data[idx2 + 1]
      data[idx2 + 1] = temp
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
 * @param data - 2D complex data (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param inverse - 1 for IFFT, 0 for FFT
 * @returns Transformed 2D complex data
 */
export function fft2d(
  data: Float64Array,
  rows: i32,
  cols: i32,
  inverse: i32
): Float64Array {
  // Copy data
  const result = new Float64Array(rows * cols * 2)
  for (let i: i32 = 0; i < rows * cols * 2; i++) {
    result[i] = data[i]
  }

  // FFT on rows
  const rowData: Float64Array = new Float64Array(cols << 1)
  for (let i: i32 = 0; i < rows; i++) {
    // Extract row
    for (let j: i32 = 0; j < cols; j++) {
      const idx: i32 = (i * cols + j) << 1
      rowData[j << 1] = result[idx]
      rowData[(j << 1) + 1] = result[idx + 1]
    }

    // Transform row
    const transformedRow = fftInPlace(rowData, cols, inverse)

    // Write back
    for (let j: i32 = 0; j < cols; j++) {
      const idx: i32 = (i * cols + j) << 1
      result[idx] = transformedRow[j << 1]
      result[idx + 1] = transformedRow[(j << 1) + 1]
    }
  }

  // FFT on columns
  const colData: Float64Array = new Float64Array(rows << 1)
  for (let j: i32 = 0; j < cols; j++) {
    // Extract column
    for (let i: i32 = 0; i < rows; i++) {
      const idx: i32 = (i * cols + j) << 1
      colData[i << 1] = result[idx]
      colData[(i << 1) + 1] = result[idx + 1]
    }

    // Transform column
    const transformedCol = fftInPlace(colData, rows, inverse)

    // Write back
    for (let i: i32 = 0; i < rows; i++) {
      const idx: i32 = (i * cols + j) << 1
      result[idx] = transformedCol[i << 1]
      result[idx + 1] = transformedCol[(i << 1) + 1]
    }
  }

  return result
}

/**
 * Internal in-place FFT helper
 */
function fftInPlace(data: Float64Array, n: i32, inverse: i32): Float64Array {
  // Bit-reversal permutation
  bitReverse(data, n)

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

        const idx1: i32 = (i + j) << 1
        const idx2: i32 = (i + j + halfSize) << 1

        const real1: f64 = data[idx1]
        const imag1: f64 = data[idx1 + 1]
        const real2: f64 = data[idx2]
        const imag2: f64 = data[idx2 + 1]

        const tReal: f64 = real2 * cos - imag2 * sin
        const tImag: f64 = real2 * sin + imag2 * cos

        data[idx1] = real1 + tReal
        data[idx1 + 1] = imag1 + tImag
        data[idx2] = real1 - tReal
        data[idx2 + 1] = imag1 - tImag

        angle += step
      }
    }

    size <<= 1
  }

  // Normalize for IFFT
  if (inverse) {
    const scale: f64 = 1.0 / <f64>n
    for (let i: i32 = 0; i < n << 1; i++) {
      data[i] *= scale
    }
  }

  return data
}

/**
 * Convolution using FFT (circular convolution)
 * @param signal - Input signal (real)
 * @param n - Length of signal
 * @param kernel - Convolution kernel (real)
 * @param m - Length of kernel
 * @returns Convolution result (real)
 */
export function convolve(
  signal: Float64Array,
  n: i32,
  kernel: Float64Array,
  m: i32
): Float64Array {
  // Find next power of 2
  const size: i32 = nextPowerOf2(n + m - 1)

  // Pad and convert to complex
  const signalComplex: Float64Array = new Float64Array(size << 1)
  const kernelComplex: Float64Array = new Float64Array(size << 1)

  for (let i: i32 = 0; i < n; i++) {
    signalComplex[i << 1] = signal[i]
  }
  for (let i: i32 = 0; i < m; i++) {
    kernelComplex[i << 1] = kernel[i]
  }

  // Transform both signals
  const signalFFT = fft(signalComplex, size, 0)
  const kernelFFT = fft(kernelComplex, size, 0)

  // Multiply in frequency domain
  const productFFT = new Float64Array(size << 1)
  for (let i: i32 = 0; i < size; i++) {
    const idx: i32 = i << 1
    const real1: f64 = signalFFT[idx]
    const imag1: f64 = signalFFT[idx + 1]
    const real2: f64 = kernelFFT[idx]
    const imag2: f64 = kernelFFT[idx + 1]

    productFFT[idx] = real1 * real2 - imag1 * imag2
    productFFT[idx + 1] = real1 * imag2 + imag1 * real2
  }

  // Inverse transform
  const convolved = fft(productFFT, size, 1)

  // Extract real part
  const result = new Float64Array(n + m - 1)
  for (let i: i32 = 0; i < n + m - 1; i++) {
    result[i] = convolved[i << 1]
  }

  return result
}

/**
 * Real FFT (for real-valued input, more efficient)
 * @param data - Real input data
 * @param n - Number of samples (must be power of 2)
 * @returns Complex output [real0, imag0, ...]
 */
export function rfft(data: Float64Array, n: i32): Float64Array {
  // Convert to complex format
  const complex = new Float64Array(n << 1)
  for (let i: i32 = 0; i < n; i++) {
    complex[i << 1] = data[i]
    complex[(i << 1) + 1] = 0.0
  }

  // Perform complex FFT
  return fft(complex, n, 0)
}

/**
 * Inverse real FFT
 * @param data - Complex input [real0, imag0, ...]
 * @param n - Number of complex samples
 * @returns Real output
 */
export function irfft(data: Float64Array, n: i32): Float64Array {
  // Perform inverse FFT
  const temp = fft(data, n, 1)

  // Extract real part
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = temp[i << 1]
  }

  return result
}

// Helper function: find next power of 2
function nextPowerOf2(n: i32): i32 {
  let power: i32 = 1
  while (power < n) {
    power <<= 1
  }
  return power
}

/**
 * Check if n is a power of 2
 */
export function isPowerOf2(n: i32): i32 {
  return n > 0 && (n & (n - 1)) === 0 ? 1 : 0
}

/**
 * Inverse FFT (convenience wrapper)
 * @param data - Complex data array [real0, imag0, real1, imag1, ...]
 * @param n - Number of complex samples (must be power of 2)
 * @returns Inverse transformed complex data
 */
export function ifft(data: Float64Array, n: i32): Float64Array {
  return fft(data, n, 1)
}

/**
 * Inverse 2D FFT (convenience wrapper)
 * @param data - 2D complex data (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Inverse transformed 2D complex data
 */
export function ifft2d(data: Float64Array, rows: i32, cols: i32): Float64Array {
  return fft2d(data, rows, cols, 1)
}

/**
 * Compute power spectrum (magnitude squared) of a signal
 * @param data - Complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @returns Power spectrum (real values, length n)
 */
export function powerSpectrum(data: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const idx: i32 = i << 1
    const real: f64 = data[idx]
    const imag: f64 = data[idx + 1]
    result[i] = real * real + imag * imag
  }

  return result
}

/**
 * Compute magnitude spectrum of a signal
 * @param data - Complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @returns Magnitude spectrum (real values, length n)
 */
export function magnitudeSpectrum(data: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const idx: i32 = i << 1
    const real: f64 = data[idx]
    const imag: f64 = data[idx + 1]
    result[i] = Math.sqrt(real * real + imag * imag)
  }

  return result
}

/**
 * Compute phase spectrum of a signal
 * @param data - Complex FFT data [real0, imag0, ...]
 * @param n - Number of complex samples
 * @returns Phase spectrum (in radians, length n)
 */
export function phaseSpectrum(data: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const idx: i32 = i << 1
    result[i] = Math.atan2(data[idx + 1], data[idx])
  }

  return result
}

/**
 * Cross-correlation using FFT
 * @param a - First signal (real)
 * @param n - Length of first signal
 * @param b - Second signal (real)
 * @param m - Length of second signal
 * @returns Cross-correlation result (real)
 */
export function crossCorrelation(
  a: Float64Array,
  n: i32,
  b: Float64Array,
  m: i32
): Float64Array {
  // Size for FFT
  const size: i32 = nextPowerOf2(n + m - 1)

  // Convert to complex and pad
  const aComplex = new Float64Array(size << 1)
  const bComplex = new Float64Array(size << 1)

  for (let i: i32 = 0; i < n; i++) {
    aComplex[i << 1] = a[i]
  }
  for (let i: i32 = 0; i < m; i++) {
    bComplex[i << 1] = b[i]
  }

  // FFT of both signals
  const aFFT = fft(aComplex, size, 0)
  const bFFT = fft(bComplex, size, 0)

  // Multiply A(f) by conjugate of B(f)
  const product = new Float64Array(size << 1)
  for (let i: i32 = 0; i < size; i++) {
    const idx: i32 = i << 1
    const aReal: f64 = aFFT[idx]
    const aImag: f64 = aFFT[idx + 1]
    const bReal: f64 = bFFT[idx]
    const bImag: f64 = -bFFT[idx + 1] // Conjugate

    product[idx] = aReal * bReal - aImag * bImag
    product[idx + 1] = aReal * bImag + aImag * bReal
  }

  // Inverse FFT
  const corr = fft(product, size, 1)

  // Extract real part
  const result = new Float64Array(n + m - 1)
  for (let i: i32 = 0; i < n + m - 1; i++) {
    result[i] = corr[i << 1]
  }

  return result
}

/**
 * Auto-correlation using FFT
 * @param signal - Input signal (real)
 * @param n - Length of signal
 * @returns Auto-correlation result (real)
 */
export function autoCorrelation(signal: Float64Array, n: i32): Float64Array {
  return crossCorrelation(signal, n, signal, n)
}
