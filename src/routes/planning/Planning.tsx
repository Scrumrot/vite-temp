import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EventNoteIcon from '@mui/icons-material/EventNote'
import { useNavigate } from 'react-router-dom'

export default function Planning() {
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
          <EventNoteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Planning
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Planning
        </Typography>
        <Typography color="text.secondary">
          Plan and schedule your activities here.
        </Typography>
      </Container>
    </Box>
  )
}
