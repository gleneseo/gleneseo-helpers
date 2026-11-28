import { Effect } from "effect";
import { type CliError, Command } from "effect/cli";
import handleGleneseoHelpersCommand from "../command-handlers/handle-gleneseo-helpers-command.js";
import handleGmailCommand from "../command-handlers/handle-gmail-command.js";
import handleJobPostingsCommand from "../command-handlers/handle-job-postings-command.js";
import handleValidatePreferencesCommand from "../command-handlers/handle-validate-preferences-command.js";
import printBanner from "../print-banner.js";
import gmailCommand from "./gmail-command.js";
import jobPostingsCommand from "./job-postings-command.js";
import validatePreferencesCommand from "./validate-preferences-command.js";
import packageJson from "../../../package.json" with { type: "json" };

type JobPostingsHandlerEffect = ReturnType<typeof handleJobPostingsCommand>;
type GmailHandlerEffect = ReturnType<typeof handleGmailCommand>;
type ValidatePreferencesHandlerEffect = ReturnType<
  typeof handleValidatePreferencesCommand
>;

const helpCommand = Command.make(
  "help",
  {},
  // The return type annotation breaks the type-inference cycle with
  // `gleneseoHelpersCommand`, which is declared below and referenced in the
  // body.
  (): Effect.Effect<
    void,
    | Effect.Error<JobPostingsHandlerEffect>
    | Effect.Error<GmailHandlerEffect>
    | Effect.Error<ValidatePreferencesHandlerEffect>
    | CliError.CliError,
    | Effect.Services<JobPostingsHandlerEffect>
    | Effect.Services<GmailHandlerEffect>
    | Effect.Services<ValidatePreferencesHandlerEffect>
    | Command.Environment
  > =>
    printBanner(false).pipe(
      Effect.andThen(
        Command.runWith(gleneseoHelpersCommand, {
          version: packageJson.version,
        })(["--help"]),
      ),
    ),
).pipe(Command.withDescription("Show the application help"));

const gleneseoHelpersCommand = Command.make("gleneseo-helpers", {}, () =>
  handleGleneseoHelpersCommand(),
).pipe(
  Command.withDescription("A collection of Gleneseo helper commands"),
  Command.withSubcommands([
    gmailCommand,
    jobPostingsCommand,
    validatePreferencesCommand,
    helpCommand,
  ]),
);

export default gleneseoHelpersCommand;
