# Nosto CLI - Copilot Instructions

## Overview

This is a TypeScript CLI tool for interacting with Nosto's backend systems. The tool runs TypeScript directly using Node.js experimental features, without a traditional build step.

## Code Style

* Use closures over classes
* Utilize type inference in return types, except for functions with multiple return statements
* Use utility types to derive types from constants
* Avoid 'any' type usage
* Use const (and let) over var
* Use async/await instead of Promise chaining
* Use individual named exports over bulk exports
* Favor named exports over default exports

## Development Workflow

### Available Commands

* `setup [projectPath]` - Prints setup information and creates configuration
* `status [projectPath]` - Print the configuration status  
* `st|search-templates [projectPath]` - Search templates management commands
  * `st build [projectPath]` - Build the search-templates locally
  * `st pull [projectPath]` - Pull search-templates source from Nosto VSCode Web
  * `st push [projectPath]` - Push search-templates source to VSCode Web 
  * `st dev [projectPath]` - Build locally, watch for changes and continuously upload

### Configuration

The CLI requires `.nosto.json` config file or environment variables:
* `NOSTO_API_KEY` - Nosto API_APPS token (required)
* `NOSTO_MERCHANT` - Merchant ID (required)  
* `NOSTO_API_URL` - API URL (optional, defaults to https://api.nosto.com)

## Build

* `npm ci` - Install dependencies (preferred over `npm install` for CI/CD and clean installs)
* `npm run lint` - Run ESLint to check code quality and style
* `npm link` - Link the CLI tool globally for local development and testing
* `npx tsx src/index.ts --help` - Run the CLI directly from source (recommended for development)
* `nosto --help` - Run the linked CLI tool (after npm link, may require Node.js with --experimental-strip-types support)

## Testing

* No test suite currently exists
* Manual testing via CLI commands: `npx tsx src/index.ts <command>`
* Verify commands work: `npx tsx src/index.ts help`, `npx tsx src/index.ts setup`, `npx tsx src/index.ts status`
* Test linked version: `nosto help`, `nosto setup`, `nosto status` (after npm link)