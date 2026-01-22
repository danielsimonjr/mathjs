/**
 * WASM-optimized signal processing functions
 *
 * Implements high-performance digital filter analysis and design:
 * - freqz: Frequency response of digital filters
 * - zpk2tf: Zero-pole-gain to transfer function conversion
 * - Filter coefficient operations
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Compute frequency response of a digital filter
 *
 * Evaluates H(e^jw) = B(e^jw) / A(e^jw) where:
 * - B(e^jw) = sum(b[k] * e^(-jkw))
 * - A(e^jw) = sum(a[k] * e^(-jkw))
 *
 * @param bPtr - Pointer to numerator coefficients (f64)
 * @param bLen - Length of b
 * @param aPtr - Pointer to denominator coefficients (f64)
 * @param aLen - Length of a
 * @param wPtr - Pointer to frequency points (radians/sample) (f64)
 * @param wLen - Number of frequency points
 * @param hRealPtr - Pointer to output real part (f64)
 * @param hImagPtr - Pointer to output imaginary part (f64)
 */
export function freqz(
  bPtr: usize,
  bLen: i32,
  aPtr: usize,
  aLen: i32,
  wPtr: usize,
  wLen: i32,
  hRealPtr: usize,
  hImagPtr: usize
): void {
  // For each frequency point
  for (let i: i32 = 0; i < wLen; i++) {
    const iOffset: usize = <usize>i << 3
    const omega: f64 = load<f64>(wPtr + iOffset)

    // Compute numerator B(e^jw)
    let numReal: f64 = 0.0
    let numImag: f64 = 0.0

    for (let k: i32 = 0; k < bLen; k++) {
      const angle: f64 = -(<f64>k) * omega
      const cosAngle: f64 = Math.cos(angle)
      const sinAngle: f64 = Math.sin(angle)
      const bk: f64 = load<f64>(bPtr + (<usize>k << 3))

      numReal += bk * cosAngle
      numImag += bk * sinAngle
    }

    // Compute denominator A(e^jw)
    let denReal: f64 = 0.0
    let denImag: f64 = 0.0

    for (let k: i32 = 0; k < aLen; k++) {
      const angle: f64 = -(<f64>k) * omega
      const cosAngle: f64 = Math.cos(angle)
      const sinAngle: f64 = Math.sin(angle)
      const ak: f64 = load<f64>(aPtr + (<usize>k << 3))

      denReal += ak * cosAngle
      denImag += ak * sinAngle
    }

    // Complex division: H = Num / Den
    // (a + bi) / (c + di) = ((ac + bd) + (bc - ad)i) / (c^2 + d^2)
    const denMagSq: f64 = denReal * denReal + denImag * denImag

    store<f64>(hRealPtr + iOffset, (numReal * denReal + numImag * denImag) / denMagSq)
    store<f64>(hImagPtr + iOffset, (numImag * denReal - numReal * denImag) / denMagSq)
  }
}

/**
 * Optimized freqz for equally spaced frequencies from 0 to PI
 * @param bPtr - Pointer to numerator coefficients (f64)
 * @param bLen - Length of b
 * @param aPtr - Pointer to denominator coefficients (f64)
 * @param aLen - Length of a
 * @param n - Number of frequency points
 * @param hRealPtr - Pointer to output real part (f64)
 * @param hImagPtr - Pointer to output imaginary part (f64)
 */
export function freqzUniform(
  bPtr: usize,
  bLen: i32,
  aPtr: usize,
  aLen: i32,
  n: i32,
  hRealPtr: usize,
  hImagPtr: usize
): void {
  const dw: f64 = Math.PI / <f64>n

  for (let i: i32 = 0; i < n; i++) {
    const iOffset: usize = <usize>i << 3
    const omega: f64 = <f64>i * dw

    // Compute numerator
    let numReal: f64 = 0.0
    let numImag: f64 = 0.0

    for (let k: i32 = 0; k < bLen; k++) {
      const angle: f64 = -(<f64>k) * omega
      const bk: f64 = load<f64>(bPtr + (<usize>k << 3))
      numReal += bk * Math.cos(angle)
      numImag += bk * Math.sin(angle)
    }

    // Compute denominator
    let denReal: f64 = 0.0
    let denImag: f64 = 0.0

    for (let k: i32 = 0; k < aLen; k++) {
      const angle: f64 = -(<f64>k) * omega
      const ak: f64 = load<f64>(aPtr + (<usize>k << 3))
      denReal += ak * Math.cos(angle)
      denImag += ak * Math.sin(angle)
    }

    // Complex division
    const denMagSq: f64 = denReal * denReal + denImag * denImag
    store<f64>(hRealPtr + iOffset, (numReal * denReal + numImag * denImag) / denMagSq)
    store<f64>(hImagPtr + iOffset, (numImag * denReal - numReal * denImag) / denMagSq)
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
 * @param aRealPtr - Pointer to real part of first polynomial coefficients (f64)
 * @param aImagPtr - Pointer to imaginary part of first polynomial coefficients (f64)
 * @param aLen - Length of a
 * @param bRealPtr - Pointer to real part of second polynomial coefficients (f64)
 * @param bImagPtr - Pointer to imaginary part of second polynomial coefficients (f64)
 * @param bLen - Length of b
 * @param cRealPtr - Pointer to output real part (f64, length aLen + bLen - 1)
 * @param cImagPtr - Pointer to output imaginary part (f64, length aLen + bLen - 1)
 */
export function polyMultiply(
  aRealPtr: usize,
  aImagPtr: usize,
  aLen: i32,
  bRealPtr: usize,
  bImagPtr: usize,
  bLen: i32,
  cRealPtr: usize,
  cImagPtr: usize
): void {
  const cLen: i32 = aLen + bLen - 1

  // Initialize output to zero
  for (let i: i32 = 0; i < cLen; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(cRealPtr + offset, 0.0)
    store<f64>(cImagPtr + offset, 0.0)
  }

  // Convolution with complex multiplication
  for (let i: i32 = 0; i < cLen; i++) {
    const iOffset: usize = <usize>i << 3
    for (let j: i32 = 0; j < aLen; j++) {
      const k: i32 = i - j
      if (k >= 0 && k < bLen) {
        // Complex multiplication: (ar + ai*i) * (br + bi*i)
        const jOffset: usize = <usize>j << 3
        const kOffset: usize = <usize>k << 3
        const ar: f64 = load<f64>(aRealPtr + jOffset)
        const ai: f64 = load<f64>(aImagPtr + jOffset)
        const br: f64 = load<f64>(bRealPtr + kOffset)
        const bi: f64 = load<f64>(bImagPtr + kOffset)

        const currReal: f64 = load<f64>(cRealPtr + iOffset)
        const currImag: f64 = load<f64>(cImagPtr + iOffset)

        store<f64>(cRealPtr + iOffset, currReal + ar * br - ai * bi)
        store<f64>(cImagPtr + iOffset, currImag + ar * bi + ai * br)
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
 * This function performs the computation in-place using working memory.
 * The caller must allocate sufficient working memory.
 *
 * @param zRealPtr - Pointer to real parts of zeros (f64)
 * @param zImagPtr - Pointer to imaginary parts of zeros (f64)
 * @param zLen - Number of zeros
 * @param pRealPtr - Pointer to real parts of poles (f64)
 * @param pImagPtr - Pointer to imaginary parts of poles (f64)
 * @param pLen - Number of poles
 * @param k - Gain
 * @param numRealPtr - Pointer to output numerator real coefficients (f64, length zLen+1)
 * @param numImagPtr - Pointer to output numerator imaginary coefficients (f64, length zLen+1)
 * @param denRealPtr - Pointer to output denominator real coefficients (f64, length pLen+1)
 * @param denImagPtr - Pointer to output denominator imaginary coefficients (f64, length pLen+1)
 * @param workPtr - Pointer to working memory (f64, at least 4*(max(zLen,pLen)+2))
 */
export function zpk2tf(
  zRealPtr: usize,
  zImagPtr: usize,
  zLen: i32,
  pRealPtr: usize,
  pImagPtr: usize,
  pLen: i32,
  k: f64,
  numRealPtr: usize,
  numImagPtr: usize,
  denRealPtr: usize,
  denImagPtr: usize,
  workPtr: usize
): void {
  const maxLen: i32 = zLen > pLen ? zLen : pLen
  const tempSize: usize = <usize>(maxLen + 2) << 3

  // Working memory layout:
  // tempReal1: workPtr
  // tempImag1: workPtr + tempSize
  // tempReal2: workPtr + 2*tempSize
  // tempImag2: workPtr + 3*tempSize
  const tempReal1Ptr: usize = workPtr
  const tempImag1Ptr: usize = workPtr + tempSize
  const tempReal2Ptr: usize = workPtr + 2 * tempSize
  const tempImag2Ptr: usize = workPtr + 3 * tempSize

  // Build numerator from zeros
  // Start with polynomial "1"
  store<f64>(tempReal1Ptr, 1.0)
  store<f64>(tempImag1Ptr, 0.0)
  let numLen: i32 = 1

  for (let i: i32 = 0; i < zLen; i++) {
    const iOffset: usize = <usize>i << 3
    const zr: f64 = load<f64>(zRealPtr + iOffset)
    const zi: f64 = load<f64>(zImagPtr + iOffset)

    // Factor is [1, -zero[i]]
    // Multiply current polynomial by this factor
    const newLen: i32 = numLen + 1

    // Initialize new polynomial to zero
    for (let j: i32 = 0; j < newLen; j++) {
      const jOffset: usize = <usize>j << 3
      store<f64>(tempReal2Ptr + jOffset, 0.0)
      store<f64>(tempImag2Ptr + jOffset, 0.0)
    }

    // Convolution: c[m] = sum over j of a[j] * factor[m-j]
    // factor[0] = 1+0i, factor[1] = -zr - zi*i
    for (let j: i32 = 0; j < numLen; j++) {
      const jOffset: usize = <usize>j << 3
      const ar: f64 = load<f64>(tempReal1Ptr + jOffset)
      const ai: f64 = load<f64>(tempImag1Ptr + jOffset)

      // Multiply by factor[0] = 1+0i, add to c[j]
      const jOut: usize = <usize>j << 3
      store<f64>(tempReal2Ptr + jOut, load<f64>(tempReal2Ptr + jOut) + ar)
      store<f64>(tempImag2Ptr + jOut, load<f64>(tempImag2Ptr + jOut) + ai)

      // Multiply by factor[1] = -zr - zi*i, add to c[j+1]
      // (ar + ai*i) * (-zr - zi*i) = -ar*zr + ai*zi + (-ar*zi - ai*zr)*i
      const j1Out: usize = <usize>(j + 1) << 3
      store<f64>(tempReal2Ptr + j1Out, load<f64>(tempReal2Ptr + j1Out) + (-ar * zr + ai * zi))
      store<f64>(tempImag2Ptr + j1Out, load<f64>(tempImag2Ptr + j1Out) + (-ar * zi - ai * zr))
    }

    // Copy result back to temp1
    for (let j: i32 = 0; j < newLen; j++) {
      const jOffset: usize = <usize>j << 3
      store<f64>(tempReal1Ptr + jOffset, load<f64>(tempReal2Ptr + jOffset))
      store<f64>(tempImag1Ptr + jOffset, load<f64>(tempImag2Ptr + jOffset))
    }
    numLen = newLen
  }

  // Apply gain and copy to output
  for (let i: i32 = 0; i < numLen; i++) {
    const iOffset: usize = <usize>i << 3
    store<f64>(numRealPtr + iOffset, load<f64>(tempReal1Ptr + iOffset) * k)
    store<f64>(numImagPtr + iOffset, load<f64>(tempImag1Ptr + iOffset) * k)
  }

  // Build denominator from poles
  // Start with polynomial "1"
  store<f64>(tempReal1Ptr, 1.0)
  store<f64>(tempImag1Ptr, 0.0)
  let denLen: i32 = 1

  for (let i: i32 = 0; i < pLen; i++) {
    const iOffset: usize = <usize>i << 3
    const pr: f64 = load<f64>(pRealPtr + iOffset)
    const pi: f64 = load<f64>(pImagPtr + iOffset)

    // Factor is [1, -pole[i]]
    const newLen: i32 = denLen + 1

    // Initialize new polynomial to zero
    for (let j: i32 = 0; j < newLen; j++) {
      const jOffset: usize = <usize>j << 3
      store<f64>(tempReal2Ptr + jOffset, 0.0)
      store<f64>(tempImag2Ptr + jOffset, 0.0)
    }

    // Convolution
    for (let j: i32 = 0; j < denLen; j++) {
      const jOffset: usize = <usize>j << 3
      const ar: f64 = load<f64>(tempReal1Ptr + jOffset)
      const ai: f64 = load<f64>(tempImag1Ptr + jOffset)

      // Multiply by factor[0] = 1+0i, add to c[j]
      const jOut: usize = <usize>j << 3
      store<f64>(tempReal2Ptr + jOut, load<f64>(tempReal2Ptr + jOut) + ar)
      store<f64>(tempImag2Ptr + jOut, load<f64>(tempImag2Ptr + jOut) + ai)

      // Multiply by factor[1] = -pr - pi*i, add to c[j+1]
      const j1Out: usize = <usize>(j + 1) << 3
      store<f64>(tempReal2Ptr + j1Out, load<f64>(tempReal2Ptr + j1Out) + (-ar * pr + ai * pi))
      store<f64>(tempImag2Ptr + j1Out, load<f64>(tempImag2Ptr + j1Out) + (-ar * pi - ai * pr))
    }

    // Copy result back to temp1
    for (let j: i32 = 0; j < newLen; j++) {
      const jOffset: usize = <usize>j << 3
      store<f64>(tempReal1Ptr + jOffset, load<f64>(tempReal2Ptr + jOffset))
      store<f64>(tempImag1Ptr + jOffset, load<f64>(tempImag2Ptr + jOffset))
    }
    denLen = newLen
  }

  // Copy to output
  for (let i: i32 = 0; i < denLen; i++) {
    const iOffset: usize = <usize>i << 3
    store<f64>(denRealPtr + iOffset, load<f64>(tempReal1Ptr + iOffset))
    store<f64>(denImagPtr + iOffset, load<f64>(tempImag1Ptr + iOffset))
  }
}

/**
 * Compute magnitude of complex frequency response
 * @param hRealPtr - Pointer to real part of H (f64)
 * @param hImagPtr - Pointer to imaginary part of H (f64)
 * @param n - Length
 * @param resultPtr - Pointer to output |H| (f64)
 */
export function magnitude(
  hRealPtr: usize,
  hImagPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    const re: f64 = load<f64>(hRealPtr + offset)
    const im: f64 = load<f64>(hImagPtr + offset)
    store<f64>(resultPtr + offset, Math.sqrt(re * re + im * im))
  }
}

/**
 * Compute magnitude in dB (20*log10(|H|))
 * @param hRealPtr - Pointer to real part of H (f64)
 * @param hImagPtr - Pointer to imaginary part of H (f64)
 * @param n - Length
 * @param resultPtr - Pointer to output |H| in dB (f64)
 */
export function magnitudeDb(
  hRealPtr: usize,
  hImagPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  const log10Factor: f64 = 20.0 / Math.LN10

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    const re: f64 = load<f64>(hRealPtr + offset)
    const im: f64 = load<f64>(hImagPtr + offset)
    const mag: f64 = Math.sqrt(re * re + im * im)

    // Avoid log(0)
    if (mag > 1e-300) {
      store<f64>(resultPtr + offset, log10Factor * Math.log(mag))
    } else {
      store<f64>(resultPtr + offset, -300.0) // Very small number in dB
    }
  }
}

/**
 * Compute phase of complex frequency response (in radians)
 * @param hRealPtr - Pointer to real part of H (f64)
 * @param hImagPtr - Pointer to imaginary part of H (f64)
 * @param n - Length
 * @param resultPtr - Pointer to output angle(H) in radians (f64)
 */
export function phase(
  hRealPtr: usize,
  hImagPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(
      resultPtr + offset,
      Math.atan2(load<f64>(hImagPtr + offset), load<f64>(hRealPtr + offset))
    )
  }
}

/**
 * Unwrap phase to eliminate discontinuities
 * @param phaseInPtr - Pointer to input phase (in radians) (f64)
 * @param n - Length
 * @param resultPtr - Pointer to output unwrapped phase (f64)
 */
export function unwrapPhase(phaseInPtr: usize, n: i32, resultPtr: usize): void {
  if (n < 1) return

  store<f64>(resultPtr, load<f64>(phaseInPtr))

  if (n < 2) return

  const twoPi: f64 = 2.0 * Math.PI

  for (let i: i32 = 1; i < n; i++) {
    const iOffset: usize = <usize>i << 3
    const prevOffset: usize = <usize>(i - 1) << 3

    let current: f64 = load<f64>(phaseInPtr + iOffset)
    const prev: f64 = load<f64>(resultPtr + prevOffset)
    let diff: f64 = current - prev

    // Wrap difference to [-pi, pi]
    while (diff > Math.PI) {
      current -= twoPi
      diff -= twoPi
    }
    while (diff < -Math.PI) {
      current += twoPi
      diff += twoPi
    }

    store<f64>(resultPtr + iOffset, current)
  }
}

/**
 * Group delay computation
 * tau(w) = -d(phase)/dw
 *
 * @param hRealPtr - Pointer to real part of H (f64)
 * @param hImagPtr - Pointer to imaginary part of H (f64)
 * @param wPtr - Pointer to frequencies (f64)
 * @param n - Length
 * @param resultPtr - Pointer to output group delay (f64)
 * @param workPtr - Pointer to working memory for phase computation (f64, 2*n elements)
 */
export function groupDelay(
  hRealPtr: usize,
  hImagPtr: usize,
  wPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize
): void {
  if (n < 2) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(resultPtr + (<usize>i << 3), 0.0)
    }
    return
  }

  // Working memory layout:
  // phaseArray: workPtr (n elements)
  // unwrappedPhase: workPtr + n*8 (n elements)
  const phasePtr: usize = workPtr
  const unwrappedPtr: usize = workPtr + (<usize>n << 3)

  // Compute phase
  phase(hRealPtr, hImagPtr, n, phasePtr)

  // Unwrap phase
  unwrapPhase(phasePtr, n, unwrappedPtr)

  // Compute negative derivative
  for (let i: i32 = 1; i < n - 1; i++) {
    const iOffset: usize = <usize>i << 3
    const prevOffset: usize = <usize>(i - 1) << 3
    const nextOffset: usize = <usize>(i + 1) << 3

    const dPhase: f64 = load<f64>(unwrappedPtr + nextOffset) - load<f64>(unwrappedPtr + prevOffset)
    const dw: f64 = load<f64>(wPtr + nextOffset) - load<f64>(wPtr + prevOffset)

    store<f64>(resultPtr + iOffset, -dPhase / dw)
  }

  // Endpoints use one-sided differences
  const phase0: f64 = load<f64>(unwrappedPtr)
  const phase1: f64 = load<f64>(unwrappedPtr + 8)
  const w0: f64 = load<f64>(wPtr)
  const w1: f64 = load<f64>(wPtr + 8)
  store<f64>(resultPtr, -(phase1 - phase0) / (w1 - w0))

  const phaseNm1: f64 = load<f64>(unwrappedPtr + (<usize>(n - 1) << 3))
  const phaseNm2: f64 = load<f64>(unwrappedPtr + (<usize>(n - 2) << 3))
  const wNm1: f64 = load<f64>(wPtr + (<usize>(n - 1) << 3))
  const wNm2: f64 = load<f64>(wPtr + (<usize>(n - 2) << 3))
  store<f64>(resultPtr + (<usize>(n - 1) << 3), -(phaseNm1 - phaseNm2) / (wNm1 - wNm2))
}
