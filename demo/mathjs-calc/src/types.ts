export type EngineMode = 'js' | 'wasm' | 'auto'
export type AngleMode = 'deg' | 'rad' | 'grad'
export type NumberType = 'number' | 'BigNumber' | 'Complex' | 'Fraction'
export type PanelId = 'calculator' | 'matrix' | 'signal' | 'statistics' | 'performance'

export interface HistoryEntry {
  id: string
  expression: string
  result: string
  type: string
  error: string | null
  panel: PanelId
  engineUsed: EngineMode
  executionTime: number
  timestamp: number
}

export interface BenchmarkResult {
  operation: string
  category: string
  size: number
  jsTime: number
  wasmTime: number
  speedup: number
}

export interface WasmCapabilities {
  wasmAvailable: boolean
  simdAvailable: boolean
  parallelAvailable: boolean
  coreCount: number
}

export interface AppConfig {
  angleMode: AngleMode
  numberType: NumberType
  precision: number
  engine: EngineMode
}
