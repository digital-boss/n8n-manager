import { Workflows } from "../lib/Workflows";
import { logOp } from './common/log';
import { config } from "./common/loadConfig";
import { updateWorkflows } from "src/WorkflowUpdater";

export const updateWorkflowCommand = async (opts: any, wf: Workflows, cmd: any) => {
  const dir = opts.dir || config.workflows.dir;
  const outputDir = opts.outputDir || 'update-workflows';
  const dry = opts.dry || false;

  const args: Parameters<typeof updateWorkflows> = [dir, outputDir];
  logOp(cmd, args);

  if (!dry) {
    await updateWorkflows(dir, outputDir);
    logOp(cmd, ['Workflow update completed']);
  }
};
