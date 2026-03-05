import { useState, useCallback, useRef } from 'react'
import type { BenchmarkResult } from '../types'
import { useMathParser } from './useMathParser'

interface BenchmarkConfig {
  category: string
  operation: string
  sizes: number[]
  runner: (math: ReturnType<typeof useMathParser>['math'], size: number) => void
}

const benchmarkConfigs: BenchmarkConfig[] = [
  {
    category: 'Matrix',
    operation: 'Multiply (NxN)',
    sizes: [10, 50, 100, 200, 500],
    runner: (math, n) => {
      const a = math.random([n, n])
      const b = math.random([n, n])
      math.multiply(a, b)
    },
  },
  {
    category: 'Matrix',
    operation: 'Determinant',
    sizes: [10, 50, 100, 200],
    runner: (math, n) => {
      const a = math.random([n, n])
      math.det(a)
    },
  },
  {
    category: 'Matrix',
    operation: 'Inverse',
    sizes: [10, 50, 100, 200],
    runner: (math, n) => {
      const a = math.random([n, n])
      math.inv(a)
    },
  },
  {
    category: 'Signal',
    operation: 'FFT',
    sizes: [256, 1024, 4096, 16384],
    runner: (math, n) => {
      const signal = Array.from({ length: n }, (_, i) =>
        math.complex(Math.sin((2 * Math.PI * i) / n), 0)
      )
      math.fft(signal)
    },
  },
  {
    category: 'Statistics',
    operation: 'Mean + Variance',
    sizes: [1000, 10000, 100000, 1000000],
    runner: (math, n) => {
      const arr = Array.from({ length: n }, () => Math.random())
      math.mean(arr)
      math.variance(arr)
    },
  },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useBenchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const { math } = useMathParser()
  const abortRef = useRef(false)

  const totalBenchmarks = benchmarkConfigs.reduce((sum, c) => sum + c.sizes.length, 0)

  const runAll = useCallback(async () => {
    setRunning(true)
    setResults([])
    setProgress(0)
    abortRef.current = false

    const allResults: BenchmarkResult[] = []
    let completed = 0

    for (const config of benchmarkConfigs) {
      for (const size of config.sizes) {
        if (abortRef.current) break

        try {
          const start = performance.now()
          config.runner(math, size)
          const jsTime = performance.now() - start

          allResults.push({
            operation: config.operation,
            category: config.category,
            size,
            jsTime,
            wasmTime: jsTime, // placeholder until Task 11
            speedup: 1.0,
          })
        } catch {
          // skip on error
        }

        completed++
        setProgress(completed / totalBenchmarks)
        setResults([...allResults])
        await delay(10)
      }
      if (abortRef.current) break
    }

    setRunning(false)
  }, [math, totalBenchmarks])

  return { results, running, progress, runAll }
}
