import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Avatar from '@mui/material/Avatar'

export default function LoginFormShowcase() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Simple Login Form
        </Typography>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
              />
              <Button variant="contained" fullWidth>
                Sign In
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Login Form with Options
        </Typography>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography variant="h6">Sign In</Typography>
            </Box>
            <Stack spacing={2}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="Remember me"
              />
              <Button variant="contained" fullWidth size="large">
                Sign In
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
                <Link href="#" variant="body2">
                  Create account
                </Link>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Registration Form
        </Typography>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Account
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField label="First Name" size="small" fullWidth />
                <TextField label="Last Name" size="small" fullWidth />
              </Stack>
              <TextField label="Email" type="email" size="small" fullWidth />
              <TextField label="Password" type="password" size="small" fullWidth />
              <TextField label="Confirm Password" type="password" size="small" fullWidth />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={
                  <Typography variant="body2">
                    I agree to the <Link href="#">Terms of Service</Link>
                  </Typography>
                }
              />
              <Button variant="contained" fullWidth>
                Create Account
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  )
}
