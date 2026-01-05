import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { basename, join, resolve } from 'path'
import { generateForm } from '../lib/form-generator'

const HELP_TEXT = `
Usage: npm run generate-form <input-file> [options]

Generate MUI form components from TypeScript type definitions.
Requires corresponding Zod schemas and Zustand stores to be generated first.

Arguments:
  input-file                 Path to TypeScript file containing types

Options:
  --output, -o <dir>         Output directory (default: src/components/forms/)
  --schema-path <path>       Import path for schemas (default: ../schemas)
  --store-path <path>        Import path for stores (default: ../stores/generated)
  --verbose, -v              Verbose output
  --help, -h                 Show this help message

Examples:
  npm run generate-form src/types/example.ts
  npm run generate-form src/types/user.ts -o src/forms
  npm run generate-form src/types/example.ts --schema-path ../../schemas

Prerequisites:
  1. Run: npm run generate-zod <input-file>
  2. Run: npm run generate-store <input-file>
  3. Run: npm run generate-form <input-file>
`

function getOption(args: string[], flags: string[]): string | undefined {
  for (const flag of flags) {
    const index = args.indexOf(flag)
    if (index !== -1 && index + 1 < args.length) {
      return args[index + 1]
    }
  }
  return undefined
}

function hasFlag(args: string[], flags: string[]): boolean {
  return flags.some((flag) => args.includes(flag))
}

async function main() {
  const args = process.argv.slice(2)

  // Show help
  if (args.length === 0 || hasFlag(args, ['--help', '-h'])) {
    console.log(HELP_TEXT)
    process.exit(0)
  }

  // Get input file
  const inputFile = args.find((arg) => !arg.startsWith('-'))
  if (!inputFile) {
    console.error('Error: No input file specified')
    console.log(HELP_TEXT)
    process.exit(1)
  }

  // Get options
  const outputDir = getOption(args, ['--output', '-o']) || 'src/components/forms'
  const schemaImportPath = getOption(args, ['--schema-path']) || '../../schemas'
  const storeImportPath = getOption(args, ['--store-path']) || '../../stores/generated'
  const verbose = hasFlag(args, ['--verbose', '-v'])

  // Validate input file
  const inputPath = resolve(inputFile)
  if (!existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`)
    process.exit(1)
  }

  if (!inputPath.endsWith('.ts') && !inputPath.endsWith('.tsx')) {
    console.error('Error: Input file must be a TypeScript file (.ts or .tsx)')
    process.exit(1)
  }

  // Ensure output directory exists
  const outputPath = resolve(outputDir)
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true })
    if (verbose) {
      console.log(`Created output directory: ${outputPath}`)
    }
  }

  // Generate forms
  try {
    console.log(`Generating MUI form components from: ${inputFile}`)
    if (verbose) {
      console.log(`Schema import path: ${schemaImportPath}`)
      console.log(`Store import path: ${storeImportPath}`)
    }

    const result = await generateForm(inputPath, {
      verbose,
      schemaImportPath,
      storeImportPath,
    })

    if (result.generatedForms.length === 0) {
      console.log('No exported types found to generate forms for.')
      process.exit(0)
    }

    // Determine output filename
    const inputBasename = basename(inputFile).replace(/\.tsx?$/, '')
    const outputFile = join(outputPath, `${inputBasename}.forms.tsx`)

    // Write output file
    writeFileSync(outputFile, result.code, 'utf-8')

    console.log(`\n✓ Generated: ${outputFile}`)
    console.log(`  Forms: ${result.generatedForms.join(', ')}`)

    if (result.warnings.length > 0) {
      console.log('\nWarnings:')
      result.warnings.forEach((w) => console.log(`  ⚠ ${w}`))
    }

    console.log('\nNote: Make sure to generate schemas and stores first:')
    console.log(`  npm run generate-zod ${inputFile}`)
    console.log(`  npm run generate-store ${inputFile}`)
  } catch (error) {
    console.error('\nGeneration failed:')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
      if (verbose && error.stack) {
        console.error(error.stack)
      }
    }
    process.exit(1)
  }
}

main()
