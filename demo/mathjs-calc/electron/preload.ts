import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  runWasmOperation: (operation: string, args: unknown[]) =>
    ipcRenderer.invoke('run-wasm-operation', operation, args),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
})
