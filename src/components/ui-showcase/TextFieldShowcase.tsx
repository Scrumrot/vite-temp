import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AccountCircle from '@mui/icons-material/AccountCircle'
import SearchIcon from '@mui/icons-material/Search'

export default function TextFieldShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Variants
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField label="Outlined" variant="outlined" />
          <TextField label="Filled" variant="filled" />
          <TextField label="Standard" variant="standard" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField label="Small" size="small" />
          <TextField label="Medium" size="medium" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          States
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField label="Default" defaultValue="Hello" />
          <TextField label="Disabled" defaultValue="Disabled" disabled />
          <TextField label="Read Only" defaultValue="Read Only" slotProps={{ input: { readOnly: true } }} />
          <TextField label="Error" error defaultValue="Error" helperText="Error message" />
          <TextField label="Required" required />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Adornments
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField
            label="With Icon"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Search"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Amount"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
          />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Types
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField label="Password" type="password" defaultValue="password123" />
          <TextField label="Number" type="number" defaultValue={42} />
          <TextField label="Date" type="date" slotProps={{ inputLabel: { shrink: true } }} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Multiline
        </Typography>
        <TextField
          label="Multiline"
          multiline
          rows={3}
          defaultValue="This is a multiline text field"
          fullWidth
        />
      </Box>
    </Stack>
  )
}
