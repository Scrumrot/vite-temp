import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useNavigate } from 'react-router-dom'
import {Nav} from '../../components/Nav/Nav.tsx';
import type {NavConfig} from '../../components/Nav';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';


const config: NavConfig = {
  items: [
    { id: 'overview', label: 'Overview', items: [
        { id: 'a', label: 'Overview A', icon: <RocketLaunchIcon />, items: [
            { id: 'a1', label: 'Overview A1', to: '/execution/overview', icon: <RocketLaunchIcon />, },
            { id: 'a2', label: 'Overview A2', icon: <RocketLaunchIcon />, items: [
                { id: 'a1', label: 'Overview A1', to: '/execution/overview', icon: <RocketLaunchIcon />, },
                { id: 'a2', label: 'Overview A2', to: '/execution/overview', icon: <RocketLaunchIcon />, },
              ]},
          ] },
        { id: 'b', label: 'Overview B', to: '/execution/overview' },
      ] },
    { id: 'workflows', label: 'Workflows', to: '/execution/workflows' },
    { id: 'logs', label: 'Logs', to: '/execution/logs' },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { id: 'general', label: 'General', to: '/execution/settings/general' },
        { id: 'notifications', label: 'Notifications', to: '/execution/settings/notifications' },
      ],
    },
  ],
};


export default function Execution() {
  const navigate = useNavigate()

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
          <PlayArrowIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Execution
          </Typography>
        </Toolbar>
        <Nav config={config} title="Execution"/>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Execution
        </Typography>
        <Typography color="text.secondary">
          Manage and monitor your execution workflows here.
        </Typography>
      </Container>
    </Box>
  )
}
