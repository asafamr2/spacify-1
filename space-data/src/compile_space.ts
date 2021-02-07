import { argv, exit } from "process";
import { Command } from "commander";
import { logger, assertPathExistsEmpty as assertPathExists, explain } from "./utils";
import { SpaceObjectLoader } from "./SpaceObjectLoader";
import * as fs from "fs";
import path = require("path");

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
    .requiredOption("-o, --output-dir <dirpath>", "Output dir");
  command.parse(argv);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsedOptions: {
    loglevel: string;
    outputDir: string;
    inputDir: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = command.opts() as any;
  await assertPathExists(parsedOptions.outputDir, true);
  const loader = new SpaceObjectLoader(parsedOptions.inputDir);
  const data = await loader.loadAndValidate();

  await fs.promises
    .writeFile(
      path.join(parsedOptions.outputDir, "main_content.json"),
      JSON.stringify(data, (k, v: any): any => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (v.drilldown) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return { ...v, drilldown: {} };
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return v;
      })
    )
    .catch(explain("Could not write SpaceObjects to file"));

  for (const [fuid, val] of Object.entries(data.objects)) {
    const fullPath = path.join(parsedOptions.outputDir, fuid + ".json");
    if (val.drilldown) {
      await assertPathExists(path.dirname(fullPath))
        .then(() =>
          fs.promises.writeFile(fullPath, JSON.stringify(val.drilldown))
        )
        .catch(explain("could not write drilldown for " + fuid));
    }
  }
}
