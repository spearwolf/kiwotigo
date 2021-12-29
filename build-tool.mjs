#!/usr/bin/env zx

import { platform } from 'process';
import 'zx/globals';

const GOEXE = platform.startsWith('win') ? 'go.exe' : 'go';

try {
  await $`${GOEXE} env GOROOT`;
} catch (err) {
  console.error(`couldn't find the _go_ executable in your PATH :(
please install the go sdk first
run 'source ./setup-go-env.sh' if you have a linux terminal
or visit https://golang.org/ for detailed instructions
`);
  process.exit(1);
}

process.env.GO111MODULE = 'off';

await $`${GOEXE} build -o kiwotigo kiwotigo-tool/main.go`;
