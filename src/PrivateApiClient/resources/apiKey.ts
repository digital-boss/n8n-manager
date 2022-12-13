import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

const url = '/rest/me/api-key';

export class ApiKey extends ResourceBase {

  create () {
    return this.httpClient.request({
      url: url,
      method: 'POST',
    })
  }

  delete () {
    return this.httpClient.request({
      url: url,
      method: 'DELETE',
    })
  }

}