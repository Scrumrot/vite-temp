import type { z } from 'zod'
import { useField } from '../hooks/useField'
import type { FormStoreHook, UseFieldReturn } from '../types'

export interface FieldProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Render function receiving field state and handlers */
  children: (field: UseFieldReturn<unknown>) => React.ReactNode
}

/**
 * Generic Field component using render props pattern.
 * Provides maximum flexibility for custom field implementations.
 *
 * @example
 * ```tsx
 * <Field useFormStore={useUserForm} name="email">
 *   {({ value, onChange, onBlur, hasError, errorMessage }) => (
 *     <TextField
 *       value={value}
 *       onChange={(e) => onChange(e.target.value)}
 *       onBlur={onBlur}
 *       error={hasError}
 *       helperText={errorMessage}
 *     />
 *   )}
 * </Field>
 * ```
 */
export const Field = <TSchema extends z.ZodObject<z.ZodRawShape>>({
  useFormStore,
  name,
  children,
}: FieldProps<TSchema>): React.ReactNode => {
  const field = useField(useFormStore, name)
  return children(field)
}
