import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.ts'
import { nearlyEqual } from '../../utils/number.ts'
import { factory } from '../../utils/factory.ts'
import { complexEquals } from '../../utils/complex.ts'
import { createCompareUnits } from './compareUnits.ts'

import { TypedFunction, BigNumber, Complex, Fraction } from '../../types.ts';
import { ConfigOptions } from '../../core/config.ts';

const name = 'equalScalar'
const dependencies = ['typed', 'config']

export const createEqualScalar = /* #__PURE__ */ factory(name, dependencies, (
  {
    typed,
    config
  }: {
    typed: TypedFunction;
    config: ConfigOptions;
  }
): TypedFunction => {
  const compareUnits = createCompareUnits({ typed })

  /**
   * Test whether two scalar values are nearly equal.
   *
   * @param  {number | BigNumber | bigint | Fraction | boolean | Complex | Unit} x   First value to compare
   * @param  {number | BigNumber | bigint | Fraction | boolean | Complex} y          Second value to compare
   * @return {boolean}                                                  Returns true when the compared values are equal, else returns false
   * @private
   */
  return typed(name, {

    'boolean, boolean': function(x: boolean, y: boolean): boolean {
      return x === y
    },

    'number, number': function(x: number, y: number): boolean {
      return nearlyEqual(x, y, config.relTol, config.absTol)
    },

    'BigNumber, BigNumber': function(x: BigNumber, y: BigNumber): boolean {
      return x.eq(y) || bigNearlyEqual(x, y, config.relTol, config.absTol)
    },

    'bigint, bigint': function(x: bigint, y: bigint): boolean {
      return x === y
    },

    'Fraction, Fraction': function(x: Fraction, y: Fraction): boolean {
      return x.equals(y)
    },

    'Complex, Complex': function(x: Complex, y: Complex): boolean {
      return complexEquals(x, y, config.relTol, config.absTol)
    }
  }, compareUnits);
})

export const createEqualScalarNumber = factory(name, ['typed', 'config'], (
  {
    typed,
    config
  }: {
    typed: TypedFunction;
    config: ConfigOptions;
  }
): TypedFunction => {
  return typed(name, {
    'number, number': function(x: number, y: number): boolean {
      return nearlyEqual(x, y, config.relTol, config.absTol)
    }
  });
})
