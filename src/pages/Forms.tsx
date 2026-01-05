import { useState, useMemo } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DynamicFormIcon from '@mui/icons-material/DynamicForm'
import { useNavigate } from 'react-router-dom'
import ThemeEditorForm from '../components/ThemeEditorForm.tsx';

// Auto-import all form components from the forms folder
const formModules = import.meta.glob('../components/forms/*.forms.tsx', { eager: true }) as Record<
  string,
  Record<string, React.ComponentType<unknown>>
>

interface FormInfo {
  name: string
  component: React.ComponentType<{ onSubmit?: (data: unknown) => void }>
}

// Extract form components from modules
function getFormsFromModules(): FormInfo[] {
  const forms: FormInfo[] = []

  for (const [, module] of Object.entries(formModules)) {
    // Get all exported components (skip non-component exports)
    for (const [exportName, exportValue] of Object.entries(module)) {
      if (
        typeof exportValue === 'function' &&
        exportName.endsWith('Form') &&
        !exportName.endsWith('Props')
      ) {
        forms.push({
          name: exportName,
          component: exportValue as React.ComponentType<{ onSubmit?: (data: unknown) => void }>,
        })
      }
    }
  }

  return forms.sort((a, b) => a.name.localeCompare(b.name))
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Forms() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const forms = useMemo(() => getFormsFromModules(), [])

  const handleSubmit = (formName: string) => (data: unknown) => {
    console.log(`${formName} submitted:`, data)
    alert(`${formName} submitted! Check console for data.`)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <DynamicFormIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Forms
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {forms.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No forms found. Generate forms using: npm run generate-form
          </Typography>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {forms.map((form) => (
                  <Tab key={form.name} label={form.name.replace('Form', '')} />
                ))}
              </Tabs>
            </Box>

            {forms.map((form, index) => {
              const FormComponent = form.component
              return (
                <TabPanel key={form.name} value={activeTab} index={index}>
                  <Typography variant="h5" gutterBottom>
                    {form.name.replace('Form', '')}
                  </Typography>
                  <FormComponent onSubmit={handleSubmit(form.name)} />
                </TabPanel>
              )
            })}
          </>
        )}
        <ThemeEditorForm/>
      </Container>
    </Box>
  )
}
