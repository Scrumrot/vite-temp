import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import SquareButton from '../SquareButton'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import FolderIcon from '@mui/icons-material/Folder'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

export default function SquareButtonShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <SquareButton icon={<HomeIcon />} label="Home" />
          <SquareButton icon={<SettingsIcon />} label="Settings" />
          <SquareButton icon={<PersonIcon />} label="Profile" />
          <SquareButton icon={<FolderIcon />} label="Files" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Variants
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <SquareButton icon={<HomeIcon />} label="Outlined" variant="outlined" />
          <SquareButton icon={<HomeIcon />} label="Contained" variant="contained" />
          <SquareButton icon={<HomeIcon />} label="Text" variant="text" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <SquareButton icon={<AddIcon />} label="Primary" color="primary" variant="contained" />
          <SquareButton icon={<EditIcon />} label="Secondary" color="secondary" variant="contained" />
          <SquareButton icon={<CloudUploadIcon />} label="Success" color="success" variant="contained" />
          <SquareButton icon={<DownloadIcon />} label="Info" color="info" variant="contained" />
          <SquareButton icon={<DeleteIcon />} label="Error" color="error" variant="contained" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" spacing={1} alignItems="flex-end" flexWrap="wrap" useFlexGap>
          <SquareButton icon={<HomeIcon />} label="Small" size="small" />
          <SquareButton icon={<HomeIcon />} label="Medium" size="medium" />
          <SquareButton icon={<HomeIcon />} label="Large" size="large" />
          <SquareButton icon={<HomeIcon />} label="X-Large" size="xlarge" />
          <SquareButton icon={<HomeIcon />} label="XX-Large" size="xxlarge" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Disabled
        </Typography>
        <Stack direction="row" spacing={1}>
          <SquareButton icon={<HomeIcon />} label="Disabled" disabled />
          <SquareButton icon={<HomeIcon />} label="Disabled" variant="contained" disabled />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Example: Action Grid
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 1, width: 'fit-content' }}>
          <SquareButton icon={<AddIcon />} label="New" color="primary" variant="contained" />
          <SquareButton icon={<EditIcon />} label="Edit" color="secondary" />
          <SquareButton icon={<CloudUploadIcon />} label="Upload" color="success" />
          <SquareButton icon={<DownloadIcon />} label="Download" color="info" />
          <SquareButton icon={<FolderIcon />} label="Browse" />
          <SquareButton icon={<PersonIcon />} label="Users" />
          <SquareButton icon={<SettingsIcon />} label="Config" />
          <SquareButton icon={<DeleteIcon />} label="Delete" color="error" />
        </Box>
      </Box>
    </Stack>
  )
}
