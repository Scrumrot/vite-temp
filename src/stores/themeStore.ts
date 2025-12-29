import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  borderRadius: number
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
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  borderRadius: 4,
  mode: 'light',
}

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
  },
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
}
`
}
