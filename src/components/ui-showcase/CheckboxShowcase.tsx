import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import Favorite from '@mui/icons-material/Favorite'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'

export default function CheckboxShowcase() {
  const [checked, setChecked] = useState([true, false])

  const handleParentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([event.target.checked, event.target.checked])
  }

  const handleChild1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([event.target.checked, checked[1]])
  }

  const handleChild2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([checked[0], event.target.checked])
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic
        </Typography>
        <FormGroup row>
          <FormControlLabel control={<Checkbox defaultChecked />} label="Checked" />
          <FormControlLabel control={<Checkbox />} label="Unchecked" />
          <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
          <FormControlLabel control={<Checkbox disabled checked />} label="Disabled Checked" />
        </FormGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <FormGroup row>
          <Checkbox defaultChecked color="primary" />
          <Checkbox defaultChecked color="secondary" />
          <Checkbox defaultChecked color="success" />
          <Checkbox defaultChecked color="error" />
          <Checkbox defaultChecked color="warning" />
          <Checkbox defaultChecked color="info" />
          <Checkbox defaultChecked color="default" />
        </FormGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <FormGroup row>
          <Checkbox defaultChecked size="small" />
          <Checkbox defaultChecked size="medium" />
          <Checkbox defaultChecked sx={{ '& .MuiSvgIcon-root': { fontSize: 32 } }} />
        </FormGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Custom Icons
        </Typography>
        <FormGroup row>
          <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} color="error" />
          <Checkbox icon={<BookmarkBorderIcon />} checkedIcon={<BookmarkIcon />} color="warning" />
        </FormGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Indeterminate
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked[0] && checked[1]}
              indeterminate={checked[0] !== checked[1]}
              onChange={handleParentChange}
            />
          }
          label="Parent"
        />
        <Box sx={{ ml: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={checked[0]} onChange={handleChild1Change} />}
            label="Child 1"
          />
          <FormControlLabel
            control={<Checkbox checked={checked[1]} onChange={handleChild2Change} />}
            label="Child 2"
          />
        </Box>
      </Box>
    </Stack>
  )
}
