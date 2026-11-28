# Validating files in the CLI argument layer

This project does not use `Argument.FileSchema` (or `FileParse` / `FileText`) in helpers whose main function is to validate a file against a schema, such as `validate-preferences`. For those helpers, reading, parsing and validating the file stays in the command handler.

Helpers that merely consume a file and can assume it is already valid may still use the CLI argument layer to load it. That is a different case and is not ruled out.

## Why this is out of scope

`validate-preferences` reports each failure with its own tagged domain error and `Runtime.errorExitCode` (70 for read, 71 for parse, plus the schema-validation code planned in #97), along with a human-readable message. `Argument.FileSchema` fails with plain strings, so every failure becomes a generic CLI usage error:

- the process exits with 1 and prints the full usage block, so the distinct exit codes are lost;
- messages expose raw `SyntaxError` / `SchemaError(...)` text instead of our actionable wording;
- read/parse/validate logic moves out of the handler into the CLI layer, away from the handler-level tests.

A prototype confirmed this: branch `prototype/file-schema-102`, `prototypes/PROTOTYPE-file-schema.ts`.

This reasoning applies because the validation errors are the helper's output. A helper that assumes a valid file has no use for distinct validation exit codes or tailored messages, so a generic usage error is acceptable there.

`Argument.File` on its own (help text and completion, no decoding) was not evaluated and is not covered by this decision.

## Prior requests

- #102: "Investigate Argument.FileSchema for validate-preferences validation"
