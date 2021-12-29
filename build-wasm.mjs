#!/usr/bin/env zx

import fs from 'fs';
import path from 'path';
import { platform } from 'process';
import 'zx/globals';

const GOEXE = platform.startsWith('win') ? 'go.exe' : 'go';

const readGoRoot = async () => {
  try {
    return (await $`${GOEXE} env GOROOT`).toString().trim();
  } catch (err) {
    console.error(`couldn't find the _go_ executable in your PATH :(
please install the go sdk first
run 'source ./setup-go-env.sh' if you have a linux terminal
or visit https://golang.org/ for detailed instructions
`);
    process.exit(1);
  }
};

const syncWasmExecScript = (goRoot, target) => {
  const data = fs.readFileSync(
    path.join(goRoot, 'misc/wasm/wasm_exec.js'),
    'utf8',
  );
  fs.writeFileSync(target, data, 'utf8');
};

const goRootDir = await readGoRoot();

syncWasmExecScript(goRootDir, 'wasm_exec.js');

process.env.GO111MODULE = 'off';
process.env.GOOS = 'js';
process.env.GOARCH = 'wasm';

await $`${GOEXE} build -o dist/kiwotigo.wasm kiwotigo-js-bridge/main.go`;
