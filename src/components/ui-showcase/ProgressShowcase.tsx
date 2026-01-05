import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function ProgressShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Circular Indeterminate
        </Typography>
        <Stack direction="row" spacing={2}>
          <CircularProgress />
          <CircularProgress color="secondary" />
          <CircularProgress color="success" />
          <CircularProgress color="inherit" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Circular Determinate
        </Typography>
        <Stack direction="row" spacing={2}>
          <CircularProgress variant="determinate" value={25} />
          <CircularProgress variant="determinate" value={50} />
          <CircularProgress variant="determinate" value={75} />
          <CircularProgress variant="determinate" value={100} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Circular Sizes
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={20} />
          <CircularProgress size={30} />
          <CircularProgress size={40} />
          <CircularProgress size={60} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Label
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={65} size={60} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="text.secondary">
              65%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Linear Indeterminate
        </Typography>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Linear Determinate
        </Typography>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={25} />
          <LinearProgress variant="determinate" value={50} />
          <LinearProgress variant="determinate" value={75} />
          <LinearProgress variant="determinate" value={100} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Linear Buffer
        </Typography>
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="buffer" value={50} valueBuffer={75} />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Linear Colors
        </Typography>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <LinearProgress color="primary" />
          <LinearProgress color="secondary" />
          <LinearProgress color="success" />
          <LinearProgress color="warning" />
          <LinearProgress color="error" />
          <LinearProgress color="info" />
        </Stack>
      </Box>
    </Stack>
  )
}
