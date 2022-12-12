import { IRestCliConfig, RestCliClient } from "src/RestCliClient"
import fs from "node:fs";
import path from "node:path";

export class Credentials {
  
  restCliClient: RestCliClient

  constructor(
    public restCliCfg: IRestCliConfig,
  ) {
    this.restCliClient = new RestCliClient(this.restCliCfg)
  }

  async import(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    const res = await this.restCliClient.importCreds(json);
    console.log(res.status, res.data);
  }

  async export(filePath: string, decrypted: boolean) {
    const res = await this.restCliClient.exportCreds(decrypted);
    console.log(res.status);
    fs.writeFileSync(filePath, JSON.stringify(res.data, undefined, 2));
  }

}