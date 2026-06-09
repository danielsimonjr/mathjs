// Only use native node.js API's and references to ./lib here, this file is not transpiled!
//
// Note that if this tree-shaking test fails, there is probably
// new functionality which forces Webpack to turn off tree shaking.
//
// Typical solutions to get tree-shaking working again are:
//
// - move code into a separate file to isolate it
// - add /* #__PURE__ */ when creating a variable

import fs from 'node:fs'
import path from 'node:path'
import cp from 'node:child_process'
import assert from 'node:assert'
import { fileURLToPath } from 'node:url'
import webpack from 'webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('tree shaking', function () {
  const appName = 'treeShakingApp.js'
  // Use a .cjs extension: with target:'node' webpack emits CommonJS `require`
  // calls, but this package is "type": "module", so a .js bundle would be
  // loaded as ESM and fail with "require is not defined". .cjs forces CommonJS.
  const bundleName = 'treeShakingApp.bundle.cjs'
  const bundleLicenseName = 'treeShakingApp.bundle.cjs.LICENSE.txt'

  before(function () {
    cleanup()
  })

  after(function () {
    cleanup()
  })

  function cleanup () {
    fs.rmSync(path.join(__dirname, bundleName), { force: true })
    fs.rmSync(path.join(__dirname, bundleLicenseName), { force: true })
  }

  it('should apply tree-shaking when bundling', function (done) {
    // This test takes a few seconds
    this.timeout(2 * 60 * 1000)

    const webpackConfig = {
      entry: path.join(__dirname, appName),
      mode: 'production',
      // The bundle is executed with `node` below, so target Node's globals.
      // Without this, webpack's default 'web' target emits references to the
      // browser-only `self` global (used by typed-function's optional wasm
      // loader), which throws "self is not defined" under Node.
      target: 'node',
      output: {
        filename: bundleName,
        path: __dirname
      },
      resolve: {
        alias: {
          // @danielsimonjr/typed-function optionally loads a WebAssembly module
          // via a (broken) relative path. We don't want the optional wasm
          // acceleration bundled into a tree-shaken build: map it to false so
          // typed-function falls back to its pure-JS dispatch. This also keeps
          // the bundle small (the whole point of this test).
          '../../../build/dispatch.wasm': false
        },
        fallback: { url: false, path: false }
      }
    }

    webpack(webpackConfig).run(function (err, stats) {
      if (err) {
        console.error(err)
        done(err)
        return
      }

      const info = stats.toJson()
      if (stats.hasErrors()) {
        console.error('Webpack errors:', info.errors)
        done(new Error('Compile failed'))
        return
      }

      // Test whether the size is small enough
      // The tree-shaken bundle baseline grew after switching to
      // @danielsimonjr/typed-function (a heavier dispatch engine than upstream
      // typed-function); the current size is ~142 KB (unzipped) vs the full
      // library which is far larger. The threshold below guards against
      // tree-shaking breaking (which would pull in the whole library); it may
      // grow or shrink in the future.
      assert.strictEqual(info.assets[0].name, bundleName)
      const size = info.assets[0].size
      const maxSize = 160000
      assert(size < maxSize,
        'bundled size must be small enough ' +
        '(actual size: ' + size + ' bytes, max size: ' + maxSize + ' bytes)')

      // Execute the bundle to test whether it actually works
      cp.exec('node ' + path.join(__dirname, bundleName), function (err, result) {
        if (err) {
          done(err)
          return
        }

        assert.strictEqual(result.replace(/\s/g, ''), '3')

        done()
      })
    })
  })
})
