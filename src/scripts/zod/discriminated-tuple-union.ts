import { z } from "zod";
import * as core from "zod/v4/core";
import { util } from "zod/v4/core";

function stringifyPrimitive(value: util.Primitive): string {
  if (typeof value === "bigint") {
    return `${value}n`;
  }
  if (typeof value === "symbol") {
    return `Symbol(${
      value.description != null ? JSON.stringify(value.description) : ""
    })`;
  }
  if (typeof value === "undefined") {
    return "undefined";
  }
  return JSON.stringify(value);
}

export type $ZodDiscriminatedTupleUnionOption = core.$ZodTuple<
  readonly [core.$ZodType, ...core.$ZodType[]]
>;

export interface $ZodDiscriminatedTupleUnionDef<
  T extends
    readonly $ZodDiscriminatedTupleUnionOption[] = readonly $ZodDiscriminatedTupleUnionOption[],
> extends core.$ZodTypeDef {
  type: "custom";
  options: T;
}

export interface $ZodDiscriminatedTupleUnionInternals<
  T extends
    readonly $ZodDiscriminatedTupleUnionOption[] = readonly $ZodDiscriminatedTupleUnionOption[],
> extends core.$ZodTypeInternals {
  def: $ZodDiscriminatedTupleUnionDef<T>;
  isst: core.$ZodIssueInvalidType | core.$ZodIssueCustom;
  output: core.$InferUnionOutput<T[number]>;
  input: core.$InferUnionInput<T[number]>;
}

export interface $ZodDiscriminatedTupleUnion<
  T extends
    readonly $ZodDiscriminatedTupleUnionOption[] = readonly $ZodDiscriminatedTupleUnionOption[],
> extends core.$ZodType {
  _zod: $ZodDiscriminatedTupleUnionInternals<T>;
}

export const $ZodDiscriminatedTupleUnion: core.$constructor<$ZodDiscriminatedTupleUnion> =
  core.$constructor("$ZodDiscriminatedTupleUnion", (inst, def) => {
    // @ts-expect-error TS2775 (why?)
    core.$ZodType.init(inst, def);
    const discriminatorMap: Map<
      util.Primitive,
      $ZodDiscriminatedTupleUnionOption
    > = new Map();
    for (const [index, option] of def.options.entries()) {
      const values = option._zod.def.items[0]._zod.values;
      if (!values || !values.size) {
        throw new Error(
          `Invalid discriminated tuple union option at index ${index}`,
        );
      }
      for (const value of values) {
        if (discriminatorMap.has(value)) {
          throw new Error(
            `Duplicate discriminator value ${stringifyPrimitive(value)}`,
          );
        }
        discriminatorMap.set(value, option);
      }
    }
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!Array.isArray(input)) {
        payload.issues.push({
          code: "invalid_type",
          expected: "array",
          input,
          inst,
        });
        return payload;
      }
      const option = input.length ? discriminatorMap.get(input[0]) : null;
      if (!option) {
        payload.issues.push({
          code: "custom",
          params: { discriminators: [...discriminatorMap.keys()] },
          input,
          inst,
          path: [0],
        });
        return payload;
      }
      return option._zod.run(payload, ctx);
    };
  });

export type $ZodDiscriminatedTupleUnionParams = core.TypeParams<
  $ZodDiscriminatedTupleUnion,
  "options"
>;

export interface ZodDiscriminatedTupleUnion<
  T extends
    readonly $ZodDiscriminatedTupleUnionOption[] = readonly $ZodDiscriminatedTupleUnionOption[],
> extends z._ZodType<$ZodDiscriminatedTupleUnionInternals<T>>,
    $ZodDiscriminatedTupleUnion<T> {}

export const ZodDiscriminatedTupleUnion: core.$constructor<ZodDiscriminatedTupleUnion> =
  core.$constructor("$ZodDiscriminatedTupleUnion", (inst, def) => {
    z.ZodType.init(inst, def);
    $ZodDiscriminatedTupleUnion.init(inst, def);
  });

function formatErrorMessage(values: readonly util.Primitive[]): string {
  const strings = values.map(stringifyPrimitive);
  if (strings.length === 0) {
    return "Invalid value";
  }
  if (strings.length === 1) {
    return `Expected ${strings[0]}`;
  }
  return `Expected one of ${strings.slice(0, -1).join(", ")} or ${
    strings[strings.length - 1]
  }`;
}

export function discriminatedTupleUnion<
  const T extends readonly $ZodDiscriminatedTupleUnionOption[],
>(
  options: T,
  params?: string | $ZodDiscriminatedTupleUnionParams,
): ZodDiscriminatedTupleUnion<T> {
  const { error: customError } = util.normalizeParams(params);
  const error: core.$ZodErrorMap = (issue) => {
    if (
      customError &&
      (issue.code === "invalid_type" || issue.code === "custom")
    ) {
      const customMessage = util.unwrapMessage(customError(issue));
      if (customMessage != null) {
        return customMessage;
      }
    }
    if (issue.code === "custom" && issue.params?.discriminators) {
      return formatErrorMessage(issue.params.discriminators);
    }
  };
  return new ZodDiscriminatedTupleUnion({
    type: "custom",
    options,
    error,
  }) as ZodDiscriminatedTupleUnion<T>;
}
