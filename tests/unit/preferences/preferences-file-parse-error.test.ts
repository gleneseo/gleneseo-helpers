import { Runtime } from "effect";
import { describe, expect, it } from "vitest";
import PreferencesFileParseError from "../../../src/preferences/preferences-file-parse-error.js";
import FilePath from "../../../src/helpers/file-path.js";

const path = FilePath.make("/config/preferences.json");

describe("PreferencesFileParseError", () => {
  it("should tag itself as PreferencesFileParseError", () => {
    expect(new PreferencesFileParseError({ path, cause: "bad" })._tag).toBe(
      "PreferencesFileParseError",
    );
  });

  it("should expose a distinct exit code and skip the default error log", () => {
    const error = new PreferencesFileParseError({ path, cause: "bad" });

    expect(Runtime.getErrorExitCode(error)).toBe(71);
    expect(error[Runtime.errorReported]).toBe(false);
  });

  it("should expose the path and underlying cause", () => {
    const error = new PreferencesFileParseError({ path, cause: "bad" });

    expect(error.path).toBe(path);
    expect(error.cause).toBe("bad");
  });
});
