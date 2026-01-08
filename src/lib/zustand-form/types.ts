import type { z } from 'zod'
import type {
  ValidationSeverity,
  ValidationIssue,
  TieredValidationResult,
} from '../../features/form-builder-wizard/types'

// Re-export for convenience
export type { ValidationSeverity, ValidationIssue, TieredValidationResult }

// ============================================================
// Field State Types
// ============================================================

/** Metadata for a single field */
export interface FieldMeta {
  /** Whether the field has been modified from its initial value */
  dirty: boolean
  /** Whether the field has been focused and then blurred */
  touched: boolean
  /** Whether async validation is currently running */
  validating: boolean
}

/** Validation state for a single field (tiered) */
export interface FieldValidation {
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  infos: ValidationIssue[]
}

/** Complete state for a single field */
export interface FieldState<T> {
  value: T
  meta: FieldMeta
  validation: FieldValidation
}

// ============================================================
// Form State Types
// ============================================================

/** Form-level metadata */
export interface FormMeta {
  /** Whether any field has been modified */
  isDirty: boolean
  /** Whether any field has been touched */
  isTouched: boolean
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Whether async validation is running on any field */
  isValidating: boolean
  /** Count of form submissions */
  submitCount: number
}

/** Form-level validation state */
export interface FormValidation {
  /** Whether form has no blocking errors */
  isValid: boolean
  /** All validation issues across all fields */
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  infos: ValidationIssue[]
}

// ============================================================
// Store Types
// ============================================================

/** Type helper to extract nested paths from an object type */
export type FieldPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? T[K] extends unknown[]
            ? K
            : K | `${K}.${FieldPath<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

/** Type helper to extract field value at a path */
export type FieldValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? FieldValue<T[K], Rest>
      : never
    : never

/** Configuration options for creating a form store */
export interface FormConfig<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** The Zod schema for validation */
  schema: TSchema
  /** Initial values (defaults derived from schema if not provided) */
  initialValues?: Partial<z.infer<TSchema>>
  /** Validation mode: 'onChange', 'onBlur', 'onSubmit', or 'all' */
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all'
  /** Debounce delay for async validation in ms (default: 300) */
  asyncDebounceMs?: number
  /** Async validation functions per field */
  asyncValidators?: Partial<{
    [K in keyof z.infer<TSchema>]: (
      value: z.infer<TSchema>[K],
      formValues: z.infer<TSchema>
    ) => Promise<ValidationIssue[]>
  }>
  /** Submit handler */
  onSubmit?: (values: z.infer<TSchema>) => void | Promise<void>
  /** Error handler for submission failures */
  onSubmitError?: (error: unknown) => void
}

/** The complete form store state and actions */
export interface FormStore<TSchema extends z.ZodObject<z.ZodRawShape>> {
  // Values
  values: z.infer<TSchema>
  initialValues: z.infer<TSchema>

  // Field metadata (keyed by field path)
  fieldMeta: Record<string, FieldMeta>

  // Validation state (keyed by field path)
  fieldValidation: Record<string, FieldValidation>

  // Form-level state
  formMeta: FormMeta
  formValidation: FormValidation

  // Field actions
  setFieldValue: <K extends keyof z.infer<TSchema>>(
    field: K,
    value: z.infer<TSchema>[K]
  ) => void
  setNestedFieldValue: (path: string, value: unknown) => void
  setFieldTouched: (field: string, touched?: boolean) => void
  setFieldError: (field: string, error: ValidationIssue | null) => void

  // Bulk actions
  setValues: (values: Partial<z.infer<TSchema>>) => void
  resetField: (field: string) => void
  reset: (values?: Partial<z.infer<TSchema>>) => void

  // Validation actions
  validateField: (field: string) => TieredValidationResult<unknown>
  validateForm: () => TieredValidationResult<z.infer<TSchema>>

  // Form actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  setSubmitting: (isSubmitting: boolean) => void

  // Internal
  _updateFormValidation: () => void
}

// ============================================================
// Hook Return Types
// ============================================================

/** Return type for useForm hook */
export interface UseFormReturn<TSchema extends z.ZodObject<z.ZodRawShape>> {
  // State
  values: z.infer<TSchema>
  meta: FormMeta
  validation: FormValidation

  // Actions
  setValues: FormStore<TSchema>['setValues']
  reset: FormStore<TSchema>['reset']
  validateForm: FormStore<TSchema>['validateForm']
  handleSubmit: FormStore<TSchema>['handleSubmit']

  // Helpers
  getFieldState: <K extends keyof z.infer<TSchema>>(
    field: K
  ) => FieldState<z.infer<TSchema>[K]>
}

/** Return type for useField hook */
export interface UseFieldReturn<T> {
  // Value and state
  value: T
  meta: FieldMeta
  validation: FieldValidation

  // Computed
  hasError: boolean
  errorMessage: string | undefined
  hasWarning: boolean
  warningMessage: string | undefined
  hasInfo: boolean
  infoMessage: string | undefined

  // Handlers
  onChange: (value: T) => void
  onBlur: () => void

  // Input props helper (for spreading to inputs)
  getInputProps: () => {
    value: T
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur: () => void
    error: boolean
    name: string
  }
}

/** Return type for useFieldArray hook */
export interface UseFieldArrayReturn<T> {
  fields: T[]

  // Actions
  append: (value: T) => void
  prepend: (value: T) => void
  insert: (index: number, value: T) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
  update: (index: number, value: T) => void
  replace: (values: T[]) => void
}

// ============================================================
// Watch Hook Types
// ============================================================

/** Callback for useWatchField */
export type WatchFieldCallback<T> = (value: T, prevValue: T) => void

/** Callback for useWatchError */
export type WatchErrorCallback = (
  validation: FieldValidation | FormValidation
) => void

// ============================================================
// Store Hook Types
// ============================================================

import type { StoreApi, UseBoundStore } from 'zustand'

/** Type for the form store hook returned by createFormStore */
export type FormStoreHook<TSchema extends z.ZodObject<z.ZodRawShape>> =
  UseBoundStore<StoreApi<FormStore<TSchema>>>

// ============================================================
// Component Types
// ============================================================

/** Props for the generic Field component */
export interface FieldProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Render function receiving field state and handlers */
  children: (field: UseFieldReturn<unknown>) => React.ReactNode
}

/** Base props for form field components */
export interface BaseFieldProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Show warnings as helper text when no errors */
  showWarnings?: boolean
  /** Show info messages as helper text when no errors/warnings */
  showInfo?: boolean
}
