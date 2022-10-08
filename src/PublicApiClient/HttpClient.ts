import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IPublicApiConfig } from '.';

export class HttpClient {

  constructor(
    public config: IPublicApiConfig,
  ) {}

  request (opts: AxiosRequestConfig) {
    const defaultOpts: AxiosRequestConfig = {
      baseURL: this.config.url + '/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-N8N-API-KEY': this.config.apiKey
      },
      // proxy: {
      //   host: 'localhost',
      //   port: 8080
      // }
    }

    const instance = axios.create(defaultOpts)

    return instance.request(opts)
  }
}