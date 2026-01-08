// ============================================================
// Core Factory
// ============================================================
export { createFormStore } from './createFormStore'

// ============================================================
// Hooks
// ============================================================
export { useForm } from './hooks/useForm'
export { useField } from './hooks/useField'
export { useFieldArray } from './hooks/useFieldArray'
export { useWatchField } from './hooks/useWatchField'
export { useWatchError } from './hooks/useWatchError'

// ============================================================
// Components
// ============================================================
export { Field } from './components/Field'
export { FormTextField } from './components/TextField'
export { FormSelectField } from './components/SelectField'
export { FormSwitchField } from './components/SwitchField'

// ============================================================
// Types
// ============================================================
export type {
  // Core types
  FormConfig,
  FormStore,
  FormStoreHook,
  FormMeta,
  FormValidation,
  FieldState,
  FieldMeta,
  FieldValidation,
  // Hook return types
  UseFormReturn,
  UseFieldReturn,
  UseFieldArrayReturn,
  // Watch callback types
  WatchFieldCallback,
  WatchErrorCallback,
  // Component types
  FieldProps,
  BaseFieldProps,
  // Path utilities
  FieldPath,
  FieldValue,
  // Re-exported validation types
  ValidationSeverity,
  ValidationIssue,
  TieredValidationResult,
} from './types'

// ============================================================
// Utilities (for advanced usage)
// ============================================================
export { getValueAtPath, setValueAtPath, isEqual } from './utils/path'
export {
  createDebouncedAsync,
  createCancellableDebouncedAsync,
} from './utils/debounce'
