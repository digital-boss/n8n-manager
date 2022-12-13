import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

const url = '/rest/me/api-key';

export class ApiKey extends ResourceBase {

  private errHandler = (err: any) => {
    console.log(err.config);
    console.log(err.response.data);
    throw new Error(err.response.data.message);
  }

  create () {
    return this.httpClient.request({
      url: url,
      method: 'POST',
    })
    .catch(this.errHandler)
  }

  delete () {
    return this.httpClient.request({
      url: url,
      method: 'DELETE',
    })
    .catch(this.errHandler)
  }

}