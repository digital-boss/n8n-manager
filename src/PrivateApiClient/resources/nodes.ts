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
  
  install (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'POST',
      data: {
        name: packageName
      }
    })
    .then(this.postProcess)
  }

  uninstall (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'DELETE',
      params: {
        name: packageName
      }
    })
    .then(this.postProcess)
  }

  update (packageName: string) {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'PATCH',
      data: {
        name: packageName
      }
    })
    .then(this.postProcess)
  }

  list () {
    return this.httpClient.request({
      url: nodesUrl,
      method: 'GET',
    })
    .then(this.postProcess)
  }
}