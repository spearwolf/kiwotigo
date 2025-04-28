(() => {
  // src/wasm_exec.js
  (() => {
    const enosys = () => {
      const err = new Error("not implemented");
      err.code = "ENOSYS";
      return err;
    };
    if (!globalThis.fs) {
      let outputBuf = "";
      globalThis.fs = {
        constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1, O_DIRECTORY: -1 },
        // unused
        writeSync(fd, buf) {
          outputBuf += decoder.decode(buf);
          const nl = outputBuf.lastIndexOf("\n");
          if (nl != -1) {
            console.log(outputBuf.substring(0, nl));
            outputBuf = outputBuf.substring(nl + 1);
          }
          return buf.length;
        },
        write(fd, buf, offset, length, position, callback) {
          if (offset !== 0 || length !== buf.length || position !== null) {
            callback(enosys());
            return;
          }
          const n = this.writeSync(fd, buf);
          callback(null, n);
        },
        chmod(path, mode, callback) {
          callback(enosys());
        },
        chown(path, uid, gid, callback) {
          callback(enosys());
        },
        close(fd, callback) {
          callback(enosys());
        },
        fchmod(fd, mode, callback) {
          callback(enosys());
        },
        fchown(fd, uid, gid, callback) {
          callback(enosys());
        },
        fstat(fd, callback) {
          callback(enosys());
        },
        fsync(fd, callback) {
          callback(null);
        },
        ftruncate(fd, length, callback) {
          callback(enosys());
        },
        lchown(path, uid, gid, callback) {
          callback(enosys());
        },
        link(path, link, callback) {
          callback(enosys());
        },
        lstat(path, callback) {
          callback(enosys());
        },
        mkdir(path, perm, callback) {
          callback(enosys());
        },
        open(path, flags, mode, callback) {
          callback(enosys());
        },
        read(fd, buffer, offset, length, position, callback) {
          callback(enosys());
        },
        readdir(path, callback) {
          callback(enosys());
        },
        readlink(path, callback) {
          callback(enosys());
        },
        rename(from, to, callback) {
          callback(enosys());
        },
        rmdir(path, callback) {
          callback(enosys());
        },
        stat(path, callback) {
          callback(enosys());
        },
        symlink(path, link, callback) {
          callback(enosys());
        },
        truncate(path, length, callback) {
          callback(enosys());
        },
        unlink(path, callback) {
          callback(enosys());
        },
        utimes(path, atime, mtime, callback) {
          callback(enosys());
        }
      };
    }
    if (!globalThis.process) {
      globalThis.process = {
        getuid() {
          return -1;
        },
        getgid() {
          return -1;
        },
        geteuid() {
          return -1;
        },
        getegid() {
          return -1;
        },
        getgroups() {
          throw enosys();
        },
        pid: -1,
        ppid: -1,
        umask() {
          throw enosys();
        },
        cwd() {
          throw enosys();
        },
        chdir() {
          throw enosys();
        }
      };
    }
    if (!globalThis.path) {
      globalThis.path = {
        resolve(...pathSegments) {
          return pathSegments.join("/");
        }
      };
    }
    if (!globalThis.crypto) {
      throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
    }
    if (!globalThis.performance) {
      throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
    }
    if (!globalThis.TextEncoder) {
      throw new Error("globalThis.TextEncoder is not available, polyfill required");
    }
    if (!globalThis.TextDecoder) {
      throw new Error("globalThis.TextDecoder is not available, polyfill required");
    }
    const encoder = new TextEncoder("utf-8");
    const decoder = new TextDecoder("utf-8");
    globalThis.Go = class {
      constructor() {
        this.argv = ["js"];
        this.env = {};
        this.exit = (code) => {
          if (code !== 0) {
            console.warn("exit code:", code);
          }
        };
        this._exitPromise = new Promise((resolve) => {
          this._resolveExitPromise = resolve;
        });
        this._pendingEvent = null;
        this._scheduledTimeouts = /* @__PURE__ */ new Map();
        this._nextCallbackTimeoutID = 1;
        const setInt64 = (addr, v) => {
          this.mem.setUint32(addr + 0, v, true);
          this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
        };
        const setInt32 = (addr, v) => {
          this.mem.setUint32(addr + 0, v, true);
        };
        const getInt64 = (addr) => {
          const low = this.mem.getUint32(addr + 0, true);
          const high = this.mem.getInt32(addr + 4, true);
          return low + high * 4294967296;
        };
        const loadValue = (addr) => {
          const f = this.mem.getFloat64(addr, true);
          if (f === 0) {
            return void 0;
          }
          if (!isNaN(f)) {
            return f;
          }
          const id = this.mem.getUint32(addr, true);
          return this._values[id];
        };
        const storeValue = (addr, v) => {
          const nanHead = 2146959360;
          if (typeof v === "number" && v !== 0) {
            if (isNaN(v)) {
              this.mem.setUint32(addr + 4, nanHead, true);
              this.mem.setUint32(addr, 0, true);
              return;
            }
            this.mem.setFloat64(addr, v, true);
            return;
          }
          if (v === void 0) {
            this.mem.setFloat64(addr, 0, true);
            return;
          }
          let id = this._ids.get(v);
          if (id === void 0) {
            id = this._idPool.pop();
            if (id === void 0) {
              id = this._values.length;
            }
            this._values[id] = v;
            this._goRefCounts[id] = 0;
            this._ids.set(v, id);
          }
          this._goRefCounts[id]++;
          let typeFlag = 0;
          switch (typeof v) {
            case "object":
              if (v !== null) {
                typeFlag = 1;
              }
              break;
            case "string":
              typeFlag = 2;
              break;
            case "symbol":
              typeFlag = 3;
              break;
            case "function":
              typeFlag = 4;
              break;
          }
          this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
          this.mem.setUint32(addr, id, true);
        };
        const loadSlice = (addr) => {
          const array = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          return new Uint8Array(this._inst.exports.mem.buffer, array, len);
        };
        const loadSliceOfValues = (addr) => {
          const array = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          const a = new Array(len);
          for (let i = 0; i < len; i++) {
            a[i] = loadValue(array + i * 8);
          }
          return a;
        };
        const loadString = (addr) => {
          const saddr = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
        };
        const testCallExport = (a, b) => {
          this._inst.exports.testExport0();
          return this._inst.exports.testExport(a, b);
        };
        const timeOrigin = Date.now() - performance.now();
        this.importObject = {
          _gotest: {
            add: (a, b) => a + b,
            callExport: testCallExport
          },
          gojs: {
            // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
            // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
            // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
            // This changes the SP, thus we have to update the SP used by the imported function.
            // func wasmExit(code int32)
            "runtime.wasmExit": (sp) => {
              sp >>>= 0;
              const code = this.mem.getInt32(sp + 8, true);
              this.exited = true;
              delete this._inst;
              delete this._values;
              delete this._goRefCounts;
              delete this._ids;
              delete this._idPool;
              this.exit(code);
            },
            // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
            "runtime.wasmWrite": (sp) => {
              sp >>>= 0;
              const fd = getInt64(sp + 8);
              const p = getInt64(sp + 16);
              const n = this.mem.getInt32(sp + 24, true);
              fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
            },
            // func resetMemoryDataView()
            "runtime.resetMemoryDataView": (sp) => {
              sp >>>= 0;
              this.mem = new DataView(this._inst.exports.mem.buffer);
            },
            // func nanotime1() int64
            "runtime.nanotime1": (sp) => {
              sp >>>= 0;
              setInt64(sp + 8, (timeOrigin + performance.now()) * 1e6);
            },
            // func walltime() (sec int64, nsec int32)
            "runtime.walltime": (sp) => {
              sp >>>= 0;
              const msec = (/* @__PURE__ */ new Date()).getTime();
              setInt64(sp + 8, msec / 1e3);
              this.mem.setInt32(sp + 16, msec % 1e3 * 1e6, true);
            },
            // func scheduleTimeoutEvent(delay int64) int32
            "runtime.scheduleTimeoutEvent": (sp) => {
              sp >>>= 0;
              const id = this._nextCallbackTimeoutID;
              this._nextCallbackTimeoutID++;
              this._scheduledTimeouts.set(id, setTimeout(
                () => {
                  this._resume();
                  while (this._scheduledTimeouts.has(id)) {
                    console.warn("scheduleTimeoutEvent: missed timeout event");
                    this._resume();
                  }
                },
                getInt64(sp + 8)
              ));
              this.mem.setInt32(sp + 16, id, true);
            },
            // func clearTimeoutEvent(id int32)
            "runtime.clearTimeoutEvent": (sp) => {
              sp >>>= 0;
              const id = this.mem.getInt32(sp + 8, true);
              clearTimeout(this._scheduledTimeouts.get(id));
              this._scheduledTimeouts.delete(id);
            },
            // func getRandomData(r []byte)
            "runtime.getRandomData": (sp) => {
              sp >>>= 0;
              crypto.getRandomValues(loadSlice(sp + 8));
            },
            // func finalizeRef(v ref)
            "syscall/js.finalizeRef": (sp) => {
              sp >>>= 0;
              const id = this.mem.getUint32(sp + 8, true);
              this._goRefCounts[id]--;
              if (this._goRefCounts[id] === 0) {
                const v = this._values[id];
                this._values[id] = null;
                this._ids.delete(v);
                this._idPool.push(id);
              }
            },
            // func stringVal(value string) ref
            "syscall/js.stringVal": (sp) => {
              sp >>>= 0;
              storeValue(sp + 24, loadString(sp + 8));
            },
            // func valueGet(v ref, p string) ref
            "syscall/js.valueGet": (sp) => {
              sp >>>= 0;
              const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 32, result);
            },
            // func valueSet(v ref, p string, x ref)
            "syscall/js.valueSet": (sp) => {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
            },
            // func valueDelete(v ref, p string)
            "syscall/js.valueDelete": (sp) => {
              sp >>>= 0;
              Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
            },
            // func valueIndex(v ref, i int) ref
            "syscall/js.valueIndex": (sp) => {
              sp >>>= 0;
              storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
            },
            // valueSetIndex(v ref, i int, x ref)
            "syscall/js.valueSetIndex": (sp) => {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
            },
            // func valueCall(v ref, m string, args []ref) (ref, bool)
            "syscall/js.valueCall": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const m = Reflect.get(v, loadString(sp + 16));
                const args = loadSliceOfValues(sp + 32);
                const result = Reflect.apply(m, v, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 56, result);
                this.mem.setUint8(sp + 64, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 56, err);
                this.mem.setUint8(sp + 64, 0);
              }
            },
            // func valueInvoke(v ref, args []ref) (ref, bool)
            "syscall/js.valueInvoke": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const args = loadSliceOfValues(sp + 16);
                const result = Reflect.apply(v, void 0, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, result);
                this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, err);
                this.mem.setUint8(sp + 48, 0);
              }
            },
            // func valueNew(v ref, args []ref) (ref, bool)
            "syscall/js.valueNew": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const args = loadSliceOfValues(sp + 16);
                const result = Reflect.construct(v, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, result);
                this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, err);
                this.mem.setUint8(sp + 48, 0);
              }
            },
            // func valueLength(v ref) int
            "syscall/js.valueLength": (sp) => {
              sp >>>= 0;
              setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
            },
            // valuePrepareString(v ref) (ref, int)
            "syscall/js.valuePrepareString": (sp) => {
              sp >>>= 0;
              const str = encoder.encode(String(loadValue(sp + 8)));
              storeValue(sp + 16, str);
              setInt64(sp + 24, str.length);
            },
            // valueLoadString(v ref, b []byte)
            "syscall/js.valueLoadString": (sp) => {
              sp >>>= 0;
              const str = loadValue(sp + 8);
              loadSlice(sp + 16).set(str);
            },
            // func valueInstanceOf(v ref, t ref) bool
            "syscall/js.valueInstanceOf": (sp) => {
              sp >>>= 0;
              this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
            },
            // func copyBytesToGo(dst []byte, src ref) (int, bool)
            "syscall/js.copyBytesToGo": (sp) => {
              sp >>>= 0;
              const dst = loadSlice(sp + 8);
              const src = loadValue(sp + 32);
              if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
                this.mem.setUint8(sp + 48, 0);
                return;
              }
              const toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              this.mem.setUint8(sp + 48, 1);
            },
            // func copyBytesToJS(dst ref, src []byte) (int, bool)
            "syscall/js.copyBytesToJS": (sp) => {
              sp >>>= 0;
              const dst = loadValue(sp + 8);
              const src = loadSlice(sp + 16);
              if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
                this.mem.setUint8(sp + 48, 0);
                return;
              }
              const toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              this.mem.setUint8(sp + 48, 1);
            },
            "debug": (value) => {
              console.log(value);
            }
          }
        };
      }
      async run(instance) {
        if (!(instance instanceof WebAssembly.Instance)) {
          throw new Error("Go.run: WebAssembly.Instance expected");
        }
        this._inst = instance;
        this.mem = new DataView(this._inst.exports.mem.buffer);
        this._values = [
          // JS values that Go currently has references to, indexed by reference id
          NaN,
          0,
          null,
          true,
          false,
          globalThis,
          this
        ];
        this._goRefCounts = new Array(this._values.length).fill(Infinity);
        this._ids = /* @__PURE__ */ new Map([
          // mapping from JS values to reference ids
          [0, 1],
          [null, 2],
          [true, 3],
          [false, 4],
          [globalThis, 5],
          [this, 6]
        ]);
        this._idPool = [];
        this.exited = false;
        let offset = 4096;
        const strPtr = (str) => {
          const ptr = offset;
          const bytes = encoder.encode(str + "\0");
          new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
          offset += bytes.length;
          if (offset % 8 !== 0) {
            offset += 8 - offset % 8;
          }
          return ptr;
        };
        const argc = this.argv.length;
        const argvPtrs = [];
        this.argv.forEach((arg) => {
          argvPtrs.push(strPtr(arg));
        });
        argvPtrs.push(0);
        const keys = Object.keys(this.env).sort();
        keys.forEach((key) => {
          argvPtrs.push(strPtr(`${key}=${this.env[key]}`));
        });
        argvPtrs.push(0);
        const argv = offset;
        argvPtrs.forEach((ptr) => {
          this.mem.setUint32(offset, ptr, true);
          this.mem.setUint32(offset + 4, 0, true);
          offset += 8;
        });
        const wasmMinDataAddr = 4096 + 8192;
        if (offset >= wasmMinDataAddr) {
          throw new Error("total length of command line and environment variables exceeds limit");
        }
        this._inst.exports.run(argc, argv);
        if (this.exited) {
          this._resolveExitPromise();
        }
        await this._exitPromise;
      }
      _resume() {
        if (this.exited) {
          throw new Error("Go program has already exited");
        }
        this._inst.exports.resume();
        if (this.exited) {
          this._resolveExitPromise();
        }
      }
      _makeFuncWrapper(id) {
        const go2 = this;
        return function() {
          const event = { id, this: this, args: arguments };
          go2._pendingEvent = event;
          go2._resume();
          return event.result;
        };
      }
    };
  })();

  // src/kiwotigo-wasm-bridge.js
  var go = new Go();
  var __kiwotiGo = WebAssembly.instantiateStreaming(
    fetch("kiwotigo.wasm"),
    go.importObject
  ).then((result) => {
    go.run(result.instance);
  });
  var DefaultConfig = {
    gridWidth: 5,
    //10,
    gridHeight: 5,
    //10,
    gridOuterPaddingX: 80,
    //25,
    gridOuterPaddingY: 80,
    //25,
    gridInnerPaddingX: 15,
    //6,
    gridInnerPaddingY: 15,
    //3,
    gridHexWidth: 15,
    //16,
    gridHexHeight: 15,
    //14,
    hexWidth: 10,
    //12, //24,
    hexHeight: 10,
    //12,
    hexPaddingX: 0,
    //5,  //3,
    hexPaddingY: 0,
    //5,  //3,
    fastGrowIterations: 5,
    //8, //10,
    minimalGrowIterations: 20,
    //120, //48,
    maxRegionSizeFactor: 3,
    divisibilityBy: 1,
    probabilityCreateRegionAt: 0.5
    //0.6,
  };
  function createContinent(cfg, onProgress) {
    return __kiwotiGo.then(
      () => {
        onProgress(0.1);
        return new Promise((resolve) => {
          __kiwotiGo_createContinent(
            {
              ...DefaultConfig,
              ...cfg
            },
            (progress) => {
              onProgress(0.1 + progress * 0.7);
            },
            (result) => {
              onProgress(0.8);
              const json = JSON.parse(result);
              onProgress(0.9);
              resolve(json);
            }
          );
        });
      }
    );
  }

  // src/kiwotigo-unite-islands.js
  var uniq = (arr) => Array.from(new Set(arr));
  function findIslands(continent) {
    const visitedRegions = /* @__PURE__ */ new Set();
    const crawlIsland = (regionId) => {
      visitedRegions.add(regionId);
      const { neighbors } = continent.regions[regionId];
      return [
        regionId,
        ...neighbors.filter((neighborId) => !visitedRegions.has(neighborId)).map((neighborId) => crawlIsland(neighborId)).flat()
      ];
    };
    let islands = [];
    continent.regions.forEach((region) => {
      if (!visitedRegions.has(region.id)) {
        islands.push(crawlIsland(region.id));
      }
    });
    islands = islands.map(uniq);
    const regions = continent.regions.map((region) => {
      let islandId;
      for (let i = 0; i < islands.length; i++) {
        if (islands[i].includes(region.id)) {
          islandId = i;
          break;
        }
      }
      return {
        ...region,
        islandId
      };
    });
    return {
      ...continent,
      islands,
      regions
    };
  }
  var calcDistance = (from, to) => Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  var calcRegionDistances = ({ centerPoint: from }, regions) => regions.map(({ centerPoint: to }) => calcDistance(from, to));
  var findMinIndex = (arr) => {
    let min2 = arr[0];
    let minIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < min2) {
        min2 = arr[i];
        minIndex = i;
      }
    }
    return minIndex;
  };
  var findRegionsWithinOuterRange = ({
    continent,
    exlcudeIslands,
    includeIslands,
    exlcudeRegions,
    from,
    range,
    maxRange
  }) => continent.regions.filter(
    (region) => !exlcudeRegions.includes(region.id) && !exlcudeIslands.includes(region.islandId) && (!includeIslands || includeIslands.includes(region.islandId))
  ).filter(({ centerPoint: to }) => {
    const distance = calcDistance(from, to);
    return distance <= maxRange && distance - to.oR <= range;
  }).map((region) => region.id);
  function makeNewConnections(regions, connections) {
    connections.forEach(([from, to]) => {
      regions[from].neighbors.push(to);
      regions[to].neighbors.push(from);
    });
    regions.forEach((region) => {
      region.neighbors = uniq(region.neighbors);
    });
  }
  function connectIslands(continent, config) {
    const cfg = {
      enableExtendedConnections: true,
      maxExtendedOuterRangeFactor: 4,
      ...config
    };
    let islands = [...continent.islands];
    while (islands.length > 1) {
      const [curIsland, ...otherIslands] = islands;
      const distancesToOtherIslands = curIsland.map((regionId) => {
        const region = continent.regions[regionId];
        const islandDistances = otherIslands.map(
          (otherIsland, otherIslandsIndex) => {
            const otherRegions = otherIsland.map((rId) => continent.regions[rId]);
            const distancesToOtherRegions = calcRegionDistances(
              region,
              otherRegions
            );
            const idx = findMinIndex(distancesToOtherRegions);
            return {
              regionId: otherRegions[idx].id,
              distance: distancesToOtherRegions[idx],
              otherIslandsIndex
            };
          }
        );
        const minIndex2 = findMinIndex(
          islandDistances.map(({ distance }) => distance)
        );
        return {
          regionFrom: regionId,
          regionTo: islandDistances[minIndex2].regionId,
          distance: islandDistances[minIndex2].distance,
          otherIslandsIndex: islandDistances[minIndex2].otherIslandsIndex,
          islandDistances
        };
      });
      const minIndex = findMinIndex(
        distancesToOtherIslands.map(({ distance }) => distance)
      );
      const nearest = distancesToOtherIslands[minIndex];
      const connections = [[nearest.regionFrom, nearest.regionTo]];
      if (cfg.enableExtendedConnections) {
        const extendedConnections = [
          ...findRegionsWithinOuterRange({
            continent,
            exlcudeRegions: [nearest.regionFrom, nearest.regionTo],
            exlcudeIslands: [continent.regions[nearest.regionFrom].islandId],
            from: continent.regions[nearest.regionFrom].centerPoint,
            range: nearest.distance,
            maxRange: continent.regions[nearest.regionFrom].centerPoint.oR * cfg.maxExtendedOuterRangeFactor
          }).map((id) => [nearest.regionFrom, id]),
          ...findRegionsWithinOuterRange({
            continent,
            exlcudeRegions: [nearest.regionFrom, nearest.regionTo],
            exlcudeIslands: [continent.regions[nearest.regionTo].islandId],
            // includeIslands: [continent.regions[nearest.regionFrom].islandId],
            from: continent.regions[nearest.regionTo].centerPoint,
            range: nearest.distance,
            maxRange: continent.regions[nearest.regionTo].centerPoint.oR * cfg.maxExtendedOuterRangeFactor
          }).map((id) => [nearest.regionTo, id])
        ];
        connections.push(...extendedConnections);
        makeNewConnections(continent.regions, connections);
      } else {
        makeNewConnections(continent.regions, connections);
      }
      curIsland.push(...otherIslands[nearest.otherIslandsIndex]);
      otherIslands.splice(nearest.otherIslandsIndex, 1);
      islands = [curIsland, ...otherIslands];
    }
    return continent;
  }
  var findAndConnectAllIslands = (continent, config) => connectIslands(findIslands(continent), config);

  // src/kiwotigo.worker.js
  var DefaultConfig2 = {
    gridWidth: 7,
    gridHeight: 7,
    gridOuterPaddingY: 80,
    gridInnerPaddingX: 15,
    gridInnerPaddingY: 15,
    gridHexWidth: 15,
    gridHexHeight: 15,
    hexWidth: 10,
    hexHeight: 10,
    hexPaddingX: 0,
    hexPaddingY: 0,
    minimalGrowIterations: 20,
    fastGrowIterations: 5,
    maxRegionSizeFactor: 3,
    probabilityCreateRegionAt: 0.5,
    enableExtendedConnections: true,
    maxExtendedOuterRangeFactor: 4,
    canvasMargin: 100
  };
  var min = (a, b) => a < b ? a : b;
  var max = (a, b) => a > b ? a : b;
  var getBoundingBox = (regions) => {
    const anyCenterPoint = regions[0].centerPoint;
    let top = anyCenterPoint.y;
    let bottom = anyCenterPoint.y;
    let left = anyCenterPoint.x;
    let right = anyCenterPoint.x;
    regions.forEach(({ centerPoint: cP, fullPath }) => {
      top = min(top, cP.y - cP.oR);
      bottom = max(bottom, cP.y + cP.oR);
      left = min(left, cP.x - cP.oR);
      right = max(right, cP.x + cP.oR);
      const len = fullPath.length >> 1;
      for (let i = 0; i < len; i++) {
        const x = fullPath[i << 1];
        const y = fullPath[(i << 1) + 1];
        top = min(top, y);
        bottom = max(bottom, y);
        left = min(left, x);
        right = max(right, x);
      }
    });
    return {
      top,
      bottom,
      left,
      right,
      width: right - left,
      height: bottom - top
    };
  };
  var calcRegionBoundingBox = ({ centerPoint: cP, fullPath }) => {
    let top = cP.y;
    let bottom = cP.y;
    let left = cP.x;
    let right = cP.x;
    const len = fullPath.length >> 1;
    for (let i = 0; i < len; i++) {
      const x = fullPath[i << 1];
      const y = fullPath[(i << 1) + 1];
      top = min(top, y);
      bottom = max(bottom, y);
      left = min(left, x);
      right = max(right, x);
    }
    return {
      top,
      bottom,
      left,
      right,
      width: right - left,
      height: bottom - top
    };
  };
  var transformAllCoords = (regions, transformer) => {
    const transformPath = (path) => {
      const len = path.length >> 1;
      for (let i = 0; i < len; i++) {
        const xi = i << 1;
        path.splice(xi, 2, ...transformer(path[xi], path[xi + 1]));
      }
    };
    regions.forEach(({ centerPoint, fullPath, basePath }) => {
      const v = transformer(centerPoint.x, centerPoint.y);
      centerPoint.x = v[0];
      centerPoint.y = v[1];
      transformPath(fullPath);
      transformPath(basePath);
    });
  };
  var getCoordId = (x, y) => `${Math.round(y)};${Math.round(x)}`;
  var PathCoordLocation = class {
    constructor(regionId, pathType, pathIndex) {
      this.regionId = regionId;
      this.pathType = pathType;
      this.pathIndex = pathIndex;
    }
  };
  var PathCoord = class {
    constructor(id, isBaseline) {
      this.id = id;
      this.locations = [];
      this.coords = null;
      this.isBaseline = isBaseline;
    }
    addLocation(pathLocation) {
      this.locations.push(pathLocation);
    }
    getCoordsIndices(regions, pLoc, coordsOffset = 0) {
      const p = regions[pLoc.regionId][pLoc.pathType];
      const pLen = p.length;
      let xIndex = (pLoc.pathIndex + coordsOffset * 2) % pLen;
      if (xIndex < 0) {
        xIndex += pLen;
      }
      let yIndex = (pLoc.pathIndex + (coordsOffset * 2 + 1)) % p.length;
      if (yIndex < 0) {
        yIndex += pLen;
      }
      return [xIndex, yIndex];
    }
    getCoords(regions, pLoc, coordsOffset = 0) {
      const p = regions[pLoc.regionId][pLoc.pathType];
      const [xIndex, yIndex] = this.getCoordsIndices(regions, pLoc, coordsOffset);
      return [p[xIndex], p[yIndex]];
    }
    copyCoords(regions, pLoc) {
      const [xIndex, yIndex] = this.getCoordsIndices(regions, pLoc, 0);
      const p = regions[pLoc.regionId][pLoc.pathType];
      p[xIndex] = this.coords[0];
      p[yIndex] = this.coords[1];
    }
    getCoastType() {
      if (this.isBaseline) {
        return "city";
      }
      return this.locations.length === 1 ? "seaside" : "inland";
    }
    calcSmoothCoords(regions, weights, coastTypesFilter) {
      const values = [];
      const coastType = this.getCoastType();
      if (coastTypesFilter && !coastTypesFilter.includes(coastType)) {
        return;
      }
      this.locations.forEach((pLoc) => {
        weights[coastType].forEach(([offset, weight]) => {
          const [x, y] = this.getCoords(regions, pLoc, offset);
          values.push([x, y, weight]);
        });
      });
      const xSum = values.reduce((sum, [val, , w]) => val * w + sum, 0);
      const ySum = values.reduce((sum, [, val, w]) => val * w + sum, 0);
      const wSum = values.reduce((sum, [, , w]) => w + sum, 0);
      this.coords = [xSum / wSum, ySum / wSum];
    }
    writeCoordsToLocations(regions) {
      this.locations.forEach((pLoc) => {
        this.copyCoords(regions, pLoc);
      });
    }
  };
  var collectPathCoords = (regionId, pathType, path, coords) => {
    const len = path.length;
    for (let i = 0; i < len; i += 2) {
      const coordId = getCoordId(path[i], path[i + 1]);
      let pathCoord = coords.get(coordId);
      if (!pathCoord) {
        pathCoord = new PathCoord(coordId, pathType === "basePath");
        coords.set(coordId, pathCoord);
      }
      pathCoord.addLocation(new PathCoordLocation(regionId, pathType, i));
    }
  };
  var smoothAllPaths = (regions) => {
    const coords = /* @__PURE__ */ new Map();
    regions.forEach(({ id, fullPath, basePath }) => {
      collectPathCoords(id, "fullPath", fullPath, coords);
      collectPathCoords(id, "basePath", basePath, coords);
    });
    const weights = {
      city: [
        // [-8, 0.25],
        // [-5, 0.5],
        // [-2, 0.75],
        // [0, 1.5],
        // [2, 0.75],
        // [5, 0.5],
        // [8, 0.25],
        [-5, 0.1],
        [-4, 0.2],
        [-3, 0.3],
        [-2, 0.5],
        [-1, 0.8],
        [0, 1],
        [1, 0.8],
        [2, 0.5],
        [3, 0.3],
        [4, 0.2],
        [5, 0.1]
      ],
      inland: [
        // [-3, 0.309],
        // [-2, 0.588],
        // [-1, 0.809],
        // [0, 1.0],
        // [1, 0.809],
        // [2, 0.588],
        // [3, 0.309],
        [-1, 0.1],
        [1, 1],
        [2, 0.2]
      ],
      seaside: [
        [-1, 0.3],
        [1, 1],
        [2, 0.3]
        // [-1, 0.5],
        // [0, 0.7],
        // [1, 0.3],
        // [3, 0.2],
        // [4, 0.1],
      ]
    };
    for (const pathCoord of coords.values()) {
      pathCoord.calcSmoothCoords(regions, weights);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.writeCoordsToLocations(regions);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.calcSmoothCoords(regions, weights);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.writeCoordsToLocations(regions);
    }
  };
  var flattenPathCoords = (path) => path.flatMap((vec) => [vec.x, vec.y]);
  var convertToIntermediateContinentalFormat = (config, continent) => {
    const regions = continent.regions.map((region, id) => ({
      id,
      basePath: flattenPathCoords(region.basePath),
      fullPath: flattenPathCoords(region.fullPath),
      centerPoint: continent.centerPoints[id],
      neighbors: continent.neighbors[id],
      size: continent.regionSizes[id]
    }));
    smoothAllPaths(regions);
    const bBox = getBoundingBox(regions);
    const offsetX = bBox.left - config.canvasMargin;
    const offsetY = bBox.top - config.canvasMargin;
    transformAllCoords(regions, (x, y) => [x - offsetX, y - offsetY]);
    const canvasWidth = bBox.width + 2 * config.canvasMargin;
    const canvasHeight = bBox.height + 2 * config.canvasMargin;
    regions.forEach((region) => {
      region.bBox = calcRegionBoundingBox(region);
    });
    return {
      regions,
      canvasWidth,
      canvasHeight
    };
  };
  var _postProgress = (id) => (progress) => postMessage({ id, progress, type: "progress" });
  self.onmessage = (e) => {
    const { id, originData, ...data } = e.data;
    const postProgress = _postProgress(id);
    let config;
    let afterCreateContinent;
    if (originData) {
      const parsedOriginData = typeof originData === "string" ? JSON.parse(originData) : originData;
      config = { ...DefaultConfig2, ...parsedOriginData.config, ...data };
      afterCreateContinent = Promise.resolve(parsedOriginData);
    } else {
      config = { ...DefaultConfig2, ...data };
      afterCreateContinent = createContinent(
        config,
        (progress) => postProgress(progress * 0.7)
      );
    }
    afterCreateContinent.then((result) => {
      postProgress(0.7);
      const originData2 = JSON.stringify({
        config,
        continent: result.continent
      });
      let continent;
      try {
        continent = convertToIntermediateContinentalFormat(
          config,
          result.continent
        );
        postProgress(0.8);
        continent = findAndConnectAllIslands(continent, config);
      } catch (err) {
        console.error("kiwotigo post-processing panic!", err);
      }
      return {
        id,
        config,
        continent,
        originData: originData2
      };
    }).then((result) => postMessage({ ...result, type: "result" }));
  };
})();
