import { useState } from 'react'
import JSZip from 'jszip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Snackbar from '@mui/material/Snackbar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import FolderZipIcon from '@mui/icons-material/FolderZip'
import DescriptionIcon from '@mui/icons-material/Description'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CodeEditor from '../CodeEditor'
import { useFormBuilderWizardStore } from '../../stores/formBuilderWizardStore'
import type { ParsedDeclaration, ParsedProperty, ParsedType, FieldTypeConfig } from '../../types'

interface GeneratedFile {
  name: string
  content: string
  description: string
}

export default function ExportStep() {
  const {
    selectedTypes,
    parsedDeclarations,
    generatedSchemaCode,
    generatedStoreCode,
    exportFormat,
    setExportFormat,
    excludedFields,
    fieldTypeConfigs,
    fieldOrder,
  } = useFormBuilderWizardStore()

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [expanded, setExpanded] = useState<string | false>('schema')

  const typeName = selectedTypes[0] || 'Type'
  const selectedDecl = parsedDeclarations.find((d) => selectedTypes.includes(d.name))

  // Get properties excluding hidden fields, respecting field order
  const allProperties: ParsedProperty[] =
    selectedDecl?.type.kind === 'object' && selectedDecl.type.properties
      ? selectedDecl.type.properties.filter(
          (p) => p.type.kind !== 'function' && !excludedFields.includes(p.name)
        )
      : []

  // Sort properties based on fieldOrder
  const properties: ParsedProperty[] = fieldOrder.length > 0
    ? fieldOrder
        .filter((name) => !excludedFields.includes(name))
        .map((name) => allProperties.find((p) => p.name === name))
        .filter((p): p is ParsedProperty => p !== undefined)
    : allProperties

  // Generate field files
  const fieldFiles: GeneratedFile[] = properties.map((prop) => {
    const fieldName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
    return {
      name: `fields/${fieldName}Field.tsx`,
      content: generateFieldFileCode(prop, typeName, fieldTypeConfigs[prop.name], parsedDeclarations),
      description: `${formatLabel(prop.name)} field component`,
    }
  })

  // Generate form code that imports from field files
  const generatedFormCode = generateFormCodeWithFieldImports(typeName, selectedDecl, excludedFields, fieldTypeConfigs, fieldOrder)

  const files: GeneratedFile[] = [
    {
      name: `${typeName.toLowerCase()}.schema.ts`,
      content: generatedSchemaCode,
      description: 'Zod validation schema',
    },
    {
      name: `${typeName.toLowerCase()}.store.ts`,
      content: generatedStoreCode,
      description: 'Zustand state store',
    },
    {
      name: `${typeName}Form.tsx`,
      content: generatedFormCode,
      description: 'React form component',
    },
    ...fieldFiles,
  ]

  const handleCopyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setSnackbarMessage(`${fileName} copied to clipboard!`)
      setSnackbarOpen(true)
    } catch {
      setSnackbarMessage('Failed to copy to clipboard')
      setSnackbarOpen(true)
    }
  }

  const handleCopyAll = async () => {
    const allContent = files
      .map((f) => `// ==================== ${f.name} ====================\n\n${f.content}`)
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(allContent)
      setSnackbarMessage('All files copied to clipboard!')
      setSnackbarOpen(true)
    } catch {
      setSnackbarMessage('Failed to copy to clipboard')
      setSnackbarOpen(true)
    }
  }

  const handleDownload = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/typescript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSnackbarMessage(`${file.name} downloaded!`)
    setSnackbarOpen(true)
  }

  const handleDownloadAll = () => {
    for (const file of files) {
      handleDownload(file)
    }
  }

  const handleDownloadZip = async () => {
    const zip = new JSZip()
    const folderName = `${typeName}Form`
    const folder = zip.folder(folderName)

    if (!folder) {
      setSnackbarMessage('Failed to create zip folder')
      setSnackbarOpen(true)
      return
    }

    // Add each file to the zip with proper structure
    for (const file of files) {
      if (file.name.startsWith('fields/')) {
        // Create fields subfolder and add field files
        const fieldsFolder = folder.folder('fields')
        const fileName = file.name.replace('fields/', '')
        fieldsFolder?.file(fileName, file.content)
      } else if (file.name.endsWith('.schema.ts')) {
        folder.file(`${typeName.toLowerCase()}.schema.ts`, file.content)
      } else if (file.name.endsWith('.store.ts')) {
        folder.file(`${typeName.toLowerCase()}.store.ts`, file.content)
      } else if (file.name.endsWith('Form.tsx')) {
        folder.file(`${typeName}Form.tsx`, file.content)
      } else {
        folder.file(file.name, file.content)
      }
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${folderName}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSnackbarMessage(`${folderName}.zip downloaded!`)
      setSnackbarOpen(true)
    } catch {
      setSnackbarMessage('Failed to generate zip file')
      setSnackbarOpen(true)
    }
  }

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 5: Export Generated Code
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and export the generated files. You can copy individual files or download them all.
      </Typography>

      <Stack spacing={3}>
        {/* Export Format */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Export Format
          </Typography>
          <ButtonGroup>
            <Button
              variant={exportFormat === 'separate-files' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('separate-files')}
            >
              Separate Files
            </Button>
            <Button
              variant={exportFormat === 'single-file' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('single-file')}
            >
              Single File
            </Button>
            <Button
              variant={exportFormat === 'clipboard' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('clipboard')}
            >
              Clipboard Only
            </Button>
          </ButtonGroup>
        </Box>

        <Divider />

        {/* Files List */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Generated Files ({files.length})</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyAll}
                size="small"
              >
                Copy All
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadAll}
                size="small"
              >
                Download All
              </Button>
              <Button
                startIcon={<FolderZipIcon />}
                onClick={handleDownloadZip}
                size="small"
                variant="contained"
                color="success"
              >
                Download ZIP
              </Button>
            </Stack>
          </Stack>

          {/* File Accordions */}
          {files.map((file, index) => (
            <Accordion
              key={file.name}
              expanded={expanded === file.name || expanded === `panel${index}`}
              onChange={handleAccordionChange(file.name)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                  <DescriptionIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {file.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyToClipboard(file.content, file.name)}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(file)}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <CodeEditor
                  value={file.content}
                  onChange={() => {}}
                  readOnly
                  minRows={10}
                  maxRows={20}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Next Steps */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="subtitle1">Next Steps</Typography>
          </Stack>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Typography variant="body2">1.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Save the generated files to your project"
                secondary={`Place schema in src/schemas/, store in src/stores/, form in src/components/, and fields in src/components/fields/`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography variant="body2">2.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Import and use the form component"
                secondary={`import ${typeName}Form from './components/${typeName}Form'`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography variant="body2">3.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Access state via the generated store"
                secondary={`const { ${typeName.toLowerCase()}, set${typeName} } = use${typeName}Store()`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography variant="body2">4.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Customize individual field components"
                secondary={`Each field is in its own file under fields/ for easy customization`}
              />
            </ListItem>
          </List>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  )
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

function getFieldType(type: ParsedType): string {
  if (type.kind === 'primitive') {
    return String(type.value || 'string')
  }
  if (type.kind === 'union' && type.types) {
    const nonNull = type.types.filter(
      (t) => !(t.kind === 'primitive' && (t.value === 'null' || t.value === 'undefined'))
    )
    if (nonNull.length === 1) {
      return getFieldType(nonNull[0])
    }
    // Check for literal union (select)
    if (type.types.every((t) => t.kind === 'literal')) {
      return 'select'
    }
  }
  if (type.kind === 'enum') {
    return 'enum'
  }
  return 'string'
}

// Helper to unwrap optional types
function unwrapOptionalType(type: ParsedType): ParsedType {
  if (type.kind === 'union' && type.types) {
    const nonNull = type.types.filter(
      (t) => !(t.kind === 'primitive' && (t.value === 'null' || t.value === 'undefined'))
    )
    if (nonNull.length === 1) {
      return nonNull[0]
    }
  }
  return type
}

// Generate array field component code
function generateArrayFieldCode(
  prop: ParsedProperty,
  typeName: string,
  fieldTypeConfig?: FieldTypeConfig,
  declarations?: ParsedDeclaration[]
): string {
  const fieldName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
  const label = formatLabel(prop.name)
  const storeName = `use${typeName}Store`
  const setterName = `set${fieldName}`
  const mainType = unwrapOptionalType(prop.type)
  const elementType = mainType.elementType!
  const viewMode = fieldTypeConfig?.arrayViewMode ?? 'list'

  // Check if element is an object type
  const isObjectArray = elementType.kind === 'object' ||
    (elementType.kind === 'reference' && declarations?.find(d => d.name === elementType.name)?.type.kind === 'object')

  // Get object properties if applicable
  let objectProperties: ParsedProperty[] = []
  if (elementType.kind === 'object' && elementType.properties) {
    objectProperties = elementType.properties
  } else if (elementType.kind === 'reference' && declarations) {
    const refDecl = declarations.find(d => d.name === elementType.name)
    if (refDecl?.type.kind === 'object' && refDecl.type.properties) {
      objectProperties = refDecl.type.properties
    }
  }

  // Common imports
  const imports = [
    `import { useState } from 'react'`,
    `import Box from '@mui/material/Box'`,
    `import Typography from '@mui/material/Typography'`,
    `import Stack from '@mui/material/Stack'`,
    `import Button from '@mui/material/Button'`,
    `import IconButton from '@mui/material/IconButton'`,
    `import Paper from '@mui/material/Paper'`,
    `import TextField from '@mui/material/TextField'`,
    `import Chip from '@mui/material/Chip'`,
    `import Tooltip from '@mui/material/Tooltip'`,
    `import AddIcon from '@mui/icons-material/Add'`,
    `import DeleteIcon from '@mui/icons-material/Delete'`,
  ]

  if (viewMode === 'table' && isObjectArray) {
    imports.push(
      `import Table from '@mui/material/Table'`,
      `import TableBody from '@mui/material/TableBody'`,
      `import TableCell from '@mui/material/TableCell'`,
      `import TableContainer from '@mui/material/TableContainer'`,
      `import TableHead from '@mui/material/TableHead'`,
      `import TableRow from '@mui/material/TableRow'`,
    )
  }

  // Generate the component code based on view mode
  let fieldJSX: string

  if (isObjectArray && viewMode === 'table' && objectProperties.length > 0) {
    // Table view for object arrays
    const tableColumns = objectProperties.filter(p =>
      p.type.kind === 'primitive' || p.type.kind === 'union' || p.type.kind === 'enum'
    )

    fieldJSX = `    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={500}>
            ${label}
            {value.length > 0 && (
              <Chip size="small" label={value.length} sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
            )}
          </Typography>
        </Stack>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add
        </Button>
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {value.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
          <Typography variant="body2" color="text.secondary">
            No items. Click "Add" to add one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
${tableColumns.map(p => `                <TableCell sx={{ fontWeight: 600 }}>${formatLabel(p.name)}${!p.isOptional ? ' *' : ''}</TableCell>`).join('\n')}
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {value.map((item, index) => (
                <TableRow key={index} hover>
${tableColumns.map(p => `                  <TableCell>
                    <TextField
                      size="small"
                      variant="standard"
                      value={(item as Record<string, unknown>)?.${p.name} ?? ''}
                      onChange={(e) => handleUpdateField(index, '${p.name}', e.target.value)}
                      fullWidth
                    />
                  </TableCell>`).join('\n')}
                  <TableCell>
                    <Tooltip title="Remove item">
                      <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>`
  } else if (isObjectArray && objectProperties.length > 0) {
    // List view for object arrays
    fieldJSX = `    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={500}>
            ${label}
            {value.length > 0 && (
              <Chip size="small" label={value.length} sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
            )}
          </Typography>
        </Stack>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add
        </Button>
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {value.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
          <Typography variant="body2" color="text.secondary">
            No items. Click "Add" to add one.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {value.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Stack spacing={1.5}>
${objectProperties.map(p => `                  <TextField
                    fullWidth
                    size="small"
                    label="${formatLabel(p.name)}${!p.isOptional ? ' *' : ''}"
                    value={(item as Record<string, unknown>)?.${p.name} ?? ''}
                    onChange={(e) => handleUpdateField(index, '${p.name}', e.target.value)}
                  />`).join('\n')}
                </Stack>
              </Paper>
              <Tooltip title="Remove item">
                <IconButton size="small" onClick={() => handleRemoveItem(index)} sx={{ mt: 1 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </Box>`
  } else {
    // Primitive array (list of strings, numbers, etc.)
    fieldJSX = `    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight={500}>
          ${label}
          {value.length > 0 && (
            <Chip size="small" label={value.length} sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
          )}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add
        </Button>
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {value.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
          <Typography variant="body2" color="text.secondary">
            No items. Click "Add" to add one.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {value.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={item ?? ''}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                placeholder={\`Item \${index + 1}\`}
              />
              <Tooltip title="Remove item">
                <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </Box>`
  }

  // Generate helper functions based on array type
  const helperFunctions = isObjectArray && objectProperties.length > 0
    ? `
  const handleAddItem = () => {
    onChange([...value, { ${objectProperties.map(p => `${p.name}: ''`).join(', ')} }])
  }

  const handleRemoveItem = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const handleUpdateField = (index: number, field: string, fieldValue: unknown) => {
    const newValue = [...value]
    newValue[index] = { ...(newValue[index] as Record<string, unknown>), [field]: fieldValue }
    onChange(newValue)
  }`
    : `
  const handleAddItem = () => {
    onChange([...value, ''])
  }

  const handleRemoveItem = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const handleUpdateItem = (index: number, newItemValue: unknown) => {
    const newValue = [...value]
    newValue[index] = newItemValue
    onChange(newValue)
  }`

  return `// Auto-generated array field component for ${prop.name}
${imports.join('\n')}
import { ${storeName} } from '../${typeName.toLowerCase()}.store'

interface ${fieldName}FieldProps {
  error?: string
}

export default function ${fieldName}Field({ error }: ${fieldName}FieldProps) {
  const value = ${storeName}((state) => state.${prop.name}) as unknown[]
  const onChange = ${storeName}((state) => state.${setterName})
${helperFunctions}

  return (
${fieldJSX}
  )
}
`
}

// Generate a standalone field component file
function generateFieldFileCode(
  prop: ParsedProperty,
  typeName: string,
  fieldTypeConfig?: FieldTypeConfig,
  declarations?: ParsedDeclaration[]
): string {
  const fieldName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
  const label = formatLabel(prop.name)
  const required = !prop.isOptional
  const mainType = unwrapOptionalType(prop.type)
  const fieldType = getFieldType(prop.type)
  const storeName = `use${typeName}Store`
  const setterName = `set${fieldName}`

  const imports: string[] = []
  let fieldJSX = ''

  // Handle array fields
  if (mainType.kind === 'array' && mainType.elementType) {
    return generateArrayFieldCode(prop, typeName, fieldTypeConfig, declarations)
  }

  // Handle select/enum fields
  if (fieldType === 'select' && prop.type.kind === 'union' && prop.type.types) {
    const options = prop.type.types
      .filter((t) => t.kind === 'literal')
      .map((t) => t.value as string)

    imports.push(
      `import FormControl from '@mui/material/FormControl'`,
      `import InputLabel from '@mui/material/InputLabel'`,
      `import Select from '@mui/material/Select'`,
      `import MenuItem from '@mui/material/MenuItem'`,
      `import Typography from '@mui/material/Typography'`
    )

    fieldJSX = `    <FormControl fullWidth error={!!error}>
      <InputLabel>${label}${required ? ' *' : ''}</InputLabel>
      <Select
        value={value ?? ''}
        label="${label}${required ? ' *' : ''}"
        onChange={(e) => onChange(e.target.value)}
      >
${options.map((opt) => `        <MenuItem value="${opt}">${formatLabel(String(opt))}</MenuItem>`).join('\n')}
      </Select>
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </FormControl>`
  } else if (fieldType === 'enum' && prop.type.enumValues) {
    imports.push(
      `import FormControl from '@mui/material/FormControl'`,
      `import InputLabel from '@mui/material/InputLabel'`,
      `import Select from '@mui/material/Select'`,
      `import MenuItem from '@mui/material/MenuItem'`
    )

    fieldJSX = `    <FormControl fullWidth error={!!error}>
      <InputLabel>${label}${required ? ' *' : ''}</InputLabel>
      <Select
        value={value ?? ''}
        label="${label}${required ? ' *' : ''}"
        onChange={(e) => onChange(e.target.value)}
      >
${prop.type.enumValues.map((ev) => `        <MenuItem value="${ev.value}">${ev.name}</MenuItem>`).join('\n')}
      </Select>
    </FormControl>`
  } else if (fieldType === 'boolean') {
    imports.push(
      `import FormControlLabel from '@mui/material/FormControlLabel'`,
      `import Switch from '@mui/material/Switch'`
    )

    fieldJSX = `    <FormControlLabel
      control={
        <Switch
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label="${label}"
    />`
  } else if (fieldType === 'number') {
    imports.push(`import TextField from '@mui/material/TextField'`)

    fieldJSX = `    <TextField
      fullWidth
      type="number"
      label="${label}${required ? ' *' : ''}"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      error={!!error}
      helperText={error}
    />`
  } else if (fieldType === 'Date') {
    imports.push(`import TextField from '@mui/material/TextField'`)

    fieldJSX = `    <TextField
      fullWidth
      type="date"
      label="${label}${required ? ' *' : ''}"
      value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      error={!!error}
      helperText={error}
      slotProps={{ inputLabel: { shrink: true } }}
    />`
  } else {
    // Default: string text field
    imports.push(`import TextField from '@mui/material/TextField'`)

    fieldJSX = `    <TextField
      fullWidth
      label="${label}${required ? ' *' : ''}"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
    />`
  }

  return `// Auto-generated field component for ${prop.name}
${imports.join('\n')}
import { ${storeName} } from '../${typeName.toLowerCase()}.store'

interface ${fieldName}FieldProps {
  error?: string
}

export default function ${fieldName}Field({ error }: ${fieldName}FieldProps) {
  const value = ${storeName}((state) => state.${prop.name})
  const onChange = ${storeName}((state) => state.${setterName})

  return (
${fieldJSX}
  )
}
`
}

// Generate form code that imports from individual field files
function generateFormCodeWithFieldImports(
  typeName: string,
  declaration?: ParsedDeclaration,
  excludedFields: string[] = [],
  fieldTypeConfigs: Record<string, FieldTypeConfig> = {},
  fieldOrder: string[] = []
): string {
  const storeName = `use${typeName}Store`
  const schemaName = `${typeName}Schema`

  // Get properties excluding hidden fields
  let allProperties: ParsedProperty[] = []
  if (declaration?.type.kind === 'object' && declaration.type.properties) {
    allProperties = declaration.type.properties.filter(
      (p) => p.type.kind !== 'function' && !excludedFields.includes(p.name)
    )
  }

  // Sort properties based on fieldOrder
  const properties: ParsedProperty[] = fieldOrder.length > 0
    ? fieldOrder
        .filter((name) => !excludedFields.includes(name))
        .map((name) => allProperties.find((p) => p.name === name))
        .filter((p): p is ParsedProperty => p !== undefined)
    : allProperties

  // Generate field component imports
  const fieldImports = properties
    .map((p) => {
      const fieldName = p.name.charAt(0).toUpperCase() + p.name.slice(1)
      return `import ${fieldName}Field from './fields/${fieldName}Field'`
    })
    .join('\n')

  // Generate field component usages with Grid items
  const fieldComponents = properties
    .map((p) => {
      const fieldName = p.name.charAt(0).toUpperCase() + p.name.slice(1)
      const gridSize = fieldTypeConfigs[p.name]?.gridSize ?? 12
      return `          <Grid size={{ xs: 12, md: ${gridSize} }}>
            <${fieldName}Field error={errors.${p.name}} />
          </Grid>`
    })
    .join('\n')

  return `// Auto-generated form component
import { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { ${schemaName}, type ${typeName} } from './${typeName.toLowerCase()}.schema'
import { ${storeName} } from './${typeName.toLowerCase()}.store'
${fieldImports}

interface ${typeName}FormProps {
  onSubmit?: (data: ${typeName}) => void | Promise<void>
  onCancel?: () => void
}

export default function ${typeName}Form({ onSubmit, onCancel }: ${typeName}FormProps) {
  const store = ${storeName}()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validate with Zod
    const result = ${schemaName}.safeParse(store)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    try {
      await onSubmit?.(result.data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Grid container spacing={2.5}>
${fieldComponents || '        {/* No fields to display */}'}
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </Box>
  )
}
`
}
