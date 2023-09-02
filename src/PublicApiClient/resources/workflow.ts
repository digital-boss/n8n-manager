import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

export class Workflow extends ResourceBase {

  // private async postProcess (r: AxiosResponse) {
  //   if (r.status !== 200) {
  //     throw new Error(`${r.status} ${r.statusText}`)
  //   } else {
  //     return r;
  //   }
  // }

  getAll () {
    return this.httpClient.request({
      url: '/workflows',
      method: 'GET',
    })
  }
  
  get (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'GET',
    })
  }
  
  delete (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'DELETE',
    })
  }

  create (wf: any) {
    return this.httpClient.request({
      url: '/workflows',
      method: 'POST',
      data: wf
    })
  }

  update (id: number, wf: any) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'PUT',
      data: wf
    })
  }
  
  activate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/activate`,
      method: 'POST',
    })
  }
  
  deactivate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/deactivate`,
      method: 'POST',
    })
  }
}