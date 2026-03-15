import { factory } from '../utils/factory.ts'

interface ClassWithFromJSON {
  fromJSON: (value: any) => any
}

interface ReviverDependencies {
  classes: Record<string, ClassWithFromJSON>
}

const name = 'reviver'
const dependencies = ['classes']

export const createReviver = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ classes }: ReviverDependencies) => {
    /**
     * Instantiate mathjs data types from their JSON representation
     * @param {string} key
     * @param {*} value
     * @returns {*} Returns the revived object
     */
    return function reviver(key: any, value: any) {
      const constructor = classes[value && value.mathjs]

      if (constructor && typeof constructor.fromJSON === 'function') {
        return constructor.fromJSON(value)
      }

      return value
    }
  }
)
