import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { useNavigate } from 'react-router-dom'

export default function Task() {
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
          <AssignmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Task
        </Typography>
        <Typography color="text.secondary">
          Manage your tasks and to-do items here.
        </Typography>
      </Container>
    </Box>
  )
}
