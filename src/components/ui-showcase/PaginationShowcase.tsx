import Stack from '@mui/material/Stack'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function PaginationShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Pagination
        </Typography>
        <Pagination count={10} />
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Outlined Variant
        </Typography>
        <Pagination count={10} variant="outlined" />
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Shapes
        </Typography>
        <Stack spacing={2}>
          <Pagination count={10} shape="rounded" />
          <Pagination count={10} variant="outlined" shape="rounded" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Colors
        </Typography>
        <Stack spacing={2}>
          <Pagination count={10} color="primary" />
          <Pagination count={10} color="secondary" />
          <Pagination count={10} color="primary" variant="outlined" />
          <Pagination count={10} color="secondary" variant="outlined" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Sizes
        </Typography>
        <Stack spacing={2}>
          <Pagination count={10} size="small" />
          <Pagination count={10} size="medium" />
          <Pagination count={10} size="large" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Buttons
        </Typography>
        <Stack spacing={2}>
          <Pagination count={10} showFirstButton showLastButton />
          <Pagination count={10} hidePrevButton hideNextButton />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Ranges
        </Typography>
        <Stack spacing={2}>
          <Pagination count={20} defaultPage={10} siblingCount={0} />
          <Pagination count={20} defaultPage={10} siblingCount={1} />
          <Pagination count={20} defaultPage={10} siblingCount={2} />
          <Pagination count={20} defaultPage={10} boundaryCount={2} />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Custom Icons
        </Typography>
        <Pagination
          count={10}
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
              {...item}
            />
          )}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Disabled
        </Typography>
        <Pagination count={10} disabled />
      </Box>
    </Stack>
  )
}
