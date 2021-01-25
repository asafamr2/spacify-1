import { argv, exit } from "process";
import { Command } from "commander";
import { logger, assertBasePathExists } from "./utils";
import { SpaceObject } from "../schema/schema";
import { SpaceObjectLoader } from "./object_loading";


main(argv)
  .then(() => {
    logger.info("Done.");
  })
  .catch((err) => {
    const errorStr = err instanceof Error? err.stack? err.stack:err.message:String(err) ;
    logger.error(errorStr);
    exit(1);
  });

async function main(argv: string[]) {
  const command = new Command();
  command
    .version("0.0.1")
    .description("Validate and compile space object dir to one big json")
    .option(
      "-l, --loglevel <level>",
      "winston log level (debug, error, warn, etc...)",
      "debug"
    )
    .requiredOption(
      "-i, --input-dir <dirpath>",
      "input dir containing JSONs to walk"
    )
    .requiredOption("-o, --output-path <filepath>", "Output JSON path");
  command.parse(argv);

  const parsedOptions = command.opts();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  logger.transports[0].level = parsedOptions.loglevel;
  await assertBasePathExists(parsedOptions.outputPath);
  const loader = new SpaceObjectLoader(parsedOptions.inputDir);
  const objects = await loader.load()
    

  
}
