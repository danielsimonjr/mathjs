/**
 * WASM-optimized complex number operations using AssemblyScript
 * Complex numbers are represented as Float64Array pairs [real, imag]
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
 * @param data - Interleaved array [re0, im0, re1, im1, ...]
 * @returns Array of arguments
 */
export function argArray(data: Float64Array): Float64Array {
  const len: i32 = data.length / 2
  const result = new Float64Array(len)

  for (let i: i32 = 0; i < len; i++) {
    const re: f64 = data[i * 2]
    const im: f64 = data[i * 2 + 1]
    result[i] = Math.atan2(im, re)
  }

  return result
}

/**
 * Compute the complex conjugate
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, -imag] as Float64Array
 */
export function conj(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = re
  result[1] = -im
  return result
}

/**
 * Compute the complex conjugate for an array of complex numbers
 * @param data - Interleaved array [re0, im0, re1, im1, ...]
 * @returns Conjugated array
 */
export function conjArray(data: Float64Array): Float64Array {
  const len: i32 = data.length
  const result = new Float64Array(len)

  for (let i: i32 = 0; i < len; i += 2) {
    result[i] = data[i]         // real part unchanged
    result[i + 1] = -data[i + 1] // imaginary part negated
  }

  return result
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
 * @param data - Interleaved array [re0, im0, re1, im1, ...]
 * @returns Array of real parts
 */
export function reArray(data: Float64Array): Float64Array {
  const len: i32 = data.length / 2
  const result = new Float64Array(len)

  for (let i: i32 = 0; i < len; i++) {
    result[i] = data[i * 2]
  }

  return result
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
 * @param data - Interleaved array [re0, im0, re1, im1, ...]
 * @returns Array of imaginary parts
 */
export function imArray(data: Float64Array): Float64Array {
  const len: i32 = data.length / 2
  const result = new Float64Array(len)

  for (let i: i32 = 0; i < len; i++) {
    result[i] = data[i * 2 + 1]
  }

  return result
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
 * @param data - Interleaved array [re0, im0, re1, im1, ...]
 * @returns Array of magnitudes
 */
export function absArray(data: Float64Array): Float64Array {
  const len: i32 = data.length / 2
  const result = new Float64Array(len)

  for (let i: i32 = 0; i < len; i++) {
    const re: f64 = data[i * 2]
    const im: f64 = data[i * 2 + 1]
    result[i] = Math.sqrt(re * re + im * im)
  }

  return result
}

/**
 * Add two complex numbers
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @returns [real, imag] as Float64Array
 */
export function addComplex(re1: f64, im1: f64, re2: f64, im2: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = re1 + re2
  result[1] = im1 + im2
  return result
}

/**
 * Subtract two complex numbers
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @returns [real, imag] as Float64Array
 */
export function subComplex(re1: f64, im1: f64, re2: f64, im2: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = re1 - re2
  result[1] = im1 - im2
  return result
}

/**
 * Multiply two complex numbers
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @returns [real, imag] as Float64Array
 */
export function mulComplex(re1: f64, im1: f64, re2: f64, im2: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = re1 * re2 - im1 * im2
  result[1] = re1 * im2 + im1 * re2
  return result
}

/**
 * Divide two complex numbers
 * (a + bi)/(c + di) = ((ac + bd) + (bc - ad)i) / (c^2 + d^2)
 * @param re1 - Real part of first number
 * @param im1 - Imaginary part of first number
 * @param re2 - Real part of second number
 * @param im2 - Imaginary part of second number
 * @returns [real, imag] as Float64Array
 */
export function divComplex(re1: f64, im1: f64, re2: f64, im2: f64): Float64Array {
  const result = new Float64Array(2)
  const denom: f64 = re2 * re2 + im2 * im2
  result[0] = (re1 * re2 + im1 * im2) / denom
  result[1] = (im1 * re2 - re1 * im2) / denom
  return result
}

/**
 * Compute the square root of a complex number
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function sqrtComplex(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  const r: f64 = Math.sqrt(re * re + im * im)

  if (im === 0.0) {
    if (re >= 0.0) {
      result[0] = Math.sqrt(re)
      result[1] = 0.0
    } else {
      result[0] = 0.0
      result[1] = Math.sqrt(-re)
    }
  } else {
    result[0] = Math.sqrt((r + re) / 2.0)
    result[1] = (im >= 0.0 ? 1.0 : -1.0) * Math.sqrt((r - re) / 2.0)
  }

  return result
}

/**
 * Compute e^(a + bi) = e^a * (cos(b) + i*sin(b))
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function expComplex(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  const expRe: f64 = Math.exp(re)
  result[0] = expRe * Math.cos(im)
  result[1] = expRe * Math.sin(im)
  return result
}

/**
 * Compute the natural logarithm of a complex number
 * log(a + bi) = log(|z|) + i*arg(z)
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function logComplex(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = Math.log(Math.sqrt(re * re + im * im))
  result[1] = Math.atan2(im, re)
  return result
}

/**
 * Compute sin of a complex number
 * sin(a + bi) = sin(a)cosh(b) + i*cos(a)sinh(b)
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function sinComplex(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = Math.sin(re) * Math.cosh(im)
  result[1] = Math.cos(re) * Math.sinh(im)
  return result
}

/**
 * Compute cos of a complex number
 * cos(a + bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function cosComplex(re: f64, im: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = Math.cos(re) * Math.cosh(im)
  result[1] = -Math.sin(re) * Math.sinh(im)
  return result
}

/**
 * Compute tan of a complex number
 * tan(z) = sin(z) / cos(z)
 * @param re - Real part
 * @param im - Imaginary part
 * @returns [real, imag] as Float64Array
 */
export function tanComplex(re: f64, im: f64): Float64Array {
  const sinRe: f64 = Math.sin(re) * Math.cosh(im)
  const sinIm: f64 = Math.cos(re) * Math.sinh(im)
  const cosRe: f64 = Math.cos(re) * Math.cosh(im)
  const cosIm: f64 = -Math.sin(re) * Math.sinh(im)

  return divComplex(sinRe, sinIm, cosRe, cosIm)
}

/**
 * Raise a complex number to a real power
 * z^n = r^n * (cos(n*theta) + i*sin(n*theta))
 * @param re - Real part
 * @param im - Imaginary part
 * @param n - Power (real number)
 * @returns [real, imag] as Float64Array
 */
export function powComplexReal(re: f64, im: f64, n: f64): Float64Array {
  const result = new Float64Array(2)
  const r: f64 = Math.sqrt(re * re + im * im)
  const theta: f64 = Math.atan2(im, re)
  const rn: f64 = Math.pow(r, n)
  const ntheta: f64 = n * theta

  result[0] = rn * Math.cos(ntheta)
  result[1] = rn * Math.sin(ntheta)
  return result
}
