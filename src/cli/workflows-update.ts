import { Command, Option, OptionValues } from 'commander';
import { updateWorkflows } from 'src/WorkflowUpdater';
import { logOp } from './common/log';
import { config, loadConfig } from './common/loadConfig';
import { errorHandler } from './common/errorHandling';

const createAction = (
  fn: (opts: OptionValues, cmd: Command) => Promise<void>
) => {
  return async function (this: Command) {
    const opts = this.optsWithGlobals();
    return fn(opts, this).catch(errorHandler(opts, this));
  }
}

export const updateWorkflowCommand = () => {
  const cmd = new Command('update')
    .description('Update workflows in the n8n instance.')
    .hook('preAction', loadConfig)
    .addOption(new Option('--dir <string>', 'Directory with workflows'))
    .addOption(new Option('--output-dir <string>', 'Output directory for updated workflows'))
    .option('--dry', 'Dry run: Show expected output without updating', false)
    .action(createAction(async (opts, cmd) => {
      const dir = opts.dir || config.workflows.dir;
      const outputDir = opts.outputDir || 'update-workflows';
      const dry = opts.dry || false;

      const args: Parameters<typeof updateWorkflows> = [dir, outputDir];
      logOp(cmd, args);

      if (!dry) {
        await updateWorkflows(dir, outputDir);
        logOp(cmd, ['Workflow update completed']);
      }
    }));

  return cmd;
};
