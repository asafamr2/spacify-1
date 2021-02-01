/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { JSONSchema7 as JSONSchema } from "json-schema";

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import "./hacks";

const JSONSCHEMA_PROP_TO_YAML = {
  maximum: "max",
  minimum: "min",
  description: "hint",
};

const FIELDS_IMPORTANCE = [
  "title",
  "uid",
  "category",
  "tags",
  "arc",
  "rotation",
  "position",
  "wiki",
];
export async function JsSc2NetCMS() {
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

  function subschemaToConfigFormatFields(subSchema: JSONSchema) {
    const fields = [];
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
        (definition.items as JSONSchema)?.type === "string"
      ) {
        // console.log((definition.items as any).enum);
        newProp["widget"] = "select";
        newProp["multiple"] = true;
        newProp["options"] = (definition.items as any).enum;
      } else if (definition.type === "number") {
        newProp["value_type"] = "float";
      }
      newProp["required"] = !!subSchema?.required?.includes(name);

      if (newProp.fields) {
        newProp["fields"].sort(
          (x: { name: string }) => FIELDS_IMPORTANCE.indexOf(x.name) + 1 ?? 9999
        );
      }

      if (definition.pattern) {
        newProp.pattern = [
          definition.pattern,
          "should match REGEX " + definition.pattern,
        ];
      }

      for (const [jprop, yprop] of Object.entries(JSONSCHEMA_PROP_TO_YAML)) {
        if (jprop in definition) {
          newProp[yprop] = (definition as any)[jprop];
        }
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
    newCollection["name"] = defStr.toLowerCase();
    newCollection["label"] = titleCase(defStr);
    newCollection["fields"] = subschemaToConfigFormatFields(
      subSchema as JSONSchema
    );
    newCollection["fields"] = newCollection["fields"].filter(
      (x: any) => x?.name != "type"
    );

    newCollection["fields"].push({
      label: "$schema",
      name: "$schema",
      widget: "hidden",
      default: "../../schema/schema.json",
    });

    newCollection["filter"] = { field: "type", value: newCollection.name };

    configYaml["collections"].push(newCollection);
    newCollection["fields"].push({
      label: "Type",
      name: "type",
      widget: "hidden",
      default: (subSchema as any).properties.type.enum[0],
    });
  }
  return yaml.dump(configYaml, {
    sortKeys: (a: string, b: string) => {
      a = a == "name" ? "" : a;
      b = b == "name" ? "" : b;
      return a.localeCompare(b);
    },
  });
}
void JsSc2NetCMS().then((x) =>
  fs.promises.writeFile(
    path.join(__dirname, "..", "..", "public", "admin", "config.yml"),
    x
  )
);

function titleCase(str: string) {
  return str
    .replace("_", " ")
    .toLowerCase()
    .split(" ")
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(" ");
}
