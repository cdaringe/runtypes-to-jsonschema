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
  const fooSchema = rt.Literal("foo");
  fooSchema.meta = { description: "foo_description", defaultValue: "__FOO__" };
  t.deepEqual(tjs(fooSchema), {
    description: "foo_description",
    const: "foo",
    default: "__FOO__",
  });
  t.deepEqual(tjs(rt.Union(rt.Literal("foo"), rt.Literal("bar"))), {
    anyOf: [{ const: "foo" }, { const: "bar" }],
  });
});

test("complex", (t) => {
  const rtSchema = rt.Union(
    rt.Record({
      arrayField: rt.Array(
        rt.Partial({
          partialField1: rt.String,
        })
      ),
      foo: rt.Dictionary(rt.Number.withConstraint(() => true)),
      testBool: rt.Boolean,
      testNull: rt.Null,
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
          arrayField: {
            type: "array",
            items: {
              type: "object",
              properties: { partialField1: { type: "string" } },
            },
          },
          foo: { type: "object", properties: { builtin: { type: "number" } } },
          testBool: { type: "boolean" },
          testNull: { const: null },
        },
        required: ["arrayField", "foo", "testBool", "testNull"],
      },
      {
        type: "object",
        properties: {
          testBigInt: { type: "integer" },
          testBrand: { const: "test-branded-literal" },
        },
        required: ["testBigInt", "testBrand"],
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
    t.fail(String((err as { details?: unknown })?.details || err));
  }
});

test("optional", (t) => {
  const rtSchema = rt.Record({
    bar: rt.Number,
    baz: rt.String.withConstraint(() => true).optional(),
    foo: rt.Boolean.optional().withGuard((_v): _v is boolean => true),
  });
  const actualJsonSchema = tjs(rtSchema);
  const expected = {
    properties: {
      bar: {
        type: "number",
      },
      baz: {
        type: "string",
      },
      foo: {
        type: "boolean",
      },
    },
    required: ["bar"],
    type: "object",
  };
  t.deepEqual(actualJsonSchema, expected);
});

test("readme demo", (t) => {
  const myRtSchema = rt.Record({ foo: rt.Literal("bar") });
  const myjsonschema = tojsonschema(myRtSchema);
  t.deepEqual(
    {
      type: "object",
      properties: { foo: { const: "bar" } },
      required: ["foo"],
    },
    myjsonschema
  );
});
