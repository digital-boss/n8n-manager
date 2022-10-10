import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

export class Workflow extends ResourceBase {

  // private async postProcess (r: AxiosResponse) {
  //   if (r.status !== 200) {
  //     throw new Error(`${r.status} ${r.statusText}`)
  //   } else {
  //     return r.data;
  //   }
  // }

  getAll () {
    return this.httpClient.request({
      url: '/workflows',
      method: 'GET',
    })
    // .then(this.postProcess)
  }
  
  get (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'GET',
    })
    // .then(this.postProcess)
  }
  
  delete (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'DELETE',
    })
    // .then(this.postProcess)
  }

  create (wf: any) {
    return this.httpClient.request({
      url: '/workflows',
      method: 'POST',
      data: wf
    })
    // .then(this.postProcess)
  }

  update (id: number, wf: any) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'PUT',
      data: wf
    })
    // .then(this.postProcess)
  }
  
  activate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/activate`,
      method: 'POST',
    })
    // .then(this.postProcess)
  }
  
  deactivate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/deactivate`,
      method: 'POST',
    })
    // .then(this.postProcess)
  }
}