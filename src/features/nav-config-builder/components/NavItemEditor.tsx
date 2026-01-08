import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete'
import { useTheme } from '@mui/material/styles'
import type { NavItemDraft, ThemeColorKey } from '../types'
import { iconOptions } from '../iconRegistry'
import { allColorOptions } from '../colorRegistry'

interface NavItemEditorProps {
  item: NavItemDraft
  onUpdate: (updates: Partial<NavItemDraft>) => void
}

export const NavItemEditor = ({ item, onUpdate }: NavItemEditorProps) => {
  const theme = useTheme()

  const getColorValue = (colorKey: ThemeColorKey): string => {
    const option = allColorOptions.find((c) => c.value === colorKey)
    if (!option) return '#888888'

    // Tailwind color - use hex directly
    if (option.hex) {
      return option.hex
    }

    // MUI theme color - traverse the palette
    if (option.colorPath) {
      let value: unknown = theme.palette
      for (const key of option.colorPath) {
        value = (value as Record<string, unknown>)?.[key]
      }
      return typeof value === 'string' ? value : '#888888'
    }

    return '#888888'
  }

  const selectedIcon = iconOptions.find((opt) => opt.name === item.iconName) ?? null
  const selectedColor = allColorOptions.find((c) => c.value === item.iconBgColor) ?? allColorOptions[0]

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Edit Item
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="ID"
          value={item.id}
          onChange={(e) => onUpdate({ id: e.target.value })}
          size="small"
          fullWidth
          helperText="Unique identifier used in the nav config"
        />

        <TextField
          label="Label"
          value={item.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          size="small"
          fullWidth
        />

        <Autocomplete
          options={iconOptions}
          value={selectedIcon}
          onChange={(_, value) => onUpdate({ iconName: value?.name ?? '' })}
          getOptionLabel={(option) => option.name}
          groupBy={(option) => option.category}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          renderOption={(props, option) => {
            const { key, ...rest } = props
            return (
              <Box
                component="li"
                key={key}
                {...rest}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: getColorValue(item.iconBgColor),
                    color: 'white',
                    '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant="body2">{option.name.replace('Icon', '')}</Typography>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Icon"
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: selectedIcon ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        bgcolor: getColorValue(item.iconBgColor),
                        color: 'white',
                        mr: 1,
                        '& .MuiSvgIcon-root': { fontSize: '1rem' },
                      }}
                    >
                      {selectedIcon.icon}
                    </Box>
                  ) : null,
                },
              }}
            />
          )}
          size="small"
        />

        <Autocomplete
          options={allColorOptions}
          value={selectedColor}
          onChange={(_, value) => onUpdate({ iconBgColor: value?.value ?? 'primary.main' })}
          getOptionLabel={(option) => option.label}
          groupBy={(option) => option.category}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderOption={(props, option) => {
            const { key, ...rest } = props
            return (
              <Box
                component="li"
                key={key}
                {...rest}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: option.hex ?? getColorValue(option.value),
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{option.label}</Typography>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Icon Background Color"
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 0.5,
                        bgcolor: getColorValue(item.iconBgColor),
                        border: '1px solid',
                        borderColor: 'divider',
                        mr: 1,
                        flexShrink: 0,
                      }}
                    />
                  ),
                },
              }}
            />
          )}
          size="small"
        />

        {/* Icon Preview */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Preview:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: getColorValue(item.iconBgColor),
              color: 'white',
              '& .MuiSvgIcon-root': { fontSize: '1.5rem' },
            }}
          >
            {selectedIcon?.icon}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {selectedColor?.label ?? item.iconBgColor}
          </Typography>
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={item.type}
            label="Type"
            onChange={(e) =>
              onUpdate({
                type: e.target.value as 'link' | 'menu',
                ...(e.target.value === 'menu' ? { items: item.items ?? [] } : {}),
              })
            }
          >
            <MenuItem value="link">Link (navigates to route)</MenuItem>
            <MenuItem value="menu">Menu (has sub-items)</MenuItem>
          </Select>
        </FormControl>

        {item.type === 'link' && (
          <TextField
            label="Route Path"
            value={item.to ?? ''}
            onChange={(e) => onUpdate({ to: e.target.value })}
            size="small"
            fullWidth
            placeholder="/example/path"
            helperText="The route to navigate to when clicked"
          />
        )}

        {item.type === 'menu' && (
          <Typography variant="caption" color="text.secondary">
            This item has {item.items?.length ?? 0} sub-item(s). Use the tree view to manage children.
          </Typography>
        )}
      </Box>
    </Paper>
  )
}
