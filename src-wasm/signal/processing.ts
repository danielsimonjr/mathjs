/**
 * WASM-optimized signal processing functions
 *
 * Implements high-performance digital filter analysis and design:
 * - freqz: Frequency response of digital filters
 * - zpk2tf: Zero-pole-gain to transfer function conversion
 * - Filter coefficient operations
 *
 * These functions are critical for real-time signal processing,
 * control systems, and audio processing applications.
 */

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
 * @param hReal - Output: real part of H(e^jw)
 * @param hImag - Output: imaginary part of H(e^jw)
 */
export function freqz(
  b: Float64Array,
  bLen: i32,
  a: Float64Array,
  aLen: i32,
  w: Float64Array,
  wLen: i32,
  hReal: Float64Array,
  hImag: Float64Array
): void {
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
}

/**
 * Optimized freqz for equally spaced frequencies from 0 to PI
 * @param b - Numerator coefficients
 * @param bLen - Length of b
 * @param a - Denominator coefficients
 * @param aLen - Length of a
 * @param n - Number of frequency points
 * @param hReal - Output: real part of H
 * @param hImag - Output: imaginary part of H
 */
export function freqzUniform(
  b: Float64Array,
  bLen: i32,
  a: Float64Array,
  aLen: i32,
  n: i32,
  hReal: Float64Array,
  hImag: Float64Array
): void {
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
 * @param cReal - Output: real part of product (length aLen + bLen - 1)
 * @param cImag - Output: imaginary part of product (length aLen + bLen - 1)
 */
export function polyMultiply(
  aReal: Float64Array,
  aImag: Float64Array,
  aLen: i32,
  bReal: Float64Array,
  bImag: Float64Array,
  bLen: i32,
  cReal: Float64Array,
  cImag: Float64Array
): void {
  const cLen: i32 = aLen + bLen - 1

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
 * @param numReal - Output: numerator real coefficients (length zLen + 1)
 * @param numImag - Output: numerator imaginary coefficients (length zLen + 1)
 * @param denReal - Output: denominator real coefficients (length pLen + 1)
 * @param denImag - Output: denominator imaginary coefficients (length pLen + 1)
 */
export function zpk2tf(
  zReal: Float64Array,
  zImag: Float64Array,
  zLen: i32,
  pReal: Float64Array,
  pImag: Float64Array,
  pLen: i32,
  k: f64,
  numReal: Float64Array,
  numImag: Float64Array,
  denReal: Float64Array,
  denImag: Float64Array
): void {
  // Temporary buffers for polynomial multiplication
  const maxLen: i32 = zLen > pLen ? zLen : pLen
  const tempReal1: Float64Array = new Float64Array(maxLen + 2)
  const tempReal2: Float64Array = new Float64Array(maxLen + 2)
  const tempImag1: Float64Array = new Float64Array(maxLen + 2)
  const tempImag2: Float64Array = new Float64Array(maxLen + 2)

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

    polyMultiply(
      tempReal1, tempImag1, numLen,
      factorReal, factorImag, 2,
      tempReal2, tempImag2
    )

    numLen += 1

    // Copy result back to temp1
    for (let j: i32 = 0; j < numLen; j++) {
      tempReal1[j] = tempReal2[j]
      tempImag1[j] = tempImag2[j]
    }
  }

  // Apply gain and copy to output
  for (let i: i32 = 0; i < numLen; i++) {
    unchecked(numReal[i] = tempReal1[i] * k)
    unchecked(numImag[i] = tempImag1[i] * k)
  }

  // Build denominator from poles
  // Start with polynomial "1"
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

    polyMultiply(
      tempReal1, tempImag1, denLen,
      factorReal, factorImag, 2,
      tempReal2, tempImag2
    )

    denLen += 1

    // Copy result back to temp1
    for (let j: i32 = 0; j < denLen; j++) {
      tempReal1[j] = tempReal2[j]
      tempImag1[j] = tempImag2[j]
    }
  }

  // Copy to output
  for (let i: i32 = 0; i < denLen; i++) {
    unchecked(denReal[i] = tempReal1[i])
    unchecked(denImag[i] = tempImag1[i])
  }
}

/**
 * Compute magnitude of complex frequency response
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @param magnitude - Output: |H|
 */
export function magnitude(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32,
  magnitude: Float64Array
): void {
  for (let i: i32 = 0; i < n; i++) {
    const re: f64 = unchecked(hReal[i])
    const im: f64 = unchecked(hImag[i])
    unchecked(magnitude[i] = Math.sqrt(re * re + im * im))
  }
}

/**
 * Compute magnitude in dB (20*log10(|H|))
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @param magnitudeDb - Output: |H| in dB
 */
export function magnitudeDb(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32,
  magnitudeDb: Float64Array
): void {
  const log10Factor: f64 = 20.0 / Math.LN10

  for (let i: i32 = 0; i < n; i++) {
    const re: f64 = unchecked(hReal[i])
    const im: f64 = unchecked(hImag[i])
    const mag: f64 = Math.sqrt(re * re + im * im)

    // Avoid log(0)
    if (mag > 1e-300) {
      unchecked(magnitudeDb[i] = log10Factor * Math.log(mag))
    } else {
      unchecked(magnitudeDb[i] = -300.0) // Very small number in dB
    }
  }
}

/**
 * Compute phase of complex frequency response (in radians)
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param n - Length
 * @param phase - Output: angle(H) in radians
 */
export function phase(
  hReal: Float64Array,
  hImag: Float64Array,
  n: i32,
  phase: Float64Array
): void {
  for (let i: i32 = 0; i < n; i++) {
    unchecked(phase[i] = Math.atan2(unchecked(hImag[i]), unchecked(hReal[i])))
  }
}

/**
 * Unwrap phase to eliminate discontinuities
 * @param phase - Input/output phase (in radians)
 * @param n - Length
 */
export function unwrapPhase(phase: Float64Array, n: i32): void {
  if (n < 2) return

  const twoPi: f64 = 2.0 * Math.PI

  for (let i: i32 = 1; i < n; i++) {
    let diff: f64 = unchecked(phase[i]) - unchecked(phase[i - 1])

    // Wrap difference to [-pi, pi]
    while (diff > Math.PI) {
      unchecked(phase[i] -= twoPi)
      diff -= twoPi
    }
    while (diff < -Math.PI) {
      unchecked(phase[i] += twoPi)
      diff += twoPi
    }
  }
}

/**
 * Group delay computation
 * tau(w) = -d(phase)/dw
 *
 * @param hReal - Real part of H
 * @param hImag - Imaginary part of H
 * @param w - Frequencies
 * @param n - Length
 * @param groupDelay - Output: group delay
 */
export function groupDelay(
  hReal: Float64Array,
  hImag: Float64Array,
  w: Float64Array,
  n: i32,
  groupDelay: Float64Array
): void {
  if (n < 2) return

  // Compute phase
  const phaseArray: Float64Array = new Float64Array(n)
  phase(hReal, hImag, n, phaseArray)

  // Unwrap phase
  unwrapPhase(phaseArray, n)

  // Compute negative derivative
  for (let i: i32 = 1; i < n - 1; i++) {
    const dPhase: f64 = unchecked(phaseArray[i + 1]) - unchecked(phaseArray[i - 1])
    const dw: f64 = unchecked(w[i + 1]) - unchecked(w[i - 1])

    unchecked(groupDelay[i] = -dPhase / dw)
  }

  // Endpoints use one-sided differences
  unchecked(groupDelay[0] = -(unchecked(phaseArray[1]) - unchecked(phaseArray[0])) / (unchecked(w[1]) - unchecked(w[0])))
  unchecked(groupDelay[n - 1] = -(unchecked(phaseArray[n - 1]) - unchecked(phaseArray[n - 2])) / (unchecked(w[n - 1]) - unchecked(w[n - 2])))
}
