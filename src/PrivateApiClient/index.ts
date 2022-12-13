import { HttpClient, IPrivateApiConfig } from "./HttpClient";
import { ApiKey } from "./resources/apiKey";
import { Nodes } from "./resources/nodes";
import { Owner } from "./resources/owner";

/**
 * Possibly API Client can be generated with https://github.com/swagger-api/swagger-codegen, or with other tools from swagger yaml description.
 */
export class PrivateApiClient {
  
  httpClient: HttpClient;
  nodes: Nodes
  apiKey: ApiKey
  owner: Owner

  constructor (
    public config: IPrivateApiConfig,
  ) {
    this.httpClient = new HttpClient(config);
    this.nodes = new Nodes(this.httpClient);
    this.apiKey = new ApiKey(this.httpClient);
    this.owner = new Owner(this.httpClient);
  }

}