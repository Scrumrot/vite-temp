import { useState } from 'react'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import OutlinedInput from '@mui/material/OutlinedInput'

const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4']

export default function SelectShowcase() {
  const [single, setSingle] = useState('Option 1')
  const [multiple, setMultiple] = useState<string[]>(['Option 1', 'Option 2'])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Variants
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Outlined</InputLabel>
            <Select value={single} onChange={(e) => setSingle(e.target.value)} label="Outlined">
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="filled" sx={{ minWidth: 150 }}>
            <InputLabel>Filled</InputLabel>
            <Select value={single} onChange={(e) => setSingle(e.target.value)}>
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="standard" sx={{ minWidth: 150 }}>
            <InputLabel>Standard</InputLabel>
            <Select value={single} onChange={(e) => setSingle(e.target.value)}>
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Small</InputLabel>
            <Select value={single} onChange={(e) => setSingle(e.target.value)} label="Small">
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Medium</InputLabel>
            <Select value={single} onChange={(e) => setSingle(e.target.value)} label="Medium">
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Multiple Select with Chips
        </Typography>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Multiple</InputLabel>
          <Select
            multiple
            value={multiple}
            onChange={(e) => setMultiple(e.target.value as string[])}
            input={<OutlinedInput label="Multiple" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          States
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl disabled sx={{ minWidth: 120 }}>
            <InputLabel>Disabled</InputLabel>
            <Select value="Option 1" label="Disabled">
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl error sx={{ minWidth: 120 }}>
            <InputLabel>Error</InputLabel>
            <Select value="" label="Error">
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </Stack>
  )
}
