#!/bin/bash

if [ -z $(which go) ]
then
    echo "couldn't find the go executable in your PATH :("
    echo "please install the go sdk first"
    echo "run 'source ./setup-go-env.sh' if you have a linux terminal"
    echo "or visit https://golang.org/ for detailed instructions"
    exit 1
fi

if [ "$1" = "-wasm" ]
then
    if [ ! -f wasm_exec.js ]
    then
      cp -v $(go env GOROOT)/misc/wasm/wasm_exec.js .
    fi

    CMD="go build -o kiwotigo.wasm kiwotigo-js-bridge/main.go"
    echo GOOS=js GOARCH=wasm $CMD
    GOOS=js GOARCH=wasm exec $CMD
else
    CMD="go build -o kiwotigo kiwotigo-tool/main.go"
    echo $CMD
    exec $CMD
fi
