import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FaceIcon from '@mui/icons-material/Face'
import DoneIcon from '@mui/icons-material/Done'
import DeleteIcon from '@mui/icons-material/Delete'

export default function ChipShowcase() {
  const handleDelete = () => {
    console.log('Chip deleted')
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="Chip Filled" />
          <Chip label="Chip Outlined" variant="outlined" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Clickable
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="Clickable" onClick={() => {}} />
          <Chip label="Clickable" variant="outlined" onClick={() => {}} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Deletable
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="Deletable" onDelete={handleDelete} />
          <Chip label="Deletable" variant="outlined" onDelete={handleDelete} />
          <Chip label="Custom Delete" onDelete={handleDelete} deleteIcon={<DeleteIcon />} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Avatar/Icon
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip avatar={<Avatar>M</Avatar>} label="Avatar" />
          <Chip avatar={<Avatar src="/placeholder.jpg" />} label="Image Avatar" />
          <Chip icon={<FaceIcon />} label="With Icon" />
          <Chip icon={<DoneIcon />} label="Done" color="success" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label="Primary" color="primary" />
          <Chip label="Secondary" color="secondary" />
          <Chip label="Success" color="success" />
          <Chip label="Error" color="error" />
          <Chip label="Warning" color="warning" />
          <Chip label="Info" color="info" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Outlined Colors
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label="Primary" color="primary" variant="outlined" />
          <Chip label="Secondary" color="secondary" variant="outlined" />
          <Chip label="Success" color="success" variant="outlined" />
          <Chip label="Error" color="error" variant="outlined" />
          <Chip label="Warning" color="warning" variant="outlined" />
          <Chip label="Info" color="info" variant="outlined" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Small" size="small" />
          <Chip label="Medium" size="medium" />
        </Stack>
      </Box>
    </Stack>
  )
}
