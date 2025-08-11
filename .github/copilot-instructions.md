# Nosto CLI - Copilot Instructions

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Overview

This is a TypeScript CLI tool for interacting with Nosto's backend systems. The tool runs TypeScript directly using Node.js experimental features, without a traditional build step. The CLI manages search templates and provides configuration management for Nosto merchants.

## Working Effectively

### Bootstrap, Build, and Validate the Repository

**CRITICAL - NEVER CANCEL these commands. Wait for completion:**

1. `npm ci` - Install dependencies. Takes 60 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
2. `npm run lint` - Run ESLint to check code quality and style. Takes 6 seconds. Set timeout to 30+ seconds.
3. `npm run type-check` - Run TypeScript type checking. Takes 2 seconds. Set timeout to 30+ seconds.

### Running the CLI Tool

**IMPORTANT: Node.js Compatibility Issue**
- The `nosto` command via `src/bootstrap.sh` requires Node.js with `--experimental-strip-types` support
- Current Node.js v20.19.4 does NOT support this flag and will fail with "bad option: --experimental-strip-types"
- **ALWAYS use tsx as the working alternative**

**Working Commands:**
- `npm install -g tsx` - Install tsx globally (required for development)
- `tsx src/index.ts --help` - Run CLI directly from source (RECOMMENDED)
- `tsx src/index.ts setup [projectPath]` - Run setup command
- `tsx src/index.ts status [projectPath]` - Check configuration status
- `tsx src/index.ts st --help` - Search templates help

**Non-Working Commands (Document but DO NOT use):**
- `nosto --help` - FAILS due to Node.js version incompatibility
- `node --experimental-strip-types src/index.ts` - FAILS, flag not supported in Node v20.19.4

### Link the CLI Tool Globally

After installing dependencies:
- `npm link` - Links the tool globally. Takes <1 second.
- Note: The linked `nosto` command will fail due to bootstrap.sh compatibility issues. Use tsx instead.

## Validation

**ALWAYS run these validation steps after making changes:**

### Code Quality Validation
- `npm run lint` - Takes 6 seconds. Set timeout to 30+ seconds.
- `npm run type-check` - Takes 2 seconds. Set timeout to 30+ seconds.

### Manual Functional Validation
**CRITICAL: No automated tests exist. Manual validation is required.**

Create a test project and validate CLI functionality:
```bash
cd /tmp && mkdir nosto-test-project && cd nosto-test-project
echo '{"apiKey":"test-key","merchant":"test-merchant"}' > .nosto.json
tsx /path/to/nosto-cli/src/index.ts status
```

Expected output: Configuration validation with "Configuration seems to be valid"

**Search Templates Validation:**
```bash
# Test help system
tsx /path/to/nosto-cli/src/index.ts st --help
tsx /path/to/nosto-cli/src/index.ts st build --help

# Test dry run (will attempt API connection and fail - this is expected)
mkdir -p src && echo 'console.log("test");' > src/test.js
tsx /path/to/nosto-cli/src/index.ts st build --dry-run
```

Expected: API connection failures are normal without valid Nosto credentials.

## Configuration

The CLI requires `.nosto.json` config file or environment variables:

**Required:**
- `NOSTO_API_KEY` / `apiKey` - Nosto API_APPS token
- `NOSTO_MERCHANT` / `merchant` - Merchant ID

**Optional:**
- `NOSTO_API_URL` / `apiUrl` - API URL (defaults to https://api.nosto.com)
- `NOSTO_TEMPLATES_ENV` / `templatesEnv` - Templates environment (defaults to main)
- `NOSTO_LOG_LEVEL` / `logLevel` - Log level (defaults to info)
- `NOSTO_MAX_REQUESTS` / `maxRequests` - Max concurrent requests (defaults to 15)

## CLI Commands

### Core Commands
- `setup [projectPath]` - Prints setup information and creates configuration. Interactive prompt - answer Y/n.
- `status [projectPath]` - Print the configuration status

### Search Templates Commands
- `st build [projectPath]` - Build the search-templates locally. Requires valid API credentials.
- `st pull [projectPath]` - Pull search-templates source from Nosto VSCode Web
- `st push [projectPath]` - Push search-templates source to VSCode Web
- `st dev [projectPath]` - Build locally, watch for changes and continuously upload

### Command Options
- `--dry-run` - Perform a dry run without making changes
- `--verbose` - Set log level to debug
- `-y, --yes` - Skip confirmation prompts
- `-p, --paths <files...>` - Specific file paths (space-separated list)
- `-w, --watch` - Watch mode for build command

## Code Style

- Use closures over classes
- Utilize type inference in return types, except for functions with multiple return statements
- Use utility types to derive types from constants
- Avoid 'any' type usage
- Use const (and let) over var
- Use async/await instead of Promise chaining
- Use individual named exports over bulk exports
- Favor named exports over default exports

## Key Architecture

### Important Directories
- `src/` - Main source code
- `src/modules/` - Core functionality modules
- `src/modules/search-templates/` - Search templates management (build.ts, dev.ts, pull.ts, push.ts)
- `src/config/` - Configuration management (config.ts, envConfig.ts, fileConfig.ts, schema.ts)
- `src/api/` - API communication with retry logic
- `src/console/` - User interaction (logger.ts, userPrompt.ts)

### Key Files
- `src/index.ts` - Main CLI entry point using commander.js
- `src/bootstrap.sh` - Bootstrap script (FAILS on current Node.js version)
- `tsconfig.json` - TypeScript configuration with module resolution
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Code formatting rules

## CI/CD Pipeline

**GitHub Actions (.github/workflows/ci.yml):**
- Runs on Node.js 20
- Only includes linting and type checking (no tests)
- Triggered on pushes/PRs to main and develop branches

**Pre-commit Hooks:**
- Husky manages Git hooks
- Conventional commits enforced via commitlint
- Run `npm run lint` before commits

## Common Tasks Output

### Repository Root Structure
```
.git
.github/
.gitignore
.husky/
.prettierrc
LICENSE
README.md
commitlint.config.js
eslint.config.js
package-lock.json
package.json
src/
tsconfig.json
```

### Available npm Scripts
```
lint          - eslint
prepare       - husky
type-check    - tsc --noEmit
```

### Known Issues and Workarounds

1. **Bootstrap Script Fails**: `src/bootstrap.sh` uses `--experimental-strip-types` which requires Node.js v22+. Use `tsx` instead.
2. **No Tests**: Repository has no test files. Validation is limited to linting, type checking, and manual testing.
3. **API Dependencies**: Most CLI functionality requires valid Nosto API credentials. Use `--dry-run` for testing without credentials.
4. **Network Failures Expected**: Build commands will fail without valid API access - this is normal during development.

