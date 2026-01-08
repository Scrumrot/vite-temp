import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import type { z } from 'zod'
import type { FormStoreHook, UseFieldReturn, FieldMeta, FieldValidation } from '../types'
import { getValueAtPath } from '../utils/path'

// Default values for missing field state
const defaultMeta: FieldMeta = {
  dirty: false,
  touched: false,
  validating: false,
}

const defaultValidation: FieldValidation = {
  errors: [],
  warnings: [],
  infos: [],
}

/**
 * Hook for accessing field-level state with selective subscription.
 * Only re-renders when this specific field's state changes.
 *
 * @example
 * ```tsx
 * function NameField() {
 *   const { value, onChange, onBlur, hasError, errorMessage } = useField(useUserForm, 'name')
 *
 *   return (
 *     <TextField
 *       value={value}
 *       onChange={(e) => onChange(e.target.value)}
 *       onBlur={onBlur}
 *       error={hasError}
 *       helperText={errorMessage}
 *     />
 *   )
 * }
 * ```
 */
export const useField = <
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TPath extends string,
>(
  useFormStore: FormStoreHook<TSchema>,
  path: TPath
): UseFieldReturn<unknown> => {
  // Select only this field's state using shallow comparison
  const { value, meta, validation } = useFormStore(
    useShallow((state) => ({
      value: getValueAtPath(state.values, path),
      meta: state.fieldMeta[path] ?? defaultMeta,
      validation: state.fieldValidation[path] ?? defaultValidation,
    }))
  )

  // Get actions (stable references)
  const setFieldValue = useFormStore((state) => state.setFieldValue)
  const setNestedFieldValue = useFormStore((state) => state.setNestedFieldValue)
  const setFieldTouched = useFormStore((state) => state.setFieldTouched)

  // Determine if this is a nested path
  const isNested = path.includes('.')

  // Create stable onChange handler
  const onChange = useCallback(
    (newValue: unknown) => {
      if (isNested) {
        setNestedFieldValue(path, newValue)
      } else {
        setFieldValue(path as keyof z.infer<TSchema>, newValue as never)
      }
    },
    [path, isNested, setFieldValue, setNestedFieldValue]
  )

  // Create stable onBlur handler
  const onBlur = useCallback(() => {
    setFieldTouched(path, true)
  }, [path, setFieldTouched])

  // Compute derived values
  const hasError = meta.touched && validation.errors.length > 0
  const errorMessage = hasError ? validation.errors[0]?.message : undefined

  const hasWarning = meta.touched && validation.warnings.length > 0
  const warningMessage = hasWarning
    ? validation.warnings[0]?.message
    : undefined

  const hasInfo = meta.touched && validation.infos.length > 0
  const infoMessage = hasInfo ? validation.infos[0]?.message : undefined

  // Helper to get input props for easy spreading
  const getInputProps = useCallback(
    () => ({
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value),
      onBlur,
      error: hasError,
      name: path,
    }),
    [value, onChange, onBlur, hasError, path]
  )

  // Return memoized result
  return useMemo(
    () => ({
      value,
      meta,
      validation,
      hasError,
      errorMessage,
      hasWarning,
      warningMessage,
      hasInfo,
      infoMessage,
      onChange,
      onBlur,
      getInputProps,
    }),
    [
      value,
      meta,
      validation,
      hasError,
      errorMessage,
      hasWarning,
      warningMessage,
      hasInfo,
      infoMessage,
      onChange,
      onBlur,
      getInputProps,
    ]
  )
}
