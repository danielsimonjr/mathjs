// Copyright (c) 2006-2024, Timothy A. Davis, All Rights Reserved.
// SPDX-License-Identifier: LGPL-2.1+
// https://github.com/DrTimothyAldenDavis/SuiteSparse/tree/dev/CSparse/Source

import { csFlip } from './csFlip.ts'

/**
 * Marks the node at w[j]
 *
 * @param {Array}   w               The array
 * @param {Number}  j               The array index
 */
export function csMark(w: number[], j: number): void {
  // mark w[j]
  w[j] = csFlip(w[j])
}
