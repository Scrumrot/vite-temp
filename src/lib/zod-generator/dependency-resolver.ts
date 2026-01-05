export interface TypeNode {
  name: string
  dependencies: Set<string>
}

export function topologicalSort(nodes: Map<string, Set<string>>): string[] {
  const result: string[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(name: string, path: string[] = []): void {
    if (visited.has(name)) return

    if (visiting.has(name)) {
      const cycle = [...path.slice(path.indexOf(name)), name]
      throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`)
    }

    visiting.add(name)

    const deps = nodes.get(name)
    if (deps) {
      for (const dep of deps) {
        if (nodes.has(dep)) {
          visit(dep, [...path, name])
        }
      }
    }

    visiting.delete(name)
    visited.add(name)
    result.push(name)
  }

  for (const name of nodes.keys()) {
    visit(name)
  }

  return result
}

export function findRecursiveTypes(nodes: Map<string, Set<string>>): Set<string> {
  const recursive = new Set<string>()

  function hasPathTo(from: string, to: string, visited: Set<string> = new Set()): boolean {
    if (from === to) return true
    if (visited.has(from)) return false

    visited.add(from)
    const deps = nodes.get(from)
    if (!deps) return false

    for (const dep of deps) {
      if (hasPathTo(dep, to, visited)) return true
    }

    return false
  }

  for (const [name, deps] of nodes) {
    for (const dep of deps) {
      if (dep === name || hasPathTo(dep, name)) {
        recursive.add(name)
        break
      }
    }
  }

  return recursive
}
