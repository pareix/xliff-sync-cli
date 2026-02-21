#!/usr/bin/env -S node --import tsx

const fs = require('fs').promises;
const path = require('path');

import { XlfTranslator } from './xlf-translator';

interface CliArgs {
  source: string;
  targets: string[];
}

function printUsage(): void {
  const usage = [
    'Usage:',
    '  xliff-sync-units --source <source.xlf> --target <target1.xlf> [--target <target2.xlf> ...]',
  ];
  console.error(usage.join('\n'));
}

function parseArgs(argv: string[]): CliArgs {
  let source: string | undefined;
  const targets: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--source': {
        const value = argv[++i];
        if (!value) {
          throw new Error('Missing value for --source');
        }
        source = value;
        break;
      }
      case '--target': {
        const value = argv[++i];
        if (!value) {
          throw new Error('Missing value for --target');
        }
        targets.push(value);
        break;
      }
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!source) {
    throw new Error('Missing required --source');
  }
  if (targets.length === 0) {
    throw new Error('At least one --target is required');
  }

  return { source, targets };
}

async function run(): Promise<number> {
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (ex) {
    const message = ex instanceof Error ? ex.message : String(ex);
    console.error(`Argument error: ${message}`);
    printUsage();
    return 2;
  }

  let sourceContent: string;
  try {
    const sourcePath = path.resolve(args.source);
    sourceContent = await fs.readFile(sourcePath, 'utf8');
  } catch (ex) {
    const message = ex instanceof Error ? ex.message : String(ex);
    console.error(`Failed to read source file: ${message}`);
    return 4;
  }

  let hasErrors = false;
  for (const targetArg of args.targets) {
    const targetPath = path.resolve(targetArg);

    try {
      const targetContent = await fs.readFile(targetPath, 'utf8');
      const newTargetContent = await XlfTranslator.synchronize(sourceContent, targetContent, undefined);
      if (!newTargetContent) {
        throw new Error('Synchronization returned empty output');
      }

      await fs.writeFile(targetPath, newTargetContent, 'utf8');
      console.log(`OK ${targetPath}`);
    } catch (ex) {
      hasErrors = true;
      const message = ex instanceof Error ? ex.message : String(ex);
      console.error(`FAIL ${targetPath}: ${message}`);
    }
  }

  return hasErrors ? 5 : 0;
}

run()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((ex) => {
    const message = ex instanceof Error ? ex.message : String(ex);
    console.error(`Unexpected error: ${message}`);
    process.exitCode = 1;
  });
