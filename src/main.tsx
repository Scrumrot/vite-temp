import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { useThemeStore } from './stores/themeStore'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { config } = useThemeStore()

  const theme = createTheme({
    palette: {
      mode: config.mode,
      primary: { main: config.primary },
      secondary: { main: config.secondary },
      error: { main: config.error },
      warning: { main: config.warning },
      info: { main: config.info },
      success: { main: config.success },
      background: {
        default: config.background,
        paper: config.paper,
      },
      text: { primary: config.text },
    },
    typography: {
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      fontWeightRegular: config.fontWeightRegular,
      fontWeightMedium: config.fontWeightMedium,
      fontWeightBold: config.fontWeightBold,
    },
    spacing: config.spacingUnit,
    shape: {
      borderRadius: config.borderRadius,
    },
  })

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider enableCssLayer>
          {/* Configure CSS layer order for Tailwind v4 + MUI integration */}
          <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
          <DynamicThemeProvider>
            <CssBaseline />
            <App />
          </DynamicThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
