(() => {
  // src/kiwotigo.js
  var worker;
  var lastBuild;
  var publishChannel;
  var config = {
    idPrefix: "kiwotigo-",
    broadcastChannelName: "kiwotigo",
    kiwotigoWorkerUrl: "kiwotigo.worker.js",
    kiwotigoWasmUrl: "kiwotigo.wasm"
  };
  var startBroadcasting = () => {
    if (!publishChannel && typeof BroadcastChannel !== "undefined") {
      publishChannel = new BroadcastChannel(config.broadcastChannelName);
      publishChannel.onmessage = ({ data }) => {
        if (data) {
          switch (data.type) {
            case "publishBuild":
              if (lastBuild) {
                publishChannel.postMessage(lastBuild);
              }
              break;
            case "ping":
              publishChannel.postMessage({ type: "pong" });
              break;
          }
        }
      };
      if (lastBuild) {
        publishChannel.postMessage(lastBuild);
      }
    }
  };
  var tmpResolvers = /* @__PURE__ */ new Map();
  var createMessageId = /* @__PURE__ */ (() => {
    let lastId = 0;
    return () => {
      ++lastId;
      return `${config.idPrefix}${lastId.toString(36)}`;
    };
  })();
  var initWorker = () => {
    worker = new Worker(config.kiwotigoWorkerUrl);
    worker.postMessage({ kiwotigoWasmUrl: config.kiwotigoWasmUrl });
    worker.onmessage = ({ data }) => {
      const { id, type } = data;
      const resolve = tmpResolvers.get(id);
      if (resolve) {
        switch (type) {
          case "progress":
            if (resolve.onProgressFn) {
              resolve.onProgressFn(data.progress);
            }
            break;
          case "result":
            tmpResolvers.delete(id);
            delete data.type;
            if (data.originData) {
              localStorage.setItem(
                "kiwotigoOriginData",
                typeof data.originData === "string" ? data.originData : JSON.stringify(data.originData)
              );
            }
            resolve.resolve(data);
            if (publishChannel) {
              lastBuild = { type: "build", data };
              publishChannel.postMessage(lastBuild);
            }
            break;
          default:
            console.warn("unknown message type:", type, data);
        }
      }
    };
  };
  var getWorker = () => {
    if (!worker) {
      initWorker();
    }
    return worker;
  };
  var build = (config2, onProgressFn) => new Promise((resolve) => {
    const id = createMessageId();
    tmpResolvers.set(id, { resolve, onProgressFn });
    getWorker().postMessage({ ...config2, id });
  });

  // src/kiwotigo-painter.js
  var DARK_THEME = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var REGION_OUTLINE_STROKE = DARK_THEME ? "#000" : "#a5a5a5";
  var REGION_BASE_PATH_FILL = DARK_THEME ? "#888" : "#e7e7e7";
  var REGION_FULL_PATH_FILL = DARK_THEME ? "#666" : "#f5f5f5";
  var REGION_RADIUS_STROKE = DARK_THEME ? "#999" : "#a9a9a9";
  var REGION_BBOX_STROKE = DARK_THEME ? "#333" : "#f0f0f0";
  var REGION_OUTER_RADIUS_STROKE = DARK_THEME ? "#444" : "#cacaca";
  var CONNECTION_STROKE = DARK_THEME ? "#c04" : "#f5b";
  var REGION_ID_TEXT_FILL = DARK_THEME ? "#ccc" : "#666";
  var REGION_ID_SHADOW = DARK_THEME ? "#777" : "#fff";
  function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function drawPath(ctx, regions, pathName, stroke = false) {
    regions.forEach((region) => {
      const path = region[pathName];
      ctx.beginPath();
      ctx.moveTo(path[0], path[1]);
      const len = path.length >> 1;
      for (let i = 1; i < len; i++) {
        ctx.lineTo(path[i << 1], path[(i << 1) + 1]);
      }
      ctx.closePath();
      ctx.fill();
      if (stroke) {
        ctx.stroke();
      }
    });
  }
  function drawRegions(ctx, continent, drawBasePath) {
    ctx.strokeStyle = REGION_OUTLINE_STROKE;
    ctx.lineWidth = 1;
    ctx.fillStyle = REGION_FULL_PATH_FILL;
    drawPath(ctx, continent.regions, "fullPath", true);
    if (drawBasePath) {
      ctx.fillStyle = REGION_BASE_PATH_FILL;
      drawPath(ctx, continent.regions, "basePath");
    }
  }
  function drawRegionsBase(ctx, continent) {
    ctx.lineWidth = 1;
    continent.regions.forEach(({ centerPoint: cp }) => {
      ctx.strokeStyle = REGION_RADIUS_STROKE;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.iR, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = REGION_OUTER_RADIUS_STROKE;
      ctx.setLineDash([5, 15, 25]);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.oR, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  var getRegion = (continent, regionIdx) => continent.regions[regionIdx];
  function drawRegionsConnections(ctx, continent) {
    ctx.setLineDash([]);
    ctx.strokeStyle = CONNECTION_STROKE;
    ctx.lineWidth = 3;
    const alreadyDrawnConnection = /* @__PURE__ */ new Set();
    continent.regions.forEach((region) => {
      region.neighbors.forEach((neighborId) => {
        const connectionId = region.id < neighborId ? `${region.id};${neighborId}` : `${neighborId};${region.id}`;
        if (!alreadyDrawnConnection.has(connectionId)) {
          alreadyDrawnConnection.add(connectionId);
          const otherRegion = getRegion(continent, neighborId);
          const isAnotherIsland = region.islandId !== otherRegion.islandId;
          ctx.setLineDash(isAnotherIsland ? [3, 6] : []);
          ctx.beginPath();
          ctx.moveTo(region.centerPoint.x, region.centerPoint.y);
          ctx.lineTo(otherRegion.centerPoint.x, otherRegion.centerPoint.y);
          ctx.closePath();
          ctx.stroke();
        }
      });
    });
    ctx.setLineDash([]);
  }
  function drawRegionIds(ctx, continent) {
    ctx.font = "bold 36px sans-serif";
    ctx.shadowColor = REGION_ID_SHADOW;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = REGION_ID_TEXT_FILL;
    continent.regions.forEach(({ centerPoint: { x, y } }, i) => {
      ctx.fillText(`${i}`, x, y);
    });
    ctx.shadowBlur = 0;
  }
  function drawBoundingBoxes(ctx, { regions }) {
    ctx.strokeStyle = REGION_BBOX_STROKE;
    regions.forEach(({ bBox }) => {
      ctx.beginPath();
      ctx.rect(bBox.left, bBox.top, bBox.width, bBox.height);
      ctx.stroke();
    });
  }
  function draw({ ctx, icf, ...cfg }) {
    clearCanvas(ctx);
    if (cfg.drawRegionBoundingBoxes) {
      drawBoundingBoxes(ctx, icf);
    }
    drawRegions(ctx, icf, cfg.drawRegionBasePaths);
    if (cfg.drawRegionsBase) {
      drawRegionsBase(ctx, icf);
    }
    if (cfg.drawRegionConnections) {
      drawRegionsConnections(ctx, icf);
    }
    if (cfg.drawRegionIds) {
      drawRegionIds(ctx, icf);
    }
  }

  // src/kiwotigo-demo.js
  var canvas = document.getElementById("kiwotigoCanvas");
  var canvasCtx = canvas.getContext("2d");
  var loadingMessages = [
    "I will now create a new world just for you ...",
    "Such a thing can take a while, though ...",
    "... each country must be carefully considered ...",
    "Hold on, it can't be much longer ...",
    "I'm almost finished, there's just a few final touches ..."
  ];
  var displayLoadingInfo = (html) => {
    document.querySelector(".loadingModal-info").innerHTML = html;
  };
  var currentLoadingMessageIdx = 0;
  var displayNextLoadingMessageHandle = 0;
  var showLoadingState = () => {
    displayLoadingInfo(loadingMessages[0]);
    currentLoadingMessageIdx = 1;
    document.querySelector(".loadingModal").classList.add("loading");
    clearInterval(displayNextLoadingMessageHandle);
    displayNextLoadingMessageHandle = setInterval(() => {
      displayLoadingInfo(loadingMessages[currentLoadingMessageIdx]);
      currentLoadingMessageIdx = (currentLoadingMessageIdx + 1) % loadingMessages.length;
    }, 5e3);
  };
  var displayProgress = (progress) => {
    const maxWidth = document.querySelector(".loadingModal-content").getBoundingClientRect().width;
    const el = document.querySelector(".loadingModal-progress");
    el.style.width = `${Math.round(progress * maxWidth)}px`;
  };
  var hideLoadingState = () => {
    clearInterval(displayNextLoadingMessageHandle);
    displayProgress(1);
    setTimeout(() => {
      document.querySelector(".loadingModal").classList.remove("loading");
    }, 500);
  };
  var getUpdateToggleAction = () => document.querySelector(".kiwotigo-form-justUpdate");
  var getMapLegendOptions = () => {
    const legendOptions = {};
    Array.from(
      document.querySelectorAll(".mapLegendContainer input[type=checkbox]")
    ).forEach((checkbox) => {
      legendOptions[checkbox.name] = checkbox.checked;
    });
    return legendOptions;
  };
  var drawContinent = /* @__PURE__ */ (() => {
    let drawOptions;
    return (options) => {
      drawOptions = { ...drawOptions, ...options, ...getMapLegendOptions() };
      draw(drawOptions);
    };
  })();
  var onCreate = (config2) => {
    showLoadingState();
    build(config2, displayProgress).then((data) => {
      console.log("received new build", data);
      hideLoadingState();
      getUpdateToggleAction().disabled = false;
      document.querySelector(".mapLegendContainer").style.display = "block";
      canvas.width = data.continent.canvasWidth;
      canvas.height = data.continent.canvasHeight;
      drawContinent({ ctx: canvasCtx, icf: data.continent });
    });
  };
  var getConfig = () => {
    const { elements: formElements } = document.forms.kiwotigo;
    return [
      "gridWidth",
      "gridHeight",
      "gridOuterPaddingX",
      "gridOuterPaddingY",
      "gridInnerPaddingX",
      "gridInnerPaddingY",
      "gridHexWidth",
      "gridHexHeight",
      "hexWidth",
      "hexHeight",
      "hexPaddingX",
      "hexPaddingY",
      "minimalGrowIterations",
      "fastGrowIterations",
      "maxRegionSizeFactor",
      "probabilityCreateRegionAt",
      // "enableExtendedConnections",
      "maxExtendedOuterRangeFactor",
      "canvasMargin"
    ].reduce((c, key) => ({ ...c, [key]: parseFloat(formElements[key].value) }), {
      // swapXY: true,
    });
  };
  var getKiwotigoOriginData = () => localStorage.getItem("kiwotigoOriginData");
  document.forms.kiwotigo.addEventListener("submit", (event) => {
    event.preventDefault();
    if (getUpdateToggleAction().checked) {
      onCreate({ ...getConfig(), originData: getKiwotigoOriginData() });
    } else {
      onCreate(getConfig());
    }
    document.querySelector(".kiwotigo-createContinentBtn").blur();
  });
  document.addEventListener("DOMContentLoaded", () => {
    const originData = getKiwotigoOriginData();
    if (originData) {
      getUpdateToggleAction().disabled = false;
      const originConfig = JSON.parse(originData).config;
      onCreate({ ...originConfig, originData });
      Array.from(Object.entries(originConfig)).forEach(([key, value]) => {
        const el = document.querySelector(`.kiwotigo-form input[name=${key}]`);
        if (el) {
          el.value = value;
        }
      });
    } else {
      getUpdateToggleAction().disabled = true;
      document.querySelector(".mapLegendContainer").style.display = "none";
    }
  });
  document.querySelector(".openCloseAction").addEventListener("pointerup", () => {
    document.querySelector(".createContinentConfig").classList.toggle("opened");
  });
  getUpdateToggleAction().addEventListener("change", () => {
    const { checked } = getUpdateToggleAction();
    Array.from(
      document.querySelectorAll(".kiwotigo-form .create-only input")
    ).forEach((el) => {
      el.disabled = checked;
    });
    document.querySelector(".kiwotigo-form").classList[checked ? "add" : "remove"]("just-update");
  });
  document.querySelector(".mapLegendContainer").addEventListener("change", (e) => {
    console.debug("legend options", getMapLegendOptions());
    drawContinent(getMapLegendOptions());
  });
  startBroadcasting();
})();
