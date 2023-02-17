import fs from "node:fs";
import path from "node:path";
import { PublicApiClient } from "src/PublicApiClient";
import { IPublicApiConfig } from "src/PublicApiClient/HttpClient";
import { IRestCliConfig, RestCliClient } from "src/RestCliClient";
import equal from 'fast-deep-equal';


interface IWorkflowTag {
  id: number;
  name: string;
}

interface IWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: IWorkflowTag[];
}

export interface IWorkflowsListParams {
  name: string[];
  id: number[];
  tag: string[];
  exclude: {
    id: number[];
  };
}

const createWfListParams = (updateFn: (i: IWorkflowsListParams) => void = () => {}): IWorkflowsListParams => {
  const o = {
    name: [],
    id: [],
    tag: [],
    exclude: {
      id: []
    }
  };
  updateFn(o);
  return o;
}


const isEmptyWfList = (wff: IWorkflowsListParams) => {
  const empty = createWfListParams();
  return equal(wff, empty);
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
  return fs.readdirSync(dir, {withFileTypes: true})
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(i => i.match(/^\d+_.*\.json$/));
}


const byIds = (wfList?: IWorkflowsListParams) => (item: string): boolean => {
  if (wfList === undefined) {
    return true;
  }

  const id = getIdFromFileName(item);
  if (wfList.id.length && !wfList.id.includes(id)) {
    return false;
  }

  if (wfList.exclude.id.length && wfList.exclude.id.includes(id)) {
    return false;
  }

  return true;
}

const getFileNameById = (files: string[], id: number) => files.find(f => f.startsWith(id.toString() + '_'));

const getIdFromFileName = (fileName: string): number => {
  const m = fileName.match(/^\d+/);
  if (m) {
    return Number.parseInt(m[0]);
  }
  return -1;
}

const getWfFromFile = (file: string): IWorkflow => {
  const content = fs.readFileSync(file, 'utf-8');
  return JSON.parse(content);
}

const hasIds = (wfList?: IWorkflowsListParams) => wfList && wfList.id && wfList.id.length;
const hasNames = (wfList?: IWorkflowsListParams) => wfList && wfList.name && wfList.name.length;
const hasTags = (wfList?: IWorkflowsListParams) => wfList && wfList.tag && wfList.tag.length;
const hasExcludedIds = (wfList?: IWorkflowsListParams) => wfList && wfList.exclude.id.length;

const getIds = (wfList: IWorkflowsListParams) => wfList.id.filter(i => !wfList.exclude.id.includes(i));

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
    const result = await this.publicApiClient.workflow.getAll();
    if (result.data.nextCursor) {
      throw new Error('It time to implement paging!')
    }
    return result.data.data;
  }

  /**
   * Fetch from n8n instance
   * @param wfList 
   * @returns 
   */
  private async getWorkflowsFromSrv(wfList?: IWorkflowsListParams): Promise<IWorkflow[]> {
    if (hasIds(wfList)) {
      const workflows = getIds(wfList!).map(
        async id => await this.publicApiClient.workflow
          .get(id)
          .then(r => r.data as IWorkflow)
      );
      return await Promise.all(workflows);
    } else {
      let wfs = await this.fetchAllWf();
      if (hasNames(wfList)) {
        wfs = wfs.filter(i => wfList!.name.includes(i.name))
      }
      if (hasTags(wfList)) {
        wfs = wfs.filter(i => i.tags.findIndex(tag => wfList!.tag.includes(tag.name)) > -1)
      }
      if (hasExcludedIds(wfList)) {
        wfs = wfs.filter(i => !wfList!.exclude.id.includes(parseInt(i.id)))
      }
      return wfs;
    }
  }

  private async getIds(wfList?: IWorkflowsListParams): Promise<number[]> {
    if (hasIds(wfList)) {
      return getIds(wfList!)
    } else {
      const wfs = await this.getWorkflowsFromSrv(wfList);
      const ids = wfs.map(i => parseInt(i.id));
      return Promise.resolve(ids);
    }
  }

  /**
   * Get From Directory
   * @param dir 
   * @param wfList 
   * @returns 
   */
  private getWorkflowsFromDir(dir: string, wfList?: IWorkflowsListParams): IWorkflow[] {
    const fromFileFn = (fileName: string) => getWfFromFile(path.join(dir, fileName))
    const filesList = getWorkflowFiles(dir).filter(byIds(wfList));
    let workflows = filesList.map(fromFileFn);

    if (hasNames(wfList)) {
      workflows = workflows.filter(wf => wfList!.name.includes(wf.name))
    }
    
    if (hasTags(wfList)) {
      workflows = workflows.filter(wf => wf.tags.findIndex(tag => wfList!.tag.includes(tag.name)) > -1)
    }

    return workflows;
  }

  private async publishWfs(wfs: IWorkflow[]) {
    if (wfs.length > 0) {
      const outputIdsList = wfs.map(i => parseInt(i.id)).sort((a, b) => a-b).join()
      console.log(`Publishing [${outputIdsList}]`)
      const res = await this.restCliClient.importWorkflow(wfs);
      console.log(res.status, res.data);
    } else {
      console.log('There is no workflows to publish.')
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

  async delete(wfList: IWorkflowsListParams) {
    const ids = await this.getIds(wfList);
    for (const id of ids) {
      await this.publicApiClient.workflow.delete(id);
    }
  }

  async activate(wfList: IWorkflowsListParams) {
    const ids = await this.getIds(wfList);
    for (const id of ids) {
      await this.publicApiClient.workflow.activate(id);
    }
  }

  async deactivate(wfList?: IWorkflowsListParams) {
    const ids = await this.getIds(wfList);
    for (const id of ids) {
      await this.publicApiClient.workflow.deactivate(id);
    }
  }

  async renameFiles(dir: string, wfList: IWorkflowsListParams) {
    const workflows = await this.getWorkflowsFromSrv(wfList);
    const files = getWorkflowFiles(dir);

    for (const wf of workflows) {
      const fileName = getFileNameById(files, parseInt(wf.id));
      if (fileName) {
        const newName = getFileName(wf)
        fs.renameSync(path.join(dir, fileName), path.join(dir, newName))
      }
    }
  }

  async save(
    dir: string, 
    wfList: IWorkflowsListParams, 
    keepFiles: boolean,
  ) {
    const workflows = await this.getWorkflowsFromSrv(wfList);
    const fileList = getWorkflowFiles(dir);
    
    if (!keepFiles && isEmptyWfList(wfList)) {
      for (const file of fileList) {
        fs.unlinkSync(path.join(dir, file));
      }
    }

    for (const wf of workflows) {
      const newFileName = getFileName(wf);
      const filePath = path.join(dir, newFileName);
      const content = JSON.stringify(wf, undefined, 2);
      fs.writeFileSync(filePath, content);
    }
  }

  async publish(dir: string, wfList: IWorkflowsListParams) {
    const wfs = this.getWorkflowsFromDir(dir, wfList);
    await this.publishWfs(wfs);
  }

  async setupAll(dir: string, wfList: IWorkflowsListParams) {
    // Workflows
    const wfsFromSrv = await this.getWorkflowsFromSrv();
    const wfsFromDir = this.getWorkflowsFromDir(dir, wfList);
    const wfsToDelete = wfsFromSrv.filter(i => wfsFromDir.findIndex(j => i.id === j.id) === -1);

    if (wfsToDelete.length > 0) {
      console.log(`Deleting...`);
      for (const wf of wfsToDelete) {
        const res = await this.publicApiClient.workflow.delete(parseInt(wf.id));
        console.log(`Deleted ${wf.id}. Result status: ${res.status}`);
      }
    } else {
      console.log('There is no workflows at n8n instance which doesn\' present in workdlows directory. So nothing to delete.')
    }

    await this.publishWfs(wfsFromDir);
  }
}