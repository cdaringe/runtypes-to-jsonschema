# runtypes-to-jsonschema

convert [runtypes](https://github.com/pelotom/runtypes) schemas to [jsonschema](https://json-schema.org/understanding-json-schema/reference/).

[![main](https://github.com/cdaringe/runtypes-to-jsonschema/actions/workflows/main.yml/badge.svg)](https://github.com/cdaringe/runtypes-to-jsonschema/actions/workflows/main.yml)

## install

`npm install runtypes-to-jsonschema`

## usage

```ts
import { tojsonschema } from "runtypes-to-jsonschema";
import * as rt from "runtypes";

const myRtSchema = rt.Record({ foo: rt.Literal("bar") });
const myjsonschema = tojsonschema(myRtSchema);
// {
//   type: "object",
//   properties: { foo: { const: "bar" } },
//   required: ["foo"],
// }
```

see [test.ts](./test.ts) for more.
