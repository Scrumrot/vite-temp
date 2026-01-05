import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'

export default function TooltipShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Tooltip
        </Typography>
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Positioned Tooltips
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip title="Top" placement="top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip title="Bottom" placement="bottom">
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip title="Left" placement="left">
            <Button>Left</Button>
          </Tooltip>
          <Tooltip title="Right" placement="right">
            <Button>Right</Button>
          </Tooltip>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Arrow Tooltips
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="With Arrow" arrow>
            <Button>Arrow</Button>
          </Tooltip>
          <Tooltip title="Without Arrow">
            <Button>No Arrow</Button>
          </Tooltip>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Transitions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Default Grow">
            <Button>Grow</Button>
          </Tooltip>
          <Tooltip title="Fade Transition" slots={{ transition: Fade }} slotProps={{ transition: { timeout: 600 } }}>
            <Button>Fade</Button>
          </Tooltip>
          <Tooltip title="Zoom Transition" slots={{ transition: Zoom }}>
            <Button>Zoom</Button>
          </Tooltip>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Variable Width
        </Typography>
        <Tooltip title="This is a much longer tooltip text that demonstrates how the tooltip can handle longer content. It will wrap to multiple lines if needed.">
          <Button>Long Tooltip</Button>
        </Tooltip>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          On Various Elements
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Button tooltip">
            <Button variant="contained">Button</Button>
          </Tooltip>
          <Tooltip title="FAB tooltip">
            <Fab size="small" color="primary">
              <AddIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Text tooltip">
            <Typography sx={{ cursor: 'pointer' }}>Hover me</Typography>
          </Tooltip>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Disabled Element
        </Typography>
        <Tooltip title="You cannot interact with this">
          <span>
            <Button disabled>Disabled Button</Button>
          </span>
        </Tooltip>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Interactive Tooltip
        </Typography>
        <Tooltip title="This tooltip stays open when hovered" disableInteractive={false}>
          <Button>Interactive</Button>
        </Tooltip>
      </Box>
    </Stack>
  )
}
