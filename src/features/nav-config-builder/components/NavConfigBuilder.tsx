import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import PreviewIcon from '@mui/icons-material/Preview'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CodeIcon from '@mui/icons-material/Code'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CloseIcon from '@mui/icons-material/Close'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { useNavConfigBuilderStore } from '../store'
import { draftToNavConfig, generateConfigCode, type NavItemDraft } from '../types'
import { parseNavConfigCode, validateParsedItems } from '../parseNavConfig'
import { NavTreeView } from './NavTreeView'
import { NavItemEditor } from './NavItemEditor'
import { Nav } from '../../../components/Nav'

export const NavConfigBuilder = () => {
  const {
    items,
    selectedItemId,
    previewOpen,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    selectItem,
    toggleExpanded,
    setPreviewOpen,
    reset,
    loadConfig,
    moveItemToParent,
  } = useNavConfigBuilderStore()

  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const selectedItem = useMemo(() => {
    const findItem = (itemList: NavItemDraft[], keyId: string): NavItemDraft | null => {
      for (const item of itemList) {
        if (item.keyId === keyId) return item
        if (item.items) {
          const found = findItem(item.items, keyId)
          if (found) return found
        }
      }
      return null
    }
    return selectedItemId ? findItem(items, selectedItemId) : null
  }, [items, selectedItemId])

  const navConfig = useMemo(() => draftToNavConfig(items), [items])
  const configCode = useMemo(() => generateConfigCode(items), [items])

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(configCode)
    setSnackbarMessage('Code copied to clipboard!')
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
  }

  const handleOpenImportDialog = () => {
    setImportCode('')
    setImportErrors([])
    setImportDialogOpen(true)
  }

  const handleImport = () => {
    const { items: parsedItems, errors } = parseNavConfigCode(importCode)

    if (errors.length > 0) {
      setImportErrors(errors)
      return
    }

    if (parsedItems.length === 0) {
      setImportErrors(['No valid items found in the config'])
      return
    }

    const validationErrors = validateParsedItems(parsedItems)
    if (validationErrors.length > 0) {
      setImportErrors(validationErrors)
      return
    }

    loadConfig(parsedItems)
    setImportDialogOpen(false)
    setSnackbarMessage(`Imported ${parsedItems.length} item(s) successfully!`)
    setSnackbarSeverity('success')
    setSnackbarOpen(true)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleOpenImportDialog}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewOpen(true)}
            disabled={items.length === 0}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setCodeDialogOpen(true)}
            disabled={items.length === 0}
          >
            View Code
          </Button>
          <Button variant="outlined" color="error" startIcon={<RestartAltIcon />} onClick={reset}>
            Reset
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <NavTreeView
            items={items}
            selectedId={selectedItemId}
            onSelect={selectItem}
            onAdd={addItem}
            onRemove={removeItem}
            onMove={moveItem}
            onMoveToParent={moveItemToParent}
            onToggleExpanded={toggleExpanded}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {selectedItem ? (
            <NavItemEditor
              item={selectedItem}
              onUpdate={(updates) => updateItem(selectedItem.keyId, updates)}
            />
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                Select an item from the tree to edit its properties, or add a new item.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '50vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Navigation Preview
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Nav config={navConfig} title="Preview" />
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Click the menu buttons above to test the navigation structure.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Generated Config Code
          <IconButton onClick={() => setCodeDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" paragraph>
            Copy this code and add the necessary icon imports to your file.
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'grey.900',
              color: 'grey.100',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflow: 'auto',
              maxHeight: 400,
              whiteSpace: 'pre',
            }}
          >
            {configCode}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyCode}>
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Import NavConfig
          <IconButton onClick={() => setImportDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Paste your existing navConfig code below. The parser will extract the items and load them into the builder.
          </Typography>
          <TextField
            multiline
            fullWidth
            minRows={10}
            maxRows={20}
            value={importCode}
            onChange={(e) => {
              setImportCode(e.target.value)
              setImportErrors([])
            }}
            placeholder={`const navConfig: NavConfig = {
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      to: '/dashboard',
    },
    // ... more items
  ],
}`}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              },
            }}
          />
          {importErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Import errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {importErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          {items.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Importing will replace your current configuration.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={handleImport}
            disabled={!importCode.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
