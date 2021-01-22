import * as fs from "fs";
import * as path from "path";
import { argv } from "process";
import * as winston from "winston";
import { Command, option } from "commander";
import {
  getLanguageService,
  TextDocument,
  JSONSchema,
  JSONDocument,
} from "vscode-json-languageservice";
let logger: winston.Logger;

main(argv)
  .then(() => {
    console.log("Done.");
  })
  .catch((err) => {
    console.error("An error occurred in main: ", err);
  });

async function main(argv: string[]) {
  logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });

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
  logger.transports[0].level = parsedOptions.loglevel;
  await AssertBasePathExists(parsedOptions.outputPath);
  const allStuff = await WalkAndLoad(parsedOptions.inputDir);
  // if (!validateObjects(allStuff)) {
  //   return;
  // }
}
import alsql from "alasql";
import { SpaceObject } from "./schema";
function validateObjects(objs: any[]): boolean {
  //   const df = alsql("")
  return true;
}
async function AssertBasePathExists(filepath: string) {
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

async function* walk(
  dir: string,
  ext = "json"
): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile() && d.name.endsWith(ext)) yield entry;
  }
}

function pathToId(filepath: string): string {
  return filepath
    .toLowerCase()
    .replace(/.[^.]*$/, "")
    .replace(/[\/\\]/g, ".")
    .replace(/$.*raw\./, "");
}

async function WalkAndLoad(dirpath: string) {
  const jsonschema = await fs.promises
    .readFile(path.resolve(__dirname, "./schema.json"))
    .then((buffer) => buffer.toString("utf8"))
    .then((str) => JSON.parse(str));

  const ls = getLanguageService({});

  // let validation = await ls.doValidation(testDoc.textDoc, testDoc.jsonDoc,schema);

  let allStuff: { [id: string]: SpaceObject } = {};
  for await (const jsonFilePath of walk(dirpath)) {
    logger.info(`Loading ${jsonFilePath}...`);
    let so: SpaceObject;
    let textDoc: TextDocument;
    let jsonDoc: JSONDocument;
    try {
      const content = await fs.promises
        .readFile(jsonFilePath)
        .then((buff) => buff.toString("utf8"));
      textDoc = TextDocument.create(
        "foo://bar/file.json",
        "json",
        0,
        content
      );
      jsonDoc = ls.parseJSONDocument(textDoc);
    } catch (err) {
      logger.error("Could not parse JSON: " + jsonFilePath);
      continue;
    }
    const errors = await ls.doValidation(
      textDoc,
      jsonDoc,
      undefined,
      jsonschema
    ).then(errs=> errs? errs.filter(err=>[1,2].includes(err.severity)):[]);
    if (errors.length > 0) {
        errors.forEach(err=>{
          let msg =  ''
          logger.error(
            `JSON schema validation failed in ${jsonFilePath}: ${msg}`)
        })
        
    };
      // filteredErrors = filteredErrors.filter(
      //   ((x: ErrorObject) => x.keyword.toLowerCase() !== "anyof") as any
      // );
      // let nonAdd = filteredErrors.filter(
      //   (x: ErrorObject) => ["additionalProperties","required"].includes(x.keyword)
      // );
      // if(nonAdd.length > 0){
      //   filteredErrors = nonAdd;
      // }

       // removes emojis
      continue;
    }
    allStuff[pathToId(jsonFilePath)] = so;
  }
  return allStuff;
}
