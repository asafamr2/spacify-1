/* eslint-disable  */
import { JSONSchema } from "vscode-json-languageservice";

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import "./hacks";

export async function JsSc2NetCMS(anyofFilterField = "type") {
  const baseYamlStr = await fs.promises
    .readFile(path.join(__dirname, "..", "config.base.yml"))
    .then((buff) => buff.toString("utf8"))
    .describeFailure("Could not load base config yaml");
  const configYaml: any = yaml.load(baseYamlStr) as any;
  const baseCollection = configYaml["collections"][0];

  configYaml["collections"] = [];

  const jsonschema: JSONSchema = await fs.promises
    .readFile(path.join(__dirname, "..", "schema", "schema.json"))
    .then((buff) => JSON.parse(buff.toString("utf8")) as JSONSchema)
    .describeFailure("Could not load jsonschema");

  const type_mapping = {
    string: "string",
    object: "object",
  };
  function subschemaToConfigFormatFields(subSchema: JSONSchema) {
    let fields = [];
    for (let [name, definition] of Object.entries(subSchema.properties)) {
      definition = definition as JSONSchema;
      if (name.toLowerCase() === "$schema") continue;
      const newProp = {
        name,
        widget: definition["type"],
      } as Record<string, any>;
      if (definition.type === "object") {
        newProp.fields = subschemaToConfigFormatFields(definition);
      } else if (
        definition.type === "array" &&
        (definition.items as JSONSchema).type === "string"
      ) {
        // console.log((definition.items as any).enum);
        newProp["widget"] = "select";
        newProp["multiple"] = true;
        newProp["options"] = (definition.items as any).enum;
      } else if (definition.type === "number") {
        newProp["value_type"] = "float";
      }
      if (definition.description) {
        newProp.hint = definition.description;
      }
      if (definition.pattern) {
        newProp.pattern = [
          definition.pattern,
          "should match REGEX " + definition.pattern,
        ];
      }
      if (definition.maximum) {
        newProp.max = definition.maximum;
      }
      if (definition.minimum) {
        newProp.min = definition.minimum;
      }
      newProp["label"] = titleCase(newProp["name"]);
      fields.push(newProp);
    }
    return fields;
  }

  for (const sub of jsonschema.anyOf) {
    const defStr = (sub as JSONSchema).$ref.split("/").slice(-1)[0];
    const subSchema = jsonschema.definitions[defStr];
    const newCollection = { ...baseCollection };
    newCollection["name"] = defStr;
    newCollection["label"] = titleCase(defStr);
    newCollection["fields"] = subschemaToConfigFormatFields(subSchema);
    newCollection["fields"].push({
      label: "$schema",
      name: "$schema",
      widget: "hidden",
      default: "../something.json",
    });
    newCollection["fields"].push({
        label: "Category",
        name: "category",
        widget: "string"
      });
    configYaml["collections"].push(newCollection);
  }
  return yaml.dump(configYaml);
}
JsSc2NetCMS()
  .then((x) =>
    fs.promises.writeFile(
      path.join(__dirname, "..", "..", "public", "admin", "config.yml"),
      x
    )
  )
  .catch((err) => console.log("err", err));

function titleCase(str: string) {
  return str
    .replace("_", " ")
    .toLowerCase()
    .split(" ")
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(" ");
}
