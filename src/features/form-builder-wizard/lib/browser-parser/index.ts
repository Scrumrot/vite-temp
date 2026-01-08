import ts from 'typescript'
import type {
  ParsedDeclaration,
  ParsedType,
  ParsedProperty,
  BrowserParseResult,
} from '../../types'

/**
 * Parse TypeScript code string in the browser using TypeScript compiler API.
 * Produces the same ParsedDeclaration structure as the Node.js ts-morph parser.
 */
export function parseTypeScriptString(code: string): BrowserParseResult {
  const sourceFile = ts.createSourceFile(
    'input.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  const declarations: ParsedDeclaration[] = []
  const errors: string[] = []

  // Collect syntax errors
  const syntaxErrors = getDiagnostics(sourceFile)
  errors.push(...syntaxErrors)

  // Walk AST and extract declarations
  ts.forEachChild(sourceFile, (node) => {
    try {
      if (ts.isInterfaceDeclaration(node)) {
        declarations.push(parseInterface(node, sourceFile))
      } else if (ts.isTypeAliasDeclaration(node)) {
        declarations.push(parseTypeAlias(node, sourceFile))
      } else if (ts.isEnumDeclaration(node)) {
        declarations.push(parseEnum(node, sourceFile))
      }
    } catch (e) {
      errors.push(`Error parsing declaration: ${e instanceof Error ? e.message : String(e)}`)
    }
  })

  return { declarations, errors }
}

function getDiagnostics(sourceFile: ts.SourceFile): string[] {
  const errors: string[] = []

  // Simple syntax error detection by checking for parse errors in the source file
  const visit = (node: ts.Node) => {
    // Check for nodes with syntax errors (missing elements, etc.)
    if (node.kind === ts.SyntaxKind.Unknown) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
      errors.push(`Syntax error at line ${line + 1}, column ${character + 1}`)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return errors
}

function hasExportModifier(node: ts.Declaration): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false
}

function parseInterface(
  node: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile
): ParsedDeclaration {
  const name = node.name.text
  const dependencies = new Set<string>()
  const properties: ParsedProperty[] = []

  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.name && member.type) {
      properties.push({
        name: member.name.getText(sourceFile),
        type: parseTypeNode(member.type, sourceFile, dependencies),
        isOptional: !!member.questionToken,
      })
    }
  }

  return {
    name,
    type: { kind: 'object', name, properties },
    dependencies,
    isExported: hasExportModifier(node),
  }
}

function parseTypeAlias(
  node: ts.TypeAliasDeclaration,
  sourceFile: ts.SourceFile
): ParsedDeclaration {
  const name = node.name.text
  const dependencies = new Set<string>()

  const parsedType = parseTypeNode(node.type, sourceFile, dependencies)
  parsedType.name = name

  return {
    name,
    type: parsedType,
    dependencies,
    isExported: hasExportModifier(node),
  }
}

function parseEnum(
  node: ts.EnumDeclaration,
  sourceFile: ts.SourceFile
): ParsedDeclaration {
  const name = node.name.text
  const enumValues: Array<{ name: string; value: string | number }> = []

  let autoValue = 0
  for (const member of node.members) {
    const memberName = member.name.getText(sourceFile)
    let value: string | number = autoValue

    if (member.initializer) {
      if (ts.isStringLiteral(member.initializer)) {
        value = member.initializer.text
      } else if (ts.isNumericLiteral(member.initializer)) {
        value = Number(member.initializer.text)
        autoValue = value + 1
      }
    } else {
      autoValue++
    }

    enumValues.push({ name: memberName, value })
  }

  return {
    name,
    type: { kind: 'enum', name, enumValues },
    dependencies: new Set(),
    isExported: hasExportModifier(node),
  }
}

function parseTypeNode(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile,
  dependencies: Set<string>
): ParsedType {
  // Handle primitives
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return { kind: 'primitive', value: 'string' }
    case ts.SyntaxKind.NumberKeyword:
      return { kind: 'primitive', value: 'number' }
    case ts.SyntaxKind.BooleanKeyword:
      return { kind: 'primitive', value: 'boolean' }
    case ts.SyntaxKind.NullKeyword:
      return { kind: 'primitive', value: 'null' }
    case ts.SyntaxKind.UndefinedKeyword:
      return { kind: 'primitive', value: 'undefined' }
    case ts.SyntaxKind.AnyKeyword:
      return { kind: 'primitive', value: 'any' }
    case ts.SyntaxKind.UnknownKeyword:
      return { kind: 'primitive', value: 'unknown' }
    case ts.SyntaxKind.NeverKeyword:
      return { kind: 'primitive', value: 'never' }
    case ts.SyntaxKind.VoidKeyword:
      return { kind: 'primitive', value: 'void' }
    case ts.SyntaxKind.BigIntKeyword:
      return { kind: 'primitive', value: 'bigint' }
  }

  // Handle arrays - Array<T> or T[]
  if (ts.isArrayTypeNode(typeNode)) {
    return {
      kind: 'array',
      elementType: parseTypeNode(typeNode.elementType, sourceFile, dependencies),
    }
  }

  // Handle tuples
  if (ts.isTupleTypeNode(typeNode)) {
    const elements = typeNode.elements.map((el) => {
      if (ts.isNamedTupleMember(el)) {
        return parseTypeNode(el.type, sourceFile, dependencies)
      }
      return parseTypeNode(el, sourceFile, dependencies)
    })
    return { kind: 'tuple', elements }
  }

  // Handle unions
  if (ts.isUnionTypeNode(typeNode)) {
    const types = typeNode.types.map((t) => parseTypeNode(t, sourceFile, dependencies))
    return { kind: 'union', types }
  }

  // Handle intersections
  if (ts.isIntersectionTypeNode(typeNode)) {
    const types = typeNode.types.map((t) => parseTypeNode(t, sourceFile, dependencies))
    return { kind: 'intersection', types }
  }

  // Handle literal types
  if (ts.isLiteralTypeNode(typeNode)) {
    const literal = typeNode.literal
    if (ts.isStringLiteral(literal)) {
      return { kind: 'literal', value: literal.text }
    }
    if (ts.isNumericLiteral(literal)) {
      return { kind: 'literal', value: Number(literal.text) }
    }
    if (literal.kind === ts.SyntaxKind.TrueKeyword) {
      return { kind: 'literal', value: true }
    }
    if (literal.kind === ts.SyntaxKind.FalseKeyword) {
      return { kind: 'literal', value: false }
    }
    if (literal.kind === ts.SyntaxKind.NullKeyword) {
      return { kind: 'primitive', value: 'null' }
    }
  }

  // Handle type references (Date, custom types, generics)
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName.getText(sourceFile)

    // Handle Date
    if (typeName === 'Date') {
      return { kind: 'primitive', value: 'Date' }
    }

    // Handle Array<T>
    if (typeName === 'Array' && typeNode.typeArguments?.length === 1) {
      return {
        kind: 'array',
        elementType: parseTypeNode(typeNode.typeArguments[0], sourceFile, dependencies),
      }
    }

    // Handle Record<K, V>
    if (typeName === 'Record' && typeNode.typeArguments?.length === 2) {
      return {
        kind: 'record',
        keyType: parseTypeNode(typeNode.typeArguments[0], sourceFile, dependencies),
        valueType: parseTypeNode(typeNode.typeArguments[1], sourceFile, dependencies),
      }
    }

    // Handle Partial, Required, Pick, Omit as references for now
    if (['Partial', 'Required', 'Pick', 'Omit', 'Readonly'].includes(typeName)) {
      if (typeNode.typeArguments?.length) {
        const innerType = parseTypeNode(typeNode.typeArguments[0], sourceFile, dependencies)
        return innerType
      }
    }

    // It's a reference to another type in the file
    dependencies.add(typeName)
    return { kind: 'reference', name: typeName }
  }

  // Handle inline object types (type literals)
  if (ts.isTypeLiteralNode(typeNode)) {
    const properties: ParsedProperty[] = []

    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member) && member.name && member.type) {
        properties.push({
          name: member.name.getText(sourceFile),
          type: parseTypeNode(member.type, sourceFile, dependencies),
          isOptional: !!member.questionToken,
        })
      }
    }

    return { kind: 'object', properties }
  }

  // Handle parenthesized types
  if (ts.isParenthesizedTypeNode(typeNode)) {
    return parseTypeNode(typeNode.type, sourceFile, dependencies)
  }

  // Handle function types
  if (ts.isFunctionTypeNode(typeNode)) {
    return { kind: 'function' }
  }

  // Fallback for unknown types
  return { kind: 'unknown', value: typeNode.getText(sourceFile) }
}

export { type ParsedDeclaration, type ParsedType, type ParsedProperty, type BrowserParseResult }
