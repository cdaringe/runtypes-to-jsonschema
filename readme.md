# runtypes-to-jsonschema

convert [runtypes](https://github.com/pelotom/runtypes) schemas to [jsonschema](https://json-schema.org/understanding-json-schema/reference/).

## install

`npm install runtypes-to-jsonschema`

## usage

```ts
import { tojsonschema } from "runtypes-to-jsonschema";
import * as rt from "runtypes";

const myRtSchema = rt.Record({ foo: rt.Literal("bar") });
const myjsonschema = tojsonschema(myRtSchema);
// { type: "object", properties: { foo: { const: "bar" } } }
```

see [test.ts](./test.ts) for more.
