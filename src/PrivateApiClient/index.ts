import { HttpClient, IPrivateApiConfig } from "./HttpClient";

/**
 * Possibly API Client can be generated with https://github.com/swagger-api/swagger-codegen, or with other tools from swagger yaml description.
 */
export class PrivateApiClient {
  
  httpClient: HttpClient;

  constructor (
    public config: IPrivateApiConfig,
  ) {
    this.httpClient = new HttpClient(config);
  }

  install (packageName: string) {

  }

  uninstall (packageName: string) {

  }

  update (packageName: string) {

  }

  list () {

  }
}