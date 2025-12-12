import { factory } from '../../utils/factory.ts'
import { isMatrix } from '../../utils/is.ts'
import { arraySize } from '../../utils/array.ts'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.ts'
import { createMatAlgo14xDs } from '../../type/matrix/utils/matAlgo14xDs.ts'

// Type definitions for better WASM integration and type safety
type MathNumericType = number | bigint
type MathDataType = 'number' | 'BigNumber' | 'bigint' | 'Fraction' | 'Complex' | 'mixed'
type ArraySize = number[]

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(signature: string, fn: (ref: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
  referToSelf<U>(fn: (self: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
}

interface MatrixData {
  data?: any[] | any[][]
  values?: any[]
  index?: number[]
  ptr?: number[]
  size: number[]
  datatype?: string
}

interface DenseMatrix {
  _data: any[] | any[][]
  _size: number[]
  _datatype?: string
  storage(): 'dense'
  size(): number[]
  getDataType(): string
  createDenseMatrix(data: MatrixData): DenseMatrix
  valueOf(): any[] | any[][]
}

interface SparseMatrix {
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  storage(): 'sparse'
  size(): number[]
  getDataType(): string
  createSparseMatrix(data: MatrixData): SparseMatrix
  valueOf(): any[] | any[][]
}

type Matrix = DenseMatrix | SparseMatrix

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  addScalar: TypedFunction
  multiplyScalar: TypedFunction
  equalScalar: TypedFunction
  dot: TypedFunction
}

const name = 'multiply'
const dependencies = [
  'typed',
  'matrix',
  'addScalar',
  'multiplyScalar',
  'equalScalar',
  'dot'
]

export const createMultiply = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, addScalar, multiplyScalar, equalScalar, dot }: Dependencies) => {
  const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
  const matAlgo14xDs = createMatAlgo14xDs({ typed })

  /**
   * Validates matrix dimensions for multiplication
   * @param size1 - Size of first matrix
   * @param size2 - Size of second matrix
   * @throws {RangeError} When dimensions are incompatible
   * @throws {Error} When matrices have unsupported dimensions
   */
  function _validateMatrixDimensions(size1: ArraySize, size2: ArraySize): void {
    // check left operand dimensions
    switch (size1.length) {
      case 1:
        // check size2
        switch (size2.length) {
          case 1:
            // Vector x Vector
            if (size1[0] !== size2[0]) {
              // throw error
              throw new RangeError('Dimension mismatch in multiplication. Vectors must have the same length')
            }
            break
          case 2:
            // Vector x Matrix
            if (size1[0] !== size2[0]) {
              // throw error
              throw new RangeError('Dimension mismatch in multiplication. Vector length (' + size1[0] + ') must match Matrix rows (' + size2[0] + ')')
            }
            break
          default:
            throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix B has ' + size2.length + ' dimensions)')
        }
        break
      case 2:
        // check size2
        switch (size2.length) {
          case 1:
            // Matrix x Vector
            if (size1[1] !== size2[0]) {
              // throw error
              throw new RangeError('Dimension mismatch in multiplication. Matrix columns (' + size1[1] + ') must match Vector length (' + size2[0] + ')')
            }
            break
          case 2:
            // Matrix x Matrix
            if (size1[1] !== size2[0]) {
              // throw error
              throw new RangeError('Dimension mismatch in multiplication. Matrix A columns (' + size1[1] + ') must match Matrix B rows (' + size2[0] + ')')
            }
            break
          default:
            throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix B has ' + size2.length + ' dimensions)')
        }
        break
      default:
        throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix A has ' + size1.length + ' dimensions)')
    }
  }

  /**
   * C = A * B
   *
   * @param a - Dense Vector (N)
   * @param b - Dense Vector (N)
   * @param n - Vector length
   * @returns Scalar value
   */
  function _multiplyVectorVector(a: Matrix, b: Matrix, n: number): any {
    // check empty vector
    if (n === 0) { throw new Error('Cannot multiply two empty vectors') }
    return dot(a, b)
  }

  /**
   * C = A * B
   *
   * @param a - Dense Vector (M)
   * @param b - Matrix (MxN)
   * @returns Dense Vector (N)
   */
  function _multiplyVectorMatrix(a: Matrix, b: Matrix): Matrix {
    // process storage
    if (b.storage() !== 'dense') {
      throw new Error('Support for SparseMatrix not implemented')
    }
    return _multiplyVectorDenseMatrix(a, b as DenseMatrix)
  }

  /**
   * C = A * B
   *
   * @param a - Dense Vector (M)
   * @param b - Dense Matrix (MxN)
   * @returns Dense Vector (N)
   */
  function _multiplyVectorDenseMatrix(a: Matrix, b: DenseMatrix): DenseMatrix {
    // a dense
    const adata = (a as DenseMatrix)._data as any[]
    const asize = (a as DenseMatrix)._size
    const adt = (a as DenseMatrix)._datatype || a.getDataType()
    // b dense
    const bdata = b._data as any[][]
    const bsize = b._size
    const bdt = b._datatype || b.getDataType()
    // rows & columns
    const alength = asize[0]
    const bcolumns = bsize[1]

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
    }

    // result
    const c: any[] = []

    // loop matrix columns
    for (let j = 0; j < bcolumns; j++) {
      // sum (do not initialize it with zero)
      let sum = mf(adata[0], bdata[0][j])
      // loop vector
      for (let i = 1; i < alength; i++) {
        // multiply & accumulate
        sum = af(sum, mf(adata[i], bdata[i][j]))
      }
      c[j] = sum
    }

    // return matrix
    return (a as DenseMatrix).createDenseMatrix({
      data: c,
      size: [bcolumns],
      datatype: adt === (a as DenseMatrix)._datatype && bdt === b._datatype ? dt : undefined
    })
  }

  /**
   * C = A * B
   *
   * @param a - Matrix (MxN)
   * @param b - Dense Vector (N)
   * @returns Dense Vector (M)
   */
  const _multiplyMatrixVector = typed('_multiplyMatrixVector', {
    'DenseMatrix, any': _multiplyDenseMatrixVector,
    'SparseMatrix, any': _multiplySparseMatrixVector
  })

  /**
   * C = A * B
   *
   * @param a - Matrix (MxN)
   * @param b - Matrix (NxC)
   * @returns Matrix (MxC)
   */
  const _multiplyMatrixMatrix = typed('_multiplyMatrixMatrix', {
    'DenseMatrix, DenseMatrix': _multiplyDenseMatrixDenseMatrix,
    'DenseMatrix, SparseMatrix': _multiplyDenseMatrixSparseMatrix,
    'SparseMatrix, DenseMatrix': _multiplySparseMatrixDenseMatrix,
    'SparseMatrix, SparseMatrix': _multiplySparseMatrixSparseMatrix
  })

  /**
   * C = A * B
   *
   * @param a - DenseMatrix (MxN)
   * @param b - Dense Vector (N)
   * @returns Dense Vector (M)
   */
  function _multiplyDenseMatrixVector(a: DenseMatrix, b: Matrix): DenseMatrix {
    // a dense
    const adata = a._data as any[][]
    const asize = a._size
    const adt = a._datatype || a.getDataType()
    // b dense
    const bdata = (b as DenseMatrix)._data as any[]
    const bdt = (b as DenseMatrix)._datatype || b.getDataType()
    // rows & columns
    const arows = asize[0]
    const acolumns = asize[1]

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
    }

    // result
    const c: any[] = []

    // loop matrix a rows
    for (let i = 0; i < arows; i++) {
      // current row
      const row = adata[i]
      // sum (do not initialize it with zero)
      let sum = mf(row[0], bdata[0])
      // loop matrix a columns
      for (let j = 1; j < acolumns; j++) {
        // multiply & accumulate
        sum = af(sum, mf(row[j], bdata[j]))
      }
      c[i] = sum
    }

    // return matrix
    return a.createDenseMatrix({
      data: c,
      size: [arows],
      datatype: adt === a._datatype && bdt === (b as DenseMatrix)._datatype ? dt : undefined
    })
  }

  /**
   * C = A * B
   *
   * @param a - DenseMatrix (MxN)
   * @param b - DenseMatrix (NxC)
   * @returns DenseMatrix (MxC)
   */
  function _multiplyDenseMatrixDenseMatrix(a: DenseMatrix, b: DenseMatrix): DenseMatrix {
    // a dense
    const adata = a._data as any[][]
    const asize = a._size
    const adt = a._datatype || a.getDataType()
    // b dense
    const bdata = b._data as any[][]
    const bsize = b._size
    const bdt = b._datatype || b.getDataType()
    // rows & columns
    const arows = asize[0]
    const acolumns = asize[1]
    const bcolumns = bsize[1]

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
    }

    // result
    const c: any[][] = []

    // loop matrix a rows
    for (let i = 0; i < arows; i++) {
      // current row
      const row = adata[i]
      // initialize row array
      c[i] = []
      // loop matrix b columns
      for (let j = 0; j < bcolumns; j++) {
        // sum (avoid initializing sum to zero)
        let sum = mf(row[0], bdata[0][j])
        // loop matrix a columns
        for (let x = 1; x < acolumns; x++) {
          // multiply & accumulate
          sum = af(sum, mf(row[x], bdata[x][j]))
        }
        c[i][j] = sum
      }
    }

    // return matrix
    return a.createDenseMatrix({
      data: c,
      size: [arows, bcolumns],
      datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
    })
  }

  /**
   * C = A * B
   *
   * @param a - DenseMatrix (MxN)
   * @param b - SparseMatrix (NxC)
   * @returns SparseMatrix (MxC)
   */
  function _multiplyDenseMatrixSparseMatrix(a: DenseMatrix, b: SparseMatrix): SparseMatrix {
    // a dense
    const adata = a._data as any[][]
    const asize = a._size
    const adt = a._datatype || a.getDataType()
    // b sparse
    const bvalues = b._values
    const bindex = b._index
    const bptr = b._ptr
    const bsize = b._size
    const bdt = b._datatype || b._data === undefined ? b._datatype : b.getDataType()
    // validate b matrix
    if (!bvalues) { throw new Error('Cannot multiply Dense Matrix times Pattern only Matrix') }
    // rows & columns
    const arows = asize[0]
    const bcolumns = bsize[1]

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar
    // equalScalar signature to use
    let eq: TypedFunction = equalScalar
    // zero value
    let zero: any = 0

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
      eq = typed.find(equalScalar, [dt, dt])
      // convert 0 to the same datatype
      zero = typed.convert(0, dt)
    }

    // result
    const cvalues: any[] = []
    const cindex: number[] = []
    const cptr: number[] = []
    // c matrix
    const c = b.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
    })

    // loop b columns
    for (let jb = 0; jb < bcolumns; jb++) {
      // update ptr
      cptr[jb] = cindex.length
      // indeces in column jb
      const kb0 = bptr![jb]
      const kb1 = bptr![jb + 1]
      // do not process column jb if no data exists
      if (kb1 > kb0) {
        // last row mark processed
        let last = 0
        // loop a rows
        for (let i = 0; i < arows; i++) {
          // column mark
          const mark = i + 1
          // C[i, jb]
          let cij: any
          // values in b column j
          for (let kb = kb0; kb < kb1; kb++) {
            // row
            const ib = bindex![kb]
            // check value has been initialized
            if (last !== mark) {
              // first value in column jb
              cij = mf(adata[i][ib], bvalues[kb])
              // update mark
              last = mark
            } else {
              // accumulate value
              cij = af(cij, mf(adata[i][ib], bvalues[kb]))
            }
          }
          // check column has been processed and value != 0
          if (last === mark && !eq(cij, zero)) {
            // push row & value
            cindex.push(i)
            cvalues.push(cij)
          }
        }
      }
    }
    // update ptr
    cptr[bcolumns] = cindex.length

    // return sparse matrix
    return c
  }

  /**
   * C = A * B
   *
   * @param a - SparseMatrix (MxN)
   * @param b - Dense Vector (N)
   * @returns SparseMatrix (M, 1)
   */
  function _multiplySparseMatrixVector(a: SparseMatrix, b: Matrix): SparseMatrix {
    // a sparse
    const avalues = a._values
    const aindex = a._index
    const aptr = a._ptr
    const adt = a._datatype || a._data === undefined ? a._datatype : a.getDataType()
    // validate a matrix
    if (!avalues) { throw new Error('Cannot multiply Pattern only Matrix times Dense Matrix') }
    // b dense
    const bdata = (b as DenseMatrix)._data as any[]
    const bdt = (b as DenseMatrix)._datatype || b.getDataType()
    // rows & columns
    const arows = a._size[0]
    const brows = (b as DenseMatrix)._size[0]
    // result
    const cvalues: any[] = []
    const cindex: number[] = []
    const cptr: number[] = []

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar
    // equalScalar signature to use
    let eq: TypedFunction = equalScalar
    // zero value
    let zero: any = 0

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
      eq = typed.find(equalScalar, [dt, dt])
      // convert 0 to the same datatype
      zero = typed.convert(0, dt)
    }

    // workspace
    const x: any[] = []
    // vector with marks indicating a value x[i] exists in a given column
    const w: boolean[] = []

    // update ptr
    cptr[0] = 0
    // rows in b
    for (let ib = 0; ib < brows; ib++) {
      // b[ib]
      const vbi = bdata[ib]
      // check b[ib] != 0, avoid loops
      if (!eq(vbi, zero)) {
        // A values & index in ib column
        for (let ka0 = aptr![ib], ka1 = aptr![ib + 1], ka = ka0; ka < ka1; ka++) {
          // a row
          const ia = aindex![ka]
          // check value exists in current j
          if (!w[ia]) {
            // ia is new entry in j
            w[ia] = true
            // add i to pattern of C
            cindex.push(ia)
            // x(ia) = A
            x[ia] = mf(vbi, avalues[ka])
          } else {
            // i exists in C already
            x[ia] = af(x[ia], mf(vbi, avalues[ka]))
          }
        }
      }
    }
    // copy values from x to column jb of c
    for (let p1 = cindex.length, p = 0; p < p1; p++) {
      // row
      const ic = cindex[p]
      // copy value
      cvalues[p] = x[ic]
    }
    // update ptr
    cptr[1] = cindex.length

    // matrix to return
    return a.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, 1],
      datatype: adt === a._datatype && bdt === (b as DenseMatrix)._datatype ? dt : undefined
    })
  }

  /**
   * C = A * B
   *
   * @param a - SparseMatrix (MxN)
   * @param b - DenseMatrix (NxC)
   * @returns SparseMatrix (MxC)
   */
  function _multiplySparseMatrixDenseMatrix(a: SparseMatrix, b: DenseMatrix): SparseMatrix {
    // a sparse
    const avalues = a._values
    const aindex = a._index
    const aptr = a._ptr
    const adt = a._datatype || a._data === undefined ? a._datatype : a.getDataType()
    // validate a matrix
    if (!avalues) { throw new Error('Cannot multiply Pattern only Matrix times Dense Matrix') }
    // b dense
    const bdata = b._data as any[][]
    const bdt = b._datatype || b.getDataType()
    // rows & columns
    const arows = a._size[0]
    const brows = b._size[0]
    const bcolumns = b._size[1]

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar
    // equalScalar signature to use
    let eq: TypedFunction = equalScalar
    // zero value
    let zero: any = 0

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
      eq = typed.find(equalScalar, [dt, dt])
      // convert 0 to the same datatype
      zero = typed.convert(0, dt)
    }

    // result
    const cvalues: any[] = []
    const cindex: number[] = []
    const cptr: number[] = []
    // c matrix
    const c = a.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
    })

    // workspace
    const x: any[] = []
    // vector with marks indicating a value x[i] exists in a given column
    const w: number[] = []

    // loop b columns
    for (let jb = 0; jb < bcolumns; jb++) {
      // update ptr
      cptr[jb] = cindex.length
      // mark in workspace for current column
      const mark = jb + 1
      // rows in jb
      for (let ib = 0; ib < brows; ib++) {
        // b[ib, jb]
        const vbij = bdata[ib][jb]
        // check b[ib, jb] != 0, avoid loops
        if (!eq(vbij, zero)) {
          // A values & index in ib column
          for (let ka0 = aptr![ib], ka1 = aptr![ib + 1], ka = ka0; ka < ka1; ka++) {
            // a row
            const ia = aindex![ka]
            // check value exists in current j
            if (w[ia] !== mark) {
              // ia is new entry in j
              w[ia] = mark
              // add i to pattern of C
              cindex.push(ia)
              // x(ia) = A
              x[ia] = mf(vbij, avalues[ka])
            } else {
              // i exists in C already
              x[ia] = af(x[ia], mf(vbij, avalues[ka]))
            }
          }
        }
      }
      // copy values from x to column jb of c
      for (let p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
        // row
        const ic = cindex[p]
        // copy value
        cvalues[p] = x[ic]
      }
    }
    // update ptr
    cptr[bcolumns] = cindex.length

    // return sparse matrix
    return c
  }

  /**
   * C = A * B
   *
   * @param a - SparseMatrix (MxN)
   * @param b - SparseMatrix (NxC)
   * @returns SparseMatrix (MxC)
   */
  function _multiplySparseMatrixSparseMatrix(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
    // a sparse
    const avalues = a._values
    const aindex = a._index
    const aptr = a._ptr
    const adt = a._datatype || a._data === undefined ? a._datatype : a.getDataType()
    // b sparse
    const bvalues = b._values
    const bindex = b._index
    const bptr = b._ptr
    const bdt = b._datatype || b._data === undefined ? b._datatype : b.getDataType()

    // rows & columns
    const arows = a._size[0]
    const bcolumns = b._size[1]
    // flag indicating both matrices (a & b) contain data
    const values = avalues && bvalues

    // datatype
    let dt: string | undefined
    // addScalar signature to use
    let af: TypedFunction = addScalar
    // multiplyScalar signature to use
    let mf: TypedFunction = multiplyScalar

    // process data types
    if (adt && bdt && adt === bdt && typeof adt === 'string' && adt !== 'mixed') {
      // datatype
      dt = adt
      // find signatures that matches (dt, dt)
      af = typed.find(addScalar, [dt, dt])
      mf = typed.find(multiplyScalar, [dt, dt])
    }

    // result
    const cvalues: any[] | undefined = values ? [] : undefined
    const cindex: number[] = []
    const cptr: number[] = []
    // c matrix
    const c = a.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
    })

    // workspace
    const x: any[] | undefined = values ? [] : undefined
    // vector with marks indicating a value x[i] exists in a given column
    const w: number[] = []
    // variables
    let ka: number, ka0: number, ka1: number, kb: number, kb0: number, kb1: number, ia: number, ib: number
    // loop b columns
    for (let jb = 0; jb < bcolumns; jb++) {
      // update ptr
      cptr[jb] = cindex.length
      // mark in workspace for current column
      const mark = jb + 1
      // B values & index in j
      for (kb0 = bptr![jb], kb1 = bptr![jb + 1], kb = kb0; kb < kb1; kb++) {
        // b row
        ib = bindex![kb]
        // check we need to process values
        if (values) {
          // loop values in a[:,ib]
          for (ka0 = aptr![ib], ka1 = aptr![ib + 1], ka = ka0; ka < ka1; ka++) {
            // row
            ia = aindex![ka]
            // check value exists in current j
            if (w[ia] !== mark) {
              // ia is new entry in j
              w[ia] = mark
              // add i to pattern of C
              cindex.push(ia)
              // x(ia) = A
              x![ia] = mf(bvalues![kb], avalues![ka])
            } else {
              // i exists in C already
              x![ia] = af(x![ia], mf(bvalues![kb], avalues![ka]))
            }
          }
        } else {
          // loop values in a[:,ib]
          for (ka0 = aptr![ib], ka1 = aptr![ib + 1], ka = ka0; ka < ka1; ka++) {
            // row
            ia = aindex![ka]
            // check value exists in current j
            if (w[ia] !== mark) {
              // ia is new entry in j
              w[ia] = mark
              // add i to pattern of C
              cindex.push(ia)
            }
          }
        }
      }
      // check we need to process matrix values (pattern matrix)
      if (values) {
        // copy values from x to column jb of c
        for (let p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
          // row
          const ic = cindex[p]
          // copy value
          cvalues![p] = x![ic]
        }
      }
    }
    // update ptr
    cptr[bcolumns] = cindex.length

    // return sparse matrix
    return c
  }

  /**
   * Multiply two or more values, `x * y`.
   * For matrices, the matrix product is calculated.
   *
   * Syntax:
   *
   *    math.multiply(x, y)
   *    math.multiply(x, y, z, ...)
   *
   * Examples:
   *
   *    math.multiply(4, 5.2)        // returns number 20.8
   *    math.multiply(2, 3, 4)       // returns number 24
   *
   *    const a = math.complex(2, 3)
   *    const b = math.complex(4, 1)
   *    math.multiply(a, b)          // returns Complex 5 + 14i
   *
   *    const c = [[1, 2], [4, 3]]
   *    const d = [[1, 2, 3], [3, -4, 7]]
   *    math.multiply(c, d)          // returns Array [[7, -6, 17], [13, -4, 33]]
   *
   *    const e = math.unit('2.1 km')
   *    math.multiply(3, e)          // returns Unit 6.3 km
   *
   * See also:
   *
   *    divide, prod, cross, dot
   *
   * @param x - First value to multiply
   * @param y - Second value to multiply
   * @returns Multiplication of `x` and `y`
   */
  return typed(name, multiplyScalar, {
    // we extend the signatures of multiplyScalar with signatures dealing with matrices

    'Array, Array': typed.referTo('Matrix, Matrix', ((selfMM: TypedFunction) => (x: any[], y: any[]) => {
      // check dimensions
      _validateMatrixDimensions(arraySize(x), arraySize(y))

      // use dense matrix implementation
      const m = selfMM(matrix(x), matrix(y))
      // return array or scalar
      return isMatrix(m) ? m.valueOf() : m
    }) as any),

    'Matrix, Matrix': function (x: Matrix, y: Matrix): Matrix | any {
      // dimensions
      const xsize = x.size()
      const ysize = y.size()

      // check dimensions
      _validateMatrixDimensions(xsize, ysize)

      // process dimensions
      if (xsize.length === 1) {
        // process y dimensions
        if (ysize.length === 1) {
          // Vector * Vector
          return _multiplyVectorVector(x, y, xsize[0])
        }
        // Vector * Matrix
        return _multiplyVectorMatrix(x, y)
      }
      // process y dimensions
      if (ysize.length === 1) {
        // Matrix * Vector
        return _multiplyMatrixVector(x, y)
      }
      // Matrix * Matrix
      return _multiplyMatrixMatrix(x, y)
    },

    'Matrix, Array': typed.referTo('Matrix,Matrix', ((selfMM: TypedFunction) =>
      (x: Matrix, y: any[]) => selfMM(x, matrix(y))) as any),

    'Array, Matrix': typed.referToSelf((self: TypedFunction): any => (x: any[], y: Matrix) => {
      // use Matrix * Matrix implementation
      return self(matrix(x, y.storage()), y)
    }),

    'SparseMatrix, any': function (x: SparseMatrix, y: any): SparseMatrix {
      return matAlgo11xS0s(x as any, y, multiplyScalar, false) as SparseMatrix
    },

    'DenseMatrix, any': function (x: DenseMatrix, y: any): DenseMatrix {
      return matAlgo14xDs(x as any, y, multiplyScalar, false) as DenseMatrix
    },

    'any, SparseMatrix': function (x: any, y: SparseMatrix): SparseMatrix {
      return matAlgo11xS0s(y as any, x, multiplyScalar, true) as SparseMatrix
    },

    'any, DenseMatrix': function (x: any, y: DenseMatrix): DenseMatrix {
      return matAlgo14xDs(y as any, x, multiplyScalar, true) as DenseMatrix
    },

    'Array, any': function (x: any[], y: any): any[] {
      // use matrix implementation
      return matAlgo14xDs(matrix(x) as any, y, multiplyScalar, false).valueOf() as any[]
    },

    'any, Array': function (x: any, y: any[]): any[] {
      // use matrix implementation
      return matAlgo14xDs(matrix(y) as any, x, multiplyScalar, true).valueOf() as any[]
    },

    'any, any': multiplyScalar,

    'any, any, ...any': typed.referToSelf((self: TypedFunction): any => (x: any, y: any, rest: any[]) => {
      let result = self(x, y)

      for (let i = 0; i < rest.length; i++) {
        result = self(result, rest[i])
      }

      return result
    })
  })
})
