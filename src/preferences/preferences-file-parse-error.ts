import { Runtime, Schema } from "effect";
import FilePath from "../helpers/file-path.js";

/**
 * Raised when the Preferences file was read but does not contain valid JSON
 */
class PreferencesFileParseError extends Schema.TaggedError<PreferencesFileParseError>()(
  "PreferencesFileParseError",
  {
    /** The path of the Preferences file */
    path: FilePath,
    /** The underlying error that caused the parse to fail */
    cause: Schema.Defect(),
  },
) {
  /** Read by NodeRuntime's default teardown to set the process exit code */
  override readonly [Runtime.errorExitCode] = 71;

  /** Already logged with a human-readable message; skip NodeRuntime's default error log */
  override readonly [Runtime.errorReported] = false;
}

export default PreferencesFileParseError;
