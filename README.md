# Nosto CLI

A TypeScript command-line interface for interacting with Nosto's backend systems. Designed for developers and power-users who want to use powerful desktop tools for search-template development and configuration management.

<img width="862" alt="image" src="https://github.com/user-attachments/assets/d26869d2-cd03-4d04-a175-d544c45b99b1" />

## Requirements

- **Node.js 22+** (required for `--experimental-strip-types` support)
- npm or yarn package manager

## Installation

### Option 1: NPM (When Available)
```bash
npm install @nosto/nosto-cli -g
```

### Option 2: Development Installation
For the current version, clone and link the repository:

```bash
# Clone the repository
git clone https://github.com/Nosto/nosto-cli.git
cd nosto-cli

# Install dependencies
npm ci

# Link globally (requires Node.js 22+)
npm link
```

### Option 3: Using tsx (Any Node.js Version)
If you don't have Node.js 22+, you can use tsx for development:

```bash
# Install tsx globally
npm install -g tsx

# Run commands directly
tsx src/index.ts --help
tsx src/index.ts setup /path/to/project
```

## Quick Start

1. **Check if everything is working:**
   ```bash
   nosto --help
   ```

2. **Set up a new project:**
   ```bash
   nosto setup /path/to/project
   ```

3. **Check configuration status:**
   ```bash
   nosto status /path/to/project
   ```

4. **Get help for search templates:**
   ```bash
   nosto st --help
   ```

## Configuration

The CLI can be configured via a `.nosto.json` file in the project directory or through environment variables. Environment variables take precedence over file configuration.

### Configuration File (`.nosto.json`)
```json
{
  "apiKey": "your-api-apps-token",
  "merchant": "your-merchant-id",
  "apiUrl": "https://api.nosto.com",
  "templatesEnv": "main",
  "logLevel": "info",
  "maxRequests": 15
}
```

### Configuration Options

#### Required
- **`apiKey`** / **`NOSTO_API_KEY`**: Nosto API_APPS token (found in merchant admin settings)
- **`merchant`** / **`NOSTO_MERCHANT`**: Merchant ID

#### Optional
- **`apiUrl`** / **`NOSTO_API_URL`**: API endpoint (default: `https://api.nosto.com`)
  - Staging: `https://api.staging.nosto.com`
  - Local: `https://my.dev.nos.to/api`
- **`templatesEnv`** / **`NOSTO_TEMPLATES_ENV`**: Templates environment (default: `main`)
- **`logLevel`** / **`NOSTO_LOG_LEVEL`**: Log level (default: `info`)
- **`maxRequests`** / **`NOSTO_MAX_REQUESTS`**: Max concurrent requests (default: `15`)

Use `nosto setup` to interactively create a configuration file.

## Commands

### Core Commands

#### `setup [projectPath]`
Prints setup information and creates a configuration file template.
```bash
nosto setup                    # Setup current directory
nosto setup /path/to/project   # Setup specific directory
```

#### `status [projectPath]`
Display current configuration status and validate settings.
```bash
nosto status                   # Check current directory
nosto status /path/to/project  # Check specific directory
```

### Search Templates Commands

All search template commands support the `st` alias for `search-templates`.

#### `st build [projectPath]`
Build search templates locally.
```bash
nosto st build                 # Build current directory
nosto st build --watch         # Build and watch for changes
nosto st build --dry-run       # Dry run without making changes
nosto st build --verbose       # Enable debug logging
```

**Options:**
- `--dry-run`: Perform a dry run without making changes
- `--verbose`: Set log level to debug
- `-w, --watch`: Watch for file changes and rebuild

#### `st pull [projectPath]`
Pull search template source code from Nosto VSCode Web.
```bash
nosto st pull                          # Pull all files
nosto st pull -p file1.js file2.css   # Pull specific files
nosto st pull --dry-run                # Dry run
nosto st pull -y                       # Skip confirmation prompts
```

**Options:**
- `-p, --paths <files...>`: Specific file paths (space-separated)
- `--dry-run`: Perform a dry run without making changes
- `--verbose`: Set log level to debug
- `-y, --yes`: Skip confirmation prompts

#### `st push [projectPath]`
Push search template source code to VSCode Web.
```bash
nosto st push                          # Push all files
nosto st push -p file1.js file2.css   # Push specific files
nosto st push --dry-run                # Dry run
nosto st push -y                       # Skip confirmation prompts
```

**Options:**
- `-p, --paths <files...>`: Specific file paths (space-separated)
- `--dry-run`: Perform a dry run without making changes
- `--verbose`: Set log level to debug
- `-y, --yes`: Skip confirmation prompts

#### `st dev [projectPath]`
Development mode: build locally, watch for changes, and continuously upload.
```bash
nosto st dev                   # Start development mode
nosto st dev --dry-run         # Dry run mode
nosto st dev -y                # Skip confirmation prompts
```

**Options:**
- `--dry-run`: Perform a dry run without making changes
- `--verbose`: Set log level to debug
- `-y, --yes`: Skip confirmation prompts

### Global Options

All commands support:
- `--help`: Show help information
- `--verbose`: Enable debug logging

## File Handling

### Included Files
- All files in the project directory are processed by default
- Files starting with `.` are automatically excluded (including `.nosto.json`)

### Excluded Files
- During pull operations, the `build/` folder is excluded
- Hidden files (starting with `.`) are automatically excluded

## Development Setup

### Prerequisites
- Node.js 22+ (for native TypeScript support)
- npm or yarn

### Getting Started
```bash
# Clone the repository
git clone https://github.com/Nosto/nosto-cli.git
cd nosto-cli

# Install dependencies
npm ci

# Run linting and type checking
npm run lint
npm run type-check

# Link for local development (requires Node.js 22+)
npm link

# Alternative: Use tsx for any Node.js version
npm install -g tsx
tsx src/index.ts --help
```

### Development Commands
```bash
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript type checking
```

### Code Quality Standards

#### Linting
- **ESLint** with TypeScript support
- **Prettier** for code formatting
- Configuration in `eslint.config.js` and `.prettierrc`

#### TypeScript
- Strict type checking enabled
- Uses experimental `--experimental-strip-types` for direct execution
- Configuration in `tsconfig.json`

#### Code Style Guidelines
- Use closures over classes
- Utilize type inference in return types (except for functions with multiple return statements)
- Use utility types to derive types from constants
- Avoid 'any' type usage
- Use const (and let) over var
- Use async/await instead of Promise chaining
- Use individual named exports over bulk exports
- Favor named exports over default exports

### Git Hooks
The project uses Husky for Git hooks:
- **commit-msg**: Validates commit messages using commitlint
- Conventional commit format enforced

### Testing
Manual testing is currently used. Create a test project to validate CLI functionality:
```bash
cd /tmp && mkdir nosto-test-project && cd nosto-test-project
echo '{"apiKey":"test-key","merchant":"test-merchant"}' > .nosto.json
tsx /path/to/nosto-cli/src/index.ts status
```

## Contributing

### Commit Standards
This project follows [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add search template build command
fix: resolve configuration validation issue
docs: update README installation instructions
```

### Pull Request Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines
4. Run linting and type checking: `npm run lint && npm run type-check`
5. Commit your changes with conventional commit format
6. Push to your fork and create a pull request
7. Ensure CI checks pass

### CI/CD Pipeline
GitHub Actions automatically:
- Runs on Node.js 22
- Executes linting (`npm run lint`)
- Performs TypeScript type checking (`npm run type-check`)
- Triggers on pushes/PRs to `main` and `develop` branches

## External Dependencies

With the addition of local builds, external dependencies are theoretically possible. However, due to complexities of the legacy setup, external deps **will not be officially supported in the legacy templates**. 

For modern development, we recommend:
- [search-templates-starter](https://github.com/nosto/search-templates-starter)
- [search-js](https://github.com/nosto/search-js)
- This CLI tool

If you want to use dependencies with legacy templates, stick with build-time dependencies like TypeScript that disappear at runtime. Build your app as usual and point the CLI's build to the output folder.

## License

This project is licensed under the BSD 3-Clause License. See the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Nosto/nosto-cli/issues)
- **Documentation**: Use `nosto --help` and `nosto <command> --help` for command-specific help