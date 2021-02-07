/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import chalk = require("chalk");
import * as fs from "fs";
import * as path from "path";
import { Logger } from "tslog";

export const logger: Logger = new Logger();

export async function* walkDir(
  dir: string
): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walkDir(entry);
    if (d.isFile()) {
      yield entry;
    }
  }
}

export async function assertPathExistsEmpty(dirname: string, empty=false): Promise<void> {
  // const dirname = path.dirname(filepath);
  const exists = await fs.promises
    .access(dirname)
    .then(() => true)
    .catch(() => false);
  if (exists && empty) {
    await fs.promises.rmdir(dirname, { recursive: true });
    logger.info(`rm output dir ${dirname}`);
  }
  await fs.promises.mkdir(dirname, { recursive: true });
  logger.info(`mkdir output dir ${dirname}`);
  return;
}

function getErrorObject() {
  try {
    throw new Error("");
  } catch (err) {
    return err;
  }
}

export function explain(failMessage: string, addOriginalError = true) {
  let lexicalStack = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    lexicalStack = getErrorObject().stack.split("\n").slice(3, 5).join("\n");
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return (err: unknown) => {
    let originalErr;
    if (addOriginalError) {
      if (!err) {
        originalErr = "";
      } else if (err instanceof Error) {
        originalErr = err?.stack ? err.stack : err.message;
      } else {
        originalErr = String(err);
      }
    }
    const messages = [chalk.yellow(failMessage)];
    if (originalErr) messages.push(originalErr);
    if (lexicalStack) messages.push(lexicalStack);

    return Promise.reject(messages.join("\n"));
  };
}

// function getLogger(){
//     // return winston.createLogger({
//     //     transports: [
//     //       new winston.transports.Console({
//     //         format: winston.format.combine(
//     //           winston.format.simple(),

//     //           winston.format.errors({ stack: true }),
//     //         ),
//     //       }),
//     //     ],
//     //   });
//     return
// }
