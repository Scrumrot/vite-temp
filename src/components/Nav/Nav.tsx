import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Menu from '@mui/material/Menu'
import type { NavConfig, NavItem } from './types'
import { isNavLinkItem, isNavMenuItem } from './types'
import { NavMenuItem } from './NavMenuItem'

interface NavProps {
  config: NavConfig
  title?: string
  rightContent?: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}

export function Nav({ config, title, rightContent, maxWidth = 'xl' }: NavProps)  {
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: NavItem) => {
    if (isNavMenuItem(item)) {
      setMenuAnchor(event.currentTarget)
      setActiveMenuId(item.id)
    } else if (isNavLinkItem(item)) {
      navigate(item.to)
    }
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setActiveMenuId(null)
  }

  const activeMenu = config.items.find(
    (item): item is Extract<NavItem, { items: NavItem[] }> =>
      isNavMenuItem(item) && item.id === activeMenuId
  )

  return (
    <AppBar position="static">
      <Container maxWidth={maxWidth}>
        <Toolbar disableGutters sx={{ justifyContent: 'flex-start', gap: 1 }}>
          {title && (
            <Typography variant="h6" component="div" sx={{ mr: 2 }}>
              {title}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexGrow: 1, alignSelf: 'stretch' }}>
            {config.items.map((item) => (
              <Button
                key={item.id}
                color="inherit"
                onClick={(e) => handleMenuOpen(e, item)}
                sx={{
                  textTransform: 'none',
                  fontSize: '1.10rem',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                sx: { minWidth: 220, mt: 0.5, px: 1, borderRadius: 2, },
              },
            }}
          >
            {activeMenu?.items.map((item) => (
              <NavMenuItem key={item.id} item={item} onClose={handleMenuClose} />
            ))}
          </Menu>

          {rightContent}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
