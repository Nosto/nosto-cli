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

**IMPORTANT: Node.js Version Requirement**
- The `nosto` command via `src/bootstrap.sh` requires Node.js 22+ with `--experimental-strip-types` support
- Node.js 20 does NOT support this flag - upgrade to Node.js 22+ required
- Alternative: use tsx for development if Node.js 22+ is not available

**Recommended Commands (Node.js 22+):**
- `nosto --help` - Run CLI via bootstrap script (RECOMMENDED with Node.js 22+)
- `nosto setup [projectPath]` - Run setup command
- `nosto status [projectPath]` - Check configuration status
- `nosto st --help` - Search templates help

**Alternative Commands (Development with any Node.js version):**
- `npm install -g tsx` - Install tsx globally (if needed for development)
- `tsx src/index.ts --help` - Run CLI directly from source
- `tsx src/index.ts setup [projectPath]` - Run setup command
- `tsx src/index.ts status [projectPath]` - Check configuration status

### Link the CLI Tool Globally

After installing dependencies:
- `npm link` - Links the tool globally. Takes <1 second.
- Note: The linked `nosto` command will fail due to bootstrap.sh compatibility issues. Use tsx instead.

## Validation

**ALWAYS run these validation steps after making changes:**

### Code Quality Validation
- `npm run lint` - Takes 6 seconds. Set timeout to 30+ seconds.
- `npm run type-check` - Takes 2 seconds. Set timeout to 30+ seconds.
- `npm run test` - Takes 5 seconds. Set timeout to 30+ seconds.

### Manual Functional Validation

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

## Testing Guidelines

**Core Philosophy: Integration over Isolation**

This repository follows a **minimal mocking** strategy that prioritizes integration-style tests. Only mock IO/boundary modules (network, filesystem, console, etc.) while letting pure logic run through real code paths.

### Testing Strategy

#### Preferred Approach: Integration Tests
- **DO** let real code paths execute whenever possible
- **DO** mock only at system boundaries (filesystem, network, console I/O)
- **DO** use the provided mocking helpers that isolate IO while preserving logic
- **DON'T** mock pure business logic or internal functions
- **DON'T** cut corners by only checking function calls instead of validating actual behavior

#### Mocking Hierarchy (Most to Least Preferred)
1. **Integration Tests** - Mock only IO boundaries, test full workflows
2. **Unit Tests** - Test individual modules but avoid excessive mocking
3. **Isolated Unit Tests** - Only when testing complex logic in isolation is necessary

### Available Testing Infrastructure

#### Mock Utilities (Located in `test/utils/`)

**`setupMockFileSystem()`** - File system operations
```typescript
const fs = setupMockFileSystem()

// Write test files
fs.writeFile("src/index.js", "console.log('test')")
fs.writeFolder("build")

// Validate results
fs.expectFile("output.js").toContain("expected content")
fs.expectFile("missing.js").not.toExist()
```

**`setupMockServer()`** - HTTP/API requests using MSW
```typescript
const server = setupMockServer()

// Mock specific endpoints
mockFetchSourceFile(server, { 
  path: "index.js", 
  response: "file content" 
})
mockPutSourceFile(server, { path: "index.js" })

// Test API interactions with real HTTP logic
await pushSearchTemplate({ paths: ["index.js"], force: true })
```

**`setupMockConsole()`** - Console I/O and user prompts
```typescript
const terminal = setupMockConsole()

// Set user responses
terminal.setUserResponse("Y")

// Validate console output
expect(terminal.getSpy("info")).toHaveBeenCalledWith("Expected message")
terminal.expect.user.toHaveBeenPromptedWith("Confirm action? (Y/n):")
```

**`setupMockConfig()`** - Configuration overrides
```typescript
setupMockConfig({ 
  projectPath: "/test/path",
  dryRun: true,
  apiKey: "test-key" 
})
```

### Testing Best Practices

#### DOs ✅
- **Use MSW for HTTP mocking** - Preserves real HTTP client logic
- **Create specific test fixtures** when needed instead of reusing unrelated data
- **Use vitest matchers** (`expect().toEqual()`, `expect().toContain()`, etc.)
- **Validate actual behavior changes** not just function calls
- **Use correct TypeScript types** - avoid `any` unless absolutely necessary
- **Test error conditions** and edge cases
- **Use `describe()` blocks** to group related tests logically
- **Follow existing test file structure** (`test/` mirrors `src/` structure)

#### DON'Ts ❌
- **Avoid trivial assertions** like `expect(mockFn).toHaveBeenCalled()` without validating actual outcomes
- **Don't import modules inside test cases** - imports should be at the top level
- **Don't use `@ts-ignore`** - fix type issues properly or use proper type assertions
- **Don't mock pure business logic** - let it run to catch real bugs
- **Don't overmock** - if you're mocking more than 3-4 things, consider integration approach
- **Don't test implementation details** - test behavior and outcomes
- **Don't skip error scenarios** - test both happy path and error conditions

#### Test Structure Example
```typescript
import { describe, it, expect } from "vitest"
import { someFunction } from "#modules/someModule.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

const fs = setupMockFileSystem()
const terminal = setupMockConsole()

describe("Some Module", () => {
  it("should handle the main workflow correctly", async () => {
    // Arrange: Set up test data
    fs.writeFile("input.txt", "test content")
    
    // Act: Execute the function
    await someFunction({ path: "input.txt" })
    
    // Assert: Validate behavior and outputs
    fs.expectFile("output.txt").toContain("processed: test content")
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Processing completed")
  })
})
```

### Test Types and Guidelines

#### Integration Tests (Preferred)
- **Scope**: Full workflows end-to-end
- **Mocking**: Only IO boundaries (filesystem, network, console)
- **Example**: `test/modules/search-templates/push.test.ts`
- **When to use**: Default choice for most functionality

#### Unit Tests
- **Scope**: Individual functions or small modules
- **Mocking**: Minimal - only external dependencies
- **Example**: `test/api/retry.test.ts`
- **When to use**: Complex algorithms, utility functions, error handling

#### CLI Tests
- **Scope**: Command-line interface behavior
- **Mocking**: Mock all IO, test command parsing and execution flow
- **Focus**: Argument parsing, help text, error messages, exit codes

#### API Tests
- **Scope**: HTTP client behavior
- **Mocking**: Use MSW to mock server responses
- **Focus**: Request formatting, response handling, error scenarios, retry logic

### Code Review Guidelines for Tests

#### Flag for Review ⚠️
- **Overmocking**: More than 3-4 mocks or mocking business logic
- **Implementation testing**: Tests that break when internal structure changes
- **Trivial assertions**: Only checking mocks were called without validating outcomes
- **Missing error cases**: Happy path only without testing failure scenarios
- **Type violations**: Using `any` or `@ts-ignore` in tests

#### Encourage in Reviews ✅
- **Integration approach**: Tests that exercise real code paths
- **Behavior validation**: Tests that verify actual outcomes
- **Edge case coverage**: Error conditions, boundary values, empty inputs
- **Clear test naming**: Describes what behavior is being tested
- **Proper setup/teardown**: Using provided mock utilities correctly

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx vitest run test/modules/status.test.ts

# Run tests matching pattern
npx vitest run --grep "should handle errors"
```

### Troubleshooting Tests

- **Timeouts**: Usually indicate real IO instead of mocks - check mock setup
- **Flaky tests**: Often caused by not properly cleaning up mocks between tests
- **Type errors**: Use proper imports and avoid `any` - leverage TypeScript's inference
- **Mock not working**: Ensure mock is set up before the tested code runs

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
- `test/` - Test files mirroring src/ structure
- `test/utils/` - Testing utilities and mock helpers

### Key Files
- `src/index.ts` - Main CLI entry point using commander.js
- `src/bootstrap.sh` - Bootstrap script (requires Node.js 22+)
- `tsconfig.json` - TypeScript configuration with module resolution
- `vitest.config.ts` - Test configuration and setup
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Code formatting rules

## CI/CD Pipeline

**GitHub Actions (.github/workflows/ci.yml):**
- Runs on Node.js 22
- Includes tests, linting and type-checking
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
test/
tsconfig.json
vitest.config.ts
```

### Available npm Scripts
```
lint          - eslint
prepare       - husky
test          - vitest run
test:watch    - vitest
test:ui       - vitest --ui
test:coverage - vitest run --coverage
type-check    - tsc --noEmit
```

### Known Issues and Workarounds

1. **Node.js Version Requirement**: `src/bootstrap.sh` uses `--experimental-strip-types` which requires Node.js 22+. Use `tsx` as alternative for development with older Node.js versions.
2. **API Dependencies**: Most CLI functionality requires valid Nosto API credentials. Use `--dry-run` for testing without credentials.
3. **Network Failures Expected**: Build commands will fail without valid API access - this is normal during development.

