import { Command, Option, OptionValues } from 'commander';
import { IPublicApiConfig } from 'src/PublicApiClient/HttpClient';
import { config, loadConfig, logOp } from "./common";
import { Workflows } from "../lib/Workflows";
import { IRestCliConfig } from 'src/RestCliClient';
import { IConfig } from 'src/lib/utils/config';
import { WorkflowsFilter } from 'src/lib/utils/WorkflowsFilter';

const options = {
  name: new Option('-n, --name <string...>', 'Workflow names'),
  id: new Option('--id <numbers...>', 'Workflow ids'),
  excludeId: new Option('--exclude-id <numbers...>', 'Workflow ids to exclude'),
  dir: new Option('--dir <string>', 'Directory with workflows'),
  tag: new Option('-t, --tag <string...>', 'Workflow tags'),
}

const createWorkflowsAgent = (cmd: Command) => {
  const publicApiCfg: IPublicApiConfig = {
    url: config.n8n.url,
    apiKey: config.n8n.publicApiKey,
    proxy: config.proxy,
  }
  const restCliCfg: IRestCliConfig = {
    url: config.n8n.url,
    auth: {
      user: config.n8n.restCliClient.user,
      password: config.n8n.restCliClient.password
    },
    proxy: config.proxy,
  }
  return new Workflows(publicApiCfg, restCliCfg);
} 

const createAction = (
  fn: (opts: OptionValues, wf: Workflows, cmd: Command) => Promise<void>
) => {
  return async function(this: Command) {
    const opts = this.optsWithGlobals();
    const wf = createWorkflowsAgent(this);
    return fn(opts, wf, this);
  }
}

const getWfFilter = (opts: OptionValues, cfg: IConfig): WorkflowsFilter => {
  const f = new WorkflowsFilter();
  f.name = opts.name || []
  f.id = (opts.id || []).map((i: string) => Number.parseInt(i));
  f.tag = opts.tag || [];
  f.exclude.id = opts.excludeId || cfg.workflows.exclude.id;
  return f;
}

export const wf = () => {
  const cmd = new Command('wf');

  cmd.command('list')
    .description('List workflows from n8n instance.')
    .hook('preAction', loadConfig)
    .option('-j, --json', 'Output in json format', false)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.list> = [
        opts.json
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.list(...args);
      }
    }))

  cmd.command('delete')
    .description('Delete workflow from n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.delete> = [
        getWfFilter(opts, config)
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.delete(...args)
      }
    }))

  cmd.command('activate')
    .description('Activate workflows')
    .hook('preAction', loadConfig)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.activate> = [
        getWfFilter(opts, config)
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.activate(...args)
      }
    }))

  cmd.command('deactivate')
    .description('Deactivate workflows')
    .hook('preAction', loadConfig)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.deactivate> = [
        getWfFilter(opts, config)
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.deactivate(...args)
      }
    }))

  cmd.command('rename-files')
    .description('')
    .hook('preAction', loadConfig)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.renameFiles> = [
        opts.dir || config.workflows.dir,
        getWfFilter(opts, config),
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.renameFiles(...args)
      }
    }))

  cmd.command('save')
    .description('Save workflows to directory.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .option('-kf, --keep-files', 'If no filters scpecified (id, name, tag) and --keep-files=false, then all workflow files before saving will be deleted. This is useful when you want to have exact copy of workflows in directory.', false)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.save> = [
        opts.dir || config.workflows.dir,
        getWfFilter(opts, config),
        opts.keepFiles
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.save(...args)
      }
    }))

  cmd.command('publish')
    .description('Publish workflow(s) to n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.publish> = [
        opts.dir || config.workflows.dir,
        getWfFilter(opts, config)
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.publish(...args)
      }
    }))

  cmd.command('setup-all')
    .description('Setup n8n instalce workflows exactly the same as your --dir.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.tag)
    .addOption(options.excludeId)
    .action(createAction(async (opts, wf, cmd) => {
      const args: Parameters<typeof wf.setupAll> = [
        opts.dir || config.workflows.dir,
        getWfFilter(opts, config)
      ]
      logOp(cmd, args)
      if (opts.dry === false) {
        await wf.setupAll(...args)
      }
    }))

  return cmd;
}