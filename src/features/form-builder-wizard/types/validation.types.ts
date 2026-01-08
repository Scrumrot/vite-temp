export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  severity: ValidationSeverity
  path: (string | number)[]
  message: string
  code?: string
}

export interface TieredValidationResult<T> {
  success: boolean // Only false if errors exist (warnings/info don't block)
  data?: T
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  infos: ValidationIssue[]
}

export interface ValidationRuleConfig {
  field: string
  rule: string // e.g., '.min(0)', '.email()', '.max(100)'
  severity: ValidationSeverity
  message: string
  enabled: boolean
}
