import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PaletteIcon from '@mui/icons-material/Palette'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import CloseIcon from '@mui/icons-material/Close'
import DataTable, { type Column } from '../components/DataTable'
import ThemeEditorForm from '../components/ThemeEditorForm'
import usafColors from '../data/usaf-color-palette.json'

interface ColorEntry {
  name: string
  yarn: string
  pms: string | null
  hex: string
  federalStandard: string | null
}

const columns: Column<ColorEntry>[] = [
  {
    id: 'name',
    label: 'Color Name',
    minWidth: 150,
  },
  {
    id: 'hex',
    label: 'Preview',
    minWidth: 100,
    align: 'center',
    sortable: false,
    searchable: false,
    format: (value) => (
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: value as string,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          mx: 'auto',
        }}
      />
    ),
  },
  {
    id: 'hex',
    label: 'Hex Code',
    minWidth: 100,
    format: (value) => (
      <Chip
        label={value as string}
        size="small"
        sx={{
          fontFamily: 'monospace',
          backgroundColor: value as string,
          color: isLightColor(value as string) ? '#000' : '#fff',
        }}
      />
    ),
  },
  {
    id: 'yarn',
    label: 'Yarn Code',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'pms',
    label: 'PMS',
    minWidth: 80,
    align: 'center',
    format: (value) => (value as string) || '–',
  },
  {
    id: 'federalStandard',
    label: 'Federal Standard',
    minWidth: 120,
    align: 'center',
    format: (value) => (value as string) || '–',
  },
]

// Helper to determine if a color is light (for text contrast)
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export default function Colors() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRowClick = (row: ColorEntry) => {
    navigator.clipboard.writeText(row.hex)
    alert(`Copied ${row.hex} to clipboard!`)
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
          <PaletteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            USAF Color Palette
          </Typography>
          <Button
            color="inherit"
            startIcon={<ColorLensIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Theme
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <DataTable
          title="Official USAF Colors"
          columns={columns}
          data={usafColors.colors}
          defaultRowsPerPage={50}
          searchPlaceholder="Search colors..."
          onRowClick={handleRowClick}
          getRowId={(row) => row.yarn}
          maxHeight={600}
        />
      </Container>

      {/* Theme Editor Drawer */}
      <Drawer
        anchor="right"
        variant="persistent"
        open={drawerOpen}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 480 } },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ColorLensIcon />
              Theme Editor
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Drawer Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <ThemeEditorForm />
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}
