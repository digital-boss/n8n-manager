import fs from "node:fs";
import path from "node:path";
import { PublicApiClient } from "src/PublicApiClient";
import { IPublicApiConfig } from "src/PublicApiClient/HttpClient";

interface IWorkflowTag {
  id: number;
  name: string;
}

interface IWorkflow {
  id: number;
  name: string;
  active: boolean;
  tags: IWorkflowTag[];
}

export interface IWorkflowsListParams {
  name: string[];
  id: number[];
  tag: string[];
}

const getFileName = (wf: IWorkflow) => {
  const name = wf.name
    .replace(/::|: /g, ' - ')
    .replace(/[:|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\\|\//g, '_')
  return `${wf.id}_${name}.json`;
}

const getWorkflowFiles = (dir: string) => {
  return fs.readdirSync(dir, {withFileTypes: true})
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(i => i.match(/\d+_.*\.json/));
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

const removeReadonlyProps = (wf: IWorkflow) => {
  const w: any = { ...wf };
  delete w.id;
  delete w.active;
  delete w.createdAt;
  delete w.updatedAt;
  delete w.tags;
  // w.tags = w.tags.map((t: any) => {
  //   delete t.createdAt;
  //   delete t.updatedAt;
  //   return t;
  // });
  return w;
}

export class Workflows {
  
  publicApiClient: PublicApiClient

  constructor(public publicApiCfg: IPublicApiConfig) {
    this.publicApiClient = new PublicApiClient(this.publicApiCfg)
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
      const workflows = wfList!.id.map(
        async id => await this.publicApiClient.workflow
          .get(id)
          .then(r => r.data as IWorkflow)
      );
      return await Promise.all(workflows);
    } else {
      const all = await this.fetchAllWf();
      const filtered = hasNames(wfList)
        ? all.filter(i => wfList!.name.includes(i.name))
        : hasTags(wfList)
        ? all.filter(i => i.tags.findIndex(tag => wfList!.tag.includes(tag.name)) > -1)
        : all;
      return filtered;
    }
  }

  private async getIds(wfList?: IWorkflowsListParams): Promise<number[]> {
    if (hasIds(wfList)) {
      return wfList!.id
    } else {
      const wfs = await this.getWorkflowsFromSrv(wfList);
      const ids = wfs.map(i => i.id);
      return Promise.resolve(ids);
    }
  }

  /**
   * Get From Directory
   * @param dir 
   * @param wfList 
   * @returns 
   */
  private async getWorkflowsFromDir(dir: string, wfList?: IWorkflowsListParams): Promise<IWorkflow[]> {
    const fromFileFn = (fileName: string) => getWfFromFile(path.join(dir, fileName))
    const listOfAll = getWorkflowFiles(dir);

    if (hasNames(wfList)) {
      return listOfAll
        .map(fromFileFn)
        .filter(wf => wfList!.name.includes(wf.name))
    }
    
    const fileNames = hasIds(wfList)
      ? listOfAll.filter(fileName => wfList!.id.includes(getIdFromFileName(fileName)))
      : listOfAll
    
    const workflows = fileNames.map(fromFileFn);

    const filteredWfs = hasTags(wfList)
      ? workflows.filter(wf => wf.tags.findIndex(tag => wfList!.tag.includes(tag.name)) > -1)
      : workflows

    return Promise.resolve(filteredWfs);
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
    };
  }

  async deactivate(wfList?: IWorkflowsListParams) {
    const ids = await this.getIds(wfList);
    for (const id of ids) {
      await this.publicApiClient.workflow.deactivate(id);
    };
  }

  async renameFiles(dir: string, wfList: IWorkflowsListParams) {
    const workflows = await this.getWorkflowsFromSrv(wfList);
    const files = getWorkflowFiles(dir);

    for (const wf of workflows) {
      const fileName = getFileNameById(files, wf.id);
      if (fileName) {
        const newName = getFileName(wf)
        fs.renameSync(path.join(dir, fileName), path.join(dir, newName))
      }
    }
  }

  async save(dir: string, wfList: IWorkflowsListParams, deleteOldFile: boolean) {
    const workflows = await this.getWorkflowsFromSrv(wfList);
    const fileList = getWorkflowFiles(dir);
    for (const wf of workflows) {
      const newFileName = getFileName(wf);
      const filePath = path.join(dir, newFileName);
      const content = JSON.stringify(wf, undefined, 2);
      if (deleteOldFile) {
        const oldFile = fileList.find(fileName => getIdFromFileName(fileName) === wf.id);
        if (oldFile) {
          fs.unlinkSync(path.join(dir, oldFile));
        }
      }
      fs.writeFileSync(filePath, content);
    };
  }

  async publish(dir: string, wfList: IWorkflowsListParams) {
    const workflowsFromSrv = await this.getWorkflowsFromSrv();
    const workflowsFromDir = await this.getWorkflowsFromDir(dir, wfList);

    // group workflows by action
    const wfsToUpdate = workflowsFromDir.filter(wd => workflowsFromSrv.findIndex(ws => ws.id === wd.id) > -1)
    const wfsToCreate = workflowsFromDir.filter(wd => workflowsFromSrv.findIndex(ws => ws.id === wd.id) === -1)

    for (const wf of wfsToUpdate) {
      console.log(`updating ${wf.id} ${wf.name}`)
      const res = await this.publicApiClient.workflow.update(wf.id, wf);
      console.log(res.status);
    }
    
    for (const wf of wfsToCreate) {
      console.log(`creating ${wf.id} ${wf.name}`)
      const res = await this.publicApiClient.workflow.create(removeReadonlyProps(wf));
      console.log(res.status);
    }

  }

  async setupAll(dir: string) {
    const workflowsFromSrv = await this.getWorkflowsFromSrv();
    const workflowsFromDir = await this.getWorkflowsFromDir(dir);

    // Workflows
    const wfsToDelete = workflowsFromSrv.filter(i => workflowsFromDir.findIndex(j => i.id === j.id) === -1);
    const wfsToUpdate = workflowsFromDir.filter(i => workflowsFromSrv.findIndex(j => i.id === j.id) > -1);
    const wfsToCreate = workflowsFromDir.filter(i => workflowsFromSrv.findIndex(j => i.id === j.id) === -1);

    console.log('Deactivate all...');
    await this.deactivate();

    console.log(`Deleting...`);
    for (const wf of wfsToDelete) {
      const res = await this.publicApiClient.workflow.delete(wf.id);
      console.log(`Deleted ${wf.id}. Result status: ${res.status}`);
    }

    console.log(`Updating...`);
    for (const wf of wfsToUpdate) {
      const res = await this.publicApiClient.workflow.update(wf.id, wf);
      console.log(`Updated ${wf.id} ${wf.name}. Result status: ${res.status}`);
    }

    console.log(`Creating...`);
    for (const wf of wfsToCreate) {
      const res = await this.publicApiClient.workflow.create(wf);
      console.log(`Created ${wf.name}. New id: ${res.data.id}`);
    }

    console.log('Activate live...');
    await this.activate({id: [], name: [], tag: ['live']})
  }
}