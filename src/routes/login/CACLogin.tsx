import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import SecurityIcon from '@mui/icons-material/Security'
import BadgeIcon from '@mui/icons-material/Badge'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ErrorIcon from '@mui/icons-material/Error'
import {
  mockPKIAuth,
  type Certificate,
  type PKIUser,
  type PKIAuthStep,
} from '../../services/mockPKIAuth.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'

const USG_INTRO = `You are accessing a U.S. Government (USG) Information System (IS) that is provided for USG-authorized use only.

By using this IS (which includes any device attached to this IS), you consent to the following conditions:`

const USG_BULLETS = [
  'The USG routinely intercepts and monitors communications on this IS for purposes including, but not limited to, penetration testing, COMSEC monitoring, network operations and defense, personnel misconduct (PM), law enforcement (LE), and counterintelligence (CI) investigations.',
  'At any time, the USG may inspect and seize data stored on this IS.',
  'Communications using, or data stored on, this IS are not private, are subject to routine monitoring, interception, and search, and may be disclosed or used for any USG authorized purpose.',
  'This IS includes security measures (e.g., authentication and access controls) to protect USG interests--not for your personal benefit or privacy.',
  'NOTICE: There is the potential that information presented and exported from the AF Portal contains FOUO or Controlled Unclassified Information (CUI). It is the responsibility of all users to ensure information extracted from the AF Portal is appropriately marked and properly safeguarded. If you are not sure of the safeguards necessary for the information, contact your functional lead or Information Security Officer.',
]

export default function CACLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [acknowledged, setAcknowledged] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState<PKIAuthStep>('idle')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCert, setSelectedCert] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [user, setUser] = useState<PKIUser | null>(null)

  const from = (location.state as { from?: string })?.from || '/'

  const handlePKILogin = useCallback(() => {
    setDialogOpen(true)
    setPinError(null)
    setPin('')
    setSelectedCert(null)

    mockPKIAuth.startAuth({
      onStepChange: setStep,
      onCertificatesFound: setCertificates,
      onSuccess: (authenticatedUser) => {
        setUser(authenticatedUser)
        // Save session
        login(authenticatedUser)
        // Redirect after brief success display
        setTimeout(() => {
          setDialogOpen(false)
          navigate(from, { replace: true })
        }, 2000)
      },
      onError: (error) => {
        setPinError(error)
      },
    })
  }, [from, navigate])

  const handleCertSelect = (certId: string) => {
    setSelectedCert(certId)
  }

  const handleCertConfirm = () => {
    if (selectedCert) {
      mockPKIAuth.selectCertificate(selectedCert)
    }
  }

  const handlePinSubmit = async () => {
    setPinError(null)
    try {
      await mockPKIAuth.submitPin(pin)
    } catch {
      // Error handled by callback
    }
  }

  const handleClose = () => {
    if (step === 'verifying-pin' || step === 'authenticating' || step === 'success') {
      return // Don't allow closing during critical steps
    }
    mockPKIAuth.cancel()
    setDialogOpen(false)
    setStep('idle')
  }

  const getCertTypeLabel = (type: Certificate['type']) => {
    switch (type) {
      case 'authentication': return 'ID Certificate'
      case 'signature': return 'Email/Signature Certificate'
      case 'encryption': return 'Encryption Certificate'
      default: return type
    }
  }

  const renderDialogContent = () => {
    switch (step) {
      case 'detecting-reader':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Detecting smart card reader...</Typography>
          </Box>
        )

      case 'waiting-for-card':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CreditCardIcon sx={{ fontSize: 64, color: 'action.active', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Please insert your CAC into the card reader
            </Typography>
            <LinearProgress sx={{ mt: 2, mx: 'auto', maxWidth: 200 }} />
          </Box>
        )

      case 'reading-card':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Reading card certificates...</Typography>
          </Box>
        )

      case 'select-certificate':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a certificate for authentication:
            </Typography>
            <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1}}>
              {certificates.map((cert) => (
                <ListItemButton
                  key={cert.id}
                  selected={selectedCert === cert.id}
                  onClick={() => handleCertSelect(cert.id)}
                >
                  <ListItemIcon>
                    <VerifiedUserIcon color={selectedCert === cert.id ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={cert.commonName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {getCertTypeLabel(cert.type)}
                        </Typography>
                        {` — Issued by: ${cert.issuer}`}
                        <br />
                        {`Valid: ${cert.validFrom} to ${cert.validTo}`}
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )

      case 'enter-pin':
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <VpnKeyIcon color="primary" />
              <Typography variant="body1">
                Enter PIN for: <strong>{certificates.find(c => c.id === selectedCert)?.commonName}</strong>
              </Typography>
            </Box>

            {pinError && (
              <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
                {pinError}
              </Alert>
            )}

            <TextField
              fullWidth
              type="password"
              label="CAC PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setPinError(null)
              }}
              placeholder="Enter 6-8 digit PIN"
              inputProps={{
                maxLength: 8,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                autoComplete: 'off',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pin.length >= 6) {
                  handlePinSubmit()
                }
              }}
              helperText="Enter your 6-8 digit CAC PIN"
            />

            <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>Mock Mode:</strong> Any 6+ digit PIN will work. Try: 123456
              </Typography>
            </Alert>
          </Box>
        )

      case 'verifying-pin':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Verifying PIN...</Typography>
          </Box>
        )

      case 'authenticating':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Authenticating with server...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Validating certificate chain
            </Typography>
          </Box>
        )

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              Authentication Successful
            </Typography>
            {user && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Welcome,</strong> {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  EDIPI: {user.edipi} | {user.organization}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Redirecting...
            </Typography>
          </Box>
        )

      default:
        return null
    }
  }

  const getDialogTitle = () => {
    switch (step) {
      case 'detecting-reader':
      case 'waiting-for-card':
      case 'reading-card':
        return 'Smart Card Reader'
      case 'select-certificate':
        return 'Select a Certificate'
      case 'enter-pin':
      case 'verifying-pin':
        return 'Windows Security'
      case 'authenticating':
        return 'Authenticating'
      case 'success':
        return 'Success'
      default:
        return 'CAC Authentication'
    }
  }

  const canClose = !['verifying-pin', 'authenticating', 'success'].includes(step)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4} alignItems="center">
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <BadgeIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Secure Access
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Department of Defense Common Access Card (CAC) Authentication
              </Typography>
            </Box>

            {/* PKI Login Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<SecurityIcon />}
              onClick={handlePKILogin}
              sx={{ py: 2, fontSize: '1.1rem' }}
            >
              PKI Login
            </Button>

            {/* Instructions */}
            <Box
              sx={{
                textAlign: 'center',
                p: 3,
                bgcolor: 'action.hover',
                borderRadius: 2,
                width: '100%',
              }}
            >
              <CreditCardIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Insert your CAC / ECA to begin your login
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                A smart card reader is required for authentication
              </Typography>
            </Box>

            {/* Security Notice */}
            <Alert severity="warning" sx={{ width: '100%' }}>
              <Typography variant="body2">
                <strong>Notice:</strong> This is a U.S. Government system. Unauthorized access is
                prohibited and subject to criminal and civil penalties.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Certificate Selection / PIN Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={canClose ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            // Style to look more like a system dialog
            borderRadius: 1,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: step === 'enter-pin' || step === 'verifying-pin' ? 'primary.main' : 'grey.100',
            color: step === 'enter-pin' || step === 'verifying-pin' ? 'white' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {(step === 'enter-pin' || step === 'verifying-pin') && <VpnKeyIcon />}
          {step === 'select-certificate' && <SecurityIcon />}
          {getDialogTitle()}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {renderDialogContent()}
        </DialogContent>

        <DialogActions>
          {canClose && step !== 'success' && (
            <Button onClick={handleClose}>Cancel</Button>
          )}
          {step === 'select-certificate' && (
            <Button
              variant="contained"
              onClick={handleCertConfirm}
              disabled={!selectedCert}
            >
              OK
            </Button>
          )}
          {step === 'enter-pin' && (
            <Button
              variant="contained"
              onClick={handlePinSubmit}
              disabled={pin.length < 6}
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* USG Acknowledgment Dialog */}
      <Dialog
        open={!acknowledged}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            fontWeight: 'bold',
          }}
        >
          Notice:
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography
            variant="h6"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              mb: 2,
            }}
          >
            {USG_INTRO}
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, listStyleType: 'disc'  }}>
            {USG_BULLETS.map((bullet, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                sx={{ mb: 1.5, lineHeight: 1.6 }}
              >
                {bullet}
              </Typography>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setAcknowledged(true)}
            sx={{ minWidth: 200 }}
          >
            I Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
