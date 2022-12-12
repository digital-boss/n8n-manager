import { ResourceBase } from "./resourceBase";
import { AxiosResponse } from "axios";

const url = '/rest/owner';

interface IOwner {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class Owner extends ResourceBase {

  private errHandler = (err: any) => {
    console.log(err);
    throw new Error(err);
  }

  create (owner: IOwner) {
    return this.httpClient.request({
      url: url,
      method: 'POST',
      data: owner,
    })
    .catch(this.errHandler)
  }

}