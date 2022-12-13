import { Command, Option, OptionValues } from 'commander';
import { config, loadConfig, logOp } from "./common";
import { IRestCliConfig, RestCliClient } from 'src/RestCliClient';
import { Credentials } from 'src/lib/Credentials';
import { IPrivateApiConfig } from 'src/PrivateApiClient/HttpClient';
import { ApiKey } from 'src/lib/ApiKey';
import { PrivateApiClient } from 'src/PrivateApiClient';

const createAction = (
  fn: (opts: OptionValues, api: PrivateApiClient, cmd: Command) => Promise<void>
) => {
  return async function(this: Command) {
    const privateApiCfg: IPrivateApiConfig = {
      url: config.n8n.url,
      email: config.n8n.owner.email,
      password: config.n8n.owner.password,
      proxy: config.proxy
    }
    const api = new PrivateApiClient(privateApiCfg)
    const opts = this.optsWithGlobals();
    return fn(opts, api, this);
  }
}

export const owner = () => {
  const cmd = new Command('owner');

  cmd.command('create')
    .description('Create Owner using parameters from config.')
    .hook('preAction', loadConfig)
    .action(createAction(async (opts, api, cmd) => {
      logOp(cmd, [])
      if (opts.dry === false) {
        const res = await api.owner.create(config.n8n.owner);
        console.log(res.status, res.data);
      }
    }));

  return cmd;
}