# Phase 11: Window Functions & Spectral Analysis

**Technical Implementation Guide**

This document provides detailed algorithms, pseudocode, spectral properties, and numerical considerations for implementing window functions and spectral analysis methods in TypeScript/WASM.

**Sprint 11: Window Functions & Spectral Analysis** (8 tasks)
- Target: High-accuracy windowing with proper spectral characteristics
- Performance: WASM acceleration for FFT-based operations
- Stability: Proper normalization and overlap handling

---

## 1. Hamming Window

**Goal**: Generate Hamming window coefficients with reduced spectral leakage

### Mathematical Background

The Hamming window is a raised cosine window designed to minimize the first side lobe:
```
w[n] = α - β·cos(2πn/(N-1))     for n = 0, 1, ..., N-1

where:
  α = 0.54  (25/46 exactly)
  β = 0.46  (21/46 exactly)
```

**Alternative Periodic Form** (for DFT/FFT applications):
```
w[n] = 0.54 - 0.46·cos(2πn/N)    for n = 0, 1, ..., N-1
```

### Spectral Properties

- **Main lobe width**: 8π/N
- **Peak side lobe**: -42.7 dB
- **Side lobe roll-off**: -6 dB/octave
- **Coherent gain**: 0.54
- **Equivalent noise bandwidth**: 1.36 bins
- **Processing gain**: -1.34 dB
- **Scalloping loss**: -1.78 dB

### Algorithm: Symmetric Hamming

```typescript
function hammingWindow(N: number, symmetric: boolean = true): Float64Array {
  const window = new Float64Array(N);

  const alpha = 0.54;
  const beta = 0.46;

  if (symmetric) {
    // Symmetric form: w[n] = α - β·cos(2πn/(N-1))
    // Used for FIR filter design
    const denominator = N - 1;

    for (let n = 0; n < N; n++) {
      window[n] = alpha - beta * Math.cos(2 * Math.PI * n / denominator);
    }
  } else {
    // Periodic form: w[n] = α - β·cos(2πn/N)
    // Used for spectral analysis (DFT/FFT)
    for (let n = 0; n < N; n++) {
      window[n] = alpha - beta * Math.cos(2 * Math.PI * n / N);
    }
  }

  return window;
}
```

### Optimized WASM Implementation

```typescript
// AssemblyScript/WASM optimized version
export function hammingWindowWASM(
  N: i32,
  symmetric: bool,
  output: Float64Array
): void {
  const alpha = 0.54;
  const beta = 0.46;
  const twoPi = 2.0 * Math.PI;

  const divisor = symmetric ? f64(N - 1) : f64(N);
  const multiplier = twoPi / divisor;

  // Vectorizable loop for SIMD
  for (let n = 0; n < N; n++) {
    const angle = multiplier * f64(n);
    output[n] = alpha - beta * Math.cos(angle);
  }
}
```

### Edge Cases & Validation

- **N = 1**: Returns [1.0]
- **N = 2**: Symmetric [0.08, 1.0], Periodic [0.54, 0.54]
- **Normalization**: No normalization needed for standard use
- **Energy normalization**: Multiply by 1/√(Σw²) for energy preservation

```typescript
function normalizeWindowEnergy(window: Float64Array): Float64Array {
  const N = window.length;
  let sumSquares = 0;

  for (let i = 0; i < N; i++) {
    sumSquares += window[i] * window[i];
  }

  const scale = 1.0 / Math.sqrt(sumSquares);
  const normalized = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    normalized[i] = window[i] * scale;
  }

  return normalized;
}
```

**Complexity**: O(N)

---

## 2. Hanning Window (Hann Window)

**Goal**: Generate Hann window with excellent spectral characteristics

### Mathematical Background

The Hann window (also called Hanning) is a raised cosine window:
```
w[n] = 0.5 - 0.5·cos(2πn/(N-1))     (symmetric)
     = 0.5·[1 - cos(2πn/(N-1))]
     = sin²(πn/(N-1))

Periodic form:
w[n] = 0.5 - 0.5·cos(2πn/N)
```

### Spectral Properties

- **Main lobe width**: 8π/N
- **Peak side lobe**: -31.5 dB
- **Side lobe roll-off**: -18 dB/octave
- **Coherent gain**: 0.5
- **Equivalent noise bandwidth**: 1.5 bins
- **Processing gain**: -1.76 dB
- **Scalloping loss**: -1.42 dB

### Algorithm: Symmetric Hann

```typescript
function hannWindow(N: number, symmetric: boolean = true): Float64Array {
  const window = new Float64Array(N);

  if (symmetric) {
    const denominator = N - 1;

    for (let n = 0; n < N; n++) {
      // Using sin² form for better numerical accuracy
      const angle = Math.PI * n / denominator;
      const sinVal = Math.sin(angle);
      window[n] = sinVal * sinVal;
    }
  } else {
    // Periodic form
    for (let n = 0; n < N; n++) {
      window[n] = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / N);
    }
  }

  return window;
}
```

### Alternative Implementations

```typescript
// Cosine form (less accurate for angles near π/2)
function hannWindowCosine(N: number, symmetric: boolean = true): Float64Array {
  const window = new Float64Array(N);
  const divisor = symmetric ? N - 1 : N;

  for (let n = 0; n < N; n++) {
    window[n] = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / divisor);
  }

  return window;
}

// Optimized symmetric form with precomputation
function hannWindowOptimized(N: number): Float64Array {
  const window = new Float64Array(N);
  const halfN = Math.floor(N / 2);

  // Compute first half
  const denominator = N - 1;
  for (let n = 0; n <= halfN; n++) {
    const angle = Math.PI * n / denominator;
    const sinVal = Math.sin(angle);
    window[n] = sinVal * sinVal;
  }

  // Mirror to second half (symmetry)
  for (let n = halfN + 1; n < N; n++) {
    window[n] = window[N - 1 - n];
  }

  return window;
}
```

### WASM SIMD Optimized Version

```typescript
// AssemblyScript with SIMD for 4x speedup
export function hannWindowSIMD(
  N: i32,
  symmetric: bool,
  output: Float64Array
): void {
  const divisor = symmetric ? f64(N - 1) : f64(N);
  const multiplier = 2.0 * Math.PI / divisor;

  // Process 4 elements at a time with SIMD
  const chunks = N / 4;
  let idx = 0;

  for (let i = 0; i < chunks; i++) {
    // Compute 4 angles
    const n0 = f64(idx);
    const n1 = f64(idx + 1);
    const n2 = f64(idx + 2);
    const n3 = f64(idx + 3);

    // Vectorized computation
    output[idx] = 0.5 - 0.5 * Math.cos(multiplier * n0);
    output[idx + 1] = 0.5 - 0.5 * Math.cos(multiplier * n1);
    output[idx + 2] = 0.5 - 0.5 * Math.cos(multiplier * n2);
    output[idx + 3] = 0.5 - 0.5 * Math.cos(multiplier * n3);

    idx += 4;
  }

  // Handle remainder
  for (let n = idx; n < N; n++) {
    output[n] = 0.5 - 0.5 * Math.cos(multiplier * f64(n));
  }
}
```

**Complexity**: O(N)

---

## 3. Blackman Window

**Goal**: Generate Blackman window with very low side lobes

### Mathematical Background

The Blackman window is a three-term cosine window:
```
w[n] = a₀ - a₁·cos(2πn/(N-1)) + a₂·cos(4πn/(N-1))

Standard coefficients:
  a₀ = 0.42 (exact: 7938/18608 ≈ 0.42659)
  a₁ = 0.5
  a₂ = 0.08 (exact: 1430/18608 ≈ 0.07684)

Exact Blackman:
  a₀ = 0.42659
  a₁ = 0.49656
  a₂ = 0.07685
```

### Spectral Properties

- **Main lobe width**: 12π/N
- **Peak side lobe**: -58.1 dB (exact), -56.2 dB (standard)
- **Side lobe roll-off**: -18 dB/octave
- **Coherent gain**: 0.42
- **Equivalent noise bandwidth**: 1.73 bins
- **Processing gain**: -2.38 dB
- **Scalloping loss**: -1.10 dB

### Algorithm: Standard Blackman

```typescript
function blackmanWindow(
  N: number,
  symmetric: boolean = true,
  exact: boolean = false
): Float64Array {
  const window = new Float64Array(N);

  // Coefficient selection
  let a0: number, a1: number, a2: number;

  if (exact) {
    // Exact Blackman (minimizes first side lobe)
    a0 = 7938.0 / 18608.0;  // ≈ 0.42659
    a1 = 9240.0 / 18608.0;  // ≈ 0.49656
    a2 = 1430.0 / 18608.0;  // ≈ 0.07685
  } else {
    // Standard Blackman (approximate)
    a0 = 0.42;
    a1 = 0.5;
    a2 = 0.08;
  }

  const divisor = symmetric ? N - 1 : N;
  const twoPiN = 2 * Math.PI / divisor;
  const fourPiN = 4 * Math.PI / divisor;

  for (let n = 0; n < N; n++) {
    const angle1 = twoPiN * n;
    const angle2 = fourPiN * n;
    window[n] = a0 - a1 * Math.cos(angle1) + a2 * Math.cos(angle2);
  }

  return window;
}
```

### Blackman-Harris Family

```typescript
// Blackman-Harris 4-term window (-92 dB side lobes)
function blackmanHarrisWindow(
  N: number,
  symmetric: boolean = true
): Float64Array {
  const window = new Float64Array(N);

  // Blackman-Harris coefficients
  const a0 = 0.35875;
  const a1 = 0.48829;
  const a2 = 0.14128;
  const a3 = 0.01168;

  const divisor = symmetric ? N - 1 : N;
  const twoPi = 2 * Math.PI / divisor;

  for (let n = 0; n < N; n++) {
    const angle = twoPi * n;
    window[n] = a0
      - a1 * Math.cos(angle)
      + a2 * Math.cos(2 * angle)
      - a3 * Math.cos(3 * angle);
  }

  return window;
}

// Nuttall window (continuous first derivative, -93 dB)
function nuttallWindow(
  N: number,
  symmetric: boolean = true
): Float64Array {
  const window = new Float64Array(N);

  const a0 = 0.355768;
  const a1 = 0.487396;
  const a2 = 0.144232;
  const a3 = 0.012604;

  const divisor = symmetric ? N - 1 : N;
  const twoPi = 2 * Math.PI / divisor;

  for (let n = 0; n < N; n++) {
    const angle = twoPi * n;
    window[n] = a0
      - a1 * Math.cos(angle)
      + a2 * Math.cos(2 * angle)
      - a3 * Math.cos(3 * angle);
  }

  return window;
}
```

### Optimized Multi-Term Cosine Window

```typescript
// Generic k-term cosine window
function multiTermCosineWindow(
  N: number,
  coefficients: number[],
  symmetric: boolean = true
): Float64Array {
  const window = new Float64Array(N);
  const k = coefficients.length;
  const divisor = symmetric ? N - 1 : N;
  const twoPi = 2 * Math.PI / divisor;

  for (let n = 0; n < N; n++) {
    let sum = coefficients[0];

    for (let i = 1; i < k; i++) {
      const sign = (i % 2 === 0) ? 1 : -1;
      sum += sign * coefficients[i] * Math.cos(i * twoPi * n);
    }

    window[n] = sum;
  }

  return window;
}

// Usage examples:
// Hamming: [0.54, 0.46]
// Hann: [0.5, 0.5]
// Blackman: [0.42, 0.5, 0.08]
// Blackman-Harris: [0.35875, 0.48829, 0.14128, 0.01168]
```

**Complexity**: O(k·N) where k is number of cosine terms

---

## 4. Kaiser Window

**Goal**: Parametric window with adjustable side lobe attenuation

### Mathematical Background

The Kaiser window uses the modified Bessel function of the first kind:
```
w[n] = I₀(β·√(1 - ((n - N/2)/(N/2))²)) / I₀(β)

where:
  I₀(x) = modified Bessel function of order 0
  β = shape parameter (controls trade-off between main lobe width and side lobe level)
  n = 0, 1, ..., N-1
```

**Alternative form:**
```
w[n] = I₀(β·√(1 - (2n/(N-1) - 1)²)) / I₀(β)
```

### Parameter Selection

**Relationship between β and attenuation A (dB):**
```
         ⎧ 0.1102(A - 8.7)           if A > 50
β(A) =   ⎨ 0.5842(A - 21)^0.4 + 0.07886(A - 21)   if 21 ≤ A ≤ 50
         ⎩ 0                         if A < 21

where A = desired side lobe attenuation in dB
```

### Spectral Properties (varies with β)

| β | Side Lobe (dB) | Main Lobe Width | ENBW |
|---|----------------|-----------------|------|
| 0 | -13.3 (rect) | 4π/N | 1.0 |
| 2 | -27.7 | 6π/N | 1.2 |
| 4 | -44.5 | 8π/N | 1.4 |
| 6 | -60.8 | 10π/N | 1.6 |
| 8 | -76.9 | 12π/N | 1.8 |
| 10 | -92.9 | 14π/N | 2.0 |

### Algorithm: Kaiser Window with Bessel I₀

```typescript
function kaiserWindow(
  N: number,
  beta: number,
  symmetric: boolean = true
): Float64Array {
  const window = new Float64Array(N);

  // Normalization factor: I₀(β)
  const I0_beta = besselI0(beta);

  const divisor = symmetric ? N - 1 : N;
  const center = divisor / 2.0;

  for (let n = 0; n < N; n++) {
    // Compute normalized distance from center: [-1, 1]
    const x = (n - center) / center;

    // Kaiser window argument
    const arg = beta * Math.sqrt(1.0 - x * x);

    // w[n] = I₀(arg) / I₀(β)
    window[n] = besselI0(arg) / I0_beta;
  }

  return window;
}

// Design Kaiser window from desired attenuation
function kaiserWindowFromAttenuation(
  N: number,
  attenuation_dB: number,
  symmetric: boolean = true
): Float64Array {
  // Compute β from desired attenuation
  const A = attenuation_dB;
  let beta: number;

  if (A > 50) {
    beta = 0.1102 * (A - 8.7);
  } else if (A >= 21) {
    beta = 0.5842 * Math.pow(A - 21, 0.4) + 0.07886 * (A - 21);
  } else {
    beta = 0.0;
  }

  return kaiserWindow(N, beta, symmetric);
}
```

### Modified Bessel I₀ Implementation

```typescript
function besselI0(x: number): number {
  // Series expansion for I₀(x)
  // I₀(x) = Σ_{k=0}^∞ (x/2)^{2k} / (k!)²

  const absX = Math.abs(x);

  if (absX < 3.75) {
    // Power series for small x
    const t = x / 3.75;
    const t2 = t * t;

    return 1.0 + t2 * (3.5156229
      + t2 * (3.0899424
      + t2 * (1.2067492
      + t2 * (0.2659732
      + t2 * (0.0360768
      + t2 * 0.0045813)))));
  } else {
    // Asymptotic expansion for large x
    const t = 3.75 / absX;

    const result = (Math.exp(absX) / Math.sqrt(absX)) * (0.39894228
      + t * (0.01328592
      + t * (0.00225319
      + t * (-0.00157565
      + t * (0.00916281
      + t * (-0.02057706
      + t * (0.02635537
      + t * (-0.01647633
      + t * 0.00392377))))))));

    return result;
  }
}
```

### High-Precision Bessel I₀ (for critical applications)

```typescript
function besselI0HighPrecision(x: number, maxIter: number = 100): number {
  const EPSILON = 1e-16;
  const absX = Math.abs(x);

  // Series: I₀(x) = Σ (x/2)^{2k} / (k!)²
  const halfX = absX / 2.0;
  const halfXsq = halfX * halfX;

  let sum = 1.0;
  let term = 1.0;

  for (let k = 1; k < maxIter; k++) {
    // term_{k} = term_{k-1} * (x/2)² / k²
    term *= halfXsq / (k * k);
    sum += term;

    if (term < EPSILON * sum) {
      break;
    }
  }

  return sum;
}
```

### WASM Optimized Kaiser Window

```typescript
// Precompute Bessel values for performance
export function kaiserWindowWASM(
  N: i32,
  beta: f64,
  symmetric: bool,
  output: Float64Array
): void {
  const I0_beta = besselI0(beta);
  const invI0 = 1.0 / I0_beta;

  const divisor = symmetric ? f64(N - 1) : f64(N);
  const center = divisor / 2.0;
  const invCenter = 1.0 / center;

  for (let n = 0; n < N; n++) {
    const x = (f64(n) - center) * invCenter;
    const arg = beta * Math.sqrt(1.0 - x * x);
    output[n] = besselI0(arg) * invI0;
  }
}
```

**Complexity**: O(N·k) where k is Bessel I₀ evaluation cost (~10-50 ops)

---

## 5. Additional Windows

### 5.1 Bartlett Window (Triangular)

**Formula:**
```
         ⎧ 2n/(N-1)           for 0 ≤ n ≤ (N-1)/2
w[n] =   ⎨
         ⎩ 2 - 2n/(N-1)       for (N-1)/2 < n < N
```

**Spectral Properties:**
- Peak side lobe: -26.5 dB
- Main lobe width: 8π/N
- ENBW: 1.33 bins

```typescript
function bartlettWindow(N: number, symmetric: boolean = true): Float64Array {
  const window = new Float64Array(N);
  const divisor = symmetric ? N - 1 : N;
  const mid = divisor / 2.0;

  for (let n = 0; n < N; n++) {
    if (n <= mid) {
      window[n] = 2 * n / divisor;
    } else {
      window[n] = 2 - 2 * n / divisor;
    }
  }

  return window;
}

// Optimized version
function bartlettWindowOptimized(N: number): Float64Array {
  const window = new Float64Array(N);
  const halfN = Math.floor((N - 1) / 2);
  const scale = 2.0 / (N - 1);

  // Ascending ramp
  for (let n = 0; n <= halfN; n++) {
    window[n] = n * scale;
  }

  // Descending ramp (mirror)
  for (let n = halfN + 1; n < N; n++) {
    window[n] = window[N - 1 - n];
  }

  return window;
}
```

### 5.2 Tukey Window (Tapered Cosine)

**Formula:**
```
         ⎧ 0.5[1 + cos(π(2n/(α(N-1)) - 1))]     for 0 ≤ n < α(N-1)/2
w[n] =   ⎨ 1                                     for α(N-1)/2 ≤ n ≤ (N-1)(1-α/2)
         ⎩ 0.5[1 + cos(π(2n/(α(N-1)) - 2/α + 1))]  for (N-1)(1-α/2) < n < N

where α ∈ [0, 1] is the taper parameter:
  α = 0: rectangular window
  α = 1: Hann window
```

**Spectral Properties** (vary with α):
- Controls trade-off between frequency resolution and leakage
- Smaller α → better frequency resolution, more leakage
- Larger α → worse frequency resolution, less leakage

```typescript
function tukeyWindow(
  N: number,
  alpha: number = 0.5,
  symmetric: boolean = true
): Float64Array {
  const window = new Float64Array(N);

  // Clamp alpha to [0, 1]
  alpha = Math.max(0, Math.min(1, alpha));

  if (alpha <= 0) {
    // Rectangular window
    window.fill(1.0);
    return window;
  }

  if (alpha >= 1) {
    // Hann window
    return hannWindow(N, symmetric);
  }

  const divisor = symmetric ? N - 1 : N;
  const alphaN = alpha * divisor;
  const halfAlphaN = alphaN / 2;
  const oneMinusAlpha = 1 - alpha / 2;

  for (let n = 0; n < N; n++) {
    if (n < halfAlphaN) {
      // Left taper (cosine)
      const angle = Math.PI * (2 * n / alphaN - 1);
      window[n] = 0.5 * (1 + Math.cos(angle));
    } else if (n <= oneMinusAlpha * divisor) {
      // Flat top
      window[n] = 1.0;
    } else {
      // Right taper (cosine)
      const angle = Math.PI * (2 * n / alphaN - 2 / alpha + 1);
      window[n] = 0.5 * (1 + Math.cos(angle));
    }
  }

  return window;
}
```

### 5.3 Parzen Window (de la Vallée-Poussin)

**Formula:**
```
         ⎧ 1 - 6(|n|/N)² + 6(|n|/N)³     for 0 ≤ |n| ≤ N/2
w[n] =   ⎨
         ⎩ 2(1 - |n|/N)³                 for N/2 < |n| ≤ N

where n is measured from center: n ∈ [-N/2, N/2]
```

**Spectral Properties:**
- Peak side lobe: -53 dB
- Main lobe width: 16π/N
- ENBW: 1.92 bins

```typescript
function parzenWindow(N: number): Float64Array {
  const window = new Float64Array(N);
  const center = (N - 1) / 2.0;
  const halfN = N / 2.0;

  for (let i = 0; i < N; i++) {
    const n = Math.abs(i - center);
    const nNorm = n / halfN;

    if (n <= halfN / 2) {
      // Inner region: 1 - 6t² + 6t³
      window[i] = 1 - 6 * nNorm * nNorm * (1 - nNorm);
    } else {
      // Outer region: 2(1-t)³
      const oneMinusT = 1 - nNorm;
      window[i] = 2 * oneMinusT * oneMinusT * oneMinusT;
    }
  }

  return window;
}
```

### 5.4 Boxcar Window (Rectangular)

**Formula:**
```
w[n] = 1    for all n ∈ [0, N-1]
```

**Spectral Properties:**
- Peak side lobe: -13.3 dB (worst)
- Main lobe width: 4π/N (best)
- ENBW: 1.0 bins (ideal)
- Used only when no spectral leakage is expected

```typescript
function boxcarWindow(N: number): Float64Array {
  const window = new Float64Array(N);
  window.fill(1.0);
  return window;
}

// Alternatively
function rectangularWindow(N: number): Float64Array {
  return new Float64Array(N).fill(1.0);
}
```

### Window Comparison Table

| Window | Peak Sidelobe | Main Lobe Width | ENBW | Scalloping Loss |
|--------|---------------|-----------------|------|-----------------|
| Rectangular | -13.3 dB | 4π/N | 1.00 | -3.92 dB |
| Bartlett | -26.5 dB | 8π/N | 1.33 | -1.82 dB |
| Hann | -31.5 dB | 8π/N | 1.50 | -1.42 dB |
| Hamming | -42.7 dB | 8π/N | 1.36 | -1.78 dB |
| Blackman | -58.1 dB | 12π/N | 1.73 | -1.10 dB |
| Kaiser (β=6) | -60.8 dB | 10π/N | 1.60 | -1.20 dB |
| Blackman-Harris | -92.0 dB | 16π/N | 2.00 | -0.83 dB |

**Complexity**: O(N) for all window functions

---

## 6. Periodogram

**Goal**: Estimate power spectral density using FFT

### Mathematical Background

The periodogram is the magnitude-squared FFT normalized by the sequence length:
```
P[k] = (1/N) |X[k]|²

where X[k] = FFT{x[n]}
```

**One-sided periodogram** (for real signals):
```
         ⎧ (2/N) |X[k]|²     for k = 1, 2, ..., N/2-1
P₁[k] =  ⎨ (1/N) |X[0]|²     for k = 0 (DC)
         ⎩ (1/N) |X[N/2]|²   for k = N/2 (Nyquist)
```

**Frequency axis:**
```
f[k] = k·fs/N    for k = 0, 1, ..., N-1    (two-sided)
f[k] = k·fs/N    for k = 0, 1, ..., N/2    (one-sided)

where fs = sampling frequency
```

### Algorithm: Periodogram with Windowing

```typescript
interface PeriodogramResult {
  power: Float64Array;      // Power spectral density
  frequencies: Float64Array; // Frequency bins
  onesided: boolean;         // One-sided or two-sided
}

function periodogram(
  signal: Float64Array,
  sampleRate: number = 1.0,
  window: 'hann' | 'hamming' | 'blackman' | 'boxcar' | Float64Array = 'hann',
  onesided: boolean = true,
  scaling: 'density' | 'spectrum' = 'density'
): PeriodogramResult {
  const N = signal.length;

  // Generate or use provided window
  let w: Float64Array;
  if (typeof window === 'string') {
    switch (window) {
      case 'hann': w = hannWindow(N, false); break;
      case 'hamming': w = hammingWindow(N, false); break;
      case 'blackman': w = blackmanWindow(N, false); break;
      case 'boxcar': w = boxcarWindow(N); break;
      default: w = hannWindow(N, false);
    }
  } else {
    w = window;
  }

  // Apply window
  const windowed = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    windowed[i] = signal[i] * w[i];
  }

  // Compute FFT
  const fftResult = fft(windowed);  // Returns complex array

  // Compute window normalization factors
  let S1 = 0, S2 = 0;  // S1 = Σw[n], S2 = Σw²[n]
  for (let i = 0; i < N; i++) {
    S1 += w[i];
    S2 += w[i] * w[i];
  }

  // Normalization factor
  const norm = scaling === 'density' ? (sampleRate * S2) : (S1 * S1);

  // Compute power (magnitude squared)
  const powerFull = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    const real = fftResult[2 * k];
    const imag = fftResult[2 * k + 1];
    powerFull[k] = (real * real + imag * imag) / norm;
  }

  // One-sided or two-sided
  let power: Float64Array;
  let frequencies: Float64Array;

  if (onesided && N % 2 === 0) {
    // One-sided: keep DC, positive frequencies, and Nyquist
    const nFreqs = N / 2 + 1;
    power = new Float64Array(nFreqs);
    frequencies = new Float64Array(nFreqs);

    // DC component
    power[0] = powerFull[0];
    frequencies[0] = 0;

    // Positive frequencies (multiply by 2 to account for negative freqs)
    for (let k = 1; k < nFreqs - 1; k++) {
      power[k] = 2 * powerFull[k];
      frequencies[k] = k * sampleRate / N;
    }

    // Nyquist frequency
    power[nFreqs - 1] = powerFull[N / 2];
    frequencies[nFreqs - 1] = sampleRate / 2;
  } else {
    // Two-sided
    power = powerFull;
    frequencies = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      frequencies[k] = k * sampleRate / N;
    }
  }

  return { power, frequencies, onesided };
}
```

### Detrending (Remove DC or Linear Trend)

```typescript
type DetrendType = 'none' | 'constant' | 'linear';

function detrend(signal: Float64Array, type: DetrendType = 'none'): Float64Array {
  const N = signal.length;
  const detrended = new Float64Array(N);

  if (type === 'none') {
    return signal;
  }

  if (type === 'constant') {
    // Remove mean (DC component)
    let mean = 0;
    for (let i = 0; i < N; i++) {
      mean += signal[i];
    }
    mean /= N;

    for (let i = 0; i < N; i++) {
      detrended[i] = signal[i] - mean;
    }

    return detrended;
  }

  if (type === 'linear') {
    // Remove linear trend via least squares
    // Fit: y = a + b*x, remove trend

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < N; i++) {
      sumX += i;
      sumY += signal[i];
      sumXY += i * signal[i];
      sumX2 += i * i;
    }

    const denominator = N * sumX2 - sumX * sumX;
    const a = (sumX2 * sumY - sumX * sumXY) / denominator;
    const b = (N * sumXY - sumX * sumY) / denominator;

    for (let i = 0; i < N; i++) {
      detrended[i] = signal[i] - (a + b * i);
    }

    return detrended;
  }

  return signal;
}
```

### Power Spectral Density Units

```typescript
// Convert between different PSD representations
function convertPSD(
  psd: Float64Array,
  fromUnit: 'V^2/Hz' | 'V^2' | 'dB',
  toUnit: 'V^2/Hz' | 'V^2' | 'dB',
  deltaF: number = 1.0
): Float64Array {
  const N = psd.length;
  const result = new Float64Array(N);

  // Convert to linear V^2/Hz first
  let linear: Float64Array;

  if (fromUnit === 'dB') {
    linear = psd.map(p => Math.pow(10, p / 10));
  } else if (fromUnit === 'V^2') {
    linear = psd.map(p => p / deltaF);
  } else {
    linear = psd;
  }

  // Convert to target unit
  if (toUnit === 'dB') {
    for (let i = 0; i < N; i++) {
      result[i] = 10 * Math.log10(linear[i]);
    }
  } else if (toUnit === 'V^2') {
    for (let i = 0; i < N; i++) {
      result[i] = linear[i] * deltaF;
    }
  } else {
    return linear;
  }

  return result;
}
```

**Complexity**: O(N log N) dominated by FFT

---

## 7. Welch's Method

**Goal**: Improved PSD estimation via segment averaging with overlap

### Mathematical Background

Welch's method reduces variance in the periodogram estimate:
1. Divide signal into L overlapping segments of length M
2. Window each segment
3. Compute periodogram of each segment
4. Average the periodograms

**Variance reduction:** Var(P_welch) ≈ Var(P_periodogram) / L_eff

where L_eff depends on overlap (typically L_eff ≈ L for 50% overlap)

### Algorithm: Welch's Method

```typescript
interface WelchResult {
  power: Float64Array;
  frequencies: Float64Array;
  onesided: boolean;
}

function welch(
  signal: Float64Array,
  sampleRate: number = 1.0,
  options: {
    nperseg?: number;        // Segment length (default: 256)
    noverlap?: number;       // Overlap samples (default: nperseg/2)
    nfft?: number;           // FFT length (default: nperseg)
    window?: 'hann' | 'hamming' | 'blackman' | Float64Array;
    onesided?: boolean;
    scaling?: 'density' | 'spectrum';
    detrend?: DetrendType;
  } = {}
): WelchResult {
  const N = signal.length;

  // Default parameters
  const nperseg = options.nperseg ?? Math.min(256, N);
  const noverlap = options.noverlap ?? Math.floor(nperseg / 2);
  const nfft = options.nfft ?? nperseg;
  const windowType = options.window ?? 'hann';
  const onesided = options.onesided ?? true;
  const scaling = options.scaling ?? 'density';
  const detrendType = options.detrend ?? 'constant';

  // Generate window
  let w: Float64Array;
  if (typeof windowType === 'string') {
    switch (windowType) {
      case 'hann': w = hannWindow(nperseg, false); break;
      case 'hamming': w = hammingWindow(nperseg, false); break;
      case 'blackman': w = blackmanWindow(nperseg, false); break;
      default: w = hannWindow(nperseg, false);
    }
  } else {
    w = windowType;
  }

  // Compute window normalization
  let S1 = 0, S2 = 0;
  for (let i = 0; i < nperseg; i++) {
    S1 += w[i];
    S2 += w[i] * w[i];
  }

  const scale = scaling === 'density' ? (sampleRate * S2) : (S1 * S1);

  // Compute number of segments
  const step = nperseg - noverlap;
  const numSegments = Math.floor((N - noverlap) / step);

  if (numSegments < 1) {
    throw new Error('Signal too short for Welch method with given parameters');
  }

  // Initialize accumulator
  const nFreqs = onesided ? Math.floor(nfft / 2) + 1 : nfft;
  const powerSum = new Float64Array(nFreqs);

  // Process each segment
  for (let segIdx = 0; segIdx < numSegments; segIdx++) {
    const startIdx = segIdx * step;

    // Extract and detrend segment
    const segment = signal.slice(startIdx, startIdx + nperseg);
    const detrendedSegment = detrend(segment, detrendType);

    // Apply window
    const windowed = new Float64Array(nperseg);
    for (let i = 0; i < nperseg; i++) {
      windowed[i] = detrendedSegment[i] * w[i];
    }

    // Zero-pad if nfft > nperseg
    const padded = new Float64Array(nfft);
    padded.set(windowed);

    // Compute FFT
    const fftResult = fft(padded);

    // Accumulate power
    if (onesided) {
      // DC
      const real0 = fftResult[0];
      const imag0 = fftResult[1];
      powerSum[0] += (real0 * real0 + imag0 * imag0) / scale;

      // Positive frequencies (multiply by 2)
      for (let k = 1; k < nFreqs - 1; k++) {
        const real = fftResult[2 * k];
        const imag = fftResult[2 * k + 1];
        powerSum[k] += 2 * (real * real + imag * imag) / scale;
      }

      // Nyquist (if nfft is even)
      if (nfft % 2 === 0) {
        const kNyq = nfft / 2;
        const realN = fftResult[2 * kNyq];
        const imagN = fftResult[2 * kNyq + 1];
        powerSum[nFreqs - 1] += (realN * realN + imagN * imagN) / scale;
      }
    } else {
      // Two-sided
      for (let k = 0; k < nfft; k++) {
        const real = fftResult[2 * k];
        const imag = fftResult[2 * k + 1];
        powerSum[k] += (real * real + imag * imag) / scale;
      }
    }
  }

  // Average over segments
  const power = powerSum.map(p => p / numSegments);

  // Generate frequency axis
  const frequencies = new Float64Array(nFreqs);
  if (onesided) {
    for (let k = 0; k < nFreqs; k++) {
      frequencies[k] = k * sampleRate / nfft;
    }
  } else {
    for (let k = 0; k < nfft; k++) {
      frequencies[k] = k * sampleRate / nfft;
    }
  }

  return { power, frequencies, onesided };
}
```

### Overlap Considerations

```typescript
// Compute effective number of independent segments
function effectiveSegments(
  signalLength: number,
  nperseg: number,
  noverlap: number,
  window: Float64Array
): number {
  const step = nperseg - noverlap;
  const L = Math.floor((signalLength - noverlap) / step);

  // Compute overlap correlation coefficient
  let sumProduct = 0;
  let sumSquares = 0;

  for (let i = 0; i < noverlap; i++) {
    sumProduct += window[i] * window[i + step];
    sumSquares += window[i] * window[i];
  }

  const rho = sumProduct / sumSquares;

  // Effective number of segments (accounting for overlap correlation)
  // L_eff ≈ L / (1 + 2Σρⁱ) for i=1..∞
  // Approximation: L_eff ≈ L(1 - ρ)/(1 + ρ)
  const L_eff = L * (1 - rho) / (1 + rho);

  return L_eff;
}
```

### Optimal Parameters for Welch's Method

```typescript
function optimalWelchParams(
  signalLength: number,
  sampleRate: number,
  desiredFreqResolution: number,
  desiredVarianceReduction: number = 4
): {
  nperseg: number;
  noverlap: number;
  nfft: number;
} {
  // Frequency resolution determines segment length
  // Δf = fs / nperseg
  const nperseg = Math.pow(2, Math.ceil(Math.log2(sampleRate / desiredFreqResolution)));

  // 50% overlap is standard (good trade-off)
  const noverlap = Math.floor(nperseg / 2);

  // nfft can be larger for better frequency interpolation
  const nfft = nperseg;  // Or next power of 2: Math.pow(2, Math.ceil(Math.log2(nperseg)))

  // Check if we get enough segments
  const step = nperseg - noverlap;
  const numSegments = Math.floor((signalLength - noverlap) / step);

  if (numSegments < desiredVarianceReduction) {
    console.warn(
      `Only ${numSegments} segments available, ` +
      `less than desired variance reduction of ${desiredVarianceReduction}`
    );
  }

  return { nperseg, noverlap, nfft };
}
```

**Complexity**: O(L · M log M) where L = number of segments, M = segment length

---

## 8. Short-Time Fourier Transform (STFT)

**Goal**: Time-frequency representation via sliding window FFT

### Mathematical Background

The STFT provides time-localized frequency information:
```
STFT{x[n]}(m, k) = Σ_{n=0}^{N-1} x[n] · w[n - m·H] · e^{-j2πkn/N}

where:
  m = frame index (time)
  k = frequency bin
  H = hop size (step between frames)
  w[n] = window function
```

**Relationship to spectrograms:**
```
Spectrogram(m, k) = |STFT(m, k)|²
```

### Algorithm: STFT

```typescript
interface STFTResult {
  stft: Float64Array;        // Complex STFT [real, imag, real, imag, ...]
  times: Float64Array;       // Time axis (frame centers)
  frequencies: Float64Array; // Frequency axis
  shape: {                   // Output dimensions
    frames: number;
    freqs: number;
  };
}

function stft(
  signal: Float64Array,
  sampleRate: number = 1.0,
  options: {
    nperseg?: number;        // Window length (default: 256)
    noverlap?: number;       // Overlap (default: nperseg/2)
    nfft?: number;           // FFT length (default: nperseg)
    window?: 'hann' | 'hamming' | 'blackman' | Float64Array;
    onesided?: boolean;
    padded?: boolean;        // Zero-pad signal at boundaries
  } = {}
): STFTResult {
  const N = signal.length;

  // Default parameters
  const nperseg = options.nperseg ?? 256;
  const noverlap = options.noverlap ?? Math.floor(nperseg / 2);
  const nfft = options.nfft ?? nperseg;
  const windowType = options.window ?? 'hann';
  const onesided = options.onesided ?? true;
  const padded = options.padded ?? true;

  // Generate window
  let w: Float64Array;
  if (typeof windowType === 'string') {
    switch (windowType) {
      case 'hann': w = hannWindow(nperseg, false); break;
      case 'hamming': w = hammingWindow(nperseg, false); break;
      case 'blackman': w = blackmanWindow(nperseg, false); break;
      default: w = hannWindow(nperseg, false);
    }
  } else {
    w = windowType;
  }

  const hopSize = nperseg - noverlap;

  // Compute number of frames
  let numFrames: number;
  let paddedSignal: Float64Array;

  if (padded) {
    // Pad signal to center first and last frames
    const padLength = Math.floor(nperseg / 2);
    paddedSignal = new Float64Array(N + 2 * padLength);
    paddedSignal.set(signal, padLength);

    numFrames = Math.floor((paddedSignal.length - nperseg) / hopSize) + 1;
  } else {
    paddedSignal = signal;
    numFrames = Math.floor((N - nperseg) / hopSize) + 1;
  }

  // Frequency dimension
  const nFreqs = onesided ? Math.floor(nfft / 2) + 1 : nfft;

  // Allocate output (complex array: [re, im, re, im, ...])
  const stftData = new Float64Array(numFrames * nFreqs * 2);

  // Process each frame
  for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
    const startIdx = frameIdx * hopSize;

    // Extract frame
    const frame = new Float64Array(nperseg);
    for (let i = 0; i < nperseg; i++) {
      if (startIdx + i < paddedSignal.length) {
        frame[i] = paddedSignal[startIdx + i] * w[i];
      }
    }

    // Zero-pad if needed
    const fftInput = new Float64Array(nfft);
    fftInput.set(frame);

    // Compute FFT
    const fftResult = fft(fftInput);

    // Store result
    if (onesided) {
      // Store only positive frequencies
      for (let k = 0; k < nFreqs; k++) {
        const outIdx = (frameIdx * nFreqs + k) * 2;
        stftData[outIdx] = fftResult[2 * k];      // Real
        stftData[outIdx + 1] = fftResult[2 * k + 1];  // Imag
      }
    } else {
      // Store all frequencies
      for (let k = 0; k < nfft; k++) {
        const outIdx = (frameIdx * nfft + k) * 2;
        stftData[outIdx] = fftResult[2 * k];
        stftData[outIdx + 1] = fftResult[2 * k + 1];
      }
    }
  }

  // Generate time axis (frame centers in samples)
  const times = new Float64Array(numFrames);
  for (let m = 0; m < numFrames; m++) {
    times[m] = (m * hopSize + nperseg / 2) / sampleRate;
  }

  // Generate frequency axis
  const frequencies = new Float64Array(nFreqs);
  for (let k = 0; k < nFreqs; k++) {
    frequencies[k] = k * sampleRate / nfft;
  }

  return {
    stft: stftData,
    times,
    frequencies,
    shape: { frames: numFrames, freqs: nFreqs }
  };
}
```

### Inverse STFT (Overlap-Add Reconstruction)

```typescript
function istft(
  stftData: Float64Array,
  shape: { frames: number; freqs: number },
  sampleRate: number = 1.0,
  options: {
    nperseg?: number;
    noverlap?: number;
    nfft?: number;
    window?: 'hann' | 'hamming' | 'blackman' | Float64Array;
    onesided?: boolean;
  } = {}
): Float64Array {
  const { frames: numFrames, freqs: nFreqs } = shape;

  const nperseg = options.nperseg ?? 256;
  const noverlap = options.noverlap ?? Math.floor(nperseg / 2);
  const nfft = options.nfft ?? nperseg;
  const windowType = options.window ?? 'hann';
  const onesided = options.onesided ?? true;

  const hopSize = nperseg - noverlap;

  // Generate window
  let w: Float64Array;
  if (typeof windowType === 'string') {
    switch (windowType) {
      case 'hann': w = hannWindow(nperseg, false); break;
      case 'hamming': w = hammingWindow(nperseg, false); break;
      case 'blackman': w = blackmanWindow(nperseg, false); break;
      default: w = hannWindow(nperseg, false);
    }
  } else {
    w = windowType;
  }

  // Estimate output length
  const outputLength = (numFrames - 1) * hopSize + nperseg;
  const output = new Float64Array(outputLength);
  const windowSum = new Float64Array(outputLength);

  // Process each frame
  for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
    // Prepare FFT input (complex)
    const fftInput = new Float64Array(nfft * 2);

    if (onesided) {
      // Reconstruct full spectrum from one-sided
      for (let k = 0; k < nFreqs; k++) {
        const inIdx = (frameIdx * nFreqs + k) * 2;
        fftInput[2 * k] = stftData[inIdx];          // Real
        fftInput[2 * k + 1] = stftData[inIdx + 1];  // Imag
      }

      // Mirror for negative frequencies (conjugate symmetry)
      for (let k = 1; k < nFreqs - 1; k++) {
        const kNeg = nfft - k;
        fftInput[2 * kNeg] = fftInput[2 * k];       // Real
        fftInput[2 * kNeg + 1] = -fftInput[2 * k + 1];  // -Imag
      }
    } else {
      // Use full spectrum directly
      for (let k = 0; k < nfft; k++) {
        const inIdx = (frameIdx * nfft + k) * 2;
        fftInput[2 * k] = stftData[inIdx];
        fftInput[2 * k + 1] = stftData[inIdx + 1];
      }
    }

    // Inverse FFT
    const frameData = ifft(fftInput);

    // Overlap-add with windowing
    const startIdx = frameIdx * hopSize;
    for (let i = 0; i < nperseg && startIdx + i < outputLength; i++) {
      output[startIdx + i] += frameData[i] * w[i];
      windowSum[startIdx + i] += w[i] * w[i];
    }
  }

  // Normalize by window sum (accounts for overlap)
  for (let i = 0; i < outputLength; i++) {
    if (windowSum[i] > 1e-10) {
      output[i] /= windowSum[i];
    }
  }

  return output;
}
```

### Spectrogram (Magnitude-Squared STFT)

```typescript
function spectrogram(
  signal: Float64Array,
  sampleRate: number = 1.0,
  options: {
    nperseg?: number;
    noverlap?: number;
    nfft?: number;
    window?: 'hann' | 'hamming' | 'blackman' | Float64Array;
    scaling?: 'density' | 'spectrum';
    mode?: 'magnitude' | 'psd';
  } = {}
): {
  spectrogram: Float64Array;  // 2D array (frames × freqs)
  times: Float64Array;
  frequencies: Float64Array;
  shape: { frames: number; freqs: number };
} {
  const scaling = options.scaling ?? 'density';
  const mode = options.mode ?? 'psd';

  // Compute STFT
  const { stft: stftData, times, frequencies, shape } = stft(signal, sampleRate, options);

  const { frames, freqs } = shape;
  const specData = new Float64Array(frames * freqs);

  // Compute magnitude or power
  for (let m = 0; m < frames; m++) {
    for (let k = 0; k < freqs; k++) {
      const idx = (m * freqs + k) * 2;
      const real = stftData[idx];
      const imag = stftData[idx + 1];
      const magSq = real * real + imag * imag;

      if (mode === 'magnitude') {
        specData[m * freqs + k] = Math.sqrt(magSq);
      } else {
        specData[m * freqs + k] = magSq;
      }
    }
  }

  return {
    spectrogram: specData,
    times,
    frequencies,
    shape
  };
}
```

### Time-Frequency Resolution Trade-off

```typescript
// Compute time and frequency resolution for given parameters
function stftResolution(
  nperseg: number,
  sampleRate: number,
  windowType: 'hann' | 'hamming' | 'blackman' = 'hann'
): {
  timeResolution: number;      // seconds
  frequencyResolution: number;  // Hz
  effectiveNEBW: number;        // Normalized equivalent noise bandwidth
} {
  // Frequency resolution
  const frequencyResolution = sampleRate / nperseg;

  // Time resolution (depends on window width)
  const timeResolution = nperseg / sampleRate;

  // Effective NEBW (window-dependent)
  const enbwFactors = {
    hann: 1.5,
    hamming: 1.36,
    blackman: 1.73
  };

  const effectiveNEBW = enbwFactors[windowType];

  return {
    timeResolution,
    frequencyResolution,
    effectiveNEBW
  };
}

// Uncertainty principle: Δt · Δf ≥ 1/(4π)
// In practice: Δt · Δf ≈ ENBW / (2π) for windowed STFT
```

### WASM Optimized STFT

```typescript
// High-performance STFT with WASM FFT
export function stftWASM(
  signal: Float64Array,
  nperseg: i32,
  hopSize: i32,
  window: Float64Array,
  outputReal: Float64Array,
  outputImag: Float64Array
): void {
  const N = signal.length;
  const numFrames = (N - nperseg) / hopSize + 1;
  const nfft = nperseg;  // Assume power of 2

  const frame = new Float64Array(nfft);
  const fftOut = new Float64Array(nfft * 2);

  for (let m = 0; m < numFrames; m++) {
    const startIdx = m * hopSize;

    // Windowed frame extraction
    for (let i = 0; i < nperseg; i++) {
      frame[i] = signal[startIdx + i] * window[i];
    }

    // FFT (in-place WASM FFT)
    fftInPlace(frame, fftOut, nfft);

    // Store result
    for (let k = 0; k < nfft; k++) {
      outputReal[m * nfft + k] = fftOut[2 * k];
      outputImag[m * nfft + k] = fftOut[2 * k + 1];
    }
  }
}
```

**Complexity**: O(M · N/H · log N) where M = number of frames, N = FFT size, H = hop size

---

## Implementation Checklist

### For Each Window Function

- [ ] Implement symmetric and periodic variants
- [ ] Handle edge cases (N=1, N=2, very large N)
- [ ] Provide energy normalization option
- [ ] Document spectral properties in JSDoc
- [ ] Unit tests with known window values
- [ ] WASM optimization for N > 1024
- [ ] TypeScript type definitions

### For Spectral Analysis Functions

- [ ] Validate input signal (length, NaN, Inf)
- [ ] Implement both one-sided and two-sided options
- [ ] Proper window normalization (S1, S2 factors)
- [ ] Detrending options (none, constant, linear)
- [ ] Frequency axis computation with correct scaling
- [ ] Edge case handling (empty signal, single point)
- [ ] Memory-efficient implementations for large signals
- [ ] WASM acceleration for FFT-heavy operations
- [ ] Comprehensive unit tests
- [ ] Performance benchmarks vs NumPy/SciPy

### Numerical Verification

```typescript
function testWindowProperties(window: Float64Array, expectedENBW: number): boolean {
  const N = window.length;

  // Test 1: Symmetry
  let isSymmetric = true;
  for (let i = 0; i < N / 2; i++) {
    if (Math.abs(window[i] - window[N - 1 - i]) > 1e-12) {
      isSymmetric = false;
      break;
    }
  }

  // Test 2: Peak value at center
  const maxIdx = window.indexOf(Math.max(...Array.from(window)));
  const isPeakAtCenter = Math.abs(maxIdx - (N - 1) / 2) < 1;

  // Test 3: ENBW calculation
  let S1 = 0, S2 = 0;
  for (let i = 0; i < N; i++) {
    S1 += window[i];
    S2 += window[i] * window[i];
  }
  const enbw = N * S2 / (S1 * S1);
  const enbwError = Math.abs(enbw - expectedENBW) / expectedENBW;

  console.log(`Window test: symmetric=${isSymmetric}, peak=${isPeakAtCenter}, ENBW error=${enbwError}`);

  return isSymmetric && isPeakAtCenter && enbwError < 0.01;
}
```

---

## References

- **Harris, F.J.** (1978). *On the use of windows for harmonic analysis with the discrete Fourier transform*. Proceedings of the IEEE, 66(1), 51-83.
- **Welch, P.** (1967). *The use of fast Fourier transform for the estimation of power spectra*. IEEE Trans. Audio Electroacoustics, 15(2), 70-73.
- **Oppenheim & Schafer**: *Discrete-Time Signal Processing* (3rd ed.), Chapter 10
- **Stoica & Moses**: *Spectral Analysis of Signals*, Chapters 2-3
- **SciPy Signal Processing**: Reference implementation for `scipy.signal.windows`, `scipy.signal.welch`, `scipy.signal.stft`
- **MATLAB Signal Processing Toolbox**: Window design and spectral analysis functions

---

## Performance Targets (WASM)

| Operation | Size | JS Time | WASM Time | Speedup |
|-----------|------|---------|-----------|---------|
| Hann window | 1M | ~5ms | ~1ms | 5x |
| Kaiser window (β=6) | 100K | ~80ms | ~15ms | 5.3x |
| Periodogram (FFT) | 1M | ~120ms | ~25ms | 4.8x |
| Welch (8 segments) | 1M | ~180ms | ~40ms | 4.5x |
| STFT (256 frames) | 100K | ~350ms | ~80ms | 4.4x |
| Spectrogram | 100K | ~400ms | ~90ms | 4.4x |

*Estimated on modern CPU with WASM SIMD; actual performance depends on FFT implementation*

---

## Advanced Topics

### Constant-Q Transform (CQT)
- Logarithmic frequency resolution (musical applications)
- Variable window lengths per frequency bin
- Better time resolution at high frequencies

### Gabor Transform
- Gaussian window for optimal time-frequency localization
- Minimizes uncertainty principle: Δt·Δf = 1/(4π)

### Multitaper Method
- Multiple orthogonal windows (Slepian sequences)
- Reduces variance without averaging
- Better for short signals or transient analysis

### Wavelet Transforms
- Alternative to STFT with adaptive time-frequency resolution
- Better for analyzing transients and non-stationary signals
- Continuous Wavelet Transform (CWT) vs Discrete Wavelet Transform (DWT)
