# xliff-sync-cli

CLI tool to synchronize XLIFF translation units from a source file to target files.
Functionality Extracted from Rob van Bekkums VSCode extension "XLIFF Sync" (https://marketplace.visualstudio.com/items?itemName=rvanbekkum.xliff-sync).


## Install

Global install:

```bash
npm install -g xliff-sync-cli
```

Project dependency (recommended for CI/build pipelines):

```bash
npm install --save-dev xliff-sync-cli
```

Or run without installing:

```bash
npx xliff-sync-cli --source path/to/source.g.xlf --target path/to/de-DE.xlf
```

## Usage

```bash
xliff-sync-units --source <source.xlf> --target <target1.xlf> [--target <target2.xlf> ...]
```

Example:

```bash
xliff-sync-units \
  --source ./Translations/MyApp.g.xlf \
  --target ./Translations/MyApp.de-DE.xlf \
  --target ./Translations/MyApp.fr-FR.xlf
```

### Usage in a project (local dependency)

If installed as a dev dependency, call it through your package scripts:

```json
{
  "scripts": {
    "sync:translations": "xliff-sync-units --source ./Translations/MyApp.g.xlf --target ./Translations/MyApp.de-DE.xlf --target ./Translations/MyApp.fr-FR.xlf"
  }
}
```

Then run:

```bash
npm run sync:translations
```

## Behavior

- Uses extension-default synchronization rules only (no runtime overrides yet).
- Reads source once, then synchronizes each target file.
- Rewrites each target file with regenerated XML output.
- Prints one status line per target (`OK` or `FAIL`).

## Exit codes

- `0`: all targets synchronized successfully.
- `2`: invalid CLI arguments.
- `4`: source file read error.
- `5`: one or more target files failed.

## Development

From this folder:

```bash
npm install
npm run sync:units -- --source <source.xlf> --target <target.xlf>
```
