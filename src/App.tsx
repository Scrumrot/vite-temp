import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ThemeEditorForm from './components/ThemeEditorForm'
import { useThemeStore } from './stores/themeStore'

function App() {
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const { config } = useThemeStore()

  return (
    <Box
      className="min-h-screen p-8"
      sx={{ backgroundColor: 'background.default' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Typography
          variant="h3"
          component="h1"
          className="mb-8 text-center font-bold"
        >
          Vite + React + MUI + Tailwind
        </Typography>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            centered
          >
            <Tab label="Demo" />
            <Tab label="Theme Editor" />
          </Tabs>
        </Box>

        {/* Demo Tab */}
        {activeTab === 0 && (
          <>
            {/* MUI Card with Tailwind utility classes */}
            <Card className="mb-6 shadow-xl">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  MUI + Tailwind Integration Demo
                </Typography>
                <Typography variant="body1" color="text.secondary" className="mb-4">
                  This template demonstrates how to use MUI components alongside
                  Tailwind CSS utilities. MUI v7 supports CSS layers, allowing
                  Tailwind classes to override MUI styles without{' '}
                  <code className="bg-gray-100 px-1 rounded">!important</code>.
                </Typography>

                {/* Counter with MUI Button */}
                <Stack direction="row" spacing={2} alignItems="center" className="mb-4">
                  <Button
                    variant="contained"
                    onClick={() => setCount((c) => c + 1)}
                  >
                    Count: {count}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCount(0)}
                  >
                    Reset
                  </Button>
                  <Button variant="contained" color="secondary">
                    Secondary
                  </Button>
                  <Button variant="contained" color="success">
                    Success
                  </Button>
                </Stack>

                {/* MUI TextField with Tailwind wrapper */}
                <div className="mt-4">
                  <TextField
                    fullWidth
                    label="Enter something"
                    variant="outlined"
                    placeholder="Type here..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pure Tailwind card for comparison */}
            <Card className="shadow-xl">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Pure Tailwind Card
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  This card is styled entirely with Tailwind CSS utilities, showing
                  both libraries can coexist seamlessly.
                </Typography>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{
                      backgroundColor: config.primary,
                      borderRadius: `${config.borderRadius}px`,
                    }}
                  >
                    Primary (Tailwind)
                  </button>
                  <button
                    className="px-4 py-2 border rounded-lg transition-colors"
                    style={{
                      borderColor: config.secondary,
                      color: config.secondary,
                      borderRadius: `${config.borderRadius}px`,
                    }}
                  >
                    Secondary (Tailwind)
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Theme Editor Tab */}
        {activeTab === 1 && <ThemeEditorForm />}

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          className="text-center mt-8"
        >
          Built with Vite 7.3.0 • React 19.2.3 • MUI 7.3.6 • Tailwind 4.1.18
        </Typography>
      </div>
    </Box>
  )
}

export default App
