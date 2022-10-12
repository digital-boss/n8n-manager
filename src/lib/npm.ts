import { PrivateApiClient } from "src/PrivateApiClient";
import { IPrivateApiConfig } from "src/PrivateApiClient/HttpClient";

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
      const list = data.map((i: any) => `${i.packageName}@${i.installedVersion}. Nodes: ${i.installedNodes.map((j: any) => j.name).join(', ')}`)
      console.log(list.join('\n'));
    }
  }

  async install (packages: string[]) {

  }

  async uninstall (packages: string[]) {

  }

  async update (packages: string[]) {

  }

  async setupAll () {

  }
}