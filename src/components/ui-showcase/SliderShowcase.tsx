import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeUp from '@mui/icons-material/VolumeUp'

function valuetext(value: number) {
  return `${value}°C`
}

const marks = [
  { value: 0, label: '0°C' },
  { value: 20, label: '20°C' },
  { value: 37, label: '37°C' },
  { value: 100, label: '100°C' },
]

export default function SliderShowcase() {
  const [volume, setVolume] = useState(30)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic
        </Typography>
        <Stack spacing={2} sx={{ width: 300 }}>
          <Slider defaultValue={30} />
          <Slider defaultValue={30} disabled />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Icons
        </Typography>
        <Stack spacing={2} direction="row" sx={{ width: 300 }} alignItems="center">
          <VolumeDown />
          <Slider value={volume} onChange={(_, v) => setVolume(v as number)} />
          <VolumeUp />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack spacing={2} sx={{ width: 300 }}>
          <Slider defaultValue={30} size="small" />
          <Slider defaultValue={30} size="medium" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack spacing={2} sx={{ width: 300 }}>
          <Slider defaultValue={30} color="primary" />
          <Slider defaultValue={30} color="secondary" />
          <Slider defaultValue={30} color="success" />
          <Slider defaultValue={30} color="warning" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Discrete with Marks
        </Typography>
        <Box sx={{ width: 300 }}>
          <Slider
            defaultValue={37}
            getAriaValueText={valuetext}
            step={10}
            marks={marks}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Range Slider
        </Typography>
        <Box sx={{ width: 300 }}>
          <Slider
            defaultValue={[20, 37]}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
          />
        </Box>
      </Box>
    </Stack>
  )
}
