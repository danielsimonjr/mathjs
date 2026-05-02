import assert from 'assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import math from '../../src/defaultInstance.js'

const here = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8'))

describe('version', function () {
  it('runtime math.version should match package.json version', function () {
    assert.strictEqual(
      math.version,
      pkg.version,
      `math.version (${math.version}) is out of sync with package.json (${pkg.version}). ` +
        'Run `npm run sync-version` (or `npm run compile`) to regenerate src/version.js.'
    )
  })
})
