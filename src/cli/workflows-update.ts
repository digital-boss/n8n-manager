import { Workflows } from "../lib/Workflows";
import { logOp } from './common/log';
import { config } from "./common/loadConfig";
import { updateWorkflows } from "src/WorkflowUpdater";

//TODO - one function - you don't need two functions for this
export const updateWorkflowLogic = async (dir: string, wf: Workflows, cmd: any, dry: boolean, outputDir: string) => {
  const args: Parameters<typeof updateWorkflows> = [
    dir,
    outputDir
  ];
  logOp(cmd, args);
  if (!dry) {
    await updateWorkflows(dir, outputDir); 
    logOp(cmd, ['Workflow update completed']);
  }
};

export const updateWorkflowCommand = async (opts: any, wf: Workflows, cmd: any) => {
  const dir = opts.dir || config.workflows.dir;
  const outputDir = opts.outputDir || 'update-workflows'

  await updateWorkflowLogic(dir, wf, cmd, opts.dry, outputDir);
};
