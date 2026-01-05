import {
  Project,
  SourceFile,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  Type,
} from 'ts-morph'
import * as path from 'path'
import * as fs from 'fs'

export interface ParsedProperty {
  name: string
  type: ParsedType
  isOptional: boolean
}

export interface ParsedType {
  kind:
    | 'primitive'
    | 'literal'
    | 'array'
    | 'tuple'
    | 'union'
    | 'intersection'
    | 'object'
    | 'reference'
    | 'enum'
    | 'record'
    | 'unknown'
    | 'function'
  name?: string
  value?: string | number | boolean
  elementType?: ParsedType
  elements?: ParsedType[]
  properties?: ParsedProperty[]
  types?: ParsedType[]
  keyType?: ParsedType
  valueType?: ParsedType
  enumValues?: Array<{ name: string; value: string | number }>
}

export interface ParsedDeclaration {
  name: string
  type: ParsedType
  dependencies: Set<string>
  isExported: boolean
}

export interface ParseResult {
  declarations: ParsedDeclaration[]
  sourceFile: SourceFile
}

export function parseTypeScriptFile(filePath: string): ParseResult {
  const project = new Project({
    tsConfigFilePath: findTsConfig(filePath),
    skipAddingFilesFromTsConfig: true,
  })

  const sourceFile = project.addSourceFileAtPath(filePath)
  const declarations: ParsedDeclaration[] = []

  // Parse interfaces
  for (const iface of sourceFile.getInterfaces()) {
    const parsed = parseInterface(iface, sourceFile)
    if (parsed) declarations.push(parsed)
  }

  // Parse type aliases
  for (const typeAlias of sourceFile.getTypeAliases()) {
    const parsed = parseTypeAlias(typeAlias, sourceFile)
    if (parsed) declarations.push(parsed)
  }

  // Parse enums
  for (const enumDecl of sourceFile.getEnums()) {
    const parsed = parseEnum(enumDecl)
    if (parsed) declarations.push(parsed)
  }

  return { declarations, sourceFile }
}

function findTsConfig(filePath: string): string {
  // Try to find tsconfig.json in parent directories
  let dir = path.dirname(filePath)

  while (dir !== path.dirname(dir)) {
    const tsConfigPath = path.join(dir, 'tsconfig.json')
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath
    }
    dir = path.dirname(dir)
  }

  // Fallback - create a minimal config
  return filePath
}

function parseInterface(
  iface: InterfaceDeclaration,
  sourceFile: SourceFile
): ParsedDeclaration | null {
  const name = iface.getName()
  const dependencies = new Set<string>()
  const properties: ParsedProperty[] = []

  for (const prop of iface.getProperties()) {
    const propType = prop.getType()
    const parsedType = parseType(propType, sourceFile, dependencies)

    properties.push({
      name: prop.getName(),
      type: parsedType,
      isOptional: prop.hasQuestionToken(),
    })
  }

  return {
    name,
    type: {
      kind: 'object',
      name,
      properties,
    },
    dependencies,
    isExported: iface.isExported(),
  }
}

function parseTypeAlias(
  typeAlias: TypeAliasDeclaration,
  sourceFile: SourceFile
): ParsedDeclaration | null {
  const name = typeAlias.getName()
  const dependencies = new Set<string>()
  const type = typeAlias.getType()

  const parsedType = parseType(type, sourceFile, dependencies)
  parsedType.name = name

  return {
    name,
    type: parsedType,
    dependencies,
    isExported: typeAlias.isExported(),
  }
}

function parseEnum(enumDecl: EnumDeclaration): ParsedDeclaration | null {
  const name = enumDecl.getName()
  const enumValues: Array<{ name: string; value: string | number }> = []

  for (const member of enumDecl.getMembers()) {
    const memberName = member.getName()
    const value = member.getValue()
    enumValues.push({
      name: memberName,
      value: value ?? memberName,
    })
  }

  return {
    name,
    type: {
      kind: 'enum',
      name,
      enumValues,
    },
    dependencies: new Set(),
    isExported: enumDecl.isExported(),
  }
}

function parseType(
  type: Type,
  sourceFile: SourceFile,
  dependencies: Set<string>
): ParsedType {
  // Check for function types first
  if (type.getCallSignatures().length > 0) {
    return { kind: 'function' }
  }

  // Primitives
  if (type.isString()) return { kind: 'primitive', value: 'string' }
  if (type.isNumber()) return { kind: 'primitive', value: 'number' }
  if (type.isBoolean()) return { kind: 'primitive', value: 'boolean' }
  if (type.isNull()) return { kind: 'primitive', value: 'null' }
  if (type.isUndefined()) return { kind: 'primitive', value: 'undefined' }
  if (type.isAny()) return { kind: 'primitive', value: 'any' }
  if (type.isUnknown()) return { kind: 'primitive', value: 'unknown' }
  if (type.isNever()) return { kind: 'primitive', value: 'never' }
  if (type.getText() === 'void') return { kind: 'primitive', value: 'void' }
  if (type.getText() === 'bigint') return { kind: 'primitive', value: 'bigint' }

  // Date
  if (type.getText() === 'Date') {
    return { kind: 'primitive', value: 'Date' }
  }

  // Literals
  if (type.isStringLiteral()) {
    return { kind: 'literal', value: type.getLiteralValue() as string }
  }
  if (type.isNumberLiteral()) {
    return { kind: 'literal', value: type.getLiteralValue() as number }
  }
  if (type.isBooleanLiteral()) {
    return { kind: 'literal', value: type.getText() === 'true' }
  }

  // Array
  if (type.isArray()) {
    const elementType = type.getArrayElementType()
    if (elementType) {
      return {
        kind: 'array',
        elementType: parseType(elementType, sourceFile, dependencies),
      }
    }
  }

  // Tuple
  if (type.isTuple()) {
    const elements = type.getTupleElements().map((t) =>
      parseType(t, sourceFile, dependencies)
    )
    return { kind: 'tuple', elements }
  }

  // Union
  if (type.isUnion()) {
    const types = type.getUnionTypes().map((t) =>
      parseType(t, sourceFile, dependencies)
    )
    return { kind: 'union', types }
  }

  // Intersection
  if (type.isIntersection()) {
    const types = type.getIntersectionTypes().map((t) =>
      parseType(t, sourceFile, dependencies)
    )
    return { kind: 'intersection', types }
  }

  // Record type
  const typeText = type.getText()
  if (typeText.startsWith('Record<')) {
    const typeArgs = type.getTypeArguments()
    if (typeArgs.length === 2) {
      return {
        kind: 'record',
        keyType: parseType(typeArgs[0], sourceFile, dependencies),
        valueType: parseType(typeArgs[1], sourceFile, dependencies),
      }
    }
  }

  // Check for referenced types (interfaces/type aliases in the same file)
  if (type.isObject()) {
    const symbol = type.getSymbol() || type.getAliasSymbol()
    if (symbol) {
      const name = symbol.getName()
      const declarations = symbol.getDeclarations()

      // Check if this type is declared in the same source file
      if (declarations.some((d) => d.getSourceFile() === sourceFile)) {
        dependencies.add(name)
        return { kind: 'reference', name }
      }

      // Check if it's an inline object type
      const properties: ParsedProperty[] = []
      for (const prop of type.getProperties()) {
        const propDecl = prop.getValueDeclaration()
        if (propDecl) {
          const propType = propDecl.getType()
          properties.push({
            name: prop.getName(),
            type: parseType(propType, sourceFile, dependencies),
            isOptional: prop.isOptional(),
          })
        }
      }

      if (properties.length > 0) {
        return { kind: 'object', properties }
      }
    }
  }

  // Fallback for complex types we can't fully parse
  return { kind: 'unknown', value: type.getText() }
}
