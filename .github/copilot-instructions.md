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
- `npm run test` - Takes 20 seconds. Set timeout to 30+ seconds.

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
- `src/bootstrap.sh` - Bootstrap script (requires Node.js 22+)
- `tsconfig.json` - TypeScript configuration with module resolution
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
tsconfig.json
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

## Testing Guidelines

**ALWAYS prefer integration-style tests over unit tests. Mock I/O only, avoid overmocking.**

### Testing Philosophy

This repository follows an **integration-first testing approach**:
- Test real module behavior through actual API calls
- Mock only I/O boundaries (file system, HTTP requests, console)
- Use `vi.mock` sparingly and only for full modules when strictly necessary
- CLI tests should flow through real code paths, not be overmocked
- Focus on testing complete user workflows and scenarios

### Test Infrastructure and Helpers

The repository provides several well-designed test helpers for integration testing:

#### `setupMockFileSystem()` - File System Mocking
```typescript
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
const fs = setupMockFileSystem()

// Usage
fs.writeFile("config.json", '{"apiKey": "test"}')
fs.writeFolder("src")
fs.expectFile("config.json").toContain('{"apiKey": "test"}')
fs.expectFile("missing.txt").not.toExist()
```

#### `setupMockServer()` - HTTP Mocking with MSW
```typescript
import { setupMockServer, mockFetchSourceFile } from "#test/utils/mockServer.ts"
const server = setupMockServer()

// Usage
mockFetchSourceFile(server, {
  path: "index.js",
  response: "console.log('test')"
})
```

#### `setupMockConsole()` - User Interaction Mocking
```typescript
import { setupMockConsole } from "#test/utils/mockConsole.ts"
const terminal = setupMockConsole()

// Usage
terminal.setUserResponse("y")
terminal.expect.user.toHaveBeenPromptedWith("Continue? (y/N):")
expect(terminal.getSpy("info")).toHaveBeenCalledWith("Success!")
```

#### `setupMockConfig()` - Configuration Mocking
```typescript
import { setupMockConfig } from "#test/utils/mockConfig.ts"
setupMockConfig({ apiKey: "test-key", merchant: "test-merchant" })
```

### Testing DOs and DON'Ts

#### ✅ DOs
- **Use MSW for HTTP mocking** - Mock external API endpoints with realistic responses
- **Use memfs for file system testing** - Test file operations without actual I/O
- **Test complete workflows** - Validate entire user journeys from CLI input to output
- **Use proper TypeScript types** - Avoid `any` and ensure type safety in tests
- **Mock only I/O boundaries** - File system, HTTP, console interactions
- **Test error scenarios** - Network failures, invalid configs, missing files
- **Use existing test helpers** - `setupMockFileSystem`, `setupMockServer`, etc.
- **Validate side effects** - Check file writes, API calls, console output
- **Test CLI commands end-to-end** - Flow through real module code

#### ❌ DON'Ts
- **Don't overmock internal modules** - Avoid mocking business logic or internal functions
- **Don't use `vi.mock` for partial mocking** - Only mock complete modules when necessary
- **Don't use `@ts-ignore` or `any`** - Maintain type safety in test code
- **Don't write trivial assertions** - Test meaningful behavior, not implementation details
- **Mock external boundaries, not internal code** - Mock I/O boundaries (HTTP, file system) but not internal business logic
- **Don't test implementation details** - Focus on public APIs and user-observable behavior
- **Don't skip error scenarios** - Test both happy paths and failure cases

### Code Review Guidelines for Tests

**Flag these anti-patterns in code review:**
- Excessive use of `vi.mock()` for internal modules
- Mocking functions instead of I/O boundaries
- Tests that don't validate real user workflows
- Missing integration tests for CLI commands
- Tests using `any` or `@ts-ignore`
- Trivial assertions that don't test meaningful behavior

### Writing Tests for This Repository

1. **Start with integration tests** - Test the complete module behavior
2. **Use provided test helpers** - Don't reinvent file/HTTP/console mocking
3. **Mock only I/O** - File system, HTTP, console, external processes
4. **Test CLI flows** - Validate commands work end-to-end
5. **Cover error cases** - Network failures, invalid inputs, missing permissions

### Test Structure Example
```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { myCommand } from "#modules/myCommand.ts"
import { setupMockFileSystem } from "#test/utils/mockFileSystem.ts"
import { setupMockServer } from "#test/utils/mockServer.ts"
import { setupMockConsole } from "#test/utils/mockConsole.ts"

describe("My Command", () => {
  let fs: ReturnType<typeof setupMockFileSystem>
  let server: ReturnType<typeof setupMockServer>
  let terminal: ReturnType<typeof setupMockConsole>

  beforeEach(() => {
    fs = setupMockFileSystem()
    server = setupMockServer()
    terminal = setupMockConsole()
  })

  it("should perform complete workflow", async () => {
    fs.writeFile(".nosto.json", '{"apiKey":"test"}')
    mockFetchSourceFile(server, { path: "test.js", response: "code" })
    
    await myCommand({ force: true })
    
    fs.expectFile("output.js").toExist()
    expect(terminal.getSpy("info")).toHaveBeenCalledWith("Success!")
  })
})
```

**Note:** Use `beforeEach`, `beforeAll`, `afterEach`, `afterAll` for proper test setup and teardown. The example above shows typical test structure without inline comments.

### Known Issues and Workarounds

1. **Node.js Version Requirement**: `src/bootstrap.sh` uses `--experimental-strip-types` which requires Node.js 22+. Use `tsx` as alternative for development with older Node.js versions.
2. **API Dependencies**: Most CLI functionality requires valid Nosto API credentials. Use `--dry-run` for testing without credentials.
3. **Network Failures Expected**: Build commands will fail without valid API access - this is normal during development.

### Contributing

If you find these testing guidelines unclear or incomplete, please improve them via PR. Clear, actionable testing guidance helps maintain code quality and developer productivity.

