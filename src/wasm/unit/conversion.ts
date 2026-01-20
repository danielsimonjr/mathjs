/**
 * Unit Conversion for AssemblyScript/WASM
 *
 * WASM-compatible numeric unit conversion system.
 * Uses numeric unit codes instead of string parsing.
 *
 * This provides the computational core for unit conversions,
 * while the JavaScript layer handles parsing and unit names.
 *
 * SI base units are represented in a 7-dimensional vector:
 * [length, mass, time, current, temperature, amount, luminosity]
 *
 * Each unit is defined by:
 * - A conversion factor (to SI base)
 * - An offset (for non-linear conversions like temperature)
 * - Dimension vector (for dimensional analysis)
 */

// ============================================================================
// UNIT DIMENSION CONSTANTS
// ============================================================================

// Dimension indices
const DIM_LENGTH: i32 = 0
const DIM_MASS: i32 = 1
const DIM_TIME: i32 = 2
const DIM_CURRENT: i32 = 3
const DIM_TEMPERATURE: i32 = 4
const DIM_AMOUNT: i32 = 5
const DIM_LUMINOSITY: i32 = 6

// Number of base dimensions
const NUM_DIMENSIONS: i32 = 7

// ============================================================================
// UNIT CODES
// ============================================================================

// Length units (100-199)
export const UNIT_METER: i32 = 100
export const UNIT_KILOMETER: i32 = 101
export const UNIT_CENTIMETER: i32 = 102
export const UNIT_MILLIMETER: i32 = 103
export const UNIT_MICROMETER: i32 = 104
export const UNIT_NANOMETER: i32 = 105
export const UNIT_INCH: i32 = 106
export const UNIT_FOOT: i32 = 107
export const UNIT_YARD: i32 = 108
export const UNIT_MILE: i32 = 109
export const UNIT_NAUTICAL_MILE: i32 = 110
export const UNIT_ANGSTROM: i32 = 111
export const UNIT_LIGHT_YEAR: i32 = 112
export const UNIT_PARSEC: i32 = 113
export const UNIT_AU: i32 = 114

// Mass units (200-299)
export const UNIT_KILOGRAM: i32 = 200
export const UNIT_GRAM: i32 = 201
export const UNIT_MILLIGRAM: i32 = 202
export const UNIT_MICROGRAM: i32 = 203
export const UNIT_TONNE: i32 = 204
export const UNIT_POUND: i32 = 205
export const UNIT_OUNCE: i32 = 206
export const UNIT_STONE: i32 = 207
export const UNIT_GRAIN: i32 = 208
export const UNIT_SLUG: i32 = 209
export const UNIT_AMU: i32 = 210

// Time units (300-399)
export const UNIT_SECOND: i32 = 300
export const UNIT_MILLISECOND: i32 = 301
export const UNIT_MICROSECOND: i32 = 302
export const UNIT_NANOSECOND: i32 = 303
export const UNIT_MINUTE: i32 = 304
export const UNIT_HOUR: i32 = 305
export const UNIT_DAY: i32 = 306
export const UNIT_WEEK: i32 = 307
export const UNIT_YEAR: i32 = 308
export const UNIT_DECADE: i32 = 309
export const UNIT_CENTURY: i32 = 310

// Temperature units (400-499)
export const UNIT_KELVIN: i32 = 400
export const UNIT_CELSIUS: i32 = 401
export const UNIT_FAHRENHEIT: i32 = 402
export const UNIT_RANKINE: i32 = 403

// Electric current units (500-599)
export const UNIT_AMPERE: i32 = 500
export const UNIT_MILLIAMPERE: i32 = 501
export const UNIT_MICROAMPERE: i32 = 502

// Amount of substance (600-699)
export const UNIT_MOLE: i32 = 600
export const UNIT_MILLIMOLE: i32 = 601
export const UNIT_MICROMOLE: i32 = 602

// Luminous intensity (700-799)
export const UNIT_CANDELA: i32 = 700

// Derived units - Force (800-899)
export const UNIT_NEWTON: i32 = 800
export const UNIT_DYNE: i32 = 801
export const UNIT_POUND_FORCE: i32 = 802
export const UNIT_KILOGRAM_FORCE: i32 = 803

// Derived units - Energy (900-999)
export const UNIT_JOULE: i32 = 900
export const UNIT_KILOJOULE: i32 = 901
export const UNIT_CALORIE: i32 = 902
export const UNIT_KILOCALORIE: i32 = 903
export const UNIT_BTU: i32 = 904
export const UNIT_ELECTRON_VOLT: i32 = 905
export const UNIT_WATT_HOUR: i32 = 906
export const UNIT_KILOWATT_HOUR: i32 = 907
export const UNIT_ERG: i32 = 908

// Derived units - Power (1000-1099)
export const UNIT_WATT: i32 = 1000
export const UNIT_KILOWATT: i32 = 1001
export const UNIT_MEGAWATT: i32 = 1002
export const UNIT_HORSEPOWER: i32 = 1003

// Derived units - Pressure (1100-1199)
export const UNIT_PASCAL: i32 = 1100
export const UNIT_KILOPASCAL: i32 = 1101
export const UNIT_BAR: i32 = 1102
export const UNIT_ATMOSPHERE: i32 = 1103
export const UNIT_TORR: i32 = 1104
export const UNIT_PSI: i32 = 1105
export const UNIT_MMHG: i32 = 1106

// Derived units - Frequency (1200-1299)
export const UNIT_HERTZ: i32 = 1200
export const UNIT_KILOHERTZ: i32 = 1201
export const UNIT_MEGAHERTZ: i32 = 1202
export const UNIT_GIGAHERTZ: i32 = 1203

// Derived units - Electric (1300-1399)
export const UNIT_VOLT: i32 = 1300
export const UNIT_MILLIVOLT: i32 = 1301
export const UNIT_OHM: i32 = 1302
export const UNIT_KILOHM: i32 = 1303
export const UNIT_MEGOHM: i32 = 1304
export const UNIT_FARAD: i32 = 1305
export const UNIT_MICROFARAD: i32 = 1306
export const UNIT_NANOFARAD: i32 = 1307
export const UNIT_PICOFARAD: i32 = 1308
export const UNIT_COULOMB: i32 = 1309
export const UNIT_HENRY: i32 = 1310
export const UNIT_SIEMENS: i32 = 1311
export const UNIT_WEBER: i32 = 1312
export const UNIT_TESLA: i32 = 1313

// Derived units - Area (1400-1499)
export const UNIT_SQUARE_METER: i32 = 1400
export const UNIT_SQUARE_KILOMETER: i32 = 1401
export const UNIT_HECTARE: i32 = 1402
export const UNIT_ACRE: i32 = 1403
export const UNIT_SQUARE_FOOT: i32 = 1404
export const UNIT_SQUARE_INCH: i32 = 1405
export const UNIT_SQUARE_MILE: i32 = 1406

// Derived units - Volume (1500-1599)
export const UNIT_CUBIC_METER: i32 = 1500
export const UNIT_LITER: i32 = 1501
export const UNIT_MILLILITER: i32 = 1502
export const UNIT_GALLON: i32 = 1503
export const UNIT_QUART: i32 = 1504
export const UNIT_PINT: i32 = 1505
export const UNIT_CUP: i32 = 1506
export const UNIT_FLUID_OUNCE: i32 = 1507
export const UNIT_CUBIC_INCH: i32 = 1508
export const UNIT_CUBIC_FOOT: i32 = 1509

// Derived units - Speed (1600-1699)
export const UNIT_METER_PER_SECOND: i32 = 1600
export const UNIT_KILOMETER_PER_HOUR: i32 = 1601
export const UNIT_MILE_PER_HOUR: i32 = 1602
export const UNIT_KNOT: i32 = 1603
export const UNIT_FOOT_PER_SECOND: i32 = 1604
export const UNIT_SPEED_OF_LIGHT: i32 = 1605

// Angle units (1700-1799)
export const UNIT_RADIAN: i32 = 1700
export const UNIT_DEGREE: i32 = 1701
export const UNIT_GRADIAN: i32 = 1702
export const UNIT_ARCMINUTE: i32 = 1703
export const UNIT_ARCSECOND: i32 = 1704
export const UNIT_TURN: i32 = 1705

// Data units (1800-1899)
export const UNIT_BIT: i32 = 1800
export const UNIT_BYTE: i32 = 1801
export const UNIT_KILOBYTE: i32 = 1802
export const UNIT_MEGABYTE: i32 = 1803
export const UNIT_GIGABYTE: i32 = 1804
export const UNIT_TERABYTE: i32 = 1805
export const UNIT_KIBIBYTE: i32 = 1806
export const UNIT_MEBIBYTE: i32 = 1807
export const UNIT_GIBIBYTE: i32 = 1808
export const UNIT_TEBIBYTE: i32 = 1809

// ============================================================================
// CONVERSION FACTORS TO SI BASE UNITS
// ============================================================================

/**
 * Get conversion factor for a unit code to SI base unit
 * @param unitCode Unit code
 * @returns Conversion factor (multiply by this to get SI base)
 */
export function getConversionFactor(unitCode: i32): f64 {
  // Length - base: meter
  if (unitCode === UNIT_METER) return 1.0
  if (unitCode === UNIT_KILOMETER) return 1000.0
  if (unitCode === UNIT_CENTIMETER) return 0.01
  if (unitCode === UNIT_MILLIMETER) return 0.001
  if (unitCode === UNIT_MICROMETER) return 1e-6
  if (unitCode === UNIT_NANOMETER) return 1e-9
  if (unitCode === UNIT_INCH) return 0.0254
  if (unitCode === UNIT_FOOT) return 0.3048
  if (unitCode === UNIT_YARD) return 0.9144
  if (unitCode === UNIT_MILE) return 1609.344
  if (unitCode === UNIT_NAUTICAL_MILE) return 1852.0
  if (unitCode === UNIT_ANGSTROM) return 1e-10
  if (unitCode === UNIT_LIGHT_YEAR) return 9.4607304725808e15
  if (unitCode === UNIT_PARSEC) return 3.0856775814914e16
  if (unitCode === UNIT_AU) return 1.495978707e11

  // Mass - base: kilogram
  if (unitCode === UNIT_KILOGRAM) return 1.0
  if (unitCode === UNIT_GRAM) return 0.001
  if (unitCode === UNIT_MILLIGRAM) return 1e-6
  if (unitCode === UNIT_MICROGRAM) return 1e-9
  if (unitCode === UNIT_TONNE) return 1000.0
  if (unitCode === UNIT_POUND) return 0.45359237
  if (unitCode === UNIT_OUNCE) return 0.028349523125
  if (unitCode === UNIT_STONE) return 6.35029318
  if (unitCode === UNIT_GRAIN) return 6.479891e-5
  if (unitCode === UNIT_SLUG) return 14.593903
  if (unitCode === UNIT_AMU) return 1.6605390666e-27

  // Time - base: second
  if (unitCode === UNIT_SECOND) return 1.0
  if (unitCode === UNIT_MILLISECOND) return 0.001
  if (unitCode === UNIT_MICROSECOND) return 1e-6
  if (unitCode === UNIT_NANOSECOND) return 1e-9
  if (unitCode === UNIT_MINUTE) return 60.0
  if (unitCode === UNIT_HOUR) return 3600.0
  if (unitCode === UNIT_DAY) return 86400.0
  if (unitCode === UNIT_WEEK) return 604800.0
  if (unitCode === UNIT_YEAR) return 31557600.0 // Julian year
  if (unitCode === UNIT_DECADE) return 315576000.0
  if (unitCode === UNIT_CENTURY) return 3155760000.0

  // Temperature - base: kelvin (linear part only, offset handled separately)
  if (unitCode === UNIT_KELVIN) return 1.0
  if (unitCode === UNIT_CELSIUS) return 1.0
  if (unitCode === UNIT_FAHRENHEIT) return 5.0 / 9.0
  if (unitCode === UNIT_RANKINE) return 5.0 / 9.0

  // Electric current - base: ampere
  if (unitCode === UNIT_AMPERE) return 1.0
  if (unitCode === UNIT_MILLIAMPERE) return 0.001
  if (unitCode === UNIT_MICROAMPERE) return 1e-6

  // Amount - base: mole
  if (unitCode === UNIT_MOLE) return 1.0
  if (unitCode === UNIT_MILLIMOLE) return 0.001
  if (unitCode === UNIT_MICROMOLE) return 1e-6

  // Luminosity - base: candela
  if (unitCode === UNIT_CANDELA) return 1.0

  // Force - base: newton (kg·m/s²)
  if (unitCode === UNIT_NEWTON) return 1.0
  if (unitCode === UNIT_DYNE) return 1e-5
  if (unitCode === UNIT_POUND_FORCE) return 4.4482216152605
  if (unitCode === UNIT_KILOGRAM_FORCE) return 9.80665

  // Energy - base: joule (kg·m²/s²)
  if (unitCode === UNIT_JOULE) return 1.0
  if (unitCode === UNIT_KILOJOULE) return 1000.0
  if (unitCode === UNIT_CALORIE) return 4.184
  if (unitCode === UNIT_KILOCALORIE) return 4184.0
  if (unitCode === UNIT_BTU) return 1055.06
  if (unitCode === UNIT_ELECTRON_VOLT) return 1.602176634e-19
  if (unitCode === UNIT_WATT_HOUR) return 3600.0
  if (unitCode === UNIT_KILOWATT_HOUR) return 3600000.0
  if (unitCode === UNIT_ERG) return 1e-7

  // Power - base: watt (kg·m²/s³)
  if (unitCode === UNIT_WATT) return 1.0
  if (unitCode === UNIT_KILOWATT) return 1000.0
  if (unitCode === UNIT_MEGAWATT) return 1e6
  if (unitCode === UNIT_HORSEPOWER) return 745.7

  // Pressure - base: pascal (kg/(m·s²))
  if (unitCode === UNIT_PASCAL) return 1.0
  if (unitCode === UNIT_KILOPASCAL) return 1000.0
  if (unitCode === UNIT_BAR) return 100000.0
  if (unitCode === UNIT_ATMOSPHERE) return 101325.0
  if (unitCode === UNIT_TORR) return 133.322368421
  if (unitCode === UNIT_PSI) return 6894.757293168
  if (unitCode === UNIT_MMHG) return 133.322387415

  // Frequency - base: hertz (1/s)
  if (unitCode === UNIT_HERTZ) return 1.0
  if (unitCode === UNIT_KILOHERTZ) return 1000.0
  if (unitCode === UNIT_MEGAHERTZ) return 1e6
  if (unitCode === UNIT_GIGAHERTZ) return 1e9

  // Electric potential - base: volt (kg·m²/(A·s³))
  if (unitCode === UNIT_VOLT) return 1.0
  if (unitCode === UNIT_MILLIVOLT) return 0.001

  // Electric resistance - base: ohm (kg·m²/(A²·s³))
  if (unitCode === UNIT_OHM) return 1.0
  if (unitCode === UNIT_KILOHM) return 1000.0
  if (unitCode === UNIT_MEGOHM) return 1e6

  // Capacitance - base: farad (A²·s⁴/(kg·m²))
  if (unitCode === UNIT_FARAD) return 1.0
  if (unitCode === UNIT_MICROFARAD) return 1e-6
  if (unitCode === UNIT_NANOFARAD) return 1e-9
  if (unitCode === UNIT_PICOFARAD) return 1e-12

  // Electric charge - base: coulomb (A·s)
  if (unitCode === UNIT_COULOMB) return 1.0

  // Inductance - base: henry (kg·m²/(A²·s²))
  if (unitCode === UNIT_HENRY) return 1.0

  // Conductance - base: siemens (A²·s³/(kg·m²))
  if (unitCode === UNIT_SIEMENS) return 1.0

  // Magnetic flux - base: weber (kg·m²/(A·s²))
  if (unitCode === UNIT_WEBER) return 1.0

  // Magnetic field - base: tesla (kg/(A·s²))
  if (unitCode === UNIT_TESLA) return 1.0

  // Area - base: m²
  if (unitCode === UNIT_SQUARE_METER) return 1.0
  if (unitCode === UNIT_SQUARE_KILOMETER) return 1e6
  if (unitCode === UNIT_HECTARE) return 10000.0
  if (unitCode === UNIT_ACRE) return 4046.8564224
  if (unitCode === UNIT_SQUARE_FOOT) return 0.09290304
  if (unitCode === UNIT_SQUARE_INCH) return 0.00064516
  if (unitCode === UNIT_SQUARE_MILE) return 2589988.110336

  // Volume - base: m³
  if (unitCode === UNIT_CUBIC_METER) return 1.0
  if (unitCode === UNIT_LITER) return 0.001
  if (unitCode === UNIT_MILLILITER) return 1e-6
  if (unitCode === UNIT_GALLON) return 0.003785411784 // US gallon
  if (unitCode === UNIT_QUART) return 0.000946352946
  if (unitCode === UNIT_PINT) return 0.000473176473
  if (unitCode === UNIT_CUP) return 0.0002365882365
  if (unitCode === UNIT_FLUID_OUNCE) return 2.95735295625e-5
  if (unitCode === UNIT_CUBIC_INCH) return 1.6387064e-5
  if (unitCode === UNIT_CUBIC_FOOT) return 0.028316846592

  // Speed - base: m/s
  if (unitCode === UNIT_METER_PER_SECOND) return 1.0
  if (unitCode === UNIT_KILOMETER_PER_HOUR) return 1.0 / 3.6
  if (unitCode === UNIT_MILE_PER_HOUR) return 0.44704
  if (unitCode === UNIT_KNOT) return 0.514444444
  if (unitCode === UNIT_FOOT_PER_SECOND) return 0.3048
  if (unitCode === UNIT_SPEED_OF_LIGHT) return 299792458.0

  // Angle - base: radian
  if (unitCode === UNIT_RADIAN) return 1.0
  if (unitCode === UNIT_DEGREE) return Math.PI / 180.0
  if (unitCode === UNIT_GRADIAN) return Math.PI / 200.0
  if (unitCode === UNIT_ARCMINUTE) return Math.PI / 10800.0
  if (unitCode === UNIT_ARCSECOND) return Math.PI / 648000.0
  if (unitCode === UNIT_TURN) return 2.0 * Math.PI

  // Data - base: bit
  if (unitCode === UNIT_BIT) return 1.0
  if (unitCode === UNIT_BYTE) return 8.0
  if (unitCode === UNIT_KILOBYTE) return 8000.0
  if (unitCode === UNIT_MEGABYTE) return 8e6
  if (unitCode === UNIT_GIGABYTE) return 8e9
  if (unitCode === UNIT_TERABYTE) return 8e12
  if (unitCode === UNIT_KIBIBYTE) return 8192.0
  if (unitCode === UNIT_MEBIBYTE) return 8388608.0
  if (unitCode === UNIT_GIBIBYTE) return 8589934592.0
  if (unitCode === UNIT_TEBIBYTE) return 8796093022208.0

  return 1.0 // Default
}

/**
 * Get temperature offset (for non-linear conversions)
 * @param unitCode Unit code
 * @returns Offset to add after multiplying by factor
 */
export function getTemperatureOffset(unitCode: i32): f64 {
  if (unitCode === UNIT_KELVIN) return 0.0
  if (unitCode === UNIT_CELSIUS) return 273.15
  if (unitCode === UNIT_FAHRENHEIT) return (459.67 * 5.0) / 9.0
  if (unitCode === UNIT_RANKINE) return 0.0
  return 0.0
}

/**
 * Check if unit is a temperature unit (needs special handling)
 */
export function isTemperatureUnit(unitCode: i32): bool {
  return unitCode >= 400 && unitCode < 500
}

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert a value from one unit to another
 * @param value The value to convert
 * @param fromUnit Source unit code
 * @param toUnit Target unit code
 * @returns Converted value
 */
export function convert(value: f64, fromUnit: i32, toUnit: i32): f64 {
  if (fromUnit === toUnit) return value

  // Handle temperature specially due to offsets
  if (isTemperatureUnit(fromUnit) && isTemperatureUnit(toUnit)) {
    // Convert to Kelvin first
    const kelvin =
      value * getConversionFactor(fromUnit) + getTemperatureOffset(fromUnit)
    // Then from Kelvin to target
    return (kelvin - getTemperatureOffset(toUnit)) / getConversionFactor(toUnit)
  }

  // Standard linear conversion
  const siValue = value * getConversionFactor(fromUnit)
  return siValue / getConversionFactor(toUnit)
}

/**
 * Convert array of values
 * @param values Array of values
 * @param fromUnit Source unit code
 * @param toUnit Target unit code
 * @param n Number of values
 * @returns Converted values
 */
export function convertArray(
  values: Float64Array,
  fromUnit: i32,
  toUnit: i32,
  n: i32
): Float64Array {
  const result = new Float64Array(n)

  if (fromUnit === toUnit) {
    for (let i: i32 = 0; i < n; i++) {
      result[i] = values[i]
    }
    return result
  }

  if (isTemperatureUnit(fromUnit) && isTemperatureUnit(toUnit)) {
    const factor = getConversionFactor(fromUnit)
    const offsetFrom = getTemperatureOffset(fromUnit)
    const offsetTo = getTemperatureOffset(toUnit)
    const factorTo = getConversionFactor(toUnit)

    for (let i: i32 = 0; i < n; i++) {
      const kelvin = values[i] * factor + offsetFrom
      result[i] = (kelvin - offsetTo) / factorTo
    }
  } else {
    const factorRatio =
      getConversionFactor(fromUnit) / getConversionFactor(toUnit)

    for (let i: i32 = 0; i < n; i++) {
      result[i] = values[i] * factorRatio
    }
  }

  return result
}

/**
 * Convert to SI base unit
 * @param value The value
 * @param fromUnit Source unit
 * @returns Value in SI base unit
 */
export function toSI(value: f64, fromUnit: i32): f64 {
  if (isTemperatureUnit(fromUnit)) {
    return (
      value * getConversionFactor(fromUnit) + getTemperatureOffset(fromUnit)
    )
  }
  return value * getConversionFactor(fromUnit)
}

/**
 * Convert from SI base unit
 * @param siValue Value in SI base unit
 * @param toUnit Target unit
 * @returns Converted value
 */
export function fromSI(siValue: f64, toUnit: i32): f64 {
  if (isTemperatureUnit(toUnit)) {
    return (
      (siValue - getTemperatureOffset(toUnit)) / getConversionFactor(toUnit)
    )
  }
  return siValue / getConversionFactor(toUnit)
}

// ============================================================================
// DIMENSIONAL ANALYSIS
// ============================================================================

/**
 * Get the dimension vector for a unit
 * Returns [length, mass, time, current, temperature, amount, luminosity]
 * @param unitCode Unit code
 * @returns Dimension vector as Float64Array
 */
export function getDimensions(unitCode: i32): Float64Array {
  const dims = new Float64Array(NUM_DIMENSIONS)

  // Base units
  if (unitCode >= 100 && unitCode < 200) {
    // Length
    dims[DIM_LENGTH] = 1
  } else if (unitCode >= 200 && unitCode < 300) {
    // Mass
    dims[DIM_MASS] = 1
  } else if (unitCode >= 300 && unitCode < 400) {
    // Time
    dims[DIM_TIME] = 1
  } else if (unitCode >= 400 && unitCode < 500) {
    // Temperature
    dims[DIM_TEMPERATURE] = 1
  } else if (unitCode >= 500 && unitCode < 600) {
    // Current
    dims[DIM_CURRENT] = 1
  } else if (unitCode >= 600 && unitCode < 700) {
    // Amount
    dims[DIM_AMOUNT] = 1
  } else if (unitCode >= 700 && unitCode < 800) {
    // Luminosity
    dims[DIM_LUMINOSITY] = 1
  }
  // Force: kg·m/s² = M¹L¹T⁻²
  else if (unitCode >= 800 && unitCode < 900) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 1
    dims[DIM_TIME] = -2
  }
  // Energy: kg·m²/s² = M¹L²T⁻²
  else if (unitCode >= 900 && unitCode < 1000) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -2
  }
  // Power: kg·m²/s³ = M¹L²T⁻³
  else if (unitCode >= 1000 && unitCode < 1100) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -3
  }
  // Pressure: kg/(m·s²) = M¹L⁻¹T⁻²
  else if (unitCode >= 1100 && unitCode < 1200) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = -1
    dims[DIM_TIME] = -2
  }
  // Frequency: 1/s = T⁻¹
  else if (unitCode >= 1200 && unitCode < 1300) {
    dims[DIM_TIME] = -1
  }
  // Electric derived units
  else if (unitCode === UNIT_VOLT) {
    // kg·m²/(A·s³)
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -3
    dims[DIM_CURRENT] = -1
  } else if (unitCode === UNIT_MILLIVOLT) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -3
    dims[DIM_CURRENT] = -1
  } else if (
    unitCode === UNIT_OHM ||
    unitCode === UNIT_KILOHM ||
    unitCode === UNIT_MEGOHM
  ) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -3
    dims[DIM_CURRENT] = -2
  } else if (unitCode >= 1305 && unitCode <= 1308) {
    // Farad
    dims[DIM_MASS] = -1
    dims[DIM_LENGTH] = -2
    dims[DIM_TIME] = 4
    dims[DIM_CURRENT] = 2
  } else if (unitCode === UNIT_COULOMB) {
    // A·s
    dims[DIM_CURRENT] = 1
    dims[DIM_TIME] = 1
  } else if (unitCode === UNIT_HENRY) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -2
    dims[DIM_CURRENT] = -2
  } else if (unitCode === UNIT_SIEMENS) {
    dims[DIM_MASS] = -1
    dims[DIM_LENGTH] = -2
    dims[DIM_TIME] = 3
    dims[DIM_CURRENT] = 2
  } else if (unitCode === UNIT_WEBER) {
    dims[DIM_MASS] = 1
    dims[DIM_LENGTH] = 2
    dims[DIM_TIME] = -2
    dims[DIM_CURRENT] = -1
  } else if (unitCode === UNIT_TESLA) {
    dims[DIM_MASS] = 1
    dims[DIM_TIME] = -2
    dims[DIM_CURRENT] = -1
  }
  // Area: L²
  else if (unitCode >= 1400 && unitCode < 1500) {
    dims[DIM_LENGTH] = 2
  }
  // Volume: L³
  else if (unitCode >= 1500 && unitCode < 1600) {
    dims[DIM_LENGTH] = 3
  }
  // Speed: L/T
  else if (unitCode >= 1600 && unitCode < 1700) {
    dims[DIM_LENGTH] = 1
    dims[DIM_TIME] = -1
  }
  // Angle and data are dimensionless in SI
  // (but can be tracked separately if needed)

  return dims
}

/**
 * Check if two units are dimensionally compatible
 */
export function areCompatible(unit1: i32, unit2: i32): bool {
  const d1 = getDimensions(unit1)
  const d2 = getDimensions(unit2)

  for (let i: i32 = 0; i < NUM_DIMENSIONS; i++) {
    if (d1[i] !== d2[i]) return false
  }
  return true
}

/**
 * Multiply unit dimensions (for compound units)
 * Returns new dimension vector
 */
export function multiplyDimensions(
  dims1: Float64Array,
  dims2: Float64Array
): Float64Array {
  const result = new Float64Array(NUM_DIMENSIONS)
  for (let i: i32 = 0; i < NUM_DIMENSIONS; i++) {
    result[i] = dims1[i] + dims2[i]
  }
  return result
}

/**
 * Divide unit dimensions
 */
export function divideDimensions(
  dims1: Float64Array,
  dims2: Float64Array
): Float64Array {
  const result = new Float64Array(NUM_DIMENSIONS)
  for (let i: i32 = 0; i < NUM_DIMENSIONS; i++) {
    result[i] = dims1[i] - dims2[i]
  }
  return result
}

/**
 * Raise dimensions to a power
 */
export function powerDimensions(dims: Float64Array, power: f64): Float64Array {
  const result = new Float64Array(NUM_DIMENSIONS)
  for (let i: i32 = 0; i < NUM_DIMENSIONS; i++) {
    result[i] = dims[i] * power
  }
  return result
}

/**
 * Check if dimension vector is dimensionless
 */
export function isDimensionless(dims: Float64Array): bool {
  for (let i: i32 = 0; i < NUM_DIMENSIONS; i++) {
    if (dims[i] !== 0.0) return false
  }
  return true
}

// ============================================================================
// PREFIX HANDLING
// ============================================================================

// SI prefixes as power of 10
export const PREFIX_YOCTO: i32 = -24
export const PREFIX_ZEPTO: i32 = -21
export const PREFIX_ATTO: i32 = -18
export const PREFIX_FEMTO: i32 = -15
export const PREFIX_PICO: i32 = -12
export const PREFIX_NANO: i32 = -9
export const PREFIX_MICRO: i32 = -6
export const PREFIX_MILLI: i32 = -3
export const PREFIX_CENTI: i32 = -2
export const PREFIX_DECI: i32 = -1
export const PREFIX_NONE: i32 = 0
export const PREFIX_DECA: i32 = 1
export const PREFIX_HECTO: i32 = 2
export const PREFIX_KILO: i32 = 3
export const PREFIX_MEGA: i32 = 6
export const PREFIX_GIGA: i32 = 9
export const PREFIX_TERA: i32 = 12
export const PREFIX_PETA: i32 = 15
export const PREFIX_EXA: i32 = 18
export const PREFIX_ZETTA: i32 = 21
export const PREFIX_YOTTA: i32 = 24

/**
 * Get multiplier for SI prefix
 * @param prefixPower Power of 10 for prefix
 * @returns Multiplier
 */
export function getPrefixMultiplier(prefixPower: i32): f64 {
  return Math.pow(10.0, f64(prefixPower))
}

/**
 * Apply prefix to a value
 */
export function applyPrefix(value: f64, prefixPower: i32): f64 {
  return value * getPrefixMultiplier(prefixPower)
}

/**
 * Remove prefix from a value (convert to base unit)
 */
export function removePrefix(value: f64, prefixPower: i32): f64 {
  return value / getPrefixMultiplier(prefixPower)
}

// ============================================================================
// PHYSICAL CONSTANTS (in SI units)
// ============================================================================

export const CONST_SPEED_OF_LIGHT: f64 = 299792458.0 // m/s
export const CONST_PLANCK: f64 = 6.62607015e-34 // J·s
export const CONST_PLANCK_REDUCED: f64 = 1.054571817e-34 // J·s
export const CONST_GRAVITATIONAL: f64 = 6.6743e-11 // m³/(kg·s²)
export const CONST_ELEMENTARY_CHARGE: f64 = 1.602176634e-19 // C
export const CONST_ELECTRON_MASS: f64 = 9.1093837015e-31 // kg
export const CONST_PROTON_MASS: f64 = 1.67262192369e-27 // kg
export const CONST_AVOGADRO: f64 = 6.02214076e23 // 1/mol
export const CONST_BOLTZMANN: f64 = 1.380649e-23 // J/K
export const CONST_GAS: f64 = 8.314462618 // J/(mol·K)
export const CONST_STEFAN_BOLTZMANN: f64 = 5.670374419e-8 // W/(m²·K⁴)
export const CONST_VACUUM_PERMITTIVITY: f64 = 8.8541878128e-12 // F/m
export const CONST_VACUUM_PERMEABILITY: f64 = 1.25663706212e-6 // H/m
