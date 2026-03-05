import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  initWasm: () => ipcRenderer.invoke('wasm:init'),
  runWasmOperation: (operation, data) =>
    ipcRenderer.invoke('wasm:run', operation, data),
  getSystemInfo: () => ipcRenderer.invoke('system:info')
})
