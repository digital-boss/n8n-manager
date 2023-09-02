import axios, { AxiosError } from "axios";
import { Command, OptionValues } from "commander";
import fs from 'node:fs';
import util from 'node:util'

const getErrLogFileName = (moment: Date) => {
  const year = moment.getFullYear();
  const month = String(moment.getMonth() + 1).padStart(2, '0');
  const day = String(moment.getDate()).padStart(2, '0');
  const hours = String(moment.getHours()).padStart(2, '0');
  const minutes = String(moment.getMinutes()).padStart(2, '0');
  const seconds = String(moment.getSeconds()).padStart(2, '0');
  const milliseconds = String(moment.getMilliseconds()).padStart(3, '0');

  return `8man-ErrorLog_${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${milliseconds}.log`;
}

/**
 * If you want to get the same detailed result as console.log(err) but as a string, 
 * you can use the util.inspect method from the Node.js util module. 
 * This method is designed for inspecting objects in a way similar to how console.log does.
 */
const stringifyError = (err: Error) => {
  return util.inspect(err, { showHidden: false, depth: null })
}

export const errorHandler = (opts: OptionValues, cmd: Command) => (err: Error | AxiosError) => {
  if (!err) {
    return
  }
  const moment = new Date();
  const fileName = getErrLogFileName(moment);
  if (axios.isAxiosError(err)) {
    const display = [
      'Axios Error: ',
      JSON.stringify({
        message: err.message,
        stack: err.stack,
        code: err.code,
        status: err.status,
      }, null, 2),
      `See details in ./${fileName}`,
    ].join('\n')
    console.log(display);
  } else {
    console.log(stringifyError(err)); 
  }

  const fileContent = [
    `Error ${moment.toISOString()}: `,
    stringifyError(err),
    "\n\nOperation: " + cmd.name(),
    "Opts: ",
    JSON.stringify(opts, null, 2),
  ].join('\n');

  fs.writeFileSync(fileName, fileContent, 'utf-8');
}