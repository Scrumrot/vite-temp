import { useEffect, useRef } from 'react'
import type { z } from 'zod'
import type {
  FormStore,
  WatchErrorCallback,
  FieldValidation,
  FormValidation,
  FormStoreHook,
} from '../types'

/**
 * Subscribe to validation state changes without causing re-renders.
 * Useful for analytics, error logging, or triggering side effects on validation changes.
 *
 * @example
 * ```tsx
 * // Watch single field validation
 * useWatchError(useUserForm, 'email', (validation) => {
 *   if (validation.errors.length > 0) {
 *     analytics.track('validation_error', { field: 'email' })
 *   }
 * })
 *
 * // Watch all form errors (pass null for field)
 * useWatchError(useUserForm, null, (formValidation) => {
 *   console.log('Form valid:', formValidation.isValid)
 *   if (!formValidation.isValid) {
 *     analytics.track('form_invalid', { errorCount: formValidation.errors.length })
 *   }
 * })
 * ```
 */
export const useWatchError = <TSchema extends z.ZodObject<z.ZodRawShape>>(
  useFormStore: FormStoreHook<TSchema>,
  field: string | null,
  callback: WatchErrorCallback
): void => {
  // Store the callback in a ref to avoid subscription churn
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // Store previous validation for comparison
  const prevValidationRef = useRef<FieldValidation | FormValidation | undefined>(
    undefined
  )

  useEffect(() => {
    // Watch form-level validation
    if (field === null) {
      // Get initial value
      prevValidationRef.current = useFormStore.getState().formValidation

      const unsubscribe = useFormStore.subscribe((state: FormStore<TSchema>) => {
        const validation = state.formValidation
        const prevValidation = prevValidationRef.current as FormValidation

        // Deep compare to avoid unnecessary callbacks
        if (!isFormValidationEqual(validation, prevValidation)) {
          prevValidationRef.current = validation
          callbackRef.current(validation)
        }
      })

      return unsubscribe
    }

    // Watch field-level validation
    const defaultValidation: FieldValidation = {
      errors: [],
      warnings: [],
      infos: [],
    }

    // Get initial value
    prevValidationRef.current =
      useFormStore.getState().fieldValidation[field] ?? defaultValidation

    const unsubscribe = useFormStore.subscribe((state: FormStore<TSchema>) => {
      const validation = state.fieldValidation[field] ?? defaultValidation
      const prevValidation = prevValidationRef.current as FieldValidation

      // Deep compare to avoid unnecessary callbacks
      if (!isFieldValidationEqual(validation, prevValidation)) {
        prevValidationRef.current = validation
        callbackRef.current(validation)
      }
    })

    return unsubscribe
  }, [useFormStore, field])
}

// Helper to compare field validation objects
const isFieldValidationEqual = (
  a: FieldValidation,
  b: FieldValidation
): boolean => {
  if (a.errors.length !== b.errors.length) return false
  if (a.warnings.length !== b.warnings.length) return false
  if (a.infos.length !== b.infos.length) return false

  // Compare error messages (most common case)
  const aErrorMsgs = a.errors.map((e) => e.message).join('|')
  const bErrorMsgs = b.errors.map((e) => e.message).join('|')
  if (aErrorMsgs !== bErrorMsgs) return false

  const aWarnMsgs = a.warnings.map((e) => e.message).join('|')
  const bWarnMsgs = b.warnings.map((e) => e.message).join('|')
  if (aWarnMsgs !== bWarnMsgs) return false

  const aInfoMsgs = a.infos.map((e) => e.message).join('|')
  const bInfoMsgs = b.infos.map((e) => e.message).join('|')
  if (aInfoMsgs !== bInfoMsgs) return false

  return true
}

// Helper to compare form validation objects
const isFormValidationEqual = (
  a: FormValidation,
  b: FormValidation
): boolean => {
  if (a.isValid !== b.isValid) return false
  if (a.errors.length !== b.errors.length) return false
  if (a.warnings.length !== b.warnings.length) return false
  if (a.infos.length !== b.infos.length) return false

  return true
}
