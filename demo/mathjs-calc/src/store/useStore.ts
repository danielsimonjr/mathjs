import { create } from 'zustand'
import type { AppConfig, HistoryEntry, PanelId, WasmCapabilities, EngineMode } from '../types'

interface AppState {
  activePanel: PanelId
  setActivePanel: (panel: PanelId) => void
  config: AppConfig
  setEngine: (engine: EngineMode) => void
  setConfig: (partial: Partial<AppConfig>) => void
  history: HistoryEntry[]
  addHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  wasmCapabilities: WasmCapabilities | null
  setWasmCapabilities: (caps: WasmCapabilities) => void
  benchmarkInline: boolean
  toggleBenchmarkInline: () => void
}

export const useStore = create<AppState>((set) => ({
  activePanel: 'calculator',
  setActivePanel: (panel) => set({ activePanel: panel }),
  config: { angleMode: 'rad', numberType: 'number', precision: 14, engine: 'auto' },
  setEngine: (engine) => set((state) => ({ config: { ...state.config, engine } })),
  setConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
  history: [],
  addHistory: (entry) => set((state) => ({ history: [entry, ...state.history].slice(0, 500) })),
  clearHistory: () => set({ history: [] }),
  wasmCapabilities: null,
  setWasmCapabilities: (caps) => set({ wasmCapabilities: caps }),
  benchmarkInline: false,
  toggleBenchmarkInline: () => set((state) => ({ benchmarkInline: !state.benchmarkInline })),
}))
