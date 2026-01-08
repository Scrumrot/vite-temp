import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import NavBar from '../components/NavBar.tsx'

export default function StoreFront() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />

      <Container
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src="/logo2.png"
          alt="Logo"
          sx={{
            maxWidth: '100%',
            maxHeight: '60vh',
            objectFit: 'contain',
            animation: 'glow 1.5s ease',
            '@keyframes glow': {
              '0%, 100%': {
                filter: 'drop-shadow(0px 0px 0px rgba(255, 255, 255, 0))',
              },
              '35%': {
                filter: 'drop-shadow(0px 0px 7.5px rgba(255, 255, 255, 0.5))',
              },
            },
          }}
        />
      </Container>
    </Box>
  )
}
