import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import WidgetsIcon from '@mui/icons-material/Widgets'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ThemeEditorForm from '../components/ThemeEditorForm'

// Component Showcases
import ButtonShowcase from '../components/ui-showcase/ButtonShowcase'
import TextFieldShowcase from '../components/ui-showcase/TextFieldShowcase'
import SelectShowcase from '../components/ui-showcase/SelectShowcase'
import CheckboxShowcase from '../components/ui-showcase/CheckboxShowcase'
import RadioShowcase from '../components/ui-showcase/RadioShowcase'
import SwitchShowcase from '../components/ui-showcase/SwitchShowcase'
import SliderShowcase from '../components/ui-showcase/SliderShowcase'
import ChipShowcase from '../components/ui-showcase/ChipShowcase'
import AlertShowcase from '../components/ui-showcase/AlertShowcase'
import CardShowcase from '../components/ui-showcase/CardShowcase'
import TableShowcase from '../components/ui-showcase/TableShowcase'
import TabsShowcase from '../components/ui-showcase/TabsShowcase'
import DialogShowcase from '../components/ui-showcase/DialogShowcase'
import ProgressShowcase from '../components/ui-showcase/ProgressShowcase'
import AvatarShowcase from '../components/ui-showcase/AvatarShowcase'
import BadgeShowcase from '../components/ui-showcase/BadgeShowcase'
import TooltipShowcase from '../components/ui-showcase/TooltipShowcase'
import AccordionShowcase from '../components/ui-showcase/AccordionShowcase'
import BreadcrumbsShowcase from '../components/ui-showcase/BreadcrumbsShowcase'
import PaginationShowcase from '../components/ui-showcase/PaginationShowcase'
import LoginFormShowcase from '../components/ui-showcase/LoginFormShowcase'
import DataTableShowcase from '../components/ui-showcase/DataTableShowcase'
import DashboardShowcase from '../components/ui-showcase/DashboardShowcase'
import SquareButtonShowcase from '../components/ui-showcase/SquareButtonShowcase'

interface ComponentItem {
  id: string
  name: string
  component: React.ComponentType
  category: 'inputs' | 'display' | 'feedback' | 'navigation' | 'surfaces' | 'examples'
}

const componentList: ComponentItem[] = [
  // Inputs
  { id: 'button', name: 'Button', component: ButtonShowcase, category: 'inputs' },
  { id: 'squarebutton', name: 'Square Button', component: SquareButtonShowcase, category: 'inputs' },
  { id: 'textfield', name: 'TextField', component: TextFieldShowcase, category: 'inputs' },
  { id: 'select', name: 'Select', component: SelectShowcase, category: 'inputs' },
  { id: 'checkbox', name: 'Checkbox', component: CheckboxShowcase, category: 'inputs' },
  { id: 'radio', name: 'Radio', component: RadioShowcase, category: 'inputs' },
  { id: 'switch', name: 'Switch', component: SwitchShowcase, category: 'inputs' },
  { id: 'slider', name: 'Slider', component: SliderShowcase, category: 'inputs' },

  // Display
  { id: 'chip', name: 'Chip', component: ChipShowcase, category: 'display' },
  { id: 'avatar', name: 'Avatar', component: AvatarShowcase, category: 'display' },
  { id: 'badge', name: 'Badge', component: BadgeShowcase, category: 'display' },
  { id: 'tooltip', name: 'Tooltip', component: TooltipShowcase, category: 'display' },
  { id: 'table', name: 'Table', component: TableShowcase, category: 'display' },

  // Feedback
  { id: 'alert', name: 'Alert', component: AlertShowcase, category: 'feedback' },
  { id: 'progress', name: 'Progress', component: ProgressShowcase, category: 'feedback' },
  { id: 'dialog', name: 'Dialog', component: DialogShowcase, category: 'feedback' },

  // Navigation
  { id: 'tabs', name: 'Tabs', component: TabsShowcase, category: 'navigation' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', component: BreadcrumbsShowcase, category: 'navigation' },
  { id: 'pagination', name: 'Pagination', component: PaginationShowcase, category: 'navigation' },

  // Surfaces
  { id: 'card', name: 'Card', component: CardShowcase, category: 'surfaces' },
  { id: 'accordion', name: 'Accordion', component: AccordionShowcase, category: 'surfaces' },

  // Pre-built Examples
  { id: 'loginform', name: 'Login Form', component: LoginFormShowcase, category: 'examples' },
  { id: 'datatable', name: 'Data Table', component: DataTableShowcase, category: 'examples' },
  { id: 'dashboard', name: 'Dashboard Cards', component: DashboardShowcase, category: 'examples' },
]

const categories = [
  { id: 'inputs', name: 'Inputs' },
  { id: 'display', name: 'Data Display' },
  { id: 'feedback', name: 'Feedback' },
  { id: 'navigation', name: 'Navigation' },
  { id: 'surfaces', name: 'Surfaces' },
  { id: 'examples', name: 'Pre-built Examples' },
]

export default function UI() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<string[]>(['button', 'textfield', 'alert'])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  )

  const handleToggle = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSelectAll = (categoryId: string) => {
    const categoryItems = componentList
      .filter((item) => item.category === categoryId)
      .map((item) => item.id)

    const allChecked = categoryItems.every((id) => checked.includes(id))

    if (allChecked) {
      setChecked((prev) => prev.filter((id) => !categoryItems.includes(id)))
    } else {
      setChecked((prev) => [...new Set([...prev, ...categoryItems])])
    }
  }

  const checkedComponents = componentList.filter((item) => checked.includes(item.id))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <WidgetsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UI Component Showcase
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Component Checklist */}
        <Paper
          sx={{
            width: 280,
            flexShrink: 0,
            overflow: 'auto',
            borderRadius: 0,
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Components
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select components to preview
            </Typography>
          </Box>

          <List dense disablePadding>
            {categories.map((category) => {
              const categoryItems = componentList.filter(
                (item) => item.category === category.id
              )
              const checkedCount = categoryItems.filter((item) =>
                checked.includes(item.id)
              ).length
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <Box key={category.id}>
                  <ListItemButton onClick={() => handleCategoryToggle(category.id)}>
                    <ListItemText
                      primary={category.name}
                      secondary={`${checkedCount}/${categoryItems.length} selected`}
                    />
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                      <ListItem sx={{ pl: 4 }}>
                        <ListItemButton
                          dense
                          onClick={() => handleSelectAll(category.id)}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={checkedCount === categoryItems.length}
                              indeterminate={
                                checkedCount > 0 && checkedCount < categoryItems.length
                              }
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary="Select All"
                            primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                          />
                        </ListItemButton>
                      </ListItem>

                      {categoryItems.map((item) => (
                        <ListItem key={item.id} sx={{ pl: 4 }} disablePadding>
                          <ListItemButton dense onClick={() => handleToggle(item.id)}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Checkbox
                                edge="start"
                                checked={checked.includes(item.id)}
                                size="small"
                              />
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                  <Divider />
                </Box>
              )
            })}
          </List>
        </Paper>

        {/* Center Panel - Component Display */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          {checkedComponents.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography color="text.secondary">
                Select components from the left panel to preview
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {checkedComponents.map((item) => {
                const ShowcaseComponent = item.component
                return (
                  <Paper key={item.id} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      {item.name}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <ShowcaseComponent />
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>

        {/* Right Panel - Theme Editor */}
        <Paper
          sx={{
            width: 400,
            flexShrink: 0,
            overflow: 'auto',
            borderRadius: 0,
            borderLeft: 1,
            borderColor: 'divider',
            p: 2,
          }}
        >
          <ThemeEditorForm />
        </Paper>
      </Box>
    </Box>
  )
}
