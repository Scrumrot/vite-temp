import { useEffect, useRef } from 'react'
import type { z } from 'zod'
import type { FormStore, WatchFieldCallback, FormStoreHook } from '../types'
import { getValueAtPath, isEqual } from '../utils/path'

/**
 * Subscribe to field value changes without causing re-renders.
 * Useful for side effects like analytics, logging, or syncing with external systems.
 *
 * @example
 * ```tsx
 * // Watch single field
 * useWatchField(useUserForm, 'email', (value, prevValue) => {
 *   console.log('Email changed:', prevValue, '->', value)
 *   analytics.track('email_changed')
 * })
 *
 * // Watch multiple fields
 * useWatchField(useUserForm, ['firstName', 'lastName'], (values) => {
 *   console.log('Name fields changed:', values)
 * })
 * ```
 */
export function useWatchField<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  T = unknown,
>(
  useFormStore: FormStoreHook<TSchema>,
  field: string,
  callback: WatchFieldCallback<T>
): void

export function useWatchField<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  T = unknown,
>(
  useFormStore: FormStoreHook<TSchema>,
  fields: string[],
  callback: (values: Record<string, T>) => void
): void

export function useWatchField<
  TSchema extends z.ZodObject<z.ZodRawShape>,
  T = unknown,
>(
  useFormStore: FormStoreHook<TSchema>,
  fieldOrFields: string | string[],
  callback: WatchFieldCallback<T> | ((values: Record<string, T>) => void)
): void {
  // Store the callback in a ref to avoid subscription churn
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // Store previous values for comparison
  const prevValuesRef = useRef<T | Record<string, T> | undefined>(undefined)

  useEffect(() => {
    // Handle single field
    if (typeof fieldOrFields === 'string') {
      const field = fieldOrFields

      // Get initial value
      const initialValue = getValueAtPath(
        useFormStore.getState().values,
        field
      ) as T
      prevValuesRef.current = initialValue

      // Subscribe to store changes using Zustand's subscribe
      const unsubscribe = useFormStore.subscribe((state: FormStore<TSchema>) => {
        const value = getValueAtPath(state.values, field) as T
        const prevValue = prevValuesRef.current as T

        // Only call callback if value actually changed
        if (!isEqual(value, prevValue)) {
          prevValuesRef.current = value
          ;(callbackRef.current as WatchFieldCallback<T>)(value, prevValue)
        }
      })

      return unsubscribe
    }

    // Handle multiple fields
    const fields = fieldOrFields

    // Get initial values
    const initialValues: Record<string, T> = {}
    const state = useFormStore.getState()
    for (const field of fields) {
      initialValues[field] = getValueAtPath(state.values, field) as T
    }
    prevValuesRef.current = initialValues

    // Subscribe to store changes
    const unsubscribe = useFormStore.subscribe((state: FormStore<TSchema>) => {
      const values: Record<string, T> = {}
      for (const field of fields) {
        values[field] = getValueAtPath(state.values, field) as T
      }

      const prevValues = prevValuesRef.current as Record<string, T>

      // Check if any field actually changed
      const hasChanges = fields.some(
        (field) => !isEqual(values[field], prevValues[field])
      )

      if (hasChanges) {
        prevValuesRef.current = values
        ;(callbackRef.current as (values: Record<string, T>) => void)(values)
      }
    })

    return unsubscribe
  }, [useFormStore, fieldOrFields])
}
