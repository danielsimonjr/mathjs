/**
 * WorkerPool manages a pool of Web Workers for parallel computation
 * Supports both Node.js (worker_threads) and browser (Web Workers)
 */

declare const process: { versions?: { node?: string } } | undefined

interface WorkerTask<T = any, R = any> {
  id: string
  data: T
  resolve: (value: R) => void
  reject: (error: Error) => void
  transferables?: Transferable[]
}

interface WorkerMessage<T = any> {
  id: string
  type: 'task' | 'result' | 'error'
  data?: T
  error?: string
}

export class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeTasks: Map<string, WorkerTask> = new Map()
  private maxWorkers: number
  private workerScript: string
  private isNode: boolean

  constructor(workerScript: string, maxWorkers?: number) {
    this.workerScript = workerScript
    this.maxWorkers = maxWorkers || this.getOptimalWorkerCount()
    this.isNode = typeof process !== 'undefined' && process.versions?.node !== undefined
    this.initialize()
  }

  private getOptimalWorkerCount(): number {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(2, navigator.hardwareConcurrency - 1)
    }
    return 4 // fallback
  }

  private async initialize(): Promise<void> {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = await this.createWorker()
      this.workers.push(worker)
      this.availableWorkers.push(worker)
    }
  }

  private async createWorker(): Promise<Worker> {
    let worker: Worker

    if (this.isNode) {
      // Node.js worker_threads
      // @ts-ignore - worker_threads is a Node.js module
      const { Worker: NodeWorker } = await import('worker_threads')
      worker = new NodeWorker(this.workerScript) as any
    } else {
      // Browser Web Worker
      worker = new Worker(this.workerScript, { type: 'module' })
    }

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      this.handleWorkerMessage(worker, event.data)
    }

    worker.onerror = (error: ErrorEvent) => {
      this.handleWorkerError(worker, error)
    }

    return worker
  }

  private handleWorkerMessage(worker: Worker, message: WorkerMessage): void {
    const task = this.activeTasks.get(message.id)
    if (!task) return

    this.activeTasks.delete(message.id)

    if (message.type === 'result') {
      task.resolve(message.data)
    } else if (message.type === 'error') {
      task.reject(new Error(message.error || 'Worker error'))
    }

    // Return worker to pool and process next task
    this.availableWorkers.push(worker)
    this.processQueue()
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    console.error('Worker error:', error)
    // Find and reject all tasks for this worker
    for (const [id, task] of this.activeTasks) {
      if (this.workers.includes(worker)) {
        this.activeTasks.delete(id)
        task.reject(new Error(`Worker error: ${error.message}`))
      }
    }
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!
      const worker = this.availableWorkers.shift()!
      this.executeTask(worker, task)
    }
  }

  private executeTask(worker: Worker, task: WorkerTask): void {
    this.activeTasks.set(task.id, task)

    const message: WorkerMessage = {
      id: task.id,
      type: 'task',
      data: task.data
    }

    if (task.transferables && task.transferables.length > 0) {
      worker.postMessage(message, task.transferables)
    } else {
      worker.postMessage(message)
    }
  }

  public async execute<T = any, R = any>(
    data: T,
    transferables?: Transferable[]
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: this.generateTaskId(),
        data,
        resolve,
        reject,
        transferables
      }

      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.shift()!
        this.executeTask(worker, task)
      } else {
        this.taskQueue.push(task)
      }
    })
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public async terminate(): Promise<void> {
    // Cancel all pending tasks
    for (const task of this.taskQueue) {
      task.reject(new Error('WorkerPool terminated'))
    }
    this.taskQueue = []

    // Cancel all active tasks
    for (const task of this.activeTasks.values()) {
      task.reject(new Error('WorkerPool terminated'))
    }
    this.activeTasks.clear()

    // Terminate all workers
    for (const worker of this.workers) {
      worker.terminate()
    }
    this.workers = []
    this.availableWorkers = []
  }

  public get activeTaskCount(): number {
    return this.activeTasks.size
  }

  public get queuedTaskCount(): number {
    return this.taskQueue.length
  }

  public get workerCount(): number {
    return this.workers.length
  }
}
