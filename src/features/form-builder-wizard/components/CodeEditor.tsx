import { useCallback, useRef } from 'react'
import Box from '@mui/material/Box'
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import type { editor, Uri } from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'typescript' | 'javascript' | 'json'
  placeholder?: string
  minRows?: number
  maxRows?: number
  readOnly?: boolean
  error?: boolean
  helperText?: string
  height?: string | number
}

// Generate unique ID for each editor instance
let editorInstanceId = 0

export default function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  minRows = 10,
  readOnly = false,
  error = false,
  helperText,
  height,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const instanceIdRef = useRef<number>(editorInstanceId++)

  const handleMonacoChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue ?? '')
    },
    [onChange]
  )

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Force re-tokenization after types load by triggering model change
    setTimeout(() => {
      const model = editor.getModel()
      if (model) {
        // Get current value and position
        const currentValue = model.getValue()
        const position = editor.getPosition()

        // Trigger TypeScript worker and refresh
        monaco.languages.typescript.getTypeScriptWorker().then((worker: (...uris: Uri[]) => Promise<{ getSemanticDiagnostics: (uri: string) => void }>) => {
          worker(model.uri).then((client) => {
            // Request semantic diagnostics to force type processing
            client.getSemanticDiagnostics(model.uri.toString())
          })
        })

        // Force a model refresh by setting value again
        model.setValue(currentValue)
        if (position) {
          editor.setPosition(position)
        }
      }
    }, 300)
  }

  // Calculate height based on minRows if not specified
  const editorHeight = height ?? `${minRows * 24}px`

  // Unique path for each editor instance
  const filePath = language === 'typescript'
    ? `file:///schema-${instanceIdRef.current}.ts`
    : language === 'json'
    ? `file:///data-${instanceIdRef.current}.json`
    : `file:///code-${instanceIdRef.current}.js`

  // Configure Monaco before mount for TypeScript/Zod support
  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      strict: true,
    })

    // Add Zod type definitions for typeahead - both as global and as module
    const zodTypes = `
// Global interfaces for Zod types
interface ZodType<Output = any, Input = Output> {
  _output: Output;
  _input: Input;
  optional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodNullable<ZodOptional<this>>;
  array(): ZodArray<this>;
  or<T extends ZodType>(schema: T): ZodUnion<[this, T]>;
  and<T extends ZodType>(schema: T): ZodIntersection<this, T>;
  transform<NewOut>(fn: (arg: Output) => NewOut): ZodEffects<this, NewOut>;
  default(def: Output): ZodDefault<this>;
  catch(def: Output): ZodCatch<this>;
  describe(description: string): this;
  pipe<T extends ZodType>(schema: T): ZodPipeline<this, T>;
  readonly(): ZodReadonly<this>;
  parse(data: unknown): Output;
  safeParse(data: unknown): { success: true; data: Output } | { success: false; error: ZodError };
  parseAsync(data: unknown): Promise<Output>;
  safeParseAsync(data: unknown): Promise<{ success: true; data: Output } | { success: false; error: ZodError }>;
  refine(check: (arg: Output) => boolean, message?: string | { message?: string }): ZodEffects<this, Output>;
  superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void): ZodEffects<this, Output>;
}

interface ZodString extends ZodType<string> {
  min(minLength: number, message?: string): ZodString;
  max(maxLength: number, message?: string): ZodString;
  length(len: number, message?: string): ZodString;
  email(message?: string): ZodString;
  url(message?: string): ZodString;
  uuid(message?: string): ZodString;
  cuid(message?: string): ZodString;
  cuid2(message?: string): ZodString;
  ulid(message?: string): ZodString;
  regex(regex: RegExp, message?: string): ZodString;
  includes(value: string, options?: { message?: string; position?: number }): ZodString;
  startsWith(value: string, message?: string): ZodString;
  endsWith(value: string, message?: string): ZodString;
  datetime(options?: { offset?: boolean; precision?: number; message?: string }): ZodString;
  ip(options?: { version?: 'v4' | 'v6'; message?: string }): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
  nonempty(message?: string): ZodString;
}

interface ZodNumber extends ZodType<number> {
  gt(value: number, message?: string): ZodNumber;
  gte(value: number, message?: string): ZodNumber;
  min(value: number, message?: string): ZodNumber;
  lt(value: number, message?: string): ZodNumber;
  lte(value: number, message?: string): ZodNumber;
  max(value: number, message?: string): ZodNumber;
  int(message?: string): ZodNumber;
  positive(message?: string): ZodNumber;
  nonnegative(message?: string): ZodNumber;
  negative(message?: string): ZodNumber;
  nonpositive(message?: string): ZodNumber;
  multipleOf(value: number, message?: string): ZodNumber;
  finite(message?: string): ZodNumber;
  safe(message?: string): ZodNumber;
}

interface ZodBoolean extends ZodType<boolean> {}
interface ZodDate extends ZodType<Date> {
  min(minDate: Date, message?: string): ZodDate;
  max(maxDate: Date, message?: string): ZodDate;
}
interface ZodBigInt extends ZodType<bigint> {}
interface ZodNull extends ZodType<null> {}
interface ZodUndefined extends ZodType<undefined> {}
interface ZodVoid extends ZodType<void> {}
interface ZodAny extends ZodType<any> {}
interface ZodUnknown extends ZodType<unknown> {}
interface ZodNever extends ZodType<never> {}
interface ZodLiteral<T> extends ZodType<T> {}
interface ZodArray<T extends ZodType> extends ZodType<T['_output'][]> {
  min(minLength: number, message?: string): ZodArray<T>;
  max(maxLength: number, message?: string): ZodArray<T>;
  length(len: number, message?: string): ZodArray<T>;
  nonempty(message?: string): ZodArray<T>;
}
interface ZodObject<T extends Record<string, ZodType>> extends ZodType<{ [K in keyof T]: T[K]['_output'] }> {
  shape: T;
  strict(): ZodObject<T>;
  strip(): ZodObject<T>;
  passthrough(): ZodObject<T>;
  partial(): ZodObject<{ [K in keyof T]: ZodOptional<T[K]> }>;
  deepPartial(): ZodObject<T>;
  required(): ZodObject<T>;
  pick<K extends keyof T>(keys: { [P in K]: true }): ZodObject<Pick<T, K>>;
  omit<K extends keyof T>(keys: { [P in K]: true }): ZodObject<Omit<T, K>>;
  extend<U extends Record<string, ZodType>>(shape: U): ZodObject<T & U>;
  merge<U extends ZodObject<any>>(other: U): ZodObject<T & U['shape']>;
}
interface ZodUnion<T extends [ZodType, ...ZodType[]]> extends ZodType<T[number]['_output']> {}
interface ZodIntersection<T extends ZodType, U extends ZodType> extends ZodType<T['_output'] & U['_output']> {}
interface ZodTuple<T extends [ZodType, ...ZodType[]]> extends ZodType<{ [K in keyof T]: T[K] extends ZodType ? T[K]['_output'] : never }> {}
interface ZodRecord<K extends ZodType, V extends ZodType> extends ZodType<Record<K['_output'], V['_output']>> {}
interface ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number]> {}
interface ZodFunction extends ZodType<(...args: any[]) => any> {}
interface ZodOptional<T extends ZodType> extends ZodType<T['_output'] | undefined> {}
interface ZodNullable<T extends ZodType> extends ZodType<T['_output'] | null> {}
interface ZodDefault<T extends ZodType> extends ZodType<T['_output']> {}
interface ZodCatch<T extends ZodType> extends ZodType<T['_output']> {}
interface ZodEffects<T extends ZodType, Output = T['_output']> extends ZodType<Output> {}
interface ZodPipeline<A extends ZodType, B extends ZodType> extends ZodType<B['_output']> {}
interface ZodReadonly<T extends ZodType> extends ZodType<Readonly<T['_output']>> {}
interface ZodError extends Error {}
interface RefinementCtx {
  addIssue(issue: { code: string; message: string; path?: (string | number)[] }): void;
}

// Global z as both const (for runtime) and namespace (for types like z.infer)
declare const z: {
    string: () => ZodString;
    number: () => ZodNumber;
    boolean: () => ZodBoolean;
    date: () => ZodDate;
    bigint: () => ZodBigInt;
    null: () => ZodNull;
    undefined: () => ZodUndefined;
    void: () => ZodVoid;
    any: () => ZodAny;
    unknown: () => ZodUnknown;
    never: () => ZodNever;
    literal: <T extends string | number | boolean>(value: T) => ZodLiteral<T>;
    array: <T extends ZodType>(schema: T) => ZodArray<T>;
    object: <T extends Record<string, ZodType>>(shape: T) => ZodObject<T>;
    union: <T extends [ZodType, ZodType, ...ZodType[]]>(types: T) => ZodUnion<T>;
    intersection: <T extends ZodType, U extends ZodType>(left: T, right: U) => ZodIntersection<T, U>;
    tuple: <T extends [ZodType, ...ZodType[]]>(items: T) => ZodTuple<T>;
    record: <K extends ZodType, V extends ZodType>(keyType: K, valueType: V) => ZodRecord<K, V>;
    enum: <T extends [string, ...string[]]>(values: T) => ZodEnum<T>;
    function: () => ZodFunction;
    optional: <T extends ZodType>(schema: T) => ZodOptional<T>;
    nullable: <T extends ZodType>(schema: T) => ZodNullable<T>;
};

// Namespace for z.infer and other type utilities
declare namespace z {
    export type infer<T extends ZodType> = T['_output'];
    export type input<T extends ZodType> = T['_input'] extends undefined ? T['_output'] : T['_input'];
    export type output<T extends ZodType> = T['_output'];
    export type ZodTypeAny = ZodType<any>;
}

// Module declaration for import { z } from 'zod'
declare module 'zod' {
    export const z: {
        string: () => ZodString;
        number: () => ZodNumber;
        boolean: () => ZodBoolean;
        date: () => ZodDate;
        bigint: () => ZodBigInt;
        null: () => ZodNull;
        undefined: () => ZodUndefined;
        void: () => ZodVoid;
        any: () => ZodAny;
        unknown: () => ZodUnknown;
        never: () => ZodNever;
        literal: <T extends string | number | boolean>(value: T) => ZodLiteral<T>;
        array: <T extends ZodType>(schema: T) => ZodArray<T>;
        object: <T extends Record<string, ZodType>>(shape: T) => ZodObject<T>;
        union: <T extends [ZodType, ZodType, ...ZodType[]]>(types: T) => ZodUnion<T>;
        intersection: <T extends ZodType, U extends ZodType>(left: T, right: U) => ZodIntersection<T, U>;
        tuple: <T extends [ZodType, ...ZodType[]]>(items: T) => ZodTuple<T>;
        record: <K extends ZodType, V extends ZodType>(keyType: K, valueType: V) => ZodRecord<K, V>;
        enum: <T extends [string, ...string[]]>(values: T) => ZodEnum<T>;
        function: () => ZodFunction;
        optional: <T extends ZodType>(schema: T) => ZodOptional<T>;
        nullable: <T extends ZodType>(schema: T) => ZodNullable<T>;
    };

    export namespace z {
        export type infer<T extends ZodType> = T['_output'];
        export type input<T extends ZodType> = T['_input'] extends undefined ? T['_output'] : T['_input'];
        export type output<T extends ZodType> = T['_output'];
        export type ZodTypeAny = ZodType<any>;
    }
}
`

    monaco.languages.typescript.typescriptDefaults.addExtraLib(zodTypes, 'file:///node_modules/@types/zod/index.d.ts')

    // Also add as a regular lib
    monaco.languages.typescript.typescriptDefaults.addExtraLib(zodTypes, 'file:///zod.d.ts')

    // Configure diagnostics - allow semantic highlighting while being lenient on errors
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [
        2307, // Cannot find module
        2304, // Cannot find name
        1259, // Module can only be default-imported
        7016, // Could not find declaration file
      ],
    })

    // Enable eager model sync for better IntelliSense
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

    // Define custom dark theme with better semantic token colors
    monaco.editor.defineTheme('zod-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'method', foreground: 'DCDCAA' },
        { token: 'function.call', foreground: 'DCDCAA' },
        { token: 'method.call', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.readonly', foreground: '4FC1FF' },
        { token: 'property', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'interface', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'namespace', foreground: '4EC9B0' },
        { token: 'parameter', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'keyword', foreground: '569CD6' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editor.selectionBackground': '#264F78',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#3B3B3B',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
      },
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Editor
          height={editorHeight}
          language={language}
          value={value}
          onChange={handleMonacoChange}
          theme="zod-dark"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          path={filePath}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            readOnly,
            'semanticHighlighting.enabled': true,
            quickSuggestions: readOnly ? false : {
              other: true,
              comments: false,
              strings: true,
            },
            suggestOnTriggerCharacters: !readOnly,
            acceptSuggestionOnCommitCharacter: true,
            wordBasedSuggestions: 'currentDocument',
            parameterHints: { enabled: !readOnly },
            autoClosingBrackets: readOnly ? 'never' : 'always',
            autoClosingQuotes: readOnly ? 'never' : 'always',
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
            },
          }}
        />
      </Box>
      {helperText && (
        <Box
          component="span"
          sx={{
            color: error ? 'error.main' : 'text.secondary',
            fontSize: '0.75rem',
            mt: 0.5,
            ml: 1.5,
            display: 'block',
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  )
}
