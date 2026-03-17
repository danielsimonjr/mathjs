//! Plain number probability functions (ported from src/wasm/plain/probability.ts)

use libm;

const GAMMA_G: f64 = 4.7421875;

fn get_gamma_p(index: i32) -> f64 {
    match index {
        0 => 0.99999999999999709182,
        1 => 57.156235665862923517,
        2 => -59.597960355475491248,
        3 => 14.136097974741747174,
        4 => -0.49191381609762019978,
        5 => 0.33994649984811888699e-4,
        6 => 0.46523628927048575665e-4,
        7 => -0.98374475304879564677e-4,
        8 => 0.15808870322491248884e-3,
        9 => -0.21026444172410488319e-3,
        10 => 0.2174396181152126432e-3,
        11 => -0.16431810653676389022e-3,
        12 => 0.84418223983852743293e-4,
        13 => -0.2619083840158140867e-4,
        14 => 0.36899182659531622704e-5,
        _ => 0.0,
    }
}

fn is_integer_number(x: f64) -> bool {
    x == libm::floor(x) && x.is_finite()
}

fn product(start: f64, end: f64) -> f64 {
    let mut result = 1.0;
    let mut i = start;
    while i <= end {
        result *= i;
        i += 1.0;
    }
    result
}

#[no_mangle]
pub unsafe extern "C" fn gammaNumber(n: f64) -> f64 {
    if is_integer_number(n) {
        if n <= 0.0 {
            return if n.is_finite() {
                f64::INFINITY
            } else {
                f64::NAN
            };
        }
        if n > 171.0 {
            return f64::INFINITY;
        }
        return product(1.0, n - 1.0);
    }

    if n < 0.5 {
        return core::f64::consts::PI
            / (libm::sin(core::f64::consts::PI * n) * gammaNumber(1.0 - n));
    }

    if n >= 171.35 {
        return f64::INFINITY;
    }

    if n > 85.0 {
        let two_n = n * n;
        let three_n = two_n * n;
        let four_n = three_n * n;
        let five_n = four_n * n;
        return libm::sqrt((2.0 * core::f64::consts::PI) / n)
            * libm::pow(n / core::f64::consts::E, n)
            * (1.0 + 1.0 / (12.0 * n) + 1.0 / (288.0 * two_n)
                - 139.0 / (51840.0 * three_n)
                - 571.0 / (2488320.0 * four_n)
                + 163879.0 / (209018880.0 * five_n)
                + 5246819.0 / (75246796800.0 * five_n * n));
    }

    let n = n - 1.0;
    let mut x = get_gamma_p(0);
    for i in 1..15 {
        x += get_gamma_p(i) / (n + i as f64);
    }

    let t = n + GAMMA_G + 0.5;
    libm::sqrt(2.0 * core::f64::consts::PI) * libm::pow(t, n + 0.5) * libm::exp(-t) * x
}

const LN_SQRT_2PI: f64 = 0.91893853320467274178;
const LGAMMA_G: f64 = 5.0;
const LGAMMA_N: i32 = 7;

fn get_lgamma_series(index: i32) -> f64 {
    match index {
        0 => 1.000000000190015,
        1 => 76.18009172947146,
        2 => -86.50532032941677,
        3 => 24.01409824083091,
        4 => -1.231739572450155,
        5 => 0.1208650973866179e-2,
        6 => -0.5395239384953e-5,
        _ => 0.0,
    }
}

#[no_mangle]
pub unsafe extern "C" fn lgammaNumber(n: f64) -> f64 {
    if n < 0.0 {
        return f64::NAN;
    }
    if n == 0.0 {
        return f64::INFINITY;
    }
    if !n.is_finite() {
        return n;
    }

    if n < 0.5 {
        return libm::log(core::f64::consts::PI / libm::sin(core::f64::consts::PI * n))
            - lgammaNumber(1.0 - n);
    }

    let n_adjusted = n - 1.0;
    let base = n_adjusted + LGAMMA_G + 0.5;
    let mut sum = get_lgamma_series(0);

    for i in (1..LGAMMA_N).rev() {
        sum += get_lgamma_series(i) / (n_adjusted + i as f64);
    }

    LN_SQRT_2PI + (n_adjusted + 0.5) * libm::log(base) - base + libm::log(sum)
}
