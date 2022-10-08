import { Command } from 'commander';
import { version } from './version';
import fs from 'node:fs'
import path from 'node:path'
import { backup } from './lib/wf/backup';
import { createEmptyConfig, IConfig } from './lib/config';
import { IPublicApiConfig } from './PublicApiClient';

let config: IConfig = createEmptyConfig();

const loadConfig = (cmd: Command) => {
  const file = cmd.optsWithGlobals().config;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    config = JSON.parse(content);
  }
}

const program = new Command();

program
  .name('n8n-api-client')
  .description('CLI to interact with N8N API')
  .option('-c, --config <string>', 'Path to json configuration file', 'n8n-apiclient-config.json')
  .version(version)

const wf = program.command('wf');

wf.command('clear')
  .description('Delete ALL workflows at n8n instance.')
  .hook('preAction', loadConfig)
  .action(function() {
    console.log('Clear');
  })

wf.command('backup')
  .description('Save workflows to directory')
  .hook('preAction', loadConfig)
  .option('--dir', 'Directory with workflows')
  .option('-n, --name <string...>', 'Workflow names to save')
  .action(async function(this: Command) {
    const opts = this.optsWithGlobals();
    const publicApiCfg: IPublicApiConfig = {
      url: config.n8n.url,
      apiKey: ''
    }
    await backup(publicApiCfg, {
      dir: opts.dir || config.workflows.dir,
      name: opts.name,
    })
  })

wf.command('publish')
  .description('Publish workflow(s) to n8n instance')
  .hook('preAction', loadConfig)
  .option('--dir', 'Directory with workflows')
  .option('-n, --name <string...>', 'Workflow names to publish')
  .option('-a, --activate-live', '', true)

program.parse();