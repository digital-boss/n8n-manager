import { Command } from 'commander';
import { version } from './version';
import * as cli from "./cli";

const program = new Command();

program
  .name('n8n-api-client')
  .description('CLI to interact with N8N API')
  .option('-c, --config <string>', 'Path to json configuration file', 'n8n-apiclient-config.json')
  .version(version)
  .addCommand(cli.wf())
  .addCommand(cli.registry())
  .addCommand(cli.npm())

program.parse();