import test from "ava";
import { tojsonschema } from "./";
import * as rt from "runtypes";
import { validate } from "jsonschema";

const tjs = tojsonschema;

test("basic", (t) => {
  // readme example - start
  // const myRtSchema = rt.Record({ foo: rt.Literal("bar") });
  // const myjsonschema = tojsonschema(myRtSchema);
  // console.log(JSON.stringify(myjsonschema));
  // const out = { type: "object", properties: { foo: { const: "bar" } } };
  // readme example - end
  t.deepEqual(tjs(rt.Literal("foo")), { const: "foo" });
  t.deepEqual(tjs(rt.Union(rt.Literal("foo"), rt.Literal("bar"))), {
    anyOf: [{ const: "foo" }, { const: "bar" }],
  });
});

test("complex", (t) => {
  const rtSchema = rt.Union(
    rt.Record({
      testBool: rt.Boolean,
      testNull: rt.Null,
      foo: rt.Dictionary(rt.Number.withConstraint((_) => true)),
      arrayField: rt.Array(
        rt.Partial({
          partialField1: rt.String,
        })
      ),
    }),
    rt.Record({
      testBigInt: rt.BigInt,
      testBrand: rt.Brand("brandy", rt.Literal("test-branded-literal")),
    })
  );
  const actualJsonSchema = tjs(rtSchema);
  const expected = {
    anyOf: [
      {
        type: "object",
        properties: {
          testBool: { type: "boolean" },
          testNull: { const: null },
          foo: { type: "object", properties: { builtin: { type: "number" } } },
          arrayField: {
            type: "array",
            items: {
              type: "object",
              properties: { partialField1: { type: "string" } },
            },
          },
        },
      },
      {
        type: "object",
        properties: {
          testBigInt: { type: "integer" },
          testBrand: { const: "test-branded-literal" },
        },
      },
    ],
  };
  t.deepEqual(actualJsonSchema, expected);
  const demoData: rt.Static<typeof rtSchema> = {
    testBool: true,
    testNull: null,
    foo: {
      bar: 1,
    },
    arrayField: [
      {
        partialField1: "ok",
      },
      {},
    ],
  };
  try {
    const checkedDemoData = rtSchema.check(demoData);
    const result = validate(checkedDemoData, actualJsonSchema);
    t.is(result.valid, true);
  } catch (err) {
    t.fail(String((err as any)?.details || err));
  }
});
