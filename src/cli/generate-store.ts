import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { basename, join, resolve } from 'path'
import { generateZustandStore } from '../lib/zustand-generator'

const HELP_TEXT = `
Usage: npm run generate-store <input-file> [options]

Generate Zustand stores from TypeScript type definitions.

Arguments:
  input-file              Path to TypeScript file containing types

Options:
  --output, -o <dir>      Output directory (default: src/stores/generated/)
  --no-persist            Disable localStorage persistence
  --storage-key <key>     Custom storage key for persist (default: typename-storage)
  --verbose, -v           Verbose output
  --help, -h              Show this help message

Examples:
  npm run generate-store src/types/user.ts
  npm run generate-store src/models/config.ts -o src/stores
  npm run generate-store src/types.ts --no-persist
  npm run generate-store src/types.ts --storage-key my-app-state
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
  const outputDir = getOption(args, ['--output', '-o']) || 'src/stores/generated'
  const verbose = hasFlag(args, ['--verbose', '-v'])
  const persist = !hasFlag(args, ['--no-persist'])
  const storageKey = getOption(args, ['--storage-key'])

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

  // Generate store
  try {
    console.log(`Generating Zustand store from: ${inputFile}`)
    if (verbose) {
      console.log(`Options: persist=${persist}, storageKey=${storageKey || 'auto'}`)
    }

    const result = await generateZustandStore(inputPath, {
      verbose,
      persist,
      storageKey,
    })

    if (result.generatedStores.length === 0) {
      console.log('No exported types found to generate stores for.')
      process.exit(0)
    }

    // Determine output filename
    const inputBasename = basename(inputFile).replace(/\.tsx?$/, '')
    const outputFile = join(outputPath, `${inputBasename}.store.ts`)

    // Write output file
    writeFileSync(outputFile, result.code, 'utf-8')

    console.log(`\n✓ Generated: ${outputFile}`)
    console.log(`  Stores: ${result.generatedStores.join(', ')}`)

    if (result.warnings.length > 0) {
      console.log('\nWarnings:')
      result.warnings.forEach((w) => console.log(`  ⚠ ${w}`))
    }
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
