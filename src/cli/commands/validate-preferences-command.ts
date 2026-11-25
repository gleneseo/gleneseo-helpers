import { Argument, Command, Flag } from "effect/cli";
import handleValidatePreferencesCommand from "../command-handlers/handle-validate-preferences-command.js";
import FilePath from "../../helpers/file-path.js";

const path = Argument.String("path").pipe(
  Argument.withSchema(FilePath),
  Argument.withDescription("The path to the Preferences file to validate"),
);

const quiet = Flag.Boolean("quiet").pipe(
  Flag.withAlias("q"),
  Flag.withDefault(false),
  Flag.withDescription(
    "Suppress the banner and the success message (default: false)",
  ),
);

const validatePreferencesCommand = Command.make(
  "validate-preferences",
  { path, quiet },
  ({ path, quiet }) => handleValidatePreferencesCommand(path, quiet),
).pipe(
  Command.withDescription(
    "Check that the Preferences file at the given path exists and contains valid JSON",
  ),
);

export default validatePreferencesCommand;
