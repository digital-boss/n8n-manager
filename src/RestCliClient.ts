import axios, { AxiosProxyConfig, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IRestCliConfig {
  /**
   * url of n8n instance
   */
  url: string,
  auth: IBasicAuth,
  proxy?: AxiosProxyConfig,
}

export interface IBasicAuth {
  user: string,
  password: string,
}

/**
 * REST interface for n8n CLI https://docs.n8n.io/reference/cli-commands.
 * Because of "import workflow", that can import also ID and tags isn't implemented in n8n API 
 * and exists only as CLI, this REST client to n8n workflow that utilize n8n CLI, was created.
 */
export class RestCliClient {
  constructor (
    public config: IRestCliConfig
  ) {}
  
  async importWorkflow (json: any) {
    const opts: AxiosRequestConfig = {
      url: this.config.url + '/webhook/import-workflow',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'POST',
      auth: {
        username: this.config.auth.user,
        password: this.config.auth.password,
      },
      proxy: this.config.proxy,
      data: json,
    }

    return await axios(opts);
  }

  async importCreds (json: any) {
    const opts: AxiosRequestConfig = {
      url: this.config.url + '/webhook/import-credentials',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'POST',
      auth: {
        username: this.config.auth.user,
        password: this.config.auth.password,
      },
      proxy: this.config.proxy,
      data: json,
    }

    return await axios(opts);
  }

  async exportCreds (decrypted: boolean) {
    const opts: AxiosRequestConfig = {
      url: this.config.url + '/webhook/export-credentials',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'GET',
      auth: {
        username: this.config.auth.user,
        password: this.config.auth.password,
      },
      params: {},
      proxy: this.config.proxy,
    }

    if (decrypted) {
      opts.params.decrypted = 1;
    }

    return await axios(opts);
  }
}