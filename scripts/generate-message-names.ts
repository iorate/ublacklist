import fs from "node:fs/promises";
import { groupBy } from "es-toolkit";

async function main() {
  const messages: Record<string, { message: string }> = (
    await import("../src/_locales/en/messages.json", {
      with: { type: "json" },
    })
  ).default;
  const messageGroups = Object.entries(
    groupBy(Object.entries(messages), ([, { message }]) =>
      Math.max(
        0,
        ...message.matchAll(/\$\d+/g).map((match) => Number(match[0].slice(1))),
      ),
    ),
  ).sort(([arity1], [arity2]) => Number(arity1) - Number(arity2));
  const names = [
    "export type MessageName =",
    messageGroups.map(([arity]) => `  | MessageName${arity}`),
    "",
    messageGroups.map(([arity, messages]) => [
      `export type MessageName${arity} =`,
      messages.map(([name]) => `  | ${JSON.stringify(name)}`),
      "",
    ]),
    "",
  ]
    .flat(3)
    .join("\n");
  await fs.writeFile("src/common/message-names.generated.ts", names);
}

await main();
