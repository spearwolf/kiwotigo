# kiwotigo

[![Go Report Card](https://goreportcard.com/badge/github.com/spearwolf/kiwotigo)](https://goreportcard.com/report/github.com/spearwolf/kiwotigo)

go-lang based world/territory creation utilities for [kiwoticum](https://github.com/spearwolf/kiwoticum).

the kiwotigo code is licensed under the GPLv3. see [LICENSE](./LICENSE.txt) for details.

![kiwotigo example](./kiwotigo.png)

## Development

Build kiwotigo library with:

```sh
$ ./build.sh  # -> build kiwotigo executable
$ ./build.sh -wasm  # -> build kiwotigo.wasm module
```

Start a http server for testing the kiwotigo.wasm module with:

```sh
$ npx serve
```

as an alternative you can use the gulp tasks:

```sh
$ npm install --global gulp-cli
$ gulp --tasks  # show all tasks
```

or just start:

```sh
$ npm start
```


have fun!
