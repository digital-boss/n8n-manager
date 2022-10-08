import { fstat } from "node:fs";
import { HttpClient } from "src/PublicApiClient/HttpClient";
import { IPublicApiConfig, PublicApiClient } from "src/PublicApiClient";
import fs from 'node:fs';
import path from 'node:path';

interface IBackupOpts {
  dir: string;
  name: string[];
}

const getFileName = (wf: any) => {
  const name = wf.name
    .replace(/::|: /g, ' - ')
    .replace(/[:|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\\|\//g, '_')
  return `${wf.id}_${name}.json`;
}

export const backup = async (config: IPublicApiConfig, opts: IBackupOpts) => {
  const client = new PublicApiClient(config)
  const data = await client.workflow.getAll();
  if (data.nextCursor) {
    throw new Error('It time to implement paging!')
  }

  const list = data.data;

  for (let i=0; i < list.length; i++) {
    const item = list[i];
    const wf = await client.workflow.get(item.id);
    fs.writeFileSync(path.join(opts.dir, getFileName(wf)), JSON.stringify(wf, undefined, 2));
  }
}