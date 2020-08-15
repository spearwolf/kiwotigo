#!/bin/bash

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

    echo "added /usr/local/go/bin to your PATH env"
    echo "if you want to set the PATH permanently, add the following line to your $HOME/.profile"
    echo "export PATH=$PATH:/usr/local/go/bin"
fi
echo -n "Great! you have installed "
go version

echo "Go and build the kiwotigo tool with ./build.sh"