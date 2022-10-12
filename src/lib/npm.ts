import { PrivateApiClient } from "src/PrivateApiClient";
import { IPrivateApiConfig } from "src/PrivateApiClient/HttpClient";

export class Npm {

  client: PrivateApiClient;

  constructor(public config: IPrivateApiConfig) {
    this.client = new PrivateApiClient(config);
  }

  async list (json: boolean) {
    const res = await this.client.nodes.list();
    if (json) {
      console.log(res.data)
    } else {
      //res.data
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