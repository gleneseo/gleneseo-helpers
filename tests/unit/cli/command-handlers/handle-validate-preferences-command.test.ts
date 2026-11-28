import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, PlatformError, Runtime } from "effect";
import { TestConsole } from "effect/testing";
import handleValidatePreferencesCommand from "../../../../src/cli/command-handlers/handle-validate-preferences-command.js";
import PreferencesFileReadError from "../../../../src/preferences/preferences-file-read-error.js";
import PreferencesFileParseError from "../../../../src/preferences/preferences-file-parse-error.js";
import FilePath from "../../../../src/helpers/file-path.js";

const path = FilePath.make("/config/preferences.json");

/**
 * Provides a file system whose `readFileString` returns the given contents,
 * or fails with a `NotFound` system error when `contents` is omitted, so a
 * missing or unreadable Preferences file can be simulated
 */
const provideTestDoubles = (contents?: string) =>
  Effect.provide(
    Layer.mergeAll(
      FileSystem.layerNoop({
        readFileString: (filePath) =>
          contents === undefined
            ? Effect.fail(
                PlatformError.systemError({
                  _tag: "NotFound",
                  module: "FileSystem",
                  method: "readFileString",
                  pathOrDescriptor: filePath,
                }),
              )
            : Effect.succeed(contents),
      }),
      TestConsole.layer,
    ),
  );

describe("handleValidatePreferencesCommand", () => {
  it.effect(
    "should print a success message to standard out when the Preferences file is valid JSON",
    () =>
      Effect.gen(function* () {
        yield* handleValidatePreferencesCommand(path, false).pipe(
          provideTestDoubles('{"resume":"cv.pdf"}'),
        );

        assert.deepStrictEqual(yield* TestConsole.logLines, [
          `✅ Preferences file [${path}] is valid.`,
        ]);
        assert.deepStrictEqual(yield* TestConsole.errorLines, []);
      }),
  );

  it.effect(
    "should print nothing when the Preferences file is valid JSON and quiet is set",
    () =>
      Effect.gen(function* () {
        yield* handleValidatePreferencesCommand(path, true).pipe(
          provideTestDoubles('{"resume":"cv.pdf"}'),
        );

        assert.deepStrictEqual(yield* TestConsole.logLines, []);
        assert.deepStrictEqual(yield* TestConsole.errorLines, []);
      }),
  );

  it.effect(
    "should fail with a distinct exit code and log a message when the Preferences file cannot be read",
    () =>
      Effect.gen(function* () {
        const failure = yield* handleValidatePreferencesCommand(
          path,
          false,
        ).pipe(provideTestDoubles(), Effect.flip);

        expect(failure._tag).toBe("PreferencesFileReadError");
        expect(failure).toBeInstanceOf(PreferencesFileReadError);
        expect(Runtime.getErrorExitCode(failure)).toBe(70);
        assert.deepStrictEqual(yield* TestConsole.logLines, []);
        assert.deepStrictEqual(yield* TestConsole.errorLines, [
          `❌ Could not read Preferences file [${path}]. Make sure the file exists and is readable.`,
        ]);
      }),
  );

  it.effect(
    "should fail with a distinct exit code and log a message when the Preferences file is not valid JSON",
    () =>
      Effect.gen(function* () {
        const failure = yield* handleValidatePreferencesCommand(
          path,
          false,
        ).pipe(provideTestDoubles("not json{"), Effect.flip);

        expect(failure._tag).toBe("PreferencesFileParseError");
        expect(failure).toBeInstanceOf(PreferencesFileParseError);
        expect(Runtime.getErrorExitCode(failure)).toBe(71);
        assert.deepStrictEqual(yield* TestConsole.logLines, []);
        assert.deepStrictEqual(yield* TestConsole.errorLines, [
          `❌ Preferences file [${path}] is not valid JSON. Fix the JSON and try again.`,
        ]);
      }),
  );

  it.effect(
    "should fail without printing the success message when quiet is set and the Preferences file is not valid JSON",
    () =>
      Effect.gen(function* () {
        const failure = yield* handleValidatePreferencesCommand(
          path,
          true,
        ).pipe(provideTestDoubles("not json{"), Effect.flip);

        expect(failure).toBeInstanceOf(PreferencesFileParseError);
        assert.deepStrictEqual(yield* TestConsole.logLines, []);
        assert.deepStrictEqual(yield* TestConsole.errorLines, [
          `❌ Preferences file [${path}] is not valid JSON. Fix the JSON and try again.`,
        ]);
      }),
  );
});
