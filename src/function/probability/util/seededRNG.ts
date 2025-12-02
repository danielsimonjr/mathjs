// @ts-ignore - no type declarations for seedrandom
import seedrandom from 'seedrandom'

const singletonRandom = /* #__PURE__ */ (seedrandom as any)(Date.now())

export function createRng (randomSeed: any): () => number {
  let random: any

  // create a new random generator with given seed
  function setSeed (seed: any): void {
    random = seed === null ? singletonRandom : (seedrandom as any)(String(seed))
  }

  // initialize a seeded pseudo random number generator with config's random seed
  setSeed(randomSeed)

  // wrapper function so the rng can be updated via generator
  function rng (): number {
    return random()
  }

  return rng
}
