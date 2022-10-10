import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IPrivateApiConfig {
  url: string;
  email: string;
	password: string;
}

export class HttpClient {

	private cookie: string = '';

  constructor(
    public config: IPrivateApiConfig,
  ) {}

	protected setNewCookie = async (): Promise<string> => {
		const t = await this.internalApiLogin();
		this.cookie = t;
		return t;
	}

	protected getCookie = async (): Promise<string> => {
		return this.cookie || this.setNewCookie();
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
		};
	
		let response;
		try {
			response = await axios(options);
		} catch (res) {
			throw new Error(`Login error: ${res.error}`);
		}
	
		if (response.status === 200 && response.headers?.['set-cookie']) {
			return response.headers?.['set-cookie'][0];
		}
	
		throw new Error(`Login error: No cookies received`);
	}

	async request (options: AxiosRequestConfig) {
		options.headers = options.headers || {};
		const headers = options.headers;
		headers['Content-Type'] = headers['Content-Type'] || 'application/json';
		return this.requestInternal(options, 0);
	}

	private async requestInternal (options: AxiosRequestConfig, count = 0): Promise<any> {
		const cookie = await this.getCookie();

		try {
			options.headers!['Cookie'] = cookie;
			return await axios(options);
		} catch (res) {
			if (res) {
				if (res.statusCode === 401) {
					if (count > 1) {
						throw new Error('Login failed: Two times login returned cookies, but it was theated as Unauthorized in next response');
					}
					this.cookie = '';
					return this.requestInternal(options, count + 1);
				}
			}
			throw(res);
		}
	};
}
