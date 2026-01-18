# Unit Simplification Design

## Overview

This document specifies the comprehensive unit simplification algorithm for mathjs, enabling algebraic cancellation of matching units in compound unit expressions.

## Goals

1. **Power Reduction**: `m^2 / m` → `m`
2. **Complete Cancellation**: `m / m` → dimensionless (no unit)
3. **Multi-Unit Cancellation**: `J/K/g * g` → `J/K`
4. **Alias Handling**: `meter` matches `m`, `kilogram` matches `kg`
5. **Prefix Respect**: `km` does NOT cancel with `m` (different magnitudes)

## Current Unit Structure

After analysis of `src/type/unit/Unit.ts`, units are represented as:

```javascript
{
  units: [
    {
      unit: {
        name: 'J',           // Unit name
        base: { ... },       // Base unit definition
        prefixes: { ... },   // Available prefixes
        value: 1,            // Conversion value
        offset: 0            // Offset for temperature conversions
      },
      prefix: {
        name: '',            // Prefix name (empty for no prefix)
        value: 1,            // Prefix multiplier
        scientific: true     // Whether it's a scientific prefix
      },
      power: 1               // Unit power (positive = numerator, negative = denominator)
    }
  ]
}
```

## Simplification Algorithm

### Core Algorithm

```
function simplify(unit):
  1. If unit has <= 1 component, return as-is

  2. Group units by normalized name+prefix:
     - Build map: normalizedKey → list of unit indices with powers

  3. For each group:
     - Sum all powers for that unit
     - If sum ≈ 0: remove all (complete cancellation)
     - If sum ≠ 0: consolidate to single unit with summed power

  4. Rebuild units array with consolidated units

  5. If no units remain: return dimensionless

  6. Return simplified unit
```

### Detailed Steps

**Step 1: Normalize and Group**
```javascript
const unitGroups = new Map()

for (let i = 0; i < units.length; i++) {
  const u = units[i]
  const key = normalizeUnitKey(u)  // e.g., "m_" or "kg_kilo"

  if (!unitGroups.has(key)) {
    unitGroups.set(key, [])
  }

  unitGroups.get(key).push({
    index: i,
    power: u.power,
    unit: u
  })
}
```

**Step 2: Calculate Net Powers**
```javascript
const simplifiedUnits = []

for (const [key, group] of unitGroups) {
  // Sum all powers for this unit
  const netPower = group.reduce((sum, item) => sum + item.power, 0)

  // If power is effectively zero, unit cancels completely
  if (Math.abs(netPower) < 1e-12) {
    continue  // Skip this unit (cancelled)
  }

  // Keep one representative with net power
  const representative = group[0].unit
  simplifiedUnits.push({
    ...representative,
    power: netPower
  })
}
```

**Step 3: Handle Results**
```javascript
if (simplifiedUnits.length === 0) {
  // All units cancelled - dimensionless
  return createDimensionlessUnit(this.value)
}

// Return unit with simplified unit array
unit.units = simplifiedUnits
return unit
```

## Helper Functions

### normalizeUnitKey(unitObj)

Creates a unique key for grouping identical units.

```javascript
function normalizeUnitKey(unitObj) {
  const normalizedName = normalizeUnitName(unitObj.unit.name)
  const prefixName = unitObj.prefix ? unitObj.prefix.name : ''

  return `${normalizedName}_${prefixName}`
}
```

**Examples**:
- `{ name: 'm', prefix: '' }` → `"m_"`
- `{ name: 'g', prefix: 'kilo' }` → `"g_kilo"`
- `{ name: 'meter', prefix: '' }` → `"m_"` (after normalization)

### normalizeUnitName(name)

Handles unit name aliases.

```javascript
function normalizeUnitName(name) {
  const lower = name.toLowerCase()

  const aliasMap = {
    // Length
    'meter': 'm',
    'meters': 'm',
    'metre': 'm',
    'metres': 'm',

    // Mass
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',

    // Time
    'second': 's',
    'seconds': 's',

    // Temperature
    'kelvin': 'K',
    'kelvins': 'K',
    'celsius': 'degC',

    // ... extend as needed
  }

  return aliasMap[lower] || lower
}
```

## Edge Cases

### 1. Power Reduction

**Input**: `m^2 / m`
**Representation**:
```javascript
units: [
  { unit: {name: 'm'}, prefix: {name: ''}, power: 2 },
  { unit: {name: 'm'}, prefix: {name: ''}, power: -1 }
]
```
**Grouping**:
- Key `"m_"` has powers: [2, -1]
- Net power: 2 + (-1) = 1
**Output**: `m^1` = `m`

### 2. Complete Cancellation

**Input**: `m / m`
**Representation**:
```javascript
units: [
  { unit: {name: 'm'}, prefix: {name: ''}, power: 1 },
  { unit: {name: 'm'}, prefix: {name: ''}, power: -1 }
]
```
**Grouping**:
- Key `"m_"` has powers: [1, -1]
- Net power: 1 + (-1) = 0
**Output**: Dimensionless (empty units array)

### 3. Prefix Mismatch

**Input**: `km / m`
**Representation**:
```javascript
units: [
  { unit: {name: 'm'}, prefix: {name: 'k'}, power: 1 },
  { unit: {name: 'm'}, prefix: {name: ''}, power: -1 }
]
```
**Grouping**:
- Key `"m_k"` has powers: [1]
- Key `"m_"` has powers: [-1]
**Output**: `km / m` (NOT cancelled - different prefixes)

### 4. Alias Matching

**Input**: `meter / m`
**Representation**:
```javascript
units: [
  { unit: {name: 'meter'}, prefix: {name: ''}, power: 1 },
  { unit: {name: 'm'}, prefix: {name: ''}, power: -1 }
]
```
**After Normalization**:
- Both normalize to key `"m_"`
- Net power: 1 + (-1) = 0
**Output**: Dimensionless (cancelled)

### 5. Complex Multi-Unit

**Input**: `J*m / (K*m)`
**Representation**:
```javascript
units: [
  { unit: {name: 'J'}, power: 1 },
  { unit: {name: 'm'}, power: 1 },
  { unit: {name: 'K'}, power: -1 },
  { unit: {name: 'm'}, power: -1 }
]
```
**Grouping**:
- Key `"J_"` has powers: [1] → net: 1
- Key `"m_"` has powers: [1, -1] → net: 0 (cancelled)
- Key `"K_"` has powers: [-1] → net: -1
**Output**: `J / K`

## Integration Points

### Auto-Simplification

Simplification is automatically triggered after:
1. **Unit.prototype.multiply()** - After multiplying two units
2. **Unit.prototype.divide()** - After dividing units

```javascript
Unit.prototype.multiply = function(other) {
  // ... existing multiplication logic ...

  const result = /* ... */

  // Auto-simplify before returning
  simplifyUnit(result)

  return getNumericIfUnitless(result)
}
```

### Manual Simplification

Users can also manually simplify:
```javascript
const unit = math.unit('10 m^2 / m')
const simplified = unit.simplify()  // Returns: 10 m
```

## Performance Considerations

- **Time Complexity**: O(n²) in worst case (n = number of unit components)
- **Typical Case**: Most units have < 5 components, so performance impact is negligible
- **Optimization**: Grouping approach (Map) is more efficient than nested loops

## Testing Strategy

### Unit Tests

```javascript
describe('Unit simplification', () => {
  it('should reduce powers (m^2 / m = m)', () => {
    const result = math.unit('10 m^2').divide(math.unit('2 m'))
    assert.strictEqual(result.toString(), '5 m')
  })

  it('should handle complete cancellation (m / m = dimensionless)', () => {
    const result = math.unit('10 m').divide(math.unit('2 m'))
    assert.strictEqual(result.value, 5)
    assert.strictEqual(result.units.length, 0)
  })

  it('should cancel multiple units (J/K/g * g = J/K)', () => {
    const result = math.evaluate('2 J/K/g * 2 g')
    assert.strictEqual(result.toString(), '4 J / K')
  })

  it('should NOT cancel different prefixes (km / m stays km/m)', () => {
    const result = math.unit('1 km').divide(math.unit('1 m'))
    assert.match(result.toString(), /km.*m/)
  })

  it('should handle unit aliases (meter = m)', () => {
    // Note: This depends on how Unit parsing works
    // May not be applicable if parser already normalizes
  })
})
```

### Edge Case Tests

```javascript
it('should handle fractional powers if supported')
it('should preserve value precision during simplification')
it('should handle units with offsets (temperature units)')
it('should handle zero-valued units')
it('should handle complex nested units')
```

## Implementation Checklist

- [ ] Implement `simplifyUnit()` function
- [ ] Implement `normalizeUnitKey()` helper
- [ ] Implement `normalizeUnitName()` helper
- [ ] Handle dimensionless results
- [ ] Integrate auto-simplification in `multiply()`
- [ ] Integrate auto-simplification in `divide()`
- [ ] Apply to both Unit.js and Unit.ts
- [ ] Write comprehensive unit tests
- [ ] Test all edge cases
- [ ] Performance test with complex units
- [ ] Update documentation

## Future Enhancements

1. **Configurable Auto-Simplification**: Allow users to disable auto-simplify if needed
2. **Simplify on ToString**: Optionally simplify only during string formatting
3. **Advanced Alias System**: Load unit aliases from configuration
4. **Fractional Powers**: Support simplification of fractional powers (√m)

## References

- Current implementation: `src/type/unit/Unit.ts` (cancelCommonUnits)
- Test file: `test/unit-tests/type/unit/Unit.test.ts`
- Sprint plan: `docs/refactoring/phases/sprints/PHASE_4_SPRINT_1_ENHANCED_TODO.json`

---

*Design Document Version 1.0*
*Created: 2026-01-18*
*Author: Claude Sonnet 4.5*
