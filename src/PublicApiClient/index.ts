import { HttpClient } from "./HttpClient";
import { Workflow } from "./resources/workflow";

export interface IPublicApiConfig {
  url: string;
  apiKey: string;
}

/**
 * Poosibly API Client can be generated with https://github.com/swagger-api/swagger-codegen, or with other tools from swagger yaml description.
 */
export class PublicApiClient {
  
  httpClient: HttpClient;
  workflow: Workflow;

  constructor (
    public config: IPublicApiConfig,
  ) {
    this.httpClient = new HttpClient(config);
    this.workflow = new Workflow(this.httpClient);
  }

}