import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CodeEditor from '../CodeEditor'
import { useFormBuilderWizardStore } from '../../stores/formBuilderWizardStore'
import type { ParsedDeclaration, ParsedType } from '../../types'

// Collect all referenced type names from a type
function collectReferencedTypes(type: ParsedType, collected: Set<string> = new Set()): Set<string> {
  switch (type.kind) {
    case 'reference':
      if (type.name) {
        collected.add(type.name)
      }
      break
    case 'array':
      if (type.elementType) {
        collectReferencedTypes(type.elementType, collected)
      }
      break
    case 'union':
    case 'intersection':
      if (type.types) {
        for (const t of type.types) {
          collectReferencedTypes(t, collected)
        }
      }
      break
    case 'object':
      if (type.properties) {
        for (const prop of type.properties) {
          collectReferencedTypes(prop.type, collected)
        }
      }
      break
  }
  return collected
}

// Generate Zustand store code
function generateStoreCode(
  declarations: ParsedDeclaration[],
  selectedTypes: string[],
  options: { persist: boolean; storageKey: string; generateArrayActions: boolean }
): string {
  const selected = declarations.filter((d) => selectedTypes.includes(d.name))
  if (selected.length === 0) return '// No types selected'

  // For simplicity, generate a store for the first selected type
  const decl = selected[0]
  const typeName = decl.name
  const storeName = `use${typeName}Store`
  const storageKey = options.storageKey || `${typeName.toLowerCase()}-storage`

  // Collect all dependency types that need to be imported
  const referencedTypes = collectReferencedTypes(decl.type)
  // Filter to only include types that exist in declarations (not primitives)
  const dependencyTypes = Array.from(referencedTypes).filter((name) =>
    declarations.some((d) => d.name === name)
  )

  const lines: string[] = [
    '// Auto-generated Zustand store',
    "import { create } from 'zustand'",
  ]

  if (options.persist) {
    lines.push("import { persist } from 'zustand/middleware'")
  }

  // Build type imports
  const typeImports = [typeName, ...dependencyTypes]
  const schemaImports = [`${typeName}Schema`]
  lines.push(`import { ${schemaImports.join(', ')}, type ${typeImports.join(', type ')} } from './${typeName.toLowerCase()}.schema'`)
  lines.push('')

  // Generate default state
  const defaultState = generateDefaultState(decl.type)

  // Generate state interface
  lines.push(`interface ${typeName}State extends ${typeName} {}`)
  lines.push('')

  // Generate actions interface
  lines.push(`interface ${typeName}Actions {`)
  lines.push(`  set${typeName}: (state: Partial<${typeName}State>) => void`)
  lines.push(`  reset${typeName}: () => void`)

  // Individual setters
  if (decl.type.kind === 'object' && decl.type.properties) {
    for (const prop of decl.type.properties) {
      const setterName = `set${capitalize(prop.name)}`
      const propType = getTypeString(prop.type)
      lines.push(`  ${setterName}: (value: ${propType}) => void`)

      // Array actions
      if (options.generateArrayActions && prop.type.kind === 'array') {
        const elementType = getTypeString(prop.type.elementType!)
        lines.push(`  append${capitalize(prop.name)}: (item: ${elementType}) => void`)
        lines.push(`  remove${capitalize(prop.name)}: (index: number) => void`)
      }
    }
  }

  lines.push('}')
  lines.push('')

  // Generate default values
  lines.push(`const defaultState: ${typeName}State = ${JSON.stringify(defaultState, null, 2)}`)
  lines.push('')

  // Generate store
  if (options.persist) {
    lines.push(`export const ${storeName} = create<${typeName}State & ${typeName}Actions>()(`)
    lines.push('  persist(')
    lines.push('    (set) => ({')
  } else {
    lines.push(`export const ${storeName} = create<${typeName}State & ${typeName}Actions>()((set) => ({`)
  }

  lines.push('      ...defaultState,')
  lines.push('')
  lines.push(`      set${typeName}: (state) => set((prev) => ({ ...prev, ...state })),`)
  lines.push(`      reset${typeName}: () => set(defaultState),`)

  // Individual setters
  if (decl.type.kind === 'object' && decl.type.properties) {
    for (const prop of decl.type.properties) {
      const setterName = `set${capitalize(prop.name)}`
      lines.push(`      ${setterName}: (value) => set({ ${prop.name}: value }),`)

      // Array actions
      if (options.generateArrayActions && prop.type.kind === 'array') {
        lines.push(`      append${capitalize(prop.name)}: (item) => set((state) => ({ ${prop.name}: [...state.${prop.name}, item] })),`)
        lines.push(`      remove${capitalize(prop.name)}: (index) => set((state) => ({ ${prop.name}: state.${prop.name}.filter((_, i) => i !== index) })),`)
      }
    }
  }

  if (options.persist) {
    lines.push('    }),')
    lines.push('    {')
    lines.push(`      name: '${storageKey}',`)
    lines.push('    }')
    lines.push('  )')
    lines.push(')')
  } else {
    lines.push('}))')
  }

  return lines.join('\n')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateDefaultState(type: ParsedType): Record<string, unknown> {
  if (type.kind !== 'object' || !type.properties) return {}

  const state: Record<string, unknown> = {}

  for (const prop of type.properties) {
    state[prop.name] = getDefaultValue(prop.type)
  }

  return state
}

function getDefaultValue(type: ParsedType): unknown {
  switch (type.kind) {
    case 'primitive':
      switch (type.value) {
        case 'string':
          return ''
        case 'number':
          return 0
        case 'boolean':
          return false
        case 'Date':
          return null
        default:
          return null
      }
    case 'array':
      return []
    case 'object':
      return generateDefaultState(type)
    case 'union':
      // Return first non-null type's default or null
      if (type.types && type.types.length > 0) {
        const firstNonNull = type.types.find((t) => !(t.kind === 'primitive' && t.value === 'null'))
        if (firstNonNull) {
          if (firstNonNull.kind === 'literal') {
            return firstNonNull.value
          }
          return getDefaultValue(firstNonNull)
        }
      }
      return null
    case 'literal':
      return type.value
    default:
      return null
  }
}

function getTypeString(type: ParsedType): string {
  switch (type.kind) {
    case 'primitive':
      return type.value as string
    case 'array':
      return `${getTypeString(type.elementType!)}[]`
    case 'union':
      return type.types?.map(getTypeString).join(' | ') || 'unknown'
    case 'literal':
      return typeof type.value === 'string' ? `'${type.value}'` : String(type.value)
    case 'reference':
      return type.name || 'unknown'
    case 'object':
      return 'object'
    default:
      return 'unknown'
  }
}

export default function StoreConfigStep() {
  const {
    parsedDeclarations,
    selectedTypes,
    storeOptions,
    setStoreOptions,
    generatedStoreCode,
    setGeneratedStoreCode,
  } = useFormBuilderWizardStore()

  // Generate store code when options change
  useEffect(() => {
    const code = generateStoreCode(parsedDeclarations, selectedTypes, storeOptions)
    setGeneratedStoreCode(code)
  }, [parsedDeclarations, selectedTypes, storeOptions, setGeneratedStoreCode])

  // Set default storage key based on first selected type
  useEffect(() => {
    if (!storeOptions.storageKey && selectedTypes.length > 0) {
      setStoreOptions({ storageKey: `${selectedTypes[0].toLowerCase()}-storage` })
    }
  }, [selectedTypes])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 3: Store Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how the Zustand store should be generated for your types.
      </Typography>

      <Stack spacing={3}>
        {/* Config Options */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Store Options
          </Typography>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={storeOptions.persist}
                  onChange={(e) => setStoreOptions({ persist: e.target.checked })}
                />
              }
              label="Enable Persistence (localStorage)"
            />

            {storeOptions.persist && (
              <TextField
                label="Storage Key"
                value={storeOptions.storageKey}
                onChange={(e) => setStoreOptions({ storageKey: e.target.value })}
                placeholder="my-store-storage"
                size="small"
                sx={{ maxWidth: 300 }}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={storeOptions.generateArrayActions}
                  onChange={(e) => setStoreOptions({ generateArrayActions: e.target.checked })}
                />
              }
              label="Generate Array Actions (append, remove)"
            />
          </Stack>
        </Box>

        <Divider />

        {/* Generated Store */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Generated Zustand Store
          </Typography>
          <CodeEditor
            value={generatedStoreCode}
            onChange={() => {}}
            language="typescript"
            readOnly
            minRows={15}
            maxRows={25}
          />
        </Box>
      </Stack>
    </Box>
  )
}
