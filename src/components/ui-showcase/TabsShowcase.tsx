import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PhoneIcon from '@mui/icons-material/Phone'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonPinIcon from '@mui/icons-material/PersonPin'

export default function TabsShowcase() {
  const [value, setValue] = useState(0)
  const [value2, setValue2] = useState(0)
  const [value3, setValue3] = useState(0)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Tabs
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={(_, v) => setValue(v)}>
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {value === 0 && <Typography>Content for Item One</Typography>}
          {value === 1 && <Typography>Content for Item Two</Typography>}
          {value === 2 && <Typography>Content for Item Three</Typography>}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colored Tabs
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value2}
            onChange={(_, v) => setValue2(v)}
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Secondary" />
            <Tab label="Color" />
            <Tab label="Tabs" />
          </Tabs>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Disabled Tab
        </Typography>
        <Tabs value={0}>
          <Tab label="Active" />
          <Tab label="Disabled" disabled />
          <Tab label="Active" />
        </Tabs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Full Width
        </Typography>
        <Tabs value={0} variant="fullWidth">
          <Tab label="Full" />
          <Tab label="Width" />
          <Tab label="Tabs" />
        </Tabs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Centered
        </Typography>
        <Tabs value={0} centered>
          <Tab label="Centered" />
          <Tab label="Tabs" />
          <Tab label="Here" />
        </Tabs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Icons
        </Typography>
        <Tabs value={value3} onChange={(_, v) => setValue3(v)}>
          <Tab icon={<PhoneIcon />} label="Phone" />
          <Tab icon={<FavoriteIcon />} label="Favorites" />
          <Tab icon={<PersonPinIcon />} label="Person" />
        </Tabs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Icon Only
        </Typography>
        <Tabs value={0}>
          <Tab icon={<PhoneIcon />} />
          <Tab icon={<FavoriteIcon />} />
          <Tab icon={<PersonPinIcon />} />
        </Tabs>
      </Box>
    </Stack>
  )
}
