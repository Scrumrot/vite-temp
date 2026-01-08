import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FolderIcon from '@mui/icons-material/Folder'
import LinkIcon from '@mui/icons-material/Link'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import type { NavItemDraft } from '../types'

interface FlatItem {
  item: NavItemDraft
  depth: number
  parentKeyId: string | null
  index: number
}

// Flatten the tree for sortable context
function flattenItems(
  items: NavItemDraft[],
  depth = 0,
  parentKeyId: string | null = null
): FlatItem[] {
  const result: FlatItem[] = []
  items.forEach((item, index) => {
    result.push({ item, depth, parentKeyId, index })
    if (item.type === 'menu' && item.items && item.isExpanded !== false) {
      result.push(...flattenItems(item.items, depth + 1, item.keyId))
    }
  })
  return result
}

type DropPosition = 'before' | 'after' | 'inside'

interface SortableTreeItemProps {
  flatItem: FlatItem
  isSelected: boolean
  isDragging: boolean
  isOver: boolean
  dropPosition: DropPosition | null
  onSelect: (id: string) => void
  onAdd: (parentId: string) => void
  onRemove: (id: string) => void
  onToggleExpanded: (id: string) => void
}

const SortableTreeItem = ({
  flatItem,
  isSelected,
  isDragging,
  isOver,
  dropPosition,
  onSelect,
  onAdd,
  onRemove,
  onToggleExpanded,
}: SortableTreeItemProps) => {
  const { item, depth } = flatItem
  const hasChildren = item.type === 'menu' && (item.items?.length ?? 0) > 0
  const isExpanded = item.isExpanded ?? true

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.keyId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const showInsideIndicator = isOver && dropPosition === 'inside' && item.type === 'menu'

  return (
    <Box ref={setNodeRef} style={style}>
      {/* Drop indicator before */}
      {isOver && dropPosition === 'before' && (
        <Box
          sx={{
            height: 3,
            bgcolor: 'primary.main',
            ml: depth * 2.5 + 4,
            mr: 1,
            borderRadius: 1,
            my: 0.5,
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: depth * 2.5,
          py: 0.75,
          pr: 1,
          cursor: 'pointer',
          bgcolor: showInsideIndicator
            ? 'primary.light'
            : isSelected
            ? 'action.selected'
            : 'transparent',
          borderRadius: 1,
          border: showInsideIndicator ? '2px solid' : '2px solid transparent',
          borderColor: showInsideIndicator ? 'primary.main' : 'transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isSelected ? 'action.selected' : 'action.hover',
          },
        }}
        onClick={() => onSelect(item.keyId)}
      >
        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            mr: 0.5,
            p: 0.25,
            borderRadius: 0.5,
            '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
            '&:active': { cursor: 'grabbing' },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>

        {item.type === 'menu' ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(item.keyId)
            }}
            sx={{ p: 0.25 }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )
            ) : (
              <Box sx={{ width: 20 }} />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} />
        )}

        {item.type === 'menu' ? (
          <FolderIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
        ) : (
          <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        )}

        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            fontWeight: isSelected ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 0.25,
            opacity: isSelected ? 1 : 0,
            transition: 'opacity 0.15s',
            '.MuiBox-root:hover > &': { opacity: 1 },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === 'menu' && (
            <Tooltip title="Add child">
              <IconButton size="small" onClick={() => onAdd(item.keyId)} color="primary">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onRemove(item.keyId)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Drop inside indicator for menus - shown below the item */}
      {showInsideIndicator && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: (depth + 1) * 2.5 + 4,
            mr: 1,
            py: 0.5,
            color: 'primary.main',
          }}
        >
          <SubdirectoryArrowRightIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={500}>
            Drop as child
          </Typography>
        </Box>
      )}

      {/* Drop indicator after */}
      {isOver && dropPosition === 'after' && (
        <Box
          sx={{
            height: 3,
            bgcolor: 'primary.main',
            ml: depth * 2.5 + 4,
            mr: 1,
            borderRadius: 1,
            my: 0.5,
          }}
        />
      )}
    </Box>
  )
}

// Dragging overlay item (ghost)
const DragOverlayItem = ({ item }: { item: NavItemDraft }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      pl: 1,
      py: 0.75,
      pr: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 4,
      border: '1px solid',
      borderColor: 'primary.main',
    }}
  >
    <DragIndicatorIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
    {item.type === 'menu' ? (
      <FolderIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
    ) : (
      <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
    )}
    <Typography variant="body2" fontWeight={500}>
      {item.label}
    </Typography>
  </Box>
)

interface NavTreeViewProps {
  items: NavItemDraft[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (parentId: string | null) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onMoveToParent: (itemKeyId: string, newParentKeyId: string | null, index?: number) => void
  onToggleExpanded: (id: string) => void
}

export const NavTreeView = ({
  items,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onMoveToParent,
  onToggleExpanded,
}: NavTreeViewProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const flatItems = flattenItems(items)
  const activeItem = activeId ? flatItems.find((f) => f.item.keyId === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, delta } = event

    if (!over || !containerRef.current) {
      setOverId(null)
      setDropPosition(null)
      return
    }

    const overIdValue = over.id as string
    setOverId(overIdValue)

    const overItem = flatItems.find((f) => f.item.keyId === overIdValue)
    if (!overItem) return

    // Get the over element's bounding rect from DnD kit
    const overRect = over.rect
    if (!overRect) return

    // Calculate current pointer position using initial + delta
    const initialRect = event.active.rect.current.initial
    if (!initialRect) return

    const currentY = initialRect.top + delta.y + initialRect.height / 2
    const currentX = initialRect.left + delta.x

    // Calculate relative position within the over item
    const relativeY = currentY - overRect.top
    const heightRatio = relativeY / overRect.height

    // Get container's left edge for horizontal positioning
    const containerRect = containerRef.current.getBoundingClientRect()
    const relativeX = currentX - containerRect.left

    // Calculate expected indent for the over item's depth
    const depthIndent = overItem.depth * 20 + 40 // 2.5 * 8px = 20px per level + base padding

    // Determine drop position based on vertical and horizontal position
    if (overItem.item.type === 'menu') {
      // For menu items, we have three zones: before (top 25%), inside (middle 50%), after (bottom 25%)
      if (heightRatio < 0.25) {
        setDropPosition('before')
      } else if (heightRatio > 0.75) {
        setDropPosition('after')
      } else {
        // In the middle - check horizontal position
        // If dragged further right (more indented), drop inside
        // If at same level or less, still drop inside for menus
        setDropPosition('inside')
      }
    } else {
      // For link items, only before/after (top 50% / bottom 50%)
      if (heightRatio < 0.5) {
        setDropPosition('before')
      } else {
        setDropPosition('after')
      }
    }

    // Special case: if dragging significantly to the left (outdenting), prefer sibling placement
    if (relativeX < depthIndent - 30 && dropPosition === 'inside') {
      setDropPosition('after')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && dropPosition) {
      const activeKeyId = active.id as string
      const overKeyId = over.id as string

      const overItem = flatItems.find((f) => f.item.keyId === overKeyId)
      if (!overItem) return

      if (dropPosition === 'inside' && overItem.item.type === 'menu') {
        // Drop as first child of the menu item
        onMoveToParent(activeKeyId, overKeyId, 0)
      } else if (dropPosition === 'before') {
        // Drop before the over item (same parent as over item)
        onMoveToParent(activeKeyId, overItem.parentKeyId, overItem.index)
      } else {
        // Drop after the over item (same parent as over item)
        onMoveToParent(activeKeyId, overItem.parentKeyId, overItem.index + 1)
      }
    }

    setActiveId(null)
    setOverId(null)
    setDropPosition(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
    setDropPosition(null)
  }

  return (
    <Paper sx={{ p: 1, minHeight: 300 }} ref={containerRef}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Navigation Structure
        </Typography>
        <Tooltip title="Add root item">
          <IconButton size="small" onClick={() => onAdd(null)} color="primary">
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">No items yet. Click + to add one.</Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={flatItems.map((f) => f.item.keyId)}
            strategy={verticalListSortingStrategy}
          >
            {flatItems.map((flatItem) => (
              <SortableTreeItem
                key={flatItem.item.keyId}
                flatItem={flatItem}
                isSelected={selectedId === flatItem.item.keyId}
                isDragging={activeId === flatItem.item.keyId}
                isOver={overId === flatItem.item.keyId}
                dropPosition={overId === flatItem.item.keyId ? dropPosition : null}
                onSelect={onSelect}
                onAdd={onAdd}
                onRemove={onRemove}
                onToggleExpanded={onToggleExpanded}
              />
            ))}
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeItem ? <DragOverlayItem item={activeItem.item} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Drop zone for adding to top-level at end */}
      {items.length > 0 && (
        <Box
          sx={{
            height: 32,
            mt: 1,
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              opacity: 1,
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => onAdd(null)}
        >
          <AddIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Add to end
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
