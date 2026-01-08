import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import type { ValidationSeverity } from '../types'

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: 'string' | 'number' | 'common' | 'custom'
  rule: string
  params: Array<{
    name: string
    label: string
    type: 'number' | 'string' | 'boolean'
    default: string | number | boolean
    placeholder?: string
  }>
  defaultMessage: string
}

const RULE_TEMPLATES: RuleTemplate[] = [
  // String rules
  {
    id: 'min-length',
    name: 'Minimum Length',
    description: 'Require at least N characters',
    category: 'string',
    rule: '.min({value})',
    params: [{ name: 'value', label: 'Minimum characters', type: 'number', default: 1 }],
    defaultMessage: 'Must be at least {value} characters',
  },
  {
    id: 'max-length',
    name: 'Maximum Length',
    description: 'Allow at most N characters',
    category: 'string',
    rule: '.max({value})',
    params: [{ name: 'value', label: 'Maximum characters', type: 'number', default: 100 }],
    defaultMessage: 'Must be at most {value} characters',
  },
  {
    id: 'email',
    name: 'Email Format',
    description: 'Must be a valid email address',
    category: 'string',
    rule: '.email()',
    params: [],
    defaultMessage: 'Must be a valid email address',
  },
  {
    id: 'url',
    name: 'URL Format',
    description: 'Must be a valid URL',
    category: 'string',
    rule: '.url()',
    params: [],
    defaultMessage: 'Must be a valid URL',
  },
  {
    id: 'regex',
    name: 'Regex Pattern',
    description: 'Must match a regular expression',
    category: 'string',
    rule: '.regex(/{pattern}/)',
    params: [{ name: 'pattern', label: 'Regex pattern', type: 'string', default: '', placeholder: '^[A-Z].*' }],
    defaultMessage: 'Must match the required pattern',
  },
  {
    id: 'starts-with',
    name: 'Starts With',
    description: 'Must start with a specific prefix',
    category: 'string',
    rule: '.startsWith("{value}")',
    params: [{ name: 'value', label: 'Prefix', type: 'string', default: '' }],
    defaultMessage: 'Must start with "{value}"',
  },
  {
    id: 'ends-with',
    name: 'Ends With',
    description: 'Must end with a specific suffix',
    category: 'string',
    rule: '.endsWith("{value}")',
    params: [{ name: 'value', label: 'Suffix', type: 'string', default: '' }],
    defaultMessage: 'Must end with "{value}"',
  },
  // Number rules
  {
    id: 'min-number',
    name: 'Minimum Value',
    description: 'Must be at least N',
    category: 'number',
    rule: '.min({value})',
    params: [{ name: 'value', label: 'Minimum value', type: 'number', default: 0 }],
    defaultMessage: 'Must be at least {value}',
  },
  {
    id: 'max-number',
    name: 'Maximum Value',
    description: 'Must be at most N',
    category: 'number',
    rule: '.max({value})',
    params: [{ name: 'value', label: 'Maximum value', type: 'number', default: 100 }],
    defaultMessage: 'Must be at most {value}',
  },
  {
    id: 'positive',
    name: 'Positive Number',
    description: 'Must be greater than 0',
    category: 'number',
    rule: '.positive()',
    params: [],
    defaultMessage: 'Must be a positive number',
  },
  {
    id: 'negative',
    name: 'Negative Number',
    description: 'Must be less than 0',
    category: 'number',
    rule: '.negative()',
    params: [],
    defaultMessage: 'Must be a negative number',
  },
  {
    id: 'int',
    name: 'Integer',
    description: 'Must be a whole number',
    category: 'number',
    rule: '.int()',
    params: [],
    defaultMessage: 'Must be a whole number',
  },
  // Common rules
  {
    id: 'required',
    name: 'Required',
    description: 'Field cannot be empty',
    category: 'common',
    rule: '.min(1)',
    params: [],
    defaultMessage: 'This field is required',
  },
  {
    id: 'nonempty',
    name: 'Non-empty',
    description: 'Cannot be an empty string',
    category: 'common',
    rule: '.nonempty()',
    params: [],
    defaultMessage: 'Cannot be empty',
  },
  // Custom
  {
    id: 'custom',
    name: 'Custom Rule',
    description: 'Write your own Zod validation rule',
    category: 'custom',
    rule: '{custom}',
    params: [{ name: 'custom', label: 'Custom rule', type: 'string', default: '.min(1)', placeholder: '.min(1).max(100)' }],
    defaultMessage: 'Validation failed',
  },
]

const CATEGORIES = [
  { id: 'common', label: 'Common' },
  { id: 'string', label: 'String' },
  { id: 'number', label: 'Number' },
  { id: 'custom', label: 'Custom' },
]

// Step-by-step builder Zod methods
interface ZodMethod {
  id: string
  name: string
  description: string
  category: 'string' | 'number' | 'array' | 'date' | 'transform'
  hasParam: boolean
  paramType?: 'number' | 'string' | 'regex'
  paramLabel?: string
  paramPlaceholder?: string
  code: string
  defaultMessage: string
}

const ZOD_METHODS: ZodMethod[] = [
  // String methods
  { id: 's-min', name: 'min', description: 'Minimum string length', category: 'string', hasParam: true, paramType: 'number', paramLabel: 'Min length', code: '.min({param})', defaultMessage: 'Must be at least {param} characters' },
  { id: 's-max', name: 'max', description: 'Maximum string length', category: 'string', hasParam: true, paramType: 'number', paramLabel: 'Max length', code: '.max({param})', defaultMessage: 'Must be at most {param} characters' },
  { id: 's-length', name: 'length', description: 'Exact string length', category: 'string', hasParam: true, paramType: 'number', paramLabel: 'Length', code: '.length({param})', defaultMessage: 'Must be exactly {param} characters' },
  { id: 's-email', name: 'email', description: 'Valid email format', category: 'string', hasParam: false, code: '.email()', defaultMessage: 'Must be a valid email' },
  { id: 's-url', name: 'url', description: 'Valid URL format', category: 'string', hasParam: false, code: '.url()', defaultMessage: 'Must be a valid URL' },
  { id: 's-uuid', name: 'uuid', description: 'Valid UUID format', category: 'string', hasParam: false, code: '.uuid()', defaultMessage: 'Must be a valid UUID' },
  { id: 's-cuid', name: 'cuid', description: 'Valid CUID format', category: 'string', hasParam: false, code: '.cuid()', defaultMessage: 'Must be a valid CUID' },
  { id: 's-regex', name: 'regex', description: 'Match regex pattern', category: 'string', hasParam: true, paramType: 'regex', paramLabel: 'Pattern', paramPlaceholder: '^[A-Z].*', code: '.regex(/{param}/)', defaultMessage: 'Must match the pattern' },
  { id: 's-includes', name: 'includes', description: 'Must include substring', category: 'string', hasParam: true, paramType: 'string', paramLabel: 'Substring', code: '.includes("{param}")', defaultMessage: 'Must include "{param}"' },
  { id: 's-startsWith', name: 'startsWith', description: 'Must start with prefix', category: 'string', hasParam: true, paramType: 'string', paramLabel: 'Prefix', code: '.startsWith("{param}")', defaultMessage: 'Must start with "{param}"' },
  { id: 's-endsWith', name: 'endsWith', description: 'Must end with suffix', category: 'string', hasParam: true, paramType: 'string', paramLabel: 'Suffix', code: '.endsWith("{param}")', defaultMessage: 'Must end with "{param}"' },
  { id: 's-nonempty', name: 'nonempty', description: 'Cannot be empty string', category: 'string', hasParam: false, code: '.nonempty()', defaultMessage: 'Cannot be empty' },
  { id: 's-trim', name: 'trim', description: 'Trim whitespace', category: 'string', hasParam: false, code: '.trim()', defaultMessage: '' },
  { id: 's-toLowerCase', name: 'toLowerCase', description: 'Convert to lowercase', category: 'string', hasParam: false, code: '.toLowerCase()', defaultMessage: '' },
  { id: 's-toUpperCase', name: 'toUpperCase', description: 'Convert to uppercase', category: 'string', hasParam: false, code: '.toUpperCase()', defaultMessage: '' },

  // Number methods
  { id: 'n-min', name: 'min', description: 'Minimum value (>=)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Min value', code: '.min({param})', defaultMessage: 'Must be at least {param}' },
  { id: 'n-max', name: 'max', description: 'Maximum value (<=)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Max value', code: '.max({param})', defaultMessage: 'Must be at most {param}' },
  { id: 'n-gt', name: 'gt', description: 'Greater than (>)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Value', code: '.gt({param})', defaultMessage: 'Must be greater than {param}' },
  { id: 'n-gte', name: 'gte', description: 'Greater than or equal (>=)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Value', code: '.gte({param})', defaultMessage: 'Must be at least {param}' },
  { id: 'n-lt', name: 'lt', description: 'Less than (<)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Value', code: '.lt({param})', defaultMessage: 'Must be less than {param}' },
  { id: 'n-lte', name: 'lte', description: 'Less than or equal (<=)', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Value', code: '.lte({param})', defaultMessage: 'Must be at most {param}' },
  { id: 'n-int', name: 'int', description: 'Must be integer', category: 'number', hasParam: false, code: '.int()', defaultMessage: 'Must be a whole number' },
  { id: 'n-positive', name: 'positive', description: 'Must be positive (> 0)', category: 'number', hasParam: false, code: '.positive()', defaultMessage: 'Must be positive' },
  { id: 'n-nonnegative', name: 'nonnegative', description: 'Must be non-negative (>= 0)', category: 'number', hasParam: false, code: '.nonnegative()', defaultMessage: 'Must be non-negative' },
  { id: 'n-negative', name: 'negative', description: 'Must be negative (< 0)', category: 'number', hasParam: false, code: '.negative()', defaultMessage: 'Must be negative' },
  { id: 'n-nonpositive', name: 'nonpositive', description: 'Must be non-positive (<= 0)', category: 'number', hasParam: false, code: '.nonpositive()', defaultMessage: 'Must be non-positive' },
  { id: 'n-multipleOf', name: 'multipleOf', description: 'Must be multiple of N', category: 'number', hasParam: true, paramType: 'number', paramLabel: 'Multiple of', code: '.multipleOf({param})', defaultMessage: 'Must be a multiple of {param}' },
  { id: 'n-finite', name: 'finite', description: 'Must be finite', category: 'number', hasParam: false, code: '.finite()', defaultMessage: 'Must be a finite number' },
  { id: 'n-safe', name: 'safe', description: 'Safe integer range', category: 'number', hasParam: false, code: '.safe()', defaultMessage: 'Must be a safe integer' },

  // Array methods
  { id: 'a-min', name: 'min', description: 'Minimum array length', category: 'array', hasParam: true, paramType: 'number', paramLabel: 'Min items', code: '.min({param})', defaultMessage: 'Must have at least {param} items' },
  { id: 'a-max', name: 'max', description: 'Maximum array length', category: 'array', hasParam: true, paramType: 'number', paramLabel: 'Max items', code: '.max({param})', defaultMessage: 'Must have at most {param} items' },
  { id: 'a-length', name: 'length', description: 'Exact array length', category: 'array', hasParam: true, paramType: 'number', paramLabel: 'Length', code: '.length({param})', defaultMessage: 'Must have exactly {param} items' },
  { id: 'a-nonempty', name: 'nonempty', description: 'Cannot be empty array', category: 'array', hasParam: false, code: '.nonempty()', defaultMessage: 'Cannot be empty' },

  // Date methods
  { id: 'd-min', name: 'min', description: 'Minimum date', category: 'date', hasParam: true, paramType: 'string', paramLabel: 'Min date (ISO)', paramPlaceholder: '2024-01-01', code: '.min(new Date("{param}"))', defaultMessage: 'Must be after {param}' },
  { id: 'd-max', name: 'max', description: 'Maximum date', category: 'date', hasParam: true, paramType: 'string', paramLabel: 'Max date (ISO)', paramPlaceholder: '2025-12-31', code: '.max(new Date("{param}"))', defaultMessage: 'Must be before {param}' },
]

const ZOD_CATEGORIES = [
  { id: 'string', label: 'String', icon: 'Aa' },
  { id: 'number', label: 'Number', icon: '#' },
  { id: 'array', label: 'Array', icon: '[]' },
  { id: 'date', label: 'Date', icon: '📅' },
]

interface RuleWizardDialogProps {
  open: boolean
  onClose: () => void
  onSave: (rule: { rule: string; message: string; severity: ValidationSeverity }) => void
  initialRule?: string
  initialMessage?: string
  initialSeverity?: ValidationSeverity
}

export default function RuleWizardDialog({
  open,
  onClose,
  onSave,
  initialRule: _initialRule = '',
  initialMessage = '',
  initialSeverity = 'error',
}: RuleWizardDialogProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState(0)

  // Template mode state
  const [activeStep, setActiveStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('common')
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, string | number | boolean>>({})
  const [severity, setSeverity] = useState<ValidationSeverity>(initialSeverity)
  const [message, setMessage] = useState(initialMessage)

  // Step-by-step mode state
  const [builderStep, setBuilderStep] = useState(0)
  const [builderCategory, setBuilderCategory] = useState<string>('string')
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [methodParams, setMethodParams] = useState<Record<string, string | number>>({})
  const [builderSeverity, setBuilderSeverity] = useState<ValidationSeverity>(initialSeverity)
  const [builderMessage, setBuilderMessage] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(0)
      setActiveStep(0)
      setSelectedCategory('common')
      setSelectedTemplate(null)
      setParamValues({})
      setSeverity(initialSeverity)
      setMessage(initialMessage)
      setBuilderStep(0)
      setBuilderCategory('string')
      setSelectedMethods([])
      setMethodParams({})
      setBuilderSeverity(initialSeverity)
      setBuilderMessage('')
    }
  }, [open, initialSeverity, initialMessage])

  // Template mode handlers
  const filteredTemplates = RULE_TEMPLATES.filter((t) => t.category === selectedCategory)

  const handleSelectTemplate = (template: RuleTemplate) => {
    setSelectedTemplate(template)
    const defaults: Record<string, string | number | boolean> = {}
    template.params.forEach((p) => {
      defaults[p.name] = p.default
    })
    setParamValues(defaults)
    setMessage(template.defaultMessage)
    setActiveStep(1)
  }

  const handleParamChange = (name: string, value: string | number | boolean) => {
    setParamValues((prev) => ({ ...prev, [name]: value }))
  }

  const buildRule = (): string => {
    if (!selectedTemplate) return ''
    let rule = selectedTemplate.rule
    selectedTemplate.params.forEach((param) => {
      const value = paramValues[param.name] ?? param.default
      rule = rule.replace(`{${param.name}}`, String(value))
    })
    return rule
  }

  const buildMessage = (): string => {
    if (!selectedTemplate) return message
    let msg = message || selectedTemplate.defaultMessage
    selectedTemplate.params.forEach((param) => {
      const value = paramValues[param.name] ?? param.default
      msg = msg.replace(`{${param.name}}`, String(value))
    })
    return msg
  }

  const handleSaveTemplate = () => {
    onSave({
      rule: buildRule(),
      message: buildMessage(),
      severity,
    })
    onClose()
  }

  // Step-by-step builder handlers
  const filteredMethods = ZOD_METHODS.filter((m) => m.category === builderCategory)

  const handleToggleMethod = (methodId: string) => {
    setSelectedMethods((prev) => {
      if (prev.includes(methodId)) {
        return prev.filter((id) => id !== methodId)
      }
      return [...prev, methodId]
    })
  }

  const handleMethodParamChange = (methodId: string, value: string | number) => {
    setMethodParams((prev) => ({ ...prev, [methodId]: value }))
  }

  const buildBuilderRule = (): string => {
    if (selectedMethods.length === 0) return ''

    return selectedMethods
      .map((methodId) => {
        const method = ZOD_METHODS.find((m) => m.id === methodId)
        if (!method) return ''

        let code = method.code
        if (method.hasParam) {
          const param = methodParams[methodId] ?? ''
          code = code.replace('{param}', String(param))
        }
        return code
      })
      .join('')
  }

  const buildBuilderMessage = (): string => {
    if (builderMessage) return builderMessage

    // Auto-generate message from selected methods
    const messages = selectedMethods
      .map((methodId) => {
        const method = ZOD_METHODS.find((m) => m.id === methodId)
        if (!method || !method.defaultMessage) return null

        let msg = method.defaultMessage
        if (method.hasParam) {
          const param = methodParams[methodId] ?? ''
          msg = msg.replace('{param}', String(param))
        }
        return msg
      })
      .filter(Boolean)

    return messages.join('; ')
  }

  const handleSaveBuilder = () => {
    onSave({
      rule: buildBuilderRule(),
      message: buildBuilderMessage(),
      severity: builderSeverity,
    })
    onClose()
  }

  const canProceedToStep2 = selectedTemplate !== null
  const canSaveTemplate = selectedTemplate !== null
  const canProceedBuilder = selectedMethods.length > 0
  const hasMethodsWithParams = selectedMethods.some((id) => {
    const method = ZOD_METHODS.find((m) => m.id === id)
    return method?.hasParam
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Rule Creation Wizard</DialogTitle>
      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Templates" />
          <Tab label="Step-by-Step Builder" />
        </Tabs>

        {/* TEMPLATES TAB */}
        {activeTab === 0 && (
          <Box>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Select Rule Type</StepLabel>
              </Step>
              <Step>
                <StepLabel>Configure Rule</StepLabel>
              </Step>
            </Stepper>

            {activeStep === 0 && (
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {CATEGORIES.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      onClick={() => setSelectedCategory(cat.id)}
                      color={selectedCategory === cat.id ? 'primary' : 'default'}
                      variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>

                <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {filteredTemplates.map((template) => (
                    <Paper
                      key={template.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        border: selectedTemplate?.id === template.id ? 2 : 1,
                        borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                      }}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', color: 'primary.main', display: 'block', mt: 0.5 }}
                      >
                        {template.rule}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {activeStep === 1 && selectedTemplate && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">{selectedTemplate.name}</Typography>
                  <Typography variant="body2">{selectedTemplate.description}</Typography>
                </Alert>

                <Stack spacing={2.5}>
                  {selectedTemplate.params.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Parameters
                      </Typography>
                      <Stack spacing={2}>
                        {selectedTemplate.params.map((param) => (
                          <TextField
                            key={param.name}
                            label={param.label}
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={paramValues[param.name] ?? param.default}
                            onChange={(e) =>
                              handleParamChange(
                                param.name,
                                param.type === 'number' ? Number(e.target.value) : e.target.value
                              )
                            }
                            placeholder={param.placeholder}
                            size="small"
                            fullWidth
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <FormControl fullWidth size="small">
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={severity}
                      label="Severity"
                      onChange={(e) => setSeverity(e.target.value as ValidationSeverity)}
                    >
                      <MenuItem value="error">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                          <span>Error (blocks submission)</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="warning">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <span>Warning (allows submission)</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="info">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                          <span>Info (hint only)</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Validation Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    helperText="Use {value} to include parameter values"
                  />

                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                      {buildRule()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Message: "{buildMessage()}"
                    </Typography>
                  </Paper>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* STEP-BY-STEP BUILDER TAB */}
        {activeTab === 1 && (
          <Box>
            <Stepper activeStep={builderStep} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Select Type</StepLabel>
              </Step>
              <Step>
                <StepLabel>Choose Methods</StepLabel>
              </Step>
              <Step>
                <StepLabel>Configure</StepLabel>
              </Step>
              <Step>
                <StepLabel>Finalize</StepLabel>
              </Step>
            </Stepper>

            {/* Step 1: Select Type */}
            {builderStep === 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  What type of value are you validating?
                </Typography>
                <Stack spacing={1}>
                  {ZOD_CATEGORIES.map((cat) => (
                    <Paper
                      key={cat.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        border: builderCategory === cat.id ? 2 : 1,
                        borderColor: builderCategory === cat.id ? 'primary.main' : 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                      onClick={() => {
                        setBuilderCategory(cat.id)
                        setBuilderStep(1)
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        }}
                      >
                        {cat.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">{cat.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          z.{cat.id}() methods
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Step 2: Choose Methods */}
            {builderStep === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the validation methods to apply (you can select multiple):
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {filteredMethods.map((method) => (
                    <Paper
                      key={method.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        border: selectedMethods.includes(method.id) ? 2 : 1,
                        borderColor: selectedMethods.includes(method.id) ? 'primary.main' : 'divider',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMethods.includes(method.id)}
                            onChange={() => handleToggleMethod(method.id)}
                          />
                        }
                        label={
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography
                                variant="subtitle2"
                                sx={{ fontFamily: 'monospace', color: 'primary.main' }}
                              >
                                .{method.name}()
                              </Typography>
                              {method.hasParam && (
                                <Chip label="has param" size="small" variant="outlined" />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                      />
                    </Paper>
                  ))}
                </Stack>

                {selectedMethods.length > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Selected: {selectedMethods.map((id) => {
                        const m = ZOD_METHODS.find((m) => m.id === id)
                        return `.${m?.name}()`
                      }).join('')}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Step 3: Configure Parameters */}
            {builderStep === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure the parameters for your selected methods:
                </Typography>

                {hasMethodsWithParams ? (
                  <Stack spacing={2}>
                    {selectedMethods.map((methodId) => {
                      const method = ZOD_METHODS.find((m) => m.id === methodId)
                      if (!method?.hasParam) return null

                      return (
                        <Paper key={methodId} variant="outlined" sx={{ p: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontFamily: 'monospace', color: 'primary.main', mb: 1 }}
                          >
                            .{method.name}()
                          </Typography>
                          <TextField
                            label={method.paramLabel}
                            type={method.paramType === 'number' ? 'number' : 'text'}
                            value={methodParams[methodId] ?? ''}
                            onChange={(e) =>
                              handleMethodParamChange(
                                methodId,
                                method.paramType === 'number' ? Number(e.target.value) : e.target.value
                              )
                            }
                            placeholder={method.paramPlaceholder}
                            size="small"
                            fullWidth
                          />
                        </Paper>
                      )
                    })}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    No parameters needed for the selected methods. Click Next to continue.
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Rule Preview
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {buildBuilderRule() || '(no rule yet)'}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Step 4: Finalize */}
            {builderStep === 3 && (
              <Box>
                <Stack spacing={2.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={builderSeverity}
                      label="Severity"
                      onChange={(e) => setBuilderSeverity(e.target.value as ValidationSeverity)}
                    >
                      <MenuItem value="error">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                          <span>Error (blocks submission)</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="warning">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <span>Warning (allows submission)</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="info">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                          <span>Info (hint only)</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Validation Message"
                    value={builderMessage}
                    onChange={(e) => setBuilderMessage(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder={buildBuilderMessage()}
                    helperText="Leave empty to auto-generate from selected methods"
                  />

                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Final Preview
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                      {buildBuilderRule()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Message: "{buildBuilderMessage()}"
                    </Typography>
                    <Chip
                      label={builderSeverity}
                      size="small"
                      color={
                        builderSeverity === 'error'
                          ? 'error'
                          : builderSeverity === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        {/* Template tab actions */}
        {activeTab === 0 && (
          <>
            {activeStep === 1 && <Button onClick={() => setActiveStep(0)}>Back</Button>}
            {activeStep === 0 && (
              <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!canProceedToStep2}>
                Next
              </Button>
            )}
            {activeStep === 1 && (
              <Button variant="contained" onClick={handleSaveTemplate} disabled={!canSaveTemplate}>
                Add Rule
              </Button>
            )}
          </>
        )}

        {/* Step-by-step builder tab actions */}
        {activeTab === 1 && (
          <>
            {builderStep > 0 && <Button onClick={() => setBuilderStep((s) => s - 1)}>Back</Button>}
            {builderStep < 3 && (
              <Button
                variant="contained"
                onClick={() => setBuilderStep((s) => s + 1)}
                disabled={builderStep === 1 && !canProceedBuilder}
              >
                Next
              </Button>
            )}
            {builderStep === 3 && (
              <Button variant="contained" onClick={handleSaveBuilder} disabled={!canProceedBuilder}>
                Add Rule
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
