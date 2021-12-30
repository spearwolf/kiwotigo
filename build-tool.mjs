#!/usr/bin/env zx

import 'zx/globals';
import initGoEnv from './scripts/initialize-go-env.mjs';

const {GOEXE} = await initGoEnv();

await $`${GOEXE} build -o kiwotigo kiwotigo-tool/main.go`;
