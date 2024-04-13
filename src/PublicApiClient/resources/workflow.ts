import { ResourceBase } from "./resourceBase";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export class Workflow extends ResourceBase {

  // private async postProcess (r: AxiosResponse) {
  //   if (r.status !== 200) {
  //     throw new Error(`${r.status} ${r.statusText}`)
  //   } else {
  //     return r;
  //   }
  // }

  getAll (cursor: string = '') {
    const options: AxiosRequestConfig = {
      url: '/workflows',
      method: 'GET',
      params: {
        limit: 250,
      }
    }
    if (cursor != '') {
      options.params.cursor = cursor;
    }
    return this.httpClient.request(options)
  }
  
  get (id: string) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'GET',
    })
  }
  
  delete (id: string) {
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

  update (id: string, wf: any) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'PUT',
      data: wf
    })
  }
  
  activate (id: string) {
    return this.httpClient.request({
      url: `/workflows/${id}/activate`,
      method: 'POST',
    })
  }
  
  deactivate (id: string) {
    return this.httpClient.request({
      url: `/workflows/${id}/deactivate`,
      method: 'POST',
    })
  }
}