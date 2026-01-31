import { clone } from '../../../utils/object.ts'
import { wasmLoader } from '../../../wasm/WasmLoader.ts'
import type { BigNumber } from 'bignumber.js'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_EIGS_THRESHOLD = 16 // 4x4 matrix

/** Scalar types for real symmetric eigenvalue computation */
type Scalar = number | BigNumber

/**
 * Flatten a 2D array to a Float64Array in row-major order
 */
function flattenToFloat64(
  matrix: number[][],
  rows: number,
  cols: number
): Float64Array {
  const result = new Float64Array(rows * cols)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i * cols + j] = matrix[i][j]
    }
  }
  return result
}

// Type definitions
/** Result for a single eigenvector with its corresponding eigenvalue */
interface EigenvectorResult {
  value: Scalar
  vector: Scalar[]
}

/** Result of real symmetric eigenvalue computation */
interface EigenResult {
  values: Scalar[]
  eigenvectors?: EigenvectorResult[]
}

/** Configuration object */
interface Config {
  relTol: number | BigNumber
}

/** Dependencies for createRealSymmetric */
interface Dependencies {
  config: Config
  addScalar: (a: Scalar, b: Scalar) => Scalar
  subtract: (a: Scalar, b: Scalar) => Scalar
  abs: (x: Scalar) => number | BigNumber
  atan: (x: Scalar) => Scalar
  cos: (x: Scalar) => Scalar
  sin: (x: Scalar) => Scalar
  multiplyScalar: (a: Scalar, b: Scalar) => Scalar
  inv: (x: Scalar) => Scalar
  bignumber: (x: number | string) => BigNumber
  multiply: (...args: Scalar[]) => Scalar
  add: (...args: Scalar[]) => Scalar
}

export function createRealSymmetric({
  config,
  addScalar,
  subtract,
  abs,
  atan,
  cos,
  sin,
  multiplyScalar,
  inv,
  bignumber,
  multiply,
  add
}: Dependencies) {
  /**
   * Compute eigenvalues and optionally eigenvectors of a real symmetric matrix
   * @param arr the matrix
   * @param N size of the matrix
   * @param prec precision threshold
   * @param type data type ('number' or 'BigNumber')
   * @param computeVectors whether to compute eigenvectors
   */
  function main(
    arr: Scalar[][],
    N: number,
    prec: number | BigNumber = config.relTol,
    type: 'number' | 'BigNumber',
    computeVectors: boolean
  ): EigenResult {
    if (type === 'number') {
      return diag(arr, prec, computeVectors)
    }

    if (type === 'BigNumber') {
      return diagBig(arr, prec, computeVectors)
    }

    throw TypeError('Unsupported data type: ' + type)
  }

  // diagonalization implementation for number (efficient)
  function diag(
    x: number[][],
    precision: number,
    computeVectors: boolean
  ): EigenResult {
    const N = x.length

    // WASM fast path for plain number symmetric matrices
    const wasm = wasmLoader.getModule()
    if (wasm && N * N >= WASM_EIGS_THRESHOLD) {
      try {
        const flat = flattenToFloat64(x, N, N)
        const matrixAlloc = wasmLoader.allocateFloat64Array(flat)
        const eigenvaluesAlloc = wasmLoader.allocateFloat64ArrayEmpty(N)
        const eigenvectorsAlloc = computeVectors
          ? wasmLoader.allocateFloat64ArrayEmpty(N * N)
          : { ptr: 0, array: new Float64Array(0) }
        const workAlloc = wasmLoader.allocateFloat64ArrayEmpty(N * N)

        try {
          const iterations = wasm.eigsSymmetric(
            matrixAlloc.ptr,
            N,
            eigenvaluesAlloc.ptr,
            eigenvectorsAlloc.ptr,
            workAlloc.ptr,
            1000, // maxIterations
            precision
          )

          if (iterations >= 0) {
            // Extract eigenvalues
            const values: number[] = Array(N)
            for (let i = 0; i < N; i++) {
              values[i] = eigenvaluesAlloc.array[i]
            }

            if (!computeVectors) {
              // Sort by absolute value
              const sortedValues = values
                .map((v, i) => ({ v, i }))
                .sort((a, b) => Math.abs(a.v) - Math.abs(b.v))
                .map((x) => x.v)
              return { values: sortedValues }
            }

            // Extract eigenvectors (stored column-major in WASM)
            const eigenvectors: EigenvectorResult[] = []
            const sortedIndices = values
              .map((v, i) => ({ v, i }))
              .sort((a, b) => Math.abs(a.v) - Math.abs(b.v))
              .map((x) => x.i)

            for (const origIdx of sortedIndices) {
              const vector: number[] = Array(N)
              for (let i = 0; i < N; i++) {
                // Eigenvectors stored column-major: column origIdx
                vector[i] = eigenvectorsAlloc.array[i * N + origIdx]
              }
              eigenvectors.push({
                value: values[origIdx],
                vector
              })
            }

            return {
              values: sortedIndices.map((i) => values[i]),
              eigenvectors
            }
          }
          // Fall through to JS implementation if WASM failed
        } finally {
          wasmLoader.free(matrixAlloc.ptr)
          wasmLoader.free(eigenvaluesAlloc.ptr)
          if (computeVectors) {
            wasmLoader.free(eigenvectorsAlloc.ptr)
          }
          wasmLoader.free(workAlloc.ptr)
        }
      } catch (e) {
        // Fall back to JS implementation on WASM error
      }
    }

    // JavaScript fallback
    const e0 = Math.abs(precision / N)
    let psi: number
    let Sij: number[][] | undefined
    if (computeVectors) {
      Sij = new Array(N)
      // Sij is Identity Matrix
      for (let i = 0; i < N; i++) {
        Sij[i] = Array(N).fill(0)
        Sij[i][i] = 1.0
      }
    }
    // initial error
    let Vab = getAij(x)
    while (Math.abs(Vab[1]) >= Math.abs(e0)) {
      const i = Vab[0][0]
      const j = Vab[0][1]
      psi = getTheta(x[i][i], x[j][j], x[i][j])
      x = x1(x, psi, i, j)
      if (computeVectors) Sij = Sij1(Sij!, psi, i, j)
      Vab = getAij(x)
    }
    const Ei = Array(N).fill(0) // eigenvalues
    for (let i = 0; i < N; i++) {
      Ei[i] = x[i][i]
    }
    return sorting(clone(Ei), Sij, computeVectors)
  }

  // diagonalization implementation for bigNumber
  function diagBig(
    x: BigNumber[][],
    precision: BigNumber,
    computeVectors: boolean
  ): EigenResult {
    const N = x.length
    const e0 = abs(multiplyScalar(precision, bignumber(1 / N)))
    let psi: BigNumber
    let Sij: BigNumber[][] | undefined
    if (computeVectors) {
      Sij = new Array(N)
      // Sij is Identity Matrix
      for (let i = 0; i < N; i++) {
        Sij[i] = Array(N).fill(bignumber(0))
        Sij[i][i] = bignumber(1)
      }
    }
    // initial error
    let Vab = getAijBig(x)
    while ((abs(Vab[1]) as number) >= (abs(e0) as number)) {
      const i = Vab[0][0]
      const j = Vab[0][1]
      psi = getThetaBig(x[i][i], x[j][j], x[i][j])
      x = x1Big(x, psi, i, j)
      if (computeVectors) Sij = Sij1Big(Sij!, psi, i, j)
      Vab = getAijBig(x)
    }
    const Ei: BigNumber[] = Array(N).fill(bignumber(0)) // eigenvalues
    for (let i = 0; i < N; i++) {
      Ei[i] = x[i][i]
    }
    return sorting(clone(Ei) as Scalar[], Sij as Scalar[][] | undefined, computeVectors)
  }

  // get angle
  function getTheta(aii: number, ajj: number, aij: number): number {
    const denom = ajj - aii
    if (Math.abs(denom) <= config.relTol) {
      return Math.PI / 4.0
    } else {
      return 0.5 * Math.atan((2.0 * aij) / (ajj - aii))
    }
  }

  // get angle for BigNumber
  function getThetaBig(aii: BigNumber, ajj: BigNumber, aij: BigNumber): BigNumber {
    const denom = subtract(ajj, aii) as BigNumber
    if ((abs(denom) as number) <= (config.relTol as number)) {
      return bignumber(-1).acos().div(4) as unknown as BigNumber
    } else {
      return multiplyScalar(0.5 as unknown as BigNumber, atan(multiply(bignumber(2.0), aij, inv(denom)))) as BigNumber
    }
  }

  // update eigenvectors
  function Sij1(
    Sij: number[][],
    theta: number,
    i: number,
    j: number
  ): number[][] {
    const N = Sij.length
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const Ski: number[] = Array(N).fill(0)
    const Skj: number[] = Array(N).fill(0)
    for (let k = 0; k < N; k++) {
      Ski[k] = c * Sij[k][i] - s * Sij[k][j]
      Skj[k] = s * Sij[k][i] + c * Sij[k][j]
    }
    for (let k = 0; k < N; k++) {
      Sij[k][i] = Ski[k]
      Sij[k][j] = Skj[k]
    }
    return Sij
  }

  // update eigenvectors for BigNumber
  function Sij1Big(Sij: BigNumber[][], theta: BigNumber, i: number, j: number): BigNumber[][] {
    const N = Sij.length
    const c = cos(theta) as BigNumber
    const s = sin(theta) as BigNumber
    const Ski: BigNumber[] = Array(N).fill(bignumber(0))
    const Skj: BigNumber[] = Array(N).fill(bignumber(0))
    for (let k = 0; k < N; k++) {
      Ski[k] = subtract(
        multiplyScalar(c, Sij[k][i]),
        multiplyScalar(s, Sij[k][j])
      ) as BigNumber
      Skj[k] = addScalar(
        multiplyScalar(s, Sij[k][i]),
        multiplyScalar(c, Sij[k][j])
      ) as BigNumber
    }
    for (let k = 0; k < N; k++) {
      Sij[k][i] = Ski[k]
      Sij[k][j] = Skj[k]
    }
    return Sij
  }

  // update matrix for BigNumber
  function x1Big(Hij: BigNumber[][], theta: BigNumber, i: number, j: number): BigNumber[][] {
    const N = Hij.length
    const c = bignumber((cos(theta) as BigNumber).toString())
    const s = bignumber((sin(theta) as BigNumber).toString())
    const c2 = multiplyScalar(c, c) as BigNumber
    const s2 = multiplyScalar(s, s) as BigNumber
    const Aki: BigNumber[] = Array(N).fill(bignumber(0))
    const Akj: BigNumber[] = Array(N).fill(bignumber(0))
    // 2cs Hij
    const csHij = multiply(bignumber(2), c, s, Hij[i][j]) as BigNumber
    //  Aii
    const Aii = addScalar(
      subtract(multiplyScalar(c2, Hij[i][i]), csHij),
      multiplyScalar(s2, Hij[j][j])
    ) as BigNumber
    const Ajj = add(
      multiplyScalar(s2, Hij[i][i]),
      csHij,
      multiplyScalar(c2, Hij[j][j])
    ) as BigNumber
    // 0  to i
    for (let k = 0; k < N; k++) {
      Aki[k] = subtract(
        multiplyScalar(c, Hij[i][k]),
        multiplyScalar(s, Hij[j][k])
      ) as BigNumber
      Akj[k] = addScalar(
        multiplyScalar(s, Hij[i][k]),
        multiplyScalar(c, Hij[j][k])
      ) as BigNumber
    }
    // Modify Hij
    Hij[i][i] = Aii
    Hij[j][j] = Ajj
    Hij[i][j] = bignumber(0)
    Hij[j][i] = bignumber(0)
    // 0  to i
    for (let k = 0; k < N; k++) {
      if (k !== i && k !== j) {
        Hij[i][k] = Aki[k]
        Hij[k][i] = Aki[k]
        Hij[j][k] = Akj[k]
        Hij[k][j] = Akj[k]
      }
    }
    return Hij
  }

  // update matrix
  function x1(
    Hij: number[][],
    theta: number,
    i: number,
    j: number
  ): number[][] {
    const N = Hij.length
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const c2 = c * c
    const s2 = s * s
    const Aki = Array(N).fill(0)
    const Akj = Array(N).fill(0)
    //  Aii
    const Aii = c2 * Hij[i][i] - 2 * c * s * Hij[i][j] + s2 * Hij[j][j]
    const Ajj = s2 * Hij[i][i] + 2 * c * s * Hij[i][j] + c2 * Hij[j][j]
    // 0  to i
    for (let k = 0; k < N; k++) {
      Aki[k] = c * Hij[i][k] - s * Hij[j][k]
      Akj[k] = s * Hij[i][k] + c * Hij[j][k]
    }
    // Modify Hij
    Hij[i][i] = Aii
    Hij[j][j] = Ajj
    Hij[i][j] = 0
    Hij[j][i] = 0
    // 0  to i
    for (let k = 0; k < N; k++) {
      if (k !== i && k !== j) {
        Hij[i][k] = Aki[k]
        Hij[k][i] = Aki[k]
        Hij[j][k] = Akj[k]
        Hij[k][j] = Akj[k]
      }
    }
    return Hij
  }

  // get max off-diagonal value from Upper Diagonal
  function getAij(Mij: number[][]): [[number, number], number] {
    const N = Mij.length
    let maxMij = 0
    let maxIJ: [number, number] = [0, 1]
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (Math.abs(maxMij) < Math.abs(Mij[i][j])) {
          maxMij = Math.abs(Mij[i][j])
          maxIJ = [i, j]
        }
      }
    }
    return [maxIJ, maxMij]
  }

  // get max off-diagonal value from Upper Diagonal (BigNumber version)
  function getAijBig(Mij: BigNumber[][]): [[number, number], BigNumber] {
    const N = Mij.length
    let maxMij: BigNumber = bignumber(0)
    let maxIJ: [number, number] = [0, 1]
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if ((abs(maxMij) as number) < (abs(Mij[i][j]) as number)) {
          maxMij = abs(Mij[i][j]) as BigNumber
          maxIJ = [i, j]
        }
      }
    }
    return [maxIJ, maxMij]
  }

  // sort results by absolute value
  function sorting(
    E: Scalar[],
    S: Scalar[][] | undefined,
    computeVectors: boolean
  ): EigenResult {
    const N = E.length
    const values: Scalar[] = Array(N)
    let vecs: Scalar[][] | undefined
    if (computeVectors) {
      vecs = Array(N)
      for (let k = 0; k < N; k++) {
        vecs[k] = Array(N)
      }
    }
    for (let i = 0; i < N; i++) {
      let minID = 0
      let minE = E[0]
      for (let j = 0; j < E.length; j++) {
        if ((abs(E[j]) as number) < (abs(minE) as number)) {
          minID = j
          minE = E[minID]
        }
      }
      values[i] = E.splice(minID, 1)[0]
      if (computeVectors) {
        for (let k = 0; k < N; k++) {
          vecs![i][k] = S![k][minID]
          S![k].splice(minID, 1)
        }
      }
    }
    if (!computeVectors) return { values }
    const eigenvectors = vecs!.map((vector, i) => ({
      value: values[i],
      vector
    }))
    return { values, eigenvectors }
  }

  return main
}
