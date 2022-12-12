import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosProxyConfig } from 'axios';

export interface IPrivateApiConfig {
  url: string;
  email: string;
	password: string;
	proxy?: AxiosProxyConfig;
}

export class HttpClient {

	private cookie: string = '';

  constructor(
    public config: IPrivateApiConfig,
  ) {}

	protected setNewCookie = async (): Promise<string> => {
		for (let method of [
			this.checkOwner,
			this.internalApiLogin
		]) {
			const token = await method.call(this);
			if (token) {
				this.cookie = token;
				return token;
			}
		}
		throw new Error("Unexpected result");
	}

	protected getCookie = async (): Promise<string> => {
		return this.cookie || this.setNewCookie();
	}

	async checkOwner (): Promise<string | undefined> {
		const options: AxiosRequestConfig = {
			url: `${this.config.url}/rest/login`,
			method: 'GET',
			headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
			},
			proxy: this.config.proxy,
		};
	
		let response;
		try {
			response = await axios(options);
		} catch (res) {
			throw new Error(`checkOwner: ${res.error}`);
		}
	
		if (response.status === 200 && response.headers?.['set-cookie']) {
			return response.headers?.['set-cookie'] as unknown as string; // https://github.com/axios/axios/issues/5083 AxiosHeaders get 'set-cookie' returns string instead of array
		} else {
			return undefined;
		}
	}

	async internalApiLogin (): Promise<string> {
		const options: AxiosRequestConfig = {
			url: `${this.config.url}/rest/login`,
			method: 'POST',
			headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
			},
			data: {
				email: this.config.email,
				password: this.config.password,
			},
			proxy: this.config.proxy,
		};
	
		let response;
		try {
			response = await axios(options);
		} catch (res) {
			throw new Error(`Login error: ${res.error}`);
		}
	
		if (response.status === 200 && response.headers?.['set-cookie']) {
			return response.headers?.['set-cookie'] as unknown as string; // https://github.com/axios/axios/issues/5083 AxiosHeaders get 'set-cookie' returns string instead of array
		}
	
		throw new Error(`Login error: No cookies received`);
	}

	async request (options: AxiosRequestConfig) {
		return this.requestInternal(options, 0);
	}

	private async requestInternal (options: AxiosRequestConfig, count = 0): Promise<AxiosResponse> {
		const cookie = await this.getCookie();

		const defaultOpts: AxiosRequestConfig = {
      baseURL: this.config.url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
				'Cookie': cookie
      },
			proxy: this.config.proxy,
    }

		const instance = axios.create(defaultOpts)

		try {
			return instance.request(options);
		} catch (err: any | AxiosError) {
			if (axios.isAxiosError(err)) {
				if (err.status === 401) {
					if (count > 1) {
						throw new Error('Login failed: Two times login returned cookies, but it was theated as Unauthorized in next response');
					}
					this.cookie = '';
					return this.requestInternal(options, count + 1);
				}
			}
			throw(err);
		}
	};
}
