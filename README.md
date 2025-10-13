# About Nosto

If you are unfamiliar with Nosto as a company, you are welcome to visit out homepage at [https://nosto.com/](https://www.nosto.com/).

If you wish to know more about our tech stack, we publish extensive documentation known as the [Techdocs](https://docs.nosto.com/techdocs).

# Nosto CLI Tool

A command-line interface to interact with Nosto's backend systems. Primarily aimed at developers and power-users who aim to use more powerful desktop tools for search-template development and (in the future) other features.

<img width="862" alt="image" src="https://github.com/user-attachments/assets/d26869d2-cd03-4d04-a175-d544c45b99b1" />

## Usage

Nosto CLI aims to be as user-friendly as CLI tools get. You should be able to get up and running by utilizing the built-in `help` and `setup` commands, but a quick-start guide is also provided here.

To start with, you may create an empty folder for your folder; or you may clone your git repository to work with.

```bash
# Install the CLI tool:
npm i @nosto/nosto-cli -g

# Login to Nosto
# You will see the browser window open with further instructions.
nosto login

# Run the tool targeting a project directory:
nosto status /path/to/project

# Alternatively, `cd` into the project directory and omit the path
cd /path/to/project && nosto status
```

## Configuration

The recommended way to provide the configuration is via a config file in the project folder, named `.nosto.json`. Alternatively, environmental variables can be used. If both are present, the environment takes precedence.

See output of `nosto setup` for the full list of options.

> You should never push the content of your `.nosto.json` to your git repository as it may contain sensitive data.

### Required configuration

At the minimum, one option is required: Merchant ID. If you're targeting an environment other than production, an API URL will also be required.

> To quickly create a minimal configuration file, you may use the following command:
> `NOSTO_MERCHANT=merchant-id nosto setup`

#### Merchant ID:

Public ID of the target merchant.

- Property name in the config file: `merchant`
- Property name in the env variable: `NOSTO_MERCHANT`

#### API URL (Optional):

By default, the CLI will try to contact as the base URL. You may need to specify one of the following URLs to target the correct environment:

> Production URL: `https://api.nosto.com`
> Staging URL: `https://api.staging.nosto.com`
> Nosto internal development URL: `https://my.dev.nos.to/api`

- Property name in the config file: `apiUrl`
- Property name in the env variable: `NOSTO_API_URL`

#### API Key (Optional):

By default, the CLI will use your user credentials created by `nosto login`. If the API token is provided for a given project, it will be used instead.

Your access key for the target merchant. Specifically, a private Nosto API_APPS token that you can find in the merchant admin settings.

- Property name in the config file: `apiKey`
- Property name in the env variable: `NOSTO_API_KEY`

## Excluded files

Nosto CLI takes the contents of your `.gitignore` file into account when pushing files to the remote, skipping all files matching these patterns. In addition, the CLI implicitly ignores any files or folders that start with `.`. I.e. `.nosto.json` is excluded automatically.

During the pull, CLI downloads all files from the remote.

> The `/build` folder is an exception to the rules above. It will never be skipped during pushing, even if added to .gitignore, and it is always ignored while pulling.

### Recommended .gitignore

```bash
.nosto.json
.nostocache
build
```

## Supported commands

You can use `nosto help` and variations to obtain detailed and up-to-date information on the current list of commands.

- `login`
  - Opens the browser window to start the login flow.
  - Stores the credentials (email and temporary access token) in `~/.nosto/.auth.json`
- `logout`
  - Wipes the stored login credentials
- `setup [projectPath]`
  - Prints setup information and creates a placeholder config file if needed
- `status [projectPath]`
  - Reads the configuration and prints the general status
- `st [projectPath]`
  - Alias: `search-templates [projectPath]`
  - Search templates related commands
  - `st pull [projectPath]`
    - Fetches the current remote state for the configured merchant
  - `st push [projectPath]`
    - Pushes the local state to the remote for the configured merchant
  - `st build [projectPath]`
    - For a modern search-template project, it invokes the `onBuild` script in `nosto.config.ts`
    - For a legacy search-template project, it mirrors the hosted VSCode Web build workflow
  - `st dev [projectPath]`
    - Watches files, build and upload automatically
    - For a modern search-template project, it invokes the `onBuildWatch` script in `nosto.config.ts`
    - For a legacy search-template project, it uses esbuild to watch files, build and upload automatically. Only uploads build artifacts, not the sources.

## External dependencies in legacy search-templates

With the addition of local builds, the external dependencies are something that is theoretically possible. However, due to complexities of the legacy setup, external deps **will not be officially supported in the legacy templates**. We understand that this is something modern web development needs, and we are addressing that by our upcoming open source search-templates offering. Specifically, search-templates-starter, [search-js](https://github.com/nosto/search-js) and this very CLI tool.

If you would still like to try your luck with introducing dependencies into a legacy app, we recommend you stick with only build-time dependencies like TypeScript that disappear at runtime. In that case, build your app as you would, and point the CLI's build to the output folder.

## Development

### Testing

This project uses [Vitest](https://vitest.dev/) as the test runner. Tests are organized under the `test/` directory mirroring the structure of `src/`.

#### Available scripts

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Known issues

### Search templates push reports no files changed

Running `nosto st push` after `nosto st dev` without changing any files will stop early with the "No files to push" message due to the hashing mechanism not taking the pushed paths into account properly.

**Workaround**: Use `nosto st push -f` or change any of the files to update the hash.