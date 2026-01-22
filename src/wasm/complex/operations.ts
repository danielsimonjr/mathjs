/**
 * WASM-optimized complex number operations using AssemblyScript
 * Complex numbers are represented as interleaved pairs [real, imag]
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Compute the argument (phase angle) of a complex number
 * @param re - Real part
 * @param im - Imaginary part
 * @returns The argument in radians
 */
export function arg(re: f64, im: f64): f64 {
  return Math.atan2(im, re)
}

/**
 * Compute the argument for an array of complex numbers
 * @param dataPtr - Pointer to interleaved array [re0, im0, re1, im1, ...]
 * @param len - Number of complex numbers
 * @param resultPtr - Pointer to output array of arguments
 */
export function argArray(dataPtr: usize, len: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < len; i++) {
    const srcOffset: usize = <usize>(i << 1) << 3
    const dstOffset: usize = <usize>i << 3
    const re: f64 = load<f64>(dataPtr + srcOffset)
    const im: f64 = load<f64>(dataPtr + srcOffset + 8)
    store<f64>(resultPtr + dstOffset, Math.atan2(im, re))
  }
}

/**
 * Compute the complex conjugate and store in result
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, -imag]
 */
export function conj(re: f64, im: f64, resultPtr: usize): void {
  store<f64>(resultPtr, re)
  store<f64>(resultPtr + 8, -im)
}

/**
 * Compute the complex conjugate for an array of complex numbers
 * @param dataPtr - Pointer to interleaved array [re0, im0, re1, im1, ...]
 * @param len - Number of complex numbers
 * @param resultPtr - Pointer to output conjugated array
 */
export function conjArray(dataPtr: usize, len: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < len; i++) {
    const offset: usize = <usize>(i << 1) << 3
    store<f64>(resultPtr + offset, load<f64>(dataPtr + offset)) // real part unchanged
    store<f64>(resultPtr + offset + 8, -load<f64>(dataPtr + offset + 8)) // imaginary part negated
  }
}

/**
 * Get the real part of a complex number
 * @param re - Real part
 * @param im - Imaginary part (unused but included for API consistency)
 * @returns The real part
 */
export function re(re: f64, im: f64): f64 {
  return re
}

/**
 * Get the real parts from an array of complex numbers
 * @param dataPtr - Pointer to interleaved array [re0, im0, re1, im1, ...]
 * @param len - Number of complex numbers
 * @param resultPtr - Pointer to output array of real parts
 */
export function reArray(dataPtr: usize, len: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < len; i++) {
    const srcOffset: usize = <usize>(i << 1) << 3
    const dstOffset: usize = <usize>i << 3
    store<f64>(resultPtr + dstOffset, load<f64>(dataPtr + srcOffset))
  }
}

/**
 * Get the imaginary part of a complex number
 * @param re - Real part (unused but included for API consistency)
 * @param im - Imaginary part
 * @returns The imaginary part
 */
export function im(re: f64, im: f64): f64 {
  return im
}

/**
 * Get the imaginary parts from an array of complex numbers
 * @param dataPtr - Pointer to interleaved array [re0, im0, re1, im1, ...]
 * @param len - Number of complex numbers
 * @param resultPtr - Pointer to output array of imaginary parts
 */
export function imArray(dataPtr: usize, len: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < len; i++) {
    const srcOffset: usize = <usize>(i << 1) << 3 + 8
    const dstOffset: usize = <usize>i << 3
    store<f64>(resultPtr + dstOffset, load<f64>(dataPtr + srcOffset))
  }
}

/**
 * Compute the absolute value (magnitude) of a complex number
 * @param re - Real part
 * @param im - Imaginary part
 * @returns The magnitude sqrt(re^2 + im^2)
 */
export function abs(re: f64, im: f64): f64 {
  return Math.sqrt(re * re + im * im)
}

/**
 * Compute absolute values for an array of complex numbers
 * @param dataPtr - Pointer to interleaved array [re0, im0, re1, im1, ...]
 * @param len - Number of complex numbers
 * @param resultPtr - Pointer to output array of magnitudes
 */
export function absArray(dataPtr: usize, len: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < len; i++) {
    const srcOffset: usize = <usize>(i << 1) << 3
    const dstOffset: usize = <usize>i << 3
    const re: f64 = load<f64>(dataPtr + srcOffset)
    const im: f64 = load<f64>(dataPtr + srcOffset + 8)
    store<f64>(resultPtr + dstOffset, Math.sqrt(re * re + im * im))
  }
}

/**
 * Add two complex numbers
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @param resultPtr - Pointer to output [real, imag]
 */
export function addComplex(
  re1: f64,
  im1: f64,
  re2: f64,
  im2: f64,
  resultPtr: usize
): void {
  store<f64>(resultPtr, re1 + re2)
  store<f64>(resultPtr + 8, im1 + im2)
}

/**
 * Subtract two complex numbers
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @param resultPtr - Pointer to output [real, imag]
 */
export function subComplex(
  re1: f64,
  im1: f64,
  re2: f64,
  im2: f64,
  resultPtr: usize
): void {
  store<f64>(resultPtr, re1 - re2)
  store<f64>(resultPtr + 8, im1 - im2)
}

/**
 * Multiply two complex numbers
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @param resultPtr - Pointer to output [real, imag]
 */
export function mulComplex(
  re1: f64,
  im1: f64,
  re2: f64,
  im2: f64,
  resultPtr: usize
): void {
  store<f64>(resultPtr, re1 * re2 - im1 * im2)
  store<f64>(resultPtr + 8, re1 * im2 + im1 * re2)
}

/**
 * Divide two complex numbers
 * (a + bi)/(c + di) = ((ac + bd) + (bc - ad)i) / (c^2 + d^2)
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @param resultPtr - Pointer to output [real, imag]
 */
export function divComplex(
  re1: f64,
  im1: f64,
  re2: f64,
  im2: f64,
  resultPtr: usize
): void {
  const denom: f64 = re2 * re2 + im2 * im2
  store<f64>(resultPtr, (re1 * re2 + im1 * im2) / denom)
  store<f64>(resultPtr + 8, (im1 * re2 - re1 * im2) / denom)
}

/**
 * Compute the square root of a complex number
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function sqrtComplex(re: f64, im: f64, resultPtr: usize): void {
  const r: f64 = Math.sqrt(re * re + im * im)

  if (im === 0.0) {
    if (re >= 0.0) {
      store<f64>(resultPtr, Math.sqrt(re))
      store<f64>(resultPtr + 8, 0.0)
    } else {
      store<f64>(resultPtr, 0.0)
      store<f64>(resultPtr + 8, Math.sqrt(-re))
    }
  } else {
    store<f64>(resultPtr, Math.sqrt((r + re) / 2.0))
    store<f64>(resultPtr + 8, (im >= 0.0 ? 1.0 : -1.0) * Math.sqrt((r - re) / 2.0))
  }
}

/**
 * Compute e^(a + bi) = e^a * (cos(b) + i*sin(b))
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function expComplex(re: f64, im: f64, resultPtr: usize): void {
  const expRe: f64 = Math.exp(re)
  store<f64>(resultPtr, expRe * Math.cos(im))
  store<f64>(resultPtr + 8, expRe * Math.sin(im))
}

/**
 * Compute the natural logarithm of a complex number
 * log(a + bi) = log(|z|) + i*arg(z)
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function logComplex(re: f64, im: f64, resultPtr: usize): void {
  store<f64>(resultPtr, Math.log(Math.sqrt(re * re + im * im)))
  store<f64>(resultPtr + 8, Math.atan2(im, re))
}

/**
 * Compute sin of a complex number
 * sin(a + bi) = sin(a)cosh(b) + i*cos(a)sinh(b)
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function sinComplex(re: f64, im: f64, resultPtr: usize): void {
  store<f64>(resultPtr, Math.sin(re) * Math.cosh(im))
  store<f64>(resultPtr + 8, Math.cos(re) * Math.sinh(im))
}

/**
 * Compute cos of a complex number
 * cos(a + bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function cosComplex(re: f64, im: f64, resultPtr: usize): void {
  store<f64>(resultPtr, Math.cos(re) * Math.cosh(im))
  store<f64>(resultPtr + 8, -Math.sin(re) * Math.sinh(im))
}

/**
 * Compute tan of a complex number
 * tan(z) = sin(z) / cos(z)
 * @param re - Real part
 * @param im - Imaginary part
 * @param resultPtr - Pointer to output [real, imag]
 */
export function tanComplex(re: f64, im: f64, resultPtr: usize): void {
  const sinRe: f64 = Math.sin(re) * Math.cosh(im)
  const sinIm: f64 = Math.cos(re) * Math.sinh(im)
  const cosRe: f64 = Math.cos(re) * Math.cosh(im)
  const cosIm: f64 = -Math.sin(re) * Math.sinh(im)

  const denom: f64 = cosRe * cosRe + cosIm * cosIm
  store<f64>(resultPtr, (sinRe * cosRe + sinIm * cosIm) / denom)
  store<f64>(resultPtr + 8, (sinIm * cosRe - sinRe * cosIm) / denom)
}

/**
 * Raise a complex number to a real power
 * z^n = r^n * (cos(n*theta) + i*sin(n*theta))
 * @param re - Real part
 * @param im - Imaginary part
 * @param n - Power (real number)
 * @param resultPtr - Pointer to output [real, imag]
 */
export function powComplexReal(re: f64, im: f64, n: f64, resultPtr: usize): void {
  const r: f64 = Math.sqrt(re * re + im * im)
  const theta: f64 = Math.atan2(im, re)
  const rn: f64 = Math.pow(r, n)
  const ntheta: f64 = n * theta

  store<f64>(resultPtr, rn * Math.cos(ntheta))
  store<f64>(resultPtr + 8, rn * Math.sin(ntheta))
}
