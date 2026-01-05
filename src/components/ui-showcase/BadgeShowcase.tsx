import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MailIcon from '@mui/icons-material/Mail'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { styled } from '@mui/material/styles'

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))

export default function BadgeShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Badge
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge badgeContent={4} color="primary">
            <MailIcon color="action" />
          </Badge>
          <Badge badgeContent={10} color="secondary">
            <MailIcon color="action" />
          </Badge>
          <Badge badgeContent={100} color="error">
            <MailIcon color="action" />
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Max Value
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge badgeContent={99} color="primary">
            <MailIcon color="action" />
          </Badge>
          <Badge badgeContent={100} color="primary">
            <MailIcon color="action" />
          </Badge>
          <Badge badgeContent={1000} max={999} color="primary">
            <MailIcon color="action" />
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge badgeContent={4} color="primary">
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={4} color="secondary">
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={4} color="success">
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={4} color="error">
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={4} color="warning">
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={4} color="info">
            <ShoppingCartIcon />
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Dot Badge
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge color="primary" variant="dot">
            <MailIcon />
          </Badge>
          <Badge color="secondary" variant="dot">
            <NotificationsIcon />
          </Badge>
          <Badge color="error" variant="dot">
            <Typography>Typography</Typography>
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Badge Alignment
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MailIcon />
          </Badge>
          <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
            <MailIcon />
          </Badge>
          <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <MailIcon />
          </Badge>
          <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <MailIcon />
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Badge with Avatar (Online Status)
        </Typography>
        <Stack direction="row" spacing={3}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar>U</Avatar>
          </StyledBadge>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent=" "
            sx={{ '& .MuiBadge-badge': { bgcolor: 'grey.500', width: 12, height: 12, borderRadius: '50%' } }}
          >
            <Avatar>O</Avatar>
          </Badge>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Show Zero
        </Typography>
        <Stack direction="row" spacing={4}>
          <Badge badgeContent={0} color="primary">
            <MailIcon />
          </Badge>
          <Badge badgeContent={0} color="primary" showZero>
            <MailIcon />
          </Badge>
        </Stack>
      </Box>
    </Stack>
  )
}
