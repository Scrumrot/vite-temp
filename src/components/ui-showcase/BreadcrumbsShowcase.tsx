import Stack from '@mui/material/Stack'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import HomeIcon from '@mui/icons-material/Home'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import GrainIcon from '@mui/icons-material/Grain'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

export default function BreadcrumbsShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Basic Breadcrumbs
        </Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="#">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Category
          </Link>
          <Typography color="text.primary">Current Page</Typography>
        </Breadcrumbs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Custom Separator
        </Typography>
        <Stack spacing={2}>
          <Breadcrumbs separator="›">
            <Link underline="hover" color="inherit" href="#">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="#">
              Products
            </Link>
            <Typography color="text.primary">Details</Typography>
          </Breadcrumbs>

          <Breadcrumbs separator="-">
            <Link underline="hover" color="inherit" href="#">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="#">
              Products
            </Link>
            <Typography color="text.primary">Details</Typography>
          </Breadcrumbs>

          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link underline="hover" color="inherit" href="#">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="#">
              Products
            </Link>
            <Typography color="text.primary">Details</Typography>
          </Breadcrumbs>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          With Icons
        </Typography>
        <Breadcrumbs>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="#"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="#"
          >
            <WhatshotIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Trending
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <GrainIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Product
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Collapsed (Max Items)
        </Typography>
        <Breadcrumbs maxItems={3}>
          <Link underline="hover" color="inherit" href="#">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Category
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Subcategory
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Products
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Item
          </Link>
          <Typography color="text.primary">Details</Typography>
        </Breadcrumbs>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Items Before/After Collapse
        </Typography>
        <Breadcrumbs maxItems={4} itemsBeforeCollapse={2} itemsAfterCollapse={2}>
          <Link underline="hover" color="inherit" href="#">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Catalog
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Accessories
          </Link>
          <Link underline="hover" color="inherit" href="#">
            New Collection
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Belts
          </Link>
          <Typography color="text.primary">Leather Belt</Typography>
        </Breadcrumbs>
      </Box>
    </Stack>
  )
}
