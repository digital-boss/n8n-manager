import { Command, Option, OptionValues } from 'commander';
import { config, loadConfig, logOp } from "./common";
import { IRestCliConfig, RestCliClient } from 'src/RestCliClient';
import { Credentials } from 'src/lib/Credentials';
import { IPrivateApiConfig } from 'src/PrivateApiClient/HttpClient';
import { ApiKey } from 'src/lib/ApiKey';

const createAction = (
  fn: (opts: OptionValues, apiKey: ApiKey, cmd: Command) => Promise<void>
) => {
  return async function(this: Command) {
    const opts = this.optsWithGlobals();
    const apiKey = new ApiKey(config, opts.config);
    return fn(opts, apiKey, this);
  }
}

export const apiKey = () => {
  const cmd = new Command('apiKey');

  cmd.command('create')
    .description('Create API Key.')
    .hook('preAction', loadConfig)
    .option('--updateConfig', 'Update config', false)
    .option('--output <string>', 'File where to save key')
    .action(createAction(async (opts, apiKey, cmd) => {
      const args: Parameters<typeof apiKey.create> = [
        opts.updateConfig,
        opts.output
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await apiKey.create(...args);
      }
    }));

  cmd.command('delete')
    .description('Delete API Key.')
    .hook('preAction', loadConfig)
    .action(createAction(async (opts, apiKey, cmd) => {
      const args: Parameters<typeof apiKey.delete> = [
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await apiKey.delete(...args);
      }
    }));

  return cmd;
}