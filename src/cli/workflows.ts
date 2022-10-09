import { Command } from 'commander';
import { IPublicApiConfig } from 'src/PublicApiClient';
import { config, loadConfig } from "./common";
import { Workflows } from "../lib/workflows";

export const wf = () => {
  const cmd = new Command('wf');

  cmd.command('delete')
    .description('Delete workflow from n8n instance.')
    .hook('preAction', loadConfig)
    .action(function() {
      console.log('Clear');
    })

  cmd.command('activate')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('deactivate')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('rename-files')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('save')
    .description('Save workflows to directory.')
    .hook('preAction', loadConfig)
    .option('--dir', 'Directory with workflows')
    .option('-n, --name <string...>', 'Workflow names to save')
    .option('--id <numbers...>', 'Workflow ids to save')
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const publicApiCfg: IPublicApiConfig = {
        url: config.n8n.url,
        apiKey: ''
      }
      const wf = new Workflows(publicApiCfg)
      await wf.backup({
        dir: opts.dir || config.workflows.dir,
        name: opts.name,
        id: opts.id
      })
    })

  cmd.command('publish')
    .description('Publish workflow(s) to n8n instance.')
    .hook('preAction', loadConfig)
    .option('--dir', 'Directory with workflows')
    .option('-n, --name <string...>', 'Workflow names to publish')
    .option('--id <numbers...>', 'Workflow ids to publish')
    .option('-a, --activate-live', '', true)


  cmd.command('setup-all')
    .description('')
    .hook('preAction', loadConfig)

  return cmd;
}