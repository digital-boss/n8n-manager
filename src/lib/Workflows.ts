import fs from "node:fs";
import path from "node:path";
import { PublicApiClient } from "src/PublicApiClient";
import { IPublicApiConfig } from "src/PublicApiClient/HttpClient";
import { IRestCliConfig, RestCliClient } from "src/RestCliClient";
import equal from 'fast-deep-equal';
import { WorkflowsFilter } from "./utils/WorkflowsFilter";
import { IWorkflow } from "./utils/Workflow";
import { AxiosResponse } from "axios";

interface IGetAllWorkflowsResponse {
  data: IWorkflow[];
  nextCursor?: string;
}

const getFileName = (wf: IWorkflow) => {
  const name = wf.name
    .replace(/::|: /g, ' - ')
    .replace(/[:|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\\|\//g, '_')
  return `${wf.id}_${name}.json`;
}

const getWorkflowFiles = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(i => i.match(/^[A-Za-z0-9]+_.*\.json$/));
}

const byIds = (wfFilter?: WorkflowsFilter) => (item: string): boolean => {
  if (wfFilter === undefined) {
    return true;
  }

  const id = getIdFromFileName(item);
  if (wfFilter.id.length && !wfFilter.id.includes(id)) {
    return false;
  }

  if (wfFilter.exclude.id.length && wfFilter.exclude.id.includes(id)) {
    return false;
  }

  return true;
}

const getFileNameById = (files: string[], id: string) => files.find(f => f.startsWith(id + '_'));

const getIdFromFileName = (fileName: string): string => {
  const m = fileName.match(/^[A-Za-z0-9]+/);
  if (m) {
    return m[0];
  }
  return '-1';
}

const getWfFromFile = (file: string): IWorkflow => {
  const content = fs.readFileSync(file, 'utf-8');
  return JSON.parse(content);
}

const areWfsEqual = (a: IWorkflow, b: IWorkflow): boolean => {
  const x = {...a}
  const y = {...b}
  x.updatedAt = y.updatedAt
  return equal(x, y);
}

const isNumericString = (input: string): boolean => {
  return /^\d+$/.test(input);
}

const sortIds = (ids: string[]): string[] => {
  const numericIds = ids.filter(id => isNumericString(id));
  const nonNumericIds = ids.filter(id => !isNumericString(id));

  // Sort the numeric IDs as numbers and combine them with the non-numeric IDs
  return [
    ...numericIds.map(id => parseInt(id)).sort((a, b) => a - b).map(String),
    ...nonNumericIds.sort(),
  ];
}

export class Workflows {

  publicApiClient: PublicApiClient
  restCliClient: RestCliClient

  constructor(
    public publicApiCfg: IPublicApiConfig,
    public restCliCfg: IRestCliConfig,
  ) {
    this.publicApiClient = new PublicApiClient(this.publicApiCfg)
    this.restCliClient = new RestCliClient(this.restCliCfg)
  }

  private async fetchAllWf(): Promise<IWorkflow[]> {
    let allWorkflows: IWorkflow[] = [];
    let nextCursor: string | undefined = undefined;
    do {
        const response: AxiosResponse<IGetAllWorkflowsResponse> = await this.publicApiClient.workflow
          .getAll(nextCursor !== null ? nextCursor : undefined);
        allWorkflows = allWorkflows.concat(response.data.data);
        nextCursor = response.data.nextCursor;
    } while (nextCursor);
    return allWorkflows;
}
  /**
   * Fetch from n8n instance
   * @param wfFilter 
   * @returns 
   */
  private async getWorkflowsFromSrv(wfFilter: WorkflowsFilter = new WorkflowsFilter()): Promise<IWorkflow[]> {
    if (wfFilter.hasIds()) {
      const workflows = wfFilter.getIds().map(
        async id => await this.publicApiClient.workflow
          .get(id)
          .then(r => r.data as IWorkflow)
      );
      return await Promise.all(workflows);
    } else {
      let wfs = await this.fetchAllWf();
      wfs = wfFilter.apply(wfs)
      return wfs;
    }
  }

  // ToDo: It is not obvious why it goes to getWorkflowsFromSrv? Not clear semamtics. 
  private async getIds(wfFilter: WorkflowsFilter = new WorkflowsFilter()): Promise<string[]> {
    if (wfFilter.hasIds()) {
      return wfFilter.getIds()
    } else {
      const wfs = await this.getWorkflowsFromSrv(wfFilter);
      const ids = wfs.map(i => i.id);
      return Promise.resolve(ids);
    }
  }

  /**
   * Get From Directory
   * @param dir 
   * @param wfFilter 
   * @returns 
   */
  private getWorkflowsFromDir(dir: string, wfFilter: WorkflowsFilter = new WorkflowsFilter()): IWorkflow[] {
    const fromFileFn = (fileName: string) => getWfFromFile(path.join(dir, fileName))
    const filesList = getWorkflowFiles(dir).filter(byIds(wfFilter));
    let workflows = filesList.map(fromFileFn);

    if (wfFilter.hasNames()) {
      workflows = workflows.filter(wf => wfFilter!.name.includes(wf.name))
    }

    if (wfFilter.hasTags()) {
      workflows = workflows.filter(wf => wf.tags.findIndex(tag => wfFilter!.tag.includes(tag.name)) > -1)
    }

    return workflows;
  }

  private async publishWfs(wfs: IWorkflow[]) {
    if (wfs.length > 0) {
      const outputIdsList = sortIds(wfs.map(i => i.id)).join();
      console.log(`Publishing [${outputIdsList}]`);
      const res = await this.restCliClient.importWorkflow(wfs);
      console.log(res.status, res.data);
    } else {
      console.log('There are no workflows to publish.');
    }
  }


  /****************************************************************************
   * Public
   */

  async list(json: boolean) {
    const res = await this.fetchAllWf();

    if (json) {
      const jsonRes = res.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        tags: w.tags.map(t => t.name)
      }));
      console.log(jsonRes);
    } else {
      const lines = res.map(i => `${i.id}: ${i.name}. ${i.active}. ${i.tags.map(t => t.name).join(', ')}`);
      console.log(lines.join('\n'));
    }
  }

  async delete(wfFilter: WorkflowsFilter) {
    const ids = await this.getIds(wfFilter);
    console.log('ids to delete: ', ids);
    for (const id of ids) {
      process.stdout.write(`Deleting ${id}... `);
      await this.publicApiClient.workflow.delete(id);
      console.log('Done.');
    }
  }

  async activate(wfFilter: WorkflowsFilter) {
    const ids = await this.getIds(wfFilter);
    for (const id of ids) {
      await this.publicApiClient.workflow.activate(id);
    }
  }

  async deactivate(wfFilter?: WorkflowsFilter) {
    const ids = await this.getIds(wfFilter);
    for (const id of ids) {
      await this.publicApiClient.workflow.deactivate(id);
    }
  }

  async renameFiles(dir: string, wfFilter: WorkflowsFilter) {
    const workflows = await this.getWorkflowsFromSrv(wfFilter);
    const files = getWorkflowFiles(dir);

    for (const wf of workflows) {
      const fileName = getFileNameById(files, wf.id);
      if (fileName) {
        const newName = getFileName(wf)
        fs.renameSync(path.join(dir, fileName), path.join(dir, newName))
      }
    }
  }

  async save(
    dir: string,
    wfFilter: WorkflowsFilter,
    keepFiles: boolean,
    saveAsIs: boolean,
  ) {
    const wfsFromSrv = await this.getWorkflowsFromSrv(wfFilter);
    const filesList = getWorkflowFiles(dir)
      .filter(byIds(wfFilter)); // filter needed to exclude system workflow from deletion.

    const wfsToDelete = filesList.filter(f => wfsFromSrv.findIndex(srv => srv.id === getIdFromFileName(f)) === -1);

    if (!keepFiles) {
      for (const file of wfsToDelete) {
        fs.unlinkSync(path.join(dir, file));
      }
    }

    for (const wf of wfsFromSrv) {
      const fileName = getFileName(wf);
      const filePath = path.join(dir, fileName);

      if (
        saveAsIs
        || !fs.existsSync(filePath)
        || !areWfsEqual(getWfFromFile(filePath), wf)
      ) {
        const content = JSON.stringify(wf, undefined, 2);
        fs.writeFileSync(filePath, content);
      }
    }
  }

  async publish(dir: string, wfFilter: WorkflowsFilter) {
    const wfs = this.getWorkflowsFromDir(dir, wfFilter);
    await this.publishWfs(wfs);
  }

  async setupAll(dir: string, wfFilter: WorkflowsFilter) {
    const excludeFilted = WorkflowsFilter.create(i => i.exclude.id = [...wfFilter.exclude.id])

    // Workflows
    const wfsFromSrv = await this.getWorkflowsFromSrv(excludeFilted);
    const wfsFromDir = this.getWorkflowsFromDir(dir, wfFilter);
    const wfsToDelete = wfsFromSrv.filter(i => wfsFromDir.findIndex(j => i.id === j.id) === -1);

    if (wfsToDelete.length > 0) {
      console.log(`Deleting...`);
      for (const wf of wfsToDelete) {
        const res = await this.publicApiClient.workflow.delete(wf.id);
        console.log(`Deleted ${wf.id}. Result status: ${res.status}`);
      }
    } else {
      console.log('There are no workflows at n8n instance which isn\'t present in workflows directory. So nothing to delete.')
    }

    await this.publishWfs(wfsFromDir);
  }
}
