import { Command, Option, OptionValues } from 'commander';
import { IPrivateApiConfig } from 'src/PrivateApiClient/HttpClient';
import { config, loadConfig, logOp } from "./common";
import { Npm } from "src/lib/npm";

const options = {
  packages: new Option('-p, --package <string...>', 'Package names'),
  nodesListFile: new Option('--nodes-file <string>', 'Path to text file with nodes list'),
}


const createNpmAgent = (cmd: Command) => {
  const privateApiCfg: IPrivateApiConfig = {
    url: config.n8n.url,
    email: config.n8n.email,
    password: config.n8n.password,
    proxy: config.proxy
  }
  return new Npm(privateApiCfg) 
} 

const createAction = (
  fn: (opts: OptionValues, npm: Npm, cmd: Command) => Promise<void>
) => {
  return async function(this: Command) {
    const opts = this.optsWithGlobals();
    const wf = createNpmAgent(this);
    return fn(opts, wf, this);
  }
}

export const npm = () => {
  const cmd = new Command('npm');

  cmd.command('list')
    .description('')
    .hook('preAction', loadConfig)
    .option('-j, --json', 'Output in json format', false)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.list> = [
        opts.json
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.list(...args);
      }
    }))

  cmd.command('save-list')
    .description('Save nodes packages list to file')
    .hook('preAction', loadConfig)
    .addOption(options.nodesListFile)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.saveList> = [
        opts.nodesFile || config.nodesListFile
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.saveList(...args);
      }
    }))


  cmd.command('install')
    .description('')
    .hook('preAction', loadConfig)
    .addOption(options.packages)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.install> = [
        opts.packages
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.install(...args);
      }
    }))

  cmd.command('uninstall')
    .description('')
    .hook('preAction', loadConfig)
    .addOption(options.packages)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.uninstall> = [
        opts.packages
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.uninstall(...args);
      }
    }))

  cmd.command('update')
    .description('')
    .hook('preAction', loadConfig)
    .addOption(options.packages)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.update> = [
        opts.packages
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.update(...args);
      }
    }))

  cmd.command('setup-all')
    .description('')
    .hook('preAction', loadConfig)
    .addOption(options.nodesListFile)
    .action(createAction(async (opts, npm, cmd) => {
      const args: Parameters<typeof npm.setupAll> = [
        opts.nodesFile || config.nodesListFile
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await npm.setupAll(...args);
      }
    }))

  return cmd;
}