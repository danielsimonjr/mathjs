import { factory } from '../../utils/factory.ts'

const name = 'ResultSet'
const dependencies: string[] = []

/**
 * JSON representation of a ResultSet
 */
export interface ResultSetJSON {
  mathjs: 'ResultSet'
  entries: unknown[]
}

/**
 * ResultSet instance interface
 */
export interface ResultSetInstance {
  type: 'ResultSet'
  isResultSet: true
  entries: unknown[]
  valueOf(): unknown[]
  toString(): string
  toJSON(): ResultSetJSON
}

/**
 * ResultSet constructor interface
 */
export interface ResultSetConstructor {
  new (entries?: unknown[]): ResultSetInstance
  fromJSON(json: ResultSetJSON): ResultSetInstance
  prototype: ResultSetInstance
}

export const createResultSet = /* #__PURE__ */ factory(
  name,
  dependencies,
  (): ResultSetConstructor => {
    /**
     * A ResultSet contains a list or results
     * @class ResultSet
     * @param {Array} entries
     * @constructor ResultSet
     */
    function ResultSet(this: ResultSetInstance, entries?: unknown[]): void {
      if (!(this instanceof ResultSet)) {
        throw new SyntaxError(
          'Constructor must be called with the new operator'
        )
      }

      this.entries = entries || []
    }

    /**
     * Attach type information
     */
    ResultSet.prototype.type = 'ResultSet'
    ResultSet.prototype.isResultSet = true

    /**
     * Returns the array with results hold by this ResultSet
     * @memberof ResultSet
     * @returns {Array} entries
     */
    ResultSet.prototype.valueOf = function (this: ResultSetInstance): unknown[] {
      return this.entries
    }

    /**
     * Returns the stringified results of the ResultSet
     * @memberof ResultSet
     * @returns {string} string
     */
    ResultSet.prototype.toString = function (this: ResultSetInstance): string {
      return '[' + this.entries.map(String).join(', ') + ']'
    }

    /**
     * Get a JSON representation of the ResultSet
     * @memberof ResultSet
     * @returns {Object} Returns a JSON object structured as:
     *                   `{"mathjs": "ResultSet", "entries": [...]}`
     */
    ResultSet.prototype.toJSON = function (this: ResultSetInstance): ResultSetJSON {
      return {
        mathjs: 'ResultSet',
        entries: this.entries
      }
    }

    /**
     * Instantiate a ResultSet from a JSON object
     * @memberof ResultSet
     * @param {Object} json  A JSON object structured as:
     *                       `{"mathjs": "ResultSet", "entries": [...]}`
     * @return {ResultSet}
     */
    ;(ResultSet as unknown as ResultSetConstructor).fromJSON = function (json: ResultSetJSON): ResultSetInstance {
      return new (ResultSet as unknown as ResultSetConstructor)(json.entries)
    }

    return ResultSet as unknown as ResultSetConstructor
  },
  { isClass: true }
)
