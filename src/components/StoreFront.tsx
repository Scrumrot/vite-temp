import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BarChartIcon from '@mui/icons-material/BarChart'
import DynamicFormIcon from '@mui/icons-material/DynamicForm'
import PaletteIcon from '@mui/icons-material/Palette'
import WidgetsIcon from '@mui/icons-material/Widgets'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useAuth } from '../contexts/AuthContext'
import SquareButton from './SquareButton'
import ThemeEditorForm from './ThemeEditorForm'

interface NavItem {
  label: string
  icon: React.ReactElement
  to: string
}


const navBarItems: NavItem[] = [
  { label: 'Forms', icon: <DynamicFormIcon />, to: '/forms' },
  { label: 'Colors', icon: <PaletteIcon />, to: '/colors' },
  { label: 'UI', icon: <WidgetsIcon />, to: '/ui' },
]

const navItems: NavItem[] = [
  { label: 'Execution', icon: <PlayArrowIcon />, to: '/execution' },
  { label: 'Planning', icon: <EventNoteIcon />, to: '/planning' },
  { label: 'Task', icon: <AssignmentIcon />, to: '/task' },
  { label: 'Analytics', icon: <BarChartIcon />, to: '/analytics' },
]
//
//
//
// export function TabView() {
//   const [count, setCount] = useState(0)
//   const [activeTab, setActiveTab] = useState(0)
//   const { config } = useThemeStore()
//
//   return (
//     <Box
//       className="min-h-screen p-8"
//       sx={{ backgroundColor: 'background.default' }}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <Typography
//           variant="h3"
//           component="h1"
//           className="mb-8 text-center font-bold"
//         >
//           Vite + React + MUI + Tailwind
//         </Typography>
//
//         {/* Tab Navigation */}
//         <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
//           <Tabs
//             value={activeTab}
//             onChange={(_, v) => setActiveTab(v)}
//             centered
//           >
//             <Tab label="Demo" />
//             <Tab label="Theme Editor" />
//             <Tab label="Generated"/>
//           </Tabs>
//         </Box>
//
//         {/* Demo Tab */}
//         {activeTab === 0 && (
//           <>
//             {/* MUI Card with Tailwind utility classes */}
//             <Card className="mb-6 shadow-xl">
//               <CardContent>
//                 <Typography variant="h5" component="h2" gutterBottom>
//                   MUI + Tailwind Integration Demo
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" className="mb-4">
//                   This template demonstrates how to use MUI components alongside
//                   Tailwind CSS utilities. MUI v7 supports CSS layers, allowing
//                   Tailwind classes to override MUI styles without{' '}
//                   <code className="bg-gray-100 px-1 rounded">!important</code>.
//                 </Typography>
//
//                 {/* Counter with MUI Button */}
//                 <Stack direction="row" spacing={2} alignItems="center" className="mb-4">
//                   <Button
//                     variant="contained"
//                     onClick={() => setCount((c) => c + 1)}
//                   >
//                     Count: {count}
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     onClick={() => setCount(0)}
//                   >
//                     Reset
//                   </Button>
//                   <Button variant="contained" color="secondary">
//                     Secondary
//                   </Button>
//                   <Button variant="contained" color="success">
//                     Success
//                   </Button>
//                 </Stack>
//
//                 {/* MUI TextField with Tailwind wrapper */}
//                 <div className="mt-4">
//                   <TextField
//                     fullWidth
//                     label="Enter something"
//                     variant="outlined"
//                     placeholder="Type here..."
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//
//             {/* Pure Tailwind card for comparison */}
//             <Card className="shadow-xl">
//               <CardContent>
//                 <Typography variant="h5" component="h2" gutterBottom>
//                   Pure Tailwind Card
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary">
//                   This card is styled entirely with Tailwind CSS utilities, showing
//                   both libraries can coexist seamlessly.
//                 </Typography>
//                 <div className="mt-4 flex gap-2 flex-wrap">
//                   <button
//                     className="px-4 py-2 text-white rounded-lg transition-colors"
//                     style={{
//                       backgroundColor: config.primary,
//                       borderRadius: `${config.borderRadius}px`,
//                     }}
//                   >
//                     Primary (Tailwind)
//                   </button>
//                   <button
//                     className="px-4 py-2 border rounded-lg transition-colors"
//                     style={{
//                       borderColor: config.secondary,
//                       color: config.secondary,
//                       borderRadius: `${config.borderRadius}px`,
//                     }}
//                   >
//                     Secondary (Tailwind)
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
//           </>
//         )}
//
//         {/* Theme Editor Tab */}
//         {activeTab === 1 && <ThemeEditorForm />}
//         {/* Generated form Tab */}
//         {activeTab === 2 && <ProductForm />}
//
//         {/* Footer */}
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           className="text-center mt-8"
//         >
//           Built with Vite 7.3.0 • React 19.2.3 • MUI 7.3.6 • Tailwind 4.1.18
//         </Typography>
//       </div>
//     </Box>
//   )
// }






// Get Julian date (day of year 001-366) and Zulu/UTC time
function getJulianZuluTime(): string {
  const now = new Date()

  // Calculate day of year using UTC to avoid timezone issues
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0) // Dec 31 of previous year, 00:00 UTC
  const nowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor((nowUTC - startOfYear) / oneDay)

  const hours = now.getUTCHours().toString().padStart(2, '0')
  const minutes = now.getUTCMinutes().toString().padStart(2, '0')
  const seconds = now.getUTCSeconds().toString().padStart(2, '0')

  // Format: DDD HH:MM:SSZ (e.g., 002 14:30:52Z)
  return `${dayOfYear.toString().padStart(3, '0')} ${hours}:${minutes}:${seconds}Z`
}

export default function StoreFront() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [julianTime, setJulianTime] = useState(getJulianZuluTime())
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false)
  const menuOpen = Boolean(anchorEl)

  useEffect(() => {
    const interval = setInterval(() => {
      setJulianTime(getJulianZuluTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate('/cac-login')
  }

  const handleThemes = () => {
    handleMenuClose()
    setThemeDrawerOpen(true)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StoreFront
          </Typography>
          {navBarItems.map((item) => (
            <SquareButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              size="small"
              onClick={() => navigate(item.to)}
              variant="text"
            />
          ))}
          <Chip
            icon={<AccessTimeIcon sx={{ color: 'inherit !important' }} />}
            label={julianTime}
            sx={{
              mx: 1,
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
              py: 0.5,
            }}
          />
          {user && (
            <Avatar
              onClick={handleAvatarClick}
              sx={{
                cursor: 'pointer',
                bgcolor: 'secondary.main',
                width: 40,
                height: 40,
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
          )}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { minWidth: 220, mt: 1 },
              },
            }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user.firstName} {user.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
            )}
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Account</ListItemText>
            </MenuItem>
            <Divider />
            <Typography variant="overline" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary' }}>
              Personalization
            </Typography>
            <MenuItem onClick={handleThemes}>
              <ListItemIcon>
                <PaletteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Themes</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PhotoCameraIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile Picture</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          className="gap-12"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {navItems.map((item) => (
            <SquareButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              size="xxlarge"
              onClick={() => navigate(item.to)}
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Theme Editor</Typography>
          <SquareButton
            icon={<SettingsIcon />}
            label="Close"
            size="small"
            onClick={() => setThemeDrawerOpen(false)}
          />
        </Box>
        <ThemeEditorForm />
      </Drawer>
    </Box>
  )
}
