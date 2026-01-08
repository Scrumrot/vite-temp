export type WizardStep =
  | 'type-input'
  | 'schema-preview'
  | 'store-config'
  | 'form-preview'
  | 'export'

export interface StoreConfigOptions {
  persist: boolean
  storageKey: string
  generateArrayActions: boolean
}

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

export interface BrowserParseResult {
  declarations: ParsedDeclaration[]
  errors: string[]
}

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'array' | 'object'
  required: boolean
  options?: string[] // For select fields
  elementConfig?: FieldConfig // For array fields
  properties?: FieldConfig[] // For object fields
}

// Field component types for customization
export type StringFieldComponent = 'TextField' | 'Autocomplete' | 'TextArea' | 'MultiSelect'
export type NumberFieldComponent = 'TextField' | 'Slider'
export type BooleanFieldComponent = 'Switch' | 'Checkbox'
export type SelectFieldComponent = 'Select' | 'RadioGroup' | 'Autocomplete' | 'MultiSelect'
export type DateFieldComponent = 'DatePicker' | 'TextField'

export type FieldComponentType =
  | StringFieldComponent
  | NumberFieldComponent
  | BooleanFieldComponent
  | SelectFieldComponent
  | DateFieldComponent

// Grid size type (1-12 for MUI Grid)
export type GridSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

// Array view mode for object arrays
export type ArrayViewMode = 'list' | 'table'

export interface FieldTypeConfig {
  component: FieldComponentType
  // Layout options
  gridSize?: GridSize // Grid column width (1-12), defaults to 12
  // Additional options for specific components
  autocompleteOptions?: string[] // For Autocomplete
  sliderMin?: number // For Slider
  sliderMax?: number // For Slider
  sliderStep?: number // For Slider
  multiline?: boolean // For TextArea
  rows?: number // For TextArea
  // Array-specific options
  arrayViewMode?: ArrayViewMode // For object arrays: 'list' or 'table'
}
