import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import * as marked from "marked";
import * as sanitize from "sanitize-html";
import "./hacks";

import {
  getLanguageService,
  TextDocument,
  JSONDocument,
  LanguageService,
  JSONSchema,
} from "vscode-json-languageservice";
import { logger, walkDir } from "./utils";
import { SpaceObject } from "../schema/schema";

export class SpaceObjectLoader {
  protected jsonschema:JSONSchema = {};
  protected jsonLanguageService: LanguageService;

  public constructor(protected dirname: string) {}
  public async load(this: this) {
    this.jsonschema = await fs.promises
      .readFile(path.resolve(__dirname, "../schema/schema.json"))
      .then((buffer) => buffer.toString("utf8"))
      .then((str) => JSON.parse(str) as JSONSchema)
      .describeFailure("Could not load json schema");

    logger.debug(`Loading vscode json language service...`);
    this.jsonLanguageService = getLanguageService({});

    const errors: string[] = [];
    const objects: { [filepath: string]: SpaceObject } = {};
    const markdowns: { [filepath: string]: string } = {};

    for await (const filePath of walkDir(this.dirname)) {
      logger.debug(`Loading ${filePath}...`);
      await this.processFile(filePath)
        .then((res) => {
          if (res.markdown) {
            markdowns[filePath] = res.markdown;
          } else {
            objects[filePath] = res as SpaceObject;
          }
        })
        .catch((err) => errors.push(err));
    }

    const finalObjects: { [uid: string]: SpaceObject } = {};
    for (const filePath in objects) {
      finalObjects[this.pathToUid(filePath)] = objects[filePath];
    }
    for (const filePath in markdowns) {
      const uid = this.pathToUid(filePath);
      if (uid in finalObjects) {
        finalObjects[this.pathToUid(filePath)].markdown = markdowns[filePath];
      } else {
        errors.push(
          chalk.red(`Markdown file ${filePath} missing matching JSON`)
        );
      }
    }
    await this.validateRelations(finalObjects).catch((err) => errors.push(err));
    if (errors.length > 0) {
      return Promise.reject(errors.map((e) => "* " + e).join("\n\n"));
    }
    return finalObjects;
  }

  protected async processFile(filePath: string): Promise<Partial<SpaceObject>> {
    const content = await this.getFileContent(filePath) //
      .describeFailure("Could not load file content: " + filePath);

    if (filePath.endsWith("md")) {
      return this.validateMd(content)
        .then(() => {
          return <Partial<SpaceObject>>{ markdown: content };
        })
        .describeFailure("Could not validate markdown: " + filePath);
    } else if (filePath.endsWith("json")) {
      return this.getValidatedSpaceObjectFromJson(content) //
        .describeFailure("Could not validate jsonschema: " + filePath);
    } else {
      return Promise.reject("Unknown file extension for: " + filePath);
    }
  }

  protected async getFileContent(filePath: string) {
    return fs.promises.readFile(filePath).then((buff) => buff.toString("utf8"));
  }
  protected pathToUid(filePath: string) {
    return path
      .relative(this.dirname, filePath)
      .toLowerCase()
      .replace(/.[^.]*$/, "")
      .replace(/[\\]/g, "/");
  }

  protected async getValidatedSpaceObjectFromJson(content: string) {
    let so: SpaceObject;
    let textDoc: TextDocument;
    let jsonDoc: JSONDocument;

    await Promise.resolve()
      .then(() => {
        so = JSON.parse(content) as SpaceObject;
        textDoc = TextDocument.create(
          "foo://bar/file.json",
          "json",
          0,
          content
        );
        jsonDoc = this.jsonLanguageService.parseJSONDocument(textDoc);
      })
      .describeFailure("Could not parse JSON");

    const errors = await this.jsonLanguageService
      .doValidation(textDoc, jsonDoc, undefined, this.jsonschema)
      .then((errs) =>
        errs ? errs.filter((err) => [1, 2].includes(err.severity)) : []
      );

    if (errors.length === 0) {
      return so;
    }

    const errorMessage = errors
      .map((err) => {
        const lines = textDoc.getText().split("\n");
        const msg =
          lines
            .slice(Math.max(0, err.range.end.line - 2), err.range.end.line + 1)
            .join("\n") +
          "\n" +
          chalk.red(
            Array(err.range.start.character + 1).join(" ") +
              Array(
                Math.max(
                  err.range.end.character - err.range.start.character + 1,
                  0
                )
              ).join("^") +
              "   " +
              err.message
          );
        return msg;
      })
      .join("\n");
    return Promise.reject(errorMessage);
  }

  protected async validateMd(content: string): Promise<void> {
    //validate everything works here - would be done in browser too
    return new Promise((resolve, reject) => {
      marked.parse(content, (err, result) => {
        if (err) {
          reject(`Markdown parse error: ${err}`);
        } else {
          if (
            result !==
            sanitize(result, { allowedAttributes: { "*": ["class"] } })
          ) {
            reject("Sanitizing markdown changed content");
          } else {
            resolve();
          }
        }
      });
    });
  }

  protected async validateRelations(objs: { [uid: string]: SpaceObject }) {
    for (const [uid, so] of Object.entries(objs)) {
      for (const ref of [...(so.similar ?? []), ...(so.goes_with ?? [])]) {
        if (!(ref.ref in objs)) {
          return Promise.reject(
            `${uid}(.json) references a missing object: ${ref.ref}`
          );
        }
      }
    }
  }
}
