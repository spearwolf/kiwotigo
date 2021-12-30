#!/usr/bin/env zx

import fs from 'fs';
import path from 'path';
import 'zx/globals';
import initGoEnv from './scripts/initialize-go-env.mjs';

const syncWasmExecScript = (goRoot, target) => {
  const data = fs.readFileSync(path.join(goRoot, 'misc/wasm/wasm_exec.js'), 'utf8');
  const oldData = fs.existsSync(target) && fs.readFileSync(target, 'utf8');
  if (data !== oldData) {
    console.log('write', target);
    fs.writeFileSync(target, data, 'utf8');
  } else {
    console.log('leave', target, 'untouched - it is up to date');
  }
};

const {GOEXE, GOROOT} = await initGoEnv();

syncWasmExecScript(GOROOT, 'wasm_exec.js');

process.env.GOOS = 'js';
process.env.GOARCH = 'wasm';

await $`${GOEXE} build -o dist/kiwotigo.wasm kiwotigo-js-bridge/main.go`;
