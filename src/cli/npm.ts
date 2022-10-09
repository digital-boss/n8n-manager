import { Command } from 'commander';
import { loadConfig } from "./common";

export const npm = () => {
  const cmd = new Command('npm');

  cmd.command('install')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('uninstall')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('update')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('list')
    .description('')
    .hook('preAction', loadConfig)

  cmd.command('setup-all')
    .description('')
    .hook('preAction', loadConfig)


  return cmd;
}