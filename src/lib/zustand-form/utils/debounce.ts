/**
 * Creates a debounced version of an async function.
 * Uses a functional approach with closure for state management.
 *
 * @param fn - The async function to debounce
 * @param delay - Delay in milliseconds
 * @returns A debounced version of the function
 */
export const createDebouncedAsync = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  delay: number
): ((...args: TArgs) => Promise<TResult>) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingResolve: ((value: TResult) => void) | null = null
  let pendingReject: ((reason: unknown) => void) | null = null

  return (...args: TArgs): Promise<TResult> => {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Return a new promise that will be resolved when the debounce completes
    return new Promise<TResult>((resolve, reject) => {
      // Store the resolve/reject for the latest call
      pendingResolve = resolve
      pendingReject = reject

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          pendingResolve?.(result)
        } catch (error) {
          pendingReject?.(error)
        } finally {
          timeoutId = null
          pendingResolve = null
          pendingReject = null
        }
      }, delay)
    })
  }
}

/**
 * Creates a cancellable debounced async function.
 * Returns both the debounced function and a cancel function.
 */
export const createCancellableDebouncedAsync = <
  TArgs extends unknown[],
  TResult,
>(
  fn: (...args: TArgs) => Promise<TResult>,
  delay: number
): {
  debounced: (...args: TArgs) => Promise<TResult | null>
  cancel: () => void
} => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingResolve: ((value: TResult | null) => void) | null = null

  const cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    // Resolve with null to indicate cancellation
    pendingResolve?.(null)
    pendingResolve = null
  }

  const debounced = (...args: TArgs): Promise<TResult | null> => {
    cancel()

    return new Promise<TResult | null>((resolve) => {
      pendingResolve = resolve

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          pendingResolve?.(result)
        } catch {
          pendingResolve?.(null)
        } finally {
          timeoutId = null
          pendingResolve = null
        }
      }, delay)
    })
  }

  return { debounced, cancel }
}
