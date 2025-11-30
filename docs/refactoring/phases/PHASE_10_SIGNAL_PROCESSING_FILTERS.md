# Phase 10: Signal Processing Filters - Detailed Implementation Guide

**Status**: Planning Phase
**Sprint**: 10
**Tasks**: 10
**Focus**: Digital filter design, implementation, and transformation

## Overview

This phase implements comprehensive digital signal processing filters including IIR (Infinite Impulse Response) and FIR (Finite Impulse Response) filter design algorithms. These implementations provide MATLAB-compatible filter design with high numerical accuracy and performance optimization.

---

## Task 1: Butterworth Filter

### Mathematical Foundation

The Butterworth filter provides maximally flat magnitude response in the passband with no ripple. It's characterized by monotonic decrease from passband to stopband.

#### Analog Prototype Transfer Function

For a normalized lowpass Butterworth filter of order `n`:

```
|H(jω)|² = 1 / (1 + ω^(2n))

H(s) = 1 / ∏(k=1 to n) (s - s_k)
```

Where poles are located at:

```
s_k = e^(jπ(2k + n - 1)/(2n))  for k = 1, 2, ..., n
```

Only left-half plane poles are used for stability.

#### Bilinear Transform

Convert analog filter to digital using bilinear transformation:

```
s = (2/T) * (z - 1)/(z + 1)

where T = sampling period (typically normalized to 2)
```

Frequency warping relation:

```
ω_analog = (2/T) * tan(ω_digital * T/2)
```

#### Filter Type Transformations

**Lowpass to Highpass**:
```
s → ω_c / s
```

**Lowpass to Bandpass**:
```
s → (s² + ω_0²) / (s * BW)

where:
  ω_0 = √(ω_low * ω_high)  (center frequency)
  BW = ω_high - ω_low       (bandwidth)
```

**Lowpass to Bandstop**:
```
s → (s * BW) / (s² + ω_0²)
```

### Algorithm

```
Algorithm: ButterFilter(order, cutoff, type, fs)
Input:
  - order: Filter order (n)
  - cutoff: Cutoff frequency/frequencies
  - type: 'low', 'high', 'bandpass', 'stop'
  - fs: Sampling frequency (optional)

Output:
  - b: Numerator coefficients
  - a: Denominator coefficients

Steps:
1. Normalize cutoff frequencies:
   ω_c = cutoff / (fs/2)  // Normalize to Nyquist frequency

2. Prewarp frequencies for bilinear transform:
   ω_analog = 2 * tan(π * ω_c / 2)

3. Design analog prototype:
   For k = 1 to n:
     θ_k = π * (2k + n - 1) / (2n)
     s_k = -sin(θ_k) + j*cos(θ_k)  // Left-half plane poles

4. Apply frequency transformation:
   If type == 'low':
     poles_transformed = ω_analog * poles

   If type == 'high':
     poles_transformed = ω_analog ./ poles

   If type == 'bandpass':
     For each pole p:
       α = p * BW / 2
       β = √(α² - ω_0²)
       p_new1 = -α + β
       p_new2 = -α - β

   If type == 'stop':
     Similar to bandpass with reciprocal transformation

5. Apply bilinear transform:
   For each pole p_analog:
     p_digital = (2 + p_analog*T) / (2 - p_analog*T)

6. Convert poles/zeros to transfer function:
   [b, a] = zpk2tf(zeros, poles, gain)

7. Return [b, a]
```

### Pseudocode

```typescript
function butter(order: number, cutoff: number | [number, number],
                type: 'low' | 'high' | 'bandpass' | 'stop' = 'low',
                fs: number = 2): [number[], number[]] {

  // Step 1: Normalize cutoff frequencies
  const nyquist = fs / 2;
  let wc: number | [number, number];

  if (Array.isArray(cutoff)) {
    wc = [cutoff[0] / nyquist, cutoff[1] / nyquist];
  } else {
    wc = cutoff / nyquist;
  }

  // Step 2: Design analog prototype poles
  const poles: Complex[] = [];
  for (let k = 1; k <= order; k++) {
    const theta = Math.PI * (2*k + order - 1) / (2 * order);
    const real = -Math.sin(theta);
    const imag = Math.cos(theta);
    poles.push(new Complex(real, imag));
  }

  // Step 3: Prewarp for bilinear transform
  let wa: number | [number, number];
  if (Array.isArray(wc)) {
    wa = [2 * Math.tan(Math.PI * wc[0] / 2),
          2 * Math.tan(Math.PI * wc[1] / 2)];
  } else {
    wa = 2 * Math.tan(Math.PI * wc / 2);
  }

  // Step 4: Apply frequency transformation
  let transformedPoles: Complex[];
  let zeros: Complex[] = [];
  let gain: number;

  switch (type) {
    case 'low':
      transformedPoles = poles.map(p => p.mul(wa as number));
      gain = 1;
      break;

    case 'high':
      transformedPoles = poles.map(p => (wa as number / p.re));
      zeros = Array(order).fill(new Complex(0, 0));
      gain = 1;
      break;

    case 'bandpass':
      const w0 = Math.sqrt(wa[0] * wa[1]);
      const bw = wa[1] - wa[0];
      transformedPoles = [];

      for (const p of poles) {
        const alpha = p.mul(bw / 2);
        const beta = alpha.mul(alpha).sub(w0 * w0).sqrt();
        transformedPoles.push(alpha.neg().add(beta));
        transformedPoles.push(alpha.neg().sub(beta));
      }

      zeros = Array(order).fill(new Complex(0, 0));
      gain = 1;
      break;

    case 'stop':
      // Similar to bandpass with reciprocal
      const w0_stop = Math.sqrt(wa[0] * wa[1]);
      const bw_stop = wa[1] - wa[0];
      transformedPoles = [];

      for (const p of poles) {
        const alpha = bw_stop / (2 * p);
        const beta = alpha.mul(alpha).sub(w0_stop * w0_stop).sqrt();
        transformedPoles.push(alpha.neg().add(beta));
        transformedPoles.push(alpha.neg().sub(beta));
      }

      // Zeros at ±jw0
      for (let i = 0; i < order; i++) {
        zeros.push(new Complex(0, w0_stop));
        zeros.push(new Complex(0, -w0_stop));
      }
      gain = 1;
      break;
  }

  // Step 5: Bilinear transform s -> (2/T)(z-1)/(z+1)
  const T = 2;  // Normalized
  const digitalPoles: Complex[] = [];
  const digitalZeros: Complex[] = [];

  for (const p of transformedPoles) {
    const numerator = new Complex(2, 0).add(p.mul(T));
    const denominator = new Complex(2, 0).sub(p.mul(T));
    digitalPoles.push(numerator.div(denominator));
  }

  for (const z of zeros) {
    if (z.re === 0 && z.im === 0) {
      digitalZeros.push(new Complex(-1, 0));  // s=0 -> z=-1
    } else {
      const numerator = new Complex(2, 0).add(z.mul(T));
      const denominator = new Complex(2, 0).sub(z.mul(T));
      digitalZeros.push(numerator.div(denominator));
    }
  }

  // Step 6: Convert to transfer function coefficients
  const [b, a] = zpk2tf(digitalZeros, digitalPoles, gain);

  return [b, a];
}
```

### Transfer Function Formulas

**Nth-order Butterworth polynomial**:
```
B_n(ω) = ∏(k=1 to n) (s - s_k)

where s_k are the left-half plane poles
```

**Digital transfer function**:
```
           b_0 + b_1*z^(-1) + ... + b_M*z^(-M)
H(z) = K * ────────────────────────────────────
           a_0 + a_1*z^(-1) + ... + a_N*z^(-N)
```

**Magnitude response**:
```
|H(e^(jω))|² = 1 / (1 + ε² * |B_n(jω)|²)

where ε controls passband ripple (ε=1 for Butterworth)
```

---

## Task 2: Chebyshev Type I Filter

### Mathematical Foundation

Chebyshev Type I filters have equiripple behavior in the passband and monotonic decrease in the stopband. They provide sharper rolloff than Butterworth for the same order.

#### Chebyshev Polynomial

```
T_n(x) = cos(n * arccos(x))        for |x| ≤ 1
T_n(x) = cosh(n * arccosh(x))      for |x| > 1

Recurrence relation:
T_0(x) = 1
T_1(x) = x
T_n(x) = 2x*T_(n-1)(x) - T_(n-2)(x)
```

#### Analog Transfer Function

```
|H(jω)|² = 1 / (1 + ε² * T_n²(ω/ω_c))

where:
  ε = ripple factor = √(10^(R_p/10) - 1)
  R_p = passband ripple in dB
  T_n = nth-order Chebyshev polynomial
```

#### Pole Locations

Poles lie on an ellipse in the s-plane:

```
s_k = σ_k + jω_k

σ_k = -ω_c * sinh(β) * sin(θ_k)
ω_k = ω_c * cosh(β) * cos(θ_k)

where:
  θ_k = π(2k - 1)/(2n)  for k = 1, 2, ..., n
  β = (1/n) * asinh(1/ε)
```

### Algorithm

```
Algorithm: ChebyshevType1(order, ripple, cutoff, type, fs)
Input:
  - order: Filter order (n)
  - ripple: Passband ripple in dB (R_p)
  - cutoff: Cutoff frequency/frequencies
  - type: 'low', 'high', 'bandpass', 'stop'
  - fs: Sampling frequency

Output:
  - b: Numerator coefficients
  - a: Denominator coefficients

Steps:
1. Calculate ripple factor:
   ε = √(10^(R_p/10) - 1)

2. Calculate pole parameters:
   β = (1/n) * asinh(1/ε)
   sinh_beta = sinh(β)
   cosh_beta = cosh(β)

3. Normalize cutoff:
   ω_c = cutoff / (fs/2)
   ω_analog = 2 * tan(π * ω_c / 2)

4. Calculate analog poles:
   For k = 1 to n:
     θ_k = π * (2k - 1) / (2n)
     σ_k = -ω_analog * sinh_beta * sin(θ_k)
     ω_k = ω_analog * cosh_beta * cos(θ_k)
     s_k = σ_k + j*ω_k

5. Type I has no finite zeros (all zeros at infinity for lowpass)
   zeros = []

6. Calculate gain:
   If n is odd:
     gain = 1
   Else:
     gain = 1 / √(1 + ε²)

7. Apply frequency transformation (same as Butterworth)

8. Apply bilinear transform

9. Convert to transfer function

10. Return [b, a]
```

### Pseudocode

```typescript
function cheby1(order: number, ripple: number,
                cutoff: number | [number, number],
                type: 'low' | 'high' | 'bandpass' | 'stop' = 'low',
                fs: number = 2): [number[], number[]] {

  // Step 1: Calculate ripple factor
  const epsilon = Math.sqrt(Math.pow(10, ripple / 10) - 1);

  // Step 2: Calculate pole parameters
  const beta = Math.asinh(1 / epsilon) / order;
  const sinh_beta = Math.sinh(beta);
  const cosh_beta = Math.cosh(beta);

  // Step 3: Normalize cutoff
  const nyquist = fs / 2;
  const wc = Array.isArray(cutoff)
    ? [cutoff[0] / nyquist, cutoff[1] / nyquist]
    : cutoff / nyquist;

  const wa = Array.isArray(wc)
    ? [2 * Math.tan(Math.PI * wc[0] / 2),
       2 * Math.tan(Math.PI * wc[1] / 2)]
    : 2 * Math.tan(Math.PI * wc / 2);

  // Step 4: Calculate analog poles on ellipse
  const poles: Complex[] = [];
  for (let k = 1; k <= order; k++) {
    const theta = Math.PI * (2*k - 1) / (2 * order);
    const sigma = -(wa as number) * sinh_beta * Math.sin(theta);
    const omega = (wa as number) * cosh_beta * Math.cos(theta);
    poles.push(new Complex(sigma, omega));
  }

  // Step 5: No finite zeros for Type I lowpass
  let zeros: Complex[] = [];

  // Step 6: Calculate DC gain
  let gain: number;
  if (order % 2 === 1) {
    gain = 1.0;
  } else {
    gain = 1.0 / Math.sqrt(1 + epsilon * epsilon);
  }

  // Step 7-9: Apply transformations (same as Butterworth)
  let transformedPoles: Complex[];
  let transformedZeros: Complex[] = [];

  switch (type) {
    case 'low':
      transformedPoles = poles;
      break;

    case 'high':
      // Lowpass to highpass: s -> wc/s
      transformedPoles = poles.map(p => {
        const wc_num = wa as number;
        return new Complex(
          wc_num * p.re / (p.re * p.re + p.im * p.im),
          -wc_num * p.im / (p.re * p.re + p.im * p.im)
        );
      });
      // Add zeros at origin
      transformedZeros = Array(order).fill(new Complex(0, 0));
      break;

    case 'bandpass':
    case 'stop':
      // Similar transformations as Butterworth
      [transformedPoles, transformedZeros] =
        applyBandTransform(poles, zeros, wa as [number, number], type);
      break;
  }

  // Apply bilinear transform and convert to TF
  const [b, a] = bilinearTransform(transformedZeros, transformedPoles, gain);

  return [b, a];
}
```

### Transfer Function Formulas

**Analog Chebyshev Type I**:
```
         K
H(s) = ────────────────────
       ∏(k=1 to n)(s - s_k)

where K is chosen to give |H(0)| = 1 for n odd
                    or |H(0)| = 1/√(1+ε²) for n even
```

**Magnitude response**:
```
|H(jω)|² = 1 / (1 + ε² * T_n²(ω/ω_c))

Passband ripple: R_p = 10*log₁₀(1 + ε²) dB
```

**Pole ellipse parameters**:
```
Major axis (imaginary): a = ω_c * cosh(β)
Minor axis (real): b = ω_c * sinh(β)
```

---

## Task 3: Chebyshev Type II Filter

### Mathematical Foundation

Chebyshev Type II (inverse Chebyshev) filters have monotonic behavior in the passband and equiripple in the stopband. They have finite zeros, unlike Type I.

#### Transfer Function

```
|H(jω)|² = 1 / (1 + 1/(ε² * T_n²(ω_s/ω)))

where:
  ε = stopband ripple factor
  ω_s = stopband edge frequency
  T_n = Chebyshev polynomial of order n
```

#### Pole and Zero Locations

**Zeros** (on imaginary axis):
```
z_k = j * ω_s / cos(θ_k)

where θ_k = π(2k - 1)/(2n) for k = 1, 2, ..., n
```

**Poles** (obtained by inversion):
```
s_k = 1 / p_k'

where p_k' are the Type I poles with parameters:
  ε' = 1/ε
  ω_c' = ω_s
```

### Algorithm

```
Algorithm: ChebyshevType2(order, stopband_atten, cutoff, type, fs)
Input:
  - order: Filter order (n)
  - stopband_atten: Stopband attenuation in dB (R_s)
  - cutoff: Stopband edge frequency
  - type: 'low', 'high', 'bandpass', 'stop'
  - fs: Sampling frequency

Output:
  - b: Numerator coefficients
  - a: Denominator coefficients

Steps:
1. Calculate stopband ripple factor:
   ε = 1 / √(10^(R_s/10) - 1)

2. Normalize stopband frequency:
   ω_s = cutoff / (fs/2)
   ω_analog = 2 * tan(π * ω_s / 2)

3. Calculate zeros on imaginary axis:
   For k = 1 to floor(n/2):
     θ_k = π * (2k - 1) / (2n)
     z_k = j * ω_analog / cos(θ_k)
     Add conjugate pair: [z_k, z_k*]
   If n is odd:
     Add zero at infinity (or very large value)

4. Calculate Type I poles with inverted epsilon:
   ε' = 1/ε
   β = (1/n) * asinh(ε')

   For k = 1 to n:
     θ_k = π * (2k - 1) / (2n)
     σ_k = -ω_analog * sinh(β) * sin(θ_k)
     ω_k = ω_analog * cosh(β) * cos(θ_k)
     p_k' = σ_k + j*ω_k

5. Invert Type I poles to get Type II poles:
   For each p_k':
     s_k = ω_analog² / p_k'

6. Calculate gain for unity gain at DC:
   gain = |∏ zeros| / |∏ poles| at s = 0

7. Apply frequency transformation

8. Apply bilinear transform

9. Return [b, a]
```

### Pseudocode

```typescript
function cheby2(order: number, stopbandAtten: number,
                cutoff: number | [number, number],
                type: 'low' | 'high' | 'bandpass' | 'stop' = 'low',
                fs: number = 2): [number[], number[]] {

  // Step 1: Calculate stopband ripple factor
  const epsilon = 1.0 / Math.sqrt(Math.pow(10, stopbandAtten / 10) - 1);

  // Step 2: Normalize stopband frequency
  const nyquist = fs / 2;
  const ws = Array.isArray(cutoff)
    ? [cutoff[0] / nyquist, cutoff[1] / nyquist]
    : cutoff / nyquist;

  const wa = Array.isArray(ws)
    ? [2 * Math.tan(Math.PI * ws[0] / 2),
       2 * Math.tan(Math.PI * ws[1] / 2)]
    : 2 * Math.tan(Math.PI * ws / 2);

  const waNum = wa as number;

  // Step 3: Calculate zeros on imaginary axis
  const zeros: Complex[] = [];
  const numZeroPairs = Math.floor(order / 2);

  for (let k = 1; k <= numZeroPairs; k++) {
    const theta = Math.PI * (2*k - 1) / (2 * order);
    const zMag = waNum / Math.cos(theta);
    zeros.push(new Complex(0, zMag));
    zeros.push(new Complex(0, -zMag));
  }

  // If odd order, add zero at infinity (represented as very large number)
  if (order % 2 === 1) {
    // This will be handled in coefficient calculation
  }

  // Step 4: Calculate Type I poles with inverted epsilon
  const epsilonPrime = 1.0 / epsilon;
  const beta = Math.asinh(epsilonPrime) / order;
  const sinh_beta = Math.sinh(beta);
  const cosh_beta = Math.cosh(beta);

  const type1Poles: Complex[] = [];
  for (let k = 1; k <= order; k++) {
    const theta = Math.PI * (2*k - 1) / (2 * order);
    const sigma = -waNum * sinh_beta * Math.sin(theta);
    const omega = waNum * cosh_beta * Math.cos(theta);
    type1Poles.push(new Complex(sigma, omega));
  }

  // Step 5: Invert to get Type II poles
  const poles: Complex[] = [];
  const waSquared = waNum * waNum;

  for (const p of type1Poles) {
    const denominator = p.re * p.re + p.im * p.im;
    const real = waSquared * p.re / denominator;
    const imag = -waSquared * p.im / denominator;
    poles.push(new Complex(real, imag));
  }

  // Step 6: Calculate gain
  let gain = 1.0;

  // Calculate product of zeros at DC (s=0)
  let zeroProduct = 1.0;
  for (const z of zeros) {
    zeroProduct *= z.abs();  // |jω| = ω
  }

  // Calculate product of poles at DC (s=0)
  let poleProduct = 1.0;
  for (const p of poles) {
    poleProduct *= p.abs();
  }

  gain = zeroProduct / poleProduct;

  // Adjust for stopband attenuation
  if (order % 2 === 0) {
    gain *= Math.sqrt(1 + 1/(epsilon * epsilon));
  }

  // Steps 7-9: Apply transformations
  let transformedPoles: Complex[];
  let transformedZeros: Complex[];

  switch (type) {
    case 'low':
      transformedPoles = poles;
      transformedZeros = zeros;
      break;

    case 'high':
      // Apply lowpass to highpass transformation
      transformedPoles = poles.map(p => waNum / p);
      transformedZeros = zeros.map(z => waNum / z);
      break;

    case 'bandpass':
    case 'stop':
      [transformedPoles, transformedZeros] =
        applyBandTransform(poles, zeros, wa as [number, number], type);
      break;
  }

  const [b, a] = bilinearTransform(transformedZeros, transformedPoles, gain);

  return [b, a];
}
```

### Transfer Function Formulas

**Analog Type II**:
```
       K * ∏(k=1 to n)(s - z_k)
H(s) = ──────────────────────────
       ∏(k=1 to n)(s - s_k)

Zeros: z_k = j*ω_s/cos((2k-1)π/(2n))
Poles: s_k = ω_s²/p_k  (p_k from Type I)
```

**Magnitude response**:
```
|H(jω)|² = ε² * T_n²(ω_s/ω) / (1 + ε² * T_n²(ω_s/ω))

Stopband attenuation: R_s = 10*log₁₀(1 + 1/ε²) dB
```

---

## Task 4: Elliptic Filter (Cauer Filter)

### Mathematical Foundation

Elliptic filters have equiripple behavior in both passband and stopband, providing the steepest rolloff for a given order, ripple, and attenuation specification.

#### Jacobi Elliptic Functions

The elliptic filter design relies on Jacobi elliptic functions and elliptic integrals:

```
sn(u, k) = Jacobi sine amplitude
cn(u, k) = Jacobi cosine amplitude
dn(u, k) = Jacobi delta amplitude

where k is the elliptic modulus
```

**Elliptic integrals**:
```
K(k) = ∫[0 to π/2] dθ/√(1 - k²sin²θ)  (complete elliptic integral)

K'(k) = K(√(1 - k²))  (complementary integral)
```

#### Transfer Function

```
|H(jω)|² = 1 / (1 + ε² * R_n²(ω/ω_c))

where R_n is the elliptic rational function
```

#### Pole and Zero Calculation

**Selectivity parameter**:
```
k = ω_p / ω_s  (passband to stopband ratio)

k₁ = ε / √(A² - 1)  where A = 10^(R_s/20)

k' = √(1 - k²),  k₁' = √(1 - k₁²)

q₀ = (1/2) * ((1 - √k')/(1 + √k'))

q = q₀ + 2*q₀⁵ + 15*q₀⁹ + 150*q₀¹³  (Nome)
```

**Zero locations**:
```
For i = 1 to L (where L = floor(n/2)):
  μᵢ = (2i - 1) / n

  ζᵢ = cd(μᵢ * K(k), k)  // Jacobi cd function

  zeros: s = ±j/(k * ζᵢ)
```

**Pole locations** (more complex, using elliptic functions):
```
For i = 1 to L:
  uᵢ = (2i - 1) * K(k) / n

  sn_u = sn(uᵢ, k)
  cd_u = cd(uᵢ, k)

  v₀ = -(1/n) * K'(k₁) * asn(1/ε, k₁)

  σᵢ = j * cd(uᵢ) * sn(v₀) * dn(v₀) / (1 - dn(uᵢ)² * sn(v₀)²)
  ωᵢ = cn(uᵢ) * dn(v₀) / (1 - dn(uᵢ)² * sn(v₀)²)

  pole: s = σᵢ + j*ωᵢ

If n is odd, add real pole at s = j*sn(v₀)
```

### Algorithm

```
Algorithm: EllipticFilter(order, passband_ripple, stopband_atten, cutoff, type, fs)
Input:
  - order: Filter order (n)
  - passband_ripple: Passband ripple R_p (dB)
  - stopband_atten: Stopband attenuation R_s (dB)
  - cutoff: Cutoff frequency/frequencies
  - type: 'low', 'high', 'bandpass', 'stop'
  - fs: Sampling frequency

Output:
  - b: Numerator coefficients
  - a: Denominator coefficients

Steps:
1. Calculate ripple parameters:
   ε = √(10^(R_p/10) - 1)
   A = 10^(R_s/20)
   k₁ = ε / √(A² - 1)

2. Calculate elliptic modulus and parameters:
   k = 1/A  (for lowpass prototype)
   k' = √(1 - k²)
   k₁' = √(1 - k₁²)

3. Calculate complete elliptic integrals:
   K = K(k)
   K' = K(k')
   K₁ = K(k₁)
   K₁' = K(k₁')

4. Calculate Nome and validate order:
   q₀ = (1/2) * ((1 - √k')/(1 + √k'))
   q = q₀ + 2*q₀⁵ + 15*q₀⁹ + 150*q₀¹³

   n_min = ceil(K₁' * K / (K₁ * K'))
   Ensure n ≥ n_min

5. Calculate zeros using Jacobi cd:
   L = floor(n/2)
   zeros = []

   For i = 1 to L:
     μᵢ = (2i - 1) / n
     ζᵢ = cd(μᵢ * K, k)
     z = j / (k * ζᵢ)
     zeros.append([z, conj(z)])

6. Calculate poles using Jacobi elliptic functions:
   v₀ = -(K' / n) * asn(j/ε, k₁)
   poles = []

   For i = 1 to L:
     uᵢ = (2i - 1) * K / n

     sn_u = sn(uᵢ, k)
     cn_u = cn(uᵢ, k)
     dn_u = dn(uᵢ, k)

     sn_v = sn(v₀, k₁)
     cn_v = cn(v₀, k₁)
     dn_v = dn(v₀, k₁)

     denom = 1 - dn_u² * sn_v²
     σ = j * cd_u * sn_v * dn_v / denom
     ω = cn_u * dn_v / denom

     p = σ + j*ω
     poles.append([p, conj(p)])

   If n is odd:
     p₀ = j * sn(v₀, k₁)
     poles.append(p₀)

7. Normalize to cutoff frequency:
   ω_c = cutoff / (fs/2)
   ω_analog = 2 * tan(π * ω_c / 2)

   poles = poles * ω_analog
   zeros = zeros * ω_analog

8. Calculate gain for unity passband:
   gain = calculate_elliptic_gain(poles, zeros, ε, n)

9. Apply frequency transformation

10. Apply bilinear transform

11. Return [b, a]
```

### Pseudocode

```typescript
function ellip(order: number, passbandRipple: number, stopbandAtten: number,
               cutoff: number | [number, number],
               type: 'low' | 'high' | 'bandpass' | 'stop' = 'low',
               fs: number = 2): [number[], number[]] {

  // Step 1: Calculate ripple parameters
  const epsilon = Math.sqrt(Math.pow(10, passbandRipple / 10) - 1);
  const A = Math.pow(10, stopbandAtten / 20);
  const k1 = epsilon / Math.sqrt(A * A - 1);

  // Step 2: Calculate elliptic moduli
  const k = 1.0 / A;
  const kp = Math.sqrt(1 - k * k);
  const k1p = Math.sqrt(1 - k1 * k1);

  // Step 3: Calculate complete elliptic integrals
  const K = completeEllipticIntegral(k);
  const Kp = completeEllipticIntegral(kp);
  const K1 = completeEllipticIntegral(k1);
  const K1p = completeEllipticIntegral(k1p);

  // Step 4: Calculate Nome
  const q0 = 0.5 * ((1 - Math.sqrt(kp)) / (1 + Math.sqrt(kp)));
  const q = q0 + 2*Math.pow(q0, 5) + 15*Math.pow(q0, 9) + 150*Math.pow(q0, 13);

  // Validate minimum order
  const nMin = Math.ceil((K1p * K) / (K1 * Kp));
  if (order < nMin) {
    throw new Error(`Order must be at least ${nMin} for given specifications`);
  }

  // Step 5: Calculate zeros
  const L = Math.floor(order / 2);
  const zeros: Complex[] = [];

  for (let i = 1; i <= L; i++) {
    const mu = (2*i - 1) / order;
    const zeta = jacobiCd(mu * K, k);
    const zMag = 1.0 / (k * zeta);

    zeros.push(new Complex(0, zMag));
    zeros.push(new Complex(0, -zMag));
  }

  // Step 6: Calculate poles
  const v0 = -(Kp / order) * inverseJacobiSn(new Complex(0, 1/epsilon), k1);
  const poles: Complex[] = [];

  const sn_v = jacobiSn(v0, k1);
  const cn_v = jacobiCn(v0, k1);
  const dn_v = jacobiDn(v0, k1);

  for (let i = 1; i <= L; i++) {
    const u = (2*i - 1) * K / order;

    const sn_u = jacobiSn(u, k);
    const cn_u = jacobiCn(u, k);
    const dn_u = jacobiDn(u, k);

    const cd_u = cn_u / dn_u;

    const denom = 1 - dn_u * dn_u * sn_v.re * sn_v.re;

    // σ = j * cd_u * sn_v * dn_v / denom
    const sigma = new Complex(
      -cd_u * sn_v.im * dn_v.re / denom,
      cd_u * sn_v.re * dn_v.re / denom
    );

    // ω = cn_u * dn_v / denom
    const omega = cn_u * dn_v.re / denom;

    const pole = sigma.add(new Complex(0, omega));
    poles.push(pole);
    poles.push(pole.conj());
  }

  // Add real pole for odd order
  if (order % 2 === 1) {
    const realPole = new Complex(0, sn_v.re);
    poles.push(realPole);
  }

  // Step 7: Normalize frequencies
  const nyquist = fs / 2;
  const wc = Array.isArray(cutoff)
    ? [cutoff[0] / nyquist, cutoff[1] / nyquist]
    : cutoff / nyquist;

  const wa = Array.isArray(wc)
    ? [2 * Math.tan(Math.PI * wc[0] / 2),
       2 * Math.tan(Math.PI * wc[1] / 2)]
    : 2 * Math.tan(Math.PI * wc / 2);

  const waNum = wa as number;

  // Scale poles and zeros
  const scaledPoles = poles.map(p => p.mul(waNum));
  const scaledZeros = zeros.map(z => z.mul(waNum));

  // Step 8: Calculate gain
  let gain: number;
  if (order % 2 === 1) {
    gain = 1.0;
  } else {
    gain = 1.0 / Math.sqrt(1 + epsilon * epsilon);
  }

  // Steps 9-11: Apply transformations
  const [transformedZeros, transformedPoles] =
    applyFrequencyTransform(scaledZeros, scaledPoles, type, wa);

  const [b, a] = bilinearTransform(transformedZeros, transformedPoles, gain);

  return [b, a];
}

// Helper: Calculate complete elliptic integral K(k)
function completeEllipticIntegral(k: number): number {
  // Using arithmetic-geometric mean (AGM) method
  let a = 1.0;
  let b = Math.sqrt(1 - k * k);
  const tolerance = 1e-10;

  while (Math.abs(a - b) > tolerance) {
    const aPrev = a;
    a = (a + b) / 2;
    b = Math.sqrt(aPrev * b);
  }

  return Math.PI / (2 * a);
}

// Helper: Jacobi elliptic functions
function jacobiSn(u: number | Complex, k: number): Complex {
  // Implement using theta functions or series expansion
  // For real u and k:
  if (typeof u === 'number') {
    return new Complex(snReal(u, k), 0);
  }
  // For complex u, use addition formulas
  return snComplex(u, k);
}

function jacobiCn(u: number | Complex, k: number): Complex {
  // cn² + sn² = 1
  const sn = jacobiSn(u, k);
  return new Complex(1, 0).sub(sn.mul(sn)).sqrt();
}

function jacobiDn(u: number | Complex, k: number): Complex {
  // dn² + k²*sn² = 1
  const sn = jacobiSn(u, k);
  return new Complex(1, 0).sub(sn.mul(sn).mul(k * k)).sqrt();
}

function jacobiCd(u: number, k: number): number {
  // cd = cn / dn
  const cn = jacobiCn(u, k);
  const dn = jacobiDn(u, k);
  return cn.div(dn).re;
}
```

### Transfer Function Formulas

**Elliptic rational function**:
```
       ∏(i=1 to L)(ω² - zᵢ²)
R_n(ω) = ────────────────────────
       ∏(i=1 to L)(ω² - pᵢ²)

where L = floor(n/2)
```

**Complete transfer function**:
```
       K * ∏(s - zᵢ)
H(s) = ──────────────
       ∏(s - pᵢ)
```

**Discrimination factor**:
```
ξ = K₁' * K / (K₁ * K')

Minimum order: n_min = ceil(ξ)
```

**Passband/Stopband relationship**:
```
At ω = ω_p: |H(jω_p)| = 1/√(1 + ε²)
At ω = ω_s: |H(jω_s)| = 1/√(1 + ε² * R_n²(ω_s/ω_p))
```

---

## Task 5: FIR Filter Design (fir1 - Window Method)

### Mathematical Foundation

FIR (Finite Impulse Response) filters have finite-duration impulse response with guaranteed stability and linear phase characteristics.

#### Ideal Lowpass Impulse Response

The ideal lowpass filter has infinite duration:

```
         sin(ω_c * n)
h_ideal[n] = ─────────────  for -∞ < n < ∞
         π * n

where ω_c is the cutoff frequency in radians
```

For n = 0: `h_ideal[0] = ω_c / π`

#### Window Method

Truncate and window the ideal impulse response:

```
h[n] = h_ideal[n] * w[n]  for n = 0, 1, ..., N-1

where w[n] is the window function
```

#### Window Functions

**Rectangular (boxcar)**:
```
w[n] = 1  for 0 ≤ n < N
```

**Hamming**:
```
w[n] = 0.54 - 0.46 * cos(2πn/(N-1))
```

**Hanning (Hann)**:
```
w[n] = 0.5 * (1 - cos(2πn/(N-1)))
```

**Blackman**:
```
w[n] = 0.42 - 0.5*cos(2πn/(N-1)) + 0.08*cos(4πn/(N-1))
```

**Kaiser**:
```
w[n] = I₀(β√(1 - ((n - α)/α)²)) / I₀(β)

where:
  α = (N-1)/2
  I₀ = modified Bessel function of first kind, order 0
  β = shape parameter (controls sidelobe level)
```

#### Frequency Transformations

**Highpass**:
```
h_hp[n] = δ[n] - h_lp[n]

where δ[n] is the impulse (1 at n=(N-1)/2, 0 elsewhere)
```

**Bandpass**:
```
h_bp[n] = h_lp_high[n] - h_lp_low[n]
```

**Bandstop**:
```
h_bs[n] = h_lp_low[n] + h_hp_high[n]
      = δ[n] - h_bp[n]
```

### Algorithm

```
Algorithm: FIR1_WindowMethod(order, cutoff, type, window, fs)
Input:
  - order: Filter order (N-1, where N is length)
  - cutoff: Normalized cutoff frequency or [low, high]
  - type: 'low', 'high', 'bandpass', 'stop'
  - window: Window function name or custom coefficients
  - fs: Sampling frequency

Output:
  - b: FIR filter coefficients (length N = order + 1)

Steps:
1. Determine filter length:
   N = order + 1
   M = (N - 1) / 2  (delay for linear phase)

2. Normalize cutoff frequencies:
   If scalar cutoff:
     ω_c = π * cutoff  (assuming cutoff in [0, 1])
   If array [f1, f2]:
     ω_1 = π * f1
     ω_2 = π * f2

3. Generate ideal impulse response:
   For n = 0 to N-1:
     m = n - M  (center at M)

     If type == 'low':
       If m == 0:
         h[n] = ω_c / π
       Else:
         h[n] = sin(ω_c * m) / (π * m)

     If type == 'high':
       If m == 0:
         h[n] = 1 - ω_c / π
       Else:
         h[n] = -sin(ω_c * m) / (π * m)
       h[M] += 1  (add impulse at center)

     If type == 'bandpass':
       If m == 0:
         h[n] = (ω_2 - ω_1) / π
       Else:
         h[n] = (sin(ω_2*m) - sin(ω_1*m)) / (π*m)

     If type == 'stop':
       If m == 0:
         h[n] = 1 - (ω_2 - ω_1) / π
       Else:
         h[n] = (sin(ω_1*m) - sin(ω_2*m)) / (π*m)
       h[M] += 1

4. Generate window function:
   w = create_window(window, N)

5. Apply window:
   For n = 0 to N-1:
     b[n] = h[n] * w[n]

6. Normalize for unity gain (optional):
   If type == 'low' or 'bandpass':
     sum = Σ b[n]
     b = b / sum

   If type == 'high' or 'stop':
     // Normalize at Nyquist frequency
     sum = Σ b[n] * (-1)^n
     b = b / sum

7. Return b
```

### Pseudocode

```typescript
function fir1(order: number,
              cutoff: number | [number, number],
              type: 'low' | 'high' | 'bandpass' | 'stop' = 'low',
              window: string | number[] = 'hamming',
              fs: number = 2): number[] {

  // Step 1: Determine filter length
  const N = order + 1;
  const M = (N - 1) / 2;

  // Ensure odd length for symmetric Type I linear phase
  if (N % 2 === 0 && (type === 'high' || type === 'stop')) {
    throw new Error('Even-length filters not supported for highpass/bandstop');
  }

  // Step 2: Normalize cutoff frequencies
  const nyquist = fs / 2;
  let wc: number | [number, number];

  if (Array.isArray(cutoff)) {
    wc = [Math.PI * cutoff[0] / nyquist,
          Math.PI * cutoff[1] / nyquist];
  } else {
    wc = Math.PI * cutoff / nyquist;
  }

  // Step 3: Generate ideal impulse response
  const h = new Array(N);

  for (let n = 0; n < N; n++) {
    const m = n - M;

    switch (type) {
      case 'low':
        const wcNum = wc as number;
        if (m === 0) {
          h[n] = wcNum / Math.PI;
        } else {
          h[n] = Math.sin(wcNum * m) / (Math.PI * m);
        }
        break;

      case 'high':
        const wcHigh = wc as number;
        if (m === 0) {
          h[n] = 1 - wcHigh / Math.PI;
        } else {
          h[n] = -Math.sin(wcHigh * m) / (Math.PI * m);
        }
        break;

      case 'bandpass':
        const [w1, w2] = wc as [number, number];
        if (m === 0) {
          h[n] = (w2 - w1) / Math.PI;
        } else {
          h[n] = (Math.sin(w2 * m) - Math.sin(w1 * m)) / (Math.PI * m);
        }
        break;

      case 'stop':
        const [w1s, w2s] = wc as [number, number];
        if (m === 0) {
          h[n] = 1 - (w2s - w1s) / Math.PI;
        } else {
          h[n] = (Math.sin(w1s * m) - Math.sin(w2s * m)) / (Math.PI * m);
        }
        break;
    }
  }

  // Step 4: Generate window
  const w = createWindow(window, N);

  // Step 5: Apply window
  const b = new Array(N);
  for (let n = 0; n < N; n++) {
    b[n] = h[n] * w[n];
  }

  // Step 6: Normalize for unity gain
  if (type === 'low' || type === 'bandpass') {
    const sum = b.reduce((acc, val) => acc + val, 0);
    for (let n = 0; n < N; n++) {
      b[n] /= sum;
    }
  } else {
    // Normalize at Nyquist (ω = π)
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += b[n] * Math.pow(-1, n);
    }
    for (let n = 0; n < N; n++) {
      b[n] /= Math.abs(sum);
    }
  }

  return b;
}

// Helper: Create window function
function createWindow(window: string | number[], N: number): number[] {
  if (Array.isArray(window)) {
    if (window.length !== N) {
      throw new Error('Window length must match filter length');
    }
    return window;
  }

  const w = new Array(N);

  switch (window.toLowerCase()) {
    case 'rectangular':
    case 'boxcar':
      w.fill(1);
      break;

    case 'hamming':
      for (let n = 0; n < N; n++) {
        w[n] = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1));
      }
      break;

    case 'hanning':
    case 'hann':
      for (let n = 0; n < N; n++) {
        w[n] = 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)));
      }
      break;

    case 'blackman':
      for (let n = 0; n < N; n++) {
        w[n] = 0.42
             - 0.5 * Math.cos(2 * Math.PI * n / (N - 1))
             + 0.08 * Math.cos(4 * Math.PI * n / (N - 1));
      }
      break;

    case 'kaiser':
      // Requires beta parameter - use default beta=5
      const beta = 5;
      const alpha = (N - 1) / 2;
      const I0_beta = besselI0(beta);

      for (let n = 0; n < N; n++) {
        const arg = beta * Math.sqrt(1 - Math.pow((n - alpha) / alpha, 2));
        w[n] = besselI0(arg) / I0_beta;
      }
      break;

    default:
      throw new Error(`Unknown window type: ${window}`);
  }

  return w;
}

// Helper: Modified Bessel function I0
function besselI0(x: number): number {
  let sum = 1.0;
  let term = 1.0;
  const threshold = 1e-12;

  for (let k = 1; k < 100; k++) {
    term *= (x / (2 * k)) * (x / (2 * k));
    sum += term;

    if (term < threshold * sum) {
      break;
    }
  }

  return sum;
}
```

### Transfer Function Formulas

**FIR Transfer Function**:
```
H(z) = Σ(n=0 to N-1) b[n] * z^(-n)

Or in frequency domain:
H(e^(jω)) = Σ(n=0 to N-1) b[n] * e^(-jωn)
```

**Linear Phase Property**:
```
For symmetric coefficients: b[n] = b[N-1-n]

Phase: θ(ω) = -ω * (N-1)/2  (linear)

Group delay: τ = (N-1)/2  (constant)
```

**Window Properties**:

| Window      | Main Lobe Width | Sidelobe Level | Stopband Atten |
|-------------|----------------|----------------|----------------|
| Rectangular | 4π/N           | -13 dB         | ~21 dB         |
| Hamming     | 8π/N           | -43 dB         | ~53 dB         |
| Hanning     | 8π/N           | -32 dB         | ~44 dB         |
| Blackman    | 12π/N          | -58 dB         | ~74 dB         |
| Kaiser(β=5) | ~10π/N         | -40 dB         | ~50 dB         |

---

## Task 6: Filter Function (Direct Form II Transposed)

### Mathematical Foundation

The filter function implements the digital filter difference equation:

```
a[0]*y[n] = b[0]*x[n] + b[1]*x[n-1] + ... + b[M]*x[n-M]
          - a[1]*y[n-1] - a[2]*y[n-2] - ... - a[N]*y[n-N]
```

Rearranged:

```
y[n] = (1/a[0]) * (Σ(k=0 to M) b[k]*x[n-k] - Σ(k=1 to N) a[k]*y[n-k])
```

#### Direct Form II Transposed Structure

This is the preferred implementation for numerical stability:

```
State equations:
y[n] = b[0]*x[n] + s[0]
s[0] = b[1]*x[n] + s[1] - a[1]*y[n]
s[1] = b[2]*x[n] + s[2] - a[2]*y[n]
...
s[N-2] = b[N-1]*x[n] + s[N-1] - a[N-1]*y[n]
s[N-1] = b[N]*x[n] - a[N]*y[n]

where s[k] are the internal states
```

### Algorithm

```
Algorithm: Filter(b, a, x, zi)
Input:
  - b: Numerator coefficients [b0, b1, ..., bM]
  - a: Denominator coefficients [a0, a1, ..., aN]
  - x: Input signal [x[0], x[1], ..., x[L-1]]
  - zi: Initial conditions (optional, state vector)

Output:
  - y: Filtered output signal
  - zf: Final state vector

Steps:
1. Normalize coefficients:
   If a[0] ≠ 1:
     b = b / a[0]
     a = a / a[0]

2. Determine filter orders:
   M = length(b) - 1  (numerator order)
   N = length(a) - 1  (denominator order)
   n_states = max(M, N)

3. Initialize state vector:
   If zi provided:
     s = zi (must be length n_states)
   Else:
     s = zeros(n_states)

4. Pad coefficient arrays if needed:
   If M < n_states:
     b = [b, zeros(n_states - M)]
   If N < n_states:
     a = [a, zeros(n_states - N)]

5. Process each input sample (Direct Form II Transposed):
   For n = 0 to length(x) - 1:
     // Output is b[0]*x[n] + first state
     y[n] = b[0] * x[n] + s[0]

     // Update states using transposed structure
     For k = 0 to n_states - 2:
       s[k] = b[k+1] * x[n] + s[k+1] - a[k+1] * y[n]

     // Last state has no s[k+1]
     s[n_states-1] = b[n_states] * x[n] - a[n_states] * y[n]

6. Return y, s (final state)
```

### Pseudocode

```typescript
function filter(b: number[], a: number[], x: number[],
                zi?: number[]): [number[], number[]] {

  // Step 1: Normalize coefficients
  const a0 = a[0];
  if (a0 !== 1) {
    b = b.map(coef => coef / a0);
    a = a.map(coef => coef / a0);
  }

  // Step 2: Determine orders
  const M = b.length - 1;
  const N = a.length - 1;
  const nStates = Math.max(M, N);

  // Step 3: Initialize state
  let s: number[];
  if (zi) {
    if (zi.length !== nStates) {
      throw new Error(`Initial conditions must have length ${nStates}`);
    }
    s = [...zi];  // Copy
  } else {
    s = new Array(nStates).fill(0);
  }

  // Step 4: Pad coefficients
  const bPadded = [...b];
  const aPadded = [...a];

  while (bPadded.length <= nStates) {
    bPadded.push(0);
  }
  while (aPadded.length <= nStates) {
    aPadded.push(0);
  }

  // Step 5: Process signal
  const y = new Array(x.length);

  for (let n = 0; n < x.length; n++) {
    // Output equation
    y[n] = bPadded[0] * x[n] + s[0];

    // State update (Direct Form II Transposed)
    for (let k = 0; k < nStates - 1; k++) {
      s[k] = bPadded[k + 1] * x[n] + s[k + 1] - aPadded[k + 1] * y[n];
    }

    // Last state
    if (nStates > 0) {
      s[nStates - 1] = bPadded[nStates] * x[n] - aPadded[nStates] * y[n];
    }
  }

  // Step 6: Return output and final state
  return [y, s];
}
```

### Transfer Function Formulas

**Z-domain transfer function**:
```
       B(z)   b[0] + b[1]*z^(-1) + ... + b[M]*z^(-M)
H(z) = ──── = ─────────────────────────────────────
       A(z)   a[0] + a[1]*z^(-1) + ... + a[N]*z^(-N)
```

**Frequency response**:
```
H(e^(jω)) = B(e^(jω)) / A(e^(jω))

Magnitude: |H(e^(jω))| = |B(e^(jω))| / |A(e^(jω))|

Phase: ∠H(e^(jω)) = ∠B(e^(jω)) - ∠A(e^(jω))
```

**Initial conditions for zero transients**:
```
For step response starting from steady state:

zi = lfilter_zi(b, a)

where lfilter_zi computes initial state for step response
```

---

## Task 7: Zero-Phase Filtering (filtfilt)

### Mathematical Foundation

Zero-phase filtering eliminates phase distortion by filtering the signal twice:
1. Forward filtering: `y = filter(b, a, x)`
2. Reverse filtering: `y_out = filter(b, a, reverse(y))`
3. Reverse result: `y_out = reverse(y_out)`

#### Effective Transfer Function

```
H_eff(z) = H(z) * H(z^(-1))

Magnitude: |H_eff(e^(jω))| = |H(e^(jω))|²

Phase: ∠H_eff(e^(jω)) = ∠H(e^(jω)) - ∠H(e^(jω)) = 0
```

The squared magnitude provides sharper filtering, while phase is exactly zero.

#### Edge Effects and Padding

To minimize transient effects at signal boundaries, the signal is extended using:

**Odd extension** (reflection):
```
x_ext = [x[2m], x[2m-1], ..., x[1], x[0], x[1], ..., x[N-1], x[N-2], ..., x[N-2m]]

where m is the padding length (typically 3 * max(len(a), len(b)))
```

### Algorithm

```
Algorithm: FiltFilt(b, a, x)
Input:
  - b: Numerator coefficients
  - a: Denominator coefficients
  - x: Input signal

Output:
  - y: Zero-phase filtered signal

Steps:
1. Determine padding length:
   n_pad = 3 * max(length(b), length(a))

   If n_pad > length(x):
     n_pad = length(x) - 1

2. Create odd-extended signal:
   // Reflect at start
   x_start = [x[n_pad], x[n_pad-1], ..., x[1]]

   // Reflect at end
   x_end = [x[N-2], x[N-3], ..., x[N-n_pad-1]]

   x_ext = [x_start, x, x_end]

3. Compute initial conditions for forward pass:
   zi = lfilter_zi(b, a)

   // Scale by first value for continuity
   zi = zi * x_ext[0]

4. Forward filter:
   [y_forward, zf] = filter(b, a, x_ext, zi)

5. Compute initial conditions for reverse pass:
   zi_rev = lfilter_zi(b, a)

   // Scale by last value of forward pass
   zi_rev = zi_rev * y_forward[end]

6. Reverse the forward output:
   y_forward_rev = reverse(y_forward)

7. Backward filter:
   [y_backward, zf] = filter(b, a, y_forward_rev, zi_rev)

8. Reverse the backward output:
   y_ext = reverse(y_backward)

9. Remove padding:
   y = y_ext[n_pad : n_pad + length(x)]

10. Return y
```

### Pseudocode

```typescript
function filtfilt(b: number[], a: number[], x: number[]): number[] {
  const N = x.length;

  // Step 1: Determine padding
  const nPad = Math.min(3 * Math.max(b.length, a.length), N - 1);

  // Step 2: Create odd-extended signal
  const xStart: number[] = [];
  for (let i = nPad; i >= 1; i--) {
    xStart.push(2 * x[0] - x[i]);
  }

  const xEnd: number[] = [];
  for (let i = N - 2; i >= N - nPad - 1; i--) {
    xEnd.push(2 * x[N - 1] - x[i]);
  }

  const xExt = [...xStart, ...x, ...xEnd];

  // Step 3: Initial conditions for forward pass
  let zi = lfilterZi(b, a);
  zi = zi.map(val => val * xExt[0]);

  // Step 4: Forward filter
  const [yForward, zfForward] = filter(b, a, xExt, zi);

  // Step 5: Initial conditions for reverse pass
  let ziRev = lfilterZi(b, a);
  ziRev = ziRev.map(val => val * yForward[yForward.length - 1]);

  // Step 6: Reverse forward output
  const yForwardRev = yForward.slice().reverse();

  // Step 7: Backward filter
  const [yBackward, zfBackward] = filter(b, a, yForwardRev, ziRev);

  // Step 8: Reverse backward output
  const yExt = yBackward.slice().reverse();

  // Step 9: Remove padding
  const y = yExt.slice(nPad, nPad + N);

  return y;
}

// Helper: Compute initial state for filtering
function lfilterZi(b: number[], a: number[]): number[] {
  // Compute initial state for step response
  // This ensures smooth start of filtering

  const n = Math.max(b.length, a.length) - 1;

  // Pad coefficients
  const bPad = [...b];
  const aPad = [...a];
  while (bPad.length <= n) bPad.push(0);
  while (aPad.length <= n) aPad.push(0);

  // Normalize
  const a0 = aPad[0];
  const bNorm = bPad.map(c => c / a0);
  const aNorm = aPad.map(c => c / a0);

  // Build companion matrix for initial conditions
  // zi satisfies: zi = A*zi + B
  // Solution: zi = (I - A)^(-1) * B

  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);

    if (i < n - 1) {
      row[i + 1] = 1;
    }

    if (i === 0) {
      for (let j = 0; j < n; j++) {
        row[j] -= aNorm[j + 1];
      }
    }

    A.push(row);
    B.push(bNorm[i + 1] - aNorm[i + 1] * bNorm[0]);
  }

  // Solve (I - A) * zi = B
  const IminusA: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push((i === j ? 1 : 0) - A[i][j]);
    }
    IminusA.push(row);
  }

  // Use linear solver
  const zi = solveLinearSystem(IminusA, B);

  return zi;
}
```

### Transfer Function Formulas

**Effective transfer function**:
```
H_eff(z) = H(z) * H(1/z)

Magnitude squared:
|H_eff(e^(jω))|² = |H(e^(jω))|⁴
```

**Zero-phase property**:
```
∠H_eff(e^(jω)) = ∠H(e^(jω)) + ∠H(e^(-jω))
                = ∠H(e^(jω)) - ∠H(e^(jω))
                = 0
```

**Group delay**:
```
τ_eff(ω) = -d(∠H_eff(e^(jω)))/dω = 0  (constant zero delay)
```

---

## Task 8: Convolution (Direct and FFT-based)

### Mathematical Foundation

Convolution is fundamental to linear time-invariant (LTI) systems:

```
(x * h)[n] = Σ(k=-∞ to ∞) x[k] * h[n - k]

For finite sequences:
y[n] = Σ(k=0 to M-1) x[k] * h[n - k]  for n = 0, ..., N+M-2
```

#### Convolution Theorem

```
x[n] * h[n] ↔ X(k) · H(k)  (time ↔ frequency)

where X(k), H(k) are DFT coefficients
```

### Direct Convolution Algorithm

```
Algorithm: ConvolutionDirect(x, h)
Input:
  - x: First sequence, length N
  - h: Second sequence, length M

Output:
  - y: Convolution result, length N + M - 1

Steps:
1. Determine output length:
   L = N + M - 1

2. Initialize output:
   y = zeros(L)

3. Compute convolution:
   For n = 0 to L - 1:
     For k = 0 to M - 1:
       If (n - k) >= 0 AND (n - k) < N:
         y[n] += h[k] * x[n - k]

4. Return y

Complexity: O(N * M)
```

### FFT-based Convolution Algorithm

```
Algorithm: ConvolutionFFT(x, h)
Input:
  - x: First sequence, length N
  - h: Second sequence, length M

Output:
  - y: Convolution result, length N + M - 1

Steps:
1. Determine FFT size:
   L = N + M - 1

   // Round up to next power of 2 for efficiency
   N_fft = next_power_of_2(L)

2. Zero-pad sequences:
   x_pad = [x, zeros(N_fft - N)]
   h_pad = [h, zeros(N_fft - M)]

3. Forward FFT:
   X = fft(x_pad)
   H = fft(h_pad)

4. Multiply in frequency domain:
   Y = X .* H  (element-wise multiplication)

5. Inverse FFT:
   y_full = ifft(Y)

6. Extract valid portion:
   y = real(y_full[0 : L-1])

7. Return y

Complexity: O(N_fft * log(N_fft))

Use FFT method when: N_fft * log(N_fft) < N * M
Typically when min(N, M) > ~50
```

### Overlap-Add Method (for long signals)

```
Algorithm: ConvolutionOverlapAdd(x, h, block_size)
Input:
  - x: Long signal, length N
  - h: Filter kernel, length M
  - block_size: Size of processing blocks

Output:
  - y: Filtered signal

Steps:
1. Determine parameters:
   L = block_size
   M = length(h)
   N_fft = L + M - 1
   hop = L  (no overlap in input)

2. Pad filter:
   h_pad = [h, zeros(N_fft - M)]
   H = fft(h_pad)

3. Initialize output:
   y = zeros(N + M - 1)

4. Process in blocks:
   For start = 0 to N step L:
     // Extract block
     end = min(start + L, N)
     x_block = x[start : end]

     // Pad block
     x_pad = [x_block, zeros(N_fft - length(x_block))]

     // FFT, multiply, IFFT
     X = fft(x_pad)
     Y_block = X .* H
     y_block = real(ifft(Y_block))

     // Overlap-add
     For n = 0 to N_fft - 1:
       y[start + n] += y_block[n]

5. Return y

Advantages:
- Process arbitrarily long signals
- Constant memory usage
- Parallelizable
```

### Pseudocode

```typescript
function conv(x: number[], h: number[],
              method: 'direct' | 'fft' | 'auto' = 'auto'): number[] {

  const N = x.length;
  const M = h.length;
  const L = N + M - 1;

  // Auto-select method
  let useFFT: boolean;
  if (method === 'auto') {
    const fftOps = 2 * nextPowerOf2(L) * Math.log2(nextPowerOf2(L));
    const directOps = N * M;
    useFFT = fftOps < directOps;
  } else {
    useFFT = (method === 'fft');
  }

  if (useFFT) {
    return convFFT(x, h);
  } else {
    return convDirect(x, h);
  }
}

// Direct convolution
function convDirect(x: number[], h: number[]): number[] {
  const N = x.length;
  const M = h.length;
  const L = N + M - 1;

  const y = new Array(L).fill(0);

  for (let n = 0; n < L; n++) {
    for (let k = 0; k < M; k++) {
      const idx = n - k;
      if (idx >= 0 && idx < N) {
        y[n] += h[k] * x[idx];
      }
    }
  }

  return y;
}

// FFT-based convolution
function convFFT(x: number[], h: number[]): number[] {
  const N = x.length;
  const M = h.length;
  const L = N + M - 1;

  // Pad to power of 2
  const Nfft = nextPowerOf2(L);

  const xPad = [...x, ...new Array(Nfft - N).fill(0)];
  const hPad = [...h, ...new Array(Nfft - M).fill(0)];

  // FFT
  const X = fft(xPad);
  const H = fft(hPad);

  // Multiply
  const Y = new Array(Nfft);
  for (let k = 0; k < Nfft; k++) {
    Y[k] = X[k].mul(H[k]);
  }

  // IFFT
  const yFull = ifft(Y);

  // Extract real part and valid portion
  const y = new Array(L);
  for (let n = 0; n < L; n++) {
    y[n] = yFull[n].re;
  }

  return y;
}

// Overlap-add for long signals
function overlapAdd(x: number[], h: number[], blockSize: number = 1024): number[] {
  const N = x.length;
  const M = h.length;
  const L = blockSize;
  const Nfft = nextPowerOf2(L + M - 1);

  // Precompute H
  const hPad = [...h, ...new Array(Nfft - M).fill(0)];
  const H = fft(hPad);

  // Initialize output
  const y = new Array(N + M - 1).fill(0);

  // Process blocks
  for (let start = 0; start < N; start += L) {
    const end = Math.min(start + L, N);
    const xBlock = x.slice(start, end);

    // Pad and FFT
    const xPad = [...xBlock, ...new Array(Nfft - xBlock.length).fill(0)];
    const X = fft(xPad);

    // Multiply
    const Y = new Array(Nfft);
    for (let k = 0; k < Nfft; k++) {
      Y[k] = X[k].mul(H[k]);
    }

    // IFFT
    const yBlock = ifft(Y);

    // Overlap-add
    for (let n = 0; n < Nfft; n++) {
      y[start + n] += yBlock[n].re;
    }
  }

  return y;
}
```

### Transfer Function Formulas

**Convolution in time domain**:
```
y[n] = (x * h)[n] = Σ x[k] * h[n-k]
```

**Multiplication in frequency domain**:
```
Y[k] = X[k] · H[k]

where X[k] = DFT{x[n]}, H[k] = DFT{h[n]}
```

**Circular vs Linear Convolution**:
```
Circular: y_circ[n] = Σ(k=0 to N-1) x[k] * h[(n-k) mod N]

Linear: Obtained from circular by zero-padding to length N+M-1
```

---

## Task 9: Second-Order Sections (SOS)

### Mathematical Foundation

Second-order sections (SOS) decompose higher-order filters into cascaded biquad (second-order) sections, improving numerical stability.

#### Biquad Transfer Function

```
         b₀ + b₁z⁻¹ + b₂z⁻²
H_i(z) = ───────────────────
         a₀ + a₁z⁻¹ + a₂z⁻²

Normalized (a₀ = 1):
         b₀ + b₁z⁻¹ + b₂z⁻²
H_i(z) = ───────────────────
         1 + a₁z⁻¹ + a₂z⁻²
```

#### SOS Matrix Representation

```
SOS = [b₀₁  b₁₁  b₂₁  1  a₁₁  a₂₁]
      [b₀₂  b₁₂  b₂₂  1  a₁₂  a₂₂]
      [  ⋮    ⋮    ⋮  ⋮   ⋮    ⋮ ]
      [b₀ₙ  b₁ₙ  b₂ₙ  1  a₁ₙ  a₂ₙ]

Each row is one biquad section
```

#### Cascaded System

```
         n
H(z) = ∏ H_i(z)
       i=1

Overall filter = cascade of biquads
```

### TF to SOS Conversion Algorithm

```
Algorithm: TF2SOS(b, a)
Input:
  - b: Numerator coefficients
  - a: Denominator coefficients

Output:
  - sos: Matrix of second-order sections
  - g: Overall gain

Steps:
1. Find poles and zeros:
   zeros = roots(b)
   poles = roots(a)

2. Calculate overall gain:
   g = b[0] / a[0]

3. Pair poles:
   // Sort by distance from unit circle
   poles_sorted = sort(poles, by=|1 - |pole||)

   pole_pairs = []
   used = []

   For each pole p not in used:
     If p is complex:
       Find conjugate p*
       pole_pairs.append([p, p*])
       used.append(p, p*)
     Else (real pole):
       Find nearest unused real pole p2
       pole_pairs.append([p, p2])
       used.append(p, p2)

   If odd number of real poles:
     Create section with [p, 0] (one pole, one zero at origin)

4. Pair zeros similarly:
   zero_pairs = pair_zeros(zeros)

5. Order sections for minimal gain variation:
   // Match pole pairs with zero pairs
   // Place poles/zeros closest to unit circle first

   sections = []
   For i = 1 to num_sections:
     [p1, p2] = pole_pairs[i]
     [z1, z2] = zero_pairs[i]

     // Create biquad coefficients
     b_sec = poly([z1, z2])  // (z - z1)(z - z2)
     a_sec = poly([p1, p2])  // (z - p1)(z - p2)

     // Normalize
     b_sec = b_sec / a_sec[0]
     a_sec = a_sec / a_sec[0]

     sections.append([b_sec[0], b_sec[1], b_sec[2],
                      1, a_sec[1], a_sec[2]])

6. Distribute gain:
   // Apply gain to first section or distribute across all
   sections[0][0:3] *= g^(1/num_sections)

7. Return SOS matrix, g
```

### SOS Filtering Algorithm

```
Algorithm: SOSFilt(sos, x)
Input:
  - sos: SOS matrix [n_sections × 6]
  - x: Input signal

Output:
  - y: Filtered signal

Steps:
1. Initialize:
   y = x  (start with input)
   n_sections = size(sos, 1)

2. For each section i = 1 to n_sections:
   // Extract coefficients
   b0, b1, b2 = sos[i, 0:3]
   a1, a2 = sos[i, 4:6]

   // Apply Direct Form II Transposed
   s1 = 0, s2 = 0  (states)

   For n = 1 to length(y):
     // Output
     y_out = b0 * y[n] + s1

     // Update states
     s1 = b1 * y[n] - a1 * y_out + s2
     s2 = b2 * y[n] - a2 * y_out

     y[n] = y_out

3. Return y
```

### Pole-Zero Pairing Strategy

**Nearest pole-zero pairing**:
```
For each pole p:
  Find zero z that minimizes |p - z|
  Pair (p, z)

Advantages: Minimizes intermediate gain variations
```

**Minimum Q pairing**:
```
Q = ω₀ / BW  (quality factor)

For pole pair p, p*:
  Q = |p| / (2 * Re(p))

Pair high-Q poles with high-Q zeros
```

### Pseudocode

```typescript
function tf2sos(b: number[], a: number[]): [number[][], number] {
  // Step 1: Find poles and zeros
  const zeros = polyRoots(b);
  const poles = polyRoots(a);

  // Step 2: Overall gain
  const gain = b[0] / a[0];

  // Step 3: Pair poles
  const polePairs = pairComplexConjugates(poles);

  // Step 4: Pair zeros (pad if needed)
  const numSections = polePairs.length;
  while (zeros.length < 2 * numSections) {
    zeros.push(new Complex(-1, 0));  // Add zeros at z = -1
  }
  const zeroPairs = pairComplexConjugates(zeros);

  // Step 5: Order sections
  // Sort pole pairs by distance from unit circle (closest first)
  polePairs.sort((a, b) => {
    const distA = Math.abs(1 - a[0].abs());
    const distB = Math.abs(1 - b[0].abs());
    return distA - distB;
  });

  // Match zero pairs to pole pairs
  const matchedPairs = matchPoleZeroPairs(polePairs, zeroPairs);

  // Step 6: Create SOS matrix
  const sos: number[][] = [];

  for (const [polePair, zeroPair] of matchedPairs) {
    const [p1, p2] = polePair;
    const [z1, z2] = zeroPair;

    // Numerator: (z - z1)(z - z2) = z² - (z1+z2)z + z1*z2
    const b0 = 1;
    const b1 = -(z1.add(z2)).re;
    const b2 = z1.mul(z2).re;

    // Denominator: (z - p1)(z - p2) = z² - (p1+p2)z + p1*p2
    const a0 = 1;
    const a1 = -(p1.add(p2)).re;
    const a2 = p1.mul(p2).re;

    sos.push([b0, b1, b2, a0, a1, a2]);
  }

  // Step 7: Distribute gain
  const gainPerSection = Math.pow(gain, 1 / numSections);
  for (let i = 0; i < numSections; i++) {
    sos[i][0] *= gainPerSection;
    sos[i][1] *= gainPerSection;
    sos[i][2] *= gainPerSection;
  }

  return [sos, 1.0];
}

// Apply SOS filter
function sosfilt(sos: number[][], x: number[]): number[] {
  let y = [...x];
  const nSections = sos.length;

  for (let i = 0; i < nSections; i++) {
    const [b0, b1, b2, a0, a1, a2] = sos[i];

    // Apply biquad using Direct Form II Transposed
    let s1 = 0;
    let s2 = 0;

    for (let n = 0; n < y.length; n++) {
      const yOut = b0 * y[n] + s1;
      s1 = b1 * y[n] - a1 * yOut + s2;
      s2 = b2 * y[n] - a2 * yOut;
      y[n] = yOut;
    }
  }

  return y;
}

// Helper: Pair complex conjugates
function pairComplexConjugates(values: Complex[]): [Complex, Complex][] {
  const pairs: [Complex, Complex][] = [];
  const used = new Set<number>();

  for (let i = 0; i < values.length; i++) {
    if (used.has(i)) continue;

    const val = values[i];

    if (Math.abs(val.im) < 1e-10) {
      // Real value - pair with another real value
      let j = i + 1;
      while (j < values.length && (used.has(j) || Math.abs(values[j].im) > 1e-10)) {
        j++;
      }

      if (j < values.length) {
        pairs.push([val, values[j]]);
        used.add(i);
        used.add(j);
      } else {
        // Odd one out - pair with zero
        pairs.push([val, new Complex(0, 0)]);
        used.add(i);
      }
    } else {
      // Complex - find conjugate
      const conj = val.conj();
      let j = i + 1;
      while (j < values.length &&
             (used.has(j) || values[j].sub(conj).abs() > 1e-10)) {
        j++;
      }

      if (j < values.length) {
        pairs.push([val, values[j]]);
        used.add(i);
        used.add(j);
      }
    }
  }

  return pairs;
}
```

### Transfer Function Formulas

**Cascaded biquads**:
```
H(z) = g · ∏(i=1 to L) [(b₀ᵢ + b₁ᵢz⁻¹ + b₂ᵢz⁻²) / (1 + a₁ᵢz⁻¹ + a₂ᵢz⁻²)]
```

**Pole-zero form**:
```
H(z) = g · ∏[(z - zᵢ₁)(z - zᵢ₂)] / ∏[(z - pᵢ₁)(z - pᵢ₂)]
```

**Numerical advantages**:
- Reduced coefficient sensitivity
- Better finite-precision behavior
- Localized pole/zero errors

---

## Task 10: Transfer Function Conversions

### Mathematical Foundation

#### State-Space Representation

```
State equations:
x[n+1] = A*x[n] + B*u[n]
y[n] = C*x[n] + D*u[n]

where:
  x ∈ ℝⁿ (state vector)
  u ∈ ℝ (input)
  y ∈ ℝ (output)
  A ∈ ℝⁿˣⁿ (state matrix)
  B ∈ ℝⁿ (input matrix)
  C ∈ ℝ¹ˣⁿ (output matrix)
  D ∈ ℝ (feedthrough)
```

#### Transfer Function to State-Space (tf2ss)

**Controllable canonical form**:

For H(z) = B(z)/A(z):
```
A(z) = a₀ + a₁z⁻¹ + ... + aₙz⁻ⁿ
B(z) = b₀ + b₁z⁻¹ + ... + bₘz⁻ᵐ

Normalized: A(z) = 1 + a₁z⁻¹ + ... + aₙz⁻ⁿ
```

**State matrices**:
```
     ⎡-a₁  -a₂  ...  -aₙ₋₁  -aₙ⎤
     ⎢ 1    0   ...    0     0 ⎥
A =  ⎢ 0    1   ...    0     0 ⎥
     ⎢ ⋮    ⋮    ⋱     ⋮     ⋮ ⎥
     ⎣ 0    0   ...    1     0 ⎦

     ⎡1⎤
B =  ⎢0⎥
     ⎢⋮⎥
     ⎣0⎦

C = [b₁-a₁b₀  b₂-a₂b₀  ...  bₙ-aₙb₀]

D = b₀
```

#### State-Space to Transfer Function (ss2tf)

```
H(z) = C(zI - A)⁻¹B + D

Numerator: B(z) = det(zI - A) · [C * adj(zI - A) * B] + D · det(zI - A)
Denominator: A(z) = det(zI - A)
```

#### Zero-Pole-Gain (ZPK) Representation

```
       K · ∏(z - zᵢ)
H(z) = ────────────
       ∏(z - pᵢ)

where:
  K = gain
  zᵢ = zeros
  pᵢ = poles
```

### Algorithms

```
Algorithm: TF2SS(b, a)
Input:
  - b: Numerator coefficients [b₀, b₁, ..., bₘ]
  - a: Denominator coefficients [a₀, a₁, ..., aₙ]

Output:
  - A, B, C, D: State-space matrices

Steps:
1. Normalize coefficients:
   b = b / a[0]
   a = a / a[0]

2. Determine system order:
   n = length(a) - 1

3. Construct A matrix (companion form):
   A = zeros(n, n)
   A[0, :] = -a[1:n+1]  (first row is negative of a coefficients)

   For i = 1 to n-1:
     A[i, i-1] = 1  (subdiagonal)

4. Construct B matrix:
   B = zeros(n, 1)
   B[0] = 1

5. Construct C matrix:
   C = zeros(1, n)

   For i = 0 to min(m, n-1):
     If i+1 < length(b):
       C[i] = b[i+1] - a[i+1] * b[0]
     Else:
       C[i] = -a[i+1] * b[0]

6. Construct D:
   D = b[0]

7. Return A, B, C, D
```

```
Algorithm: SS2TF(A, B, C, D)
Input:
  - A: State matrix (n × n)
  - B: Input matrix (n × 1)
  - C: Output matrix (1 × n)
  - D: Feedthrough scalar

Output:
  - b: Numerator coefficients
  - a: Denominator coefficients

Steps:
1. Compute denominator from characteristic polynomial:
   a = char_poly(A)  // Coefficients of det(λI - A)

2. Compute numerator:
   n = size(A, 1)

   // Create symbolic variable z
   // Compute C * adj(zI - A) * B

   b = zeros(n + 1)

   For k = 0 to n:
     // Coefficient of z^k in C*(zI-A)^(-1)*B
     sum = 0

     For i = 0 to n-1:
       For j = 0 to n-1:
         cofactor = compute_cofactor(I*z - A, i, j, k)
         sum += C[i] * cofactor * B[j]

     b[n - k] = sum

   // Add feedthrough term
   b[0] += D * a[0]

3. Return b, a

Note: In practice, use more efficient algorithms like
      Leverrier's algorithm or solving linear equations
```

```
Algorithm: ZPK2SOS(zeros, poles, gain)
Input:
  - zeros: Array of zero locations
  - poles: Array of pole locations
  - gain: Overall system gain

Output:
  - sos: Second-order sections matrix

Steps:
1. Pair complex conjugates:
   zero_pairs = pair_conjugates(zeros)
   pole_pairs = pair_conjugates(poles)

2. Balance number of sections:
   n_sections = max(length(zero_pairs), length(pole_pairs))

   While length(zero_pairs) < n_sections:
     zero_pairs.append([0, 0])  // Add zeros at origin

3. Order sections (closest to unit circle first):
   pole_pairs = sort(pole_pairs, by = distance_to_unit_circle)

4. Match pole and zero pairs:
   For i = 1 to n_sections:
     Find zero_pair closest to pole_pairs[i]
     Create section from this pair

5. Create SOS matrix:
   sos = zeros(n_sections, 6)

   For i = 1 to n_sections:
     [z1, z2] = zero_pairs[i]
     [p1, p2] = pole_pairs[i]

     // Numerator
     b = poly([z1, z2])

     // Denominator
     a = poly([p1, p2])

     // Normalize
     sos[i, :] = [b[0]/a[0], b[1]/a[0], b[2]/a[0],
                  1, a[1]/a[0], a[2]/a[0]]

6. Distribute gain:
   g_per_section = gain^(1/n_sections)
   sos[:, 0:3] *= g_per_section

7. Return sos
```

### Pseudocode

```typescript
function tf2ss(b: number[], a: number[]):
  {A: number[][], B: number[], C: number[], D: number} {

  // Normalize
  const a0 = a[0];
  const bNorm = b.map(x => x / a0);
  const aNorm = a.map(x => x / a0);

  const n = aNorm.length - 1;  // Order

  // Construct A (companion form)
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);

    if (i === 0) {
      // First row: -a[1], -a[2], ..., -a[n]
      for (let j = 0; j < n; j++) {
        row[j] = -aNorm[j + 1];
      }
    } else {
      // Subdiagonal: 1 at position [i, i-1]
      row[i - 1] = 1;
    }

    A.push(row);
  }

  // Construct B
  const B = new Array(n).fill(0);
  B[0] = 1;

  // Construct C
  const C = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (i + 1 < bNorm.length) {
      C[i] = bNorm[i + 1] - aNorm[i + 1] * bNorm[0];
    } else {
      C[i] = -aNorm[i + 1] * bNorm[0];
    }
  }

  // Construct D
  const D = bNorm[0];

  return { A, B, C, D };
}

function ss2tf(A: number[][], B: number[], C: number[], D: number):
  [number[], number[]] {

  const n = A.length;

  // Compute denominator (characteristic polynomial)
  const a = characteristicPolynomial(A);

  // Compute numerator using Fadeev's algorithm or matrix methods
  const b = new Array(n + 1).fill(0);

  // Use formula: num = C * adj(zI - A) * B + D * den
  // This requires computing the adjugate matrix at each power of z

  // Simpler approach: Convert to ZPK then back to TF
  const poles = eigenvalues(A);

  // Zeros from Rosenbrock system matrix
  // [A - zI,  B]
  // [C,      D]
  const zeros = computeTransmissionZeros(A, B, C, D);

  // Gain from D and steady-state gain
  let K: number;
  if (Math.abs(D) > 1e-10) {
    K = D;
  } else {
    // Compute from C*(I-A)^(-1)*B
    const IminusA = subtractMatrices(identityMatrix(n), A);
    const inv = invertMatrix(IminusA);
    const product = matrixVectorMultiply(inv, B);
    K = dotProduct(C, product);
  }

  // Convert ZPK to TF
  [b, a] = zpk2tf(zeros, poles, K);

  return [b, a];
}

function zpk2sos(zeros: Complex[], poles: Complex[], gain: number):
  number[][] {

  // Pair complex conjugates
  const zeroPairs = pairComplexConjugates(zeros);
  const polePairs = pairComplexConjugates(poles);

  const nSections = Math.max(zeroPairs.length, polePairs.length);

  // Pad zero pairs if needed
  while (zeroPairs.length < nSections) {
    zeroPairs.push([new Complex(0, 0), new Complex(0, 0)]);
  }

  // Order pole pairs by distance to unit circle
  polePairs.sort((a, b) => {
    const distA = Math.abs(1 - a[0].abs());
    const distB = Math.abs(1 - b[0].abs());
    return distA - distB;
  });

  // Match pairs
  const matchedPairs = matchPoleZeroPairs(polePairs, zeroPairs);

  // Create SOS matrix
  const sos: number[][] = [];
  const gainPerSection = Math.pow(gain, 1 / nSections);

  for (const [polePair, zeroPair] of matchedPairs) {
    const [p1, p2] = polePair;
    const [z1, z2] = zeroPair;

    // Numerator: (z - z1)(z - z2)
    const bCoeffs = poly([z1, z2]);

    // Denominator: (z - p1)(z - p2)
    const aCoeffs = poly([p1, p2]);

    // Normalize and apply gain
    const section = [
      gainPerSection * bCoeffs[0] / aCoeffs[0],
      gainPerSection * bCoeffs[1] / aCoeffs[0],
      gainPerSection * bCoeffs[2] / aCoeffs[0],
      1,
      aCoeffs[1] / aCoeffs[0],
      aCoeffs[2] / aCoeffs[0]
    ];

    sos.push(section);
  }

  return sos;
}

// Helper: Compute characteristic polynomial
function characteristicPolynomial(A: number[][]): number[] {
  // Returns coefficients of det(λI - A)
  const n = A.length;

  // Use Fadeev-LeVerrier algorithm
  const coeffs = new Array(n + 1);
  coeffs[0] = 1;

  let M = identityMatrix(n);

  for (let k = 1; k <= n; k++) {
    M = matrixMultiply(A, M);
    const tr = trace(M);
    coeffs[k] = -tr / k;

    // M = A*M + c_k*I
    for (let i = 0; i < n; i++) {
      M[i][i] += coeffs[k];
    }
  }

  return coeffs;
}
```

### Transfer Function Formulas

**Transfer function**:
```
       b₀ + b₁z⁻¹ + ... + bₘz⁻ᵐ
H(z) = ─────────────────────────
       a₀ + a₁z⁻¹ + ... + aₙz⁻ⁿ
```

**State-space**:
```
H(z) = C(zI - A)⁻¹B + D

Expanded:
       C · adj(zI - A) · B
     = ───────────────────── + D
         det(zI - A)
```

**Zero-pole-gain**:
```
       K(z - z₁)(z - z₂)···(z - zₘ)
H(z) = ────────────────────────────
       (z - p₁)(z - p₂)···(z - pₙ)
```

**Relationship**:
```
Poles: roots of denominator = eigenvalues of A
Zeros: roots of numerator = transmission zeros
Gain: K = lim[z→∞] H(z) = b₀/a₀ = D (for proper systems)
```

---

## Implementation Considerations

### Numerical Stability

1. **Use double precision**: Critical for filter coefficient accuracy
2. **Scaling**: Normalize filter gains to prevent overflow
3. **SOS form**: Preferred for high-order filters (order > 6)
4. **Initial conditions**: Proper zi calculation prevents transients

### Performance Optimization

1. **WASM acceleration**: Implement core filtering loops in AssemblyScript
2. **SIMD**: Use vector operations for parallel sample processing
3. **FFT**: Leverage optimized FFT for convolution
4. **Caching**: Precompute filter coefficients and states

### Bilinear Transform Formula

```
Mapping: s → (2/T) * (z - 1)/(z + 1)

Frequency warping:
ω_digital = 2 * arctan(ω_analog * T/2)

Prewarp for exact frequency match:
ω_analog = (2/T) * tan(ω_digital * T/2)
```

### Testing Strategy

1. **Unit tests**: Known filter responses (Butterworth, etc.)
2. **Numerical accuracy**: Compare with MATLAB/SciPy
3. **Stability**: Ensure all poles inside unit circle
4. **Phase linearity**: Verify FIR linear phase
5. **Performance**: Benchmark against reference implementations

---

## Summary

This phase implements comprehensive digital filter design covering:

- **IIR Filters**: Butterworth, Chebyshev I/II, Elliptic with optimal characteristics
- **FIR Filters**: Window method with various window functions
- **Filter Application**: Direct Form II Transposed, zero-phase filtering
- **Convolution**: Direct and FFT-based fast convolution
- **Representations**: Transfer function, state-space, zero-pole-gain, SOS

All implementations emphasize numerical stability, computational efficiency, and MATLAB compatibility.

---

## References

1. Oppenheim, A. V., & Schafer, R. W. (2009). *Discrete-Time Signal Processing*. Pearson.
2. Parks, T. W., & Burrus, C. S. (1987). *Digital Filter Design*. Wiley.
3. Rabiner, L. R., & Gold, B. (1975). *Theory and Application of Digital Signal Processing*. Prentice-Hall.
4. MATLAB Signal Processing Toolbox Documentation
5. SciPy `scipy.signal` module documentation
