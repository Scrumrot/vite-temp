export interface User {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
  role: 'admin' | 'user' | 'guest'
  preferences?: UserPreferences
  tags: string[]
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: boolean
  language: string
}

export interface AppSettings {
  apiUrl: string
  timeout: number
  debug: boolean
  features: string[]
}
