import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useNavigate } from 'react-router-dom'

export default function Analytics() {
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
          <BarChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Analytics
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Typography color="text.secondary">
          View reports and analytics data here.
        </Typography>
      </Container>
    </Box>
  )
}
