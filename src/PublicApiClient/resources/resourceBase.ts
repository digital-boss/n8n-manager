import { HttpClient } from "../HttpClient";

export abstract class ResourceBase {
  constructor (protected httpClient: HttpClient) {}
}