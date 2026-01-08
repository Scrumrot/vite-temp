import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TieredValidationResult, ValidationIssue } from '../types'

interface ValidationDisplayProps {
  result: TieredValidationResult<unknown> | null
  showInfo?: boolean
  compact?: boolean
}

function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return 'Form'
  return path.map((p) => (typeof p === 'number' ? `[${p}]` : p)).join('.')
}

function IssueAlert({ issue, compact }: { issue: ValidationIssue; compact?: boolean }) {
  const severity = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info'

  if (compact) {
    return (
      <Alert severity={severity} sx={{ py: 0.5 }}>
        <Typography variant="body2">
          <strong>{formatPath(issue.path)}:</strong> {issue.message}
        </Typography>
      </Alert>
    )
  }

  return (
    <Alert severity={severity}>
      <Typography variant="body2">
        <strong>{formatPath(issue.path)}:</strong> {issue.message}
      </Typography>
    </Alert>
  )
}

export default function ValidationDisplay({
  result,
  showInfo = true,
  compact = false,
}: ValidationDisplayProps) {
  if (!result || result.issues.length === 0) {
    return null
  }

  return (
    <Stack spacing={compact ? 0.5 : 1}>
      {/* Errors - Always shown, blocking */}
      {result.errors.map((issue, i) => (
        <IssueAlert key={`error-${i}`} issue={issue} compact={compact} />
      ))}

      {/* Warnings - Yellow, non-blocking */}
      {result.warnings.map((issue, i) => (
        <IssueAlert key={`warning-${i}`} issue={issue} compact={compact} />
      ))}

      {/* Info - Blue hints, only if enabled */}
      {showInfo &&
        result.infos.map((issue, i) => (
          <IssueAlert key={`info-${i}`} issue={issue} compact={compact} />
        ))}
    </Stack>
  )
}
