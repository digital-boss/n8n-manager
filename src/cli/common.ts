import fs from 'node:fs'
import { Command } from "commander";
import { createEmptyConfig, IConfig } from "src/lib/utils/config";
import util from 'node:util'

const log = (...args: any[]) => {
  const mapped = args.map(a => {
    if (typeof a === 'string') {
      return a;
    }
    return util.inspect(a, {showHidden: false, depth: null, colors: true});
  })
  console.log(...mapped);
}

export let config: IConfig = createEmptyConfig();

export const loadConfig = (cmd: Command) => {
  const file = cmd.optsWithGlobals().config;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    config = JSON.parse(content);
    log('Config:', config, '\n');
  }
}

export const logOp = (cmd: Command, args: any) => {
  log('Operation: ', cmd.name(), args, '\n');
}