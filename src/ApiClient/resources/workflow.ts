import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

export class Workflow extends ResourceBase {

  private async postProcess (r: AxiosResponse) {
    if (r.status !== 200) {
      throw new Error(`${r.status} ${r.statusText}`)
    } else {
      return r.data;
    }
  }

  getAll (): Promise<any> {
    return this.httpClient.request({
      url: '/workflows',
      method: 'GET',
    })
    .then(this.postProcess)
  }
  
  get (id: number): Promise<any> {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'GET',
    })
    .then(this.postProcess)
  }
  
  // delete (): Promise<any> {}
  
  // update (): Promise<any> {}
  
  // activate (): Promise<any> {}
  
  // deactivate (): Promise<any> {}
}