import { Command } from 'commander';
import { loadConfig } from "./common";

export const registry = () => {
  const cmd = new Command('registry');

  cmd.command('setup')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('reset')
    .description('')
    .hook('preAction', loadConfig)

  return cmd;
}