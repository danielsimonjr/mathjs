import { createPrint } from '../../function/string/print.ts'
import { factory } from '../../utils/factory.ts'
import { printTemplate } from '../../utils/print.ts'
import type { TypedFunction, MathFunction } from './types.ts'

/**
 * Print format options
 */
interface PrintOptions {
  notation?: 'fixed' | 'exponential' | 'engineering' | 'auto'
  precision?: number
  lowerExp?: number
  upperExp?: number
}

interface PrintDependencies {
  typed: TypedFunction
  matrix: MathFunction
  zeros: MathFunction
  add: MathFunction
}

const name = 'print'
const dependencies = ['typed', 'matrix', 'zeros', 'add']

export const createPrintTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, zeros, add }: PrintDependencies) => {
    const print = createPrint({ typed, matrix, zeros, add })
    return typed(name, {
      'string, Object | Array': function (
        template: string,
        values: object | unknown[]
      ): string {
        return print(_convertTemplateToZeroBasedIndex(template), values)
      },
      'string, Object | Array, number | Object': function (
        template: string,
        values: object | unknown[],
        options: number | PrintOptions
      ): string {
        return print(
          _convertTemplateToZeroBasedIndex(template),
          values,
          options
        )
      }
    })

    function _convertTemplateToZeroBasedIndex(template: string): string {
      return template.replace(printTemplate, (x: string) => {
        const parts = x.slice(1).split('.')
        const result = parts.map(function (part) {
          const num = Number(part)
          if (!isNaN(num) && part.length > 0) {
            return num - 1
          } else {
            return part
          }
        })
        return '$' + result.join('.')
      })
    }
  },
  { isTransformFunction: true }
)
