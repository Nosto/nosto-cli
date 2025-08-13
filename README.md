# Nosto CLI Tool

A command-line interface to interact with Nosto's backend systems. Primarily aimed at developers and power-users who aim to use more powerful desktop tools for search-template development and other features.

<img width="862" alt="image" src="https://github.com/user-attachments/assets/d26869d2-cd03-4d04-a175-d544c45b99b1" />

## Requirements

- **Node.js 22+** - Required for `--experimental-strip-types` support used by the bootstrap script
- For development with older Node.js versions, `tsx` can be used as an alternative

## Installation

### From Source (Current Method)

1. Clone the repository:
   ```bash
   git clone git@github.com:Nosto/nosto-cli.git
   ```

2. Install dependencies:
   ```bash
   cd nosto-cli && npm ci
   ```

3. Link the tool globally:
   ```bash
   npm link
   ```

4. Use the CLI:
   ```bash
   nosto --help
   nosto status /path/to/project
   ```

### Alternative for Development (Any Node.js Version)

If you don't have Node.js 22+, you can use `tsx` for development:

1. Install tsx globally:
   ```bash
   npm install -g tsx
   ```

2. Run commands directly:
   ```bash
   tsx src/index.ts --help
   tsx src/index.ts status /path/to/project
   ```

## Quick Start

1. Navigate to your project directory or specify the path
2. Run the setup command to get started:
   ```bash
   nosto setup [projectPath]
   ```
3. Follow the interactive prompts to create your configuration
4. Check your configuration:
   ```bash
   nosto status
   ```

## Configuration

The CLI can be configured using either a `.nosto.json` file in your project directory or environment variables. Environment variables take precedence over the configuration file.

Run `nosto setup` for an interactive configuration helper.

### Required Configuration

#### API Key
Your Nosto API_APPS token from the merchant admin settings.
- **Config file:** `apiKey`
- **Environment:** `NOSTO_API_KEY`

#### Merchant ID
The public ID of your target merchant.
- **Config file:** `merchant`
- **Environment:** `NOSTO_MERCHANT`

### Optional Configuration

#### API URL
Base URL for the Nosto API.
- **Config file:** `apiUrl`
- **Environment:** `NOSTO_API_URL`
- **Default:** `https://api.nosto.com`
- **Staging:** `https://api.staging.nosto.com`
- **Local:** `https://my.dev.nos.to/api`

#### Templates Environment
The templates environment to target.
- **Config file:** `templatesEnv`
- **Environment:** `NOSTO_TEMPLATES_ENV`
- **Default:** `main`

#### Log Level
Controls the verbosity of CLI output.
- **Config file:** `logLevel`
- **Environment:** `NOSTO_LOG_LEVEL`
- **Options:** `debug`, `info`, `warn`, `error`
- **Default:** `info`

#### Max Requests
Maximum number of concurrent API requests.
- **Config file:** `maxRequests`
- **Environment:** `NOSTO_MAX_REQUESTS`
- **Default:** `15`

### Example Configuration File

```json
{
  "apiKey": "your-api-apps-token",
  "merchant": "your-merchant-id",
  "templatesEnv": "main",
  "apiUrl": "https://api.nosto.com",
  "logLevel": "info",
  "maxRequests": 15
}
```

## File Handling

### Excluded Files
- Files starting with `.` (e.g., `.nosto.json`, `.gitignore`) are automatically excluded during push operations
- The `build/` folder is excluded during pull operations to prevent overwriting local build artifacts

### TypeScript Support
The CLI runs TypeScript files directly using Node.js experimental features (`--experimental-strip-types`), eliminating the need for a traditional build step.

## Development

### Prerequisites
- Node.js 22+ (for the bootstrap script)
- npm or equivalent package manager

### Development Workflow

1. **Setup:**
   ```bash
   git clone git@github.com:Nosto/nosto-cli.git
   cd nosto-cli
   npm ci
   ```

2. **Code Quality:**
   ```bash
   npm run lint        # ESLint checking
   npm run type-check  # TypeScript type checking
   ```

3. **Testing:**
   ```bash
   # Manual testing (automated tests in progress)
   npm link
   nosto --help
   
   # Or with tsx for any Node.js version:
   tsx src/index.ts --help
   ```

4. **Pre-commit Hooks:**
   The project uses Husky for Git hooks and enforces conventional commits via commitlint.

### Architecture
- **TypeScript-first:** Direct execution without build steps
- **Modular design:** Organized into modules in `src/modules/`
- **Configuration:** Zod-based schema validation in `src/config/`
- **Error handling:** Centralized error handling with user-friendly messages
- **API communication:** Built on `ky` with retry logic

## Commands

Use `nosto --help` or `nosto <command> --help` for detailed and up-to-date information.

### Core Commands

#### `setup [projectPath]`
Interactive setup helper that prints configuration information and optionally creates a placeholder `.nosto.json` file.

```bash
nosto setup
nosto setup /path/to/project
```

#### `status [projectPath]`
Validates and displays the current configuration status.

```bash
nosto status
nosto status /path/to/project
```

### Search Templates Commands

All search template commands support the `st` alias or the full `search-templates` command name.

#### `st build [projectPath]`
Build search templates locally using esbuild.

```bash
nosto st build
nosto st build --watch          # Watch for changes and rebuild
nosto st build --dry-run        # Show what would be built without building
nosto st build --verbose        # Enable debug logging
```

**Options:**
- `--dry-run` - Perform a dry run without making changes
- `--verbose` - Set log level to debug  
- `-w, --watch` - Watch for file changes and rebuild automatically

#### `st pull [projectPath]`
Pull the current search templates source from Nosto VSCode Web.

```bash
nosto st pull
nosto st pull --yes                           # Skip confirmation prompts
nosto st pull --paths src/templates/main.ts  # Pull specific files only
nosto st pull --dry-run                       # Show what would be pulled
```

**Options:**
- `-p, --paths <files...>` - Specific file paths to fetch (space-separated)
- `--dry-run` - Show what would be pulled without downloading
- `--verbose` - Enable debug logging
- `-y, --yes` - Skip confirmation prompts

#### `st push [projectPath]`
Build and push search templates to Nosto VSCode Web.

```bash
nosto st push
nosto st push --yes                           # Skip confirmation prompts  
nosto st push --paths src/templates/main.ts  # Push specific files only
nosto st push --dry-run                       # Show what would be pushed
```

**Options:**
- `-p, --paths <files...>` - Specific file paths to deploy (space-separated)
- `--dry-run` - Show what would be pushed without uploading
- `--verbose` - Enable debug logging
- `-y, --yes` - Skip confirmation prompts

#### `st dev [projectPath]`
Development mode: build locally, watch for changes, and continuously upload to Nosto VSCode Web.

```bash
nosto st dev
nosto st dev --yes      # Skip confirmation prompts
nosto st dev --verbose  # Enable debug logging
```

**Options:**
- `--dry-run` - Perform a dry run without making changes
- `--verbose` - Enable debug logging
- `-y, --yes` - Skip confirmation prompts

### Global Options

These options are available for most commands:
- `--verbose` - Enable debug logging (equivalent to `--log-level debug`)
- `--dry-run` - Show what would be done without making changes

## External Dependencies

### Legacy Templates
Due to complexities in the legacy setup, external dependencies **are not officially supported in legacy templates**. If you need external dependencies, we recommend:

1. Using only build-time dependencies (like TypeScript) that disappear at runtime
2. Building your application separately and pointing the CLI to the output folder
3. Migrating to our modern search-templates offering

### Modern Search Templates
For new projects, consider our open-source search-templates ecosystem:
- **search-templates-starter** - Template for getting started
- **[search-js](https://github.com/nosto/search-js)** - Modern search library
- **This CLI tool** - For development and deployment

The modern ecosystem fully supports external dependencies and modern web development practices.

## Support

- **Issues:** Report bugs and feature requests on [GitHub Issues](https://github.com/Nosto/nosto-cli/issues)
- **Documentation:** Use `nosto --help` and `nosto <command> --help` for command-specific help
- **Setup:** Use `nosto setup` for interactive configuration assistance