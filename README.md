# Nosto CLI Tool

A command-line interface to interact with Nosto's backend systems. Primarily aimed at developers and power-users who aim to use more powerful desktop tools for search-template development and (in the future) other features.

## Usage

Nosto CLI aims to be as user-friendly as CLI tools get. You should be able to get up and running by utilizing the built-in `help` and `setup` commands, but a quick-start guide is also provided here.

### In the bright future

- Install the CLI tool:
  - `npm i nostocli -g`

- Invoke the tool on the project directory:
  - `nostocli status /path/to/project`

- Alternatively, `cd` into the project directory and omit the path
  - `cd /path/to/project && nostocli status`

### In the current reality

Before it's available on NPM, a few extra steps are needed

- Checkout the repo
  - `git clone git@github.com:Nosto/nosto-cli.git`
- Install deps
  - `cd nosto-cli && npm i`
- Link the tool into npm
  - `npm link`
- Enjoy!
  - `nostocli status /path/to/project`

## Configuration

The recommended way to provide the configuration is via a config file in the project folder, named `.nosto.json`. Alternatively, environmental variables can be used. If both are present, environment takes precedence.

At the minimum, the following options are required:

- API Key:
  - In config file: `apiKey`
  - In env variable: `NOSTO_API_KEY`
  - Your Nosto API key
- Merchant ID:
  - In config file:* `merchant`
  - In env variable: `NOSTO_MERCHANT`
  - Your merchant ID

See output of `nostocli setup` for the full list.

## Supported commands

You can use `nostocli help` and variations to obtain detailed and up-to-date information on the current list of commands.

- `setup [projectPath]`
  - Prints setup information and creates a placeholder config file if needed
- `status [projectPath]`
  - Reads the configuration and prints the general status
- `st [projectPath]`
  - Alias: `search-templates [projectPath]`
  - Search templates related commands
  - `st pull [projectPath]`
    - Fetch the current state of VSCode Web for the configured merchant
