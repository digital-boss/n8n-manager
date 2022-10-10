import fs from "node:fs";
import path from "node:path";
import { PublicApiClient } from "src/PublicApiClient";
import { IPublicApiConfig } from "src/PublicApiClient/HttpClient";

export interface IBackupOpts {
  dir: string;
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

export class Workflows {
  constructor(public publicApiCfg: IPublicApiConfig) {}

  async backup(opts: IBackupOpts) {
    const client = new PublicApiClient(this.publicApiCfg)
    const workflows = await client.workflow.getAll();
    if (workflows.nextCursor) {
      throw new Error('It time to implement paging!')
    }
  
    const list = workflows.data;
  
    for (let i=0; i < list.length; i++) {
      const item = list[i];
      const wf = await client.workflow.get(item.id);
      fs.writeFileSync(path.join(opts.dir, getFileName(wf)), JSON.stringify(wf, undefined, 2));
    }
  }
}