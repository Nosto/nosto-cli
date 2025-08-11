# Nosto CLI Tool

A command-line interface to interact with Nosto's backend systems. Primarily aimed at developers and power-users who aim to use more powerful desktop tools for search-template development and (in the future) other features.

<img width="862" alt="image" src="https://github.com/user-attachments/assets/d26869d2-cd03-4d04-a175-d544c45b99b1" />

## Usage

Nosto CLI aims to be as user-friendly as CLI tools get. You should be able to get up and running by utilizing the built-in `help` and `setup` commands, but a quick-start guide is also provided here.

### In the bright future

- Install the CLI tool:
  - `npm i @nosto/nosto-cli -g`

- Invoke the tool on the project directory:
  - `nosto status /path/to/project`

- Alternatively, `cd` into the project directory and omit the path
  - `cd /path/to/project && nosto status`

### In the current reality

Before it's available on NPM, a few extra steps are needed

- Checkout the repo
  - `git clone git@github.com:Nosto/nosto-cli.git`
- Install deps
  - `cd nosto-cli && npm i`
- Link the tool into npm
  - `npm link`
- Enjoy!
  - `nosto status /path/to/project`

## Configuration

The recommended way to provide the configuration is via a config file in the project folder, named `.nosto.json`. Alternatively, environmental variables can be used. If both are present, environment takes precedence.

See output of `nosto setup` for the full list of options.

### Required configuration

At the minimum, two options are required: Merchant ID and the API key. If you're targeting an environment other than production, API Url will also be required.

#### Merchant ID:

Public ID of the target merchant.

- Property name in the config file: `merchant`
- Property name in the env variable: `NOSTO_MERCHANT`

#### API Key:

Your access key for the target merchant. Specifically, a Nosto API_APPS token that you can find in the merchant admin settings.

- Property name in the config file: `apiKey`
- Property name in the env variable: `NOSTO_API_KEY`

#### API Url:

By default, the CLI will try to contact `https://api.nosto.com` as the base URL.

For staging, use: `https://api.staging.nosto.com`
For local Playcart, use: `https://my.dev.nos.to/api`

- Property name in the config file: `apiUrl`
- Property name in the env variable: `NOSTO_API_URL`

## Excluded files

At the moment, the CLI will push all files, excluding any that start with `.`. I.e. `.nosto.json` is excluded automatically.

During the pull, CLI downloads all files, except for the `build/` folder.

## Supported commands

You can use `nosto help` and variations to obtain detailed and up-to-date information on the current list of commands.

- `setup [projectPath]`
  - Prints setup information and creates a placeholder config file if needed
- `status [projectPath]`
  - Print the configuration status
- `st [projectPath]`
  - Alias: `search-templates [projectPath]`
  - Search templates management commands
  - `st build [projectPath]`
    - Build the search-templates locally
    - Options: `--dry-run`, `--verbose`, `-w/--watch`
  - `st pull [projectPath]`
    - Pull the search-templates source from the Nosto VSCode Web
    - Options: `-p/--paths <files...>`, `--dry-run`, `--verbose`, `-y/--yes`
  - `st push [projectPath]`
    - Push the search-templates source to the VSCode Web
    - Options: `-p/--paths <files...>`, `--dry-run`, `--verbose`, `-y/--yes`
  - `st dev [projectPath]`
    - Build the search-templates locally, watch for changes and continuously upload
    - Options: `--dry-run`, `--verbose`, `-y/--yes`

## External dependencies

With the addition of local builds, the external dependencies are something that is theoretically possible. However, due to complexities of the legacy setup, external deps **will not be officially supported in the legacy templates**. We understand that this is something modern web development needs, and we are addressing that by our upcoming open source search-templates offering. Specifically, search-templates-starter, [search-js](https://github.com/nosto/search-js) and this very CLI tool.

If you would still like to try your luck with introducing dependencies into a legacy app, we recommend you stick with only build-time dependencies like TypeScript that disappear at runtime. In that case, build your app as you would, and point the CLI's build to the output folder.