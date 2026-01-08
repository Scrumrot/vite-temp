import { create } from 'zustand'
import type { NavConfigBuilderStore, NavItemDraft } from './types'

const generateKeyId = () => `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const createDefaultItem = (): NavItemDraft => ({
  keyId: generateKeyId(),
  id: 'new-item',
  label: 'New Item',
  iconName: '',
  iconBgColor: 'primary.main',
  type: 'link',
  to: '/',
  isExpanded: true,
})

const findItemByKeyId = (items: NavItemDraft[], keyId: string): NavItemDraft | null => {
  for (const item of items) {
    if (item.keyId === keyId) return item
    if (item.items) {
      const found = findItemByKeyId(item.items, keyId)
      if (found) return found
    }
  }
  return null
}

const findParentAndIndex = (
  items: NavItemDraft[],
  keyId: string
): { parent: NavItemDraft[]; index: number } | null => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].keyId === keyId) {
      return { parent: items, index: i }
    }
    if (items[i].items) {
      const found = findParentAndIndex(items[i].items!, keyId)
      if (found) return found
    }
  }
  return null
}

const updateItemInTree = (
  items: NavItemDraft[],
  keyId: string,
  updates: Partial<NavItemDraft>
): NavItemDraft[] =>
  items.map((item) => {
    if (item.keyId === keyId) {
      return { ...item, ...updates }
    }
    if (item.items) {
      return { ...item, items: updateItemInTree(item.items, keyId, updates) }
    }
    return item
  })

const removeItemFromTree = (items: NavItemDraft[], keyId: string): NavItemDraft[] =>
  items
    .filter((item) => item.keyId !== keyId)
    .map((item) => {
      if (item.items) {
        return { ...item, items: removeItemFromTree(item.items, keyId) }
      }
      return item
    })

const addItemToParent = (
  items: NavItemDraft[],
  parentKeyId: string | null,
  newItem: NavItemDraft
): NavItemDraft[] => {
  if (parentKeyId === null) {
    return [...items, newItem]
  }

  return items.map((item) => {
    if (item.keyId === parentKeyId) {
      return {
        ...item,
        type: 'menu' as const,
        items: [...(item.items ?? []), newItem],
      }
    }
    if (item.items) {
      return { ...item, items: addItemToParent(item.items, parentKeyId, newItem) }
    }
    return item
  })
}

const initialState: Pick<NavConfigBuilderStore, 'items' | 'selectedItemId' | 'previewOpen'> = {
  items: [],
  selectedItemId: null,
  previewOpen: false,
}

export const useNavConfigBuilderStore = create<NavConfigBuilderStore>((set, get) => ({
  ...initialState,

  addItem: (parentKeyId) => {
    const newItem = createDefaultItem()
    set((state) => ({
      items: addItemToParent(state.items, parentKeyId, newItem),
      selectedItemId: newItem.keyId,
    }))
  },

  updateItem: (keyId, updates) => {
    set((state) => {
      // Check if we're changing type from menu to link with children
      const item = findItemByKeyId(state.items, keyId)
      if (
        item &&
        updates.type === 'link' &&
        item.type === 'menu' &&
        item.items &&
        item.items.length > 0
      ) {
        // Promote children to the item's parent
        const children = item.items

        // First, update the item (remove children, change type)
        let newItems = updateItemInTree(state.items, keyId, {
          ...updates,
          items: undefined,
        })

        // Find the parent of the item being updated
        const findParentKeyId = (
          items: NavItemDraft[],
          targetKeyId: string,
          parentKeyId: string | null = null
        ): string | null => {
          for (const i of items) {
            if (i.keyId === targetKeyId) return parentKeyId
            if (i.items) {
              const found = findParentKeyId(i.items, targetKeyId, i.keyId)
              if (found !== undefined) return found
            }
          }
          return undefined as unknown as null
        }

        const parentKeyId = findParentKeyId(newItems, keyId)

        // Insert children after the current item
        if (parentKeyId === null) {
          // Item is at top level
          const itemIndex = newItems.findIndex((i) => i.keyId === keyId)
          newItems = [
            ...newItems.slice(0, itemIndex + 1),
            ...children,
            ...newItems.slice(itemIndex + 1),
          ]
        } else {
          // Item is nested - add children to parent after this item
          const insertChildrenAfter = (
            items: NavItemDraft[],
            pKeyId: string,
            afterKeyId: string,
            childrenToInsert: NavItemDraft[]
          ): NavItemDraft[] =>
            items.map((i) => {
              if (i.keyId === pKeyId && i.items) {
                const idx = i.items.findIndex((c) => c.keyId === afterKeyId)
                return {
                  ...i,
                  items: [
                    ...i.items.slice(0, idx + 1),
                    ...childrenToInsert,
                    ...i.items.slice(idx + 1),
                  ],
                }
              }
              if (i.items) {
                return {
                  ...i,
                  items: insertChildrenAfter(i.items, pKeyId, afterKeyId, childrenToInsert),
                }
              }
              return i
            })

          newItems = insertChildrenAfter(newItems, parentKeyId, keyId, children)
        }

        return { items: newItems }
      }

      return { items: updateItemInTree(state.items, keyId, updates) }
    })
  },

  removeItem: (keyId) => {
    set((state) => ({
      items: removeItemFromTree(state.items, keyId),
      selectedItemId: state.selectedItemId === keyId ? null : state.selectedItemId,
    }))
  },

  moveItem: (keyId, direction) => {
    const state = get()
    const location = findParentAndIndex(state.items, keyId)
    if (!location) return

    const { parent, index } = location
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= parent.length) return

    const newParent = [...parent]
    const [item] = newParent.splice(index, 1)
    newParent.splice(newIndex, 0, item)

    // Rebuild the tree with the updated parent array
    const updateParentInTree = (
      items: NavItemDraft[],
      oldParent: NavItemDraft[],
      newParentArr: NavItemDraft[]
    ): NavItemDraft[] => {
      if (items === oldParent) return newParentArr
      return items.map((item) => {
        if (item.items === oldParent) {
          return { ...item, items: newParentArr }
        }
        if (item.items) {
          return { ...item, items: updateParentInTree(item.items, oldParent, newParentArr) }
        }
        return item
      })
    }

    set({
      items: updateParentInTree(state.items, parent, newParent),
    })
  },

  selectItem: (keyId) => {
    set({ selectedItemId: keyId })
  },

  toggleExpanded: (keyId) => {
    set((state) => ({
      items: updateItemInTree(state.items, keyId, {
        isExpanded: !findItemByKeyId(state.items, keyId)?.isExpanded,
      }),
    }))
  },

  setPreviewOpen: (open) => {
    set({ previewOpen: open })
  },

  reset: () => {
    set(initialState)
  },

  loadConfig: (items) => {
    set({ items, selectedItemId: null })
  },

  moveItemToParent: (itemKeyId, newParentKeyId, index) => {
    const state = get()

    // Find the item to move
    const itemToMove = findItemByKeyId(state.items, itemKeyId)
    if (!itemToMove) return

    // Can't move an item into itself or its descendants
    const isDescendant = (parentKeyId: string | null, childKeyId: string): boolean => {
      if (parentKeyId === null) return false
      if (parentKeyId === childKeyId) return true
      const parent = findItemByKeyId(state.items, parentKeyId)
      if (!parent?.items) return false
      return parent.items.some(
        (child) => child.keyId === childKeyId || isDescendant(child.keyId, childKeyId)
      )
    }

    if (newParentKeyId && isDescendant(itemKeyId, newParentKeyId)) return

    // Remove the item from its current location
    let newItems = removeItemFromTree(state.items, itemKeyId)

    // Add to new parent
    if (newParentKeyId === null) {
      // Add to top level
      if (index !== undefined) {
        newItems = [...newItems.slice(0, index), itemToMove, ...newItems.slice(index)]
      } else {
        newItems = [...newItems, itemToMove]
      }
    } else {
      // Add to a specific parent
      const addToParentAtIndex = (
        items: NavItemDraft[],
        parentKeyId: string,
        item: NavItemDraft,
        idx?: number
      ): NavItemDraft[] =>
        items.map((i) => {
          if (i.keyId === parentKeyId) {
            const children = i.items ?? []
            const newChildren =
              idx !== undefined
                ? [...children.slice(0, idx), item, ...children.slice(idx)]
                : [...children, item]
            return {
              ...i,
              type: 'menu' as const,
              items: newChildren,
              isExpanded: true,
            }
          }
          if (i.items) {
            return { ...i, items: addToParentAtIndex(i.items, parentKeyId, item, idx) }
          }
          return i
        })

      newItems = addToParentAtIndex(newItems, newParentKeyId, itemToMove, index)
    }

    set({ items: newItems })
  },
}))
