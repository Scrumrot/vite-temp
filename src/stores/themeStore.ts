import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import usafThemes from '../data/usaf-themes.json'

export interface ThemeConfig {
  primary: string
  secondary: string
  error: string
  warning: string
  info: string
  success: string
  background: string
  paper: string
  text: string
  fontFamily: string
  fontSize: number
  fontWeightRegular: number
  fontWeightMedium: number
  fontWeightBold: number
  borderRadius: number
  spacingUnit: number
  mode: 'light' | 'dark'
}

interface ThemeStore {
  config: ThemeConfig
  updateConfig: (updates: Partial<ThemeConfig>) => void
  resetConfig: () => void
}

export const defaultThemeConfig: ThemeConfig = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
  background: '#ffffff',
  paper: '#f5f5f5',
  text: '#212121',
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 14,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  borderRadius: 4,
  spacingUnit: 8,
  mode: 'light',
}

export interface ThemePreset {
  name: string
  config: Partial<ThemeConfig>
}

export const themePresets: ThemePreset[] = [
  {
    name: 'MUI Default',
    config: defaultThemeConfig,
  },
  {
    name: 'USAF Light',
    config: {
      mode: 'light',
      primary: usafThemes.light.primary,
      secondary: usafThemes.light.secondary,
      error: usafThemes.light.error,
      warning: usafThemes.light.warning,
      info: usafThemes.light.info,
      success: usafThemes.light.success,
      background: usafThemes.light.background,
      paper: usafThemes.light.paper,
      text: usafThemes.light.text,
    },
  },
  {
    name: 'USAF Dark',
    config: {
      mode: 'dark',
      primary: usafThemes.dark.primary,
      secondary: usafThemes.dark.secondary,
      error: usafThemes.dark.error,
      warning: usafThemes.dark.warning,
      info: usafThemes.dark.info,
      success: usafThemes.dark.success,
      background: usafThemes.dark.background,
      paper: usafThemes.dark.paper,
      text: usafThemes.dark.text,
    },
  },
  {
    name: 'Woodland Subdued',
    config: {
      mode: 'dark',
      primary: usafThemes.woodland.primary,
      secondary: usafThemes.woodland.secondary,
      error: usafThemes.woodland.error,
      warning: usafThemes.woodland.warning,
      info: usafThemes.woodland.info,
      success: usafThemes.woodland.success,
      background: usafThemes.woodland.background,
      paper: usafThemes.woodland.paper,
      text: usafThemes.woodland.text,
    },
  },
  {
    name: 'Desert Subdued',
    config: {
      mode: 'light',
      primary: usafThemes.desert.primary,
      secondary: usafThemes.desert.secondary,
      error: usafThemes.desert.error,
      warning: usafThemes.desert.warning,
      info: usafThemes.desert.info,
      success: usafThemes.desert.success,
      background: usafThemes.desert.background,
      paper: usafThemes.desert.paper,
      text: usafThemes.desert.text,
    },
  },
  {
    name: 'OCP (Scorpion)',
    config: {
      mode: 'dark',
      primary: usafThemes.ocp.primary,
      secondary: usafThemes.ocp.secondary,
      error: usafThemes.ocp.error,
      warning: usafThemes.ocp.warning,
      info: usafThemes.ocp.info,
      success: usafThemes.ocp.success,
      background: usafThemes.ocp.background,
      paper: usafThemes.ocp.paper,
      text: usafThemes.ocp.text,
    },
  },
  {
    name: 'Spice Brown OCP',
    config: {
      mode: 'dark',
      primary: usafThemes.spiceBrown.primary,
      secondary: usafThemes.spiceBrown.secondary,
      error: usafThemes.spiceBrown.error,
      warning: usafThemes.spiceBrown.warning,
      info: usafThemes.spiceBrown.info,
      success: usafThemes.spiceBrown.success,
      background: usafThemes.spiceBrown.background,
      paper: usafThemes.spiceBrown.paper,
      text: usafThemes.spiceBrown.text,
    },
  },
]

export { usafThemes }

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      config: defaultThemeConfig,
      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),
      resetConfig: () => set({ config: defaultThemeConfig }),
    }),
    {
      name: 'theme-config',
    }
  )
)

export function generateThemeFile(config: ThemeConfig): string {
  return `import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: '${config.mode}',
    primary: {
      main: '${config.primary}',
    },
    secondary: {
      main: '${config.secondary}',
    },
    error: {
      main: '${config.error}',
    },
    warning: {
      main: '${config.warning}',
    },
    info: {
      main: '${config.info}',
    },
    success: {
      main: '${config.success}',
    },
    background: {
      default: '${config.background}',
      paper: '${config.paper}',
    },
    text: {
      primary: '${config.text}',
    },
  },
  typography: {
    fontFamily: '${config.fontFamily}',
    fontSize: ${config.fontSize},
    fontWeightRegular: ${config.fontWeightRegular},
    fontWeightMedium: ${config.fontWeightMedium},
    fontWeightBold: ${config.fontWeightBold},
  },
  spacing: ${config.spacingUnit},
  shape: {
    borderRadius: ${config.borderRadius},
  },
})

export default theme
`
}

export function generateTailwindConfig(config: ThemeConfig): string {
  return `/* Add to your tailwind CSS or globals */
@theme {
  --color-primary: ${config.primary};
  --color-secondary: ${config.secondary};
  --color-error: ${config.error};
  --color-warning: ${config.warning};
  --color-info: ${config.info};
  --color-success: ${config.success};
  --radius-default: ${config.borderRadius}px;
  --font-size-base: ${config.fontSize}px;
  --font-weight-regular: ${config.fontWeightRegular};
  --font-weight-medium: ${config.fontWeightMedium};
  --font-weight-bold: ${config.fontWeightBold};
  --spacing-unit: ${config.spacingUnit}px;
}
`
}
