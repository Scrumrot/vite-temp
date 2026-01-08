import { useState, useEffect, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import Slider from '@mui/material/Slider'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import EditIcon from '@mui/icons-material/Edit'
import PreviewIcon from '@mui/icons-material/Preview'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewListIcon from '@mui/icons-material/ViewList'
import TableRowsIcon from '@mui/icons-material/TableRows'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ValidationDisplay from '../ValidationDisplay'
import { useFormBuilderWizardStore } from '../../stores/formBuilderWizardStore'
import type {
  ParsedDeclaration,
  ParsedType,
  ParsedProperty,
  TieredValidationResult,
  ValidationIssue,
  FieldTypeConfig,
  FieldComponentType,
  GridSize,
  ArrayViewMode,
} from '../../types'

interface FieldRendererProps {
  property: ParsedProperty
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  warning?: string
  info?: string
  declarations?: ParsedDeclaration[]
  fieldTypeConfig?: FieldTypeConfig
  editMode?: boolean
  onFieldTypeConfigChange?: (updates: Partial<FieldTypeConfig>) => void
}

function FieldRenderer({ property, value, onChange, error, warning, info, declarations = [], fieldTypeConfig, editMode = false, onFieldTypeConfigChange }: FieldRendererProps) {
  const { name, type, isOptional } = property
  const label = formatLabel(name) + (isOptional ? '' : ' *')
  const helperText = error || warning || info
  const color = error ? 'error' : warning ? 'warning' : undefined

  const mainType = unwrapOptional(type)
  const componentType = fieldTypeConfig?.component || getDefaultComponent(type)

  // Handle arrays separately (no alternative components)
  if (mainType.kind === 'array') {
    return (
      <ArrayFieldRenderer
        label={label}
        elementType={mainType.elementType!}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        declarations={declarations}
        error={error}
        editMode={editMode}
        fieldTypeConfig={fieldTypeConfig}
        onViewModeChange={(mode) => onFieldTypeConfigChange?.({ arrayViewMode: mode })}
      />
    )
  }

  // Render based on component type override
  switch (componentType) {
    // String components
    case 'TextField':
      if (mainType.kind === 'primitive' && mainType.value === 'number') {
        return (
          <TextField
            fullWidth
            type="number"
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            error={!!error}
            helperText={helperText}
            color={color}
          />
        )
      }
      if (mainType.kind === 'primitive' && mainType.value === 'Date') {
        return (
          <TextField
            fullWidth
            type="date"
            label={label}
            value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
            error={!!error}
            helperText={helperText}
            slotProps={{ inputLabel: { shrink: true } }}
            color={color}
          />
        )
      }
      return (
        <TextField
          fullWidth
          label={label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={helperText}
          color={color}
        />
      )

    case 'TextArea':
      return (
        <TextField
          fullWidth
          multiline
          rows={fieldTypeConfig?.rows || 4}
          label={label}
          placeholder="Enter multiline text..."
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={helperText || 'Multiline text area'}
          color={color}
        />
      )

    case 'Autocomplete':
      // For union/enum types, use the options as suggestions
      if (mainType.kind === 'union' && mainType.types?.every((t) => t.kind === 'literal')) {
        const options = mainType.types.map((t) => String(t.value))
        return (
          <Autocomplete
            freeSolo
            options={options}
            value={value as string ?? ''}
            onChange={(_, newValue) => onChange(newValue ?? '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={helperText}
                color={color}
              />
            )}
          />
        )
      }
      if (mainType.kind === 'enum' && mainType.enumValues) {
        const options = mainType.enumValues.map((ev) => String(ev.value))
        return (
          <Autocomplete
            freeSolo
            options={options}
            value={value as string ?? ''}
            onChange={(_, newValue) => onChange(newValue ?? '')}
            getOptionLabel={(opt) => {
              const enumVal = mainType.enumValues?.find((ev) => String(ev.value) === opt)
              return enumVal?.name || opt
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={helperText}
                color={color}
              />
            )}
          />
        )
      }
      // For string fields, use custom options if provided or default options
      const defaultOptions = ['Option 1', 'Option 2', 'Option 3']
      return (
        <Autocomplete
          freeSolo
          options={fieldTypeConfig?.autocompleteOptions || defaultOptions}
          value={value as string ?? ''}
          onChange={(_, newValue) => onChange(newValue ?? '')}
          onInputChange={(_, newValue) => onChange(newValue ?? '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Type to search..."
              error={!!error}
              helperText={helperText}
              color={color}
            />
          )}
        />
      )

    // Number components
    case 'Slider':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}: {Number(value) || 0}
          </Typography>
          <Slider
            value={Number(value) || 0}
            onChange={(_, newValue) => onChange(newValue)}
            min={fieldTypeConfig?.sliderMin ?? 0}
            max={fieldTypeConfig?.sliderMax ?? 100}
            step={fieldTypeConfig?.sliderStep ?? 1}
            valueLabelDisplay="auto"
          />
          {helperText && (
            <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
              {helperText}
            </Typography>
          )}
        </Box>
      )

    // Boolean components
    case 'Switch':
      return (
        <FormControlLabel
          control={
            <Switch checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          }
          label={label}
        />
      )

    case 'Checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          }
          label={label}
        />
      )

    // Select components
    case 'Select':
      if (mainType.kind === 'union' && mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
        const options = mainType.types.map((t) => t.value as string)
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              label={label}
              onChange={(e) => onChange(e.target.value)}
              color={color}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {formatLabel(opt)}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.5 }}>
                {helperText}
              </Typography>
            )}
          </FormControl>
        )
      }
      if (mainType.kind === 'enum' && mainType.enumValues) {
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              label={label}
              onChange={(e) => onChange(e.target.value)}
              color={color}
            >
              {mainType.enumValues.map((ev) => (
                <MenuItem key={ev.name} value={ev.value}>
                  {ev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }
      return (
        <TextField
          fullWidth
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={helperText}
          color={color}
        />
      )

    case 'RadioGroup':
      if (mainType.kind === 'union' && mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
        const options = mainType.types.map((t) => t.value as string)
        return (
          <FormControl error={!!error}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <RadioGroup
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio size="small" />}
                  label={formatLabel(opt)}
                />
              ))}
            </RadioGroup>
            {helperText && (
              <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                {helperText}
              </Typography>
            )}
          </FormControl>
        )
      }
      if (mainType.kind === 'enum' && mainType.enumValues) {
        return (
          <FormControl error={!!error}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <RadioGroup
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {mainType.enumValues.map((ev) => (
                <FormControlLabel
                  key={ev.name}
                  value={ev.value}
                  control={<Radio size="small" />}
                  label={ev.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )
      }
      return null

    case 'MultiSelect':
      // For union/enum types, use the defined options
      if (mainType.kind === 'union' && mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
        const options = mainType.types.map((t) => t.value as string)
        return (
          <Autocomplete
            multiple
            options={options}
            value={Array.isArray(value) ? value as string[] : []}
            onChange={(_, newValue) => onChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder="Select multiple..."
                error={!!error}
                helperText={helperText}
                color={color}
              />
            )}
          />
        )
      }
      if (mainType.kind === 'enum' && mainType.enumValues) {
        const options = mainType.enumValues.map((ev) => String(ev.value))
        return (
          <Autocomplete
            multiple
            options={options}
            value={Array.isArray(value) ? value as string[] : []}
            onChange={(_, newValue) => onChange(newValue)}
            getOptionLabel={(opt) => {
              const enumVal = mainType.enumValues?.find((ev) => String(ev.value) === opt)
              return enumVal?.name || opt
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder="Select multiple..."
                error={!!error}
                helperText={helperText}
                color={color}
              />
            )}
          />
        )
      }
      // For string fields, use default options
      const multiSelectDefaultOptions = ['Option 1', 'Option 2', 'Option 3']
      return (
        <Autocomplete
          multiple
          freeSolo
          options={fieldTypeConfig?.autocompleteOptions || multiSelectDefaultOptions}
          value={Array.isArray(value) ? value as string[] : []}
          onChange={(_, newValue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Select or type multiple..."
              error={!!error}
              helperText={helperText}
              color={color}
            />
          )}
        />
      )

    case 'DatePicker':
      return (
        <TextField
          fullWidth
          type="date"
          label={label}
          value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
          error={!!error}
          helperText={helperText}
          slotProps={{ inputLabel: { shrink: true } }}
          color={color}
        />
      )

    default:
      return (
        <TextField
          fullWidth
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={helperText}
          placeholder={`${mainType.kind} type`}
          color={color}
        />
      )
  }
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Resolve reference types to their declarations
function resolveReferenceType(type: ParsedType, declarations: ParsedDeclaration[]): ParsedType | null {
  if (type.kind === 'reference' && type.name) {
    const decl = declarations.find((d) => d.name === type.name)
    if (decl) {
      return decl.type
    }
  }
  return null
}

interface ArrayFieldRendererProps {
  label: string
  elementType: ParsedType
  value: unknown[]
  onChange: (value: unknown[]) => void
  declarations: ParsedDeclaration[]
  error?: string
  editMode?: boolean
  fieldTypeConfig?: FieldTypeConfig
  onViewModeChange?: (mode: ArrayViewMode) => void
}

function ArrayFieldRenderer({
  label,
  elementType,
  value,
  onChange,
  declarations,
  error,
  editMode = false,
  fieldTypeConfig,
  onViewModeChange,
}: ArrayFieldRendererProps) {
  // Use fieldTypeConfig.arrayViewMode if available, otherwise local state
  const [localViewMode, setLocalViewMode] = useState<ArrayViewMode>('list')
  const viewMode = fieldTypeConfig?.arrayViewMode ?? localViewMode

  const handleViewModeChange = (newMode: ArrayViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(newMode)
    } else {
      setLocalViewMode(newMode)
    }
  }
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortableEnabled, setSortableEnabled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null)

  // Get the effective element type (resolve references)
  const effectiveElementType =
    elementType.kind === 'reference'
      ? resolveReferenceType(elementType, declarations) || elementType
      : elementType

  const handleAddItem = () => {
    const newItem = getDefaultValueForType(effectiveElementType, declarations)
    onChange([...value, newItem])
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
  }

  const handleUpdateNestedField = (index: number, fieldName: string, fieldValue: unknown) => {
    const newValue = [...value]
    const currentItem = newValue[index] as Record<string, unknown> | undefined
    newValue[index] = { ...currentItem, [fieldName]: fieldValue }
    onChange(newValue)
  }

  // Render primitive array items
  const renderPrimitiveItem = (item: unknown, index: number) => {
    const mainType = unwrapOptional(effectiveElementType)

    switch (mainType.kind) {
      case 'primitive':
        switch (mainType.value) {
          case 'string':
            return (
              <TextField
                fullWidth
                size="small"
                value={item ?? ''}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
              />
            )
          case 'number':
            return (
              <TextField
                fullWidth
                size="small"
                type="number"
                value={item ?? ''}
                onChange={(e) =>
                  handleUpdateItem(index, e.target.value === '' ? 0 : Number(e.target.value))
                }
                placeholder={`Item ${index + 1}`}
              />
            )
          case 'boolean':
            return (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(item)}
                    onChange={(e) => handleUpdateItem(index, e.target.checked)}
                    size="small"
                  />
                }
                label={`Item ${index + 1}`}
              />
            )
          default:
            return (
              <TextField
                fullWidth
                size="small"
                value={String(item ?? '')}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
              />
            )
        }
      case 'union':
        if (mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
          const options = mainType.types.map((t) => t.value as string)
          return (
            <FormControl fullWidth size="small">
              <Select
                value={item ?? ''}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
              >
                {options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {formatLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }
        return (
          <TextField
            fullWidth
            size="small"
            value={String(item ?? '')}
            onChange={(e) => handleUpdateItem(index, e.target.value)}
          />
        )
      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={String(item ?? '')}
            onChange={(e) => handleUpdateItem(index, e.target.value)}
          />
        )
    }
  }

  // Render object array items (including resolved references)
  const renderObjectItem = (item: unknown, index: number, properties: ParsedProperty[]) => {
    const itemObj = (item as Record<string, unknown>) || {}

    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {properties.map((prop) => {
            // Create a pseudo-property for rendering
            const propType = unwrapOptional(prop.type)

            // Handle nested arrays recursively
            if (propType.kind === 'array' && propType.elementType) {
              return (
                <Box key={prop.name}>
                  <ArrayFieldRenderer
                    label={formatLabel(prop.name) + (prop.isOptional ? '' : ' *')}
                    elementType={propType.elementType}
                    value={Array.isArray(itemObj[prop.name]) ? (itemObj[prop.name] as unknown[]) : []}
                    onChange={(newArrayValue) =>
                      handleUpdateNestedField(index, prop.name, newArrayValue)
                    }
                    declarations={declarations}
                  />
                </Box>
              )
            }

            // Handle primitive fields within objects
            return (
              <Box key={prop.name}>
                {renderNestedPrimitiveField(
                  prop,
                  itemObj[prop.name],
                  (newValue) => handleUpdateNestedField(index, prop.name, newValue),
                  declarations
                )}
              </Box>
            )
          })}
        </Stack>
      </Paper>
    )
  }

  // Determine if element type is an object (or reference to object)
  const isObjectType =
    effectiveElementType.kind === 'object' ||
    (effectiveElementType.kind === 'reference' &&
      resolveReferenceType(effectiveElementType, declarations)?.kind === 'object')

  const objectProperties =
    effectiveElementType.kind === 'object'
      ? effectiveElementType.properties || []
      : []

  // Column visibility menu
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null)

  // Handle column resize
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault()
    const startWidth = columnWidths[column] || 150
    setResizing({ column, startX: e.clientX, startWidth })
  }

  // Handle mouse move during resize
  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX
      const newWidth = Math.max(80, resizing.startWidth + diff)
      setColumnWidths((prev) => ({ ...prev, [resizing.column]: newWidth }))
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing])

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  // Render table view for object arrays
  const renderTableView = (properties: ParsedProperty[]) => {
    // Filter out complex nested types for table view (arrays, nested objects)
    const allTableProperties = properties.filter((prop) => {
      const propType = unwrapOptional(prop.type)
      return propType.kind !== 'array' && propType.kind !== 'object' && propType.kind !== 'reference'
    })

    // Filter out hidden columns
    const tableProperties = allTableProperties.filter((prop) => !hiddenColumns.has(prop.name))

    // Get sorted and filtered data
    const getFilteredAndSortedData = () => {
      let data = value.map((item, originalIndex) => ({ item, originalIndex }))

      // Filter by search term
      if (searchTerm) {
        data = data.filter(({ item }) => {
          const itemObj = (item as Record<string, unknown>) || {}
          return allTableProperties.some((prop) => {
            const val = itemObj[prop.name]
            return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
          })
        })
      }

      // Sort (only if enabled)
      if (sortableEnabled && sortColumn) {
        data.sort((a, b) => {
          const aObj = (a.item as Record<string, unknown>) || {}
          const bObj = (b.item as Record<string, unknown>) || {}
          const aVal = aObj[sortColumn]
          const bVal = bObj[sortColumn]

          let comparison = 0
          if (aVal === null || aVal === undefined) comparison = 1
          else if (bVal === null || bVal === undefined) comparison = -1
          else if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal
          } else {
            comparison = String(aVal).localeCompare(String(bVal))
          }

          return sortDirection === 'asc' ? comparison : -comparison
        })
      }

      return data
    }

    const filteredData = getFilteredAndSortedData()

    return (
      <Box>
        {/* Table Controls */}
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* Column Visibility */}
          <Tooltip title="Show/Hide Columns">
            <IconButton
              size="small"
              onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            >
              <VisibilityOffOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
          >
            {allTableProperties.map((prop) => (
              <MenuItem
                key={prop.name}
                onClick={() => toggleColumnVisibility(prop.name)}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    checked={!hiddenColumns.has(prop.name)}
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText primary={formatLabel(prop.name)} />
              </MenuItem>
            ))}
          </Menu>
          {hiddenColumns.size > 0 && (
            <Chip
              size="small"
              label={`${hiddenColumns.size} hidden`}
              onDelete={() => setHiddenColumns(new Set())}
            />
          )}
          {/* Sortable Toggle - only in edit mode */}
          {editMode && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title={sortableEnabled ? 'Disable Sorting' : 'Enable Sorting'}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSortableEnabled(!sortableEnabled)
                    if (sortableEnabled) {
                      // Clear sort when disabling
                      setSortColumn(null)
                    }
                  }}
                  color={sortableEnabled ? 'primary' : 'default'}
                >
                  <SortIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" color="text.secondary">
                {sortableEnabled ? 'Sortable' : 'Not sortable'}
              </Typography>
            </>
          )}
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {tableProperties.map((prop) => (
                  <TableCell
                    key={prop.name}
                    sx={{
                      fontWeight: 600,
                      width: columnWidths[prop.name] || 150,
                      minWidth: 80,
                      position: 'relative',
                      cursor: sortableEnabled ? 'pointer' : 'default',
                      userSelect: 'none',
                      ...(sortableEnabled && { '&:hover': { bgcolor: 'action.hover' } }),
                    }}
                    onClick={sortableEnabled ? () => handleSort(prop.name) : undefined}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <span>
                        {formatLabel(prop.name)}
                        {!prop.isOptional && ' *'}
                      </span>
                      {sortableEnabled && sortColumn === prop.name && (
                        sortDirection === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                        )
                      )}
                    </Stack>
                    {/* Resize Handle */}
                    <Box
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleResizeStart(prop.name, e)
                      }}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        cursor: 'col-resize',
                        '&:hover': { bgcolor: 'primary.main' },
                        ...(resizing?.column === prop.name && { bgcolor: 'primary.main' }),
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(({ item, originalIndex }) => {
                const itemObj = (item as Record<string, unknown>) || {}
                return (
                  <TableRow key={originalIndex} hover>
                    {tableProperties.map((prop) => {
                      const propType = unwrapOptional(prop.type)
                      return (
                        <TableCell
                          key={prop.name}
                          sx={{ width: columnWidths[prop.name] || 150 }}
                        >
                          {renderTableCell(
                            propType,
                            itemObj[prop.name],
                            (newValue) => handleUpdateNestedField(originalIndex, prop.name, newValue)
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <Tooltip title="Remove item">
                        <IconButton size="small" onClick={() => handleRemoveItem(originalIndex)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredData.length === 0 && searchTerm && (
                <TableRow>
                  <TableCell colSpan={tableProperties.length + 1} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No results found for "{searchTerm}"
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  // Render a single cell in table view
  const renderTableCell = (
    propType: ParsedType,
    cellValue: unknown,
    onCellChange: (value: unknown) => void
  ) => {
    switch (propType.kind) {
      case 'primitive':
        switch (propType.value) {
          case 'string':
            return (
              <TextField
                size="small"
                variant="standard"
                value={cellValue ?? ''}
                onChange={(e) => onCellChange(e.target.value)}
                fullWidth
              />
            )
          case 'number':
            return (
              <TextField
                size="small"
                variant="standard"
                type="number"
                value={cellValue ?? ''}
                onChange={(e) => onCellChange(e.target.value === '' ? 0 : Number(e.target.value))}
                fullWidth
              />
            )
          case 'boolean':
            return (
              <Checkbox
                size="small"
                checked={Boolean(cellValue)}
                onChange={(e) => onCellChange(e.target.checked)}
              />
            )
          case 'Date':
            return (
              <TextField
                size="small"
                variant="standard"
                type="date"
                value={cellValue instanceof Date ? cellValue.toISOString().split('T')[0] : cellValue || ''}
                onChange={(e) => onCellChange(e.target.value ? new Date(e.target.value) : null)}
                fullWidth
              />
            )
          default:
            return (
              <TextField
                size="small"
                variant="standard"
                value={String(cellValue ?? '')}
                onChange={(e) => onCellChange(e.target.value)}
                fullWidth
              />
            )
        }
      case 'union':
        if (propType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
          const options = propType.types.map((t) => t.value as string)
          return (
            <Select
              size="small"
              variant="standard"
              value={cellValue ?? ''}
              onChange={(e) => onCellChange(e.target.value)}
              fullWidth
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {formatLabel(opt)}
                </MenuItem>
              ))}
            </Select>
          )
        }
        return (
          <TextField
            size="small"
            variant="standard"
            value={String(cellValue ?? '')}
            onChange={(e) => onCellChange(e.target.value)}
            fullWidth
          />
        )
      case 'enum':
        if (propType.enumValues) {
          return (
            <Select
              size="small"
              variant="standard"
              value={cellValue ?? ''}
              onChange={(e) => onCellChange(e.target.value)}
              fullWidth
            >
              {propType.enumValues.map((ev) => (
                <MenuItem key={ev.name} value={ev.value}>
                  {ev.name}
                </MenuItem>
              ))}
            </Select>
          )
        }
        return null
      default:
        return (
          <TextField
            size="small"
            variant="standard"
            value={String(cellValue ?? '')}
            onChange={(e) => onCellChange(e.target.value)}
            fullWidth
          />
        )
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={500}>
            {label}
            {value.length > 0 && (
              <Chip
                size="small"
                label={value.length}
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Typography>
          {/* View toggle - only show for object arrays in edit mode */}
          {editMode && isObjectType && objectProperties.length > 0 && (
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newView) => newView && handleViewModeChange(newView)}
              sx={{ ml: 1 }}
            >
              <ToggleButton value="list" sx={{ px: 1, py: 0.25 }}>
                <Tooltip title="List View">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table" sx={{ px: 1, py: 0.25 }}>
                <Tooltip title="Table View">
                  <TableRowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          variant="outlined"
        >
          Add
        </Button>
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {value.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'action.hover',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No items. Click "Add" to add one.
          </Typography>
        </Paper>
      ) : isObjectType && objectProperties.length > 0 && viewMode === 'table' ? (
        renderTableView(objectProperties)
      ) : (
        <Stack spacing={1}>
          {value.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                {isObjectType && objectProperties.length > 0
                  ? renderObjectItem(item, index, objectProperties)
                  : renderPrimitiveItem(item, index)}
              </Box>
              <Tooltip title="Remove item">
                <IconButton
                  size="small"
                  onClick={() => handleRemoveItem(index)}
                  sx={{ mt: isObjectType ? 1 : 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

// Helper to render nested primitive fields within object array items
function renderNestedPrimitiveField(
  property: ParsedProperty,
  value: unknown,
  onChange: (value: unknown) => void,
  declarations: ParsedDeclaration[]
) {
  const { name, type, isOptional } = property
  const label = formatLabel(name) + (isOptional ? '' : ' *')
  const mainType = unwrapOptional(type)

  switch (mainType.kind) {
    case 'primitive':
      switch (mainType.value) {
        case 'string':
          return (
            <TextField
              fullWidth
              size="small"
              label={label}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
            />
          )
        case 'number':
          return (
            <TextField
              fullWidth
              size="small"
              type="number"
              label={label}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            />
          )
        case 'boolean':
          return (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  size="small"
                />
              }
              label={label}
            />
          )
        case 'Date':
          return (
            <TextField
              fullWidth
              size="small"
              type="date"
              label={label}
              value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
              onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )
        default:
          return (
            <TextField
              fullWidth
              size="small"
              label={label}
              value={String(value ?? '')}
              onChange={(e) => onChange(e.target.value)}
            />
          )
      }
    case 'union':
      if (mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
        const options = mainType.types.map((t) => t.value as string)
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              label={label}
              onChange={(e) => onChange(e.target.value)}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {formatLabel(opt)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }
      return (
        <TextField
          fullWidth
          size="small"
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'enum':
      if (mainType.enumValues) {
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              label={label}
              onChange={(e) => onChange(e.target.value)}
            >
              {mainType.enumValues.map((ev) => (
                <MenuItem key={ev.name} value={ev.value}>
                  {ev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }
      return null
    case 'reference':
      // Handle nested reference types (nested objects)
      const resolvedType = resolveReferenceType(mainType, declarations)
      if (resolvedType?.kind === 'object' && resolvedType.properties) {
        return (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {label}
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1}>
                {resolvedType.properties.map((prop) => (
                  <Box key={prop.name}>
                    {renderNestedPrimitiveField(
                      prop,
                      (value as Record<string, unknown> | undefined)?.[prop.name],
                      (newValue) => {
                        const currentObj = (value as Record<string, unknown>) || {}
                        onChange({ ...currentObj, [prop.name]: newValue })
                      },
                      declarations
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        )
      }
      return (
        <TextField
          fullWidth
          size="small"
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${mainType.name} reference`}
        />
      )
    default:
      return (
        <TextField
          fullWidth
          size="small"
          label={label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

function unwrapOptional(type: ParsedType): ParsedType {
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

// Get available component types for a given field type
function getAvailableComponents(type: ParsedType): FieldComponentType[] {
  const mainType = unwrapOptional(type)

  switch (mainType.kind) {
    case 'primitive':
      switch (mainType.value) {
        case 'string':
          return ['TextField', 'Autocomplete', 'TextArea', 'MultiSelect']
        case 'number':
          return ['TextField', 'Slider']
        case 'boolean':
          return ['Switch', 'Checkbox']
        case 'Date':
          return ['TextField', 'DatePicker']
        default:
          return ['TextField']
      }
    case 'union':
      if (mainType.types?.every((t) => t.kind === 'literal' && typeof t.value === 'string')) {
        return ['Select', 'RadioGroup', 'Autocomplete', 'MultiSelect']
      }
      return ['TextField']
    case 'enum':
      return ['Select', 'RadioGroup', 'Autocomplete', 'MultiSelect']
    default:
      return ['TextField']
  }
}

// Get default component for a field type
function getDefaultComponent(type: ParsedType): FieldComponentType {
  const mainType = unwrapOptional(type)

  switch (mainType.kind) {
    case 'primitive':
      switch (mainType.value) {
        case 'string':
          return 'TextField'
        case 'number':
          return 'TextField'
        case 'boolean':
          return 'Switch'
        case 'Date':
          return 'TextField'
        default:
          return 'TextField'
      }
    case 'union':
      return 'Select'
    case 'enum':
      return 'Select'
    default:
      return 'TextField'
  }
}

function getDefaultValue(type: ParsedType): unknown {
  const mainType = unwrapOptional(type)

  switch (mainType.kind) {
    case 'primitive':
      switch (mainType.value) {
        case 'string':
          return ''
        case 'number':
          return 0
        case 'boolean':
          return false
        default:
          return null
      }
    case 'array':
      return []
    case 'union':
      if (mainType.types && mainType.types.length > 0) {
        const first = mainType.types[0]
        if (first.kind === 'literal') {
          return first.value
        }
      }
      return ''
    case 'enum':
      if (mainType.enumValues && mainType.enumValues.length > 0) {
        return mainType.enumValues[0].value
      }
      return ''
    default:
      return null
  }
}

// Enhanced getDefaultValue that can resolve reference types
function getDefaultValueForType(type: ParsedType, declarations: ParsedDeclaration[]): unknown {
  const mainType = unwrapOptional(type)

  switch (mainType.kind) {
    case 'primitive':
      switch (mainType.value) {
        case 'string':
          return ''
        case 'number':
          return 0
        case 'boolean':
          return false
        case 'Date':
          return new Date().toISOString().split('T')[0]
        default:
          return null
      }
    case 'array':
      return []
    case 'union':
      if (mainType.types && mainType.types.length > 0) {
        const first = mainType.types[0]
        if (first.kind === 'literal') {
          return first.value
        }
      }
      return ''
    case 'enum':
      if (mainType.enumValues && mainType.enumValues.length > 0) {
        return mainType.enumValues[0].value
      }
      return ''
    case 'object':
      // Create default object with all properties
      if (mainType.properties && mainType.properties.length > 0) {
        const obj: Record<string, unknown> = {}
        for (const prop of mainType.properties) {
          obj[prop.name] = getDefaultValueForType(prop.type, declarations)
        }
        return obj
      }
      return {}
    case 'reference':
      // Resolve and create default for reference type
      const resolvedType = resolveReferenceType(mainType, declarations)
      if (resolvedType) {
        return getDefaultValueForType(resolvedType, declarations)
      }
      return {}
    default:
      return null
  }
}

// Simple validation based on rules (without actual Zod runtime)
function validateData(
  data: Record<string, unknown>,
  declarations: ParsedDeclaration[],
  selectedTypes: string[],
  validationRules: Array<{ field: string; severity: 'error' | 'warning' | 'info'; message: string; enabled: boolean }>
): TieredValidationResult<unknown> {
  const issues: ValidationIssue[] = []

  // Check required fields
  const selected = declarations.filter((d) => selectedTypes.includes(d.name))
  for (const decl of selected) {
    if (decl.type.kind === 'object' && decl.type.properties) {
      for (const prop of decl.type.properties) {
        if (!prop.isOptional) {
          const value = data[prop.name]
          if (value === undefined || value === null || value === '') {
            issues.push({
              severity: 'error',
              path: [prop.name],
              message: `${formatLabel(prop.name)} is required`,
            })
          }
        }
      }
    }
  }

  // Apply custom validation rules
  for (const rule of validationRules) {
    if (!rule.enabled) continue

    const [, fieldName] = rule.field.split('.')
    if (fieldName) {
      // Simple check - you'd expand this based on the rule
      const value = data[fieldName]
      if (rule.field.includes('.') && value !== undefined) {
        // Just add as a demo - real implementation would parse and execute the rule
        // For now, we'll skip actual rule execution
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const infos = issues.filter((i) => i.severity === 'info')

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    issues,
    errors,
    warnings,
    infos,
  }
}

interface SortableFieldItemProps {
  id: string
  children: React.ReactNode
  editMode: boolean
  gridSize: number
}

function SortableFieldItem({ id, children, editMode, gridSize }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Grid
      ref={setNodeRef}
      style={style}
      size={{ xs: 12, md: gridSize }}
      sx={{
        position: 'relative',
        ...(isDragging && {
          zIndex: 1000,
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        {editMode && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              mt: 1,
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}
        {children}
      </Box>
    </Grid>
  )
}

export default function FormPreviewStep() {
  const {
    parsedDeclarations,
    selectedTypes,
    previewData,
    setPreviewData,
    updatePreviewField,
    validationResult,
    setValidationResult,
    validationRules,
    excludedFields,
    toggleFieldVisibility,
    fieldTypeConfigs,
    setFieldTypeConfig,
    fieldOrder,
    setFieldOrder,
  } = useFormBuilderWizardStore()

  const [editMode, setEditMode] = useState(false)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get the first selected type's properties
  const selectedDecl = useMemo(() => {
    return parsedDeclarations.find((d) => selectedTypes.includes(d.name))
  }, [parsedDeclarations, selectedTypes])

  const properties = useMemo(() => {
    if (selectedDecl?.type.kind === 'object') {
      return selectedDecl.type.properties || []
    }
    return []
  }, [selectedDecl])

  // Initialize field order when properties change
  useEffect(() => {
    const validProps = properties.filter((p) => p.type.kind !== 'function')
    const propNames = validProps.map((p) => p.name)

    // Only set field order if it's empty or has different fields
    if (
      fieldOrder.length === 0 ||
      fieldOrder.length !== propNames.length ||
      !propNames.every((name) => fieldOrder.includes(name))
    ) {
      setFieldOrder(propNames)
    }
  }, [properties])

  // Get ordered properties based on fieldOrder
  const orderedProperties = useMemo(() => {
    const validProps = properties.filter((p) => p.type.kind !== 'function')
    if (fieldOrder.length === 0) {
      return validProps
    }
    return fieldOrder
      .map((name) => validProps.find((p) => p.name === name))
      .filter((p): p is ParsedProperty => p !== undefined)
  }, [properties, fieldOrder])

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fieldOrder.indexOf(active.id as string)
      const newIndex = fieldOrder.indexOf(over.id as string)
      setFieldOrder(arrayMove(fieldOrder, oldIndex, newIndex))
    }
  }

  // Initialize preview data with defaults
  useEffect(() => {
    if (properties.length > 0 && Object.keys(previewData).length === 0) {
      const defaults: Record<string, unknown> = {}
      for (const prop of properties) {
        defaults[prop.name] = getDefaultValue(prop.type)
      }
      setPreviewData(defaults)
    }
  }, [properties])

  // Validate on data change
  useEffect(() => {
    if (Object.keys(previewData).length > 0) {
      const result = validateData(previewData, parsedDeclarations, selectedTypes, validationRules)
      setValidationResult(result)
    }
  }, [previewData, parsedDeclarations, selectedTypes, validationRules])

  const getFieldIssue = (fieldName: string, severity: 'error' | 'warning' | 'info') => {
    return validationResult?.issues.find(
      (i) => i.path[0] === fieldName && i.severity === severity
    )?.message
  }

  const handleValidate = () => {
    const result = validateData(previewData, parsedDeclarations, selectedTypes, validationRules)
    setValidationResult(result)
  }

  const handleReset = () => {
    const defaults: Record<string, unknown> = {}
    for (const prop of properties) {
      defaults[prop.name] = getDefaultValue(prop.type)
    }
    setPreviewData(defaults)
    setValidationResult(null)
  }

  if (!selectedDecl) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Step 4: Form Preview
        </Typography>
        <Alert severity="warning">No type selected. Please go back and select a type.</Alert>
      </Box>
    )
  }

  const visibleProperties = orderedProperties.filter(
    (p) => !excludedFields.includes(p.name)
  )
  const hiddenProperties = orderedProperties.filter(
    (p) => excludedFields.includes(p.name)
  )

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Step 4: Form Preview</Typography>
        <Tooltip title={editMode ? 'Switch to Preview Mode' : 'Switch to Edit Mode'}>
          <Button
            size="small"
            variant={editMode ? 'contained' : 'outlined'}
            startIcon={editMode ? <PreviewIcon /> : <EditIcon />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Preview' : 'Edit Fields'}
          </Button>
        </Tooltip>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {editMode
          ? 'Click the eye icon to show/hide fields in the form. Hidden fields will not appear in the exported form.'
          : 'Preview the generated form with live validation. Try filling out the form to see validation in action.'}
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Form */}
        <Box sx={{ flex: 1 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" gutterBottom>
                {selectedDecl.name} Form
              </Typography>
              {excludedFields.length > 0 && (
                <Chip
                  size="small"
                  label={`${excludedFields.length} hidden`}
                  color="default"
                  variant="outlined"
                />
              )}
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleProperties.map((p) => p.name)}
                strategy={rectSortingStrategy}
              >
                <Grid container spacing={2.5}>
                  {/* Visible Fields */}
                  {visibleProperties.map((prop) => {
                    const gridSize = fieldTypeConfigs[prop.name]?.gridSize ?? 12
                    return (
                      <SortableFieldItem
                        key={prop.name}
                        id={prop.name}
                        editMode={editMode}
                        gridSize={gridSize}
                      >
                        {editMode && (
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Hide this field">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleFieldVisibility(prop.name)}
                                >
                                  <VisibilityIcon fontSize="small" color="action" />
                                </IconButton>
                              </Tooltip>
                              {/* Field Type Selector */}
                              {unwrapOptional(prop.type).kind !== 'array' && (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <Select
                                    value={fieldTypeConfigs[prop.name]?.component || getDefaultComponent(prop.type)}
                                    onChange={(e) =>
                                      setFieldTypeConfig(prop.name, {
                                        ...fieldTypeConfigs[prop.name],
                                        component: e.target.value as FieldComponentType,
                                      })
                                    }
                                    sx={{ fontSize: '0.7rem', height: 28 }}
                                  >
                                    {getAvailableComponents(prop.type).map((comp) => (
                                      <MenuItem key={comp} value={comp} sx={{ fontSize: '0.75rem' }}>
                                        {comp}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Stack>
                            {/* Grid Size Selector */}
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={gridSize}
                                onChange={(e) =>
                                  setFieldTypeConfig(prop.name, {
                                    ...fieldTypeConfigs[prop.name],
                                    gridSize: e.target.value as GridSize,
                                  })
                                }
                                sx={{ fontSize: '0.7rem', height: 28 }}
                              >
                                {([12, 6, 4, 3, 2, 1] as GridSize[]).map((size) => (
                                  <MenuItem key={size} value={size} sx={{ fontSize: '0.75rem' }}>
                                    {size}/12 {size === 12 ? '(Full)' : size === 6 ? '(Half)' : size === 4 ? '(Third)' : size === 3 ? '(Quarter)' : ''}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <FieldRenderer
                            property={prop}
                            value={previewData[prop.name]}
                            onChange={(value) => updatePreviewField(prop.name, value)}
                            error={getFieldIssue(prop.name, 'error')}
                            warning={getFieldIssue(prop.name, 'warning')}
                            info={getFieldIssue(prop.name, 'info')}
                            declarations={parsedDeclarations}
                            fieldTypeConfig={fieldTypeConfigs[prop.name]}
                            onFieldTypeConfigChange={(updates) =>
                              setFieldTypeConfig(prop.name, {
                                ...fieldTypeConfigs[prop.name],
                                ...updates,
                              })
                            }
                            editMode={editMode}
                          />
                        </Box>
                      </SortableFieldItem>
                    )
                  })}

                  {visibleProperties.length === 0 && (
                    <Grid size={12}>
                      <Alert severity="info">
                        All fields are hidden. Click "Edit Fields" and use the eye icons to show fields.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </SortableContext>
            </DndContext>

            {/* Hidden Fields (only shown in edit mode) */}
            {editMode && hiddenProperties.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }}>
                  <Chip label="Hidden Fields" size="small" />
                </Divider>
                <Stack spacing={1.5}>
                  {hiddenProperties.map((prop) => (
                    <Box
                      key={prop.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        opacity: 0.7,
                      }}
                    >
                      <Tooltip title="Show this field">
                        <IconButton
                          size="small"
                          onClick={() => toggleFieldVisibility(prop.name)}
                        >
                          <VisibilityOffIcon fontSize="small" color="disabled" />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatLabel(prop.name)}
                          {!prop.isOptional && ' *'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {prop.type.kind === 'primitive' ? prop.type.value : prop.type.kind}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleValidate} disabled={editMode}>
                Validate
              </Button>
              <Button variant="outlined" onClick={handleReset} disabled={editMode}>
                Reset
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* Validation Results */}
        <Box sx={{ width: { xs: '100%', md: 300 } }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Validation Results
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {validationResult ? (
              <>
                <Alert
                  severity={validationResult.success ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {validationResult.success
                    ? 'Form is valid!'
                    : `${validationResult.errors.length} error(s) found`}
                </Alert>

                <ValidationDisplay result={validationResult} compact />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Fill out the form and click Validate to see results.
              </Typography>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  )
}

