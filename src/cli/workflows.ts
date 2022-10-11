import { Command, Option } from 'commander';
import { IPublicApiConfig } from 'src/PublicApiClient/HttpClient';
import { config, loadConfig } from "./common";
import { Workflows } from "../lib/workflows";

const options = {
  name: new Option('-n, --name <string...>', 'Workflow names'),
  id: new Option('--id <numbers...>', 'Workflow ids'),
  dir: new Option('--dir', 'Directory with workflows')
}

const createWorkflowsAgent = (cmd: Command) => {
  const publicApiCfg: IPublicApiConfig = {
    url: config.n8n.url,
    apiKey: config.n8n.publicApiKey
  }
  return new Workflows(publicApiCfg) 
} 

export const wf = () => {
  const cmd = new Command('wf');

  cmd.command('delete')
    .description('Delete workflow from n8n instance.')
    .hook('preAction', loadConfig)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.delete({
        name: opts.name,
        id: opts.id
      })
    })

  cmd.command('activate')
    .description('')
    .hook('preAction', loadConfig)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.activate({
        name: opts.name,
        id: opts.id
      })
    })

  cmd.command('deactivate')
    .description('')
    .hook('preAction', loadConfig)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.deactivate({
        name: opts.name,
        id: opts.id
      })
    })

  cmd.command('rename-files')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('save')
    .description('Save workflows to directory.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.name)
    .addOption(options.id)
    .option('-d, --delete-old-files', 'Delete old files', true)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.save(
        opts.dir || config.workflows.dir,
        {
          name: opts.name,
          id: opts.id
        },
        opts.deleteOldFiles
      )
    })

  cmd.command('publish')
    .description('Publish workflow(s) to n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.name)
    .addOption(options.id)
    .option('-a, --activate-live', 'Activate workflows with "live" tag', true)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.publish(
        opts.dir || config.workflows.dir,
        {
          name: opts.name,
          id: opts.id
        }
      )
    })

  cmd.command('setup-all')
    .description('Setup n8n instalce workflows exactly the save as your --dir.')
    .addOption(options.dir)
    .hook('preAction', loadConfig)
    .action(async function(this: Command) {
      const opts = this.optsWithGlobals();
      const wf = createWorkflowsAgent(this)
      await wf.setupAll(opts.dir || config.workflows.dir)
    })

  return cmd;
}