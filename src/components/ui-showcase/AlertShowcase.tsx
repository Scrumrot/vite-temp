import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'

export default function AlertShowcase() {
  const [open, setOpen] = useState(true)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Alerts
        </Typography>
        <Stack spacing={1}>
          <Alert severity="error">This is an error alert — check it out!</Alert>
          <Alert severity="warning">This is a warning alert — check it out!</Alert>
          <Alert severity="info">This is an info alert — check it out!</Alert>
          <Alert severity="success">This is a success alert — check it out!</Alert>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Outlined Variant
        </Typography>
        <Stack spacing={1}>
          <Alert severity="error" variant="outlined">This is an error alert</Alert>
          <Alert severity="warning" variant="outlined">This is a warning alert</Alert>
          <Alert severity="info" variant="outlined">This is an info alert</Alert>
          <Alert severity="success" variant="outlined">This is a success alert</Alert>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Filled Variant
        </Typography>
        <Stack spacing={1}>
          <Alert severity="error" variant="filled">This is an error alert</Alert>
          <Alert severity="warning" variant="filled">This is a warning alert</Alert>
          <Alert severity="info" variant="filled">This is an info alert</Alert>
          <Alert severity="success" variant="filled">This is a success alert</Alert>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Title
        </Typography>
        <Stack spacing={1}>
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            This is a success alert with a title.
          </Alert>
          <Alert severity="info">
            <AlertTitle>Info</AlertTitle>
            This is an info alert with a helpful title.
          </Alert>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Actions
        </Typography>
        <Stack spacing={1}>
          <Alert severity="warning" action={<Button color="inherit" size="small">UNDO</Button>}>
            This alert has an action button.
          </Alert>
          <Alert
            severity="success"
            action={
              <IconButton color="inherit" size="small">
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            This alert has a close button.
          </Alert>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Custom Icon
        </Typography>
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          This success alert has a custom icon.
        </Alert>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Dismissible
        </Typography>
        <Collapse in={open}>
          <Alert
            severity="info"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            Click the X to dismiss this alert.
          </Alert>
        </Collapse>
        {!open && (
          <Button size="small" onClick={() => setOpen(true)}>
            Show Alert
          </Button>
        )}
      </Box>
    </Stack>
  )
}
