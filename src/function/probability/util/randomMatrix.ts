/**
 * This is a util function for generating a random matrix recursively.
 * @param {number[]} size
 * @param {function} random
 * @returns {Array}
 */
<<<<<<< HEAD
export function randomMatrix (size: any, random: any): any {
=======
export function randomMatrix (size: number[], random: () => any): any[] {
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
  const data = []
  size = size.slice(0)

  if (size.length > 1) {
    for (let i = 0, length = size.shift(); i < length; i++) {
      data.push(randomMatrix(size, random))
    }
  } else {
    for (let i = 0, length = size.shift(); i < length; i++) {
      data.push(random())
    }
  }

  return data
}
