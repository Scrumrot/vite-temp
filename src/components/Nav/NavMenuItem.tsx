import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { NavItem } from './types'
import { isNavLinkItem, isNavMenuItem } from './types'
import { resolveBgColor } from './colorUtils'

interface NavMenuItemProps {
  item: NavItem
  onClose: () => void
  depth?: number
}

export function NavMenuItem({ item, onClose, depth = 0 }: NavMenuItemProps)  {
  const navigate = useNavigate()
  const [subMenuAnchor, setSubMenuAnchor] = useState<null | HTMLElement>(null)
  const hasChildren = isNavMenuItem(item)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isNavLinkItem(item)) {
      navigate(item.to)
      onClose()
    } else if (hasChildren) {
      setSubMenuAnchor(event.currentTarget)
    }
  }

  const handleSubMenuClose = () => {
    setSubMenuAnchor(null)
  }

  const handleCloseAll = () => {
    handleSubMenuClose()
    onClose()
  }

  return (
    <>
      <MenuItem
        onClick={handleClick}
        sx={{
          py: 1.5,
          px: 2,
          display: 'flex',
          gap: 2,
          borderRadius: 2,

        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 48,
            '& .MuiSvgIcon-root': {
              bgcolor: resolveBgColor(item.iconBgColor),
              color: 'white',
              borderRadius: 2,
              p: 1,
              fontSize: '2rem',
            },
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText sx={{ ml: 0.5 }}>{item.label}</ListItemText>
        {hasChildren && <ChevronRightIcon sx={{ ml: 1, color: 'text.secondary' }} />}
      </MenuItem>

      {hasChildren && (
        <Menu
          anchorEl={subMenuAnchor}
          open={Boolean(subMenuAnchor)}
          onClose={handleSubMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: { minWidth: 220, ml: 1.25, px: 1, borderRadius: 2, },
            },
          }}
        >
          {item.items.map((subItem) => (
            <NavMenuItem
              key={subItem.id}
              item={subItem}
              onClose={handleCloseAll}
              depth={depth + 1}
            />
          ))}
        </Menu>
      )}
    </>
  )
}
