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

  private errHandler = (err: any) => {
    console.log(err.config);
    console.log(err.response.data);
    throw new Error(err.response.data.message);
  }

  getAll () {
    return this.httpClient.request({
      url: '/workflows',
      method: 'GET',
    })
    .catch(this.errHandler)
  }
  
  get (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'GET',
    })
    .catch(this.errHandler)
  }
  
  delete (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'DELETE',
    })
    .catch(this.errHandler)
  }

  create (wf: any) {
    return this.httpClient.request({
      url: '/workflows',
      method: 'POST',
      data: wf
    })
    .catch(this.errHandler)
  }

  update (id: number, wf: any) {
    return this.httpClient.request({
      url: `/workflows/${id}`,
      method: 'PUT',
      data: wf
    })
    .catch(this.errHandler)
  }
  
  activate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/activate`,
      method: 'POST',
    })
    .catch(this.errHandler)
  }
  
  deactivate (id: number) {
    return this.httpClient.request({
      url: `/workflows/${id}/deactivate`,
      method: 'POST',
    })
    .catch(this.errHandler)
  }
}