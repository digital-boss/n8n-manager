import fs from 'node:fs'
import { Command } from "commander";
import { createEmptyConfig, IConfig } from "src/lib/utils/config";

export let config: IConfig = createEmptyConfig();

export const loadConfig = (cmd: Command) => {
  const file = cmd.optsWithGlobals().config;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    config = JSON.parse(content);
  }
}