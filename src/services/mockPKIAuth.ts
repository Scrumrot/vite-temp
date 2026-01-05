// Mock PKI Authentication Service
// Simulates the CAC/PKI authentication flow for development

export interface Certificate {
  id: string
  commonName: string
  issuer: string
  serialNumber: string
  validFrom: string
  validTo: string
  type: 'authentication' | 'signature' | 'encryption'
}

export interface PKIUser {
  edipi: string
  commonName: string
  firstName: string
  lastName: string
  email: string
  organization: string
  certificate: Certificate
}

// Mock certificates that would be read from a CAC
export const mockCertificates: Certificate[] = [
  {
    id: 'cert-auth',
    commonName: 'DOE.JOHN.Q.1234567890',
    issuer: 'DOD ID CA-59',
    serialNumber: '0A1B2C3D4E5F',
    validFrom: '2024-01-15',
    validTo: '2027-01-15',
    type: 'authentication',
  },
  {
    id: 'cert-sign',
    commonName: 'DOE.JOHN.Q.1234567890',
    issuer: 'DOD EMAIL CA-59',
    serialNumber: '1B2C3D4E5F6A',
    validFrom: '2024-01-15',
    validTo: '2027-01-15',
    type: 'signature',
  },
  {
    id: 'cert-enc',
    commonName: 'DOE.JOHN.Q.1234567890',
    issuer: 'DOD ID SW CA-75',
    serialNumber: '2C3D4E5F6A7B',
    validFrom: '2024-01-15',
    validTo: '2027-01-15',
    type: 'encryption',
  },
]

// Mock user that would be extracted from certificate
export const mockUser: Omit<PKIUser, 'certificate'> = {
  edipi: '1234567890',
  commonName: 'DOE.JOHN.Q.1234567890',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.q.doe.civ@mail.mil',
  organization: 'USAF',
}

// Simulated delays to mimic real hardware/network
const CARD_DETECT_DELAY = 1500
const PIN_VERIFY_DELAY = 1000
const AUTH_DELAY = 1500

// Valid mock PINs for testing (in real life, the CAC validates this)
const VALID_PINS = ['123456', '654321', '000000']

export type PKIAuthStep =
  | 'idle'
  | 'detecting-reader'
  | 'waiting-for-card'
  | 'reading-card'
  | 'select-certificate'
  | 'enter-pin'
  | 'verifying-pin'
  | 'authenticating'
  | 'success'
  | 'error'

export interface PKIAuthState {
  step: PKIAuthStep
  certificates: Certificate[]
  selectedCertificate: Certificate | null
  user: PKIUser | null
  error: string | null
}

export interface PKIAuthCallbacks {
  onStepChange: (step: PKIAuthStep) => void
  onCertificatesFound: (certs: Certificate[]) => void
  onSuccess: (user: PKIUser) => void
  onError: (error: string) => void
}

class MockPKIAuthService {
  private state: PKIAuthState = {
    step: 'idle',
    certificates: [],
    selectedCertificate: null,
    user: null,
    error: null,
  }

  private callbacks: PKIAuthCallbacks | null = null

  /**
   * Start the PKI authentication flow
   */
  startAuth(callbacks: PKIAuthCallbacks): void {
    this.callbacks = callbacks
    this.setState('detecting-reader')

    // Simulate detecting card reader
    setTimeout(() => {
      this.setState('waiting-for-card')

      // Simulate card insertion detection
      setTimeout(() => {
        this.setState('reading-card')

        // Simulate reading certificates from card
        setTimeout(() => {
          this.state.certificates = mockCertificates
          callbacks.onCertificatesFound(mockCertificates)
          this.setState('select-certificate')
        }, 800)
      }, CARD_DETECT_DELAY)
    }, 500)
  }

  /**
   * User selects a certificate
   */
  selectCertificate(certId: string): void {
    const cert = this.state.certificates.find(c => c.id === certId)
    if (cert) {
      this.state.selectedCertificate = cert
      this.setState('enter-pin')
    }
  }

  /**
   * User enters PIN
   */
  submitPin(pin: string): Promise<PKIUser> {
    return new Promise((resolve, reject) => {
      this.setState('verifying-pin')

      setTimeout(() => {
        // Validate PIN format
        if (!/^\d{6,8}$/.test(pin)) {
          this.setState('enter-pin')
          const error = 'Invalid PIN format. PIN must be 6-8 digits.'
          this.callbacks?.onError(error)
          reject(new Error(error))
          return
        }

        // Check against valid mock PINs (or accept any valid format in dev)
        const isValidPin = VALID_PINS.includes(pin) || pin.length >= 6

        if (!isValidPin) {
          this.setState('enter-pin')
          const error = 'Incorrect PIN. Please try again.'
          this.callbacks?.onError(error)
          reject(new Error(error))
          return
        }

        // PIN verified, now authenticate with server
        this.setState('authenticating')

        setTimeout(() => {
          const user: PKIUser = {
            ...mockUser,
            certificate: this.state.selectedCertificate!,
          }

          this.state.user = user
          this.setState('success')
          this.callbacks?.onSuccess(user)
          resolve(user)
        }, AUTH_DELAY)
      }, PIN_VERIFY_DELAY)
    })
  }

  /**
   * Cancel the authentication flow
   */
  cancel(): void {
    this.reset()
  }

  /**
   * Reset the service state
   */
  reset(): void {
    this.state = {
      step: 'idle',
      certificates: [],
      selectedCertificate: null,
      user: null,
      error: null,
    }
    this.callbacks = null
  }

  /**
   * Get current state
   */
  getState(): PKIAuthState {
    return { ...this.state }
  }

  private setState(step: PKIAuthStep): void {
    this.state.step = step
    this.callbacks?.onStepChange(step)
  }
}

// Export singleton instance
export const mockPKIAuth = new MockPKIAuthService()
