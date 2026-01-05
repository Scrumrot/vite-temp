import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function SwitchShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic
        </Typography>
        <FormGroup row>
          <FormControlLabel control={<Switch defaultChecked />} label="On" />
          <FormControlLabel control={<Switch />} label="Off" />
          <FormControlLabel control={<Switch disabled />} label="Disabled" />
          <FormControlLabel control={<Switch disabled defaultChecked />} label="Disabled On" />
        </FormGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack direction="row" spacing={1}>
          <Switch defaultChecked color="primary" />
          <Switch defaultChecked color="secondary" />
          <Switch defaultChecked color="success" />
          <Switch defaultChecked color="error" />
          <Switch defaultChecked color="warning" />
          <Switch defaultChecked color="info" />
          <Switch defaultChecked color="default" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack direction="row" alignItems="center">
          <Switch defaultChecked size="small" />
          <Switch defaultChecked size="medium" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Label Placement
        </Typography>
        <FormGroup row>
          <FormControlLabel control={<Switch />} label="End" labelPlacement="end" />
          <FormControlLabel control={<Switch />} label="Start" labelPlacement="start" />
          <FormControlLabel control={<Switch />} label="Top" labelPlacement="top" />
          <FormControlLabel control={<Switch />} label="Bottom" labelPlacement="bottom" />
        </FormGroup>
      </Box>
    </Stack>
  )
}
