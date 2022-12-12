import { IRestCliConfig, RestCliClient } from "src/RestCliClient"
import fs from "node:fs";
import path from "node:path";
import { PrivateApiClient } from "src/PrivateApiClient";
import { IPrivateApiConfig } from "src/PrivateApiClient/HttpClient";
import { IConfig } from "./utils/config";

export class ApiKey {
  
  private client: PrivateApiClient;

  constructor(
    public config: IConfig,
    public configPath: string,
  ) {
    const privateApiCfg: IPrivateApiConfig = {
      url: config.n8n.url,
      email: config.n8n.email,
      password: config.n8n.password,
      proxy: config.proxy
    }
    this.client = new PrivateApiClient(privateApiCfg)
  }

  async create(updateConfig: boolean, outputPath: string) {
    const res = await this.client.apiKey.create();

    if (updateConfig) {
      this.config.n8n.publicApiKey = res.data.data.apiKey;
      const content = JSON.stringify(this.config, undefined, 2);
      fs.writeFileSync(this.configPath, content, 'utf-8');
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, res.data.data.apiKey, 'utf-8');
    }

    if (!updateConfig && !outputPath) {
      console.log(res.data.data.apiKey)
    }
  }

  async delete() {
    const res = await this.client.apiKey.delete();
    console.log(res.status, res.data);
  }

}