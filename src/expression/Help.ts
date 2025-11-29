import { isHelp } from '../utils/is.js'
import { clone } from '../utils/object.js'
import { format } from '../utils/string.js'
import { factory } from '../utils/factory.js'

const name = 'Help'
const dependencies = ['evaluate']

interface HelpDoc {
  name?: string
  category?: string
  description?: string
  syntax?: string[]
  examples?: string[]
  mayThrow?: string[]
  seealso?: string[]
  [key: string]: any
}

export const createHelpClass = /* #__PURE__ */ factory(name, dependencies, ({ evaluate }) => {
  /**
   * Documentation object
   * @param {Object} doc  Object containing properties:
   *                      {string} name
   *                      {string} category
   *                      {string} description
   *                      {string[]} syntax
   *                      {string[]} examples
   *                      {string[]} seealso
   * @constructor
   */
  function Help (this: { doc?: HelpDoc }, doc: HelpDoc) {
    if (!(this instanceof Help)) {
      throw new SyntaxError('Constructor must be called with the new operator')
    }

    if (!doc) throw new Error('Argument "doc" missing')

    this.doc = doc
  }

  /**
   * Attach type information
   */
  Help.prototype.type = 'Help'
  Help.prototype.isHelp = true

  /**
   * Generate a string representation of the Help object
   * @return {string} Returns a string
   * @private
   */
  Help.prototype.toString = function (this: any): string {
    const doc: HelpDoc = this.doc || {}
    let desc = '\n'

    if (doc.name) {
      desc += 'Name: ' + doc.name + '\n\n'
    }
    if (doc.category) {
      desc += 'Category: ' + doc.category + '\n\n'
    }
    if (doc.description) {
      desc += 'Description:\n    ' + doc.description + '\n\n'
    }
    if (doc.syntax) {
      desc += 'Syntax:\n    ' + doc.syntax.join('\n    ') + '\n\n'
    }
    if (doc.examples) {
      desc += 'Examples:\n'

      // after evaluating the examples, we restore config in case the examples
      // did change the config.
      let configChanged = false
      const originalConfig = evaluate('config()')

      const scope: Record<string, any> = {
        config: (newConfig: any) => {
          configChanged = true
          return evaluate('config(newConfig)', { newConfig })
        }
      }

      for (let i = 0; i < doc.examples.length; i++) {
        const expr = doc.examples[i]
        desc += '    ' + expr + '\n'

        let res: any
        try {
          // note: res can be undefined when `expr` is an empty string
          res = evaluate(expr, scope)
        } catch (e) {
          res = e
        }
        if (res !== undefined && !isHelp(res)) {
          desc += '        ' + format(res, { precision: 14 }) + '\n'
        }
      }
      desc += '\n'

      if (configChanged) {
        evaluate('config(originalConfig)', { originalConfig })
      }
    }
    if (doc.mayThrow && doc.mayThrow.length) {
      desc += 'Throws: ' + doc.mayThrow.join(', ') + '\n\n'
    }
    if (doc.seealso && doc.seealso.length) {
      desc += 'See also: ' + doc.seealso.join(', ') + '\n'
    }

    return desc
  }

  /**
   * Export the help object to JSON
   */
  Help.prototype.toJSON = function (this: any): Record<string, any> {
    const obj = clone(this.doc)
    obj.mathjs = 'Help'
    return obj
  }

  /**
   * Instantiate a Help object from a JSON object
   * @param {Object} json
   * @returns {Help} Returns a new Help object
   */
  Help.fromJSON = function (json: Record<string, any>): any {
    const doc: HelpDoc = {}

    Object.keys(json)
      .filter(prop => prop !== 'mathjs')
      .forEach(prop => {
        doc[prop] = json[prop]
      })

    return new (Help as any)(doc)
  }

  /**
   * Returns a string representation of the Help object
   */
  Help.prototype.valueOf = Help.prototype.toString

  return Help
}, { isClass: true })
