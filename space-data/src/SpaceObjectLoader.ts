import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import * as marked from "marked";
import * as sanitize from "sanitize-html";
import RBush = require("rbush");
import RBush_type from "rbush"; // hmm
import type { BBox } from "rbush";
import { SpaceData, SpatialIndex } from "../schema/data";

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
  protected jsonschema: JSONSchema = {};
  protected jsonLanguageService: LanguageService;

  public constructor(protected dirname: string) {}
  public async loadAndValidate(this: this): Promise<SpaceData> {
    this.jsonschema = await fs.promises
      .readFile(path.resolve(__dirname, "../schema/schema.json"))
      .then((buffer) => buffer.toString("utf8"))
      .then((str) => JSON.parse(str) as JSONSchema)
      .describeFailure("Could not load json schema");

    logger.debug(`Loading vscode json language service...`);
    this.jsonLanguageService = getLanguageService({});

    const errors: string[] = [];
    const spaceObjects: { [uid: string]: SpaceObject } = {};

    for await (const filePath of walkDir(this.dirname)) {
      logger.debug(`Loading ${filePath}...`);
      await this.processFile(filePath)
        .then((res) => {
          spaceObjects[this.pathToUid(filePath)] = res;
        })
        .catch((err) => errors.push(err));
    }

    await this.validateRelations(spaceObjects).catch((err) => errors.push(err));

    const spIdx = this.getSpatialIndex(spaceObjects);

    if (errors.length > 0) {
      return Promise.reject(errors.map((e) => "* " + e).join("\n\n"));
    }
    return { objects: spaceObjects, spatial: spIdx };
  }

  protected async processFile(filePath: string) {
    if (!filePath.endsWith("json")) {
      return Promise.reject().describeFailure(
        "Unknown file extension for: " + filePath
      );
    }
    const content = await this.getFileContent(filePath) //
      .describeFailure("Could not load file content: " + filePath);
    const [jsonpart, mdpart] = await Promise.resolve()
      .then(() => SpaceObjectLoader.splitJsonMd(content))
      .describeFailure("Could not splits file content: " + filePath);
    await this.validateMd(mdpart).describeFailure(
      "Could not validate markdown: " + filePath
    );
    const so = await this.getValidatedSpaceObjectFromJson(
      jsonpart
    ).describeFailure("Could not validate jsonschema: " + filePath);
    so.markdown = mdpart;
    return so;
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

  protected static splitJsonMd(str: string): [string, string] {
    let countBrackets = 0;
    let i;
    for (i = 0; i < str.length; i++) {
      if (str[i] === "{") {
        countBrackets++;
      } else if (str[i] === "}") {
        countBrackets--;
        if (countBrackets === 0) {
          return [str.slice(0, i + 1).trim(), str.slice(i + 1).trim()];
        }
      }
    }
    throw new Error("Could not match curly brackets in json");
  }

  protected async getValidatedSpaceObjectFromJson(
    content: string
  ): Promise<SpaceObject> {
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
      delete so.$schema;
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
    return Promise.reject().describeFailure(errorMessage);
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
            sanitize(result, { allowedAttributes: { "*": ["class", "id"] } })
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
      if (so.type === "birelated") {
        if (!(so.child_uid in objs)) {
          return Promise.reject(
            `${uid}(.json) references a missing object: ${so.child_uid}`
          );
        }
        if (!(so.parent_uid in objs)) {
          return Promise.reject(
            `${uid}(.json) references a missing object: ${so.parent_uid}`
          );
        }
      } else if (so.type === "related") {
        if (!(so.parent_uid in objs)) {
          return Promise.reject(
            `${uid}(.json) references a missing object: ${so.parent_uid}`
          );
        }
      }
    }
  }
  protected getSpatialIndex(
    objs: { [uid: string]: SpaceObject },
    boxSize = 1
  ): SpatialIndex {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const rbush: RBush_type<BBox & { uid: string }> = new (RBush as any)();
    for (const [uid, spaceObject] of Object.entries(objs)) {
      if ("position" in spaceObject) {
        rbush.insert({
          minX: spaceObject.position.x - boxSize / 2,
          minY: spaceObject.position.y - boxSize / 2,
          maxX: spaceObject.position.x + boxSize / 2,
          maxY: spaceObject.position.y + boxSize / 2,
          uid: uid,
        });
      }
    }
    return rbush.toJSON() as SpatialIndex;
  }
}
