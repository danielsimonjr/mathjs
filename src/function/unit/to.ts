import { factory } from '../../utils/factory.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for unit conversion
interface UnitType {
  to(unit: UnitType | string): UnitType
}

interface Matrix {
  size(): number[]
  storage(): string
}

interface ToDependencies {
  typed: TypedFunction
  matrix: (data: unknown[]) => Matrix
  concat: TypedFunction
}

const name = 'to'
const dependencies = ['typed', 'matrix', 'concat']

export const createTo = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, concat }: ToDependencies) => {
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Change the unit of a value.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.to(x, unit)
     *
     * Examples:
     *
     *    math.to(math.unit('2 inch'), 'cm')             // returns Unit 5.08 cm
     *    math.to(math.unit('2 inch'), math.unit('cm'))  // returns Unit 5.08 cm
     *    math.to(math.unit(16, 'bytes'), 'bits')        // returns Unit 128 bits
     *
     * See also:
     *
     *    unit
     *
     * @param {Unit | Array | Matrix} x     The unit to be converted.
     * @param {Unit | Array | Matrix} unit  New unit. Can be a string like "cm"
     *                                      or a unit without value.
     * @return {Unit | Array | Matrix} value with changed, fixed unit.
     */
    return typed(
      name,
      {
        'Unit, Unit | string': (
          x: UnitType,
          unit: UnitType | string
        ): UnitType => x.to(unit)
      },
      matrixAlgorithmSuite({})
    )
  }
)
