//! Unit conversion (ported from src/wasm/unit/conversion.ts)

use libm;

fn is_temperature_unit(code: i32) -> bool {
    code >= 400 && code < 500
}

#[no_mangle]
pub unsafe extern "C" fn getConversionFactor(unit_code: i32) -> f64 {
    match unit_code {
        // Length
        100 => 1.0,
        101 => 1000.0,
        102 => 0.01,
        103 => 0.001,
        104 => 1e-6,
        105 => 1e-9,
        106 => 0.0254,
        107 => 0.3048,
        108 => 0.9144,
        109 => 1609.344,
        110 => 1852.0,
        111 => 1e-10,
        112 => 9.4607304725808e15,
        113 => 3.0856775814914e16,
        114 => 1.495978707e11,
        // Mass
        200 => 1.0,
        201 => 0.001,
        202 => 1e-6,
        203 => 1e-9,
        204 => 1000.0,
        205 => 0.45359237,
        206 => 0.028349523125,
        207 => 6.35029318,
        208 => 6.479891e-5,
        209 => 14.593903,
        210 => 1.6605390666e-27,
        // Time
        300 => 1.0,
        301 => 0.001,
        302 => 1e-6,
        303 => 1e-9,
        304 => 60.0,
        305 => 3600.0,
        306 => 86400.0,
        307 => 604800.0,
        308 => 31557600.0,
        309 => 315576000.0,
        310 => 3155760000.0,
        // Temperature
        400 => 1.0,
        401 => 1.0,
        402 => 5.0 / 9.0,
        403 => 5.0 / 9.0,
        // Current
        500 => 1.0,
        501 => 0.001,
        502 => 1e-6,
        // Amount
        600 => 1.0,
        601 => 0.001,
        602 => 1e-6,
        // Luminosity
        700 => 1.0,
        // Force
        800 => 1.0,
        801 => 1e-5,
        802 => 4.4482216152605,
        803 => 9.80665,
        // Energy
        900 => 1.0,
        901 => 1000.0,
        902 => 4.184,
        903 => 4184.0,
        904 => 1055.06,
        905 => 1.602176634e-19,
        906 => 3600.0,
        907 => 3600000.0,
        908 => 1e-7,
        // Power
        1000 => 1.0,
        1001 => 1000.0,
        1002 => 1e6,
        1003 => 745.7,
        // Pressure
        1100 => 1.0,
        1101 => 1000.0,
        1102 => 100000.0,
        1103 => 101325.0,
        1104 => 133.322368421,
        1105 => 6894.757293168,
        1106 => 133.322387415,
        // Frequency
        1200 => 1.0,
        1201 => 1000.0,
        1202 => 1e6,
        1203 => 1e9,
        // Voltage
        1300 => 1.0,
        1301 => 0.001,
        // Resistance
        1302 => 1.0,
        1303 => 1000.0,
        1304 => 1e6,
        // Capacitance
        1305 => 1.0,
        1306 => 1e-6,
        1307 => 1e-9,
        1308 => 1e-12,
        // Others
        1309 => 1.0,
        1310 => 1.0,
        1311 => 1.0,
        1312 => 1.0,
        1313 => 1.0,
        // Area
        1400 => 1.0,
        1401 => 1e6,
        1402 => 10000.0,
        1403 => 4046.8564224,
        1404 => 0.09290304,
        1405 => 0.00064516,
        1406 => 2589988.110336,
        // Volume
        1500 => 1.0,
        1501 => 0.001,
        1502 => 1e-6,
        1503 => 0.003785411784,
        1504 => 0.000946352946,
        1505 => 0.000473176473,
        1506 => 0.0002365882365,
        1507 => 2.95735295625e-5,
        1508 => 1.6387064e-5,
        1509 => 0.028316846592,
        // Speed
        1600 => 1.0,
        1601 => 1.0 / 3.6,
        1602 => 0.44704,
        1603 => 0.514444444,
        1604 => 0.3048,
        1605 => 299792458.0,
        // Angle
        1700 => 1.0,
        1701 => core::f64::consts::PI / 180.0,
        1702 => core::f64::consts::PI / 200.0,
        1703 => core::f64::consts::PI / 10800.0,
        1704 => core::f64::consts::PI / 648000.0,
        1705 => 2.0 * core::f64::consts::PI,
        // Data
        1800 => 1.0,
        1801 => 8.0,
        1802 => 8000.0,
        1803 => 8e6,
        1804 => 8e9,
        1805 => 8e12,
        1806 => 8192.0,
        1807 => 8388608.0,
        1808 => 8589934592.0,
        1809 => 8796093022208.0,
        _ => 1.0,
    }
}

#[no_mangle]
pub unsafe extern "C" fn getTemperatureOffset(unit_code: i32) -> f64 {
    match unit_code {
        400 => 0.0,
        401 => 273.15,
        402 => (459.67 * 5.0) / 9.0,
        403 => 0.0,
        _ => 0.0,
    }
}

#[no_mangle]
pub unsafe extern "C" fn convert(value: f64, from_unit: i32, to_unit: i32) -> f64 {
    if from_unit == to_unit {
        return value;
    }
    if is_temperature_unit(from_unit) && is_temperature_unit(to_unit) {
        let kelvin = value * getConversionFactor(from_unit) + getTemperatureOffset(from_unit);
        return (kelvin - getTemperatureOffset(to_unit)) / getConversionFactor(to_unit);
    }
    let si_value = value * getConversionFactor(from_unit);
    si_value / getConversionFactor(to_unit)
}

#[no_mangle]
pub unsafe extern "C" fn convertArray(
    values_ptr: *const f64,
    from_unit: i32,
    to_unit: i32,
    n: i32,
    result_ptr: *mut f64,
) {
    if from_unit == to_unit {
        for i in 0..n as usize {
            *result_ptr.add(i) = *values_ptr.add(i);
        }
        return;
    }
    if is_temperature_unit(from_unit) && is_temperature_unit(to_unit) {
        let factor = getConversionFactor(from_unit);
        let offset_from = getTemperatureOffset(from_unit);
        let offset_to = getTemperatureOffset(to_unit);
        let factor_to = getConversionFactor(to_unit);
        for i in 0..n as usize {
            let kelvin = *values_ptr.add(i) * factor + offset_from;
            *result_ptr.add(i) = (kelvin - offset_to) / factor_to;
        }
    } else {
        let factor_ratio = getConversionFactor(from_unit) / getConversionFactor(to_unit);
        for i in 0..n as usize {
            *result_ptr.add(i) = *values_ptr.add(i) * factor_ratio;
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn toSI(value: f64, from_unit: i32) -> f64 {
    if is_temperature_unit(from_unit) {
        value * getConversionFactor(from_unit) + getTemperatureOffset(from_unit)
    } else {
        value * getConversionFactor(from_unit)
    }
}

#[no_mangle]
pub unsafe extern "C" fn fromSI(si_value: f64, to_unit: i32) -> f64 {
    if is_temperature_unit(to_unit) {
        (si_value - getTemperatureOffset(to_unit)) / getConversionFactor(to_unit)
    } else {
        si_value / getConversionFactor(to_unit)
    }
}

#[no_mangle]
pub unsafe extern "C" fn getDimensions(unit_code: i32, result_ptr: *mut f64) {
    for i in 0..7 {
        *result_ptr.add(i) = 0.0;
    }
    match unit_code {
        100..=199 => {
            *result_ptr = 1.0;
        } // Length
        200..=299 => {
            *result_ptr.add(1) = 1.0;
        } // Mass
        300..=399 => {
            *result_ptr.add(2) = 1.0;
        } // Time
        400..=499 => {
            *result_ptr.add(4) = 1.0;
        } // Temperature
        500..=599 => {
            *result_ptr.add(3) = 1.0;
        } // Current
        600..=699 => {
            *result_ptr.add(5) = 1.0;
        } // Amount
        700..=799 => {
            *result_ptr.add(6) = 1.0;
        } // Luminosity
        800..=899 => {
            *result_ptr.add(1) = 1.0;
            *result_ptr = 1.0;
            *result_ptr.add(2) = -2.0;
        }
        900..=999 => {
            *result_ptr.add(1) = 1.0;
            *result_ptr = 2.0;
            *result_ptr.add(2) = -2.0;
        }
        1000..=1099 => {
            *result_ptr.add(1) = 1.0;
            *result_ptr = 2.0;
            *result_ptr.add(2) = -3.0;
        }
        1100..=1199 => {
            *result_ptr.add(1) = 1.0;
            *result_ptr = -1.0;
            *result_ptr.add(2) = -2.0;
        }
        1200..=1299 => {
            *result_ptr.add(2) = -1.0;
        }
        1400..=1499 => {
            *result_ptr = 2.0;
        }
        1500..=1599 => {
            *result_ptr = 3.0;
        }
        1600..=1699 => {
            *result_ptr = 1.0;
            *result_ptr.add(2) = -1.0;
        }
        _ => {}
    }
}

#[no_mangle]
pub unsafe extern "C" fn areCompatible(unit1: i32, unit2: i32, work_ptr: *mut f64) -> i32 {
    getDimensions(unit1, work_ptr);
    getDimensions(unit2, work_ptr.add(7));
    for i in 0..7 {
        if *work_ptr.add(i) != *work_ptr.add(7 + i) {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn multiplyDimensions(d1: *const f64, d2: *const f64, result_ptr: *mut f64) {
    for i in 0..7 {
        *result_ptr.add(i) = *d1.add(i) + *d2.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn divideDimensions(d1: *const f64, d2: *const f64, result_ptr: *mut f64) {
    for i in 0..7 {
        *result_ptr.add(i) = *d1.add(i) - *d2.add(i);
    }
}

#[no_mangle]
pub unsafe extern "C" fn powerDimensions(dims_ptr: *const f64, power: f64, result_ptr: *mut f64) {
    for i in 0..7 {
        *result_ptr.add(i) = *dims_ptr.add(i) * power;
    }
}

#[no_mangle]
pub unsafe extern "C" fn isDimensionless(dims_ptr: *const f64) -> i32 {
    for i in 0..7 {
        if *dims_ptr.add(i) != 0.0 {
            return 0;
        }
    }
    1
}

#[no_mangle]
pub unsafe extern "C" fn getPrefixMultiplier(prefix_power: i32) -> f64 {
    libm::pow(10.0, prefix_power as f64)
}

#[no_mangle]
pub unsafe extern "C" fn applyPrefix(value: f64, prefix_power: i32) -> f64 {
    value * libm::pow(10.0, prefix_power as f64)
}

#[no_mangle]
pub unsafe extern "C" fn removePrefix(value: f64, prefix_power: i32) -> f64 {
    value / libm::pow(10.0, prefix_power as f64)
}
