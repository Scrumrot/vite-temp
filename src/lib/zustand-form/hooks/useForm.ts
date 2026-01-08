import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import type { z } from 'zod'
import type { FormStoreHook, UseFormReturn, FieldState } from '../types'

/**
 * Hook for accessing form-level state and actions.
 * Uses selective subscriptions for optimal performance.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { values, meta, validation, handleSubmit, reset } = useForm(useUserForm)
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {!validation.isValid && (
 *         <Alert severity="error">Please fix the errors below</Alert>
 *       )}
 *       <Button type="submit" disabled={meta.isSubmitting}>
 *         Submit
 *       </Button>
 *     </form>
 *   )
 * }
 * ```
 */
export const useForm = <TSchema extends z.ZodObject<z.ZodRawShape>>(
  useFormStore: FormStoreHook<TSchema>
): UseFormReturn<TSchema> => {
  // Select form-level state with shallow comparison for performance
  const { values, formMeta, formValidation, fieldMeta, fieldValidation } =
    useFormStore(
      useShallow((state) => ({
        values: state.values,
        formMeta: state.formMeta,
        formValidation: state.formValidation,
        fieldMeta: state.fieldMeta,
        fieldValidation: state.fieldValidation,
      }))
    )

  // Select actions (stable references - no need for shallow)
  const setValues = useFormStore((state) => state.setValues)
  const reset = useFormStore((state) => state.reset)
  const validateForm = useFormStore((state) => state.validateForm)
  const handleSubmit = useFormStore((state) => state.handleSubmit)

  // Helper to get field state - memoized to prevent unnecessary re-creates
  const getFieldState = useCallback(
    <K extends keyof z.infer<TSchema>>(
      field: K
    ): FieldState<z.infer<TSchema>[K]> => {
      const fieldStr = String(field)
      return {
        value: values[field],
        meta: fieldMeta[fieldStr] ?? {
          dirty: false,
          touched: false,
          validating: false,
        },
        validation: fieldValidation[fieldStr] ?? {
          errors: [],
          warnings: [],
          infos: [],
        },
      }
    },
    [values, fieldMeta, fieldValidation]
  )

  // Return memoized object to prevent unnecessary re-renders in consumers
  return useMemo(
    () => ({
      values,
      meta: formMeta,
      validation: formValidation,
      setValues,
      reset,
      validateForm,
      handleSubmit,
      getFieldState,
    }),
    [
      values,
      formMeta,
      formValidation,
      setValues,
      reset,
      validateForm,
      handleSubmit,
      getFieldState,
    ]
  )
}
