import { useMemo } from 'react'
import { useMathParser } from './useMathParser'

export type Distribution = 'normal' | 'uniform' | 'poisson'

interface Stats {
  count: number
  mean: number
  median: number
  std: number
  variance: number
  min: number
  max: number
  q1: number
  q3: number
  executionTime: number
}

interface HistogramBin {
  binStart: number
  binEnd: number
  count: number
  label: string
}

function generateData(distribution: Distribution, size: number): number[] {
  const data: number[] = []
  switch (distribution) {
    case 'normal':
      for (let i = 0; i < size; i += 2) {
        const u1 = Math.random()
        const u2 = Math.random()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
        data.push(z0)
        if (i + 1 < size) data.push(z1)
      }
      break
    case 'uniform':
      for (let i = 0; i < size; i++) {
        data.push(Math.random() * 10 - 5)
      }
      break
    case 'poisson': {
      const lambda = 5
      const L = Math.exp(-lambda)
      for (let i = 0; i < size; i++) {
        let k = 0
        let p = 1
        do {
          k++
          p *= Math.random()
        } while (p > L)
        data.push(k - 1)
      }
      break
    }
  }
  return data
}

function computeHistogram(data: number[], binCount: number): HistogramBin[] {
  const min = Math.min(...data.length > 65536 ? data.slice(0, 65536) : data)
  const max = Math.max(...data.length > 65536 ? data.slice(0, 65536) : data)
  let dataMin = min
  let dataMax = max
  if (data.length > 65536) {
    for (let i = 65536; i < data.length; i++) {
      if (data[i] < dataMin) dataMin = data[i]
      if (data[i] > dataMax) dataMax = data[i]
    }
  }
  const binWidth = (dataMax - dataMin) / binCount || 1
  const bins: HistogramBin[] = []
  for (let i = 0; i < binCount; i++) {
    const binStart = dataMin + i * binWidth
    const binEnd = binStart + binWidth
    bins.push({ binStart, binEnd, count: 0, label: binStart.toFixed(2) })
  }
  for (const v of data) {
    let idx = Math.floor((v - dataMin) / binWidth)
    if (idx >= binCount) idx = binCount - 1
    if (idx < 0) idx = 0
    bins[idx].count++
  }
  return bins
}

export function useStatistics(distribution: Distribution, size: number, binCount: number, seed: number) {
  const { math } = useMathParser()

  const data = useMemo(() => generateData(distribution, size), [distribution, size, seed])

  const stats = useMemo((): Stats => {
    const start = performance.now()
    const sorted = [...data].sort((a, b) => a - b)
    const count = data.length
    const mean = math.mean(data) as number
    const median = math.median(data) as number
    const std = math.std(data) as unknown as number
    const variance = math.variance(data) as unknown as number
    const min = math.min(data) as number
    const max = math.max(data) as number
    const q1 = sorted[Math.floor(count * 0.25)]
    const q3 = sorted[Math.floor(count * 0.75)]
    const executionTime = performance.now() - start
    return { count, mean, median, std, variance, min, max, q1, q3, executionTime }
  }, [data, math])

  const histogram = useMemo(() => computeHistogram(data, binCount), [data, binCount])

  return { data, stats, histogram }
}
