import { Runtime } from "effect";
import { describe, expect, it } from "vitest";
import PreferencesFileReadError from "../../../src/preferences/preferences-file-read-error.js";
import FilePath from "../../../src/helpers/file-path.js";

const path = FilePath.make("/config/preferences.json");

describe("PreferencesFileReadError", () => {
  it("should tag itself as PreferencesFileReadError", () => {
    expect(new PreferencesFileReadError({ path, cause: "bad" })._tag).toBe(
      "PreferencesFileReadError",
    );
  });

  it("should expose a distinct exit code and skip the default error log", () => {
    const error = new PreferencesFileReadError({ path, cause: "bad" });

    expect(Runtime.getErrorExitCode(error)).toBe(70);
    expect(error[Runtime.errorReported]).toBe(false);
  });

  it("should expose the path and underlying cause", () => {
    const error = new PreferencesFileReadError({ path, cause: "bad" });

    expect(error.path).toBe(path);
    expect(error.cause).toBe("bad");
  });
});
