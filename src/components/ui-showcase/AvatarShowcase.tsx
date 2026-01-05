import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FolderIcon from '@mui/icons-material/Folder'
import PageviewIcon from '@mui/icons-material/Pageview'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { deepOrange, deepPurple, green, pink } from '@mui/material/colors'

export default function AvatarShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Letter Avatars
        </Typography>
        <Stack direction="row" spacing={2}>
          <Avatar>H</Avatar>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>OP</Avatar>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>S</Avatar>
          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>M</Avatar>
          <Avatar>D</Avatar>
          <Avatar sx={{ width: 56, height: 56, fontSize: 24 }}>L</Avatar>
          <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>XL</Avatar>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Icon Avatars
        </Typography>
        <Stack direction="row" spacing={2}>
          <Avatar>
            <FolderIcon />
          </Avatar>
          <Avatar sx={{ bgcolor: pink[500] }}>
            <PageviewIcon />
          </Avatar>
          <Avatar sx={{ bgcolor: green[500] }}>
            <AssignmentIcon />
          </Avatar>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Variants
        </Typography>
        <Stack direction="row" spacing={2}>
          <Avatar variant="circular">C</Avatar>
          <Avatar variant="rounded">R</Avatar>
          <Avatar variant="square">S</Avatar>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Avatar Group
        </Typography>
        <AvatarGroup max={4}>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>A</Avatar>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>B</Avatar>
          <Avatar sx={{ bgcolor: green[500] }}>C</Avatar>
          <Avatar sx={{ bgcolor: pink[500] }}>D</Avatar>
          <Avatar>E</Avatar>
          <Avatar>F</Avatar>
        </AvatarGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Avatar Group (Spaced)
        </Typography>
        <AvatarGroup max={5} spacing="small">
          <Avatar sx={{ bgcolor: deepOrange[500] }}>1</Avatar>
          <Avatar sx={{ bgcolor: deepPurple[500] }}>2</Avatar>
          <Avatar sx={{ bgcolor: green[500] }}>3</Avatar>
          <Avatar sx={{ bgcolor: pink[500] }}>4</Avatar>
          <Avatar>5</Avatar>
        </AvatarGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Fallback
        </Typography>
        <Stack direction="row" spacing={2}>
          <Avatar alt="Broken" src="/broken-image.jpg">B</Avatar>
          <Avatar src="/broken-image.jpg" />
          <Avatar alt="User Name" />
        </Stack>
      </Box>
    </Stack>
  )
}
