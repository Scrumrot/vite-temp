import type { ParsedType, ParsedProperty, ParsedDeclaration } from './type-parser'

export interface BuildContext {
  knownTypes: Set<string>
  recursiveTypes: Set<string>
  warnings: string[]
}

export function buildSchemaString(
  declaration: ParsedDeclaration,
  context: BuildContext
): string | null {
  const { name, type, isExported } = declaration

  // Skip non-exported types unless they're dependencies
  if (!isExported && !context.knownTypes.has(name)) {
    return null
  }

  // Skip function types
  if (type.kind === 'function') {
    context.warnings.push(`Skipping ${name}: contains function type`)
    return null
  }

  const schemaName = `${name}Schema`
  const isRecursive = context.recursiveTypes.has(name)

  let schemaBody: string

  if (isRecursive) {
    // Use z.lazy for recursive types
    schemaBody = `z.lazy(() => ${typeToZod(type, context)})`
    return `export const ${schemaName}: z.ZodType<${name}> = ${schemaBody};`
  } else {
    schemaBody = typeToZod(type, context)
    return `export const ${schemaName} = ${schemaBody};`
  }
}

export function typeToZod(type: ParsedType, context: BuildContext): string {
  switch (type.kind) {
    case 'primitive':
      return primitiveToZod(type.value as string)

    case 'literal':
      return literalToZod(type.value!)

    case 'array':
      if (type.elementType) {
        return `z.array(${typeToZod(type.elementType, context)})`
      }
      return 'z.array(z.unknown())'

    case 'tuple':
      if (type.elements) {
        const elements = type.elements.map((e) => typeToZod(e, context))
        return `z.tuple([${elements.join(', ')}])`
      }
      return 'z.tuple([])'

    case 'union':
      return unionToZod(type.types || [], context)

    case 'intersection':
      return intersectionToZod(type.types || [], context)

    case 'object':
      return objectToZod(type.properties || [], context)

    case 'reference':
      return `${type.name}Schema`

    case 'enum':
      return enumToZod(type.enumValues || [])

    case 'record':
      if (type.keyType && type.valueType) {
        const keySchema = typeToZod(type.keyType, context)
        const valueSchema = typeToZod(type.valueType, context)
        return `z.record(${keySchema}, ${valueSchema})`
      }
      return 'z.record(z.string(), z.unknown())'

    case 'function':
      context.warnings.push('Function types cannot be converted to Zod schemas')
      return 'z.any() /* function type */'

    case 'unknown':
    default:
      if (type.value) {
        context.warnings.push(`Unknown type: ${type.value}`)
        return `z.any() /* ${type.value} */`
      }
      return 'z.unknown()'
  }
}

function primitiveToZod(primitive: string): string {
  switch (primitive) {
    case 'string':
      return 'z.string()'
    case 'number':
      return 'z.number()'
    case 'boolean':
      return 'z.boolean()'
    case 'null':
      return 'z.null()'
    case 'undefined':
      return 'z.undefined()'
    case 'any':
      return 'z.any()'
    case 'unknown':
      return 'z.unknown()'
    case 'never':
      return 'z.never()'
    case 'void':
      return 'z.void()'
    case 'bigint':
      return 'z.bigint()'
    case 'Date':
      return 'z.date()'
    default:
      return 'z.unknown()'
  }
}

function literalToZod(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return `z.literal(${JSON.stringify(value)})`
  }
  return `z.literal(${value})`
}

function unionToZod(types: ParsedType[], context: BuildContext): string {
  // Check for optional pattern (T | undefined)
  const hasUndefined = types.some(
    (t) => t.kind === 'primitive' && t.value === 'undefined'
  )
  const nonUndefinedTypes = types.filter(
    (t) => !(t.kind === 'primitive' && t.value === 'undefined')
  )

  if (hasUndefined && nonUndefinedTypes.length === 1) {
    return `${typeToZod(nonUndefinedTypes[0], context)}.optional()`
  }

  // Check for nullable pattern (T | null)
  const hasNull = types.some(
    (t) => t.kind === 'primitive' && t.value === 'null'
  )
  const nonNullTypes = types.filter(
    (t) => !(t.kind === 'primitive' && t.value === 'null')
  )

  if (hasNull && !hasUndefined && nonNullTypes.length === 1) {
    return `${typeToZod(nonNullTypes[0], context)}.nullable()`
  }

  // Check if all types are string literals (for z.enum)
  const allStringLiterals = types.every(
    (t) => t.kind === 'literal' && typeof t.value === 'string'
  )
  if (allStringLiterals && types.length > 0) {
    const values = types.map((t) => JSON.stringify(t.value))
    return `z.enum([${values.join(', ')}])`
  }

  // Check for discriminated union
  const discriminator = findDiscriminator(types, context)
  if (discriminator) {
    const schemas = types.map((t) => typeToZod(t, context))
    return `z.discriminatedUnion(${JSON.stringify(discriminator)}, [${schemas.join(', ')}])`
  }

  // Regular union
  const schemas = types.map((t) => typeToZod(t, context))
  return `z.union([${schemas.join(', ')}])`
}

function findDiscriminator(
  types: ParsedType[],
  _context: BuildContext
): string | null {
  // Check if all types are objects with a common literal property
  if (!types.every((t) => t.kind === 'object' && t.properties)) {
    return null
  }

  const firstProps = types[0].properties || []

  for (const prop of firstProps) {
    if (prop.type.kind !== 'literal') continue

    const propName = prop.name
    const allHaveLiteralProp = types.every((t) => {
      const p = t.properties?.find((p) => p.name === propName)
      return p && p.type.kind === 'literal'
    })

    if (allHaveLiteralProp) {
      return propName
    }
  }

  return null
}

function intersectionToZod(types: ParsedType[], context: BuildContext): string {
  if (types.length === 0) return 'z.object({})'
  if (types.length === 1) return typeToZod(types[0], context)

  const schemas = types.map((t) => typeToZod(t, context))
  return schemas.reduce((acc, schema, i) => {
    if (i === 0) return schema
    return `${acc}.and(${schema})`
  })
}

function objectToZod(properties: ParsedProperty[], context: BuildContext): string {
  if (properties.length === 0) {
    return 'z.object({})'
  }

  const propSchemas = properties.map((prop) => {
    let schema = typeToZod(prop.type, context)

    // Handle optional properties (avoid double .optional())
    if (prop.isOptional && !schema.endsWith('.optional()')) {
      schema = `${schema}.optional()`
    }

    return `  ${prop.name}: ${schema}`
  })

  return `z.object({\n${propSchemas.join(',\n')},\n})`
}

function enumToZod(
  values: Array<{ name: string; value: string | number }>
): string {
  // Check if all values are strings
  const allStrings = values.every((v) => typeof v.value === 'string')

  if (allStrings) {
    const stringValues = values.map((v) => JSON.stringify(v.value))
    return `z.enum([${stringValues.join(', ')}])`
  }

  // For numeric enums, use z.union of literals
  const literals = values.map((v) => {
    if (typeof v.value === 'string') {
      return `z.literal(${JSON.stringify(v.value)})`
    }
    return `z.literal(${v.value})`
  })
  return `z.union([${literals.join(', ')}])`
}

export function generateTypeExport(name: string): string {
  return `export type ${name} = z.infer<typeof ${name}Schema>;`
}
