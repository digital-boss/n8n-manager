import { HttpClient, IPrivateApiConfig } from "./HttpClient";
import { ApiKey } from "./resources/apiKey";
import { Nodes } from "./resources/nodes";

/**
 * Possibly API Client can be generated with https://github.com/swagger-api/swagger-codegen, or with other tools from swagger yaml description.
 */
export class PrivateApiClient {
  
  httpClient: HttpClient;
  nodes: Nodes
  apiKey: ApiKey

  constructor (
    public config: IPrivateApiConfig,
  ) {
    this.httpClient = new HttpClient(config);
    this.nodes = new Nodes(this.httpClient);
    this.apiKey = new ApiKey(this.httpClient);
  }

}