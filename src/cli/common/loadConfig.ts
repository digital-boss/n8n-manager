import { Command } from "commander";
import { IConfig, createEmptyConfig } from "src/lib/utils/config";
import fs from 'node:fs';
import { log } from "./log";

export let config: IConfig = createEmptyConfig();

export const loadConfig = (cmd: Command) => {
  const file = cmd.optsWithGlobals().config;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    config = JSON.parse(content);
    log('Config:', config, '\n');
  }
}