import { argv, exit } from "process";
import { Command } from "commander";
import { logger, assertBasePathExists,explain } from "./utils";
import { SpaceObjectLoader } from "./SpaceObjectLoader";
import * as fs from "fs";

main(argv)
  .then(() => {
    logger.info("Done.");
  })
  .catch((err) => {
    if (Array.isArray(err)) {
      err.forEach((element) => {
        logger.error("Error in data compilation\n", element);
      });
    } else {
      logger.error("Error in data compilation\n", err);
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsedOptions: {
    loglevel: string;
    outputPath: string;
    inputDir: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = command.opts() as any;
  await assertBasePathExists(parsedOptions.outputPath);
  const loader = new SpaceObjectLoader(parsedOptions.inputDir);
  const data = await loader.loadAndValidate();

  await fs.promises
    .writeFile(parsedOptions.outputPath, JSON.stringify(data))
    .catch(explain("Could not write SpaceObjects to file"));
}
