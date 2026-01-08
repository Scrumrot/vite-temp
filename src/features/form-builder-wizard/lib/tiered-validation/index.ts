import { z } from 'zod'
import type {
  ValidationSeverity,
  ValidationIssue,
  TieredValidationResult,
} from '../../types'

// Symbol for storing severity metadata in Zod issues
const SEVERITY_KEY = Symbol.for('validation_severity')

/**
 * Add a validation rule with a specific severity level.
 * - 'error': Blocks form submission (default Zod behavior)
 * - 'warning': Shows warning but allows submission
 * - 'info': Shows informational hint
 */
export function withSeverity<T>(
  schema: z.ZodType<T>,
  severity: ValidationSeverity,
  check: (val: T) => boolean,
  message: string
): z.ZodType<T> {
  return schema.superRefine((val, ctx) => {
    if (!check(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        params: { [SEVERITY_KEY]: severity },
      })
    }
  }) as z.ZodType<T>
}

/**
 * Add a warning validation (non-blocking)
 */
export function withWarning<T>(
  schema: z.ZodType<T>,
  check: (val: T) => boolean,
  message: string
): z.ZodType<T> {
  return withSeverity(schema, 'warning', check, message)
}

/**
 * Add an info validation (hint)
 */
export function withInfo<T>(
  schema: z.ZodType<T>,
  check: (val: T) => boolean,
  message: string
): z.ZodType<T> {
  return withSeverity(schema, 'info', check, message)
}

/**
 * Get the severity from a Zod issue's params
 */
function getSeverity(issue: z.ZodIssue): ValidationSeverity {
  // In Zod 4, params is available on custom issues
  const params = (issue as { params?: Record<symbol, unknown> }).params
  const severity = params?.[SEVERITY_KEY]
  if (severity === 'warning' || severity === 'info') {
    return severity
  }
  return 'error'
}

/**
 * Parse data with tiered validation results.
 * Returns success=true if there are no errors (warnings/info don't block).
 */
export function tieredSafeParse<T>(
  schema: z.ZodType<T>,
  data: unknown
): TieredValidationResult<T> {
  const result = schema.safeParse(data)

  const issues: ValidationIssue[] = []

  if (!result.success) {
    for (const issue of result.error.issues) {
      const severity = getSeverity(issue)

      issues.push({
        severity,
        path: issue.path.map((p) => (typeof p === 'symbol' ? String(p) : p)),
        message: issue.message,
        code: issue.code,
      })
    }
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const infos = issues.filter((i) => i.severity === 'info')

  // Success if no blocking errors exist
  const success = errors.length === 0

  return {
    success,
    data: success ? (data as T) : undefined,
    issues,
    errors,
    warnings,
    infos,
  }
}

/**
 * Create a schema with multiple tiered validations
 */
export function createTieredValidations<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  validations: Array<{
    path: string
    severity: ValidationSeverity
    check: (data: z.infer<z.ZodObject<T>>) => boolean
    message: string
  }>
): z.ZodType<z.infer<z.ZodObject<T>>> {
  return baseSchema.superRefine((data, ctx) => {
    for (const validation of validations) {
      if (!validation.check(data)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: validation.path.split('.'),
          message: validation.message,
          params: { [SEVERITY_KEY]: validation.severity },
        })
      }
    }
  })
}

export { SEVERITY_KEY }
