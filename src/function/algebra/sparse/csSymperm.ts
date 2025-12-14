// Copyright (c) 2006-2024, Timothy A. Davis, All Rights Reserved.
// SPDX-License-Identifier: LGPL-2.1+
// https://github.com/DrTimothyAldenDavis/SuiteSparse/tree/dev/CSparse/Source
import { csCumsum } from './csCumsum.ts'
import { factory } from '../../../utils/factory.ts'

const name = 'csSymperm'
const dependencies = ['conj', 'SparseMatrix'] as const

export const createCsSymperm = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
  ({ conj, SparseMatrix }: { conj: any; SparseMatrix: any }) => {
    /**
     * Computes the symmetric permutation of matrix A accessing only
     * the upper triangular part of A.
     *
     * C = P * A * P'
     *
     * @param {Matrix}  a               The A matrix
     * @param {Array}   pinv            The inverse of permutation vector
     * @param {boolean} values          Process matrix values (true)
     *
     * @return {Matrix}                 The C matrix, C = P * A * P'
     */
    return function csSymperm(
      a: any,
      pinv: number[] | null,
      values: boolean
    ): any {
      // A matrix arrays
      const avalues = a._values
      const aindex = a._index
      const aptr = a._ptr
      const asize = a._size
      // columns
      const n = asize[1]
      // C matrix arrays
      const cvalues: any[] | null = values && avalues ? [] : null
      const cindex: number[] = [] // (nz)
      const cptr: number[] = [] // (n + 1)
      // variables
      let i: number,
        i2: number,
        j: number,
        j2: number,
        p: number,
        p0: number,
        p1: number
      // create workspace vector
      const w: number[] = [] // (n)
      // count entries in each column of C
      for (j = 0; j < n; j++) {
        // column j of A is column j2 of C
        j2 = pinv ? pinv[j] : j
        // loop values in column j
        for (p0 = aptr[j], p1 = aptr[j + 1], p = p0; p < p1; p++) {
          // row
          i = aindex[p]
          // skip lower triangular part of A
          if (i > j) {
            continue
          }
          // row i of A is row i2 of C
          i2 = pinv ? pinv[i] : i
          // column count of C
          w[Math.max(i2, j2)]++
        }
      }
      // compute column pointers of C
      csCumsum(cptr, w, n)
      // loop columns
      for (j = 0; j < n; j++) {
        // column j of A is column j2 of C
        j2 = pinv ? pinv[j] : j
        // loop values in column j
        for (p0 = aptr[j], p1 = aptr[j + 1], p = p0; p < p1; p++) {
          // row
          i = aindex[p]
          // skip lower triangular part of A
          if (i > j) {
            continue
          }
          // row i of A is row i2 of C
          i2 = pinv ? pinv[i] : i
          // C index for column j2
          const q = w[Math.max(i2, j2)]++
          // update C index for entry q
          cindex[q] = Math.min(i2, j2)
          // check we need to process values
          if (cvalues) {
            cvalues[q] = i2 <= j2 ? avalues[p] : conj(avalues[p])
          }
        }
      }
      // return C matrix
      return new SparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [n, n]
      })
    }
  }
)
