# Nosto CLI Tool

## Usage (in the bright future)

- Install the CLI tool:
  - `npm i nostocli -g`

- Invoke the tool on the project directory:
  - `nostocli status /path/to/project`

- Alternatively, `cd` into the project directory and omit the path
  - `cd /path/to/project && nostocli status`

### Usage (in the current reality)

Before it's available on NPM, a few extra steps are needed

- Checkout the repo
  - `git clone git@github.com:Nosto/nosto-cli.git`
- Install deps
  - `cd nosto-cli && npm i`
- Link the tool into npm
  - `npm link`
- Enjoy!
  - `nostocli status /path/to/project`

### Configuration

The recommended way to provide the configuration is via a config file in the project folder, named `.nosto.json`. Alternatively, environmental variables can be used. If both are present, environment takes precedence.

At the minimum, the following options are required:

- API Key:
  - *Config file:* `apiKey`
  - *Env variable:* `NOSTO_API_KEY`
  - Your Nosto API key
- Merchant ID:
  - *Config file name:* `merchant`
  - *Env variable:* `NOSTO_MERCHANT`
  - Your merchant ID

See output of `nostocli setup` for the full list.

### Supported commands

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
