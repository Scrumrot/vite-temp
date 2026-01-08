import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { type SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import type { z } from 'zod'
import { useField } from '../hooks/useField'
import type { FormStoreHook } from '../types'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface FormSelectFieldProps<
  TSchema extends z.ZodObject<z.ZodRawShape>,
> extends Omit<
    SelectProps,
    'value' | 'onChange' | 'onBlur' | 'error' | 'name'
  > {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Field label */
  label: string
  /** Select options */
  options: SelectOption[]
  /** Whether the field is required */
  required?: boolean
  /** Custom helper text (overridden by validation messages) */
  helperText?: string
  /** Show warnings as helper text when no errors (default: true) */
  showWarnings?: boolean
  /** Full width (default: true) */
  fullWidth?: boolean
}

/**
 * MUI Select integrated with zustand-form.
 * Automatically handles value binding, validation, and error display.
 *
 * @example
 * ```tsx
 * <FormSelectField
 *   useFormStore={useUserForm}
 *   name="role"
 *   label="Role"
 *   required
 *   options={[
 *     { value: 'admin', label: 'Admin' },
 *     { value: 'user', label: 'User' },
 *     { value: 'guest', label: 'Guest' },
 *   ]}
 * />
 * ```
 */
export const FormSelectField = <TSchema extends z.ZodObject<z.ZodRawShape>>({
  useFormStore,
  name,
  label,
  options,
  required,
  helperText: customHelperText,
  showWarnings = true,
  fullWidth = true,
  ...selectProps
}: FormSelectFieldProps<TSchema>): React.ReactNode => {
  const {
    value,
    onChange,
    onBlur,
    meta,
    hasError,
    errorMessage,
    hasWarning,
    warningMessage,
  } = useField(useFormStore, name)

  // Determine helper text with severity priority
  let helperText = customHelperText
  let severity: 'error' | 'warning' | undefined

  if (meta.touched) {
    if (hasError && errorMessage) {
      helperText = errorMessage
      severity = 'error'
    } else if (showWarnings && hasWarning && warningMessage) {
      helperText = warningMessage
      severity = 'warning'
    }
  }

  return (
    <FormControl fullWidth={fullWidth} error={hasError} required={required}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        {...selectProps}
        labelId={`${name}-label`}
        name={name}
        value={value ?? ''}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText
          sx={{
            color:
              severity === 'warning'
                ? 'warning.main'
                : severity === 'error'
                  ? undefined
                  : undefined,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
