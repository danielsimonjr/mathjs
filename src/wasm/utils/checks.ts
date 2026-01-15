// @ts-nocheck
/**
 * WASM-optimized utility functions for numeric checks
 * using AssemblyScript
 */

/**
 * Check if a value is NaN
 * @param x - Value to check
 * @returns 1 if NaN, 0 otherwise
 */
export function isNaN(x: f64): i32 {
  return x !== x ? 1 : 0
}

/**
 * Check if a value is finite (not Infinity and not NaN)
 * @param x - Value to check
 * @returns 1 if finite, 0 otherwise
 */
export function isFinite(x: f64): i32 {
  // In JavaScript, use Number.isFinite behavior
  if (x !== x) return 0 // NaN
  if (!Number.isFinite(x)) return 0
  return 1
}

/**
 * Check if a value is an integer
 * @param x - Value to check
 * @returns 1 if integer, 0 otherwise
 */
export function isInteger(x: f64): i32 {
  if (x !== x) return 0 // NaN check
  return Math.floor(x) === x ? 1 : 0
}

/**
 * Check if a value is positive (> 0)
 * @param x - Value to check
 * @returns 1 if positive, 0 otherwise
 */
export function isPositive(x: f64): i32 {
  return x > 0.0 ? 1 : 0
}

/**
 * Check if a value is negative (< 0)
 * @param x - Value to check
 * @returns 1 if negative, 0 otherwise
 */
export function isNegative(x: f64): i32 {
  return x < 0.0 ? 1 : 0
}

/**
 * Check if a value is zero
 * @param x - Value to check
 * @returns 1 if zero, 0 otherwise
 */
export function isZero(x: f64): i32 {
  return x === 0.0 ? 1 : 0
}

/**
 * Check if a value is non-negative (>= 0)
 * @param x - Value to check
 * @returns 1 if non-negative, 0 otherwise
 */
export function isNonNegative(x: f64): i32 {
  return x >= 0.0 ? 1 : 0
}

/**
 * Check if a value is non-positive (<= 0)
 * @param x - Value to check
 * @returns 1 if non-positive, 0 otherwise
 */
export function isNonPositive(x: f64): i32 {
  return x <= 0.0 ? 1 : 0
}

/**
 * Check if an integer is prime using trial division
 * @param n - Integer to check
 * @returns 1 if prime, 0 otherwise
 */
export function isPrime(n: i64): i32 {
  if (n < 2) return 0
  if (n === 2) return 1
  if (n % 2 === 0) return 0
  if (n === 3) return 1
  if (n % 3 === 0) return 0

  // Check divisibility by 6k +/- 1 up to sqrt(n)
  let i: i64 = 5
  while (i * i <= n) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return 0
    }
    i += 6
  }

  return 1
}

/**
 * Check if a number is prime (f64 version)
 * @param x - Number to check
 * @returns 1 if prime, 0 otherwise
 */
export function isPrimeF64(x: f64): i32 {
  if (x !== x || x < 2.0) return 0 // NaN or < 2
  if (Math.floor(x) !== x) return 0 // Not an integer
  return isPrime(<i64>x)
}

/**
 * Check if a value is an even integer
 * @param x - Value to check
 * @returns 1 if even integer, 0 otherwise
 */
export function isEven(x: f64): i32 {
  if (Math.floor(x) !== x) return 0
  return <i64>x % 2 === 0 ? 1 : 0
}

/**
 * Check if a value is an odd integer
 * @param x - Value to check
 * @returns 1 if odd integer, 0 otherwise
 */
export function isOdd(x: f64): i32 {
  if (Math.floor(x) !== x) return 0
  return <i64>x % 2 !== 0 ? 1 : 0
}

/**
 * Check if a value is within bounds [min, max]
 * @param x - Value to check
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns 1 if within bounds, 0 otherwise
 */
export function isBounded(x: f64, min: f64, max: f64): i32 {
  return x >= min && x <= max ? 1 : 0
}

/**
 * Check if a value is a perfect square
 * @param n - Integer to check
 * @returns 1 if perfect square, 0 otherwise
 */
export function isPerfectSquare(n: i64): i32 {
  if (n < 0) return 0
  if (n === 0) return 1

  const root: i64 = <i64>Math.sqrt(<f64>n)
  return root * root === n ? 1 : 0
}

/**
 * Check if a value is a power of two
 * @param n - Integer to check
 * @returns 1 if power of two, 0 otherwise
 */
export function isPowerOfTwo(n: i64): i32 {
  if (n <= 0) return 0
  return (n & (n - 1)) === 0 ? 1 : 0
}

/**
 * Count elements satisfying a condition in array
 * @param arr - Input array
 * @param length - Number of elements
 * @param condition - 0=isZero, 1=isPositive, 2=isNegative, 3=isNaN, 4=isFinite
 * @returns Count of elements satisfying condition
 */
export function countCondition(
  arr: Float64Array,
  length: i32,
  condition: i32
): i32 {
  let count: i32 = 0

  for (let i: i32 = 0; i < length; i++) {
    const x: f64 = arr[i]
    let match: i32 = 0

    if (condition === 0) {
      match = isZero(x)
    } else if (condition === 1) {
      match = isPositive(x)
    } else if (condition === 2) {
      match = isNegative(x)
    } else if (condition === 3) {
      match = isNaN(x)
    } else if (condition === 4) {
      match = isFinite(x)
    }

    count += match
  }

  return count
}

/**
 * Check all elements in array are finite
 * @param arr - Input array
 * @param length - Number of elements
 * @returns 1 if all finite, 0 otherwise
 */
export function allFinite(arr: Float64Array, length: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    if (isFinite(arr[i]) === 0) {
      return 0
    }
  }
  return 1
}

/**
 * Check if any element in array is NaN
 * @param arr - Input array
 * @param length - Number of elements
 * @returns 1 if any NaN, 0 otherwise
 */
export function anyNaN(arr: Float64Array, length: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    if (isNaN(arr[i]) === 1) {
      return 1
    }
  }
  return 0
}

/**
 * Check if all elements in array are positive
 * @param arr - Input array
 * @param length - Number of elements
 * @returns 1 if all positive, 0 otherwise
 */
export function allPositive(arr: Float64Array, length: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    if (arr[i] <= 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Check if all elements in array are non-negative
 * @param arr - Input array
 * @param length - Number of elements
 * @returns 1 if all non-negative, 0 otherwise
 */
export function allNonNegative(arr: Float64Array, length: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    if (arr[i] < 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Check if all elements in array are integers
 * @param arr - Input array
 * @param length - Number of elements
 * @returns 1 if all integers, 0 otherwise
 */
export function allIntegers(arr: Float64Array, length: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    if (isInteger(arr[i]) === 0) {
      return 0
    }
  }
  return 1
}

/**
 * Find first index where condition is true
 * @param arr - Input array
 * @param length - Number of elements
 * @param condition - 0=isZero, 1=isPositive, 2=isNegative, 3=isNaN
 * @returns Index of first match, or -1 if not found
 */
export function findFirst(arr: Float64Array, length: i32, condition: i32): i32 {
  for (let i: i32 = 0; i < length; i++) {
    const x: f64 = arr[i]
    let match: i32 = 0

    if (condition === 0) {
      match = isZero(x)
    } else if (condition === 1) {
      match = isPositive(x)
    } else if (condition === 2) {
      match = isNegative(x)
    } else if (condition === 3) {
      match = isNaN(x)
    }

    if (match === 1) {
      return i
    }
  }

  return -1
}

/**
 * Get the sign of a number (-1, 0, or 1)
 * @param x - Value
 * @returns -1 if negative, 0 if zero, 1 if positive, NaN if NaN
 */
export function sign(x: f64): f64 {
  if (x !== x) return f64.NaN
  if (x > 0.0) return 1.0
  if (x < 0.0) return -1.0
  return 0.0
}

/**
 * Get signs of all elements in array
 * @param arr - Input array
 * @param output - Output array
 * @param length - Number of elements
 */
export function signArray(
  arr: Float64Array,
  output: Float64Array,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    output[i] = sign(arr[i])
  }
}

/**
 * Count primes up to n using Sieve of Eratosthenes
 * @param n - Upper bound
 * @returns Count of primes <= n
 */
export function countPrimesUpTo(n: i32): i32 {
  if (n < 2) return 0

  // Simple sieve (memory efficient for small n)
  const sieve = new Uint8Array(n + 1)

  // Initialize all as potentially prime
  for (let i: i32 = 2; i <= n; i++) {
    sieve[i] = 1
  }

  // Mark composites
  for (let i: i32 = 2; i * i <= n; i++) {
    if (sieve[i] === 1) {
      for (let j: i32 = i * i; j <= n; j += i) {
        sieve[j] = 0
      }
    }
  }

  // Count primes
  let count: i32 = 0
  for (let i: i32 = 2; i <= n; i++) {
    count += <i32>sieve[i]
  }

  return count
}

/**
 * Get the nth prime number
 * @param n - Which prime to get (1-indexed, so n=1 returns 2)
 * @returns The nth prime
 */
export function nthPrime(n: i32): i64 {
  if (n < 1) return 0

  let count: i32 = 0
  let candidate: i64 = 1

  while (count < n) {
    candidate++
    if (isPrime(candidate) === 1) {
      count++
    }
  }

  return candidate
}

/**
 * Greatest common divisor using Euclidean algorithm
 * @param a - First integer
 * @param b - Second integer
 * @returns GCD of a and b
 */
export function gcd(a: i64, b: i64): i64 {
  if (a < 0) a = -a
  if (b < 0) b = -b

  while (b !== 0) {
    const temp: i64 = b
    b = a % b
    a = temp
  }

  return a
}

/**
 * Least common multiple
 * @param a - First integer
 * @param b - Second integer
 * @returns LCM of a and b
 */
export function lcm(a: i64, b: i64): i64 {
  if (a === 0 || b === 0) return 0
  if (a < 0) a = -a
  if (b < 0) b = -b

  return (a / gcd(a, b)) * b
}

/**
 * Check if two integers are coprime (GCD = 1)
 * @param a - First integer
 * @param b - Second integer
 * @returns 1 if coprime, 0 otherwise
 */
export function areCoprime(a: i64, b: i64): i32 {
  return gcd(a, b) === 1 ? 1 : 0
}
