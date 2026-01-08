import type { NavConfig, NavItem } from '../../components/Nav/types'

// MUI Theme colors
export type MuiThemeColorKey =
  | 'primary.main'
  | 'primary.light'
  | 'primary.dark'
  | 'secondary.main'
  | 'secondary.light'
  | 'secondary.dark'
  | 'error.main'
  | 'warning.main'
  | 'info.main'
  | 'success.main'
  | 'grey.500'
  | 'grey.700'
  | 'grey.900'

// Tailwind color shades
type TailwindShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

// Tailwind color families
type TailwindColorFamily =
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal'
  | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

export type TailwindColorKey = `tw-${TailwindColorFamily}-${TailwindShade}`

export type ThemeColorKey = MuiThemeColorKey | TailwindColorKey

export interface NavItemDraft {
  keyId: string // Internal key for tracking/selection (immutable)
  id: string // User-facing ID for the nav config
  label: string
  iconName: string
  iconBgColor: ThemeColorKey
  type: 'link' | 'menu'
  to?: string
  items?: NavItemDraft[]
  isExpanded?: boolean
}

export interface NavConfigBuilderState {
  items: NavItemDraft[]
  selectedItemId: string | null
  previewOpen: boolean
}

export interface NavConfigBuilderActions {
  addItem: (parentId: string | null) => void
  updateItem: (id: string, updates: Partial<NavItemDraft>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, direction: 'up' | 'down') => void
  moveItemToParent: (itemKeyId: string, newParentKeyId: string | null, index?: number) => void
  selectItem: (id: string | null) => void
  toggleExpanded: (id: string) => void
  setPreviewOpen: (open: boolean) => void
  reset: () => void
  loadConfig: (items: NavItemDraft[]) => void
}

export type NavConfigBuilderStore = NavConfigBuilderState & NavConfigBuilderActions

// Helper to convert draft to NavConfig
export const draftToNavConfig = (items: NavItemDraft[]): NavConfig => ({
  items: items.map(draftToNavItem),
})

const draftToNavItem = (draft: NavItemDraft): NavItem => {
  if (draft.type === 'link' && draft.to) {
    return {
      id: draft.id,
      label: draft.label,
      to: draft.to,
    }
  }
  return {
    id: draft.id,
    label: draft.label,
    items: (draft.items ?? []).map(draftToNavItem),
  }
}

// Helper to strip "Icon" suffix for MUI imports
const stripIconSuffix = (name: string): string => {
  return name.endsWith('Icon') ? name.slice(0, -4) : name
}

// Helper to generate config code
export const generateConfigCode = (items: NavItemDraft[]): string => {
  // Collect unique icon names for import statement
  const collectIcons = (itemList: NavItemDraft[]): Set<string> => {
    const icons = new Set<string>()
    for (const item of itemList) {
      if (item.iconName) icons.add(item.iconName)
      if (item.items) {
        collectIcons(item.items).forEach((icon) => icons.add(icon))
      }
    }
    return icons
  }

  const usedIcons = collectIcons(items)
  // Strip "Icon" suffix for MUI named exports
  const importNames = Array.from(usedIcons).map(stripIconSuffix)

  // Build imports
  const navConfigImport = `import type { NavConfig } from '@/components/Nav'\n`
  const iconImports = importNames.length > 0
    ? `import {\n  ${importNames.join(',\n  ')},\n} from '@mui/icons-material'\n`
    : ''

  const generateItemCode = (item: NavItemDraft, indent: number): string => {
    const pad = '  '.repeat(indent)
    // Use stripped name for JSX
    const iconCode = item.iconName ? `<${stripIconSuffix(item.iconName)} />` : 'undefined'
    const bgColorCode = item.iconBgColor !== 'primary.main' ? `\n${pad}  iconBgColor: '${item.iconBgColor}',` : ''

    if (item.type === 'link') {
      return `${pad}{
${pad}  id: '${item.id}',
${pad}  label: '${item.label}',
${pad}  icon: ${iconCode},${bgColorCode}
${pad}  to: '${item.to ?? '/'}',
${pad}}`
    }

    const childrenCode = (item.items ?? [])
      .map((child) => generateItemCode(child, indent + 2))
      .join(',\n')

    return `${pad}{
${pad}  id: '${item.id}',
${pad}  label: '${item.label}',
${pad}  icon: ${iconCode},${bgColorCode}
${pad}  items: [
${childrenCode}
${pad}  ],
${pad}}`
  }

  const itemsCode = items.map((item) => generateItemCode(item, 2)).join(',\n')

  return `${navConfigImport}${iconImports}
export const navConfig: NavConfig = {
  items: [
${itemsCode}
  ],
}`
}
