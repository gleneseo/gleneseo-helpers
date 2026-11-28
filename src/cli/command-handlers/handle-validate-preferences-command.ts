import { Console, Effect, FileSystem, Schema } from "effect";
import printBanner from "../print-banner.js";
import FilePath from "../../helpers/file-path.js";
import PreferencesFileReadError from "../../preferences/preferences-file-read-error.js";
import PreferencesFileParseError from "../../preferences/preferences-file-parse-error.js";

/**
 * The domain errors that can end a {@link handleValidatePreferencesCommand}
 * run. Each carries a distinct `Runtime.errorExitCode` so the process exits
 * with a code specific to the failure that occurred.
 */
type ValidatePreferencesError =
  PreferencesFileReadError | PreferencesFileParseError;

/**
 * Reads the Preferences file at the given path and checks that it contains
 * valid JSON, printing the banner and a success message when it does, and,
 * for a domain error, a human-readable message before failing with it
 *
 * @param path - Path to the Preferences file to validate
 * @param quiet - When true, suppresses the banner and the success message;
 * errors are still printed
 * @returns An effect that resolves once the Preferences file has been
 * validated, or fails with the {@link ValidatePreferencesError} that stopped
 * it, after logging why
 */
const handleValidatePreferencesCommand: (
  path: typeof FilePath.Type,
  quiet: boolean,
) => Effect.Effect<void, ValidatePreferencesError, FileSystem.FileSystem> = (
  path,
  quiet,
) =>
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;

    const logStatus = (message: string) =>
      quiet ? Effect.void : Console.log(message);

    yield* printBanner(quiet);

    const text = yield* fileSystem
      .readFileString(path)
      .pipe(
        Effect.mapError(
          (cause) => new PreferencesFileReadError({ path, cause }),
        ),
      );

    yield* Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Unknown))(
      text,
    ).pipe(
      Effect.mapError(
        (cause) => new PreferencesFileParseError({ path, cause }),
      ),
    );

    yield* logStatus(`✅ Preferences file [${path}] is valid.`);
  }).pipe(
    Effect.withSpan("validate-preferences-command"),
    Effect.catchTags({
      PreferencesFileReadError: (e) =>
        Console.error(
          `❌ Could not read Preferences file [${e.path}]. Make sure the file exists and is readable.`,
        ).pipe(Effect.andThen(() => Effect.fail(e))),
      PreferencesFileParseError: (e) =>
        Console.error(
          `❌ Preferences file [${e.path}] is not valid JSON. Fix the JSON and try again.`,
        ).pipe(Effect.andThen(() => Effect.fail(e))),
    }),
  );

export default handleValidatePreferencesCommand;
