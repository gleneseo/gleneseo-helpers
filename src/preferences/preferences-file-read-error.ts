import { Runtime, Schema } from "effect";
import FilePath from "../helpers/file-path.js";

/**
 * Raised when the Preferences file does not exist as a regular file at the
 * given path, or cannot be read
 */
class PreferencesFileReadError extends Schema.TaggedError<PreferencesFileReadError>()(
  "PreferencesFileReadError",
  {
    /** The path of the Preferences file */
    path: FilePath,
    /** The underlying error that caused the read to fail */
    cause: Schema.Defect(),
  },
) {
  /** Read by NodeRuntime's default teardown to set the process exit code */
  override readonly [Runtime.errorExitCode] = 70;

  /** Already logged with a human-readable message; skip NodeRuntime's default error log */
  override readonly [Runtime.errorReported] = false;
}

export default PreferencesFileReadError;
