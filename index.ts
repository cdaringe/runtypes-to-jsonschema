import type { Schema } from "jsonschema";
import * as rt from "runtypes";

const nev = (x: never) => {
  throw new Error(`unhandled case: ${x}`);
};

const v = rt.String.withConstraint((x) => "");

export const tojsonschema = <T extends rt.Runtype<any>>(
  rtschema: T,
  subjsonschema: Schema = {},
  options?: { loose?: boolean }
): Schema => {
  const { loose: isLooseMode } = options || {};
  const js = subjsonschema;
  const reflect = rtschema.reflect;
  switch (reflect.tag) {
    case "array":
      // https://json-schema.org/understanding-json-schema/reference/array.html#id6
      js.type = "array";
      js.items = tojsonschema(reflect.element, {}, options);
      return js;
    case "void":
    case "never":
    case "unknown":
    case "function":
    case "instanceof":
    case "symbol":
    case "template":
      if (isLooseMode) {
        return js;
      }
      throw new Error(
        `unsupported ${reflect.tag}. consider using { loose: true }`
      );
    case "bigint":
      js.type = "integer";
      return js;
    case "number":
      js.type = "number";
      return js;
    case "boolean":
      js.type = "boolean";
      return js;
    case "brand":
      return tojsonschema(reflect.entity, js, options);
    case "constraint":
      // https://github.com/pelotom/runtypes/issues/319
      return tojsonschema(
        (rtschema as unknown as { underlying: rt.Runtype<any> }).underlying,
        js,
        options
      );
    case "dictionary":
      // https://json-schema.org/understanding-json-schema/reference/object.html#id5
      js.type = "object";
      js.properties = { builtin: tojsonschema(reflect.value, {}, options) };
      return js;
    case "intersect":
      // @todo - this could be tricky. go easy mode for 1st pass
      // https://github.com/pelotom/runtypes#template-literals
      js.type = "string";
      return js;
    case "literal":
      js.const = reflect.value;
      return js;
    case "number":
      js.type = "number";
      return js;
    case "optional":
      // everything is optional in jsonschema, until _required_ fields are set
      return js;
    case "record":
      js.type = "object";
      js.properties = Object.entries(reflect.fields).reduce<
        NonNullable<Schema["properties"]>
      >((props, [k, v]) => {
        props[k] = tojsonschema(v, {}, options);
        return props;
      }, {});
      return js;
    case "string":
      js.type = "string";
      return js;
    case "tuple":
      // https://json-schema.org/understanding-json-schema/reference/combining.html#id5
      // @todo allOf drops order. is there a better way?
      js.allOf = reflect.components.map((v) => tojsonschema(v, {}, options));
      return js;
    case "union":
      js.anyOf = reflect.alternatives.map((v) => tojsonschema(v, {}, options));
      return js;
    default:
      nev(reflect);
      return js;
  }
};
