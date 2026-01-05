import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { basename, join, resolve } from 'path'
import { generateZodSchemas } from '../lib/zod-generator'

const HELP_TEXT = `
Usage: npm run generate-zod <input-file> [options]

Generate Zod schemas from TypeScript type definitions.

Arguments:
  input-file            Path to TypeScript file containing types

Options:
  --output, -o <dir>    Output directory (default: src/schemas/)
  --verbose, -v         Verbose output
  --help, -h            Show this help message

Examples:
  npm run generate-zod src/types.ts
  npm run generate-zod src/models/user.ts -o src/validators
  npm run generate-zod src/stores/themeStore.ts -v
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
  const outputDir = getOption(args, ['--output', '-o']) || 'src/schemas'
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

  // Generate schemas
  try {
    console.log(`Generating Zod schemas from: ${inputFile}`)

    const result = await generateZodSchemas(inputPath, { verbose })

    if (result.generatedTypes.length === 0) {
      console.log('No exported types found to generate schemas for.')
      process.exit(0)
    }

    // Determine output filename
    const inputBasename = basename(inputFile).replace(/\.tsx?$/, '')
    const outputFile = join(outputPath, `${inputBasename}.schema.ts`)

    // Write output file
    writeFileSync(outputFile, result.code, 'utf-8')

    console.log(`\n✓ Generated: ${outputFile}`)
    console.log(`  Types: ${result.generatedTypes.join(', ')}`)

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
