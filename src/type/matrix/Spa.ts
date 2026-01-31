import { factory } from '../../utils/factory.ts'
import type {
  FibonacciHeapNode,
  FibonacciHeapInterface,
  MatrixValue,
  EqualScalarFunction
} from './types.ts'

const name = 'Spa'
const dependencies = ['addScalar', 'equalScalar', 'FibonacciHeap']

/**
 * Value type for Spa elements.
 * Uses MatrixValue to represent any numeric type (number, BigNumber, Complex, etc.)
 */
type SpaValue = MatrixValue

/**
 * Add scalar function type
 * INTENTIONAL ANY: typed-function resolves the actual types at runtime.
 */
type AddScalarFunction = (a: MatrixValue, b: MatrixValue) => MatrixValue

/**
 * Dependencies for Spa factory
 */
interface SpaDependencies {
  addScalar: AddScalarFunction
  equalScalar: EqualScalarFunction
  FibonacciHeap: new () => FibonacciHeapInterface<SpaValue>
}

export const createSpaClass = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ addScalar, equalScalar, FibonacciHeap }: SpaDependencies) => {
    /**
     * An ordered Sparse Accumulator is a representation for a sparse vector that includes a dense array
     * of the vector elements and an ordered list of non-zero elements.
     * @class Spa
     */
    class Spa {
      type: string = 'Spa'
      isSpa: boolean = true
      _values: (FibonacciHeapNode<SpaValue> | undefined)[]
      _heap: FibonacciHeapInterface<SpaValue>

      constructor() {
        // allocate vector, TODO use typed arrays
        this._values = []
        this._heap = new FibonacciHeap()
      }

      /**
       * Set the value for index i.
       *
       * @param {number} i                       The index
       * @param {number | BigNumber | Complex}   The value at index i
       */
      set(i: number, v: SpaValue): void {
        // check we have a value @ i
        if (!this._values[i]) {
          // insert in heap
          const node = this._heap.insert(i, v)
          // set the value @ i
          this._values[i] = node
        } else {
          // update the value @ i
          this._values[i]!.value = v
        }
      }

      get(i: number): SpaValue {
        const node = this._values[i]
        if (node) {
          return node.value
        }
        return 0
      }

      accumulate(i: number, v: SpaValue): void {
        // node @ i
        let node = this._values[i]
        if (!node) {
          // insert in heap
          node = this._heap.insert(i, v)
          // initialize value
          this._values[i] = node
        } else {
          // accumulate value
          node.value = addScalar(node.value, v)
        }
      }

      forEach(
        from: number,
        to: number,
        callback: (key: number, value: SpaValue, spa: Spa) => void
      ): void {
        // references
        const heap = this._heap
        const values = this._values
        // nodes
        const nodes: FibonacciHeapNode<SpaValue>[] = []
        // node with minimum key, save it
        let node = heap.extractMinimum()
        if (node) {
          nodes.push(node)
        }
        // extract nodes from heap (ordered)
        while (node && node.key <= to) {
          // check it is in range
          if (node.key >= from) {
            // check value is not zero
            if (!equalScalar(node.value, 0)) {
              // invoke callback
              callback(node.key, node.value, this)
            }
          }
          // extract next node, save it
          node = heap.extractMinimum()
          if (node) {
            nodes.push(node)
          }
        }
        // reinsert all nodes in heap
        for (let i = 0; i < nodes.length; i++) {
          // current node
          const n = nodes[i]
          // insert node in heap
          node = heap.insert(n.key, n.value)
          // update values
          values[node.key] = node
        }
      }

      swap(i: number, j: number): void {
        // node @ i and j
        let nodei = this._values[i]
        let nodej = this._values[j]
        // check we need to insert indices
        if (!nodei && nodej) {
          // insert in heap
          nodei = this._heap.insert(i, nodej.value)
          // remove from heap
          this._heap.remove(nodej)
          // set values
          this._values[i] = nodei
          this._values[j] = undefined
        } else if (nodei && !nodej) {
          // insert in heap
          nodej = this._heap.insert(j, nodei.value)
          // remove from heap
          this._heap.remove(nodei)
          // set values
          this._values[j] = nodej
          this._values[i] = undefined
        } else if (nodei && nodej) {
          // swap values
          const v = nodei.value
          nodei.value = nodej.value
          nodej.value = v
        }
      }
    }

    return Spa
  },
  { isClass: true }
)
