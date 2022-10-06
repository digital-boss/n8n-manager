import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpClient {

  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  request (opts: AxiosRequestConfig) {
    const defaultOpts: AxiosRequestConfig = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-N8N-API-KEY': this.apiKey
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