# Validating files in the CLI argument layer

This project does not use `Argument.FileSchema` (or `FileParse` / `FileText`) to read, parse and validate input files such as the Preferences file. File handling stays in the command handler.

## Why this is out of scope

`validate-preferences` reports each failure with its own tagged domain error and `Runtime.errorExitCode` (70 for read, 71 for parse, plus the schema-validation code planned in #97), along with a human-readable message. `Argument.FileSchema` fails with plain strings, so every failure becomes a generic CLI usage error:

- the process exits with 1 and prints the full usage block, so the distinct exit codes are lost;
- messages expose raw `SyntaxError` / `SchemaError(...)` text instead of our actionable wording;
- read/parse/validate logic moves out of the handler into the CLI layer, away from the handler-level tests.

A prototype confirmed this: branch `prototype/file-schema-102`, `prototypes/PROTOTYPE-file-schema.ts`.

`Argument.File` on its own (help text and completion, no decoding) was not evaluated and is not covered by this decision.

## Prior requests

- #102: "Investigate Argument.FileSchema for validate-preferences validation"
