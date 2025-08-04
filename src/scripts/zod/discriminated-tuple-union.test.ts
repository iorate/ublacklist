import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { discriminatedTupleUnion } from "./discriminated-tuple-union.ts";

test("discriminatedTupleUnion", async (t) => {
  await t.test("Basic discriminated tuple union", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    // Valid cases
    const resultA = schema.safeParse(["a", "hello"]);
    assert.ok(resultA.success);
    assert.deepEqual(resultA.data, ["a", "hello"]);

    const resultB = schema.safeParse(["b", 42]);
    assert.ok(resultB.success);
    assert.deepEqual(resultB.data, ["b", 42]);
  });

  await t.test("Invalid discriminator value", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    const parseResult = schema.safeParse(["x", "abc"]);
    assert.ok(!parseResult.success);

    // Check error structure
    assert.equal(parseResult.error.issues.length, 1);
    const issue = parseResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "custom");
    assert.deepEqual(issue.params?.discriminators, ["a", "b"]);
    assert.deepEqual(issue.path, [0]);
    assert.equal(issue.message, 'Expected one of "a" or "b"');
  });

  await t.test("Non-array input", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    const parseResult = schema.safeParse("not an array");
    assert.ok(!parseResult.success);

    const issue = parseResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "invalid_type");
    assert.equal(issue.expected, "array");
  });

  await t.test("Valid discriminator but invalid tuple content", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    // Correct discriminator "a" but invalid string
    const parseResult = schema.safeParse(["a", 123]);
    assert.ok(!parseResult.success);

    const issue = parseResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "invalid_type");
    assert.equal(issue.expected, "string");
    assert.deepEqual(issue.path, [1]);
  });

  await t.test("Multiple literal values in discriminator", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal(["red", "green", "blue"]), z.string()]),
      z.tuple([z.literal("action"), z.object({ type: z.string() })]),
    ]);

    // Valid cases with multiple literal values
    const redResult = schema.safeParse(["red", "color"]);
    assert.ok(redResult.success);
    assert.deepEqual(redResult.data, ["red", "color"]);

    const greenResult = schema.safeParse(["green", "color"]);
    assert.ok(greenResult.success);
    assert.deepEqual(greenResult.data, ["green", "color"]);

    const blueResult = schema.safeParse(["blue", "color"]);
    assert.ok(blueResult.success);
    assert.deepEqual(blueResult.data, ["blue", "color"]);

    const actionResult = schema.safeParse(["action", { type: "click" }]);
    assert.ok(actionResult.success);
    assert.deepEqual(actionResult.data, ["action", { type: "click" }]);

    // Invalid discriminator
    const invalidResult = schema.safeParse(["yellow", "color"]);
    assert.ok(!invalidResult.success);

    const issue = invalidResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "custom");
    assert.deepEqual(issue.params?.discriminators, [
      "red",
      "green",
      "blue",
      "action",
    ]);
    assert.equal(
      issue.message,
      'Expected one of "red", "green", "blue" or "action"',
    );
  });

  await t.test("Complex tuples with multiple elements", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("create"), z.string(), z.number(), z.boolean()]),
      z.tuple([z.literal("update"), z.string(), z.object({ data: z.any() })]),
      z.tuple([z.literal("delete"), z.string()]),
    ]);

    // Valid create command
    const createResult = schema.safeParse(["create", "user", 123, true]);
    assert.ok(createResult.success);
    assert.deepEqual(createResult.data, ["create", "user", 123, true]);

    // Valid update command
    const updateResult = schema.safeParse([
      "update",
      "user",
      { data: { name: "John" } },
    ]);
    assert.ok(updateResult.success);
    assert.deepEqual(updateResult.data, [
      "update",
      "user",
      { data: { name: "John" } },
    ]);

    // Valid delete command
    const deleteResult = schema.safeParse(["delete", "user"]);
    assert.ok(deleteResult.success);
    assert.deepEqual(deleteResult.data, ["delete", "user"]);

    // Invalid - wrong number of elements for create
    const invalidCreateResult = schema.safeParse(["create", "user"]);
    assert.ok(!invalidCreateResult.success);

    const issue = invalidCreateResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "too_small");
    assert.equal(issue.minimum, 4);
  });

  await t.test("Empty array", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    const parseResult = schema.safeParse([]);
    assert.ok(!parseResult.success);

    const issue = parseResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "custom");
    assert.deepEqual(issue.params?.discriminators, ["a", "b"]);
    assert.deepEqual(issue.path, [0]);
  });

  await t.test("Union behavior - type inference", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("text"), z.string()]),
      z.tuple([z.literal("number"), z.number()]),
    ]);

    // Type should be inferred as a union of tuples
    type SchemaType = z.infer<typeof schema>;
    const validText: SchemaType = ["text", "hello"];
    const validNumber: SchemaType = ["number", 42];

    // These should pass without type errors
    assert.deepEqual(schema.parse(validText), ["text", "hello"]);
    assert.deepEqual(schema.parse(validNumber), ["number", 42]);
  });

  await t.test("Union behavior - schema methods", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("a"), z.string()]),
      z.tuple([z.literal("b"), z.number()]),
    ]);

    // Should support union methods like .optional()
    const optionalSchema = schema.optional();
    assert.equal(optionalSchema.parse(undefined), undefined);
    assert.deepEqual(optionalSchema.parse(["a", "test"]), ["a", "test"]);

    // Should support .nullable()
    const nullableSchema = schema.nullable();
    assert.equal(nullableSchema.parse(null), null);
    assert.deepEqual(nullableSchema.parse(["b", 123]), ["b", 123]);

    // Should support .default()
    const defaultSchema = schema.default(["a", "default"]);
    assert.deepEqual(defaultSchema.parse(undefined), ["a", "default"]);
  });

  await t.test("Custom error messages", () => {
    const schema = discriminatedTupleUnion(
      [
        z.tuple([z.literal("cmd1"), z.string()]),
        z.tuple([z.literal("cmd2"), z.number()]),
      ],
      "Custom command error",
    );

    const parseResult = schema.safeParse(["invalid", "test"]);
    assert.ok(!parseResult.success);

    // Should use custom error message
    const issue = parseResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.message, "Custom command error");
  });

  await t.test("Nested discriminated tuple unions", () => {
    const innerSchema = discriminatedTupleUnion([
      z.tuple([z.literal("inner1"), z.string()]),
      z.tuple([z.literal("inner2"), z.number()]),
    ]);

    const outerSchema = discriminatedTupleUnion([
      z.tuple([z.literal("outer"), innerSchema]),
      z.tuple([z.literal("simple"), z.string()]),
    ]);

    // Valid nested case
    const validResult = outerSchema.safeParse(["outer", ["inner1", "test"]]);
    assert.ok(validResult.success);
    assert.deepEqual(validResult.data, ["outer", ["inner1", "test"]]);

    // Invalid inner discriminator
    const invalidInnerResult = outerSchema.safeParse([
      "outer",
      ["invalid", "test"],
    ]);
    assert.ok(!invalidInnerResult.success);

    // Simple case
    const simpleResult = outerSchema.safeParse(["simple", "test"]);
    assert.ok(simpleResult.success);
    assert.deepEqual(simpleResult.data, ["simple", "test"]);
  });

  await t.test("Single option discriminated tuple union", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal("only"), z.string()]),
    ]);

    const validResult = schema.safeParse(["only", "test"]);
    assert.ok(validResult.success);
    assert.deepEqual(validResult.data, ["only", "test"]);

    const invalidResult = schema.safeParse(["other", "test"]);
    assert.ok(!invalidResult.success);

    const issue = invalidResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "custom");
    assert.deepEqual(issue.params?.discriminators, ["only"]);
    assert.equal(issue.message, 'Expected "only"');
  });

  await t.test("Numeric and boolean discriminators", () => {
    const schema = discriminatedTupleUnion([
      z.tuple([z.literal(1), z.string()]),
      z.tuple([z.literal(2), z.number()]),
      z.tuple([z.literal(true), z.boolean()]),
      z.tuple([z.literal(false), z.object({})]),
    ]);

    // Valid cases
    assert.ok(schema.safeParse([1, "test"]).success);
    assert.ok(schema.safeParse([2, 42]).success);
    assert.ok(schema.safeParse([true, false]).success);
    assert.ok(schema.safeParse([false, {}]).success);

    // Invalid discriminator
    const invalidResult = schema.safeParse([3, "test"]);
    assert.ok(!invalidResult.success);

    const issue = invalidResult.error.issues[0];
    assert.ok(issue);
    assert.equal(issue.code, "custom");
    assert.deepEqual(issue.params?.discriminators, [1, 2, true, false]);
    assert.equal(issue.message, "Expected one of 1, 2, true or false");
  });

  await t.test("Error handling - duplicate discriminator values", () => {
    // This should throw an error during schema creation, not during parsing
    assert.throws(() => {
      discriminatedTupleUnion([
        z.tuple([z.literal("duplicate"), z.string()]),
        z.tuple([z.literal("duplicate"), z.number()]),
      ]);
    }, /Duplicate discriminator value/);
  });

  await t.test("Error handling - invalid discriminator option", () => {
    // This should throw an error if a tuple option doesn't have a proper discriminator
    assert.throws(() => {
      discriminatedTupleUnion([
        z.tuple([z.string(), z.string()]), // z.string() doesn't have discrete values
      ]);
    }, /Invalid discriminated tuple union option/);
  });
});
