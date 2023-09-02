import { Command } from "commander";
import util from 'node:util'

export const log = (...args: any[]) => {
  const mapped = args.map(a => {
    if (typeof a === 'string') {
      return a;
    }
    return util.inspect(a, {showHidden: false, depth: null, colors: true});
  })
  console.log(...mapped);
}

export const logOp = (cmd: Command, args: any) => {
  log('Operation: ', cmd.name(), args, '\n');
}
