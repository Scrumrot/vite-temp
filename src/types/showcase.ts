/**
 * Showcase type demonstrating all MUI form components
 * Generated form will include: TextField, Select, Switch, DatePicker,
 * array lists with add/delete, nested object sub-forms, and more.
 */

// === Sub-types for arrays ===

export interface ShowcaseAddress {
  label: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface ShowcaseManager {
  name: string
  email: string
  phone: string
}

export interface ShowcaseExperience {
  company: string
  position: string
  isCurrent: boolean
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary: number
}

export interface ShowcaseNotification {
  channel: 'email' | 'sms' | 'push' | 'slack'
  frequency: 'instant' | 'daily' | 'weekly' | 'monthly'
  enabled: boolean
}

export interface ShowcaseSocialLink {
  platform: 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram'
  url: string
  isPublic: boolean
}

// === Main showcase type ===

export interface MUIShowcase {
  // === Basic Text Fields ===
  firstName: string
  lastName: string
  email: string
  website: string

  // === Number Fields ===
  age: number
  salary: number
  yearsOfExperience: number

  // === Boolean (Switch) ===
  isActive: boolean
  receiveNewsletter: boolean
  agreeToTerms: boolean
  darkMode: boolean

  // === Date Fields ===
  birthDate: Date
  hireDate: Date

  // === Select Dropdowns (String Literal Unions) ===
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  priority: 'low' | 'medium' | 'high' | 'critical'
  role: 'admin' | 'editor' | 'viewer' | 'guest'
  department: 'engineering' | 'design' | 'marketing' | 'sales' | 'hr' | 'finance'

  // === Primitive Arrays (Add/Delete list) ===
  skills: string[]
  phoneNumbers: string[]

  // === Object Arrays (Sub-forms with all fields) ===
  addresses: ShowcaseAddress[]
  experiences: ShowcaseExperience[]
  notifications: ShowcaseNotification[]
  socialLinks: ShowcaseSocialLink[]
}
