// PROTOTYPE (issue #102): throwaway. Does Argument.FileSchema keep distinct errors/exit codes?
// Run: npx tsx prototypes/PROTOTYPE-file-schema.ts
import { Effect, Console, Schema } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Argument, Command } from "effect/cli";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const Prefs = Schema.Struct({ medium: Schema.Array(Schema.String) });

if (process.env.PROTO_CHILD === "1") {
  const path = Argument.FileSchema("path", Prefs, { format: "json" });
  const cmd = Command.make("validate-preferences", { path }, ({ path }) =>
    Console.log(`OK handler got ${JSON.stringify(path)}`),
  );
  Command.run(cmd, { version: "0" }).pipe(
    Effect.provide(NodeServices.layer),
    NodeRuntime.runMain,
  );
} else {
  const dir = mkdtempSync(join(tmpdir(), "proto-"));
  writeFileSync(join(dir, "valid.json"), '{"medium":["a"]}');
  writeFileSync(join(dir, "badjson.json"), "{nope");
  writeFileSync(join(dir, "badshape.json"), '{"medium":[1]}');
  mkdirSync(join(dir, "adir"));
  const cases = ["valid.json", "badjson.json", "badshape.json", "missing.json", "adir"];
  for (const c of cases) {
    const r = spawnSync("npx", ["--no-install","tsx", fileURLToPath(import.meta.url), join(dir, c)], { encoding: "utf8", env: { ...process.env, PROTO_CHILD: "1" } });
    console.log(`\n=== ${c} → exit ${r.status}\nstdout: ${r.stdout.trim()}\nstderr: ${r.stderr.split("\n").filter((l: string) => !l.startsWith("npm notice")).join("\n").trim().replaceAll(dir, "<dir>")}`);
  }
}
