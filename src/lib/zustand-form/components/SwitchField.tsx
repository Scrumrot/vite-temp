import FormControlLabel from '@mui/material/FormControlLabel'
import Switch, { type SwitchProps } from '@mui/material/Switch'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import type { z } from 'zod'
import { useField } from '../hooks/useField'
import type { FormStoreHook } from '../types'

export interface FormSwitchFieldProps<
  TSchema extends z.ZodObject<z.ZodRawShape>,
> extends Omit<SwitchProps, 'checked' | 'onChange' | 'onBlur' | 'name'> {
  /** The form store hook */
  useFormStore: FormStoreHook<TSchema>
  /** Field path in the form values */
  name: string
  /** Field label */
  label: string
  /** Custom helper text (overridden by validation messages) */
  helperText?: string
  /** Label placement (default: 'end') */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom'
}

/**
 * MUI Switch integrated with zustand-form.
 * Automatically handles boolean value binding and validation.
 *
 * @example
 * ```tsx
 * <FormSwitchField
 *   useFormStore={useUserForm}
 *   name="isActive"
 *   label="Active"
 * />
 * ```
 */
export const FormSwitchField = <TSchema extends z.ZodObject<z.ZodRawShape>>({
  useFormStore,
  name,
  label,
  helperText: customHelperText,
  labelPlacement = 'end',
  ...switchProps
}: FormSwitchFieldProps<TSchema>): React.ReactNode => {
  const { value, onChange, onBlur, meta, hasError, errorMessage } = useField(
    useFormStore,
    name
  )

  // Determine helper text
  const helperText = meta.touched && hasError ? errorMessage : customHelperText

  return (
    <FormControl error={hasError}>
      <FormControlLabel
        control={
          <Switch
            {...switchProps}
            name={name}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
          />
        }
        label={label}
        labelPlacement={labelPlacement}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
