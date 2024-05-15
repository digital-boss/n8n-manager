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

## Issues

### The requested webhook "POST import-workflow" is not registered

Problems: `8man --config ... wf publish` responds with error

```js
{
  code: 404,
  message: 'The requested webhook "POST import-workflow" is not registered.',
  hint: "The workflow must be active for a production URL to run successfully. You can activate the workflow using the toggle in the top-right of the editor. Note that unlike test URL calls, production URL calls aren't shown on the canvas (only in the executions list)"
}
```

Solution: Restart n8n or ReActivate system workflow manually. 

```js
{
  code: 403,
  message: "Request failed with status code 403",
  stack: "AxiosError: Request failed with status code 403\n    at settle (/root/.nvm/versions/node/v18.17.0/lib/node_modules/@digital-boss/n8n-manager/dist/cli.js:14255:12)\n    at IncomingMessage.handleStreamEnd (/root/.nvm/versions/node/v18.17.0/lib/node_modules/@digital-boss/n8n-manager/dist/cli.js:15111:11)\n    at IncomingMessage.emit (node:events:526:35)\n    at endReadableNT (node:internal/streams/readable:1359:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)",
  "code": "ERR_BAD_REQUEST"
}
```

Solution: 
 - Check Credentials: Ensure that the credentials provided are correct.
 - Ensure that the credentials in the workflow n8n-CLI REST Client are consistent with those in the configuration file. It is important to verify that both sets of credentials match.
 - Make sure that provided path to config file is exist:
    - Use absolute paths to guarantee the existence of the provided path to the configuration file.
        - For example, instead of './workflows' in the configuration file, use '/home/user/workflows'.
        - Similarly, when executing in the terminal, avoid '../8man/your-name-of-conf-file.json'; use '/home/user/8man/your-name-of-conf-file.json'.
 ```js
{
  code: "ETIMEDOUT",
  message: "connect ETIMEDOUT 100.70.70.255:443",
  stack: "Error: connect ETIMEDOUT 100.70.70.255:443\n    at AxiosError.from (/root/.nvm/versions/node/v18.17.0/lib/node_modules/@digital-boss/n8n-manager/dist/cli.js:13526:14)\n    at RedirectableRequest.handleRequestError (/root/.nvm/versions/node/v18.17.0/lib/node_modules/@digital-boss/n8n-manager/dist/cli.js:15126:33)\n    at RedirectableRequest.emit (node:events:514:28)\n    at eventHandlers.<computed> (/root/.nvm/versions/node/v18.17.0/lib/node_modules/@digital-boss/n8n-manager/dist/cli.js:12084:28)\n    at ClientRequest.emit (node:events:514:28)\n    at TLSSocket.socketErrorListener (node:_http_client:501:9)\n    at TLSSocket.emit (node:events:514:28)\n    at emitErrorNT (node:internal/streams/destroy:151:8)\n    at emitErrorCloseNT (node:internal/streams/destroy:116:3)\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)"
}
```

Solution: Check your VPN connection. 
