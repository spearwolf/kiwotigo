#!/bin/bash

# USE WITH $ source setup-go-env.sh

GO_ARCHIVE=go1.15.linux-amd64.tar.gz

if [ -z $(which go) ]
then
    if [ ! -f $GO_ARCHIVE ]
    then
        echo "download golang archive.."
        curl -OL https://golang.org/dl/$GO_ARCHIVE
    fi
    if [ ! -d /usr/local/go ]
    then
        echo "extract golang archive to /usr/local/go"
        sudo tar -C /usr/local -xzf $GO_ARCHIVE
    fi
    export PATH=$PATH:/usr/local/go/bin
    echo "added /usr/local/go/bin to your PATH environment"
    go version
fi