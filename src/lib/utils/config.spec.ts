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
        email: 'email1',
        password: 'password1'
      },
      workflows: {
        dir: 'dir1'
      }
    }
  
    // set env
    process.env.N8NM_n8n_publicApiKey = 'keyFromEnv',
    process.env.N8NM_workflows_dir = 'dirFromEnv' 
  
    traverse(obj, overrideWithEnv);
    //console.log(obj);

    expect(obj.n8n.url).toEqual('url1');
    expect(obj.n8n.publicApiKey).toEqual('keyFromEnv');
    expect(obj.n8n.email).toEqual('email1');
    expect(obj.n8n.password).toEqual('password1');
    expect(obj.workflows.dir).toEqual('dirFromEnv');
  });
})

