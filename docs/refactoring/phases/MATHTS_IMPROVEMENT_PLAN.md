# MathTS Algorithm Improvement Plan

## Extracted from Array.Math with TypeScript/WASM/WebWorker Architecture

**Source Reference**: `github.com/danielsimonjr/Array.Math`  
**Target**: `@mathts/functions`, `@mathts/matrix`  
**Date**: December 2025

-----

## Overview

This document extracts algorithmic patterns from Array.Math and provides implementation blueprints for:

1. **TypeScript** — Clean, typed reference implementation
1. **AssemblyScript** — WASM-compiled for performance
1. **WebWorker** — Parallel execution for large datasets

Each algorithm includes:

- Mathematical foundation
- Pseudocode
- TypeScript implementation
- AssemblyScript WASM version
- Worker pooling strategy

-----

## Part 1: Statistical Functions

### 1.1 Sum

**Mathematical Definition**:
$$\sum_{i=0}^{n-1} x_i$$

**Pseudocode**:

```
FUNCTION sum(arr, start=0, length=arr.length):
    total ← 0
    FOR i FROM start TO start+length-1:
        total ← total + arr[i]
    RETURN total
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/statistics/sum.ts

export function sum(arr: number[]): number;
export function sum(arr: number[], start: number, length: number): number;
export function sum(arr: number[], start = 0, length?: number): number {
  const end = start + (length ?? arr.length - start);
  let total = 0;
  for (let i = start; i < end; i++) {
    total += arr[i];
  }
  return total;
}

// Typed function registration
export const sumTyped = typed('sum', {
  'Array': (arr: number[]) => sum(arr),
  'Array, number, number': (arr: number[], start: number, len: number) => sum(arr, start, len),
  'Matrix': (m: Matrix) => sum(m.toArray().flat()),
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/statistics/sum.ts

// Simple sum - no SIMD
export function sum(ptr: usize, length: i32): f64 {
  let total: f64 = 0;
  for (let i: i32 = 0; i < length; i++) {
    total += load<f64>(ptr + (i << 3)); // i * 8 bytes for f64
  }
  return total;
}

// SIMD-accelerated sum (4 f64 values at once)
export function sum_simd(ptr: usize, length: i32): f64 {
  let total = f64x2.splat(0);
  let total2 = f64x2.splat(0);
  
  const simdLength = length & ~3; // Round down to multiple of 4
  
  // Process 4 elements at a time (2 SIMD registers × 2 f64 each)
  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset = ptr + (i << 3);
    total = f64x2.add(total, v128.load(offset));
    total2 = f64x2.add(total2, v128.load(offset + 16));
  }
  
  // Combine SIMD lanes
  let result = f64x2.extract_lane(total, 0) + f64x2.extract_lane(total, 1)
             + f64x2.extract_lane(total2, 0) + f64x2.extract_lane(total2, 1);
  
  // Handle remaining elements
  for (let i = simdLength; i < length; i++) {
    result += load<f64>(ptr + (i << 3));
  }
  
  return result;
}
```

**WebWorker Strategy**:

```typescript
// packages/parallel/src/workers/statistics.worker.ts

import { worker } from '@mathts/workerpool';

function sumChunk(buffer: ArrayBuffer, start: number, length: number): number {
  const arr = new Float64Array(buffer);
  let total = 0;
  const end = start + length;
  for (let i = start; i < end; i++) {
    total += arr[i];
  }
  return total;
}

worker({ sumChunk });

// packages/parallel/src/operations/sum.ts

export async function parallelSum(arr: Float64Array, pool: ComputePool): Promise<number> {
  const CHUNK_SIZE = 100000;
  const chunks: Promise<number>[] = [];
  
  for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
    const length = Math.min(CHUNK_SIZE, arr.length - i);
    chunks.push(
      pool.exec('sumChunk', [arr.buffer, i, length], {
        transfer: [] // Don't transfer, we need arr for all chunks
      })
    );
  }
  
  const partialSums = await Promise.all(chunks);
  return partialSums.reduce((a, b) => a + b, 0);
}
```

**Threshold Strategy**:

```typescript
export async function smartSum(arr: Float64Array, backends: BackendManager, pool: ComputePool): Promise<number> {
  const n = arr.length;
  
  if (n < 1000) {
    // Pure JS for small arrays
    return sum(Array.from(arr));
  } else if (n < 100000) {
    // WASM SIMD for medium arrays
    return backends.wasm!.sum(arr);
  } else {
    // Parallel workers for large arrays
    return parallelSum(arr, pool);
  }
}
```

-----

### 1.2 Product (Element-wise)

**Mathematical Definition**:
$$c_i = a_i \times b_i$$ (element-wise)
$$c_i = a_i \times k$$ (scalar)

**Pseudocode**:

```
FUNCTION product(arr, multiplier):
    IF multiplier IS array:
        result ← new Array(arr.length)
        FOR i FROM 0 TO arr.length-1:
            result[i] ← arr[i] × multiplier[i]
    ELSE:
        result ← new Array(arr.length)
        FOR i FROM 0 TO arr.length-1:
            result[i] ← arr[i] × multiplier
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/arithmetic/product.ts

export function elementwiseProduct(a: number[], b: number[]): number[] {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
  }
  const result = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] * b[i];
  }
  return result;
}

export function scalarProduct(arr: number[], scalar: number): number[] {
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[i] * scalar;
  }
  return result;
}

export const productTyped = typed('product', {
  'Array, Array': elementwiseProduct,
  'Array, number': scalarProduct,
  'Matrix, Matrix': (a: Matrix, b: Matrix) => a.multiply(b),
  'Matrix, number': (m: Matrix, s: number) => m.scale(s),
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/arithmetic/elementwise.ts

// Element-wise multiplication
export function multiply_arrays(
  aPtr: usize, 
  bPtr: usize, 
  outPtr: usize, 
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 3;
    const a = load<f64>(aPtr + offset);
    const b = load<f64>(bPtr + offset);
    store<f64>(outPtr + offset, a * b);
  }
}

// SIMD version
export function multiply_arrays_simd(
  aPtr: usize, 
  bPtr: usize, 
  outPtr: usize, 
  length: i32
): void {
  const simdLength = length & ~1; // Round to multiple of 2 (f64x2)
  
  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset = i << 3;
    const a = v128.load(aPtr + offset);
    const b = v128.load(bPtr + offset);
    v128.store(outPtr + offset, f64x2.mul(a, b));
  }
  
  // Handle remaining
  for (let i = simdLength; i < length; i++) {
    const offset = i << 3;
    store<f64>(outPtr + offset, load<f64>(aPtr + offset) * load<f64>(bPtr + offset));
  }
}

// Scalar multiplication
export function multiply_scalar(
  arrPtr: usize, 
  scalar: f64, 
  outPtr: usize, 
  length: i32
): void {
  const scalarVec = f64x2.splat(scalar);
  const simdLength = length & ~1;
  
  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset = i << 3;
    const a = v128.load(arrPtr + offset);
    v128.store(outPtr + offset, f64x2.mul(a, scalarVec));
  }
  
  for (let i = simdLength; i < length; i++) {
    const offset = i << 3;
    store<f64>(outPtr + offset, load<f64>(arrPtr + offset) * scalar);
  }
}
```

**WebWorker Strategy**:

```typescript
// packages/parallel/src/workers/arithmetic.worker.ts

function multiplyChunk(
  aBuffer: ArrayBuffer, 
  bBuffer: ArrayBuffer, 
  start: number, 
  length: number
): ArrayBuffer {
  const a = new Float64Array(aBuffer);
  const b = new Float64Array(bBuffer);
  const result = new Float64Array(length);
  
  for (let i = 0; i < length; i++) {
    result[i] = a[start + i] * b[start + i];
  }
  
  return result.buffer;
}

worker({ multiplyChunk });
```

-----

### 1.3 Variance & Standard Deviation

**Mathematical Definition**:
$$\sigma^2 = \frac{1}{n}\sum_{i=0}^{n-1}(x_i - \bar{x})^2$$
$$\sigma = \sqrt{\sigma^2}$$

**Pseudocode** (Two-pass algorithm for numerical stability):

```
FUNCTION variance(arr):
    n ← arr.length
    mean ← sum(arr) / n
    
    sumSquaredDiff ← 0
    FOR i FROM 0 TO n-1:
        diff ← arr[i] - mean
        sumSquaredDiff ← sumSquaredDiff + (diff × diff)
    
    RETURN sumSquaredDiff / n

FUNCTION stdDeviation(arr):
    RETURN sqrt(variance(arr))
```

**Pseudocode** (Welford’s online algorithm - single pass, better numerical stability):

```
FUNCTION variance_welford(arr):
    n ← 0
    mean ← 0
    M2 ← 0
    
    FOR x IN arr:
        n ← n + 1
        delta ← x - mean
        mean ← mean + delta / n
        delta2 ← x - mean
        M2 ← M2 + delta × delta2
    
    RETURN M2 / n
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/statistics/variance.ts

// Two-pass (simple, matches Array.Math)
export function varianceTwoPass(arr: number[]): number {
  const n = arr.length;
  if (n === 0) return NaN;
  if (n === 1) return 0;
  
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  let sumSquaredDiff = 0;
  
  for (let i = 0; i < n; i++) {
    const diff = arr[i] - mean;
    sumSquaredDiff += diff * diff;
  }
  
  return sumSquaredDiff / n;
}

// Welford's algorithm (numerically stable, single pass)
export function varianceWelford(arr: number[]): number {
  const n = arr.length;
  if (n === 0) return NaN;
  if (n === 1) return 0;
  
  let mean = 0;
  let m2 = 0;
  
  for (let i = 0; i < n; i++) {
    const delta = arr[i] - mean;
    mean += delta / (i + 1);
    const delta2 = arr[i] - mean;
    m2 += delta * delta2;
  }
  
  return m2 / n;
}

// Population vs Sample variance
export function variance(arr: number[], population = true): number {
  const n = arr.length;
  if (n === 0) return NaN;
  if (n === 1) return 0;
  
  const v = varianceWelford(arr);
  return population ? v : (v * n) / (n - 1);
}

export function stdDeviation(arr: number[], population = true): number {
  return Math.sqrt(variance(arr, population));
}

export const varianceTyped = typed('variance', {
  'Array': (arr: number[]) => variance(arr),
  'Array, boolean': variance,
  'Matrix': (m: Matrix) => variance(m.toArray().flat()),
});

export const stdTyped = typed('std', {
  'Array': (arr: number[]) => stdDeviation(arr),
  'Array, boolean': stdDeviation,
  'Matrix': (m: Matrix) => stdDeviation(m.toArray().flat()),
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/statistics/variance.ts

// Two-pass variance
export function variance_two_pass(ptr: usize, length: i32): f64 {
  if (length == 0) return f64.NaN;
  if (length == 1) return 0;
  
  // First pass: compute mean
  let sum: f64 = 0;
  for (let i: i32 = 0; i < length; i++) {
    sum += load<f64>(ptr + (i << 3));
  }
  const mean = sum / <f64>length;
  
  // Second pass: compute variance
  let sumSquaredDiff: f64 = 0;
  for (let i: i32 = 0; i < length; i++) {
    const diff = load<f64>(ptr + (i << 3)) - mean;
    sumSquaredDiff += diff * diff;
  }
  
  return sumSquaredDiff / <f64>length;
}

// Welford's algorithm (single pass, numerically stable)
export function variance_welford(ptr: usize, length: i32): f64 {
  if (length == 0) return f64.NaN;
  if (length == 1) return 0;
  
  let mean: f64 = 0;
  let m2: f64 = 0;
  
  for (let i: i32 = 0; i < length; i++) {
    const x = load<f64>(ptr + (i << 3));
    const n = <f64>(i + 1);
    const delta = x - mean;
    mean += delta / n;
    const delta2 = x - mean;
    m2 += delta * delta2;
  }
  
  return m2 / <f64>length;
}

export function std_deviation(ptr: usize, length: i32): f64 {
  return Math.sqrt(variance_welford(ptr, length));
}
```

**WebWorker Strategy** (Parallel Welford):

```typescript
// packages/parallel/src/operations/variance.ts

interface PartialVariance {
  count: number;
  mean: number;
  m2: number;
}

// Worker computes partial statistics for a chunk
function varianceChunk(buffer: ArrayBuffer, start: number, length: number): PartialVariance {
  const arr = new Float64Array(buffer);
  
  let mean = 0;
  let m2 = 0;
  
  for (let i = 0; i < length; i++) {
    const x = arr[start + i];
    const n = i + 1;
    const delta = x - mean;
    mean += delta / n;
    const delta2 = x - mean;
    m2 += delta * delta2;
  }
  
  return { count: length, mean, m2 };
}

// Combine partial results (Chan's parallel algorithm)
function combineVariance(a: PartialVariance, b: PartialVariance): PartialVariance {
  const count = a.count + b.count;
  const delta = b.mean - a.mean;
  const mean = a.mean + delta * (b.count / count);
  const m2 = a.m2 + b.m2 + delta * delta * (a.count * b.count / count);
  
  return { count, mean, m2 };
}

export async function parallelVariance(arr: Float64Array, pool: ComputePool): Promise<number> {
  const CHUNK_SIZE = 50000;
  const chunks: Promise<PartialVariance>[] = [];
  
  for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
    const length = Math.min(CHUNK_SIZE, arr.length - i);
    chunks.push(pool.exec('varianceChunk', [arr.buffer, i, length]));
  }
  
  const partials = await Promise.all(chunks);
  const combined = partials.reduce(combineVariance);
  
  return combined.m2 / combined.count;
}
```

-----

### 1.4 Median

**Mathematical Definition**:

- For odd n: middle element of sorted array
- For even n: average of two middle elements

**Pseudocode**:

```
FUNCTION median(arr):
    sorted ← sort(arr)
    n ← sorted.length
    middle ← (n + 1) / 2
    
    IF n IS odd:
        RETURN sorted[floor(middle) - 1]
    ELSE:
        RETURN (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2
```

**Pseudocode** (Quickselect - O(n) average without full sort):

```
FUNCTION median_quickselect(arr):
    n ← arr.length
    
    IF n IS odd:
        RETURN quickselect(arr, n / 2)
    ELSE:
        left ← quickselect(arr, n / 2 - 1)
        right ← quickselect(arr, n / 2)
        RETURN (left + right) / 2

FUNCTION quickselect(arr, k):
    IF arr.length = 1:
        RETURN arr[0]
    
    pivot ← arr[random(0, arr.length)]
    left ← [x FOR x IN arr IF x < pivot]
    equal ← [x FOR x IN arr IF x = pivot]
    right ← [x FOR x IN arr IF x > pivot]
    
    IF k < left.length:
        RETURN quickselect(left, k)
    ELSE IF k < left.length + equal.length:
        RETURN pivot
    ELSE:
        RETURN quickselect(right, k - left.length - equal.length)
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/statistics/median.ts

// Simple sort-based (matches Array.Math)
export function medianSort(arr: number[]): number {
  if (arr.length === 0) return NaN;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const middle = Math.floor(n / 2);
  
  if (n % 2 === 1) {
    return sorted[middle];
  } else {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
}

// Quickselect (O(n) average, no full sort)
export function quickselect(arr: number[], k: number): number {
  if (arr.length === 1) return arr[0];
  
  const pivot = arr[Math.floor(Math.random() * arr.length)];
  const left: number[] = [];
  const equal: number[] = [];
  const right: number[] = [];
  
  for (const x of arr) {
    if (x < pivot) left.push(x);
    else if (x > pivot) right.push(x);
    else equal.push(x);
  }
  
  if (k < left.length) {
    return quickselect(left, k);
  } else if (k < left.length + equal.length) {
    return pivot;
  } else {
    return quickselect(right, k - left.length - equal.length);
  }
}

export function medianQuickselect(arr: number[]): number {
  if (arr.length === 0) return NaN;
  
  const n = arr.length;
  const copy = [...arr]; // Don't mutate original
  
  if (n % 2 === 1) {
    return quickselect(copy, Math.floor(n / 2));
  } else {
    // Need both middle elements
    const left = quickselect(copy, Math.floor(n / 2) - 1);
    const right = quickselect(copy, Math.floor(n / 2));
    return (left + right) / 2;
  }
}

// Alias for default
export const median = medianQuickselect;

export const medianTyped = typed('median', {
  'Array': median,
  'Matrix': (m: Matrix) => median(m.toArray().flat()),
});
```

**AssemblyScript WASM** (In-place partition for memory efficiency):

```typescript
// packages/functions/assembly/statistics/median.ts

// Partition helper for quickselect
function partition(ptr: usize, left: i32, right: i32): i32 {
  const pivotIdx = left + <i32>(Math.random() * <f64>(right - left + 1));
  const pivot = load<f64>(ptr + (pivotIdx << 3));
  
  // Move pivot to end
  swap(ptr, pivotIdx, right);
  
  let storeIdx = left;
  for (let i = left; i < right; i++) {
    if (load<f64>(ptr + (i << 3)) < pivot) {
      swap(ptr, i, storeIdx);
      storeIdx++;
    }
  }
  
  swap(ptr, storeIdx, right);
  return storeIdx;
}

function swap(ptr: usize, i: i32, j: i32): void {
  const offsetI = ptr + (i << 3);
  const offsetJ = ptr + (j << 3);
  const temp = load<f64>(offsetI);
  store<f64>(offsetI, load<f64>(offsetJ));
  store<f64>(offsetJ, temp);
}

// Quickselect - find k-th smallest element
export function quickselect(ptr: usize, length: i32, k: i32): f64 {
  let left: i32 = 0;
  let right: i32 = length - 1;
  
  while (left < right) {
    const pivotIdx = partition(ptr, left, right);
    
    if (k == pivotIdx) {
      return load<f64>(ptr + (k << 3));
    } else if (k < pivotIdx) {
      right = pivotIdx - 1;
    } else {
      left = pivotIdx + 1;
    }
  }
  
  return load<f64>(ptr + (left << 3));
}

export function median(ptr: usize, length: i32): f64 {
  if (length == 0) return f64.NaN;
  
  const mid = length >> 1;
  
  if (length & 1) {
    // Odd length
    return quickselect(ptr, length, mid);
  } else {
    // Even length - need both middle elements
    const left = quickselect(ptr, length, mid - 1);
    const right = quickselect(ptr, length, mid);
    return (left + right) * 0.5;
  }
}
```

-----

## Part 2: Vector Operations

### 2.1 Dot Product

**Mathematical Definition**:
$$\vec{a} \cdot \vec{b} = \sum_{i=0}^{n-1} a_i b_i = |\vec{a}||\vec{b}|\cos\theta$$

**Pseudocode**:

```
FUNCTION dot(a, b):
    IF a.length ≠ b.length:
        ERROR "Dimension mismatch"
    
    result ← 0
    FOR i FROM 0 TO a.length-1:
        result ← result + a[i] × b[i]
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/matrix/dot.ts

export function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

export const dotTyped = typed('dot', {
  'Array, Array': dot,
  'Matrix, Matrix': (a: Matrix, b: Matrix) => {
    // For 1D matrices (vectors), compute dot product
    const aFlat = a.toArray().flat();
    const bFlat = b.toArray().flat();
    return dot(aFlat, bFlat);
  },
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/vector/dot.ts

export function dot(aPtr: usize, bPtr: usize, length: i32): f64 {
  let result: f64 = 0;
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 3;
    result += load<f64>(aPtr + offset) * load<f64>(bPtr + offset);
  }
  return result;
}

// SIMD-accelerated dot product
export function dot_simd(aPtr: usize, bPtr: usize, length: i32): f64 {
  let sum1 = f64x2.splat(0);
  let sum2 = f64x2.splat(0);
  
  const simdLength = length & ~3; // Multiple of 4
  
  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset = i << 3;
    
    const a1 = v128.load(aPtr + offset);
    const b1 = v128.load(bPtr + offset);
    const a2 = v128.load(aPtr + offset + 16);
    const b2 = v128.load(bPtr + offset + 16);
    
    sum1 = f64x2.add(sum1, f64x2.mul(a1, b1));
    sum2 = f64x2.add(sum2, f64x2.mul(a2, b2));
  }
  
  // Combine SIMD results
  let result = f64x2.extract_lane(sum1, 0) + f64x2.extract_lane(sum1, 1)
             + f64x2.extract_lane(sum2, 0) + f64x2.extract_lane(sum2, 1);
  
  // Handle remaining elements
  for (let i = simdLength; i < length; i++) {
    const offset = i << 3;
    result += load<f64>(aPtr + offset) * load<f64>(bPtr + offset);
  }
  
  return result;
}
```

-----

### 2.2 Cross Product

**Mathematical Definition** (3D only):
$$\vec{a} \times \vec{b} = \begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \ a_1 & a_2 & a_3 \ b_1 & b_2 & b_3 \end{vmatrix}$$

$$= (a_2 b_3 - a_3 b_2)\vec{i} - (a_1 b_3 - a_3 b_1)\vec{j} + (a_1 b_2 - a_2 b_1)\vec{k}$$

**Pseudocode**:

```
FUNCTION cross(a, b):
    // Extend to 3D if needed
    a ← pad_to_3d(a)
    b ← pad_to_3d(b)
    
    RETURN [
        a[1] × b[2] - a[2] × b[1],
        a[2] × b[0] - a[0] × b[2],
        a[0] × b[1] - a[1] × b[0]
    ]
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/matrix/cross.ts

function padTo3D(v: number[]): [number, number, number] {
  return [
    v[0] ?? 0,
    v[1] ?? 0,
    v[2] ?? 0,
  ];
}

export function cross(a: number[], b: number[]): [number, number, number] {
  const [a0, a1, a2] = padTo3D(a);
  const [b0, b1, b2] = padTo3D(b);
  
  return [
    a1 * b2 - a2 * b1,
    a2 * b0 - a0 * b2,
    a0 * b1 - a1 * b0,
  ];
}

export const crossTyped = typed('cross', {
  'Array, Array': cross,
  'Matrix, Matrix': (a: Matrix, b: Matrix) => {
    const result = cross(a.toArray().flat(), b.toArray().flat());
    return Matrix.from([result]);
  },
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/vector/cross.ts

export function cross(
  aPtr: usize, 
  bPtr: usize, 
  outPtr: usize
): void {
  const a0 = load<f64>(aPtr);
  const a1 = load<f64>(aPtr + 8);
  const a2 = load<f64>(aPtr + 16);
  
  const b0 = load<f64>(bPtr);
  const b1 = load<f64>(bPtr + 8);
  const b2 = load<f64>(bPtr + 16);
  
  store<f64>(outPtr,      a1 * b2 - a2 * b1);
  store<f64>(outPtr + 8,  a2 * b0 - a0 * b2);
  store<f64>(outPtr + 16, a0 * b1 - a1 * b0);
}
```

-----

### 2.3 Vector Projection

**Mathematical Definition**:
$$\text{proj}_{\vec{b}}\vec{a} = \frac{\vec{a} \cdot \vec{b}}{\vec{b} \cdot \vec{b}} \vec{b}$$

**Pseudocode**:

```
FUNCTION projection(a, b):
    scalar ← dot(a, b) / dot(b, b)
    result ← new Array(b.length)
    FOR i FROM 0 TO b.length-1:
        result[i] ← b[i] × scalar
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/matrix/projection.ts

import { dot } from './dot';

export function projection(a: number[], b: number[]): number[] {
  const scalar = dot(a, b) / dot(b, b);
  return b.map(x => x * scalar);
}

export const projectionTyped = typed('projection', {
  'Array, Array': projection,
});
```

-----

### 2.4 Vector Normalize

**Mathematical Definition**:
$$\hat{v} = \frac{\vec{v}}{|\vec{v}|} = \frac{\vec{v}}{\sqrt{\vec{v} \cdot \vec{v}}}$$

**Pseudocode**:

```
FUNCTION normalize(v):
    length ← sqrt(dot(v, v))
    IF length = 0:
        ERROR "Cannot normalize zero vector"
    
    result ← new Array(v.length)
    FOR i FROM 0 TO v.length-1:
        result[i] ← v[i] / length
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/matrix/normalize.ts

import { dot } from './dot';

export function vectorLength(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

export function normalize(v: number[]): number[] {
  const len = vectorLength(v);
  if (len === 0) {
    throw new Error('Cannot normalize zero vector');
  }
  return v.map(x => x / len);
}

export const normalizeTyped = typed('normalize', {
  'Array': normalize,
  'Matrix': (m: Matrix) => {
    const flat = m.toArray().flat();
    return Matrix.from([normalize(flat)]);
  },
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/vector/normalize.ts

import { dot_simd } from './dot';

export function vector_length(ptr: usize, length: i32): f64 {
  return Math.sqrt(dot_simd(ptr, ptr, length));
}

export function normalize(ptr: usize, outPtr: usize, length: i32): void {
  const len = vector_length(ptr, length);
  
  if (len == 0) {
    // Zero vector - fill with zeros
    for (let i: i32 = 0; i < length; i++) {
      store<f64>(outPtr + (i << 3), 0);
    }
    return;
  }
  
  const invLen = 1.0 / len;
  
  // SIMD division
  const invLenVec = f64x2.splat(invLen);
  const simdLength = length & ~1;
  
  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset = i << 3;
    const v = v128.load(ptr + offset);
    v128.store(outPtr + offset, f64x2.mul(v, invLenVec));
  }
  
  for (let i = simdLength; i < length; i++) {
    const offset = i << 3;
    store<f64>(outPtr + offset, load<f64>(ptr + offset) * invLen);
  }
}
```

-----

## Part 3: Matrix Operations

### 3.1 Transpose

**Mathematical Definition**:
$$(A^T)*{ij} = A*{ji}$$

**Pseudocode**:

```
FUNCTION transpose(matrix):
    rows ← matrix.length
    cols ← matrix[0].length
    
    result ← new Matrix(cols, rows)
    FOR i FROM 0 TO rows-1:
        FOR j FROM 0 TO cols-1:
            result[j][i] ← matrix[i][j]
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/matrix/src/operations/transpose.ts

export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return [];
  
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  const result: T[][] = Array(cols);
  for (let j = 0; j < cols; j++) {
    result[j] = Array(rows);
    for (let i = 0; i < rows; i++) {
      result[j][i] = matrix[i][j];
    }
  }
  
  return result;
}

// For flat arrays (row-major to row-major transposed)
export function transposeFlatRow(
  data: Float64Array, 
  rows: number, 
  cols: number
): Float64Array {
  const result = new Float64Array(rows * cols);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = data[i * cols + j];
    }
  }
  
  return result;
}
```

**AssemblyScript WASM** (Cache-efficient blocked transpose):

```typescript
// packages/matrix/assembly/transpose.ts

const BLOCK_SIZE: i32 = 32; // Cache-friendly block size

// Naive transpose
export function transpose_naive(
  inPtr: usize, 
  outPtr: usize, 
  rows: i32, 
  cols: i32
): void {
  for (let i: i32 = 0; i < rows; i++) {
    for (let j: i32 = 0; j < cols; j++) {
      const srcIdx = i * cols + j;
      const dstIdx = j * rows + i;
      store<f64>(outPtr + (dstIdx << 3), load<f64>(inPtr + (srcIdx << 3)));
    }
  }
}

// Cache-blocked transpose for better performance on large matrices
export function transpose_blocked(
  inPtr: usize, 
  outPtr: usize, 
  rows: i32, 
  cols: i32
): void {
  for (let ii: i32 = 0; ii < rows; ii += BLOCK_SIZE) {
    for (let jj: i32 = 0; jj < cols; jj += BLOCK_SIZE) {
      // Process block
      const iEnd = min(ii + BLOCK_SIZE, rows);
      const jEnd = min(jj + BLOCK_SIZE, cols);
      
      for (let i = ii; i < iEnd; i++) {
        for (let j = jj; j < jEnd; j++) {
          const srcIdx = i * cols + j;
          const dstIdx = j * rows + i;
          store<f64>(outPtr + (dstIdx << 3), load<f64>(inPtr + (srcIdx << 3)));
        }
      }
    }
  }
}

// Auto-select based on size
export function transpose(
  inPtr: usize, 
  outPtr: usize, 
  rows: i32, 
  cols: i32
): void {
  if (rows * cols < 1024) {
    transpose_naive(inPtr, outPtr, rows, cols);
  } else {
    transpose_blocked(inPtr, outPtr, rows, cols);
  }
}
```

**WebWorker Strategy** (Block-parallel transpose):

```typescript
// packages/parallel/src/operations/transpose.ts

interface TransposeTask {
  buffer: ArrayBuffer;
  rows: number;
  cols: number;
  blockRowStart: number;
  blockRowEnd: number;
}

function transposeBlock(task: TransposeTask): ArrayBuffer {
  const { buffer, rows, cols, blockRowStart, blockRowEnd } = task;
  const data = new Float64Array(buffer);
  
  // Each worker handles a block of rows
  const blockRows = blockRowEnd - blockRowStart;
  const result = new Float64Array(blockRows * cols);
  
  for (let i = blockRowStart; i < blockRowEnd; i++) {
    for (let j = 0; j < cols; j++) {
      // We're producing rows j of the transposed matrix
      // But only for our block
      const localI = i - blockRowStart;
      result[j * blockRows + localI] = data[i * cols + j];
    }
  }
  
  return result.buffer;
}

export async function parallelTranspose(
  data: Float64Array, 
  rows: number, 
  cols: number, 
  pool: ComputePool
): Promise<Float64Array> {
  const numWorkers = pool.stats().totalWorkers;
  const rowsPerWorker = Math.ceil(rows / numWorkers);
  
  const tasks: Promise<ArrayBuffer>[] = [];
  
  for (let w = 0; w < numWorkers; w++) {
    const blockRowStart = w * rowsPerWorker;
    const blockRowEnd = Math.min(blockRowStart + rowsPerWorker, rows);
    
    if (blockRowStart >= rows) break;
    
    tasks.push(pool.exec('transposeBlock', [{
      buffer: data.buffer,
      rows,
      cols,
      blockRowStart,
      blockRowEnd
    }]));
  }
  
  const results = await Promise.all(tasks);
  
  // Combine results (interleave transposed blocks)
  const output = new Float64Array(rows * cols);
  // ... combine logic
  
  return output;
}
```

-----

### 3.2 Determinant

**Mathematical Definition**:

For 1×1: $\det([a]) = a$

For 2×2: $\det\begin{pmatrix} a & b \ c & d \end{pmatrix} = ad - bc$

For 3×3 (Sarrus):
$$\det(A) = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{12}a_{21}a_{33} - a_{11}a_{23}a_{32}$$

For n×n (Laplace expansion):
$$\det(A) = \sum_{j=1}^{n} (-1)^{1+j} a_{1j} M_{1j}$$

where $M_{1j}$ is the minor (determinant of submatrix with row 1 and column j removed).

**Pseudocode**:

```
FUNCTION determinant(matrix):
    n ← matrix.rows
    
    IF NOT is_square(matrix):
        RETURN 0
    
    SWITCH n:
        CASE 1:
            RETURN matrix[0][0]
        CASE 2:
            RETURN matrix[0][0] × matrix[1][1] - matrix[0][1] × matrix[1][0]
        CASE 3:
            RETURN sarrus(matrix)
        DEFAULT:
            RETURN laplace(matrix)

FUNCTION sarrus(m):
    RETURN m[0][0] × m[1][1] × m[2][2] +
           m[0][1] × m[1][2] × m[2][0] +
           m[0][2] × m[1][0] × m[2][1] -
           m[0][2] × m[1][1] × m[2][0] -
           m[0][1] × m[1][0] × m[2][2] -
           m[0][0] × m[1][2] × m[2][1]

FUNCTION laplace(matrix):
    det ← 0
    n ← matrix.rows
    
    FOR j FROM 0 TO n-1:
        minor ← get_minor(matrix, 0, j)
        cofactor ← (-1)^j × determinant(minor)
        det ← det + matrix[0][j] × cofactor
    
    RETURN det

FUNCTION get_minor(matrix, row, col):
    // Return matrix with row and col removed
    result ← new Matrix(matrix.rows - 1, matrix.cols - 1)
    // ... copy excluding row and col
    RETURN result
```

**TypeScript Implementation**:

```typescript
// packages/matrix/src/operations/determinant.ts

function isSquare(matrix: number[][]): boolean {
  if (matrix.length === 0) return true;
  return matrix.every(row => row.length === matrix.length);
}

function getMinor(matrix: number[][], row: number, col: number): number[][] {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col));
}

// Sarrus rule for 3x3
function sarrus(m: number[][]): number {
  return (
    m[0][0] * m[1][1] * m[2][2] +
    m[0][1] * m[1][2] * m[2][0] +
    m[0][2] * m[1][0] * m[2][1] -
    m[0][2] * m[1][1] * m[2][0] -
    m[0][1] * m[1][0] * m[2][2] -
    m[0][0] * m[1][2] * m[2][1]
  );
}

// Laplace expansion (recursive)
function laplace(matrix: number[][]): number {
  const n = matrix.length;
  let det = 0;
  
  for (let j = 0; j < n; j++) {
    const minor = getMinor(matrix, 0, j);
    const cofactor = Math.pow(-1, j) * determinant(minor);
    det += matrix[0][j] * cofactor;
  }
  
  return det;
}

export function determinant(matrix: number[][]): number {
  if (!isSquare(matrix)) {
    throw new Error('Determinant requires square matrix');
  }
  
  const n = matrix.length;
  
  switch (n) {
    case 0:
      return 1; // Empty matrix has determinant 1 by convention
    case 1:
      return matrix[0][0];
    case 2:
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    case 3:
      return sarrus(matrix);
    default:
      return laplace(matrix);
  }
}

// LU-based determinant for large matrices (O(n³) vs O(n!) for Laplace)
export function determinantLU(matrix: number[][]): number {
  const { L, U, P, swaps } = luDecompose(matrix);
  
  // det(A) = det(P) * det(L) * det(U) = (-1)^swaps * 1 * prod(U diagonal)
  let det = swaps % 2 === 0 ? 1 : -1;
  
  for (let i = 0; i < U.length; i++) {
    det *= U[i][i];
  }
  
  return det;
}

export const detTyped = typed('det', {
  'Matrix': (m: Matrix) => {
    const arr = m.toArray();
    return arr.length <= 4 ? determinant(arr) : determinantLU(arr);
  },
  'Array': (arr: number[][]) => {
    return arr.length <= 4 ? determinant(arr) : determinantLU(arr);
  },
});
```

**AssemblyScript WASM**:

```typescript
// packages/matrix/assembly/determinant.ts

// 2x2 determinant
export function det2x2(ptr: usize): f64 {
  const a = load<f64>(ptr);
  const b = load<f64>(ptr + 8);
  const c = load<f64>(ptr + 16);
  const d = load<f64>(ptr + 24);
  return a * d - b * c;
}

// 3x3 determinant (Sarrus)
export function det3x3(ptr: usize): f64 {
  const m00 = load<f64>(ptr);
  const m01 = load<f64>(ptr + 8);
  const m02 = load<f64>(ptr + 16);
  const m10 = load<f64>(ptr + 24);
  const m11 = load<f64>(ptr + 32);
  const m12 = load<f64>(ptr + 40);
  const m20 = load<f64>(ptr + 48);
  const m21 = load<f64>(ptr + 56);
  const m22 = load<f64>(ptr + 64);
  
  return (
    m00 * m11 * m22 +
    m01 * m12 * m20 +
    m02 * m10 * m21 -
    m02 * m11 * m20 -
    m01 * m10 * m22 -
    m00 * m12 * m21
  );
}

// 4x4 determinant (explicit formula, faster than LU for small matrix)
export function det4x4(ptr: usize): f64 {
  // Load all 16 elements
  const m: StaticArray<f64> = new StaticArray<f64>(16);
  for (let i = 0; i < 16; i++) {
    m[i] = load<f64>(ptr + (i << 3));
  }
  
  // Compute using cofactor expansion
  const s0 = m[0] * m[5] - m[1] * m[4];
  const s1 = m[0] * m[6] - m[2] * m[4];
  const s2 = m[0] * m[7] - m[3] * m[4];
  const s3 = m[1] * m[6] - m[2] * m[5];
  const s4 = m[1] * m[7] - m[3] * m[5];
  const s5 = m[2] * m[7] - m[3] * m[6];
  
  const c5 = m[10] * m[15] - m[11] * m[14];
  const c4 = m[9] * m[15] - m[11] * m[13];
  const c3 = m[9] * m[14] - m[10] * m[13];
  const c2 = m[8] * m[15] - m[11] * m[12];
  const c1 = m[8] * m[14] - m[10] * m[12];
  const c0 = m[8] * m[13] - m[9] * m[12];
  
  return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
}

// LU-based determinant for larger matrices
export function det_lu(ptr: usize, n: i32, workPtr: usize): f64 {
  // Copy to work buffer
  const size = n * n;
  memory.copy(workPtr, ptr, size << 3);
  
  let swaps: i32 = 0;
  
  // LU decomposition in-place
  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxIdx = k;
    let maxVal = Math.abs(load<f64>(workPtr + (k * n + k << 3)));
    
    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(load<f64>(workPtr + (i * n + k << 3)));
      if (val > maxVal) {
        maxVal = val;
        maxIdx = i;
      }
    }
    
    // Swap rows if needed
    if (maxIdx != k) {
      for (let j: i32 = 0; j < n; j++) {
        const kOffset = workPtr + (k * n + j << 3);
        const maxOffset = workPtr + (maxIdx * n + j << 3);
        const temp = load<f64>(kOffset);
        store<f64>(kOffset, load<f64>(maxOffset));
        store<f64>(maxOffset, temp);
      }
      swaps++;
    }
    
    const pivot = load<f64>(workPtr + (k * n + k << 3));
    if (pivot == 0) return 0; // Singular matrix
    
    // Eliminate column
    for (let i = k + 1; i < n; i++) {
      const factor = load<f64>(workPtr + (i * n + k << 3)) / pivot;
      for (let j = k + 1; j < n; j++) {
        const offset = workPtr + (i * n + j << 3);
        const val = load<f64>(offset) - factor * load<f64>(workPtr + (k * n + j << 3));
        store<f64>(offset, val);
      }
    }
  }
  
  // Product of diagonal
  let det: f64 = swaps & 1 ? -1 : 1;
  for (let i: i32 = 0; i < n; i++) {
    det *= load<f64>(workPtr + (i * n + i << 3));
  }
  
  return det;
}

// Auto-dispatch based on size
export function determinant(ptr: usize, n: i32, workPtr: usize): f64 {
  switch (n) {
    case 1: return load<f64>(ptr);
    case 2: return det2x2(ptr);
    case 3: return det3x3(ptr);
    case 4: return det4x4(ptr);
    default: return det_lu(ptr, n, workPtr);
  }
}
```

-----

### 3.3 Matrix Multiplication

**Mathematical Definition**:
$$(AB)*{ij} = \sum*{k=0}^{n-1} A_{ik} B_{kj}$$

For A (m×n) and B (n×p), result is (m×p).

**Pseudocode** (Naive):

```
FUNCTION matmul(A, B):
    m ← A.rows
    n ← A.cols  // = B.rows
    p ← B.cols
    
    C ← new Matrix(m, p)
    
    FOR i FROM 0 TO m-1:
        FOR j FROM 0 TO p-1:
            sum ← 0
            FOR k FROM 0 TO n-1:
                sum ← sum + A[i][k] × B[k][j]
            C[i][j] ← sum
    
    RETURN C
```

**Pseudocode** (Cache-efficient blocked):

```
FUNCTION matmul_blocked(A, B, blockSize):
    m ← A.rows
    n ← A.cols
    p ← B.cols
    
    C ← new Matrix(m, p, initialized to 0)
    
    FOR ii FROM 0 TO m-1 STEP blockSize:
        FOR jj FROM 0 TO p-1 STEP blockSize:
            FOR kk FROM 0 TO n-1 STEP blockSize:
                // Process block
                FOR i FROM ii TO min(ii + blockSize, m) - 1:
                    FOR j FROM jj TO min(jj + blockSize, p) - 1:
                        sum ← C[i][j]
                        FOR k FROM kk TO min(kk + blockSize, n) - 1:
                            sum ← sum + A[i][k] × B[k][j]
                        C[i][j] ← sum
    
    RETURN C
```

**TypeScript Implementation**:

```typescript
// packages/matrix/src/operations/matmul.ts

export function matmul(
  a: number[][], 
  b: number[][]
): number[][] {
  const m = a.length;
  const n = a[0].length;
  const p = b[0].length;
  
  if (n !== b.length) {
    throw new Error(`Dimension mismatch: ${n} vs ${b.length}`);
  }
  
  const c: number[][] = Array(m);
  for (let i = 0; i < m; i++) {
    c[i] = new Array(p).fill(0);
  }
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += a[i][k] * b[k][j];
      }
      c[i][j] = sum;
    }
  }
  
  return c;
}

// Flat array version (row-major)
export function matmulFlat(
  a: Float64Array, aRows: number, aCols: number,
  b: Float64Array, bRows: number, bCols: number
): Float64Array {
  if (aCols !== bRows) {
    throw new Error(`Dimension mismatch: ${aCols} vs ${bRows}`);
  }
  
  const c = new Float64Array(aRows * bCols);
  
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += a[i * aCols + k] * b[k * bCols + j];
      }
      c[i * bCols + j] = sum;
    }
  }
  
  return c;
}
```

**AssemblyScript WASM** (Multiple optimization levels):

```typescript
// packages/matrix/assembly/matmul.ts

const BLOCK_SIZE: i32 = 64;

// Naive O(n³) - good for small matrices
export function matmul_naive(
  aPtr: usize, aRows: i32, aCols: i32,
  bPtr: usize, bRows: i32, bCols: i32,
  cPtr: usize
): void {
  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < bCols; j++) {
      let sum: f64 = 0;
      for (let k: i32 = 0; k < aCols; k++) {
        sum += load<f64>(aPtr + (i * aCols + k << 3)) 
             * load<f64>(bPtr + (k * bCols + j << 3));
      }
      store<f64>(cPtr + (i * bCols + j << 3), sum);
    }
  }
}

// Blocked/tiled for cache efficiency
export function matmul_blocked(
  aPtr: usize, aRows: i32, aCols: i32,
  bPtr: usize, bRows: i32, bCols: i32,
  cPtr: usize
): void {
  // Initialize C to zero
  const cSize = aRows * bCols;
  for (let i: i32 = 0; i < cSize; i++) {
    store<f64>(cPtr + (i << 3), 0);
  }
  
  for (let ii: i32 = 0; ii < aRows; ii += BLOCK_SIZE) {
    for (let jj: i32 = 0; jj < bCols; jj += BLOCK_SIZE) {
      for (let kk: i32 = 0; kk < aCols; kk += BLOCK_SIZE) {
        const iEnd = min(ii + BLOCK_SIZE, aRows);
        const jEnd = min(jj + BLOCK_SIZE, bCols);
        const kEnd = min(kk + BLOCK_SIZE, aCols);
        
        for (let i = ii; i < iEnd; i++) {
          for (let j = jj; j < jEnd; j++) {
            let sum = load<f64>(cPtr + (i * bCols + j << 3));
            for (let k = kk; k < kEnd; k++) {
              sum += load<f64>(aPtr + (i * aCols + k << 3))
                   * load<f64>(bPtr + (k * bCols + j << 3));
            }
            store<f64>(cPtr + (i * bCols + j << 3), sum);
          }
        }
      }
    }
  }
}

// SIMD-accelerated (processes 2 columns at once)
export function matmul_simd(
  aPtr: usize, aRows: i32, aCols: i32,
  bPtr: usize, bRows: i32, bCols: i32,
  cPtr: usize
): void {
  const simdCols = bCols & ~1; // Round down to multiple of 2
  
  for (let i: i32 = 0; i < aRows; i++) {
    // SIMD columns
    for (let j: i32 = 0; j < simdCols; j += 2) {
      let sum = f64x2.splat(0);
      
      for (let k: i32 = 0; k < aCols; k++) {
        const aVal = f64x2.splat(load<f64>(aPtr + (i * aCols + k << 3)));
        const bVals = v128.load(bPtr + (k * bCols + j << 3));
        sum = f64x2.add(sum, f64x2.mul(aVal, bVals));
      }
      
      v128.store(cPtr + (i * bCols + j << 3), sum);
    }
    
    // Remaining columns
    for (let j = simdCols; j < bCols; j++) {
      let s: f64 = 0;
      for (let k: i32 = 0; k < aCols; k++) {
        s += load<f64>(aPtr + (i * aCols + k << 3))
           * load<f64>(bPtr + (k * bCols + j << 3));
      }
      store<f64>(cPtr + (i * bCols + j << 3), s);
    }
  }
}

// Auto-dispatch
export function matmul(
  aPtr: usize, aRows: i32, aCols: i32,
  bPtr: usize, bRows: i32, bCols: i32,
  cPtr: usize
): void {
  const ops = aRows * aCols * bCols;
  
  if (ops < 1000) {
    matmul_naive(aPtr, aRows, aCols, bPtr, bRows, bCols, cPtr);
  } else if (ops < 100000) {
    matmul_simd(aPtr, aRows, aCols, bPtr, bRows, bCols, cPtr);
  } else {
    matmul_blocked(aPtr, aRows, aCols, bPtr, bRows, bCols, cPtr);
  }
}
```

**WebWorker Strategy** (Row-block parallelization):

```typescript
// packages/parallel/src/operations/matmul.ts

interface MatmulTask {
  aBuffer: ArrayBuffer;
  bBuffer: ArrayBuffer;
  aRows: number;
  aCols: number;
  bCols: number;
  rowStart: number;
  rowEnd: number;
}

function matmulRows(task: MatmulTask): ArrayBuffer {
  const { aBuffer, bBuffer, aRows, aCols, bCols, rowStart, rowEnd } = task;
  const a = new Float64Array(aBuffer);
  const b = new Float64Array(bBuffer);
  
  const resultRows = rowEnd - rowStart;
  const result = new Float64Array(resultRows * bCols);
  
  for (let i = 0; i < resultRows; i++) {
    const aRowIdx = rowStart + i;
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += a[aRowIdx * aCols + k] * b[k * bCols + j];
      }
      result[i * bCols + j] = sum;
    }
  }
  
  return result.buffer;
}

export async function parallelMatmul(
  a: Float64Array, aRows: number, aCols: number,
  b: Float64Array, bCols: number,
  pool: ComputePool
): Promise<Float64Array> {
  const numWorkers = pool.stats().totalWorkers;
  const rowsPerWorker = Math.ceil(aRows / numWorkers);
  
  const tasks: Promise<ArrayBuffer>[] = [];
  
  for (let w = 0; w < numWorkers; w++) {
    const rowStart = w * rowsPerWorker;
    const rowEnd = Math.min(rowStart + rowsPerWorker, aRows);
    
    if (rowStart >= aRows) break;
    
    tasks.push(pool.exec('matmulRows', [{
      aBuffer: a.buffer,
      bBuffer: b.buffer,
      aRows,
      aCols,
      bCols,
      rowStart,
      rowEnd
    }], {
      transfer: [] // Can't transfer, multiple workers need the data
    }));
  }
  
  const results = await Promise.all(tasks);
  
  // Combine row blocks
  const c = new Float64Array(aRows * bCols);
  let offset = 0;
  
  for (const buf of results) {
    const chunk = new Float64Array(buf);
    c.set(chunk, offset);
    offset += chunk.length;
  }
  
  return c;
}
```

-----

## Part 4: Geometry Functions

### 4.1 Distance

**Mathematical Definition**:
$$d(\vec{a}, \vec{b}) = |\vec{a} - \vec{b}| = \sqrt{\sum_{i=0}^{n-1}(a_i - b_i)^2}$$

**Pseudocode**:

```
FUNCTION distance(a, b):
    sumSquared ← 0
    FOR i FROM 0 TO a.length-1:
        diff ← a[i] - b[i]
        sumSquared ← sumSquared + diff × diff
    RETURN sqrt(sumSquared)
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/geometry/distance.ts

export function distance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
  }
  
  let sumSquared = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSquared += diff * diff;
  }
  
  return Math.sqrt(sumSquared);
}

export const distanceTyped = typed('distance', {
  'Array, Array': distance,
  'Matrix, Matrix': (a: Matrix, b: Matrix) => 
    distance(a.toArray().flat(), b.toArray().flat()),
});
```

**AssemblyScript WASM**:

```typescript
// packages/functions/assembly/geometry/distance.ts

export function distance(aPtr: usize, bPtr: usize, length: i32): f64 {
  let sumSquared: f64 = 0;
  
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 3;
    const diff = load<f64>(aPtr + offset) - load<f64>(bPtr + offset);
    sumSquared += diff * diff;
  }
  
  return Math.sqrt(sumSquared);
}

// SIMD version
export function distance_simd(aPtr: usize, bPtr: usize, length: i32): f64 {
  let sum1 = f64x2.splat(0);
  let sum2 = f64x2.splat(0);
  
  const simdLength = length & ~3;
  
  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset = i << 3;
    
    const a1 = v128.load(aPtr + offset);
    const b1 = v128.load(bPtr + offset);
    const diff1 = f64x2.sub(a1, b1);
    sum1 = f64x2.add(sum1, f64x2.mul(diff1, diff1));
    
    const a2 = v128.load(aPtr + offset + 16);
    const b2 = v128.load(bPtr + offset + 16);
    const diff2 = f64x2.sub(a2, b2);
    sum2 = f64x2.add(sum2, f64x2.mul(diff2, diff2));
  }
  
  let sumSquared = f64x2.extract_lane(sum1, 0) + f64x2.extract_lane(sum1, 1)
                 + f64x2.extract_lane(sum2, 0) + f64x2.extract_lane(sum2, 1);
  
  for (let i = simdLength; i < length; i++) {
    const offset = i << 3;
    const diff = load<f64>(aPtr + offset) - load<f64>(bPtr + offset);
    sumSquared += diff * diff;
  }
  
  return Math.sqrt(sumSquared);
}
```

-----

### 4.2 Angle Between Vectors

**Mathematical Definition**:
$$\theta = \arccos\left(\frac{\vec{a} \cdot \vec{b}}{|\vec{a}||\vec{b}|}\right)$$

**Pseudocode**:

```
FUNCTION angle(a, b):
    dotProduct ← dot(a, b)
    lenA ← vectorLength(a)
    lenB ← vectorLength(b)
    
    cosTheta ← dotProduct / (lenA × lenB)
    // Clamp to [-1, 1] for numerical stability
    cosTheta ← clamp(cosTheta, -1, 1)
    
    RETURN acos(cosTheta)
```

**TypeScript Implementation**:

```typescript
// packages/functions/src/geometry/angle.ts

import { dot } from '../matrix/dot';
import { vectorLength } from '../matrix/normalize';

export function angle(a: number[], b: number[]): number {
  const dotProduct = dot(a, b);
  const lenA = vectorLength(a);
  const lenB = vectorLength(b);
  
  if (lenA === 0 || lenB === 0) {
    return NaN; // Undefined for zero vectors
  }
  
  // Clamp for numerical stability
  let cosTheta = dotProduct / (lenA * lenB);
  cosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  return Math.acos(cosTheta);
}

export const angleTyped = typed('angle', {
  'Array, Array': angle,
});
```

-----

## Part 5: Sprint Implementation Plan

### Sprint A: Core Statistical Functions (Week 1)

|Task|Function             |TS|WASM         |Worker       |Tests|
|----|---------------------|--|-------------|-------------|-----|
|A.1 |sum                  |✓ |SIMD         |Chunked      |✓    |
|A.2 |product (elementwise)|✓ |SIMD         |Chunked      |✓    |
|A.3 |variance             |✓ |Welford      |Chan parallel|✓    |
|A.4 |stdDeviation         |✓ |Uses variance|Uses variance|✓    |
|A.5 |median               |✓ |Quickselect  |N/A          |✓    |

### Sprint B: Vector Operations (Week 2)

|Task|Function    |TS|WASM    |Worker |Tests|
|----|------------|--|--------|-------|-----|
|B.1 |dot         |✓ |SIMD    |Chunked|✓    |
|B.2 |cross       |✓ |Direct  |N/A    |✓    |
|B.3 |projection  |✓ |Uses dot|N/A    |✓    |
|B.4 |normalize   |✓ |SIMD    |N/A    |✓    |
|B.5 |vectorLength|✓ |Uses dot|N/A    |✓    |

### Sprint C: Matrix Operations (Week 3-4)

|Task|Function   |TS         |WASM        |Worker        |Tests|
|----|-----------|-----------|------------|--------------|-----|
|C.1 |transpose  |✓          |Blocked     |Block-parallel|✓    |
|C.2 |determinant|✓          |LU-based    |N/A           |✓    |
|C.3 |matmul     |✓          |SIMD+Blocked|Row-parallel  |✓    |
|C.4 |inverse    |Depends C.2|LU-based    |N/A           |✓    |

### Sprint D: Geometry Functions (Week 5)

|Task|Function|TS|WASM    |Worker|Tests|
|----|--------|--|--------|------|-----|
|D.1 |distance|✓ |SIMD    |Batch |✓    |
|D.2 |angle   |✓ |Uses dot|N/A   |✓    |
|D.3 |slope   |✓ |Direct  |N/A   |✓    |

-----

## Part 6: Performance Thresholds

|Operation      |JS Only|Use WASM       |Use Workers                    |
|---------------|-------|---------------|-------------------------------|
|sum            |< 1,000|1,000 - 100,000|> 100,000                      |
|elementwise ops|< 1,000|1,000 - 100,000|> 100,000                      |
|dot product    |< 1,000|1,000 - 50,000 |> 50,000                       |
|variance       |< 1,000|1,000 - 50,000 |> 50,000                       |
|matmul (n×n)   |n < 32 |32 ≤ n < 500   |n ≥ 500                        |
|transpose      |n < 100|100 ≤ n < 1000 |n ≥ 1000                       |
|determinant    |n ≤ 4  |n > 4          |N/A (not parallelizable easily)|

-----

## Part 7: Testing Strategy

### Unit Tests (per function)

```typescript
// Example: packages/functions/test/statistics/sum.test.ts

import { describe, it, expect } from 'vitest';
import { sum, sumTyped } from '../src/statistics/sum';

describe('sum', () => {
  it('sums empty array', () => {
    expect(sum([])).toBe(0);
  });
  
  it('sums single element', () => {
    expect(sum([5])).toBe(5);
  });
  
  it('sums multiple elements', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
  });
  
  it('handles negative numbers', () => {
    expect(sum([-1, -2, 3])).toBe(0);
  });
  
  it('handles floats', () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });
  
  it('sums with start and length', () => {
    expect(sum([1, 2, 3, 4, 5], 1, 3)).toBe(9); // 2+3+4
  });
});
```

### WASM Accuracy Tests

```typescript
// packages/functions/test/wasm/accuracy.test.ts

import { describe, it, expect } from 'vitest';
import { sum as jsSum } from '../src/statistics/sum';
import { wasmSum } from '../src/wasm/statistics';

describe('WASM accuracy', () => {
  it('matches JS sum for random data', () => {
    const data = Array.from({ length: 10000 }, () => Math.random() * 1000 - 500);
    const jsResult = jsSum(data);
    const wasmResult = wasmSum(new Float64Array(data));
    
    expect(wasmResult).toBeCloseTo(jsResult, 10);
  });
});
```

### Performance Benchmarks

```typescript
// tools/benchmark/statistics.bench.ts

import { bench, describe } from 'vitest';

describe('sum performance', () => {
  const sizes = [100, 1000, 10000, 100000, 1000000];
  
  for (const size of sizes) {
    const data = new Float64Array(size).map(() => Math.random());
    
    bench(`JS sum ${size}`, () => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
    });
    
    bench(`WASM sum ${size}`, () => {
      wasmSum(data);
    });
    
    if (size >= 100000) {
      bench(`Parallel sum ${size}`, async () => {
        await parallelSum(data, pool);
      });
    }
  }
});
```

-----

## Appendix: Memory Layout Conventions

### Flat Array (Row-Major)

```
Matrix A (3×4):
[ a00 a01 a02 a03 | a10 a11 a12 a13 | a20 a21 a22 a23 ]
  Row 0           | Row 1           | Row 2

Index calculation: A[i][j] = data[i * cols + j]
```

### WASM Memory

```
All data as Float64 (8 bytes each)
Pointer arithmetic: element i at ptr + (i << 3)

Function signature convention:
  matmul(aPtr, aRows, aCols, bPtr, bRows, bCols, outPtr)
  
Caller allocates output buffer before calling.
```

### Transferable Objects (Workers)

```typescript
// Send ArrayBuffer (zero-copy)
pool.exec('fn', [data.buffer], { transfer: [data.buffer] });

// After transfer, original data.buffer is detached (length = 0)
// Worker receives ownership
```

-----

*This document serves as the algorithm reference for MathTS development. Each algorithm should be implemented following these patterns for consistency.*