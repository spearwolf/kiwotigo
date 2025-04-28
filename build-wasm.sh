#!/bin/bash
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" src/wasm_exec.js
GOOS=js GOARCH=wasm go build -o kiwotigo.wasm kiwotigo-js-bridge/main.go
