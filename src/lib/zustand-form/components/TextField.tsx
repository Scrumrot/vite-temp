import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField'
import type { z } from 'zod'
import { useField } from '../hooks/useField'
import type { FormStoreHook } from '../types'

export interface FormTextFieldProps<TSchema extends z.ZodObject<z.ZodRawShape>>
  extends Omit<
    MuiTextFieldProps,
    'value' | 'onChange' | 'onBlur' | 'error' | 'name'
  > {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Show warnings as helper text when no errors (default: true) */
  showWarnings?: boolean
  /** Show info messages as helper text when no errors/warnings (default: false) */
  showInfo?: boolean
}

/**
 * MUI TextField integrated with zustand-form.
 * Automatically handles value binding, validation, and error display.
 *
 * @example
 * ```tsx
 * <FormTextField
 *   useFormStore={useUserForm}
 *   name="email"
 *   label="Email"
 *   required
 *   showWarnings
 * />
 * ```
 */
export const FormTextField = <TSchema extends z.ZodObject<z.ZodRawShape>>({
  useFormStore,
  name,
  showWarnings = true,
  showInfo = false,
  helperText: customHelperText,
  type,
  ...muiProps
}: FormTextFieldProps<TSchema>): React.ReactNode => {
  const {
    value,
    onChange,
    onBlur,
    meta,
    hasError,
    errorMessage,
    hasWarning,
    warningMessage,
    hasInfo,
    infoMessage,
  } = useField(useFormStore, name)

  // Determine helper text with severity priority: error > warning > info > custom
  let helperText = customHelperText
  let severity: 'error' | 'warning' | 'info' | undefined

  if (meta.touched) {
    if (hasError && errorMessage) {
      helperText = errorMessage
      severity = 'error'
    } else if (showWarnings && hasWarning && warningMessage) {
      helperText = warningMessage
      severity = 'warning'
    } else if (showInfo && hasInfo && infoMessage) {
      helperText = infoMessage
      severity = 'info'
    }
  }

  // Handle number type conversion
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    if (type === 'number') {
      // Convert to number, or undefined if empty
      const numValue = rawValue === '' ? undefined : Number(rawValue)
      onChange(numValue)
    } else {
      onChange(rawValue)
    }
  }

  // Format value for display
  const displayValue =
    type === 'number'
      ? value === undefined || value === null
        ? ''
        : String(value)
      : (value as string) ?? ''

  return (
    <MuiTextField
      {...muiProps}
      type={type}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      error={hasError}
      helperText={helperText}
      slotProps={{
        ...muiProps.slotProps,
        formHelperText: {
          ...muiProps.slotProps?.formHelperText,
          sx: {
            ...(typeof muiProps.slotProps?.formHelperText === 'object'
              ? (muiProps.slotProps.formHelperText as { sx?: object }).sx
              : {}),
            color:
              severity === 'warning'
                ? 'warning.main'
                : severity === 'info'
                  ? 'info.main'
                  : undefined,
          },
        },
        input: {
          ...muiProps.slotProps?.input,
          // Show loading indicator for async validation
          endAdornment: meta.validating ? (
            <span style={{ fontSize: '0.75rem', color: 'gray' }}>...</span>
          ) : (
            (muiProps.slotProps?.input as { endAdornment?: React.ReactNode })
              ?.endAdornment
          ),
        },
      }}
    />
  )
}
