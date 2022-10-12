import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

const nodesUrl = '/rest/nodes';

export class Nodes extends ResourceBase {

  private async postProcess (r: AxiosResponse) {
    if (r.status !== 200) {
      throw new Error(`${r.status} ${r.statusText}`)
    } else {
      return r.data;
    }
  }
  
  private errHandler = (err: any) => {
    console.log(err.config);
    console.log(err.response.data);
    throw new Error(err.response.data.message);
  }

  install (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'POST',
      data: {
        name: packageName
      }
    })
    .catch(this.errHandler)
  }

  uninstall (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'DELETE',
      params: {
        name: packageName
      }
    })
    .catch(this.errHandler)
  }

  update (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'PATCH',
      data: {
        name: packageName
      }
    })
    .catch(this.errHandler)
  }

  list () {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'GET',
    })
    .catch(this.errHandler)
  }
}