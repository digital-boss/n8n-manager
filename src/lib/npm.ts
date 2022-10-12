import { PrivateApiClient } from "src/PrivateApiClient";
import { IPrivateApiConfig } from "src/PrivateApiClient/HttpClient";
import fs from "node:fs";
import path from "node:path";
interface INodePackage {
  packageName: string;
  installedVersion: string;
  installedNodes: {
    name: string;
  }[]
}

const nodesListToText = (nodesPackages: INodePackage[]) => {
  const list = nodesPackages.map(i => {
    const nodes = i.installedNodes.map(j => j.name).join(', '); 
    return `${i.packageName}@${i.installedVersion}. Nodes: ${nodes}`
  })
  return list.join('\n');
}

export class Npm {

  client: PrivateApiClient;

  constructor(public config: IPrivateApiConfig) {
    this.client = new PrivateApiClient(config);
  }

  async list (json: boolean) {
    const res = await this.client.nodes.list();
    const data = res.data.data;
    if (json) {
      console.log(JSON.stringify(data, undefined, 2));
    } else {
      const listTxt = nodesListToText(data);
      console.log(listTxt);
    }
  }

  async saveList (file: string) {
    const res = await this.client.nodes.list();
    const data = res.data.data as INodePackage[];
    const list = data.map(i => `${i.packageName}@${i.installedVersion}`);
    const content = list.sort().join('\n') + '\n'
    fs.writeFileSync(file, content);
  }

  async install (packages: string[]) {

  }

  async uninstall (packages: string[]) {

  }

  async update (packages: string[]) {

  }

  async setupAll (file: string) {

  }
}