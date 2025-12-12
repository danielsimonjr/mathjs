import { createPrint } from '../../function/string/print.ts'
import { factory } from '../../utils/factory.ts'
import { printTemplate } from '../../utils/print.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  matrix: (...args: any[]) => any
  zeros: (...args: any[]) => any
  add: (...args: any[]) => any
}

const name = 'print'
const dependencies = ['typed', 'matrix', 'zeros', 'add']

export const createPrintTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, zeros, add }: Dependencies) => {
  const print = createPrint({ typed, matrix, zeros, add })
  return typed(name, {
    'string, Object | Array': function (template: string, values: any): string {
      return print(_convertTemplateToZeroBasedIndex(template), values)
    },
    'string, Object | Array, number | Object': function (template: string, values: any, options: any): string {
      return print(_convertTemplateToZeroBasedIndex(template), values, options)
    }
  })

  function _convertTemplateToZeroBasedIndex(template: string): string {
    return template.replace(printTemplate, (x: string) => {
      const parts = x.slice(1).split('.')
      const result = parts.map(function (part) {
        if (!isNaN(part as any) && part.length > 0) {
          return parseInt(part) - 1
        } else {
          return part
        }
      })
      return '$' + result.join('.')
    })
  }
}, { isTransformFunction: true })
