# n8n Manager

## Installation

Install globally by running `npm install -g @digital-boss/n8n-manager`. Then use it's executable `8man`.

## Basic Usage

### Get help

- `8man` shows usage information. You can get detailed help about commands and subcommands like this:
- `8man wf --help`
- `8man wf publish --help`

### Config file

To use 8man, you need provide config file, containng n8n access parameters and other options. See example: [configs/8man-example.json](configs/8man-example.json). `8man --config path/to/config.json <command> <subcommand>`. You can create config files for each n8n instance you want to manage.

### `--dry` flag

Before executing a state-changing command (like publishing workflow), make sure that this command will be executed on right n8n instance by running in Dry mode first. On Dry run 8man only show config and input parameters and DO NOT execute actual command. Example: `8man --config path/to/config.json wf publish --dry`. It will output config file, operation name and operation parameters. Make sure that everything is correct and then run command without `--dry` flag. That can save you from accidental changes on production environment. 


## Use as Docker image

If you do not want to install 8man globally on your system, or do not want to install nodejs, you can run 8man from docker image. See [Dockerfile](Dockerfile). 

To build image run:

    docker build . -t 8man:latest

To run:

    docker run --network host -v $PWD:/app 8man:latest 8man --config /app/configs/local.json wf list


## Installing nodes from npm.digital-boss.cloud registry

If you want to use https://npm.digital-boss.cloud as npm registry, then install https://www.npmjs.com/package/@digital-boss/n8n-nodes-market Community node, specify credentials and execute Setup operation to setup digital-boss npm registry as default. This will write `/home/node/.npmrc` file with proper settings. After that you can use this CLI tool to install nodes from digital-boss registry. 