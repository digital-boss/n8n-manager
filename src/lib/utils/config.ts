import { AxiosProxyConfig } from "axios";
import { setValue, traverse, VisitorFn } from "./traverse";

export interface IConfig {
  n8n: {
    url: string;
    publicApiKey: string;
    owner: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }
    restCliClient: {
      user: string,
      password: string,
    },
  },
  workflows: {
    dir: string;
    exclude: {
      id: string[]
    }
  },
  nodesListFile: string;
  proxy?: AxiosProxyConfig
}

export const createEmptyConfig = (): IConfig => {
  return {
    n8n: {
      url: 'http://localhost:5678',
      publicApiKey: '',
      owner: {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      },
      restCliClient: {
        user: '',
        password: '',
      },
    },
    workflows: {
      dir: '.',
      exclude: {id: []},
    },
    nodesListFile: './packages-nodes.txt'
  }
}

const envVarsPrefix = 'N8NM'

export const overrideWithEnv = <T>(obj: T, path: Array<string | number>) => {
  const envVarName = [envVarsPrefix, ...path].map(i => i.toString()).join('_');
  const value = process.env[envVarName];

  if (value === undefined) {
    return;
  }
  setValue(obj, path, value);
}
