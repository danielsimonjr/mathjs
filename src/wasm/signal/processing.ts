/**
 * WASM-optimized signal processing functions
 *
 * Implements high-performance digital filter analysis and design:
 * - freqz: Frequency response of digital filters
 * - zpk2tf: Zero-pole-gain to transfer function conversion
 * - Filter coefficient operations
 *
 * All functions return new arrays for proper WASM/JS interop
 */

/**
 * Result of frequency response computation
 */
class FreqzResult {
  hReal: Float64Array
  hImag: Float64Array

  constructor(hReal: Float64Array, hImag: Float64Array) {
    this.hReal = hReal
    this.hImag = hImag
  }
}

/**
 * Result of zpk2tf computation
 */
class TransferFunction {
  numReal: Float64Array
  numImag: Float64Array
  denReal: Float64Array
  denImag: Float64Array

  constructor(numReal: Float64Array, numImag: Float64Array, denReal: Float64Array, denImag: Float64Array) {
    this.numReal = numReal
    this.numImag = numImag
    this.denReal = denReal
    this.denImag = denImag
  }
}

/**
 * Compute frequency response of a digital filter
 *
 * Evaluates H(e^jw) = B(e^jw) / A(e^jw) where:
 * - B(e^jw) = sum(b[k] * e^(-jkw))
 * - A(e^jw) = sum(a[k] * e^(-jkw))
 *
 * @param b - Numerator coefficients
 * @param bLen - Length of b
 * @param a - Denominator coefficients
 * @param aLen - Length of a
 * @param w - Frequency points (radians/sample)
 * @param wLen - Number of frequency points
 * @returns Complex frequency response H(e^jw)
 */
export function freqz(
  b: Float64Array,
  bLen: i32,
  a: Float64Array,
  aLen: i32,
  w: Float64Array,
  wLen: i32
): FreqzResult {
  const hReal = new Float64Array(wLen)
  const hImag = new Float64Array(wLen)

  // For each frequency point
  for (let i: i32 = 0; i < wLen; i++) {
    const omega: f64 = unchecked(w[i])

    // Compute numerator B(e^jw)
    let numReal: f64 = 0.0
    let numImag: f64 = 0.0

    for (let k: i32 = 0; k < bLen; k++) {
      const angle: f64 = -<f64>k * omega
      const cosAngle: f64 = Math.cos(angle)
      const sinAngle: f64 = Math.sin(angle)

      numReal += unchecked(b[k]) * cosAngle
      numImag += unchecked(b[k]) * sinAngle
    }

    // Compute denominator A(e^jw)
    let denReal: f64 = 0.0
    let denImag: f64 = 0.0

    for (let k: i32 = 0; k < aLen; k++) {
      const angle: f64 = -<f64>k * omega
      const cosAngle: f64 = Math.cos(angle)
      const sinAngle: f64 = Math.sin(angle)

      denReal += unchecked(a[k]) * cosAngle
      denImag += unchecked(a[k]) * sinAngle
    }

    // Complex division: H = Num / Den
    // (a + bi) / (c + di) = ((ac + bd) + (bc - ad)i) / (c^2 + d^2)
    const denMagSq: f64 = denReal * denReal + denImag * denImag

    unchecked(hReal[i] = (numReal * denReal + numImag * denImag) / denMagSq)
    unchecked(hImag[i] = (numImag * denReal - numReal * denImag) / denMagSq)
  }

  return new FreqzResult(hReal, hImag)
}

/**
 * Get real part of frequency response
 */
export function getFreqzReal(result: FreqzResult): Float64Array {
  return result.hReal
}

/**
 * Get imaginary part of frequency response
 */
export function getFreqzImag(result: FreqzResult): Float64Array {
  return result.hImag
}

/**
 * Optimized freqz for equally spaced frequencies from 0 to PI
 * @param b - Numerator coefficients
 * @param bLen - Length of b
 * @param a - Denominator coefficients
 * @param aLen - Length of a
 * @param n - Number of frequency points
 * @returns Complex frequency response
 */
export function freqzUniform(
  b: Float64Array,
  bLen: i32,
  a: Float64Array,
  aLen: i32,
  n: i32
): FreqzResult {
  const hReal = new Float64Array(n)
  const hImag = new Float64Array(n)

  const dw: f64 = Math.PI / <f64>n

  for (let i: i32 = 0; i < n; i++) {
    const omega: f64 = <f64>i * dw

    // Compute numerator
    let numReal: f64 = 0.0
    let numImag: f64 = 0.0

    for (let k: i32 = 0; k < bLen; k++) {
      const angle: f64 = -<f64>k * omega
      numReal += unchecked(b[k]) * Math.cos(angle)
      numImag += unchecked(b[k]) * Math.sin(angle)
    }

    // Compute denominator
    let denReal: f64 = 0.0
    let denImag: f64 = 0.0

    for (let k: i32 = 0; k < aLen; k++) {
      const angle: f64 = -<f64>k * omega
      denReal += unchecked(a[k]) * Math.cos(angle)
      denImag += unchecked(a[k]) * Math.sin(angle)
    }

    // Complex division
    const denMagSq: f64 = denReal * denReal + denImag * denImag
    unchecked(hReal[i] = (numReal * denReal + numImag * denImag) / denMagSq)
    unchecked(hImag[i] = (numImag * denReal - numReal * denImag) / denMagSq)
  }

  return new FreqzResult(hReal, hImag)
}

/**
 * Result of polynomial multiplication
 */
class PolyResult {
  real: Float64Array
  imag: Float64Array

  constructor(real: Float64Array, imag: Float64Array) {
    this.real = real
    this.imag = imag
  }
}

/**
 * Polynomial multiplication for zpk2tf conversion
 *
 * Multiplies two polynomials represented as coefficient arrays
 * c(x) = a(x) * b(x)
 *
 * Uses convolution algorithm: c[i] = sum(a[j] * b[i-j])
 *
 * @param aReal - Real part of first polynomial coefficients
 * @param aImag - Imaginary part of first polynomial coefficients
 * @param aLen - Length of a
 * @param bReal - Real part of second polynomial coefficients
 * @param bImag - Imaginary part of second polynomial coefficients
 * @param bLen - Length of b
 * @returns Product polynomial (length aLen + bLen - 1)
 */
export function polyMultiply(
  aReal: Float64Array,
  aImag: Float64Array,
  aLen: i32,
  bReal: Float64Array,
  bImag: Float64Array,
  bLen: i32
): PolyResult {
  const cLen: i32 = aLen + bLen - 1
  const cReal = new Float64Array(cLen)
  const cImag = new Float64Array(cLen)

  // Initialize output to zero
  for (let i: i32 = 0; i < cLen; i++) {
    unchecked(cReal[i] = 0.0)
    unchecked(cImag[i] = 0.0)
  }

  // Convolution with complex multiplication
  for (let i: i32 = 0; i < cLen; i++) {
    for (let j: i32 = 0; j < aLen; j++) {
      const k: i32 = i - j
      if (k >= 0 && k < bLen) {
        // Complex multiplication: (ar + ai*i) * (br + bi*i)
        const ar: f64 = unchecked(aReal[j])
        const ai: f64 = unchecked(aImag[j])
        const br: f64 = unchecked(bReal[k])
        const bi: f64 = unchecked(bImag[k])

        unchecked(cReal[i] += ar * br - ai * bi)
        unchecked(cImag[i] += ar * bi + ai * br)
      }
    }
  }

  return new PolyResult(cReal, cImag)
}

/**
 * Get real part of polynomial result
 */
export function getPolyReal(result: PolyResult): Float64Array {
  return result.real
}

/**
 * Get imaginary part of polynomial result
 */
export function getPolyImag(result: PolyResult): Float64Array {
  return result.imag
}

/**
 * Convert zero-pole-gain to transfer function
 *
 * Builds numerator and denominator polynomials from zeros and poles:
 * - Numerator: k * product((s - z[i]))
 * - Denominator: product((s - p[i]))
 *
 * @param zReal - Real parts of zeros
 * @param zImag - Imaginary parts of zeros
 * @param zLen - Number of zeros
 * @param pReal - Real parts of poles
 * @param pImag - Imaginary parts of poles
 * @param pLen - Number of poles
 * @param k - Gain
 * @returns Transfer function coefficients
 */
export function zpk2tf(
  zReal: Float64Array,
  zImag: Float64Array,
  zLen: i32,
  pReal: Float64Array,
  pImag: Float64Array,
  pLen: i32,
  k: f64
): TransferFunction {
  // Temporary buffers for polynomial multiplication
  const maxLen: i32 = zLen > pLen ? zLen : pLen
  let tempReal1: Float64Array = new Float64Array(maxLen + 2)
  let tempReal2: Float64Array
  let tempImag1: Float64Array = new Float64Array(maxLen + 2)
  let tempImag2: Float64Array

  // Build numerator from zeros
  // Start with polynomial "1"
  tempReal1[0] = 1.0
  tempImag1[0] = 0.0
  let numLen: i32 = 1

  for (let i: i32 = 0; i < zLen; i++) {
    // Multiply by (s - zero[i]) = [1, -zero[i]]
    const zr: f64 = unchecked(zReal[i])
    const zi: f64 = unchecked(zImag[i])

    const factorReal: Float64Array = new Float64Array(2)
    const factorImag: Float64Array = new Float64Array(2)
    factorReal[0] = 1.0
    factorImag[0] = 0.0
    factorReal[1] = -zr
    factorImag[1] = -zi

    const result = polyMultiplyInternal(
      tempReal1, tempImag1, numLen,
      factorReal, factorImag, 2
    )

    numLen += 1
    tempReal1 = result.real
    tempImag1 = result.imag
  }

  // Apply gain and copy to output
  const numReal = new Float64Array(numLen)
  const numImag = new Float64Array(numLen)
  for (let i: i32 = 0; i < numLen; i++) {
    unchecked(numReal[i] = tempReal1[i] * k)
    unchecked(numImag[i] = tempImag1[i] * k)
  }

  // Build denominator from poles
  // Start with polynomial "1"
  tempReal1 = new Float64Array(maxLen + 2)
  tempImag1 = new Float64Array(maxLen + 2)
  tempReal1[0] = 1.0
  tempImag1[0] = 0.0
  let denLen: i32 = 1

  for (let i: i32 = 0; i < pLen; i++) {
    // Multiply by (s - pole[i]) = [1, -pole[i]]
    const pr: f64 = unchecked(pReal[i])
    const pi: f64 = unchecked(pImag[i])

    const factorReal: Float64Array = new Float64Array(2)
    const factorImag: Float64Array = new Float64Array(2)
    factorReal[0] = 1.0
    factorImag[0] = 0.0
    factorReal[1] = -pr
    factorImag[1] = -pi

    const result = polyMultiplyInternal(
      tempReal1, tempImag1, denLen,
      factorReal, factorImag, 2
    )

    denLen += 1
    tempReal1 = result.real
    tempImag1 = result.imag
  }

  // Copy to output
  const denReal = new Float64Array(denLen)
  const denImag = new Float64Array(denLen)
  for (let i: i32 = 0; i < denLen; i++) {
    unchecked(denReal[i] = tempReal1[i])
    unchecked(denImag[i] = tempImag1[i])
  }

  return new TransferFunction(numReal, numImag, denReal, denImag)
}

/**
 * Internal polynomial multiply helper
 */
function polyMultiplyInternal(
  aReal: Float64Array,
  aImag: Float64Array,
  aLen: i32,
  bReal: Float64Array,
  bImag: Float64Array,
  bLen: i32
): PolyResult {
  const cLen: i32 = aLen + bLen - 1
  const cReal = new Float64Array(cLen)
  const cImag = new Float64Array(cLen)

  for (let i: i32 = 0; i < cLen; i++) {
    for (let j: i32 = 0; j < aLen; j++) {
      const k: i32 = i - j
      if (k >= 0 && k < bLen) {
        const ar: f64 = unchecked(aReal[j])
        const ai: f64 = unchecked(aImag[j])
        const br: f64 = unchecked(bReal[k])
        const bi: f64 = unchecked(bImag[k])

        unchecked(cReal[i] += ar * br - ai * bi)
        unchecked(cImag[i] += ar * bi + ai * br)
      }
    }
  }

  return new PolyResult(cReal, cImag)
}

/**
 * Get transfer function numerator real part
 */
export function getTFNumReal(tf: TransferFunction): Float64Array {
  return tf.numReal
}

/**
 * Get transfer function numerator imaginary part
 */
export function getTFNumImag(tf: TransferFunction): Float64Array {
  return tf.numImag
}

/**
 * Get transfer function denominator real part
 */
export function getTFDenReal(tf: TransferFunction): Float64Array {
  return tf.denReal
}

/**
 * Get transfer function denominator imaginary part
 */
export function getTFDenImag(tf: TransferFunction): Float64Array {
  return tf.denImag
}

/**
 * Compute magnitude of complex frequency response
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @returns |H|
 */
export function magnitude(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const re: f64 = unchecked(hReal[i])
    const im: f64 = unchecked(hImag[i])
    unchecked(result[i] = Math.sqrt(re * re + im * im))
  }

  return result
}

/**
 * Compute magnitude in dB (20*log10(|H|))
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @returns |H| in dB
 */
export function magnitudeDb(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(n)
  const log10Factor: f64 = 20.0 / Math.LN10

  for (let i: i32 = 0; i < n; i++) {
    const re: f64 = unchecked(hReal[i])
    const im: f64 = unchecked(hImag[i])
    const mag: f64 = Math.sqrt(re * re + im * im)

    // Avoid log(0)
    if (mag > 1e-300) {
      unchecked(result[i] = log10Factor * Math.log(mag))
    } else {
      unchecked(result[i] = -300.0) // Very small number in dB
    }
  }

  return result
}

/**
 * Compute phase of complex frequency response (in radians)
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @returns angle(H) in radians
 */
export function phase(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    unchecked(result[i] = Math.atan2(unchecked(hImag[i]), unchecked(hReal[i])))
  }

  return result
}

/**
 * Unwrap phase to eliminate discontinuities
 * @param phaseIn - Input phase (in radians)
 * @param n - Length
 * @returns Unwrapped phase
 */
export function unwrapPhase(phaseIn: Float64Array, n: i32): Float64Array {
  const result = new Float64Array(n)

  if (n < 1) return result

  result[0] = phaseIn[0]

  if (n < 2) return result

  const twoPi: f64 = 2.0 * Math.PI

  for (let i: i32 = 1; i < n; i++) {
    result[i] = phaseIn[i]
    let diff: f64 = result[i] - result[i - 1]

    // Wrap difference to [-pi, pi]
    while (diff > Math.PI) {
      unchecked(result[i] -= twoPi)
      diff -= twoPi
    }
    while (diff < -Math.PI) {
      unchecked(result[i] += twoPi)
      diff += twoPi
    }
  }

  return result
}

/**
 * Group delay computation
 * tau(w) = -d(phase)/dw
 *
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param w - Frequencies
 * @param n - Length
 * @returns Group delay
 */
export function groupDelay(
  hReal: Float64Array,
  hImag: Float64Array,
  w: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(n)

  if (n < 2) return result

  // Compute phase
  const phaseArray = phase(hReal, hImag, n)

  // Unwrap phase
  const unwrappedPhase = unwrapPhase(phaseArray, n)

  // Compute negative derivative
  for (let i: i32 = 1; i < n - 1; i++) {
    const dPhase: f64 = unchecked(unwrappedPhase[i + 1]) - unchecked(unwrappedPhase[i - 1])
    const dw: f64 = unchecked(w[i + 1]) - unchecked(w[i - 1])

    unchecked(result[i] = -dPhase / dw)
  }

  // Endpoints use one-sided differences
  unchecked(result[0] = -(unchecked(unwrappedPhase[1]) - unchecked(unwrappedPhase[0])) / (unchecked(w[1]) - unchecked(w[0])))
  unchecked(result[n - 1] = -(unchecked(unwrappedPhase[n - 1]) - unchecked(unwrappedPhase[n - 2])) / (unchecked(w[n - 1]) - unchecked(w[n - 2])))

  return result
}
