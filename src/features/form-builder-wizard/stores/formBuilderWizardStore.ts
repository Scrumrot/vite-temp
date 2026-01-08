import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  WizardStep,
  StoreConfigOptions,
  ParsedDeclaration,
  ValidationRuleConfig,
  TieredValidationResult,
  FieldTypeConfig,
} from '../types'

const STEP_ORDER: WizardStep[] = [
  'type-input',
  'schema-preview',
  'store-config',
  'form-preview',
  'export',
]

interface FormBuilderWizardState {
  // Navigation
  currentStep: WizardStep
  completedSteps: WizardStep[]

  // Step 1: Type Input
  typeScriptCode: string
  parsedDeclarations: ParsedDeclaration[]
  parseErrors: string[]
  selectedTypes: string[]

  // Step 2: Schema Preview
  generatedSchemaCode: string
  validationRules: ValidationRuleConfig[]

  // Step 3: Store Config
  storeOptions: StoreConfigOptions
  generatedStoreCode: string

  // Step 4: Form Preview
  generatedFormCode: string
  previewData: Record<string, unknown>
  validationResult: TieredValidationResult<unknown> | null
  excludedFields: string[]
  fieldTypeConfigs: Record<string, FieldTypeConfig>
  fieldOrder: string[] // Custom field order (empty = use default order)

  // Step 5: Export
  exportFormat: 'separate-files' | 'single-file' | 'clipboard'
}

interface FormBuilderWizardActions {
  // Navigation
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  markStepComplete: (step: WizardStep) => void
  canProceed: () => boolean

  // Step 1
  setTypeScriptCode: (code: string) => void
  setParsedDeclarations: (declarations: ParsedDeclaration[]) => void
  setParseErrors: (errors: string[]) => void
  toggleSelectedType: (typeName: string) => void
  selectAllTypes: () => void
  deselectAllTypes: () => void

  // Step 2
  setGeneratedSchemaCode: (code: string) => void
  addValidationRule: (rule: ValidationRuleConfig) => void
  updateValidationRule: (index: number, rule: Partial<ValidationRuleConfig>) => void
  removeValidationRule: (index: number) => void
  clearValidationRules: () => void

  // Step 3
  setStoreOptions: (options: Partial<StoreConfigOptions>) => void
  setGeneratedStoreCode: (code: string) => void

  // Step 4
  setGeneratedFormCode: (code: string) => void
  setPreviewData: (data: Record<string, unknown>) => void
  updatePreviewField: (field: string, value: unknown) => void
  setValidationResult: (result: TieredValidationResult<unknown> | null) => void
  toggleFieldVisibility: (fieldName: string) => void
  setExcludedFields: (fields: string[]) => void
  isFieldExcluded: (fieldName: string) => boolean
  setFieldTypeConfig: (fieldName: string, config: FieldTypeConfig) => void
  updateFieldTypeConfig: (fieldName: string, updates: Partial<FieldTypeConfig>) => void
  removeFieldTypeConfig: (fieldName: string) => void
  getFieldTypeConfig: (fieldName: string) => FieldTypeConfig | undefined
  setFieldOrder: (order: string[]) => void
  reorderField: (fromIndex: number, toIndex: number) => void

  // Step 5
  setExportFormat: (format: 'separate-files' | 'single-file' | 'clipboard') => void

  // Reset
  resetWizard: () => void
}

const initialState: FormBuilderWizardState = {
  currentStep: 'type-input',
  completedSteps: [],
  typeScriptCode: `// Paste your TypeScript interface or type here
export interface User {
  id: string
  name: string
  email: string
  age?: number
  role: 'admin' | 'user' | 'guest'
  isActive: boolean
  createdAt: Date
}`,
  parsedDeclarations: [],
  parseErrors: [],
  selectedTypes: [],
  generatedSchemaCode: '',
  validationRules: [],
  storeOptions: {
    persist: true,
    storageKey: '',
    generateArrayActions: true,
  },
  generatedStoreCode: '',
  generatedFormCode: '',
  previewData: {},
  validationResult: null,
  excludedFields: [],
  fieldTypeConfigs: {},
  fieldOrder: [],
  exportFormat: 'separate-files',
}

export const useFormBuilderWizardStore = create<
  FormBuilderWizardState & FormBuilderWizardActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, completedSteps } = get()
        const currentIndex = STEP_ORDER.indexOf(currentStep)
        if (currentIndex < STEP_ORDER.length - 1) {
          const newCompletedSteps = completedSteps.includes(currentStep)
            ? completedSteps
            : [...completedSteps, currentStep]
          set({
            currentStep: STEP_ORDER[currentIndex + 1],
            completedSteps: newCompletedSteps,
          })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        const currentIndex = STEP_ORDER.indexOf(currentStep)
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] })
        }
      },

      markStepComplete: (step) => {
        const { completedSteps } = get()
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] })
        }
      },

      canProceed: () => {
        const { currentStep, parseErrors, parsedDeclarations, selectedTypes } = get()
        switch (currentStep) {
          case 'type-input':
            return parseErrors.length === 0 && parsedDeclarations.length > 0 && selectedTypes.length > 0
          case 'schema-preview':
          case 'store-config':
          case 'form-preview':
            return true
          case 'export':
            return false
          default:
            return true
        }
      },

      // Step 1
      setTypeScriptCode: (code) => set({ typeScriptCode: code }),

      setParsedDeclarations: (declarations) => {
        const exportedTypes = declarations.filter((d) => d.isExported).map((d) => d.name)
        set({
          parsedDeclarations: declarations,
          selectedTypes: exportedTypes.length > 0 ? exportedTypes : declarations.map((d) => d.name),
        })
      },

      setParseErrors: (errors) => set({ parseErrors: errors }),

      toggleSelectedType: (typeName) => {
        const { selectedTypes } = get()
        set({
          selectedTypes: selectedTypes.includes(typeName)
            ? selectedTypes.filter((t) => t !== typeName)
            : [...selectedTypes, typeName],
        })
      },

      selectAllTypes: () => {
        const { parsedDeclarations } = get()
        set({ selectedTypes: parsedDeclarations.map((d) => d.name) })
      },

      deselectAllTypes: () => set({ selectedTypes: [] }),

      // Step 2
      setGeneratedSchemaCode: (code) => set({ generatedSchemaCode: code }),

      addValidationRule: (rule) =>
        set((state) => ({
          validationRules: [...state.validationRules, rule],
        })),

      updateValidationRule: (index, updates) =>
        set((state) => ({
          validationRules: state.validationRules.map((r, i) =>
            i === index ? { ...r, ...updates } : r
          ),
        })),

      removeValidationRule: (index) =>
        set((state) => ({
          validationRules: state.validationRules.filter((_, i) => i !== index),
        })),

      clearValidationRules: () => set({ validationRules: [] }),

      // Step 3
      setStoreOptions: (options) =>
        set((state) => ({
          storeOptions: { ...state.storeOptions, ...options },
        })),

      setGeneratedStoreCode: (code) => set({ generatedStoreCode: code }),

      // Step 4
      setGeneratedFormCode: (code) => set({ generatedFormCode: code }),

      setPreviewData: (data) => set({ previewData: data }),

      updatePreviewField: (field, value) =>
        set((state) => ({
          previewData: { ...state.previewData, [field]: value },
        })),

      setValidationResult: (result) => set({ validationResult: result }),

      toggleFieldVisibility: (fieldName) =>
        set((state) => ({
          excludedFields: state.excludedFields.includes(fieldName)
            ? state.excludedFields.filter((f) => f !== fieldName)
            : [...state.excludedFields, fieldName],
        })),

      setExcludedFields: (fields) => set({ excludedFields: fields }),

      isFieldExcluded: (fieldName) => get().excludedFields.includes(fieldName),

      setFieldTypeConfig: (fieldName, config) =>
        set((state) => ({
          fieldTypeConfigs: { ...state.fieldTypeConfigs, [fieldName]: config },
        })),

      updateFieldTypeConfig: (fieldName, updates) =>
        set((state) => ({
          fieldTypeConfigs: {
            ...state.fieldTypeConfigs,
            [fieldName]: state.fieldTypeConfigs[fieldName]
              ? { ...state.fieldTypeConfigs[fieldName], ...updates }
              : { component: 'TextField', ...updates },
          },
        })),

      removeFieldTypeConfig: (fieldName) =>
        set((state) => {
          const { [fieldName]: _, ...rest } = state.fieldTypeConfigs
          return { fieldTypeConfigs: rest }
        }),

      getFieldTypeConfig: (fieldName) => get().fieldTypeConfigs[fieldName],

      setFieldOrder: (order) => set({ fieldOrder: order }),

      reorderField: (fromIndex, toIndex) =>
        set((state) => {
          const newOrder = [...state.fieldOrder]
          const [removed] = newOrder.splice(fromIndex, 1)
          newOrder.splice(toIndex, 0, removed)
          return { fieldOrder: newOrder }
        }),

      // Step 5
      setExportFormat: (format) => set({ exportFormat: format }),

      // Reset
      resetWizard: () => set({ ...initialState, typeScriptCode: initialState.typeScriptCode }),
    }),
    {
      name: 'form-builder-wizard-storage',
      partialize: (state) => ({
        // Only persist certain fields, not the entire state
        typeScriptCode: state.typeScriptCode,
        storeOptions: state.storeOptions,
        exportFormat: state.exportFormat,
      }),
    }
  )
)

export { STEP_ORDER }
