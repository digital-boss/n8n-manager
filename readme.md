# n8n Manager

## Installation

Install globally by running `npm install -g @digital-boss/n8n-manager`. Then use it's executable `8man`.

## Basic Usage

### Get help

- `8man` shows usage information. You can get detailed help about commands and subcommands like this:
- `8man wf --help`
- `8man wf publish --help`

### Config file

To use 8man, you need provide config file, containing n8n access parameters and other options. See example: [configs/8man-example.json](configs/8man-example.json). `8man --config path/to/config.json <command> <subcommand>`. You can create config files for each n8n instance you want to manage.

### `--dry` flag

Before executing a state-changing command (like publishing workflow), make sure that this command will be executed on right n8n instance by running in Dry mode first. On Dry run 8man only show config and input parameters and DO NOT execute actual command. Example: `8man --config path/to/config.json wf publish --dry`. It will output config file, operation name and operation parameters. Make sure that everything is correct and then run command without `--dry` flag. That can save you from accidental changes on production environment. 


## Use as Docker image

If you do not want to install 8man globally on your system, or do not want to install nodejs, you can run 8man from docker image. See [Dockerfile](Dockerfile). 

To build image run:

    Building Locally
        docker build . -t 8man:latest
    
    or 

    Use the digital-boss image:
        docker run digitalboss/8man:latest

To run:

    docker run --network host -v $PWD:/app 8man:latest 8man --config /app/configs/local.json wf list

To set an alias:

    alias 8man='docker run --network host -v $PWD:/app 8man:latest 8man'

    or

    alias 8man='docker run --network host -v $PWD:/app digitalboss/8man:latest 8man'

## Installing nodes from npm.digital-boss.cloud registry

If you want to use https://npm.digital-boss.cloud as npm registry, then install https://www.npmjs.com/package/@digital-boss/n8n-nodes-market Community node, specify credentials and execute Setup operation to setup digital-boss npm registry as default. This will write `/home/node/.npmrc` file with proper settings. After that you can use this CLI tool to install nodes from digital-boss registry. 


## Development

### Publish new version

Commit new version and tag:
- patch `src/version.ts`
- `npm run build`
- commit
- `npm version patch`
- `git push`
- push tag, for example: `git push origin v0.1.1`

Publish to npm:
- npm login
- npm publish

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
