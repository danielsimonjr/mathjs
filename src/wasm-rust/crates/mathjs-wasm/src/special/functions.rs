//! Special mathematical functions: erf, gamma, zeta, bessel, etc.
//! Uses statrs for gamma/erf where available, with manual implementations for others.

use core::f64::consts::PI;

// Lanczos coefficients for gamma function
const LANCZOS_G: f64 = 7.0;
const LANCZOS_C: [f64; 9] = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
];

/// Error function erf(x).
#[no_mangle]
pub extern "C" fn erf(x: f64) -> f64 {
    statrs::function::erf::erf(x)
}

/// Compute erf for an array.
#[no_mangle]
pub unsafe extern "C" fn erfArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = erf(*a_ptr.add(i));
    }
}

/// Complementary error function erfc(x) = 1 - erf(x).
#[no_mangle]
pub extern "C" fn erfc(x: f64) -> f64 {
    1.0 - erf(x)
}

/// Compute erfc for an array.
#[no_mangle]
pub unsafe extern "C" fn erfcArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = erfc(*a_ptr.add(i));
    }
}

/// Gamma function using Lanczos approximation.
#[no_mangle]
pub extern "C" fn gamma(x: f64) -> f64 {
    if x != x {
        return f64::NAN;
    }
    if x < 0.5 {
        return PI / (libm::sin(PI * x) * gamma(1.0 - x));
    }
    let x = x - 1.0;
    let t = x + LANCZOS_G + 0.5;
    let mut a = LANCZOS_C[0];
    for i in 1..9 {
        a += LANCZOS_C[i] / (x + i as f64);
    }
    core::f64::consts::SQRT_2 * 1.7724538509055159 * libm::pow(t, x + 0.5) * libm::exp(-t) * a
}

/// Compute gamma for an array.
#[no_mangle]
pub unsafe extern "C" fn gammaArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = gamma(*a_ptr.add(i));
    }
}

/// Log-gamma function.
#[no_mangle]
pub extern "C" fn lgamma(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::INFINITY;
    }
    if x < 0.5 {
        let ln_pi = 1.1447298858494002_f64;
        return ln_pi - libm::log(libm::fabs(libm::sin(PI * x))) - lgamma(1.0 - x);
    }
    let x = x - 1.0;
    let t = x + LANCZOS_G + 0.5;
    let mut a = LANCZOS_C[0];
    for i in 1..9 {
        a += LANCZOS_C[i] / (x + i as f64);
    }
    0.5 * libm::log(2.0 * PI) + (x + 0.5) * libm::log(t) - t + libm::log(a)
}

/// Compute lgamma for an array.
#[no_mangle]
pub unsafe extern "C" fn lgammaArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = lgamma(*a_ptr.add(i));
    }
}

fn zeta_positive(s: f64) -> f64 {
    let n = 50_i32;
    let mut sum = 0.0_f64;
    let mut sign = 1.0_f64;
    for k in 1..=n {
        sum += sign / libm::pow(k as f64, s);
        sign = -sign;
    }
    let eta = sum;
    let conversion = 1.0 - libm::pow(2.0, 1.0 - s);
    if libm::fabs(conversion) < 1e-15 {
        sum = 0.0;
        for k in 1..=(n * 2) {
            sum += 1.0 / libm::pow(k as f64, s);
        }
        return sum;
    }
    eta / conversion
}

/// Riemann zeta function.
#[no_mangle]
pub extern "C" fn zeta(s: f64) -> f64 {
    if s == 1.0 {
        return f64::INFINITY;
    }
    if s == 0.0 {
        return -0.5;
    }
    if s < 0.0 && libm::floor(s) == s && ((s as i32) & 1) == 0 {
        return 0.0;
    }
    if s > 1.0 {
        return zeta_positive(s);
    }
    let factor =
        libm::pow(2.0, s) * libm::pow(PI, s - 1.0) * libm::sin(PI * s / 2.0) * gamma(1.0 - s);
    factor * zeta_positive(1.0 - s)
}

/// Compute zeta for an array.
#[no_mangle]
pub unsafe extern "C" fn zetaArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = zeta(*a_ptr.add(i));
    }
}

/// Beta function: B(a,b) = Gamma(a)*Gamma(b)/Gamma(a+b).
#[no_mangle]
pub extern "C" fn beta(a: f64, b: f64) -> f64 {
    libm::exp(lgamma(a) + lgamma(b) - lgamma(a + b))
}

fn gammainc_series(a: f64, x: f64) -> f64 {
    let mut sum = 1.0 / a;
    let mut term = 1.0 / a;
    for n in 1..100 {
        term *= x / (a + n as f64);
        sum += term;
        if libm::fabs(term) < 1e-15 * libm::fabs(sum) {
            break;
        }
    }
    sum * libm::exp(-x + a * libm::log(x) - lgamma(a))
}

fn gammainc_cf(a: f64, x: f64) -> f64 {
    let mut b = x + 1.0 - a;
    let mut c = 1.0 / 1e-30;
    let mut d = 1.0 / b;
    let mut h = d;
    for i in 1..100 {
        let an = -(i as f64) * (i as f64 - a);
        b += 2.0;
        d = an * d + b;
        if libm::fabs(d) < 1e-30 {
            d = 1e-30;
        }
        c = b + an / c;
        if libm::fabs(c) < 1e-30 {
            c = 1e-30;
        }
        d = 1.0 / d;
        let del = d * c;
        h *= del;
        if libm::fabs(del - 1.0) < 1e-15 {
            break;
        }
    }
    libm::exp(-x + a * libm::log(x) - lgamma(a)) * h
}

/// Regularized lower incomplete gamma P(a, x).
#[no_mangle]
pub extern "C" fn gammainc(a: f64, x: f64) -> f64 {
    if x < 0.0 || a <= 0.0 {
        return f64::NAN;
    }
    if x == 0.0 {
        return 0.0;
    }
    if x < a + 1.0 {
        gammainc_series(a, x)
    } else {
        1.0 - gammainc_cf(a, x)
    }
}

/// Digamma (psi) function.
#[no_mangle]
pub extern "C" fn digamma(mut x: f64) -> f64 {
    if x < 0.0 {
        return digamma(1.0 - x) - PI / libm::tan(PI * x);
    }
    let mut result = 0.0_f64;
    while x < 6.0 {
        result -= 1.0 / x;
        x += 1.0;
    }
    let x2 = 1.0 / (x * x);
    result += libm::log(x)
        - 0.5 / x
        - x2 * (1.0 / 12.0 - x2 * (1.0 / 120.0 - x2 * (1.0 / 252.0 - x2 * (1.0 / 240.0))));
    result
}

/// Compute digamma for an array.
#[no_mangle]
pub unsafe extern "C" fn digammaArray(a_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    for i in 0..n as usize {
        *result_ptr.add(i) = digamma(*a_ptr.add(i));
    }
}

/// Bessel J0(x).
#[no_mangle]
pub extern "C" fn besselJ0(x: f64) -> f64 {
    let x = libm::fabs(x);
    if x < 8.0 {
        let y = x * x;
        let ans1 = 57568490574.0
            + y * (-13362590354.0
                + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))));
        let ans2 = 57568490411.0
            + y * (1029532985.0 + y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y))));
        ans1 / ans2
    } else {
        let z = 8.0 / x;
        let y = z * z;
        let xx = x - 0.785398164;
        let ans1 = 1.0
            + y * (-0.001098628627
                + y * (0.00002734510407 + y * (-0.000002073370639 + y * 0.0000002093887211)));
        let ans2 = -0.01562499995
            + y * (0.0001430488765
                + y * (-0.000006911147651 + y * (0.0000007621095161 - y * 0.0000000934935152)));
        libm::sqrt(0.636619772 / x) * (libm::cos(xx) * ans1 - z * libm::sin(xx) * ans2)
    }
}

/// Bessel J1(x).
#[no_mangle]
pub extern "C" fn besselJ1(x: f64) -> f64 {
    let sign = if x < 0.0 { -1.0 } else { 1.0 };
    let x = libm::fabs(x);
    if x < 8.0 {
        let y = x * x;
        let ans1 = x
            * (72362614232.0
                + y * (-7895059235.0
                    + y * (242396853.1
                        + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))));
        let ans2 = 144725228442.0
            + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
        (sign * ans1) / ans2
    } else {
        let z = 8.0 / x;
        let y = z * z;
        let xx = x - 2.356194491;
        let ans1 = 1.0
            + y * (0.00183105
                + y * (-0.00003516396496 + y * (0.000002457520174 - y * 0.0000002404127372)));
        let ans2 = 0.04687499995
            + y * (-0.0002002690873
                + y * (0.000008449199096 + y * (-0.0000008820898866 + y * 0.0000001057874125)));
        sign * libm::sqrt(0.636619772 / x) * (libm::cos(xx) * ans1 - z * libm::sin(xx) * ans2)
    }
}

/// Bessel Y0(x) (x > 0).
#[no_mangle]
pub extern "C" fn besselY0(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::NAN;
    }
    if x < 8.0 {
        let y = x * x;
        let ans1 = -2957821389.0
            + y * (7062834065.0
                + y * (-512359803.6 + y * (10879881.29 + y * (-86327.92757 + y * 228.4622733))));
        let ans2 = 40076544269.0
            + y * (745249964.8 + y * (7189466.438 + y * (47447.2647 + y * (226.1030244 + y))));
        ans1 / ans2 + 0.636619772 * besselJ0(x) * libm::log(x)
    } else {
        let z = 8.0 / x;
        let y = z * z;
        let xx = x - 0.785398164;
        let ans1 = 1.0
            + y * (-0.001098628627
                + y * (0.00002734510407 + y * (-0.000002073370639 + y * 0.0000002093887211)));
        let ans2 = -0.01562499995
            + y * (0.0001430488765
                + y * (-0.000006911147651 + y * (0.0000007621095161 - y * 0.0000000934935152)));
        libm::sqrt(0.636619772 / x) * (libm::sin(xx) * ans1 + z * libm::cos(xx) * ans2)
    }
}

/// Bessel Y1(x) (x > 0).
#[no_mangle]
pub extern "C" fn besselY1(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::NAN;
    }
    if x < 8.0 {
        let y = x * x;
        let ans1 = x
            * (-4900604943000.0
                + y * (1275274390000.0
                    + y * (-51534381390.0
                        + y * (734926455.1 + y * (-4237922.726 + y * 8511.937935)))));
        let ans2 = 24909857380000.0
            + y * (424441966400.0
                + y * (3733650367.0
                    + y * (22459040.02 + y * (102042.605 + y * (354.9632885 + y)))));
        ans1 / ans2 + 0.636619772 * (besselJ1(x) * libm::log(x) - 1.0 / x)
    } else {
        let z = 8.0 / x;
        let y = z * z;
        let xx = x - 2.356194491;
        let ans1 = 1.0
            + y * (0.00183105
                + y * (-0.00003516396496 + y * (0.000002457520174 - y * 0.0000002404127372)));
        let ans2 = 0.04687499995
            + y * (-0.0002002690873
                + y * (0.000008449199096 + y * (-0.0000008820898866 + y * 0.0000001057874125)));
        libm::sqrt(0.636619772 / x) * (libm::sin(xx) * ans1 + z * libm::cos(xx) * ans2)
    }
}
