import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CodeEditor from '../CodeEditor'
import RuleWizardDialog from '../RuleWizardDialog'
import { useFormBuilderWizardStore } from '../../stores/formBuilderWizardStore'
import type { ValidationSeverity, ParsedDeclaration, ParsedType } from '../../types'

// Collect all dependencies recursively for a set of types
function collectAllDependencies(
  declarations: ParsedDeclaration[],
  selectedTypes: string[],
  collected: Set<string> = new Set()
): Set<string> {
  const declarationMap = new Map(declarations.map((d) => [d.name, d]))

  for (const typeName of selectedTypes) {
    if (collected.has(typeName)) continue
    collected.add(typeName)

    const decl = declarationMap.get(typeName)
    if (decl?.dependencies && decl.dependencies.size > 0) {
      // Recursively collect dependencies
      const deps = Array.from(decl.dependencies).filter((d) => declarationMap.has(d))
      collectAllDependencies(declarations, deps, collected)
    }
  }

  return collected
}

// Sort types so dependencies come before types that use them
function sortByDependencyOrder(
  declarations: ParsedDeclaration[],
  typeNames: string[]
): string[] {
  const declarationMap = new Map(declarations.map((d) => [d.name, d]))
  const sorted: string[] = []
  const visited = new Set<string>()

  function visit(typeName: string) {
    if (visited.has(typeName)) return
    visited.add(typeName)

    const decl = declarationMap.get(typeName)
    if (decl?.dependencies) {
      // Visit dependencies first
      for (const dep of decl.dependencies) {
        if (typeNames.includes(dep)) {
          visit(dep)
        }
      }
    }
    sorted.push(typeName)
  }

  for (const typeName of typeNames) {
    visit(typeName)
  }

  return sorted
}

// Generate Zod schema code from parsed declarations
function generateSchemaCode(declarations: ParsedDeclaration[], selectedTypes: string[]): string {
  if (selectedTypes.length === 0) return '// No types selected'

  // Collect all types including dependencies
  const allTypes = collectAllDependencies(declarations, selectedTypes)

  // Sort so dependencies come first
  const sortedTypes = sortByDependencyOrder(declarations, Array.from(allTypes))

  const declarationMap = new Map(declarations.map((d) => [d.name, d]))

  const lines: string[] = [
    '// Auto-generated Zod schemas',
    "import { z } from 'zod'",
    '',
  ]

  for (const typeName of sortedTypes) {
    const decl = declarationMap.get(typeName)
    if (!decl) continue

    const schemaName = `${decl.name}Schema`
    const zodCode = typeToZod(decl.type, decl.name)

    // Add comment if this is an auto-included dependency
    if (!selectedTypes.includes(typeName)) {
      lines.push(`// Dependency of selected type(s)`)
    }

    lines.push(`export const ${schemaName} = ${zodCode}`)
    lines.push(`export type ${decl.name} = z.infer<typeof ${schemaName}>`)
    lines.push('')
  }

  return lines.join('\n')
}

function typeToZod(type: ParsedType, _name?: string): string {
  switch (type.kind) {
    case 'primitive':
      switch (type.value) {
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
        case 'Date':
          return 'z.date()'
        case 'void':
          return 'z.void()'
        case 'never':
          return 'z.never()'
        case 'bigint':
          return 'z.bigint()'
        default:
          return 'z.any()'
      }

    case 'literal':
      if (typeof type.value === 'string') {
        return `z.literal('${type.value}')`
      }
      return `z.literal(${type.value})`

    case 'array':
      return `z.array(${typeToZod(type.elementType!)})`

    case 'tuple':
      const elements = type.elements?.map((e) => typeToZod(e)).join(', ') || ''
      return `z.tuple([${elements}])`

    case 'union':
      const unionTypes = type.types?.map((t) => typeToZod(t)).join(', ') || ''
      return `z.union([${unionTypes}])`

    case 'intersection':
      if (type.types && type.types.length >= 2) {
        const [first, ...rest] = type.types
        return rest.reduce((acc, t) => `${acc}.and(${typeToZod(t)})`, typeToZod(first))
      }
      return 'z.any()'

    case 'object':
      if (type.properties && type.properties.length > 0) {
        const props = type.properties
          .map((p) => {
            const zodType = typeToZod(p.type)
            const optionalSuffix = p.isOptional ? '.optional()' : ''
            return `  ${p.name}: ${zodType}${optionalSuffix}`
          })
          .join(',\n')
        return `z.object({\n${props}\n})`
      }
      return 'z.object({})'

    case 'reference':
      return `${type.name}Schema`

    case 'enum':
      if (type.enumValues && type.enumValues.length > 0) {
        const values = type.enumValues.map((e) =>
          typeof e.value === 'string' ? `'${e.value}'` : `${e.value}`
        )
        return `z.enum([${values.join(', ')}])`
      }
      return 'z.any()'

    case 'record':
      const keyZod = typeToZod(type.keyType!)
      const valueZod = typeToZod(type.valueType!)
      return `z.record(${keyZod}, ${valueZod})`

    case 'function':
      return 'z.function()'

    case 'unknown':
    default:
      return `z.any() /* ${type.value || 'unknown'} */`
  }
}

// Get all fields from selected types for validation rules
function getFieldsFromDeclarations(
  declarations: ParsedDeclaration[],
  selectedTypes: string[]
): string[] {
  const fields: string[] = []
  const selected = declarations.filter((d) => selectedTypes.includes(d.name))

  for (const decl of selected) {
    if (decl.type.kind === 'object' && decl.type.properties) {
      for (const prop of decl.type.properties) {
        fields.push(`${decl.name}.${prop.name}`)
      }
    }
  }

  return fields
}

export default function SchemaPreviewStep() {
  const {
    parsedDeclarations,
    selectedTypes,
    generatedSchemaCode,
    setGeneratedSchemaCode,
    validationRules,
    addValidationRule,
    updateValidationRule,
    removeValidationRule,
  } = useFormBuilderWizardStore()

  const [ruleWizardOpen, setRuleWizardOpen] = useState(false)
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null)

  // Generate schema code when declarations or selection changes
  useEffect(() => {
    const code = generateSchemaCode(parsedDeclarations, selectedTypes)
    setGeneratedSchemaCode(code)
  }, [parsedDeclarations, selectedTypes, setGeneratedSchemaCode])

  const handleOpenRuleWizard = (index: number) => {
    setEditingRuleIndex(index)
    setRuleWizardOpen(true)
  }

  const handleCloseRuleWizard = () => {
    setRuleWizardOpen(false)
    setEditingRuleIndex(null)
  }

  const handleSaveRule = (ruleData: { rule: string; message: string; severity: ValidationSeverity }) => {
    if (editingRuleIndex !== null) {
      updateValidationRule(editingRuleIndex, ruleData)
    }
  }

  const availableFields = useMemo(
    () => getFieldsFromDeclarations(parsedDeclarations, selectedTypes),
    [parsedDeclarations, selectedTypes]
  )

  const handleAddRule = () => {
    addValidationRule({
      field: availableFields[0] || '',
      rule: '.min(1)',
      severity: 'error',
      message: 'Field is required',
      enabled: true,
    })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 2: Schema Preview & Validation Rules
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review the generated Zod schema and add custom validation rules with different severity
        levels.
      </Typography>

      <Stack spacing={3}>
        {/* Generated Schema */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Generated Zod Schema
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Edit the schema below. Use Ctrl+Space for autocomplete suggestions.
          </Typography>
          <CodeEditor
            value={generatedSchemaCode}
            onChange={setGeneratedSchemaCode}
            language="typescript"
            minRows={12}
            height="350px"
          />
        </Box>

        <Divider />

        {/* Validation Rules */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Custom Validation Rules</Typography>
            <Button startIcon={<AddIcon />} onClick={handleAddRule} size="small">
              Add Rule
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add validation rules with severity levels: <strong>Error</strong> (blocks submission),{' '}
            <strong>Warning</strong> (shows warning), <strong>Info</strong> (shows hint).
          </Typography>

          {validationRules.length > 0 ? (
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Enabled</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Rule</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validationRules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onChange={(e) => updateValidationRule(index, { enabled: e.target.checked })}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={rule.field}
                          onChange={(e) => updateValidationRule(index, { field: e.target.value })}
                          size="small"
                          sx={{ minWidth: 150 }}
                        >
                          {availableFields.map((field) => (
                            <MenuItem key={field} value={field}>
                              {field}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TextField
                            value={rule.rule}
                            onChange={(e) => updateValidationRule(index, { rule: e.target.value })}
                            size="small"
                            placeholder=".min(1)"
                            sx={{ width: 100 }}
                          />
                          <Tooltip title="Rule Wizard">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRuleWizard(index)}
                              color="primary"
                            >
                              <AutoFixHighIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={rule.severity}
                          onChange={(e) =>
                            updateValidationRule(index, {
                              severity: e.target.value as ValidationSeverity,
                            })
                          }
                          size="small"
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="error">Error</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="info">Info</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={rule.message}
                          onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                          size="small"
                          placeholder="Validation message"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeValidationRule(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ) : (
            <Paper
              variant="outlined"
              sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}
            >
              <Typography color="text.secondary">
                No custom validation rules. Click "Add Rule" to create one.
              </Typography>
            </Paper>
          )}
        </Box>
      </Stack>

      {/* Rule Wizard Dialog */}
      <RuleWizardDialog
        open={ruleWizardOpen}
        onClose={handleCloseRuleWizard}
        onSave={handleSaveRule}
        initialRule={editingRuleIndex !== null ? validationRules[editingRuleIndex]?.rule : ''}
        initialMessage={editingRuleIndex !== null ? validationRules[editingRuleIndex]?.message : ''}
        initialSeverity={editingRuleIndex !== null ? validationRules[editingRuleIndex]?.severity : 'error'}
      />
    </Box>
  )
}
