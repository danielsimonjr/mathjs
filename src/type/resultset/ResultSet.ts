import { factory } from '../../utils/factory.js'

const name = 'ResultSet'
const dependencies: string[] = []

export const createResultSet = /* #__PURE__ */ factory(name, dependencies, () => {
  /**
   * A ResultSet contains a list or results
   * @class ResultSet
   */
  class ResultSet {
    entries: any[]
    type: string = 'ResultSet'
    isResultSet: boolean = true

    /**
     * @param {Array} entries
     */
    constructor (entries?: any[]) {
      this.entries = entries || []
    }

    /**
     * Returns the array with results hold by this ResultSet
     * @returns {Array} entries
     */
    valueOf (): any[] {
      return this.entries
    }

    /**
     * Returns the stringified results of the ResultSet
     * @returns {string} string
     */
    toString (): string {
      return '[' + this.entries.map(String).join(', ') + ']'
    }

    /**
     * Get a JSON representation of the ResultSet
     * @returns {Object} Returns a JSON object structured as:
     *                   `{"mathjs": "ResultSet", "entries": [...]}`
     */
    toJSON (): { mathjs: string, entries: any[] } {
      return {
        mathjs: 'ResultSet',
        entries: this.entries
      }
    }

    /**
     * Instantiate a ResultSet from a JSON object
     * @param {Object} json  A JSON object structured as:
     *                       `{"mathjs": "ResultSet", "entries": [...]}`
     * @return {ResultSet}
     */
    static fromJSON (json: { entries: any[] }): ResultSet {
      return new ResultSet(json.entries)
    }
  }

  return ResultSet
}, { isClass: true })
