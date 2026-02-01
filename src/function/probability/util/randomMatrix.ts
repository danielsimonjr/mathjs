// Recursive type for nested arrays
type NestedNumberArray = number | NestedNumberArray[]

/**
 * This is a util function for generating a random matrix recursively.
 * @param {number[]} size
 * @param {function} random
 * @returns {Array}
 */
export function randomMatrix(
  size: number[],
  random: () => number
): NestedNumberArray[] {
  const data: NestedNumberArray[] = []
  size = size.slice(0)

  if (size.length > 1) {
    for (let i = 0, length = size.shift(); i < (length as number); i++) {
      data.push(randomMatrix(size, random))
    }
  } else {
    for (let i = 0, length = size.shift(); i < (length as number); i++) {
      data.push(random())
    }
  }

  return data
}
