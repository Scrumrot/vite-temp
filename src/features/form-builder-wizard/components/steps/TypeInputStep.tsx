import { useCallback, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CodeEditor from '../CodeEditor'
import { useFormBuilderWizardStore } from '../../stores/formBuilderWizardStore'
import { parseTypeScriptString } from '../../lib/browser-parser'

export default function TypeInputStep() {
  const {
    typeScriptCode,
    setTypeScriptCode,
    parsedDeclarations,
    setParsedDeclarations,
    parseErrors,
    setParseErrors,
    selectedTypes,
    toggleSelectedType,
    selectAllTypes,
    deselectAllTypes,
  } = useFormBuilderWizardStore()

  // Parse code whenever it changes
  const handleCodeChange = useCallback(
    (code: string) => {
      setTypeScriptCode(code)

      // Debounce parsing
      const trimmed = code.trim()
      if (!trimmed) {
        setParsedDeclarations([])
        setParseErrors([])
        return
      }

      try {
        const result = parseTypeScriptString(trimmed)
        setParsedDeclarations(result.declarations)
        setParseErrors(result.errors)
      } catch (e) {
        setParseErrors([e instanceof Error ? e.message : 'Unknown parsing error'])
        setParsedDeclarations([])
      }
    },
    [setTypeScriptCode, setParsedDeclarations, setParseErrors]
  )

  // Parse initial code on mount
  useEffect(() => {
    if (typeScriptCode && parsedDeclarations.length === 0 && parseErrors.length === 0) {
      handleCodeChange(typeScriptCode)
    }
  }, [])

  const hasErrors = parseErrors.length > 0
  const hasDeclarations = parsedDeclarations.length > 0

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 1: Enter TypeScript Types
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Paste your TypeScript interface, type alias, or enum definitions below. The wizard will
        generate Zod schemas, Zustand stores, and forms from your types.
      </Typography>

      <CodeEditor
        value={typeScriptCode}
        onChange={handleCodeChange}
        language="typescript"
        placeholder="// Paste your TypeScript types here..."
        height="350px"
        error={hasErrors}
      />

      {/* Parse Errors */}
      {hasErrors && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {parseErrors.map((error, i) => (
            <Alert key={i} severity="error">
              {error}
            </Alert>
          ))}
        </Stack>
      )}

      {/* Parsed Types */}
      {hasDeclarations && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Found {parsedDeclarations.length} type{parsedDeclarations.length !== 1 ? 's' : ''}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={selectAllTypes}>
                Select All
              </Button>
              <Button size="small" onClick={deselectAllTypes}>
                Deselect All
              </Button>
            </Stack>
          </Stack>

          <FormGroup>
            {parsedDeclarations.map((decl) => (
              <FormControlLabel
                key={decl.name}
                control={
                  <Checkbox
                    checked={selectedTypes.includes(decl.name)}
                    onChange={() => toggleSelectedType(decl.name)}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{decl.name}</Typography>
                    <Chip
                      label={decl.type.kind}
                      size="small"
                      variant="outlined"
                      color={decl.type.kind === 'object' ? 'primary' : 'default'}
                    />
                    {decl.isExported && (
                      <Chip label="exported" size="small" color="success" variant="outlined" />
                    )}
                    {decl.dependencies.size > 0 && (
                      <Chip
                        label={`deps: ${Array.from(decl.dependencies).join(', ')}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                }
              />
            ))}
          </FormGroup>

          {selectedTypes.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please select at least one type to continue.
            </Alert>
          )}
        </Box>
      )}

      {!hasErrors && !hasDeclarations && typeScriptCode.trim() && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No interfaces, type aliases, or enums found. Make sure your code includes valid TypeScript
          type definitions.
        </Alert>
      )}
    </Box>
  )
}
