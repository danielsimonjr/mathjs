import { create } from 'zustand'
import type { AppConfig, HistoryEntry, PanelId, WasmCapabilities, EngineMode, ViewMode, PlotTrace, SymbolicResult } from '../types'

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

  // ISE Layout
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  graphCollapsed: boolean
  toggleGraphCollapsed: () => void

  // Plots
  plotTraces: PlotTrace[]
  addPlotTrace: (trace: PlotTrace) => void
  removePlotTrace: (id: string) => void
  togglePlotVisibility: (id: string) => void
  clearPlots: () => void
  plotMode: '2d' | '3d'
  setPlotMode: (mode: '2d' | '3d') => void

  // Symbolic
  symbolicHistory: SymbolicResult[]
  addSymbolicResult: (result: SymbolicResult) => void
  clearSymbolicHistory: () => void

  // Variables
  variables: Record<string, { value: string; type: string }>
  updateVariables: (vars: Record<string, { value: string; type: string }>) => void
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

  viewMode: 'ise',
  setViewMode: (mode) => set({ viewMode: mode }),
  graphCollapsed: false,
  toggleGraphCollapsed: () => set((s) => ({ graphCollapsed: !s.graphCollapsed })),

  plotTraces: [],
  addPlotTrace: (trace) => set((s) => ({ plotTraces: [...s.plotTraces, trace] })),
  removePlotTrace: (id) => set((s) => ({ plotTraces: s.plotTraces.filter((t) => t.id !== id) })),
  togglePlotVisibility: (id) => set((s) => ({ plotTraces: s.plotTraces.map((t) => t.id === id ? { ...t, visible: !t.visible } : t) })),
  clearPlots: () => set({ plotTraces: [] }),
  plotMode: '2d' as const,
  setPlotMode: (mode) => set({ plotMode: mode }),

  symbolicHistory: [],
  addSymbolicResult: (result) => set((s) => ({ symbolicHistory: [result, ...s.symbolicHistory].slice(0, 50) })),
  clearSymbolicHistory: () => set({ symbolicHistory: [] }),

  variables: {},
  updateVariables: (vars) => set({ variables: vars }),
}))
