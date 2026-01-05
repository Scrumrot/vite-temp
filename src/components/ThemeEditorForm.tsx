import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import {
  useThemeStore,
  generateThemeFile,
  generateTailwindConfig,
  themePresets,
  type ThemeConfig,
} from '../stores/themeStore'

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <Box className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 rounded cursor-pointer border-2 border-gray-200"
      />
      <Box className="flex-1">
        <Typography variant="body2" className="text-gray-600 mb-1">
          {label}
        </Typography>
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
      </Box>
    </Box>
  )
}

export default function ThemeEditorForm() {
  const { config, updateConfig, resetConfig } = useThemeStore()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportTab, setExportTab] = useState(0)

  const handleColorChange = (key: keyof ThemeConfig) => (value: string) => {
    updateConfig({ [key]: value })
  }

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const muiThemeCode = generateThemeFile(config)
  const tailwindCode = generateTailwindConfig(config)

  return (
    <>
      <Card className="shadow-xl">
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Theme Editor
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-6">
            Customize your theme and export the configuration files.
          </Typography>

          {/* Theme Presets */}
          <Box className="mb-6">
            <FormControl fullWidth size="small">
              <InputLabel>Load Theme Preset</InputLabel>
              <Select
                label="Load Theme Preset"
                value=""
                onChange={(e) => {
                  const preset = themePresets.find((p) => p.name === e.target.value)
                  if (preset) {
                    updateConfig(preset.config)
                  }
                }}
              >
                {themePresets.map((preset) => (
                  <MenuItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider className="my-4" />

          {/* Mode Toggle */}
          <Box className="mb-6">
            <FormControlLabel
              control={
                <Switch
                  checked={config.mode === 'dark'}
                  onChange={(e) =>
                    updateConfig({
                      mode: e.target.checked ? 'dark' : 'light',
                      background: e.target.checked ? '#121212' : '#ffffff',
                      paper: e.target.checked ? '#1e1e1e' : '#f5f5f5',
                      text: e.target.checked ? '#ffffff' : '#212121',
                    })
                  }
                />
              }
              label="Dark Mode"
            />
          </Box>

          <Divider className="my-4" />

          {/* Color Palette */}
          <Typography variant="h6" className="mb-4">
            Color Palette
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ColorInput
              label="Primary"
              value={config.primary}
              onChange={handleColorChange('primary')}
            />
            <ColorInput
              label="Secondary"
              value={config.secondary}
              onChange={handleColorChange('secondary')}
            />
            <ColorInput
              label="Error"
              value={config.error}
              onChange={handleColorChange('error')}
            />
            <ColorInput
              label="Warning"
              value={config.warning}
              onChange={handleColorChange('warning')}
            />
            <ColorInput
              label="Info"
              value={config.info}
              onChange={handleColorChange('info')}
            />
            <ColorInput
              label="Success"
              value={config.success}
              onChange={handleColorChange('success')}
            />
          </Box>

          <Divider className="my-4" />

          {/* Background Colors */}
          <Typography variant="h6" className="mb-4">
            Background
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ColorInput
              label="Background"
              value={config.background}
              onChange={handleColorChange('background')}
            />
            <ColorInput
              label="Paper/Surface"
              value={config.paper}
              onChange={handleColorChange('paper')}
            />
            <ColorInput
              label="Text Color"
              value={config.text}
              onChange={handleColorChange('text')}
            />
          </Box>

          <Divider className="my-4" />

          {/* Typography */}
          <Typography variant="h6" className="mb-4">
            Typography
          </Typography>
          <Box className="mb-6">
            <TextField
              label="Font Family"
              value={config.fontFamily}
              onChange={(e) => updateConfig({ fontFamily: e.target.value })}
              fullWidth
              size="small"
              className="mb-4"
            />

            <Typography variant="body2" className="text-gray-600 mb-2">
              Base Font Size: {config.fontSize}px
            </Typography>
            <Slider
              value={config.fontSize}
              onChange={(_, value) => updateConfig({ fontSize: value as number })}
              min={10}
              max={20}
              step={1}
              valueLabelDisplay="auto"
              marks={[
                { value: 12, label: '12' },
                { value: 14, label: '14' },
                { value: 16, label: '16' },
                { value: 18, label: '18' },
              ]}
              className="mb-4"
            />

            <Typography variant="body2" className="text-gray-600 mb-2 mt-4">
              Font Weights
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box>
                <Typography variant="caption" className="text-gray-500">
                  Regular: {config.fontWeightRegular}
                </Typography>
                <Slider
                  value={config.fontWeightRegular}
                  onChange={(_, value) => updateConfig({ fontWeightRegular: value as number })}
                  min={100}
                  max={500}
                  step={100}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-500">
                  Medium: {config.fontWeightMedium}
                </Typography>
                <Slider
                  value={config.fontWeightMedium}
                  onChange={(_, value) => updateConfig({ fontWeightMedium: value as number })}
                  min={400}
                  max={700}
                  step={100}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box>
                <Typography variant="caption" className="text-gray-500">
                  Bold: {config.fontWeightBold}
                </Typography>
                <Slider
                  value={config.fontWeightBold}
                  onChange={(_, value) => updateConfig({ fontWeightBold: value as number })}
                  min={600}
                  max={900}
                  step={100}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>
          </Box>

          <Divider className="my-4" />

          {/* Spacing */}
          <Typography variant="h6" className="mb-4">
            Spacing
          </Typography>
          <Box className="mb-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Spacing Unit: {config.spacingUnit}px (theme.spacing(1) = {config.spacingUnit}px)
            </Typography>
            <Slider
              value={config.spacingUnit}
              onChange={(_, value) => updateConfig({ spacingUnit: value as number })}
              min={4}
              max={16}
              step={1}
              valueLabelDisplay="auto"
              marks={[
                { value: 4, label: '4' },
                { value: 8, label: '8' },
                { value: 12, label: '12' },
                { value: 16, label: '16' },
              ]}
            />
            <Box className="mt-4 flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((n) => (
                <Box
                  key={n}
                  sx={{
                    width: config.spacingUnit * n,
                    height: config.spacingUnit * n,
                    backgroundColor: config.primary,
                    borderRadius: `${config.borderRadius}px`,
                  }}
                  title={`spacing(${n}) = ${config.spacingUnit * n}px`}
                />
              ))}
              <Typography variant="caption" className="text-gray-500 self-center ml-2">
                spacing(1-4) preview
              </Typography>
            </Box>
          </Box>

          <Divider className="my-4" />

          {/* Shape */}
          <Typography variant="h6" className="mb-4">
            Shape
          </Typography>
          <Box className="mb-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Border Radius: {config.borderRadius}px
            </Typography>
            <Slider
              value={config.borderRadius}
              onChange={(_, value) =>
                updateConfig({ borderRadius: value as number })
              }
              min={0}
              max={24}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider className="my-4" />

          {/* Preview */}
          <Typography variant="h6" className="mb-4">
            Preview
          </Typography>
          <Box
            className="p-4 rounded-lg mb-6"
            sx={{
              backgroundColor: config.background,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              className="p-4 rounded mb-4"
              sx={{
                backgroundColor: config.paper,
                borderRadius: `${config.borderRadius}px`,
              }}
            >
              <Typography
                sx={{
                  color: config.text,
                  fontFamily: config.fontFamily,
                  fontSize: `${config.fontSize}px`,
                  fontWeight: config.fontWeightRegular,
                }}
              >
                Regular text ({config.fontSize}px, weight {config.fontWeightRegular})
              </Typography>
              <Typography
                sx={{
                  color: config.text,
                  fontFamily: config.fontFamily,
                  fontSize: `${config.fontSize}px`,
                  fontWeight: config.fontWeightMedium,
                }}
              >
                Medium text (weight {config.fontWeightMedium})
              </Typography>
              <Typography
                sx={{
                  color: config.text,
                  fontFamily: config.fontFamily,
                  fontSize: `${config.fontSize}px`,
                  fontWeight: config.fontWeightBold,
                }}
              >
                Bold text (weight {config.fontWeightBold})
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: config.primary,
                  borderRadius: `${config.borderRadius}px`,
                }}
              >
                Primary
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: config.secondary,
                  borderRadius: `${config.borderRadius}px`,
                }}
              >
                Secondary
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: config.error,
                  borderRadius: `${config.borderRadius}px`,
                }}
              >
                Error
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: config.success,
                  borderRadius: `${config.borderRadius}px`,
                }}
              >
                Success
              </Button>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleExport}>
              Export Theme
            </Button>
            <Button variant="outlined" onClick={resetConfig}>
              Reset to Default
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Theme Configuration</DialogTitle>
        <DialogContent>
          <Tabs
            value={exportTab}
            onChange={(_, v) => setExportTab(v)}
            className="mb-4"
          >
            <Tab label="MUI Theme (theme.ts)" />
            <Tab label="Tailwind CSS" />
          </Tabs>

          {exportTab === 0 && (
            <Box>
              <Typography variant="body2" className="text-gray-600 mb-2">
                Save this as <code className="bg-gray-100 px-1 rounded">src/theme.ts</code> and import it in your app.
              </Typography>
              <Box
                component="pre"
                className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm"
                sx={{ maxHeight: 400 }}
              >
                {muiThemeCode}
              </Box>
              <Stack direction="row" spacing={2} className="mt-4">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleDownload(muiThemeCode, 'theme.ts')}
                >
                  Download theme.ts
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleCopyToClipboard(muiThemeCode)}
                >
                  Copy to Clipboard
                </Button>
              </Stack>
            </Box>
          )}

          {exportTab === 1 && (
            <Box>
              <Typography variant="body2" className="text-gray-600 mb-2">
                Add these CSS variables to your <code className="bg-gray-100 px-1 rounded">src/index.css</code> file.
              </Typography>
              <Box
                component="pre"
                className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm"
                sx={{ maxHeight: 400 }}
              >
                {tailwindCode}
              </Box>
              <Stack direction="row" spacing={2} className="mt-4">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleDownload(tailwindCode, 'tailwind-theme.css')}
                >
                  Download CSS
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleCopyToClipboard(tailwindCode)}
                >
                  Copy to Clipboard
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
