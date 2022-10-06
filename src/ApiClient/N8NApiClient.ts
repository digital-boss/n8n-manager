import { HttpClient } from "./HttpClient";
import { Workflow } from "./resources/workflow";

/**
 * Poosibly API Client can be generated with https://github.com/swagger-api/swagger-codegen, or with other tools from swagger yaml description.
 */
export class N8NApiClient {
  
  httpClient: HttpClient;
  workflow: Workflow;

  constructor (
    public url: string,
    public apiKey: string
  ) {
    this.httpClient = new HttpClient(url, apiKey);
    this.workflow = new Workflow(this.httpClient);
  }

}