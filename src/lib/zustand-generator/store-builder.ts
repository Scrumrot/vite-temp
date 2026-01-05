import type { ParsedType, ParsedProperty, ParsedDeclaration } from '../zod-generator/type-parser'

export interface StoreBuilderOptions {
  persist: boolean
  storageKey?: string
}

export interface StoreBuilderContext {
  warnings: string[]
}

export function buildStoreString(
  declaration: ParsedDeclaration,
  options: StoreBuilderOptions,
  context: StoreBuilderContext
): string | null {
  const { name, type, isExported } = declaration

  if (!isExported) {
    return null
  }

  // Only generate stores for object types (interfaces/type aliases with properties)
  if (type.kind !== 'object' || !type.properties) {
    context.warnings.push(`Skipping ${name}: not an object type`)
    return null
  }

  const properties = type.properties
  const storeName = `use${name}Store`
  const stateName = name
  const actionsName = `${name}Actions`

  // Generate state interface
  const stateInterface = generateStateInterface(stateName, properties, context)

  // Generate actions interface
  const actionsInterface = generateActionsInterface(actionsName, stateName, properties, context)

  // Generate default state
  const defaultState = generateDefaultState(stateName, properties, context)

  // Generate store
  const store = generateStore(
    storeName,
    stateName,
    actionsName,
    properties,
    options,
    context
  )

  return [stateInterface, actionsInterface, defaultState, store].join('\n\n')
}

function generateStateInterface(
  name: string,
  properties: ParsedProperty[],
  context: StoreBuilderContext
): string {
  const props = properties
    .filter((p) => !isFunction(p.type))
    .map((p) => {
      const optional = p.isOptional ? '?' : ''
      const typeStr = typeToTypeScript(p.type, context)
      return `  ${p.name}${optional}: ${typeStr}`
    })

  return `interface ${name}State {\n${props.join('\n')}\n}`
}

function generateActionsInterface(
  name: string,
  stateName: string,
  properties: ParsedProperty[],
  context: StoreBuilderContext
): string {
  const props = properties.filter((p) => !isFunction(p.type))

  const actions: string[] = [
    `  set${stateName}: (state: Partial<${stateName}State>) => void`,
    `  reset${stateName}: () => void`,
  ]

  for (const p of props) {
    const propName = capitalize(p.name)
    const typeStr = p.isOptional
      ? `${stateName}State['${p.name}'] | undefined`
      : `${stateName}State['${p.name}']`

    // Basic setter for all properties
    actions.push(`  set${propName}: (value: ${typeStr}) => void`)

    // Array-specific actions
    if (isArray(p.type)) {
      const elementType = getArrayElementType(p.type, context)
      const isPrimitive = isPrimitiveArrayElement(p.type)

      actions.push(
        `  prepend${propName}: (item: ${elementType}) => void`,
        `  append${propName}: (item: ${elementType}) => void`,
        `  insert${propName}At: (index: number, item: ${elementType}) => void`,
        `  remove${propName}At: (index: number) => void`,
        `  remove${propName}: (predicate: (item: ${elementType}, index: number) => boolean) => void`,
        `  move${propName}: (fromIndex: number, toIndex: number) => void`,
        // For primitives, updateAt just replaces; for objects, allows partial updates
        isPrimitive
          ? `  update${propName}At: (index: number, item: ${elementType} | ((item: ${elementType}) => ${elementType})) => void`
          : `  update${propName}At: (index: number, item: Partial<${elementType}> | ((item: ${elementType}) => ${elementType})) => void`,
        `  clear${propName}: () => void`
      )
    }
  }

  return `interface ${name} {\n${actions.join('\n')}\n}`
}

function generateDefaultState(
  name: string,
  properties: ParsedProperty[],
  context: StoreBuilderContext
): string {
  const props = properties
    .filter((p) => !isFunction(p.type))
    .map((p) => {
      const defaultValue = getDefaultValue(p.type, p.isOptional, context)
      return `  ${p.name}: ${defaultValue}`
    })

  return `const default${name}State: ${name}State = {\n${props.join(',\n')},\n}`
}

function generateStore(
  storeName: string,
  stateName: string,
  actionsName: string,
  properties: ParsedProperty[],
  options: StoreBuilderOptions,
  _context: StoreBuilderContext
): string {
  const props = properties.filter((p) => !isFunction(p.type))

  const actions: string[] = []

  for (const p of props) {
    const propName = capitalize(p.name)
    const propKey = p.name

    // Basic setter
    actions.push(`    set${propName}: (value) => set({ ${propKey}: value })`)

    // Array-specific actions
    if (isArray(p.type)) {
      const isPrimitive = isPrimitiveArrayElement(p.type)

      actions.push(
        // Prepend - add to beginning
        `    prepend${propName}: (item) => set((state) => ({ ${propKey}: [item, ...state.${propKey}] }))`,

        // Append - add to end
        `    append${propName}: (item) => set((state) => ({ ${propKey}: [...state.${propKey}, item] }))`,

        // Insert at index
        `    insert${propName}At: (index, item) => set((state) => {
      const newArray = [...state.${propKey}]
      newArray.splice(index, 0, item)
      return { ${propKey}: newArray }
    })`,

        // Remove at index
        `    remove${propName}At: (index) => set((state) => ({
      ${propKey}: state.${propKey}.filter((_, i) => i !== index)
    }))`,

        // Remove by predicate
        `    remove${propName}: (predicate) => set((state) => ({
      ${propKey}: state.${propKey}.filter((item, index) => !predicate(item, index))
    }))`,

        // Move item from one index to another
        `    move${propName}: (fromIndex, toIndex) => set((state) => {
      const newArray = [...state.${propKey}]
      const [item] = newArray.splice(fromIndex, 1)
      newArray.splice(toIndex, 0, item)
      return { ${propKey}: newArray }
    })`,

        // Update item at index - different implementation for primitives vs objects
        isPrimitive
          ? `    update${propName}At: (index, update) => set((state) => {
      const newArray = [...state.${propKey}]
      newArray[index] = typeof update === 'function' ? update(newArray[index]) : update
      return { ${propKey}: newArray }
    })`
          : `    update${propName}At: (index, update) => set((state) => {
      const newArray = [...state.${propKey}]
      const currentItem = newArray[index]
      newArray[index] = typeof update === 'function'
        ? update(currentItem)
        : { ...currentItem, ...update }
      return { ${propKey}: newArray }
    })`,

        // Clear all items
        `    clear${propName}: () => set({ ${propKey}: [] })`
      )
    }
  }

  const storeBody = `(set) => ({
  ...default${stateName}State,
  set${stateName}: (state) => set(state),
  reset${stateName}: () => set(default${stateName}State),
${actions.join(',\n')},
})`

  if (options.persist) {
    const storageKey = options.storageKey || `${stateName.toLowerCase()}-storage`
    return `export const ${storeName} = create<${stateName}State & ${actionsName}>()(
  persist(
    ${storeBody},
    {
      name: '${storageKey}',
    }
  )
)`
  }

  return `export const ${storeName} = create<${stateName}State & ${actionsName}>()(
  ${storeBody}
)`
}

function isArray(type: ParsedType): boolean {
  return type.kind === 'array'
}

function isPrimitiveArrayElement(type: ParsedType): boolean {
  if (type.kind === 'array' && type.elementType) {
    const elemKind = type.elementType.kind
    return elemKind === 'primitive' || elemKind === 'literal'
  }
  return false
}

function getArrayElementType(type: ParsedType, context: StoreBuilderContext): string {
  if (type.kind === 'array' && type.elementType) {
    return typeToTypeScript(type.elementType, context)
  }
  return 'unknown'
}

function typeToTypeScript(type: ParsedType, context: StoreBuilderContext): string {
  switch (type.kind) {
    case 'primitive':
      return type.value as string

    case 'literal':
      if (typeof type.value === 'string') {
        return JSON.stringify(type.value)
      }
      return String(type.value)

    case 'array':
      if (type.elementType) {
        return `${typeToTypeScript(type.elementType, context)}[]`
      }
      return 'unknown[]'

    case 'tuple':
      if (type.elements) {
        const elements = type.elements.map((e) => typeToTypeScript(e, context))
        return `[${elements.join(', ')}]`
      }
      return '[]'

    case 'union':
      if (type.types) {
        const types = type.types.map((t) => typeToTypeScript(t, context))
        return types.join(' | ')
      }
      return 'unknown'

    case 'intersection':
      if (type.types) {
        const types = type.types.map((t) => typeToTypeScript(t, context))
        return types.join(' & ')
      }
      return 'unknown'

    case 'object':
      if (type.properties) {
        const props = type.properties.map((p) => {
          const optional = p.isOptional ? '?' : ''
          return `${p.name}${optional}: ${typeToTypeScript(p.type, context)}`
        })
        return `{ ${props.join('; ')} }`
      }
      return 'object'

    case 'reference':
      // Reference generated state type if available
      return type.name ? `${type.name}State` : 'unknown'

    case 'record':
      if (type.keyType && type.valueType) {
        return `Record<${typeToTypeScript(type.keyType, context)}, ${typeToTypeScript(type.valueType, context)}>`
      }
      return 'Record<string, unknown>'

    case 'enum':
      if (type.enumValues) {
        const values = type.enumValues.map((v) =>
          typeof v.value === 'string' ? JSON.stringify(v.value) : v.value
        )
        return values.join(' | ')
      }
      return 'unknown'

    case 'function':
      return '(() => void)'

    default:
      return 'unknown'
  }
}

function getDefaultValue(
  type: ParsedType,
  isOptional: boolean,
  context: StoreBuilderContext
): string {
  if (isOptional) {
    return 'undefined'
  }

  switch (type.kind) {
    case 'primitive':
      switch (type.value) {
        case 'string':
          return "''"
        case 'number':
          return '0'
        case 'boolean':
          return 'false'
        case 'null':
          return 'null'
        case 'undefined':
          return 'undefined'
        case 'bigint':
          return 'BigInt(0)'
        case 'Date':
          return 'new Date()'
        default:
          return 'undefined'
      }

    case 'literal':
      if (typeof type.value === 'string') {
        return JSON.stringify(type.value)
      }
      return String(type.value)

    case 'array':
      return '[]'

    case 'tuple':
      if (type.elements) {
        const defaults = type.elements.map((e) =>
          getDefaultValue(e, false, context)
        )
        return `[${defaults.join(', ')}]`
      }
      return '[]'

    case 'union':
      // Use the first non-undefined/null type's default
      if (type.types && type.types.length > 0) {
        const firstNonNull = type.types.find(
          (t) =>
            !(t.kind === 'primitive' && (t.value === 'null' || t.value === 'undefined'))
        )
        if (firstNonNull) {
          return getDefaultValue(firstNonNull, false, context)
        }
      }
      return 'undefined'

    case 'object':
      if (type.properties) {
        const props = type.properties.map((p) => {
          const defaultVal = getDefaultValue(p.type, p.isOptional, context)
          return `${p.name}: ${defaultVal}`
        })
        return `{ ${props.join(', ')} }`
      }
      return '{}'

    case 'reference':
      // Use default state of the referenced type
      return `default${type.name}State`

    case 'record':
      return '{}'

    case 'enum':
      if (type.enumValues && type.enumValues.length > 0) {
        const first = type.enumValues[0]
        return typeof first.value === 'string'
          ? JSON.stringify(first.value)
          : String(first.value)
      }
      return 'undefined'

    default:
      return 'undefined'
  }
}

function isFunction(type: ParsedType): boolean {
  return type.kind === 'function'
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateImports(options: StoreBuilderOptions): string {
  if (options.persist) {
    return `import { create } from 'zustand'
import { persist } from 'zustand/middleware'`
  }
  return `import { create } from 'zustand'`
}
