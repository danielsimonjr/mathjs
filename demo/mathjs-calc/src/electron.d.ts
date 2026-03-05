interface ElectronAPI {
  initWasm: () => Promise<{
    success: boolean
    capabilities: {
      wasmAvailable: boolean
      simdAvailable: boolean
      parallelAvailable: boolean
      coreCount: number
    }
  }>
  runWasmOperation: (
    operation: string,
    data: unknown
  ) => Promise<{
    success: boolean
    result?: unknown
    error?: string
    executionTime: number
  }>
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    nodeVersion: string
    cpuCount: number
    totalMemory: number
  }>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
