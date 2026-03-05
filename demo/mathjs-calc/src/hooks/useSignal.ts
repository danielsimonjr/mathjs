import { useMemo, useCallback, useRef } from 'react'
import math from 'mathjs'

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface SignalParams {
  waveform: WaveformType
  frequency: number
  amplitude: number
  sampleCount: number
}

interface SignalResult {
  timeDomain: { x: number; y: number }[]
  freqDomain: { freq: number; magnitude: number }[]
  executionTime: number
}

export function useSignal() {
  const mathRef = useRef(math)

  const generate = useCallback((params: SignalParams): SignalResult => {
    const { waveform, frequency, amplitude, sampleCount } = params
    const math = mathRef.current
    const start = performance.now()

    const sampleRate = sampleCount
    const signal: number[] = []

    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount
      const phase = 2 * Math.PI * frequency * t
      let y: number
      switch (waveform) {
        case 'sine':
          y = amplitude * Math.sin(phase)
          break
        case 'square':
          y = amplitude * Math.sign(Math.sin(phase))
          break
        case 'triangle':
          y = amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase))
          break
        case 'sawtooth':
          y = amplitude * 2 * (frequency * t - Math.floor(0.5 + frequency * t))
          break
      }
      signal.push(y)
    }

    // Run FFT
    const complexSignal = signal.map((v) => math.complex(v, 0))
    const fftResult = math.fft(complexSignal) as unknown[]
    const magnitudes = fftResult.map((c) => math.abs(c as any) as number)

    // Build time domain points
    const timeDomain = signal.map((y, i) => ({
      x: i / sampleRate,
      y,
    }))

    // Build frequency domain (first half only)
    const halfLen = Math.floor(sampleCount / 2)
    const freqDomain: { freq: number; magnitude: number }[] = []
    for (let i = 0; i < halfLen; i++) {
      freqDomain.push({
        freq: (i * sampleRate) / sampleCount,
        magnitude: magnitudes[i],
      })
    }

    const executionTime = performance.now() - start
    return { timeDomain, freqDomain, executionTime }
  }, [])

  return { generate }
}
