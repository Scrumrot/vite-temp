import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

export default function DialogShowcase() {
  const [basicOpen, setBasicOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [fullWidthOpen, setFullWidthOpen] = useState(false)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Dialog
        </Typography>
        <Button variant="outlined" onClick={() => setBasicOpen(true)}>
          Open Basic Dialog
        </Button>
        <Dialog open={basicOpen} onClose={() => setBasicOpen(false)}>
          <DialogTitle>Basic Dialog</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This is a basic dialog with a title and some content text.
              Dialogs are used for important decisions or information.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBasicOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Alert Dialog
        </Typography>
        <Button variant="outlined" color="error" onClick={() => setAlertOpen(true)}>
          Delete Item
        </Button>
        <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlertOpen(false)}>Cancel</Button>
            <Button onClick={() => setAlertOpen(false)} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Form Dialog
        </Typography>
        <Button variant="outlined" onClick={() => setFormOpen(true)}>
          Subscribe
        </Button>
        <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
          <DialogTitle>Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter your email address to subscribe to our newsletter.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => setFormOpen(false)}>Subscribe</Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Full Width Dialog
        </Typography>
        <Button variant="outlined" onClick={() => setFullWidthOpen(true)}>
          Full Width Dialog
        </Button>
        <Dialog
          open={fullWidthOpen}
          onClose={() => setFullWidthOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Full Width Dialog</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This dialog uses fullWidth and maxWidth props to control its width.
              You can set maxWidth to 'xs', 'sm', 'md', 'lg', or 'xl'.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFullWidthOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Stack>
  )
}
