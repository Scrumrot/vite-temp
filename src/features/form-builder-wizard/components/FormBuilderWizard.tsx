import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFormBuilderWizardStore, STEP_ORDER } from '../stores/formBuilderWizardStore'
import type { WizardStep } from '../types'

import TypeInputStep from './steps/TypeInputStep'
import SchemaPreviewStep from './steps/SchemaPreviewStep'
import StoreConfigStep from './steps/StoreConfigStep'
import FormPreviewStep from './steps/FormPreviewStep'
import ExportStep from './steps/ExportStep'

const STEP_LABELS: Record<WizardStep, string> = {
  'type-input': 'Type Input',
  'schema-preview': 'Schema Preview',
  'store-config': 'Store Config',
  'form-preview': 'Form Preview',
  export: 'Export',
}

export function FormBuilderWizard() {
  const { currentStep, completedSteps, nextStep, prevStep, canProceed, resetWizard } =
    useFormBuilderWizardStore()

  const currentStepIndex = STEP_ORDER.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1

  const renderStep = () => {
    switch (currentStep) {
      case 'type-input':
        return <TypeInputStep />
      case 'schema-preview':
        return <SchemaPreviewStep />
      case 'store-config':
        return <StoreConfigStep />
      case 'form-preview':
        return <FormPreviewStep />
      case 'export':
        return <ExportStep />
      default:
        return null
    }
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Form Builder Wizard
        </Typography>
        <Button variant="outlined" color="secondary" onClick={resetWizard}>
          Reset
        </Button>
      </Stack>

      <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
        {STEP_ORDER.map((step) => (
          <Step key={step} completed={completedSteps.includes(step)}>
            <StepLabel>{STEP_LABELS[step]}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, minHeight: 400 }}>{renderStep()}</Paper>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={prevStep} disabled={isFirstStep}>
          Back
        </Button>

        <Button variant="contained" onClick={nextStep} disabled={!canProceed() || isLastStep}>
          {isLastStep ? 'Done' : 'Next'}
        </Button>
      </Stack>
    </Box>
  )
}
