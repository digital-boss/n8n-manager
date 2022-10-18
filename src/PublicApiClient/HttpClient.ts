import axios, { AxiosProxyConfig, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IPublicApiConfig {
  url: string;
  apiKey: string;
  proxy?: AxiosProxyConfig
}

export class HttpClient {

  constructor(
    public config: IPublicApiConfig,
  ) {}

  private errHandler = (err: any) => {
    console.log(err.config);
    console.log(err.response.data);
    throw new Error(err.response.data.message);
  }

  request (opts: AxiosRequestConfig) {
    const defaultOpts: AxiosRequestConfig = {
      baseURL: this.config.url + '/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-N8N-API-KEY': this.config.apiKey
      },
      proxy: this.config.proxy,
    }

    const instance = axios.create(defaultOpts)

    return instance.request(opts).catch(this.errHandler)
  }
}