import { clone, deepExtend } from '../../utils/object.js'
import { DEFAULT_CONFIG, MathJsConfig } from '../config.js'

export const MATRIX_OPTIONS = ['Matrix', 'Array'] as const // valid values for option matrix
export const NUMBER_OPTIONS = ['number', 'BigNumber', 'bigint', 'Fraction'] as const // valid values for option number

export type MatrixOption = (typeof MATRIX_OPTIONS)[number]
export type NumberOption = (typeof NUMBER_OPTIONS)[number]

/**
 * Type for partial config options
 */
export type ConfigOptions = Partial<MathJsConfig> & {
  // Legacy option for backwards compatibility
  epsilon?: number
}

/**
 * Type for the config function
 */
export interface ConfigFunction {
  (): MathJsConfig
  (options: ConfigOptions): MathJsConfig
  MATRIX_OPTIONS: readonly string[]
  NUMBER_OPTIONS: readonly string[]
  readonly relTol: number
  readonly absTol: number
  readonly matrix: MatrixOption
  readonly number: NumberOption
  readonly numberFallback: 'number' | 'BigNumber'
  readonly precision: number
  readonly predictable: boolean
  readonly randomSeed: string | null
  readonly legacySubset: boolean
}

/**
 * Type for the emit function
 */
export type EmitFunction = (event: string, curr: MathJsConfig, prev: MathJsConfig, changes: Partial<MathJsConfig>) => void

export function configFactory(config: MathJsConfig, emit: EmitFunction): ConfigFunction {
  /**
   * Set configuration options for math.js, and get current options.
   * Will emit a 'config' event, with arguments (curr, prev, changes).
   *
   * This function is only available on a mathjs instance created using `create`.
   *
   * Syntax:
   *
   *     math.config(config: Object): Object
   *
   * Examples:
   *
   *     import { create, all } from 'mathjs'
   *
   *     // create a mathjs instance
   *     const math = create(all)
   *
   *     math.config().number                // outputs 'number'
   *     math.evaluate('0.4')                // outputs number 0.4
   *     math.config({number: 'Fraction'})
   *     math.evaluate('0.4')                // outputs Fraction 2/5
   *
   * @param options Available options:
   *                            {number} relTol
   *                              Minimum relative difference between two
   *                              compared values, used by all comparison functions.
   *                            {number} absTol
   *                              Minimum absolute difference between two
   *                              compared values, used by all comparison functions.
   *                            {string} matrix
   *                              A string 'Matrix' (default) or 'Array'.
   *                            {string} number
   *                              A string 'number' (default), 'BigNumber', 'bigint', or 'Fraction'
   *                            {number} precision
   *                              The number of significant digits for BigNumbers.
   *                              Not applicable for Numbers.
   *                            {string} parenthesis
   *                              How to display parentheses in LaTeX and string
   *                              output.
   *                            {string} randomSeed
   *                              Random seed for seeded pseudo random number generator.
   *                              Set to null to randomly seed.
   * @return Returns the current configuration
   */
  function _config(options?: ConfigOptions): MathJsConfig {
    if (options) {
      if (options.epsilon !== undefined) {
        // this if is only for backwards compatibility, it can be removed in the future.
        console.warn(
          'Warning: The configuration option "epsilon" is deprecated. Use "relTol" and "absTol" instead.'
        )
        const optionsFix: ConfigOptions = clone(options)
        optionsFix.relTol = options.epsilon
        optionsFix.absTol = options.epsilon * 1e-3
        delete optionsFix.epsilon
        return _config(optionsFix)
      }

      if (options.legacySubset === true) {
        // this if is only for backwards compatibility, it can be removed in the future.
        console.warn(
          'Warning: The configuration option "legacySubset" is for compatibility only and might be deprecated in the future.'
        )
      }
      const prev = clone(config)

      // validate some of the options
      validateOption(options, 'matrix', MATRIX_OPTIONS)
      validateOption(options, 'number', NUMBER_OPTIONS)

      // merge options
      deepExtend(config, options)

      const curr = clone(config)

      const changes = clone(options)

      // emit 'config' event
      emit('config', curr, prev, changes)

      return curr
    } else {
      return clone(config)
    }
  }

  // attach the valid options to the function so they can be extended
  ;(_config as any).MATRIX_OPTIONS = MATRIX_OPTIONS
  ;(_config as any).NUMBER_OPTIONS = NUMBER_OPTIONS

  // attach the config properties as readonly properties to the config function
  Object.keys(DEFAULT_CONFIG).forEach((key) => {
    Object.defineProperty(_config, key, {
      get: () => config[key as keyof MathJsConfig],
      enumerable: true,
      configurable: true
    })
  })

  return _config as ConfigFunction
}

/**
 * Validate an option
 * @param options         Object with options
 * @param name            Name of the option to validate
 * @param values          Array with valid values for this option
 */
function validateOption(
  options: ConfigOptions,
  name: string,
  values: readonly string[]
): void {
  const optionValue = options[name as keyof ConfigOptions]
  if (optionValue !== undefined && values.indexOf(optionValue as string) === -1) {
    // unknown value
    console.warn(
      'Warning: Unknown value "' +
        optionValue +
        '" for configuration option "' +
        name +
        '". ' +
        'Available options: ' +
        values.map((value) => JSON.stringify(value)).join(', ') +
        '.'
    )
  }
}
