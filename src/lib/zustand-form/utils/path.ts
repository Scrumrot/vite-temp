/**
 * Get a value from an object using a dot-notation path.
 *
 * @example
 * getValueAtPath({ user: { name: 'John' } }, 'user.name') // 'John'
 * getValueAtPath({ items: [1, 2, 3] }, 'items.1') // 2
 */
export function getValueAtPath(obj: unknown, path: string): unknown {
  if (!path) return obj

  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current == null) return undefined

    // Handle array index access
    const index = Number(part)
    if (Array.isArray(current) && !isNaN(index)) {
      current = current[index]
    } else {
      current = (current as Record<string, unknown>)[part]
    }
  }

  return current
}

/**
 * Set a value in an object using a dot-notation path.
 * Returns a new object (immutable).
 *
 * @example
 * setValueAtPath({ user: { name: 'John' } }, 'user.name', 'Jane')
 * // { user: { name: 'Jane' } }
 */
export function setValueAtPath<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T

  const parts = path.split('.')

  if (parts.length === 1) {
    // Handle array index at root level
    const index = Number(path)
    if (Array.isArray(obj) && !isNaN(index)) {
      const newArr = [...obj]
      newArr[index] = value
      return newArr as T
    }
    return { ...obj, [path]: value } as T
  }

  const [first, ...rest] = parts
  const restPath = rest.join('.')

  // Handle array index
  const index = Number(first)
  if (Array.isArray(obj) && !isNaN(index)) {
    const newArr = [...obj]
    newArr[index] = setValueAtPath(newArr[index] ?? {}, restPath, value)
    return newArr as T
  }

  const currentValue = (obj as Record<string, unknown>)?.[first]

  return {
    ...obj,
    [first]: setValueAtPath(currentValue ?? {}, restPath, value),
  } as T
}

/**
 * Check if two values are deeply equal.
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false

  if (typeof a === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => isEqual(item, b[index]))
    }

    if (Array.isArray(a) || Array.isArray(b)) return false

    const aKeys = Object.keys(a as object)
    const bKeys = Object.keys(b as object)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every((key) =>
      isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    )
  }

  return false
}

/**
 * Get all paths from an object (for field tracking).
 *
 * @example
 * getAllPaths({ user: { name: 'John', age: 30 }, items: [1, 2] })
 * // ['user', 'user.name', 'user.age', 'items']
 */
export function getAllPaths(
  obj: unknown,
  prefix = '',
  maxDepth = 10
): string[] {
  if (maxDepth <= 0) return []

  const paths: string[] = []

  if (obj == null || typeof obj !== 'object') {
    return paths
  }

  // Don't recurse into arrays (they're treated as single values)
  if (Array.isArray(obj)) {
    return paths
  }

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    paths.push(path)

    const value = (obj as Record<string, unknown>)[key]
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...getAllPaths(value, path, maxDepth - 1))
    }
  }

  return paths
}
