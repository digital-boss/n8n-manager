import { AxiosProxyConfig } from "axios";
import { setValue, traverse, VisitorFn } from "./traverse";

export interface IConfig {
  n8n: {
    url: string;
    publicApiKey: string;
    email: string;
    password: string;
  }
  workflows: {
    dir: string;
  },
  proxy?: AxiosProxyConfig
}

export const createEmptyConfig = (): IConfig => {
  return {
    n8n: {
      url: 'http://localhost:5678',
      publicApiKey: '',
      email: '',
      password: ''
    },
    workflows: {
      dir: '.'
    },
  }
}

const envVarsPrefix = 'N8NM'

export const overrideWithEnv = <T>(obj: T, path: Array<string | number>) => {
  const envVarName = [envVarsPrefix, ...path].map(i => i.toString().toUpperCase()).join('_');
  const value = process.env[envVarName];

  if (value === undefined) {
    return;
  }
  setValue(obj, path, value);
}
