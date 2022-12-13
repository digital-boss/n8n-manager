import { Command, Option, OptionValues } from 'commander';
import { config, loadConfig, logOp } from "./common";
import { IRestCliConfig, RestCliClient } from 'src/RestCliClient';
import { Credentials } from 'src/lib/Credentials';

const createCredsAgent = (): Credentials => {
  const restCliCfg: IRestCliConfig = {
    url: config.n8n.url,
    auth: {
      user: config.n8n.restCliClient.user,
      password: config.n8n.restCliClient.password
    },
    proxy: config.proxy,
  }
  return new Credentials(restCliCfg);
} 

const createAction = (
  fn: (opts: OptionValues, creds: Credentials, cmd: Command) => Promise<void>
) => {
  return async function(this: Command) {
    const opts = this.optsWithGlobals();
    const creds = createCredsAgent();
    return fn(opts, creds, this);
  }
}

export const creds = () => {
  const cmd = new Command('creds');

  cmd.command('import')
    .description('Import credentials.')
    .hook('preAction', loadConfig)
    .option('--input <string>', 'JSON file with credectials')
    .action(createAction(async (opts, creds, cmd) => {
      const args: Parameters<typeof creds.import> = [
        opts.input
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await creds.import(...args);
      }
    }));

  cmd.command('export')
    .description('Export credentials.')
    .hook('preAction', loadConfig)
    .option('--output <string>', 'JSON file where to save credentials.')
    .option('--decrypted', 'Export credentials in a decrypted (plain text) format', false)
    .action(createAction(async (opts, client, cmd) => {
      const args: Parameters<typeof client.export> = [
        opts.output,
        opts.decrypted
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await client.export(...args);
      }
    }));

  return cmd;
}