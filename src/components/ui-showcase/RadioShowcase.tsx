import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function RadioShowcase() {
  const [value, setValue] = useState('option1')

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Radio Group
        </Typography>
        <FormControl>
          <FormLabel>Select an option</FormLabel>
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
            <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
            <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
            <FormControlLabel value="option4" control={<Radio />} label="Option 4 (disabled)" disabled />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Row Direction
        </Typography>
        <FormControl>
          <RadioGroup row defaultValue="a">
            <FormControlLabel value="a" control={<Radio />} label="A" />
            <FormControlLabel value="b" control={<Radio />} label="B" />
            <FormControlLabel value="c" control={<Radio />} label="C" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack direction="row" spacing={1}>
          <Radio checked color="primary" />
          <Radio checked color="secondary" />
          <Radio checked color="success" />
          <Radio checked color="error" />
          <Radio checked color="warning" />
          <Radio checked color="info" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" alignItems="center">
          <Radio checked size="small" />
          <Radio checked size="medium" />
          <Radio checked sx={{ '& .MuiSvgIcon-root': { fontSize: 32 } }} />
        </Stack>
      </Box>
    </Stack>
  )
}
