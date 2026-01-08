import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { z } from 'zod'
import { tieredSafeParse } from '../../features/form-builder-wizard/lib/tiered-validation'
import type {
  FormStore,
  FormConfig,
  FieldMeta,
  FieldValidation,
  FormMeta,
  FormValidation,
  ValidationIssue,
  TieredValidationResult,
} from './types'
import { getValueAtPath, setValueAtPath, isEqual } from './utils/path'
import { createCancellableDebouncedAsync } from './utils/debounce'

// ============================================================
// Initial State Factories (Pure Functions)
// ============================================================

const createInitialFieldMeta = (): FieldMeta => ({
  dirty: false,
  touched: false,
  validating: false,
})

const createInitialFieldValidation = (): FieldValidation => ({
  errors: [],
  warnings: [],
  infos: [],
})

const createInitialFormMeta = (): FormMeta => ({
  isDirty: false,
  isTouched: false,
  isSubmitting: false,
  isValidating: false,
  submitCount: 0,
})

const createInitialFormValidation = (): FormValidation => ({
  isValid: true,
  issues: [],
  errors: [],
  warnings: [],
  infos: [],
})

// ============================================================
// Schema Helpers
// ============================================================

/**
 * Extract field paths from object shape (non-recursive for simplicity)
 */
const getTopLevelFields = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): string[] => {
  return Object.keys(schema.shape)
}

// ============================================================
// Validation Result Groupers (Pure Functions)
// ============================================================

const groupIssuesByPath = (
  issues: ValidationIssue[],
  fieldPaths: string[]
): Record<string, FieldValidation> => {
  const result: Record<string, FieldValidation> = {}

  for (const path of fieldPaths) {
    result[path] = {
      errors: issues.filter(
        (i) =>
          i.severity === 'error' &&
          (i.path[0] === path || i.path.join('.').startsWith(path))
      ),
      warnings: issues.filter(
        (i) =>
          i.severity === 'warning' &&
          (i.path[0] === path || i.path.join('.').startsWith(path))
      ),
      infos: issues.filter(
        (i) =>
          i.severity === 'info' &&
          (i.path[0] === path || i.path.join('.').startsWith(path))
      ),
    }
  }

  return result
}

const aggregateFormValidation = (
  fieldValidation: Record<string, FieldValidation>
): FormValidation => {
  const allErrors: ValidationIssue[] = []
  const allWarnings: ValidationIssue[] = []
  const allInfos: ValidationIssue[] = []

  for (const validation of Object.values(fieldValidation)) {
    allErrors.push(...validation.errors)
    allWarnings.push(...validation.warnings)
    allInfos.push(...validation.infos)
  }

  return {
    isValid: allErrors.length === 0,
    issues: [...allErrors, ...allWarnings, ...allInfos],
    errors: allErrors,
    warnings: allWarnings,
    infos: allInfos,
  }
}

// ============================================================
// createFormStore Factory
// ============================================================

/**
 * Creates a Zustand store for form state management with tiered validation.
 *
 * @example
 * ```ts
 * const UserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 *   age: z.number().optional()
 * })
 *
 * const useUserForm = createFormStore({
 *   schema: UserSchema,
 *   validationMode: 'onChange',
 *   onSubmit: async (values) => {
 *     await api.saveUser(values)
 *   }
 * })
 * ```
 */
export const createFormStore = <TSchema extends z.ZodObject<z.ZodRawShape>>(
  config: FormConfig<TSchema>
) => {
  const {
    schema,
    initialValues = {} as Partial<z.infer<TSchema>>,
    validationMode = 'onChange',
    asyncDebounceMs = 300,
    asyncValidators = {},
    onSubmit,
    onSubmitError,
  } = config

  // Get field paths from schema
  const fieldPaths = getTopLevelFields(schema)

  // Merge initial values (user can provide defaults)
  const mergedInitialValues = { ...initialValues } as z.infer<TSchema>

  // Create initial field meta/validation
  const initialFieldMeta: Record<string, FieldMeta> = Object.fromEntries(
    fieldPaths.map((path) => [path, createInitialFieldMeta()])
  )

  const initialFieldValidation: Record<string, FieldValidation> =
    Object.fromEntries(
      fieldPaths.map((path) => [path, createInitialFieldValidation()])
    )

  // Create debounced async validators
  type AsyncValidatorFn = (
    value: unknown,
    values: z.infer<TSchema>
  ) => Promise<ValidationIssue[]>

  const debouncedAsyncValidators: Record<
    string,
    {
      debounced: (
        value: unknown,
        values: z.infer<TSchema>
      ) => Promise<ValidationIssue[] | null>
      cancel: () => void
    }
  > = {}

  for (const [field, validator] of Object.entries(asyncValidators)) {
    if (validator) {
      debouncedAsyncValidators[field] = createCancellableDebouncedAsync(
        validator as AsyncValidatorFn,
        asyncDebounceMs
      )
    }
  }

  // Create the Zustand store with subscribeWithSelector middleware
  return create<FormStore<TSchema>>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      values: mergedInitialValues,
      initialValues: mergedInitialValues,
      fieldMeta: initialFieldMeta,
      fieldValidation: initialFieldValidation,
      formMeta: createInitialFormMeta(),
      formValidation: createInitialFormValidation(),

      // ========================================
      // Field Actions
      // ========================================

      setFieldValue: (field, value) => {
        const fieldStr = String(field)
        const state = get()
        const initialValue = getValueAtPath(state.initialValues, fieldStr)
        const isDirty = !isEqual(value, initialValue)

        // Update value and meta
        set((prev) => ({
          values: { ...prev.values, [field]: value },
          fieldMeta: {
            ...prev.fieldMeta,
            [fieldStr]: {
              ...(prev.fieldMeta[fieldStr] ?? createInitialFieldMeta()),
              dirty: isDirty,
            },
          },
        }))

        // Trigger validation based on mode
        if (validationMode === 'onChange' || validationMode === 'all') {
          get().validateField(fieldStr)
        }

        // Trigger async validation if configured
        const asyncValidator = debouncedAsyncValidators[fieldStr]
        if (asyncValidator) {
          set((prev) => ({
            fieldMeta: {
              ...prev.fieldMeta,
              [fieldStr]: {
                ...(prev.fieldMeta[fieldStr] ?? createInitialFieldMeta()),
                validating: true,
              },
            },
          }))

          asyncValidator
            .debounced(value, get().values)
            .then((issues) => {
              if (issues === null) return // Cancelled

              set((prev) => {
                const currentValidation =
                  prev.fieldValidation[fieldStr] ?? createInitialFieldValidation()
                return {
                  fieldMeta: {
                    ...prev.fieldMeta,
                    [fieldStr]: {
                      ...(prev.fieldMeta[fieldStr] ?? createInitialFieldMeta()),
                      validating: false,
                    },
                  },
                  fieldValidation: {
                    ...prev.fieldValidation,
                    [fieldStr]: {
                      errors: [
                        ...currentValidation.errors.filter(
                          (e: ValidationIssue) => !e.code?.startsWith('async_')
                        ),
                        ...issues.filter((i) => i.severity === 'error'),
                      ],
                      warnings: [
                        ...currentValidation.warnings.filter(
                          (e: ValidationIssue) => !e.code?.startsWith('async_')
                        ),
                        ...issues.filter((i) => i.severity === 'warning'),
                      ],
                      infos: [
                        ...currentValidation.infos.filter(
                          (e: ValidationIssue) => !e.code?.startsWith('async_')
                        ),
                        ...issues.filter((i) => i.severity === 'info'),
                      ],
                    },
                  },
                }
              })
              get()._updateFormValidation()
            })
            .catch(() => {
              set((prev) => ({
                fieldMeta: {
                  ...prev.fieldMeta,
                  [fieldStr]: {
                    ...(prev.fieldMeta[fieldStr] ?? createInitialFieldMeta()),
                    validating: false,
                  },
                },
              }))
            })
        }
      },

      setNestedFieldValue: (path, value) => {
        const state = get()
        const initialValue = getValueAtPath(state.initialValues, path)
        const isDirty = !isEqual(value, initialValue)

        set((prev) => ({
          values: setValueAtPath(prev.values, path, value),
          fieldMeta: {
            ...prev.fieldMeta,
            [path]: {
              ...(prev.fieldMeta[path] ?? createInitialFieldMeta()),
              dirty: isDirty,
            },
          },
        }))

        if (validationMode === 'onChange' || validationMode === 'all') {
          // Validate the root field for nested paths
          const rootField = path.split('.')[0]
          get().validateField(rootField)
        }
      },

      setFieldTouched: (field, touched = true) => {
        set((prev) => ({
          fieldMeta: {
            ...prev.fieldMeta,
            [field]: {
              ...(prev.fieldMeta[field] ?? createInitialFieldMeta()),
              touched,
            },
          },
          formMeta: {
            ...prev.formMeta,
            isTouched:
              touched || Object.values(prev.fieldMeta).some((m) => m.touched),
          },
        }))

        if (
          touched &&
          (validationMode === 'onBlur' || validationMode === 'all')
        ) {
          get().validateField(field)
        }
      },

      setFieldError: (field, error) => {
        set((prev) => ({
          fieldValidation: {
            ...prev.fieldValidation,
            [field]: {
              ...(prev.fieldValidation[field] ?? createInitialFieldValidation()),
              errors: error ? [error] : [],
            },
          },
        }))
        get()._updateFormValidation()
      },

      // ========================================
      // Bulk Actions
      // ========================================

      setValues: (values) => {
        set((prev) => ({
          values: { ...prev.values, ...values },
        }))

        if (validationMode === 'onChange' || validationMode === 'all') {
          get().validateForm()
        }
      },

      resetField: (field) => {
        const state = get()
        const initialValue = getValueAtPath(state.initialValues, field)

        set((prev) => ({
          values: setValueAtPath(prev.values, field, initialValue),
          fieldMeta: {
            ...prev.fieldMeta,
            [field]: createInitialFieldMeta(),
          },
          fieldValidation: {
            ...prev.fieldValidation,
            [field]: createInitialFieldValidation(),
          },
        }))

        get()._updateFormValidation()
      },

      reset: (values) => {
        const newInitialValues = values
          ? { ...get().initialValues, ...values }
          : get().initialValues

        set({
          values: newInitialValues,
          initialValues: newInitialValues,
          fieldMeta: Object.fromEntries(
            fieldPaths.map((path) => [path, createInitialFieldMeta()])
          ),
          fieldValidation: Object.fromEntries(
            fieldPaths.map((path) => [path, createInitialFieldValidation()])
          ),
          formMeta: createInitialFormMeta(),
          formValidation: createInitialFormValidation(),
        })
      },

      // ========================================
      // Validation Actions
      // ========================================

      validateField: (field) => {
        const state = get()
        const result = tieredSafeParse(schema, state.values)

        // Filter issues for this field
        const fieldIssues = result.issues.filter(
          (i) => i.path[0] === field || i.path.join('.').startsWith(field)
        )

        const fieldValidation: FieldValidation = {
          errors: fieldIssues.filter((i) => i.severity === 'error'),
          warnings: fieldIssues.filter((i) => i.severity === 'warning'),
          infos: fieldIssues.filter((i) => i.severity === 'info'),
        }

        set((prev) => ({
          fieldValidation: {
            ...prev.fieldValidation,
            [field]: fieldValidation,
          },
        }))

        get()._updateFormValidation()

        return {
          success: fieldValidation.errors.length === 0,
          data: state.values[field as keyof typeof state.values],
          issues: fieldIssues,
          errors: fieldValidation.errors,
          warnings: fieldValidation.warnings,
          infos: fieldValidation.infos,
        }
      },

      validateForm: () => {
        const state = get()
        const result = tieredSafeParse(schema, state.values) as TieredValidationResult<
          z.infer<TSchema>
        >

        // Group issues by field path
        const fieldValidation = groupIssuesByPath(result.issues, fieldPaths)
        const formValidation = aggregateFormValidation(fieldValidation)

        set({
          fieldValidation,
          formValidation,
        })

        return result
      },

      // ========================================
      // Form Actions
      // ========================================

      handleSubmit: async (e) => {
        e?.preventDefault()

        const state = get()

        // Mark all fields as touched
        const touchedMeta = Object.fromEntries(
          fieldPaths.map((path) => [
            path,
            { ...(state.fieldMeta[path] ?? createInitialFieldMeta()), touched: true },
          ])
        )

        set((prev) => ({
          fieldMeta: touchedMeta,
          formMeta: {
            ...prev.formMeta,
            isSubmitting: true,
            isTouched: true,
            submitCount: prev.formMeta.submitCount + 1,
          },
        }))

        // Validate entire form
        const result = get().validateForm()

        if (!result.success) {
          set((prev) => ({
            formMeta: { ...prev.formMeta, isSubmitting: false },
          }))
          return
        }

        // Call submit handler
        try {
          await onSubmit?.(result.data!)
        } catch (error) {
          onSubmitError?.(error)
        } finally {
          set((prev) => ({
            formMeta: { ...prev.formMeta, isSubmitting: false },
          }))
        }
      },

      setSubmitting: (isSubmitting) => {
        set((prev) => ({
          formMeta: { ...prev.formMeta, isSubmitting },
        }))
      },

      // ========================================
      // Internal
      // ========================================

      _updateFormValidation: () => {
        const state = get()
        const formValidation = aggregateFormValidation(state.fieldValidation)

        set({
          formMeta: {
            ...state.formMeta,
            isDirty: Object.values(state.fieldMeta).some((m) => m.dirty),
            isValidating: Object.values(state.fieldMeta).some(
              (m) => m.validating
            ),
          },
          formValidation,
        })
      },
    }))
  )
}
