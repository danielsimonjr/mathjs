/**
 * Log a console.warn message only once
 */
export const warnOnce = (() => {
  const messages: Record<string, boolean> = {}

  return function warnOnce(...args: any[]): void {
    const message = args.join(', ')

    if (!messages[message]) {
      messages[message] = true

      console.warn('Warning:', ...args)
    }
  }
})()
