import { Command } from 'commander';
import { version } from './version';
import * as cli from "./cli";

const program = new Command();

program
  .name('n8n-api-client')
  .description('CLI to interact with N8N API')
  .option('--config <string>', 'Path to json configuration file', 'n8n-apiclient-config.json')
  .option('--dry', 'Dry run. Only show config and input parameters.', false)
  .version(version)
  .addCommand(cli.wf())
  .addCommand(cli.creds())
  .addCommand(cli.npm())
  .addCommand(cli.apiKey())
  .addCommand(cli.owner())
  .addCommand(cli.dt())

program.parse();
