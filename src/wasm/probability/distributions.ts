/**
 * WASM-optimized probability distributions and random number generation
 * using AssemblyScript
 *
 * All array functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// Linear Congruential Generator state (using f64 for JS compatibility)
let lcgState: f64 = 12345

/**
 * Set the seed for the random number generator
 * @param seed - The seed value
 */
export function setSeed(seed: f64): void {
  lcgState = seed
}

/**
 * Generate a random 32-bit unsigned integer using LCG
 * Uses modular arithmetic within f64 safe integer range
 * @returns Random u32 value
 */
export function randomU32(): i32 {
  // LCG parameters (same as glibc), using f64 arithmetic
  lcgState = (lcgState * 1103515245 + 12345) % 2147483648
  return <i32>lcgState
}

/**
 * Generate a random float in [0, 1)
 * @returns Random f64 in [0, 1)
 */
export function random(): f64 {
  return <f64>randomU32() / 2147483648.0
}

/**
 * Generate a random integer in [min, max]
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range
 */
export function randomInt(min: i32, max: i32): i32 {
  const range: i32 = max - min + 1
  const r: i32 = randomU32()
  return min + ((r < 0 ? -r : r) % range)
}

/**
 * Generate a random float in [min, max)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random f64 in range
 */
export function randomRange(min: f64, max: f64): f64 {
  return min + random() * (max - min)
}

/**
 * Generate random value from uniform distribution
 * @param a - Lower bound
 * @param b - Upper bound
 * @returns Random value from U(a, b)
 */
export function uniform(a: f64, b: f64): f64 {
  return a + random() * (b - a)
}

/**
 * Generate random value from normal distribution using Box-Muller transform
 * @param mu - Mean
 * @param sigma - Standard deviation
 * @returns Random value from N(mu, sigma^2)
 */
export function normal(mu: f64, sigma: f64): f64 {
  const u1: f64 = random()
  const u2: f64 = random()

  // Box-Muller transform
  const z0: f64 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)

  return mu + sigma * z0
}

/**
 * Generate random value from exponential distribution
 * @param lambda - Rate parameter (lambda > 0)
 * @returns Random value from Exp(lambda)
 */
export function exponential(lambda: f64): f64 {
  return -Math.log(1.0 - random()) / lambda
}

/**
 * Generate random value from Bernoulli distribution
 * @param p - Probability of success (0 <= p <= 1)
 * @returns 1 with probability p, 0 otherwise
 */
export function bernoulli(p: f64): i32 {
  return random() < p ? 1 : 0
}

/**
 * Generate random value from binomial distribution
 * @param n - Number of trials
 * @param p - Probability of success
 * @returns Number of successes
 */
export function binomial(n: i32, p: f64): i32 {
  let successes: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (random() < p) {
      successes++
    }
  }
  return successes
}

/**
 * Generate random value from Poisson distribution
 * @param lambda - Expected number of events
 * @returns Number of events
 */
export function poisson(lambda: f64): i32 {
  const L: f64 = Math.exp(-lambda)
  let k: i32 = 0
  let p: f64 = 1.0

  do {
    k++
    p *= random()
  } while (p > L)

  return k - 1
}

/**
 * Generate random value from geometric distribution
 * @param p - Probability of success
 * @returns Number of trials until first success
 */
export function geometric(p: f64): i32 {
  return <i32>Math.ceil(Math.log(1.0 - random()) / Math.log(1.0 - p))
}

/**
 * Fill array with random values from uniform distribution
 * @param outputPtr - Pointer to output array (f64)
 * @param length - Number of values to generate
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function fillUniform(
  outputPtr: usize,
  length: i32,
  min: f64,
  max: f64
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(outputPtr + offset, uniform(min, max))
  }
}

/**
 * Fill array with random values from normal distribution
 * @param outputPtr - Pointer to output array (f64)
 * @param length - Number of values to generate
 * @param mu - Mean
 * @param sigma - Standard deviation
 */
export function fillNormal(
  outputPtr: usize,
  length: i32,
  mu: f64,
  sigma: f64
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(outputPtr + offset, normal(mu, sigma))
  }
}

/**
 * Compute the probability density function of normal distribution
 * @param x - Value
 * @param mu - Mean
 * @param sigma - Standard deviation
 * @returns PDF value at x
 */
export function normalPDF(x: f64, mu: f64, sigma: f64): f64 {
  const z: f64 = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2.0 * Math.PI))
}

/**
 * Compute the cumulative distribution function of standard normal distribution
 * Uses Abramowitz and Stegun approximation
 * @param x - Value
 * @returns CDF value at x
 */
export function standardNormalCDF(x: f64): f64 {
  const a1: f64 = 0.254829592
  const a2: f64 = -0.284496736
  const a3: f64 = 1.421413741
  const a4: f64 = -1.453152027
  const a5: f64 = 1.061405429
  const p: f64 = 0.3275911

  const sign: f64 = x < 0 ? -1.0 : 1.0
  const absX: f64 = Math.abs(x)

  const t: f64 = 1.0 / (1.0 + p * absX)
  const y: f64 =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX)

  return 0.5 * (1.0 + sign * y)
}

/**
 * Compute the cumulative distribution function of normal distribution
 * @param x - Value
 * @param mu - Mean
 * @param sigma - Standard deviation
 * @returns CDF value at x
 */
export function normalCDF(x: f64, mu: f64, sigma: f64): f64 {
  return standardNormalCDF((x - mu) / sigma)
}

/**
 * Compute the probability density function of exponential distribution
 * @param x - Value (x >= 0)
 * @param lambda - Rate parameter
 * @returns PDF value at x
 */
export function exponentialPDF(x: f64, lambda: f64): f64 {
  if (x < 0) return 0.0
  return lambda * Math.exp(-lambda * x)
}

/**
 * Compute the cumulative distribution function of exponential distribution
 * @param x - Value
 * @param lambda - Rate parameter
 * @returns CDF value at x
 */
export function exponentialCDF(x: f64, lambda: f64): f64 {
  if (x < 0) return 0.0
  return 1.0 - Math.exp(-lambda * x)
}

/**
 * Compute Kullback-Leibler divergence between two discrete distributions
 * @param pPtr - Pointer to first distribution (f64, must sum to 1)
 * @param qPtr - Pointer to second distribution (f64, must sum to 1)
 * @param length - Number of elements
 * @returns KL divergence D_KL(P || Q)
 */
export function klDivergence(
  pPtr: usize,
  qPtr: usize,
  length: i32
): f64 {
  let kl: f64 = 0.0

  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    const pVal: f64 = load<f64>(pPtr + offset)
    const qVal: f64 = load<f64>(qPtr + offset)
    if (pVal > 0.0 && qVal > 0.0) {
      kl += pVal * Math.log(pVal / qVal)
    }
  }

  return kl
}

/**
 * Compute Jensen-Shannon divergence between two distributions
 * @param pPtr - Pointer to first distribution (f64)
 * @param qPtr - Pointer to second distribution (f64)
 * @param length - Number of elements
 * @param workPtr - Pointer to working memory (f64, length elements)
 * @returns JS divergence
 */
export function jsDivergence(
  pPtr: usize,
  qPtr: usize,
  length: i32,
  workPtr: usize
): f64 {
  // Compute m = 0.5 * (p + q)
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    const pVal: f64 = load<f64>(pPtr + offset)
    const qVal: f64 = load<f64>(qPtr + offset)
    store<f64>(workPtr + offset, 0.5 * (pVal + qVal))
  }

  return 0.5 * klDivergence(pPtr, workPtr, length) + 0.5 * klDivergence(qPtr, workPtr, length)
}

/**
 * Compute entropy of a discrete distribution
 * @param pPtr - Pointer to probability distribution (f64)
 * @param length - Number of elements
 * @returns Entropy in nats
 */
export function entropy(pPtr: usize, length: i32): f64 {
  let h: f64 = 0.0

  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    const pVal: f64 = load<f64>(pPtr + offset)
    if (pVal > 0.0) {
      h -= pVal * Math.log(pVal)
    }
  }

  return h
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param arrPtr - Pointer to array to shuffle (f64)
 * @param length - Number of elements
 */
export function shuffle(arrPtr: usize, length: i32): void {
  for (let i: i32 = length - 1; i > 0; i--) {
    const j: i32 = randomInt(0, i)
    const iOffset: usize = <usize>i << 3
    const jOffset: usize = <usize>j << 3
    const temp: f64 = load<f64>(arrPtr + iOffset)
    store<f64>(arrPtr + iOffset, load<f64>(arrPtr + jOffset))
    store<f64>(arrPtr + jOffset, temp)
  }
}

/**
 * Sample k elements from array without replacement
 * @param arrPtr - Pointer to source array (f64)
 * @param length - Length of source array
 * @param k - Number of elements to sample
 * @param outputPtr - Pointer to output array (f64, length >= k)
 * @param workPtr - Pointer to working memory (f64, length elements)
 */
export function sampleWithoutReplacement(
  arrPtr: usize,
  length: i32,
  k: i32,
  outputPtr: usize,
  workPtr: usize
): void {
  // Copy array to working memory
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(workPtr + offset, load<f64>(arrPtr + offset))
  }

  // Partial Fisher-Yates
  for (let i: i32 = 0; i < k; i++) {
    const j: i32 = randomInt(i, length - 1)
    const iOffset: usize = <usize>i << 3
    const jOffset: usize = <usize>j << 3
    const temp: f64 = load<f64>(workPtr + iOffset)
    store<f64>(workPtr + iOffset, load<f64>(workPtr + jOffset))
    store<f64>(workPtr + jOffset, temp)
    store<f64>(outputPtr + iOffset, load<f64>(workPtr + iOffset))
  }
}

/**
 * Sample k elements from array with replacement
 * @param arrPtr - Pointer to source array (f64)
 * @param length - Length of source array
 * @param k - Number of elements to sample
 * @param outputPtr - Pointer to output array (f64, length >= k)
 */
export function sampleWithReplacement(
  arrPtr: usize,
  length: i32,
  k: i32,
  outputPtr: usize
): void {
  for (let i: i32 = 0; i < k; i++) {
    const j: i32 = randomInt(0, length - 1)
    const iOffset: usize = <usize>i << 3
    const jOffset: usize = <usize>j << 3
    store<f64>(outputPtr + iOffset, load<f64>(arrPtr + jOffset))
  }
}
