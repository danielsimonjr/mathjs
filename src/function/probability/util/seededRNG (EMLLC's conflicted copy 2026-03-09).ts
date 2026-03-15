// @ts-ignore - seedrandom may not have type declarations
import seedrandom from 'seedrandom'

// Type for seedrandom function
type RngFunction = () => number

const singletonRandom: RngFunction = /* #__PURE__ */ seedrandom(Date.now())

export function createRng(randomSeed: string | number | null): RngFunction {
  let random: RngFunction

  // create a new random generator with given seed
  function setSeed(seed: string | number | null): void {
    random = seed === null ? singletonRandom : seedrandom(String(seed))
  }

  // initialize a seeded pseudo random number generator with config's random seed
  setSeed(randomSeed)

  // wrapper function so the rng can be updated via generator
  function rng() {
    return random()
  }

  return rng
}
