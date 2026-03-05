import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(createWindow)

ipcMain.handle('wasm:init', async () => {
  try {
    // Attempt to load WASM bridge
    const { MatrixWasmBridge } = await import('mathjs/src/wasm/MatrixWasmBridge.ts')
    await MatrixWasmBridge.init()
    const caps = MatrixWasmBridge.getCapabilities()
    return { success: true, capabilities: caps }
  } catch {
    return {
      success: false,
      capabilities: { wasmAvailable: false, simdAvailable: false, parallelAvailable: false, coreCount: 1 }
    }
  }
})

ipcMain.handle('wasm:run', async (_event, operation: string, data: unknown) => {
  const start = performance.now()
  try {
    const math = (await import('mathjs')).default
    let result: unknown
    switch (operation) {
      case 'multiply': { const { a, b } = data as any; result = math.multiply(a, b); break }
      case 'det': { const { matrix } = data as any; result = math.det(matrix); break }
      case 'fft': { const { signal } = data as any; result = math.fft(signal.map((v: number) => math.complex(v, 0))); break }
      default: throw new Error(`Unknown: ${operation}`)
    }
    return { success: true, result: JSON.parse(JSON.stringify(result)), executionTime: performance.now() - start }
  } catch (err: any) {
    return { success: false, error: err.message, executionTime: performance.now() - start }
  }
})

ipcMain.handle('system:info', async () => {
  const os = await import('os')
  return { platform: process.platform, arch: process.arch, nodeVersion: process.version, cpuCount: os.cpus().length, totalMemory: os.totalmem() }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
