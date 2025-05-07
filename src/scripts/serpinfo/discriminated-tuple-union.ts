import { z } from "zod";
import type { ZodTupleWithOptional } from "zod-tuple-with-optional";

type Option =
  | z.ZodTuple<[z.ZodLiteral<z.Primitive>, ...z.ZodTypeAny[]]>
  | ZodTupleWithOptional<[z.ZodLiteral<z.Primitive>, ...z.ZodTypeAny[]]>;

interface Def<Options extends readonly Option[]> extends z.ZodTypeDef {
  options: Options;
  optionsMap: Map<z.Primitive, Option>;
}

type IssueParams = { options: z.Primitive[] };

class DiscriminatedTupleUnion<
  Options extends readonly Option[],
> extends z.ZodType<
  z.output<Options[number]>,
  Def<Options>,
  z.input<Options[number]>
> {
  _parse(input: z.ParseInput): z.ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== z.ZodParsedType.array) {
      z.addIssueToContext(ctx, {
        code: z.ZodIssueCode.invalid_type,
        expected: z.ZodParsedType.array,
        received: ctx.parsedType,
      });
      return z.INVALID;
    }
    const option = this._def.optionsMap.get(ctx.data[0]);
    if (!option) {
      z.addIssueToContext(ctx, {
        code: z.ZodIssueCode.custom,
        params: {
          options: [...this._def.optionsMap.keys()],
        } satisfies IssueParams,
        path: [0],
      });
      return z.INVALID;
    }
    return ctx.common.async
      ? option._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
      : option._parseSync({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}

export function discriminatedTupleUnion<Options extends readonly Option[]>(
  options: Options,
): DiscriminatedTupleUnion<Options> {
  const optionsMap = new Map<z.Primitive, Option>();
  for (const option of options) {
    const value = option.items[0].value;
    if (optionsMap.has(value)) {
      throw new Error(`Discriminator has duplicate value ${String(value)}`);
    }
    optionsMap.set(value, option);
  }
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.custom) {
      return {
        message: `Invalid discriminator value. Expected ${z.util.joinValues(
          (issue.params as IssueParams).options,
        )}`,
      };
    }
    return { message: ctx.defaultError };
  };
  return new DiscriminatedTupleUnion<Options>({
    options,
    optionsMap,
    errorMap,
  });
}
