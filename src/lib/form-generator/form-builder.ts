import type { ParsedType, ParsedProperty, ParsedDeclaration } from '../zod-generator/type-parser'

export interface FormBuilderOptions {
  schemaImportPath: string
  storeImportPath: string
}

export interface FormBuilderContext {
  warnings: string[]
}

export interface FormBuildResult {
  component: string
  schemaName: string
  storeName: string
}

export function buildFormComponent(
  declaration: ParsedDeclaration,
  _options: FormBuilderOptions,
  context: FormBuilderContext
): FormBuildResult | null {
  const { name, type, isExported } = declaration

  if (!isExported) {
    return null
  }

  if (type.kind !== 'object' || !type.properties) {
    context.warnings.push(`Skipping ${name}: not an object type`)
    return null
  }

  const properties = type.properties.filter((p) => !isFunction(p.type))
  const componentName = `${name}Form`
  const schemaName = `${name}Schema`
  const storeName = `use${name}Store`

  const component = generateComponent(componentName, name, schemaName, storeName, properties, context)

  return {
    component,
    schemaName,
    storeName,
  }
}

function generateComponent(
  componentName: string,
  typeName: string,
  schemaName: string,
  storeName: string,
  properties: ParsedProperty[],
  context: FormBuilderContext
): string {
  // Helper to get main type from optional unions
  const getMainType = (t: ParsedType): ParsedType => {
    if (t.kind === 'union' && t.types) {
      const nonUndefinedTypes = t.types.filter(
        (ut) => !(ut.kind === 'primitive' && (ut.value === 'undefined' || ut.value === 'null'))
      )
      if (nonUndefinedTypes.length === 1) {
        return nonUndefinedTypes[0]
      }
    }
    return t
  }

  // Separate array and non-array properties
  const arrayProps = properties.filter((p) => getMainType(p.type).kind === 'array')
  const nonArrayProps = properties.filter((p) => getMainType(p.type).kind !== 'array')

  const fieldNames = properties.map((p) => p.name)
  const storeSelectors = fieldNames.map((n) => `${n}`).join(', ')

  // Only generate setters for non-array fields
  const setterSelectors = nonArrayProps.map((p) => `set${capitalize(p.name)}`).join(', ')

  // Get array action selectors
  const arrayActionSelectors = arrayProps
    .flatMap((p) => {
      const n = capitalize(p.name)
      return [`append${n}`, `remove${n}At`, `update${n}At`]
    })
    .join(', ')

  const fields = properties.map((p) => generateField(p, typeName, context)).join('\n\n')

  const allSelectors = [storeSelectors, setterSelectors, arrayActionSelectors, `reset${typeName}`]
    .filter(Boolean)
    .join(', ')

  return `export interface ${componentName}Props {
  onSubmit?: (data: z.infer<typeof ${schemaName}>) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
}

export function ${componentName}({
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}: ${componentName}Props) {
  const { ${allSelectors} } = ${storeName}()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formData = { ${storeSelectors} }

  const validateField = useCallback((field: string, value: unknown) => {
    try {
      const fieldSchema = ${schemaName}.shape[field as keyof typeof ${schemaName}.shape]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: err.issues[0]?.message || 'Invalid value',
        }))
      }
    }
  }, [])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, formData[field as keyof typeof formData])
  }

  const validateForm = (): boolean => {
    const result = ${schemaName}.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0]?.toString()
        if (field) {
          newErrors[field] = err.message
        }
      })
      setErrors(newErrors)
      setTouched(Object.keys(newErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit?.(formData as z.infer<typeof ${schemaName}>)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset${typeName}()
    setErrors({})
    setTouched({})
    setSubmitError(null)
  }

  const isDirty = Object.keys(touched).length > 0
  const hasErrors = Object.keys(errors).length > 0

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

${fields}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={isSubmitting || !isDirty}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || hasErrors}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}`
}

function generateField(
  prop: ParsedProperty,
  _typeName: string,
  context: FormBuilderContext
): string {
  const { name, type, isOptional } = prop
  const label = formatLabel(name)
  const setterName = `set${capitalize(name)}`
  const required = !isOptional

  // Helper to extract the main type from optional unions (e.g., Date | undefined -> Date)
  const getMainType = (t: ParsedType): ParsedType => {
    if (t.kind === 'union' && t.types) {
      const nonUndefinedTypes = t.types.filter(
        (ut) => !(ut.kind === 'primitive' && (ut.value === 'undefined' || ut.value === 'null'))
      )
      if (nonUndefinedTypes.length === 1) {
        return nonUndefinedTypes[0]
      }
    }
    return t
  }

  const mainType = getMainType(type)

  // Determine field type based on parsed type
  if (mainType.kind === 'primitive') {
    switch (mainType.value) {
      case 'string':
        return generateTextField(name, label, setterName, required)
      case 'number':
        return generateNumberField(name, label, setterName, required)
      case 'boolean':
        return generateSwitchField(name, label, setterName)
      case 'Date':
        return generateDateField(name, label, setterName, required)
      default:
        return generateTextField(name, label, setterName, required)
    }
  }

  if (mainType.kind === 'union') {
    // Check if it's a string literal union (for Select)
    const isStringLiteralUnion = mainType.types?.every(
      (t) => t.kind === 'literal' && typeof t.value === 'string'
    )
    if (isStringLiteralUnion && mainType.types) {
      const options = mainType.types.map((t) => t.value as string)
      return generateSelectField(name, label, setterName, options, required)
    }
  }

  if (mainType.kind === 'literal' && typeof mainType.value === 'string') {
    return generateTextField(name, label, setterName, required, true)
  }

  if (mainType.kind === 'array') {
    return generateArrayField(name, label, mainType, required)
  }

  if (mainType.kind === 'object' || mainType.kind === 'reference') {
    context.warnings.push(`Field '${name}': Objects rendered as JSON input`)
    return generateTextAreaField(name, label, setterName, required, 'object')
  }

  // Fallback to text field
  return generateTextField(name, label, setterName, required)
}

function generateTextField(
  name: string,
  label: string,
  setter: string,
  required: boolean,
  disabled = false
): string {
  return `        <TextField
          fullWidth
          label="${label}"
          value={${name}}
          onChange={(e) => ${setter}(e.target.value)}
          onBlur={() => handleBlur('${name}')}
          error={touched['${name}'] && !!errors['${name}']}
          helperText={touched['${name}'] && errors['${name}']}
          required={${required}}
          disabled={${disabled}}
        />`
}

function generateNumberField(
  name: string,
  label: string,
  setter: string,
  required: boolean
): string {
  return `        <TextField
          fullWidth
          type="number"
          label="${label}"
          value={${name}}
          onChange={(e) => ${setter}(e.target.value === '' ? 0 : Number(e.target.value))}
          onBlur={() => handleBlur('${name}')}
          error={touched['${name}'] && !!errors['${name}']}
          helperText={touched['${name}'] && errors['${name}']}
          required={${required}}
        />`
}

function generateSwitchField(
  name: string,
  label: string,
  setter: string
): string {
  return `        <FormControlLabel
          control={
            <Switch
              checked={${name}}
              onChange={(e) => ${setter}(e.target.checked)}
              onBlur={() => handleBlur('${name}')}
            />
          }
          label="${label}"
        />`
}

function generateDateField(
  name: string,
  label: string,
  setter: string,
  required: boolean
): string {
  return `        <TextField
          fullWidth
          type="date"
          label="${label}"
          value={${name} instanceof Date ? ${name}.toISOString().split('T')[0] : ''}
          onChange={(e) => ${setter}(e.target.value ? new Date(e.target.value) : new Date())}
          onBlur={() => handleBlur('${name}')}
          error={touched['${name}'] && !!errors['${name}']}
          helperText={touched['${name}'] && errors['${name}']}
          required={${required}}
          slotProps={{ inputLabel: { shrink: true } }}
        />`
}

function generateSelectField(
  name: string,
  label: string,
  setter: string,
  options: string[],
  required: boolean
): string {
  const menuItems = options
    .map((opt) => `            <MenuItem value="${opt}">${formatLabel(opt)}</MenuItem>`)
    .join('\n')

  return `        <FormControl fullWidth error={touched['${name}'] && !!errors['${name}']} required={${required}}>
          <InputLabel>${label}</InputLabel>
          <Select
            value={${name}}
            label="${label}"
            onChange={(e) => ${setter}(e.target.value as typeof ${name})}
            onBlur={() => handleBlur('${name}')}
          >
${menuItems}
          </Select>
          {touched['${name}'] && errors['${name}'] && (
            <FormHelperText>{errors['${name}']}</FormHelperText>
          )}
        </FormControl>`
}

function generateArrayField(
  name: string,
  label: string,
  arrayType: ParsedType,
  required: boolean
): string {
  const capitalizedName = capitalize(name)
  const elementType = arrayType.elementType

  // Check if element type is an object with properties (sub-form)
  if (elementType?.kind === 'object' && elementType.properties) {
    return generateObjectArrayField(name, label, capitalizedName, elementType, required)
  }

  // Determine what kind of input each array item needs for primitive types
  const getItemInput = (): { inputJsx: string; defaultValue: string } => {
    if (!elementType) {
      return {
        inputJsx: `<TextField
                        fullWidth
                        size="small"
                        value={String(item)}
                        onChange={(e) => update${capitalizedName}At(index, e.target.value)}
                      />`,
        defaultValue: "''",
      }
    }

    if (elementType.kind === 'primitive') {
      switch (elementType.value) {
        case 'string':
          return {
            inputJsx: `<TextField
                        fullWidth
                        size="small"
                        value={item}
                        onChange={(e) => update${capitalizedName}At(index, e.target.value)}
                      />`,
            defaultValue: "''",
          }
        case 'number':
          return {
            inputJsx: `<TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={item}
                        onChange={(e) => update${capitalizedName}At(index, e.target.value === '' ? 0 : Number(e.target.value))}
                      />`,
            defaultValue: '0',
          }
        case 'boolean':
          return {
            inputJsx: `<Switch
                        checked={item}
                        onChange={(e) => update${capitalizedName}At(index, e.target.checked)}
                      />`,
            defaultValue: 'false',
          }
        default:
          return {
            inputJsx: `<TextField
                        fullWidth
                        size="small"
                        value={String(item)}
                        onChange={(e) => update${capitalizedName}At(index, e.target.value)}
                      />`,
            defaultValue: "''",
          }
      }
    }

    if (elementType.kind === 'reference') {
      return {
        inputJsx: `<TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={JSON.stringify(item, null, 2)}
                        onChange={(e) => {
                          try {
                            update${capitalizedName}At(index, JSON.parse(e.target.value))
                          } catch {
                            // Invalid JSON
                          }
                        }}
                      />`,
        defaultValue: '{}',
      }
    }

    // Fallback
    return {
      inputJsx: `<TextField
                        fullWidth
                        size="small"
                        value={String(item)}
                        onChange={(e) => update${capitalizedName}At(index, e.target.value)}
                      />`,
      defaultValue: "''",
    }
  }

  const { inputJsx, defaultValue } = getItemInput()

  return `        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">${label}${required ? ' *' : ''}</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append${capitalizedName}(${defaultValue} as never)}
            >
              Add
            </Button>
          </Stack>
          {touched['${name}'] && errors['${name}'] && (
            <FormHelperText error>{errors['${name}']}</FormHelperText>
          )}
          <Stack spacing={1}>
            {${name}.map((item, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  ${inputJsx.split('\n').join('\n                  ')}
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => remove${capitalizedName}At(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            {${name}.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No items. Click "Add" to add one.
              </Typography>
            )}
          </Stack>
        </Box>`
}

function generateObjectArrayField(
  name: string,
  label: string,
  capitalizedName: string,
  elementType: ParsedType,
  required: boolean
): string {
  const properties = elementType.properties || []

  // Generate default value object
  const defaultValues: string[] = []
  for (const prop of properties) {
    const propDefault = getDefaultValueForType(prop.type, prop.isOptional)
    defaultValues.push(`${prop.name}: ${propDefault}`)
  }
  const defaultValue = `{ ${defaultValues.join(', ')} }`

  // Generate sub-form fields for each property
  const subFields = properties.map((prop) => {
    return generateSubFormField(prop, capitalizedName)
  }).join('\n')

  return `        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">${label}${required ? ' *' : ''}</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append${capitalizedName}(${defaultValue} as never)}
            >
              Add
            </Button>
          </Stack>
          {touched['${name}'] && errors['${name}'] && (
            <FormHelperText error>{errors['${name}']}</FormHelperText>
          )}
          <Stack spacing={2}>
            {${name}.map((item, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      ${label} #{'\${index + 1}'}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove${capitalizedName}At(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
${subFields}
                </Stack>
              </Card>
            ))}
            {${name}.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No items. Click "Add" to add one.
              </Typography>
            )}
          </Stack>
        </Box>`
}

function generateSubFormField(prop: ParsedProperty, parentCapitalizedName: string): string {
  const { name: propName, type } = prop
  const label = formatLabel(propName)

  // Helper to get main type from optional unions
  const getMainType = (t: ParsedType): ParsedType => {
    if (t.kind === 'union' && t.types) {
      const nonUndefinedTypes = t.types.filter(
        (ut) => !(ut.kind === 'primitive' && (ut.value === 'undefined' || ut.value === 'null'))
      )
      if (nonUndefinedTypes.length === 1) {
        return nonUndefinedTypes[0]
      }
    }
    return t
  }

  const mainType = getMainType(type)

  if (mainType.kind === 'primitive') {
    switch (mainType.value) {
      case 'string':
        return `                  <TextField
                    fullWidth
                    size="small"
                    label="${label}"
                    value={item.${propName} || ''}
                    onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value })}
                  />`
      case 'number':
        return `                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="${label}"
                    value={item.${propName} ?? 0}
                    onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value === '' ? 0 : Number(e.target.value) })}
                  />`
      case 'boolean':
        return `                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.${propName} ?? false}
                        onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.checked })}
                      />
                    }
                    label="${label}"
                  />`
      case 'Date':
        return `                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="${label}"
                    value={item.${propName} instanceof Date ? item.${propName}.toISOString().split('T')[0] : ''}
                    onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value ? new Date(e.target.value) : new Date() })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />`
      default:
        return `                  <TextField
                    fullWidth
                    size="small"
                    label="${label}"
                    value={item.${propName} || ''}
                    onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value })}
                  />`
    }
  }

  // String literal union -> Select dropdown
  if (mainType.kind === 'union' && mainType.types) {
    const isStringLiteralUnion = mainType.types.every(
      (t) => t.kind === 'literal' && typeof t.value === 'string'
    )
    if (isStringLiteralUnion) {
      const options = mainType.types.map((t) => t.value as string)
      const menuItems = options
        .map((opt) => `                      <MenuItem value="${opt}">${formatLabel(opt)}</MenuItem>`)
        .join('\n')

      return `                  <FormControl fullWidth size="small">
                    <InputLabel>${label}</InputLabel>
                    <Select
                      value={item.${propName} || ''}
                      label="${label}"
                      onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value })}
                    >
${menuItems}
                    </Select>
                  </FormControl>`
    }
  }

  // Nested object -> render as sub-sub-form
  if (mainType.kind === 'object' && mainType.properties) {
    return generateNestedObjectField(propName, label, mainType, parentCapitalizedName)
  }

  // Nested array -> JSON for now (could recursively handle)
  if (mainType.kind === 'array') {
    return `                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="${label}"
                    value={JSON.stringify(item.${propName} || [], null, 2)}
                    onChange={(e) => {
                      try {
                        update${parentCapitalizedName}At(index, { ${propName}: JSON.parse(e.target.value) })
                      } catch {
                        // Invalid JSON
                      }
                    }}
                  />`
  }

  // Fallback to text field
  return `                  <TextField
                    fullWidth
                    size="small"
                    label="${label}"
                    value={item.${propName} || ''}
                    onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: e.target.value })}
                  />`
}

function generateNestedObjectField(
  propName: string,
  label: string,
  objectType: ParsedType,
  parentCapitalizedName: string
): string {
  const properties = objectType.properties || []

  const nestedFields = properties.map((nestedProp) => {
    const nestedLabel = formatLabel(nestedProp.name)
    const nestedType = getMainTypeHelper(nestedProp.type)

    if (nestedType.kind === 'primitive') {
      switch (nestedType.value) {
        case 'string':
          return `                      <TextField
                        fullWidth
                        size="small"
                        label="${nestedLabel}"
                        value={item.${propName}?.${nestedProp.name} || ''}
                        onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.value } })}
                      />`
        case 'number':
          return `                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="${nestedLabel}"
                        value={item.${propName}?.${nestedProp.name} ?? 0}
                        onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.value === '' ? 0 : Number(e.target.value) } })}
                      />`
        case 'boolean':
          return `                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.${propName}?.${nestedProp.name} ?? false}
                            onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.checked } })}
                          />
                        }
                        label="${nestedLabel}"
                      />`
        default:
          return `                      <TextField
                        fullWidth
                        size="small"
                        label="${nestedLabel}"
                        value={item.${propName}?.${nestedProp.name} || ''}
                        onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.value } })}
                      />`
      }
    }

    // Nested union (like status select)
    if (nestedType.kind === 'union' && nestedType.types) {
      const isStringLiteralUnion = nestedType.types.every(
        (t) => t.kind === 'literal' && typeof t.value === 'string'
      )
      if (isStringLiteralUnion) {
        const options = nestedType.types.map((t) => t.value as string)
        const menuItems = options
          .map((opt) => `                          <MenuItem value="${opt}">${formatLabel(opt)}</MenuItem>`)
          .join('\n')

        return `                      <FormControl fullWidth size="small">
                        <InputLabel>${nestedLabel}</InputLabel>
                        <Select
                          value={item.${propName}?.${nestedProp.name} || ''}
                          label="${nestedLabel}"
                          onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.value } })}
                        >
${menuItems}
                        </Select>
                      </FormControl>`
      }
    }

    // Fallback
    return `                      <TextField
                        fullWidth
                        size="small"
                        label="${nestedLabel}"
                        value={item.${propName}?.${nestedProp.name} || ''}
                        onChange={(e) => update${parentCapitalizedName}At(index, { ${propName}: { ...item.${propName}, ${nestedProp.name}: e.target.value } })}
                      />`
  }).join('\n')

  return `                  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>${label}</Typography>
                    <Stack spacing={1}>
${nestedFields}
                    </Stack>
                  </Box>`
}

function getMainTypeHelper(t: ParsedType): ParsedType {
  if (t.kind === 'union' && t.types) {
    const nonUndefinedTypes = t.types.filter(
      (ut) => !(ut.kind === 'primitive' && (ut.value === 'undefined' || ut.value === 'null'))
    )
    if (nonUndefinedTypes.length === 1) {
      return nonUndefinedTypes[0]
    }
  }
  return t
}

function getDefaultValueForType(type: ParsedType, isOptional: boolean): string {
  const mainType = getMainTypeHelper(type)

  if (isOptional) {
    return 'undefined'
  }

  if (mainType.kind === 'primitive') {
    switch (mainType.value) {
      case 'string': return "''"
      case 'number': return '0'
      case 'boolean': return 'false'
      case 'Date': return 'new Date()'
      default: return "''"
    }
  }

  if (mainType.kind === 'union' && mainType.types) {
    const firstLiteral = mainType.types.find((t) => t.kind === 'literal')
    if (firstLiteral && typeof firstLiteral.value === 'string') {
      return `'${firstLiteral.value}'`
    }
  }

  if (mainType.kind === 'object' && mainType.properties) {
    const props = mainType.properties.map((p) => {
      const val = getDefaultValueForType(p.type, p.isOptional)
      return `${p.name}: ${val}`
    }).join(', ')
    return `{ ${props} }`
  }

  if (mainType.kind === 'array') {
    return '[]'
  }

  return "''"
}

function generateTextAreaField(
  name: string,
  label: string,
  setter: string,
  required: boolean,
  _dataType: 'array' | 'object'
): string {
  return `        <TextField
          fullWidth
          multiline
          rows={4}
          label="${label}"
          value={JSON.stringify(${name}, null, 2)}
          onChange={(e) => {
            try {
              ${setter}(JSON.parse(e.target.value || '{}'))
            } catch {
              // Invalid JSON, keep current value
            }
          }}
          onBlur={() => handleBlur('${name}')}
          error={touched['${name}'] && !!errors['${name}']}
          helperText={touched['${name}'] ? errors['${name}'] || 'Enter valid JSON' : 'Enter valid JSON'}
          required={${required}}
        />`
}

function isFunction(type: ParsedType): boolean {
  return type.kind === 'function'
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatLabel(str: string): string {
  // Convert camelCase to Title Case
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}
