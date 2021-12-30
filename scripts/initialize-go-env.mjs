import {platform} from 'process';
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

export default async () => {
  process.env.GO111MODULE = 'off';

  return {
    GOEXE,
    GOROOT: await readGoRoot(),
  };
};
