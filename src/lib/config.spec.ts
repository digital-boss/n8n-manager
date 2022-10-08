import { overrideWithEnv } from "./config";
import { traverse } from "./traverse";

describe('Environmental Variables', () => {
  // https://stackoverflow.com/questions/48033841/test-process-env-with-jest

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('Override Config From Env', () => {

    const obj = {
      n8n: {
        url: 'url1',
        publicApiKey: 'key1',
        login: 'login1',
        password: 'password1'
      },
      workflows: {
        dir: 'dir1'
      }
    }
  
    // set env
    process.env.N8NCLIENT_N8N_PASSWORD = 'passwordFromEnv',
    process.env.N8NCLIENT_WORKFLOWS_DIR = 'dirFromEnv' 
  
    traverse(obj, overrideWithEnv);
    //console.log(obj);

    expect(obj.n8n.url).toEqual('url1');
    expect(obj.n8n.publicApiKey).toEqual('key1');
    expect(obj.n8n.login).toEqual('login1');
    expect(obj.n8n.password).toEqual('passwordFromEnv');
    expect(obj.workflows.dir).toEqual('dirFromEnv');
  });
})

