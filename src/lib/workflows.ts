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
}

const getFileName = (wf: any) => {
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

const getFileById = (files: string[], id: number) => files.find(f => f.startsWith(id.toString() + '_'));

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

export class Workflows {
  
  publicApiClient: PublicApiClient
  workflows?: Array<IWorkflow> = undefined;

  constructor(public publicApiCfg: IPublicApiConfig) {
    this.publicApiClient = new PublicApiClient(this.publicApiCfg)
  }

  private clearCache() {
    this.workflows = undefined;
  }

  private async fetchAllWf(): Promise<void> {
    const result = await this.publicApiClient.workflow.getAll();
    if (result.data.nextCursor) {
      throw new Error('It time to implement paging!')
    }
    this.workflows = result.data.data;
  }

  private async getAllWf(): Promise<IWorkflow[]> {
    if (this.workflows === undefined) {
      await this.fetchAllWf();
    }
    return Promise.resolve(this.workflows!);
  }

  private async getWfById(id: number): Promise<IWorkflow> {
    if (this.workflows) {
      const wf = this.workflows.find(wf => wf.id === id)
      return Promise.resolve(wf!);
    }
    const res = await this.publicApiClient.workflow.get(id);
    return res.data;
  }

  private async getIds(wfList: IWorkflowsListParams): Promise<number[]> {
    if (wfList.id && wfList.id.length) {
      return wfList.id
    } else {
      const all = await this.getAllWf();
      const filtered: any = wfList.name && wfList.name.length
        ? all.filter((i: any) => wfList.name.includes(i.name))
        : all;
      const ids = filtered.map((i: any) => i.id);
      return Promise.resolve(ids);
    }
  }

  async delete(wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    ids.forEach(async id => {
      await this.publicApiClient.workflow.delete(id);
    })    
  }

  async activate(wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    ids.forEach(async id => {
      await this.publicApiClient.workflow.activate(id);
    });
  }

  async deactivate(wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    ids.forEach(async id => {
      await this.publicApiClient.workflow.deactivate(id);
    });
  }

  async renameFiles(dir: string, wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    const files = getWorkflowFiles(dir);

    ids.forEach(async id => {
      const fileName = getFileById(files, id);
      if (fileName) {
        const wf = await this.getWfById(id);
        const newName = getFileName(wf!.name)
        fs.renameSync(path.join(dir, fileName), path.join(dir, newName))
      }
    })
  }

  async save(dir: string, wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    ids.forEach(async id => {
      const wf = await this.getWfById(id);
      const filePath = path.join(dir, getFileName(wf));
      const content = JSON.stringify(wf, undefined, 2);
      fs.writeFileSync(filePath, content);
    });
  }

  async publish(dir: string, wfList: IWorkflowsListParams) {
    this.clearCache();
    const ids = await this.getIds(wfList);
    const files = getWorkflowFiles(dir);

    ids.forEach(async id => {
      const fileName = getFileById(files, id);
      if (fileName) {
        const wf = await this.getWfById(id);
        const fromFile = getWfFromFile(path.join(dir, fileName));
        if (wf) {
          console.log(`updating ${fileName}`)
          const res = await this.publicApiClient.workflow.update(id, fromFile);
          console.log(res.status);
        } else {
          console.log(`creating ${fileName}`)
          const res = await this.publicApiClient.workflow.create(fromFile);
          console.log(res.status);
        }
      }
    });
  }

  async setupAll(dir: string) {
    this.clearCache();
    this.fetchAllWf();
    const files = getWorkflowFiles(dir);
    const idsFromFiles = files.map(f => getIdFromFileName(f));
    const idsFromSrv = this.workflows!.map(wf => wf.id)

    // ids
    const idsToDelete = idsFromSrv.filter(id => !idsFromFiles.includes(id));
    const idsToUpdate = idsFromSrv.filter(id => idsFromFiles.includes(id));
    const idsToCreate = idsFromFiles.filter(id => !idsFromSrv.includes(id));

    console.log(`Deleting:`);
    idsToDelete.forEach(async id => {
      await this.publicApiClient.workflow.delete(id);
      console.log(`Deleted ${id}`);
    })

    console.log(`Updating:`);
    idsToUpdate.forEach(async id => {
      const fileName = getFileById(files, id);
      const wf = getWfFromFile(path.join(dir, fileName!));
      await this.publicApiClient.workflow.update(id, wf);
      console.log(`Updated ${fileName}`);
    })

    console.log(`Creating:`);
    idsToCreate.forEach(async id => {
      const fileName = getFileById(files, id);
      const wf = getWfFromFile(path.join(dir, fileName!));
      const res = await this.publicApiClient.workflow.create(wf);
      console.log(`Created ${fileName}. New id: ${res.data.id}`);
    })
  }
}