import { fstat } from "node:fs";
import { HttpClient } from "../../ApiClient/HttpClient";
import { N8NApiClient } from "../../ApiClient/N8NApiClient";
import fs from 'node:fs';
import path from 'node:path';
import { IN8NConfig } from "../interfaces";

interface IBackupOpts {
  dir: string;
  name: string[];
}

const getFileName = (wf: any) => {
  const name = wf.name
    .replace(/[:|]/, '-')
    .replace(/\s|\\|\//g, '_')
  return `${wf.id}_${name}.json`;
}

export const backup = async (config: IN8NConfig, opts: IBackupOpts) => {
  const client = new N8NApiClient(config.url, config.apiKey)
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