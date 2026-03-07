#!/usr/bin/env node

import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load Go WASM support (sets globalThis.Go)
await import(resolve(__dirname, 'src/wasm_exec.js'));

import {DefaultConfig, convertToIntermediateContinentalFormat} from './src/kiwotigo-postprocess.js';
import {findAndConnectAllIslands} from './src/kiwotigo-unite-islands.js';

// --- argument parsing ---

function parseValue(val) {
  if (val === undefined || val === 'true') return true;
  if (val === 'false') return false;
  const num = Number(val);
  if (!Number.isNaN(num) && val !== '') return num;
  return val;
}

function printHelp() {
  console.log(`Usage: node kiwotigo-cli.mjs [options]

Options:
  -c, --config <file>   Load config from a JSON file (you can also use a ICF file, the config will be extracted from the "config" property in this case)
  -o, --output <file>   Write JSON output to a file instead of stdout
  --prettyPrint         Pretty-print the JSON output
  -h, --help            Show this help message

Config overrides (override values from config file):
  --gridWidth=<n>                 Grid width (default: ${DefaultConfig.gridWidth})
  --gridHeight=<n>                Grid height (default: ${DefaultConfig.gridHeight})
  --gridOuterPaddingX=<n>         Grid outer horizontal padding (default: ${DefaultConfig.gridOuterPaddingX})
  --gridOuterPaddingY=<n>         Grid outer vertical padding (default: ${DefaultConfig.gridOuterPaddingY})
  --gridInnerPaddingX=<n>         Grid inner horizontal padding (default: ${DefaultConfig.gridInnerPaddingX})
  --gridInnerPaddingY=<n>         Grid inner vertical padding (default: ${DefaultConfig.gridInnerPaddingY})
  --gridHexWidth=<n>              Grid hex width (default: ${DefaultConfig.gridHexWidth})
  --gridHexHeight=<n>             Grid hex height (default: ${DefaultConfig.gridHexHeight})
  --hexWidth=<n>                  Hex width (default: ${DefaultConfig.hexWidth})
  --hexHeight=<n>                 Hex height (default: ${DefaultConfig.hexHeight})
  --hexPaddingX=<n>               Hex horizontal padding (default: ${DefaultConfig.hexPaddingX})
  --hexPaddingY=<n>               Hex vertical padding (default: ${DefaultConfig.hexPaddingY})
  --fastGrowIterations=<n>        Fast grow iterations (default: ${DefaultConfig.fastGrowIterations})
  --minimalGrowIterations=<n>     Minimal grow iterations (default: ${DefaultConfig.minimalGrowIterations})
  --maxRegionSizeFactor=<n>       Max region size factor (default: ${DefaultConfig.maxRegionSizeFactor})
  --probabilityCreateRegionAt=<n> Probability to create a region (default: ${DefaultConfig.probabilityCreateRegionAt})
  --divisibilityBy=<n>            Region count divisibility (default: ${DefaultConfig.divisibilityBy})
  --enableExtendedConnections=<bool>      (default: ${DefaultConfig.enableExtendedConnections})
  --maxExtendedOuterRangeFactor=<n>       (default: ${DefaultConfig.maxExtendedOuterRangeFactor})
  --canvasMargin=<n>              Canvas margin (default: ${DefaultConfig.canvasMargin})
  --enableLineOfSightConnections=<bool>   (default: true)
  --lineOfSightDensity=<n>        Line of sight density (default: 10)

Output:
  Writes the final ICF (Intermediate Continental Format) as JSON to stdout
  (or to a file when -o is used). Progress is reported to stderr.
`);
}

const args = process.argv.slice(2);
let configFile = null;
let outputFile = null;
let prettyPrint = false;
const overrides = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (arg === '--config' || arg === '-c') {
    configFile = args[++i];
    if (!configFile) {
      console.error('Error: --config requires a file path');
      process.exit(1);
    }
  } else if (arg === '--output' || arg === '-o') {
    outputFile = args[++i];
    if (!outputFile) {
      console.error('Error: --output requires a file path');
      process.exit(1);
    }
  } else if (arg === '--prettyPrint') {
    prettyPrint = true;
  } else if (arg.startsWith('--')) {
    const eqIdx = arg.indexOf('=');
    if (eqIdx !== -1) {
      const key = arg.slice(2, eqIdx);
      overrides[key] = parseValue(arg.slice(eqIdx + 1));
    } else {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg !== undefined && !nextArg.startsWith('--')) {
        overrides[key] = parseValue(nextArg);
        i++;
      } else {
        overrides[key] = true;
      }
    }
  }
}

// --- load config ---

let fileConfig = {};
if (configFile) {
  try {
    const configPath = resolve(process.cwd(), configFile);
    const raw = await readFile(configPath, 'utf-8');
    fileConfig = JSON.parse(raw);
    if (fileConfig?.config) {
      fileConfig = fileConfig.config;
    }
  } catch (err) {
    console.error(`Error reading config file "${configFile}": ${err.message}`);
    process.exit(1);
  }
}

const config = {...DefaultConfig, ...fileConfig, ...overrides};

// --- load and instantiate WASM ---

const wasmPath = resolve(__dirname, 'kiwotigo.wasm');
let wasmBuffer;
try {
  wasmBuffer = await readFile(wasmPath);
} catch (err) {
  console.error(`Error reading kiwotigo.wasm: ${err.message}`);
  console.error('Run "pnpm build:wasm" first to build the WASM module.');
  process.exit(1);
}

const go = new globalThis.Go();
const {instance} = await WebAssembly.instantiate(wasmBuffer, go.importObject);
go.run(instance);

// --- generate continent ---

process.stderr.write('🧠 Generating continent...\n');

const rawResult = await new Promise((resolvePromise) => {
  globalThis.__kiwotiGo_createContinent(
    config,
    (progress) => {
      process.stderr.write(`\r🚧 Progress: ${Math.round(progress * 100)}%`);
    },
    (result) => {
      process.stderr.write('\r🚧 Progress: 100%\n');
      resolvePromise(JSON.parse(result));
    },
  );
});

// --- post-processing ---

process.stderr.write('💎 Post-processing (ICF conversion, smoothing, islands)...\n');

let continent = convertToIntermediateContinentalFormat(config, rawResult.continent);
continent = findAndConnectAllIslands(continent, config);

// --- output ---

const output = {config, continent};
const json = prettyPrint ? JSON.stringify(output, null, 2) : JSON.stringify(output);

if (outputFile) {
  const outputPath = resolve(process.cwd(), outputFile);
  await writeFile(outputPath, json + '\n', 'utf-8');
  process.stderr.write(`💾 Output written to ${outputFile}\n`);
} else {
  process.stdout.write(json + '\n');
  process.stderr.write('✅ Done.\n');
}

process.stderr.write(`🍀 Thank you and have a nice day!\n`);

