import { Command, Option, OptionValues } from 'commander';
import { IPublicApiConfig } from 'src/PublicApiClient/HttpClient';
import { DataTables } from '../lib/DataTables';
import { config, loadConfig } from './common/loadConfig';
import { logOp } from './common/log';
import { errorHandler } from './common/errorHandling';

const options = {
  id: new Option('--id <string...>', 'Data table IDs'),
  name: new Option('-n, --name <string...>', 'Data table names'),
  dir: new Option('--dir <string>', 'Directory with data tables'),
  projectId: new Option('--project-id <string>', 'Project ID'),
  dataTableId: new Option('--data-table-id <string>', 'Data Table ID'),
  keepFiles: new Option('-kf, --keep-files', 'Keep existing files not present on server').default(false),
};
const createDataTablesAgent = () => {
  const publicApiCfg: IPublicApiConfig = {
    url: config.n8n.url,
    apiKey: config.n8n.publicApiKey,
    proxy: config.proxy,
  };
  const restCliCfg = config.n8n?.restCliClient?.user && config.n8n?.restCliClient?.password
    ? {
      url: config.n8n.url,
      auth: {
        user: config.n8n.restCliClient.user,
        password: config.n8n.restCliClient.password,
      },
      proxy: config.proxy,
    }
    : undefined;
  
  return new DataTables(publicApiCfg, restCliCfg);
};

const createAction = (
  fn: (opts: OptionValues, dt: DataTables, cmd: Command) => Promise<void>
) => {
  return async function (this: Command) {
    const opts = this.optsWithGlobals();
    const dt = createDataTablesAgent();
    return fn(opts, dt, this).catch(errorHandler(opts, this));
  };
};

export const dt = () => {
  const cmd = new Command('dt');

  cmd.command('list')
    .description('List data tables from n8n instance.')
    .hook('preAction', loadConfig)
    .option('-j, --json', 'Output in json format', false)
    .addOption(options.projectId)
    .action(createAction(async (opts, dt, cmd) => {
      const args: Parameters<typeof dt.list> = [
        opts.json
      ];
      logOp(cmd, args);
      if (opts.dry === false) {
        await dt.list(...args);
      }
    }));

  cmd.command('delete')
    .description('Delete data table(s) from n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.projectId)
    .action(createAction(async (opts, dt, cmd) => {
      if (!opts.id && !opts.name) {
        console.error('Error: --id or --name is required');
        process.exit(1);
      }

      const args: Parameters<typeof dt.delete> = [
        opts.id,
        opts.name
      ];
      logOp(cmd, args);
      if (opts.dry === false) {
        await dt.delete(...args);
      }
    }));

  cmd.command('save')
    .description('Save data tables to directory.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.keepFiles)
    .addOption(options.projectId)
    .action(createAction(async (opts, dt, cmd) => {
      const args: Parameters<typeof dt.save> = [
        opts.dir || config.dataTables?.dir || './datatables',
        opts.id,
        opts.name,
        opts.keepFiles
      ];
      logOp(cmd, args);
      if (opts.dry === false) {
        await dt.save(...args);
      }
    }));

  cmd.command('publish')
    .description('Publish data table(s) to n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.id)
    .addOption(options.name)
    .addOption(options.projectId)
    .action(createAction(async (opts, dt, cmd) => {
      const payload = {
        config,
      };
      const args: Parameters<typeof dt.publish> = [
        opts.dir || config.dataTables?.dir || './datatables',
        opts.id,
        opts.name,
        payload
      ];
      logOp(cmd, args);
      if (opts.dry === false) {
        await dt.publish(...args);
      }
    }));
  
  cmd.command('setup-all')
    .description('Setup n8n instance data tables exactly the same as your --dir.')
    .hook('preAction', loadConfig)
    .addOption(options.dir)
    .addOption(options.projectId)
    .action(createAction(async (opts, dt, cmd) => {
      const payload = {
        config,
      };
      const args: Parameters<typeof dt.setupAll> = [
        opts.dir || config.dataTables?.dir || './datatables',
        payload
      ];
      logOp(cmd, args);
      if (opts.dry === false) {
        await dt.setupAll(...args);
      }
    }));

  return cmd;
};
