#!/bin/bash
VERSION="$(git rev-parse --abbrev-ref HEAD)-$(git rev-parse --short HEAD)-$(date +%Y%m%d)"
esbuild src/kiwotigo-demo.js \
  --bundle \
  --platform=browser \
  --target=esnext \
  --outfile=kiwotigo-demo.js \
  "--define:__KIWOTIGO_VERSION__=\"$VERSION\""
