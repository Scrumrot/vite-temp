import type { NavItemDraft, ThemeColorKey } from './types'

interface ParsedItem {
  id: string
  label: string
  icon?: string
  iconBgColor?: string
  to?: string
  items?: ParsedItem[]
}

const generateKeyId = () => `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Parse a navConfig code string and extract NavItemDraft[]
 */
export function parseNavConfigCode(code: string): { items: NavItemDraft[]; errors: string[] } {
  const errors: string[] = []

  try {
    // Remove comments
    const cleanCode = code
      .replace(/\/\/.*$/gm, '') // single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments

    // Find the top-level items array using bracket counting
    const itemsArrayContent = extractTopLevelItemsArray(cleanCode)
    if (!itemsArrayContent) {
      errors.push('Could not find items array in the config')
      return { items: [], errors }
    }

    const parsedItems = parseItemsArray(itemsArrayContent)
    return { items: convertToDrafts(parsedItems), errors }
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`)
    return { items: [], errors }
  }
}

/**
 * Extract the top-level items array content using bracket counting
 */
function extractTopLevelItemsArray(code: string): string | null {
  // Find "items:" or "items :"
  const itemsKeyMatch = code.match(/items\s*:\s*\[/)
  if (!itemsKeyMatch || itemsKeyMatch.index === undefined) {
    return null
  }

  const startIndex = itemsKeyMatch.index + itemsKeyMatch[0].length - 1 // Position of '['
  return extractBracketedContent(code, startIndex, '[', ']')
}

/**
 * Extract content between matching brackets using counting
 */
function extractBracketedContent(
  code: string,
  startIndex: number,
  openBracket: string,
  closeBracket: string
): string | null {
  if (code[startIndex] !== openBracket) return null

  let depth = 0
  let inString = false
  let stringChar = ''

  for (let i = startIndex; i < code.length; i++) {
    const char = code[i]
    const prevChar = i > 0 ? code[i - 1] : ''

    // Handle string boundaries (but not escaped quotes)
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }

    if (inString) continue

    // Handle JSX-like content <.../>
    if (char === '<') {
      // Skip until we find />
      const closeJsx = code.indexOf('/>', i)
      if (closeJsx !== -1) {
        i = closeJsx + 1
        continue
      }
    }

    if (char === openBracket) {
      depth++
    } else if (char === closeBracket) {
      depth--
      if (depth === 0) {
        return code.slice(startIndex, i + 1)
      }
    }
  }

  return null
}

/**
 * Parse an array of items using bracket counting
 */
function parseItemsArray(content: string): ParsedItem[] {
  const items: ParsedItem[] = []

  // Remove outer brackets
  const innerContent = content.slice(1, -1).trim()
  if (!innerContent) return items

  // Find all top-level objects
  let depth = 0
  let objectStart = -1
  let inString = false
  let stringChar = ''
  let inJsx = false

  for (let i = 0; i < innerContent.length; i++) {
    const char = innerContent[i]
    const prevChar = i > 0 ? innerContent[i - 1] : ''

    // Handle string boundaries
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }

    if (inString) continue

    // Handle JSX content <.../>
    if (char === '<' && !inJsx) {
      inJsx = true
      continue
    }
    if (inJsx && char === '>' && prevChar === '/') {
      inJsx = false
      continue
    }
    if (inJsx) continue

    if (char === '{') {
      if (depth === 0) {
        objectStart = i
      }
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && objectStart !== -1) {
        const objectContent = innerContent.slice(objectStart, i + 1)
        const parsed = parseItemObject(objectContent)
        if (parsed) items.push(parsed)
        objectStart = -1
      }
    } else if (char === '[') {
      depth++
    } else if (char === ']') {
      depth--
    }
  }

  return items
}

/**
 * Parse a single item object
 */
function parseItemObject(content: string): ParsedItem | null {
  const item: ParsedItem = {
    id: '',
    label: '',
  }

  // Extract id
  const idMatch = content.match(/id\s*:\s*['"`]([^'"`]+)['"`]/)
  if (idMatch) item.id = idMatch[1]

  // Extract label
  const labelMatch = content.match(/label\s*:\s*['"`]([^'"`]+)['"`]/)
  if (labelMatch) item.label = labelMatch[1]

  // Extract icon (look for <IconName /> pattern)
  const iconMatch = content.match(/icon\s*:\s*<(\w+)\s*\/?>/)
  if (iconMatch) {
    const iconName = iconMatch[1]
    item.icon = iconName.endsWith('Icon') ? iconName : `${iconName}Icon`
  }

  // Extract iconBgColor
  const bgColorMatch = content.match(/iconBgColor\s*:\s*['"`]([^'"`]+)['"`]/)
  if (bgColorMatch) item.iconBgColor = bgColorMatch[1]

  // Extract to (for links)
  const toMatch = content.match(/to\s*:\s*['"`]([^'"`]+)['"`]/)
  if (toMatch) item.to = toMatch[1]

  // Extract nested items using bracket counting
  const nestedItemsMatch = content.match(/items\s*:\s*\[/)
  if (nestedItemsMatch && nestedItemsMatch.index !== undefined) {
    const startIdx = nestedItemsMatch.index + nestedItemsMatch[0].length - 1
    const nestedContent = extractBracketedContent(content, startIdx, '[', ']')
    if (nestedContent) {
      item.items = parseItemsArray(nestedContent)
    }
  }

  // Only return if we have at least id and label
  if (!item.id || !item.label) return null

  return item
}

/**
 * Convert parsed items to NavItemDraft format
 */
function convertToDrafts(items: ParsedItem[]): NavItemDraft[] {
  return items.map((item) => {
    const draft: NavItemDraft = {
      keyId: generateKeyId(),
      id: item.id,
      label: item.label,
      iconName: item.icon || '',
      iconBgColor: (item.iconBgColor || 'primary.main') as ThemeColorKey,
      type: item.items && item.items.length > 0 ? 'menu' : 'link',
      isExpanded: true,
    }

    if (item.to) {
      draft.to = item.to
    } else if (draft.type === 'link') {
      draft.to = '/'
    }

    if (item.items && item.items.length > 0) {
      draft.items = convertToDrafts(item.items)
    }

    return draft
  })
}

/**
 * Validate that the parsed items are valid
 */
export function validateParsedItems(items: NavItemDraft[]): string[] {
  const errors: string[] = []

  const validateItem = (item: NavItemDraft, path: string) => {
    if (!item.id) {
      errors.push(`${path}: Missing id`)
    }
    if (!item.label) {
      errors.push(`${path}: Missing label`)
    }
    // Don't require 'to' for menu items with children
    if (item.items) {
      item.items.forEach((child, i) => validateItem(child, `${path}.items[${i}]`))
    }
  }

  items.forEach((item, i) => validateItem(item, `items[${i}]`))

  return errors
}
