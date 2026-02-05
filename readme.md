# n8n Manager

`8man` is a CLI tool for [n8n](https://github.com/n8n-io/n8n) instances management. It can manage workflows, credentials, data tables, community nodes, API Key, owner account. It can upgrade old nodes to new versions (such as http node set node, function / code node etc).

> [!WARNING]
> A critical note about [queue mode](https://docs.n8n.io/hosting/scaling/queue-mode/). In queue mode community nodes should be installed in n8n docker image, which used by every worker. So don't use `8man npm` commands for n8n cluster configured in queue mode.


- [n8n Manager](#n8n-manager)
  - [Why?](#why)
  - [Key Features](#key-features)
  - [Installation](#installation)
    - [Option 1: Install npm package globally](#option-1-install-npm-package-globally)
    - [Option 2: Run from docker image](#option-2-run-from-docker-image)
  - [Basic Usage](#basic-usage)
    - [Get help](#get-help)
    - [Config file](#config-file)
    - [`--dry` flag](#--dry-flag)
  - [Full Commands list](#full-commands-list)
    - [Main features](#main-features)
    - [Workflows management](#workflows-management)
    - [Credentials management](#credentials-management)
    - [Community packages management](#community-packages-management)
    - [API key management](#api-key-management)
    - [Owner account](#owner-account)
  - [Installing nodes from npm.digital-boss.cloud registry](#installing-nodes-from-npmdigital-bosscloud-registry)
  - [Development](#development)
    - [Release new version](#release-new-version)
      - [Push new version commit](#push-new-version-commit)
      - [Publish package to npm](#publish-package-to-npm)
      - [Publish docker image to docker hub](#publish-docker-image-to-docker-hub)
    - [Updating readme](#updating-readme)
  - [Known Issues and possible solutions](#known-issues-and-possible-solutions)
    - [404: The requested webhook "POST import-workflow" is not registered](#404-the-requested-webhook-post-import-workflow-is-not-registered)
    - [403: Request failed with status code 403](#403-request-failed-with-status-code-403)
    - [connect ETIMEDOUT](#connect-etimedout)


## Why?

This utility was created as to a request for a convenient tool for managing n8n instances via the REST protocol using the command line interface.

[n8n REST API](https://docs.n8n.io/api/api-reference/) does not have endpoints for managing the [API key](https://docs.n8n.io/api/authentication/), [community nodes](https://docs.n8n.io/integrations/community-nodes/installation/), and [owner](https://docs.n8n.io/hosting/configuration/user-management-self-hosted/#step-two-in-app-setup) account. A Web UI and CLI interface is available for managing these entities in n8n out of the box. However, the CLI interface requires ssh access to the n8n, which is not always acceptable. And the Web UI is not suitable for automating actions with scripts. For its part, 8man encapsulates different types of interaction with n8n through REST (even CLI interactions is encapsulated as REST through exposition of `n8n-CLI REST Client` workflow webhooks) and opens a single CLI interface to end users.



Use cases:

- Save and restore whole n8n instance. Make your n8n instance reproducible and store workflows and community nodes list in git repo.
- Manage multiple n8n instances without need of ssh access. Create 8man config for each n8n instance you have.
- The ability to manage nodes, owner, API key, and workflows opens up the possibility to deploy the n8n instance entirely from the command line which is useful in CI/CD scenarios.
- The functionality that stands apart from n8n management - is upgrade old nodes to new versions. Let's say you have an old instance of n8n and you want to update it. After the upgrade, you also want the workflows to use the new node versions. You can do this via `8man wf update --help`.

General Features:

- Batch entities processing. Means it can download or send a whole list of entities (workflows, credentials, nodes). 
- Interaction with n8n through HTTP REST protocol. No need for ssh access to n8n.


## Key Features

- **Workflow** Management
  - List, delete, activate, and deactivate workflows.
  - Save workflows to a directory or publish them to your N8N instance.

- **Update workflows** to align with new node versions and set up your instance workflows to match a specified directory.

- **Credential** Management
  - Easily import and export credentials to streamline your workflow automation.

- **Data Tables** Management
  - List, save, publish, and delete data tables (including schema and data).
  - Migrate data tables between n8n environments (dev, staging, production).

- **Community Nodes** Management
  - List, save, install, uninstall, and update N8N node packages effortlessly.

- **API Key** Management
  - Create and delete n8n [API keys](https://docs.n8n.io/api/authentication/).

- **Owner** Management
  - Create owner account to setup n8n entirely from command line.

Full commands list [see here](#full-commands-list).


## Installation

There are two options on how to install 8man:
- Install npm package globally. NodeJs required.
- Run from docker image.

### Option 1: Install npm package globally

- Make sure you have Node.js v18 or above installed (`node -v`). You can use [`nvm` - Node version manager](https://github.com/nvm-sh/nvm) tool to manage your node.js versions.

- Install npm package globally by running `npm install -g @digital-boss/n8n-manager`. 

- Then use it's executable: `8man`.


### Option 2: Run from docker image

If you do not want to install 8man globally on your system, or do not want to install nodejs, you can run 8man from docker image. See [Dockerfile](Dockerfile). 

With docker you have two options:

- Use docker image from docker hub: `docker pull digitalboss/8man:latest`.
- Build docker image manually `docker build . -t digitalboss/8man:latest`.

To run 8man from docker image:

    docker run --network host -v $PWD:/app digitalboss/8man:latest 8man --config /app/configs/local.json wf list

Consider to set an alias for convenience:

    alias 8man='docker run --network host -v $PWD:/app digitalboss/8man:latest 8man'

> [!NOTE]
> When using 8man from docker image, remember that all paths you passing in a command line arguments to 8man **should be related to container** (see how you attaching a volume to a container by `-v $PWD:/app`).


## Basic Usage

### Get help

- `8man` shows usage information. You can get detailed help about commands and subcommands like this:
- `8man wf --help`
- `8man wf publish --help`

### Config file

To use 8man, you need provide config file, containing n8n access parameters and other options. See example: [configs/8man-example.json](configs/8man-example.json). `8man --config path/to/config.json <command> <subcommand>`. You can create config files for each n8n instance you want to manage.

### `--dry` flag

Before executing a state-changing command (like publishing workflow), make sure that this command will be executed on right n8n instance by running in Dry mode first. On Dry run 8man only show config and input parameters and DO NOT execute actual command. Example: `8man --config path/to/config.json wf publish --dry`. It will output config file, operation name and operation parameters. Make sure that everything is correct and then run command without `--dry` flag. That can save you from accidental changes on production environment. 


## Full Commands list

### Main features

```sh
$ 8man
Usage: 8man [options] [command]

CLI to interact with N8N API

Options:
  --config <string>  Path to json configuration file
  --dry              Dry run. Only show config and input parameters. (default: false)
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  wf
  creds
  dt
  npm
  apiKey
  owner
  help [command]     display help for command
```

### Workflows management

```sh
$ 8man wf
Usage: 8man wf [options] [command]

Options:
  -h, --help              display help for command

Commands:
  list [options]          List workflows from n8n instance
  delete [options]        Delete workflow from n8n instance
  activate [options]      Activate workflows
  deactivate [options]    Deactivate workflows
  rename-files [options]
  save [options]          Save workflows to directory
  update [options]        Update workflows to use new node versions from the new n8n version
  publish [options]       Publish workflow(s) to n8n instance
  setup-all [options]     Setup n8n instance workflows exactly the same as your --dir
  help [command]          Display help for command
```

### Credentials management

```sh
$ 8man creds
Usage: 8man creds [options] [command]

Options:
  -h, --help        display help for command

Commands:
  import [options]  Import credentials
  export [options]  Export credentials
  help [command]    Display help for command
```

### Data Tables management

> [!WARNING]
> DataTables API requires n8n **v2.7.0+**. Older versions will return a 404 error when attempting to use data table commands.

**Important Note about Table IDs:** Data table IDs are auto-generated by n8n and will differ across environments (dev, staging, production). When migrating tables between environments, the same table will have different IDs. In your n8n workflows, always reference tables by **name** using the [Data Table node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/), not by ID. This ensures your workflows work correctly across all environments.

```sh
$ 8man dt
Usage: 8man dt [options] [command]

Options:
  -h, --help        display help for command

Commands:
  list [options]     List data tables from n8n instance
  delete [options]   Delete data table(s) from n8n instance
  save [options]     Save data tables to directory
  publish [options]  Publish data table(s) to n8n instance
  setup-all [options] Setup n8n instance data tables exactly the same as your --dir
  help [command]     Display help for command
```

See [DATATABLES.md](./DATATABLES.md) for detailed usage and troubleshooting.


### Community packages management

> [!WARNING]
> A critical note about [queue mode](https://docs.n8n.io/hosting/scaling/queue-mode/). In queue mode community nodes should be installed in n8n docker image, which used by every worker. So don't use `8man npm` commands for n8n cluster configured in queue mode.

```sh
$ 8man npm
Usage: 8man npm [options] [command]

Options:
  -h, --help           display help for command

Commands:
  list [options]
  save-list [options]  Save nodes packages list to file
  install [options]
  uninstall [options]
  update [options]
  setup-all [options]
  help [command]       Display help for command
```

### API key management

```sh
$ 8man apiKey
Usage: 8man apiKey [options] [command]

Options:
  -h, --help        display help for command

Commands:
  create [options]  Create API Key
  delete            Delete API Key
  help [command]    Display help for command
```

### Owner account

```sh
$ 8man owner
Usage: 8man owner [options] [command]

Options:
  -h, --help      display help for command

Commands:
  create          Create Owner using parameters from config
  help [command]  Display help for command
```

## Installing nodes from npm.digital-boss.cloud registry

If you want to use https://npm.digital-boss.cloud as npm registry, then install https://www.npmjs.com/package/@digital-boss/n8n-nodes-market Community node, specify credentials and execute Setup operation to setup digital-boss npm registry as default. This will write `/home/node/.npmrc` file with proper settings. After that you can use this CLI tool to install nodes from digital-boss registry. 


## Development

### Release new version

- Push new version commit in git repo
- Publish package to npmjs registry
- Publish docker image to docker hub

#### Push new version commit

- Make sure you have clean working directory, commit all your changes. `git stash` all your work-in-progress changes that you don't want to commit in new release.
- Commit new version and tag: `npm version patch` (or `minor` or `major`, depending on your versioning needs). I will make a commit with version name (example: 0.1.13), including files: package.json, package-lock.json and version.ts.
- `git push`
- push tag, for example: `git tag --list`, then `git push origin v0.1.1`

Order of execution (more details [here](https://docs.npmjs.com/cli/v7/commands/npm-version#description)):

- Bump version in `package.json` as requested (patch, minor, major, etc).
- Run the `version` script. These scripts have access to the new version in package.json, so `genversion` will get updated version number. Scripts should explicitly add generated files to the commit using `git add`.
- Commit and tag.

Note: For more information refer to [`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version) command docs and [`genversion`](https://github.com/axelpale/genversion/blob/master/README.md) package:


#### Publish package to npm

- `npm login`
- `npm publish`

#### Publish docker image to docker hub

```sh
docker login                   # use `digitalboss` login
ver="0.1.14"                   # replace version with latest
make docker/build VER="$ver"
make docker/push VER="$ver"
```

### Updating readme

When you updating readme, consider also to update readme for [docker hub](./docs/docker-hub-readme.md). It has less content than main readme, but in case you want to change some general information, it should be also updated at docker hub. Then put new content at: https://hub.docker.com/r/digitalboss/8man


## Known Issues and possible solutions

`8man` could respond with errors. Take a close look at the error message to understand the problem and find a working solution. Below are some error cases and possible solutions.

### 404: The requested webhook "POST import-workflow" is not registered

Error:

```js
{
  code: 404,
  message: 'The requested webhook "POST import-workflow" is not registered.',
  hint: "The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)"
}
```

Solution: Restart n8n or ReActivate system workflow (`n8n-CLI REST Client`) manually. 


### 403: Request failed with status code 403

Error:

```js
{
  code: 403,
  message: "Request failed with status code 403"
}
```

**HTTP 403** is an HTTP status code meaning access to the requested resource is forbidden. The server understood the request, but will not fulfill it, if it was correct.

Possible reasons:

- Check Credentials: Ensure that the credentials provided in config file (`restCliClient` section) equals to ones specified in `n8n-CLI REST Client` workflow.
- Make sure that the path to config file exists. `cat <path/to/config.json>`. 
  - If you executing 8man from docker image, then paths are related to docker container. 
  - Check if `8man` is actually an alias of bash function. To check if `8man` is an alias or a function rather than an executable file, you can use the `type 8man` command. Then check the actual command, may be you using `8man` from docker and path should be related to container.
  - Consider using an absolute path to help resolve any path-related issues.


### connect ETIMEDOUT

Error:

```js
{
  code: "ETIMEDOUT",
  message: "connect ETIMEDOUT ...:443"
}
```

`connect ETIMEDOUT` means a networking issue. Client application can't reach destination. 

Possible reasons:

- Your internet may not be working. 
- If you use VPN - Check your VPN connection.
