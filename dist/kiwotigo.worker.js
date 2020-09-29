!function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?r(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function s(e,t){return c(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,i=!1,o=void 0;try{for(var s,a=e[Symbol.iterator]();!(r=(s=a.next()).done)&&(n.push(s.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==a.return||a.return()}finally{if(i)throw o}}return n}(e,t)||u(e,t)||d()}function a(e){return function(e){if(Array.isArray(e))return h(e)}(e)||l(e)||u(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function c(e){if(Array.isArray(e))return e}function l(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function u(e,t){if(e){if("string"==typeof e)return h(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?h(e,t):void 0}}function h(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function d(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function f(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=u(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,s=!0,a=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return s=e.done,e},e:function(e){a=!0,o=e},f:function(){try{s||null==n.return||n.return()}finally{if(a)throw o}}}}(()=>{if("undefined"!=typeof global);else if("undefined"!=typeof window)window.global=window;else{if("undefined"==typeof self)throw new Error("cannot export Go (neither global, window nor self is defined)");self.global=self}if(global.require||"undefined"==typeof require||(global.require=require),!global.fs&&global.require){const e=require("fs");0!==Object.keys(e)&&(global.fs=e)}const e=()=>{const e=new Error("not implemented");return e.code="ENOSYS",e};if(!global.fs){let t="";global.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1},writeSync(e,r){t+=n.decode(r);const i=t.lastIndexOf("\n");return-1!=i&&(console.log(t.substr(0,i)),t=t.substr(i+1)),r.length},write(t,n,r,i,o,s){if(0!==r||i!==n.length||null!==o)return void s(e());s(null,this.writeSync(t,n))},chmod(t,n,r){r(e())},chown(t,n,r,i){i(e())},close(t,n){n(e())},fchmod(t,n,r){r(e())},fchown(t,n,r,i){i(e())},fstat(t,n){n(e())},fsync(e,t){t(null)},ftruncate(t,n,r){r(e())},lchown(t,n,r,i){i(e())},link(t,n,r){r(e())},lstat(t,n){n(e())},mkdir(t,n,r){r(e())},open(t,n,r,i){i(e())},read(t,n,r,i,o,s){s(e())},readdir(t,n){n(e())},readlink(t,n){n(e())},rename(t,n,r){r(e())},rmdir(t,n){n(e())},stat(t,n){n(e())},symlink(t,n,r){r(e())},truncate(t,n,r){r(e())},unlink(t,n){n(e())},utimes(t,n,r,i){i(e())}}}if(global.process||(global.process={getuid:()=>-1,getgid:()=>-1,geteuid:()=>-1,getegid:()=>-1,getgroups(){throw e()},pid:-1,ppid:-1,umask(){throw e()},cwd(){throw e()},chdir(){throw e()}}),!global.crypto){const e=require("crypto");global.crypto={getRandomValues(t){e.randomFillSync(t)}}}global.performance||(global.performance={now(){const[e,t]=process.hrtime();return 1e3*e+t/1e6}}),global.TextEncoder||(global.TextEncoder=require("util").TextEncoder),global.TextDecoder||(global.TextDecoder=require("util").TextDecoder);const t=new TextEncoder("utf-8"),n=new TextDecoder("utf-8");if(global.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=e=>{0!==e&&console.warn("exit code:",e)},this._exitPromise=new Promise(e=>{this._resolveExitPromise=e}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const e=(e,t)=>{this.mem.setUint32(e+0,t,!0),this.mem.setUint32(e+4,Math.floor(t/4294967296),!0)},r=e=>this.mem.getUint32(e+0,!0)+4294967296*this.mem.getInt32(e+4,!0),i=e=>{const t=this.mem.getFloat64(e,!0);if(0===t)return;if(!isNaN(t))return t;const n=this.mem.getUint32(e,!0);return this._values[n]},o=(e,t)=>{const n=2146959360;if("number"==typeof t&&0!==t)return isNaN(t)?(this.mem.setUint32(e+4,n,!0),void this.mem.setUint32(e,0,!0)):void this.mem.setFloat64(e,t,!0);if(void 0===t)return void this.mem.setFloat64(e,0,!0);let r=this._ids.get(t);void 0===r&&(r=this._idPool.pop(),void 0===r&&(r=this._values.length),this._values[r]=t,this._goRefCounts[r]=0,this._ids.set(t,r)),this._goRefCounts[r]++;let i=0;switch(typeof t){case"object":null!==t&&(i=1);break;case"string":i=2;break;case"symbol":i=3;break;case"function":i=4}this.mem.setUint32(e+4,n|i,!0),this.mem.setUint32(e,r,!0)},s=e=>{const t=r(e+0),n=r(e+8);return new Uint8Array(this._inst.exports.mem.buffer,t,n)},a=e=>{const t=r(e+0),n=r(e+8),o=new Array(n);for(let e=0;e<n;e++)o[e]=i(t+8*e);return o},c=e=>{const t=r(e+0),i=r(e+8);return n.decode(new DataView(this._inst.exports.mem.buffer,t,i))},l=Date.now()-performance.now();this.importObject={go:{"runtime.wasmExit":e=>{const t=this.mem.getInt32(e+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(t)},"runtime.wasmWrite":e=>{const t=r(e+8),n=r(e+16),i=this.mem.getInt32(e+24,!0);fs.writeSync(t,new Uint8Array(this._inst.exports.mem.buffer,n,i))},"runtime.resetMemoryDataView":e=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":t=>{e(t+8,1e6*(l+performance.now()))},"runtime.walltime1":t=>{const n=(new Date).getTime();e(t+8,n/1e3),this.mem.setInt32(t+16,n%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":e=>{const t=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(t,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(t);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},r(e+8)+1)),this.mem.setInt32(e+16,t,!0)},"runtime.clearTimeoutEvent":e=>{const t=this.mem.getInt32(e+8,!0);clearTimeout(this._scheduledTimeouts.get(t)),this._scheduledTimeouts.delete(t)},"runtime.getRandomData":e=>{crypto.getRandomValues(s(e+8))},"syscall/js.finalizeRef":e=>{const t=this.mem.getUint32(e+8,!0);if(this._goRefCounts[t]--,0===this._goRefCounts[t]){const e=this._values[t];this._values[t]=null,this._ids.delete(e),this._idPool.push(t)}},"syscall/js.stringVal":e=>{o(e+24,c(e+8))},"syscall/js.valueGet":e=>{const t=Reflect.get(i(e+8),c(e+16));e=this._inst.exports.getsp(),o(e+32,t)},"syscall/js.valueSet":e=>{Reflect.set(i(e+8),c(e+16),i(e+32))},"syscall/js.valueDelete":e=>{Reflect.deleteProperty(i(e+8),c(e+16))},"syscall/js.valueIndex":e=>{o(e+24,Reflect.get(i(e+8),r(e+16)))},"syscall/js.valueSetIndex":e=>{Reflect.set(i(e+8),r(e+16),i(e+24))},"syscall/js.valueCall":e=>{try{const t=i(e+8),n=Reflect.get(t,c(e+16)),r=a(e+32),s=Reflect.apply(n,t,r);e=this._inst.exports.getsp(),o(e+56,s),this.mem.setUint8(e+64,1)}catch(t){o(e+56,t),this.mem.setUint8(e+64,0)}},"syscall/js.valueInvoke":e=>{try{const t=i(e+8),n=a(e+16),r=Reflect.apply(t,void 0,n);e=this._inst.exports.getsp(),o(e+40,r),this.mem.setUint8(e+48,1)}catch(t){o(e+40,t),this.mem.setUint8(e+48,0)}},"syscall/js.valueNew":e=>{try{const t=i(e+8),n=a(e+16),r=Reflect.construct(t,n);e=this._inst.exports.getsp(),o(e+40,r),this.mem.setUint8(e+48,1)}catch(t){o(e+40,t),this.mem.setUint8(e+48,0)}},"syscall/js.valueLength":t=>{e(t+16,parseInt(i(t+8).length))},"syscall/js.valuePrepareString":n=>{const r=t.encode(String(i(n+8)));o(n+16,r),e(n+24,r.length)},"syscall/js.valueLoadString":e=>{const t=i(e+8);s(e+16).set(t)},"syscall/js.valueInstanceOf":e=>{this.mem.setUint8(e+24,i(e+8)instanceof i(e+16)?1:0)},"syscall/js.copyBytesToGo":t=>{const n=s(t+8),r=i(t+32);if(!(r instanceof Uint8Array||r instanceof Uint8ClampedArray))return void this.mem.setUint8(t+48,0);const o=r.subarray(0,n.length);n.set(o),e(t+40,o.length),this.mem.setUint8(t+48,1)},"syscall/js.copyBytesToJS":t=>{const n=i(t+8),r=s(t+16);if(!(n instanceof Uint8Array||n instanceof Uint8ClampedArray))return void this.mem.setUint8(t+48,0);const o=r.subarray(0,n.length);n.set(o),e(t+40,o.length),this.mem.setUint8(t+48,1)},debug:e=>{console.log(e)}}}}async run(e){this._inst=e,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,global,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[global,5],[this,6]]),this._idPool=[],this.exited=!1;let n=4096;const r=e=>{const r=n,i=t.encode(e+"\0");return new Uint8Array(this.mem.buffer,n,i.length).set(i),n+=i.length,n%8!=0&&(n+=8-n%8),r},i=this.argv.length,o=[];this.argv.forEach(e=>{o.push(r(e))}),o.push(0);Object.keys(this.env).sort().forEach(e=>{o.push(r(`${e}=${this.env[e]}`))}),o.push(0);const s=n;o.forEach(e=>{this.mem.setUint32(n,e,!0),this.mem.setUint32(n+4,0,!0),n+=8}),this._inst.exports.run(i,s),this.exited&&this._resolveExitPromise(),await this._exitPromise}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(e){const t=this;return function(){const n={id:e,this:this,args:arguments};return t._pendingEvent=n,t._resume(),n.result}}},global.require&&global.require.main===module&&global.process&&global.process.versions&&!global.process.versions.electron){process.argv.length<3&&(console.error("usage: go_js_wasm_exec [wasm binary] [arguments]"),process.exit(1));const e=new Go;e.argv=process.argv.slice(2),e.env=Object.assign({TMPDIR:require("os").tmpdir()},process.env),e.exit=process.exit,WebAssembly.instantiate(fs.readFileSync(process.argv[2]),e.importObject).then(t=>(process.on("exit",t=>{0!==t||e.exited||(e._pendingEvent={id:0},e._resume())}),e.run(t.instance))).catch(e=>{console.error(e),process.exit(1)})}})();var g=new Go,m=WebAssembly.instantiateStreaming(fetch("kiwotigo.wasm"),g.importObject).then((function(e){g.run(e.instance)})),p={gridWidth:10,gridHeight:10,gridOuterPaddingX:25,gridOuterPaddingY:25,gridInnerPaddingX:6,gridInnerPaddingY:3,gridHexWidth:16,gridHexHeight:14,hexWidth:12,hexHeight:12,hexPaddingX:0,hexPaddingY:0,fastGrowIterations:8,minimalGrowIterations:120,maxRegionSizeFactor:3,divisibilityBy:1,probabilityCreateRegionAt:.6};var y=function(e){return Array.from(new Set(e))};function v(e){var t=new Set,n=[];e.regions.forEach((function(r){t.has(r.id)||n.push(function n(r){t.add(r);var i=e.regions[r].neighbors;return[r].concat(a(i.filter((function(e){return!t.has(e)})).map((function(e){return n(e)})).flat()))}(r.id))})),n=n.map(y);var r=e.regions.map((function(e){for(var t,r=0;r<n.length;r++)if(n[r].includes(e.id)){t=r;break}return i(i({},e),{},{islandId:t})}));return i(i({},e),{},{islands:n,regions:r})}var b=function(e,t){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))},x=function(e){for(var t=e[0],n=0,r=1;r<e.length;r++)e[r]<t&&(t=e[r],n=r);return n},w=function(e){var t=e.continent,n=e.exlcudeIslands,r=e.includeIslands,i=e.exlcudeRegions,o=e.from,s=e.range,a=e.maxRange;return t.regions.filter((function(e){return!i.includes(e.id)&&!n.includes(e.islandId)&&(!r||r.includes(e.islandId))})).filter((function(e){var t=e.centerPoint,n=b(o,t);return n<=a&&n-t.oR<=s})).map((function(e){return e.id}))};function _(e,t){t.forEach((function(t){var n=s(t,2),r=n[0],i=n[1];e[r].neighbors.push(i),e[i].neighbors.push(r)})),e.forEach((function(e){e.neighbors=y(e.neighbors)}))}function P(e,t){for(var n=i({enableExtendedConnections:!0,maxExtendedOuterRangeFactor:4},t),r=a(e.islands),o=function(){var t,i=c(t=r)||l(t)||u(t)||d(),o=i[0],s=i.slice(1),h=o.map((function(t){var n=e.regions[t],r=s.map((function(t,r){var i,o,s=t.map((function(t){return e.regions[t]})),a=(i=s,o=n.centerPoint,i.map((function(e){var t=e.centerPoint;return b(o,t)}))),c=x(a);return{regionId:s[c].id,distance:a[c],otherIslandsIndex:r}})),i=x(r.map((function(e){return e.distance})));return{regionFrom:t,regionTo:r[i].regionId,distance:r[i].distance,otherIslandsIndex:r[i].otherIslandsIndex,islandDistances:r}})),f=x(h.map((function(e){return e.distance}))),g=h[f],m=[[g.regionFrom,g.regionTo]];if(n.enableExtendedConnections){var p=[].concat(a(w({continent:e,exlcudeRegions:[g.regionFrom,g.regionTo],exlcudeIslands:[e.regions[g.regionFrom].islandId],from:e.regions[g.regionFrom].centerPoint,range:g.distance,maxRange:e.regions[g.regionFrom].centerPoint.oR*n.maxExtendedOuterRangeFactor}).map((function(e){return[g.regionFrom,e]}))),a(w({continent:e,exlcudeRegions:[g.regionFrom,g.regionTo],exlcudeIslands:[e.regions[g.regionTo].islandId],from:e.regions[g.regionTo].centerPoint,range:g.distance,maxRange:e.regions[g.regionTo].centerPoint.oR*n.maxExtendedOuterRangeFactor}).map((function(e){return[g.regionTo,e]}))));m.push.apply(m,a(p)),_(e.regions,m)}else _(e.regions,m);o.push.apply(o,a(s[g.otherIslandsIndex])),s.splice(g.otherIslandsIndex,1),r=[o].concat(a(s))};r.length>1;)o();return e}var I={gridWidth:7,gridHeight:7,gridOuterPaddingX:40,gridOuterPaddingY:40,gridInnerPaddingX:8,gridInnerPaddingY:8,gridHexWidth:15,gridHexHeight:15,hexWidth:10,hexHeight:10,hexPaddingX:0,hexPaddingY:0,minimalGrowIterations:100,fastGrowIterations:4,maxRegionSizeFactor:3,probabilityCreateRegionAt:.7,enableExtendedConnections:!0,maxExtendedOuterRangeFactor:4,canvasMargin:10},O=function(e,t){return e<t?e:t},j=function(e,t){return e>t?e:t},E=function t(n,r,i){e(this,t),this.regionId=n,this.pathType=r,this.pathIndex=i},T=function(){function n(t,r){e(this,n),this.id=t,this.locations=[],this.coords=null,this.isBaseline=r}var r,i,o;return r=n,(i=[{key:"addLocation",value:function(e){this.locations.push(e)}},{key:"getCoordsIndices",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=e[t.regionId][t.pathType],i=r.length,o=(t.pathIndex+2*n)%i;o<0&&(o+=i);var s=(t.pathIndex+(2*n+1))%r.length;return s<0&&(s+=i),[o,s]}},{key:"getCoords",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=e[t.regionId][t.pathType],i=this.getCoordsIndices(e,t,n),o=s(i,2),a=o[0],c=o[1];return[r[a],r[c]]}},{key:"copyCoords",value:function(e,t){var n=s(this.getCoordsIndices(e,t,0),2),r=n[0],i=n[1],o=e[t.regionId][t.pathType];o[r]=this.coords[0],o[i]=this.coords[1]}},{key:"getCoastType",value:function(){return this.isBaseline?"city":1===this.locations.length?"seaside":"inland"}},{key:"calcSmoothCoords",value:function(e,t){var n=this,r=[],i=this.getCoastType();this.locations.forEach((function(o){t[i].forEach((function(t){var i=s(t,2),a=i[0],c=i[1],l=s(n.getCoords(e,o,a),2),u=l[0],h=l[1];r.push([u,h,c])}))}));var o=r.reduce((function(e,t){var n=s(t,3);return n[0]*n[2]+e}),0),a=r.reduce((function(e,t){var n=s(t,3);return n[1]*n[2]+e}),0),c=r.reduce((function(e,t){return s(t,3)[2]+e}),0);this.coords=[o/c,a/c]}},{key:"writeCoordsToLocations",value:function(e){var t=this;this.locations.forEach((function(n){t.copyCoords(e,n)}))}}])&&t(r.prototype,i),o&&t(r,o),n}(),R=function(e,t,n,r){for(var i,o,s=n.length,a=0;a<s;a+=2){var c=(i=n[a],o=n[a+1],"".concat(Math.round(o),";").concat(Math.round(i))),l=r.get(c);l||(l=new T(c,"basePath"===t),r.set(c,l)),l.addLocation(new E(e,t,a))}},S=function(e){return e.flatMap((function(e){return[e.x,e.y]}))},C=function(e,t){var n=t.regions.map((function(e,n){return{id:n,basePath:S(e.basePath),fullPath:S(e.fullPath),centerPoint:t.centerPoints[n],neighbors:t.neighbors[n],size:t.regionSizes[n]}}));!function(e){var t=new Map;e.forEach((function(e){var n=e.id,r=e.fullPath,i=e.basePath;R(n,"fullPath",r,t),R(n,"basePath",i,t)}));var n,r=f(t.values());try{for(r.s();!(n=r.n()).done;)n.value.calcSmoothCoords(e,{city:[[-8,.25],[-5,.5],[-2,.75],[0,1.5],[2,.75],[5,.5],[8,.25]],inland:[[-3,.309],[-2,.588],[-1,.809],[0,1],[1,.809],[2,.588],[3,.309]],seaside:[[-1,.5],[0,.7],[1,.3],[3,.2],[4,.1]]})}catch(e){r.e(e)}finally{r.f()}var i,o=f(t.values());try{for(o.s();!(i=o.n()).done;)i.value.writeCoordsToLocations(e)}catch(e){o.e(e)}finally{o.f()}}(n);var r=function(e){var t=e[0].centerPoint,n=t.y,r=t.y,i=t.x,o=t.x;return e.forEach((function(e){var t=e.centerPoint,s=e.fullPath;n=O(n,t.y-t.oR),r=j(r,t.y+t.oR),i=O(i,t.x-t.oR),o=j(o,t.x+t.oR);for(var a=s.length>>1,c=0;c<a;c++){var l=s[c<<1],u=s[1+(c<<1)];n=O(n,u),r=j(r,u),i=O(i,l),o=j(o,l)}})),{top:n,bottom:r,left:i,right:o,width:o-i,height:r-n}}(n),i=r.left-e.canvasMargin,o=r.top-e.canvasMargin;!function(e,t){var n=function(e){for(var n=e.length>>1,r=0;r<n;r++){var i=r<<1;e.splice.apply(e,[i,2].concat(a(t(e[i],e[i+1]))))}};e.forEach((function(e){var r=e.centerPoint,i=e.fullPath,o=e.basePath,s=t(r.x,r.y);r.x=s[0],r.y=s[1],n(i),n(o)}))}(n,(function(e,t){return[e-i,t-o]}));var s=r.width+2*e.canvasMargin,c=r.height+2*e.canvasMargin;return n.forEach((function(e){e.bBox=function(e){for(var t=e.centerPoint,n=e.fullPath,r=t.y,i=t.y,o=t.x,s=t.x,a=n.length>>1,c=0;c<a;c++){var l=n[c<<1],u=n[1+(c<<1)];r=O(r,u),i=j(i,u),o=O(o,l),s=j(s,l)}return{top:r,bottom:i,left:o,right:s,width:s-o,height:i-r}}(e)})),{regions:n,canvasWidth:s,canvasHeight:c}};self.onmessage=function(e){var t,n,r,s,a=e.data,c=a.id,l=a.originData,u=o(a,["id","originData"]),h=function(e){return function(t){return postMessage({id:e,progress:t,type:"progress"})}}(c);if(l){var d="string"==typeof l?JSON.parse(l):l;t=i(i(i({},I),d.config),u),n=Promise.resolve(d)}else t=i(i({},I),u),r=t,s=function(e){return h(.7*e)},n=m.then((function(){return s(.1),new Promise((function(e){__kiwotiGo_createContinent(i(i({},p),r),(function(e){s(.1+.7*e)}),(function(t){s(.8);var n=JSON.parse(t);s(.9),e(n)}))}))}));n.then((function(e){h(.7);var n,r=JSON.stringify({config:t,continent:e.continent});try{n=C(t,e.continent),h(.8),n=function(e,t){return P(v(e),t)}(n,t)}catch(e){console.error("kiwotigo post-processing panic!",e)}return{id:c,config:t,continent:n,originData:r}})).then((function(e){return postMessage(i(i({},e),{},{type:"result"}))}))}}();
//# sourceMappingURL=kiwotigo.worker.js.map
