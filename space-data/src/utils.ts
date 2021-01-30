import * as fs from "fs";
import * as path from "path";
import * as winston from "winston";

export const logger = getLogger();

export async function* walkDir(
    dir: string,
  ): AsyncGenerator<string, void, void> {
    for await (const d of await fs.promises.opendir(dir)) {
      const entry = path.join(dir, d.name);
      if (d.isDirectory()) yield* walkDir(entry);
      if (d.isFile()) {
         yield entry;
      } 
    }
  }


  export async function assertBasePathExists(filepath: string) {
    const dirname = path.dirname(filepath);
    const exists = await fs.promises
      .access(dirname)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      logger.info(`Creating output dir ${dirname}`);
      await fs.promises.mkdir(dirname, { recursive: true });
    }
  }
  


function getLogger(){
    return winston.createLogger({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ],
      });
}