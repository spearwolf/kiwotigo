import { build, startBroadcasting } from "./kiwotigo.js";
import draw from "./kiwotigo-painter.js";

let regionMask = null;
let isPainting = false;
let paintValue = 1;

function paintCell(index) {
  regionMask[index] = paintValue;
  const grid = document.getElementById("regionMaskGrid");
  const cell = grid.children[index];
  if (cell) cell.classList.toggle("active", paintValue === 1);
}

function initMaskDialog(w, h) {
  const grid = document.getElementById("regionMaskGrid");
  grid.style.setProperty("--mask-cols", w);
  const size = w * h;
  if (!regionMask || regionMask.length !== size) {
    regionMask = new Array(size).fill(1);
  }
  grid.innerHTML = "";
  for (let i = 0; i < size; i++) {
    const cell = document.createElement("div");
    cell.className = "mask-cell" + (regionMask[i] ? " active" : "");
    cell.dataset.index = i;
    cell.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      isPainting = true;
      paintValue = regionMask[i] ? 0 : 1;
      paintCell(i);
    });
    grid.appendChild(cell);
  }
  grid.addEventListener("pointermove", (e) => {
    if (!isPainting) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.classList.contains("mask-cell") && el.dataset.index !== undefined) {
      paintCell(parseInt(el.dataset.index, 10));
    }
  });
}

const canvas = document.getElementById("kiwotigoCanvas");
const canvasCtx = canvas.getContext("2d");

const loadingMessages = [
  "I will now create a new world just for you ...",
  "Such a thing can take a while, though ...",
  "... each country must be carefully considered ...",
  "Hold on, it can't be much longer ...",
  "I'm almost finished, there's just a few final touches ...",
];

const displayLoadingInfo = (html) => {
  document.querySelector(".loadingModal-info").innerHTML = html;
};

let currentLoadingMessageIdx = 0;
let displayNextLoadingMessageHandle = 0;

const showLoadingState = () => {
  displayLoadingInfo(loadingMessages[0]);
  currentLoadingMessageIdx = 1;
  document.querySelector(".loadingModal").classList.add("loading");
  clearInterval(displayNextLoadingMessageHandle);
  displayNextLoadingMessageHandle = setInterval(() => {
    displayLoadingInfo(loadingMessages[currentLoadingMessageIdx]);
    currentLoadingMessageIdx =
      (currentLoadingMessageIdx + 1) % loadingMessages.length;
  }, 5000);
};

const displayProgress = (progress) => {
  const maxWidth = document
    .querySelector(".loadingModal-content")
    .getBoundingClientRect().width;
  const el = document.querySelector(".loadingModal-progress");
  el.style.width = `${Math.round(progress * maxWidth)}px`;
};

const hideLoadingState = () => {
  clearInterval(displayNextLoadingMessageHandle);
  displayProgress(1);
  setTimeout(() => {
    document.querySelector(".loadingModal").classList.remove("loading");
  }, 500);
};

const getUpdateToggleAction = () =>
  document.querySelector(".kiwotigo-form-justUpdate");

const getMapLegendOptions = () => {
  const legendOptions = {};
  Array.from(
    document.querySelectorAll(".mapLegendContainer input[type=checkbox]")
  ).forEach((checkbox) => {
    legendOptions[checkbox.name] = checkbox.checked;
  });
  return legendOptions;
};

const drawContinent = (() => {
  let drawOptions;

  return (options) => {
    drawOptions = { ...drawOptions, ...options, ...getMapLegendOptions() };
    draw(drawOptions);
  };
})();

const onCreate = (config) => {
  showLoadingState();

  build(config, displayProgress).then((data) => {
    console.log("received new build", data);
    hideLoadingState();
    getUpdateToggleAction().disabled = false;
    document.querySelector(".mapLegendContainer").style.display = "block";

    canvas.width = data.continent.canvasWidth;
    canvas.height = data.continent.canvasHeight;
    // const DPR = window.devicePixelRatio || 1;
    // if (DPR !== 1) {
    //   canvas.style.width = `${Math.round(canvas.width / DPR)}px`;
    //   canvas.style.height = `${Math.round(canvas.height / DPR)}px`;
    // }
    drawContinent({ ctx: canvasCtx, icf: data.continent });
  }).catch((err) => {
    console.error("build error", err);
    hideLoadingState();
    document.getElementById("errorMessage").textContent = err.message || String(err);
    document.getElementById("errorDialog").showModal();
  });
};

const getConfig = () => {
  const { elements: formElements } = document.forms.kiwotigo;
  const config = [
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
    "divisibilityBy",
    // "enableExtendedConnections",
    "maxExtendedOuterRangeFactor",
    "canvasMargin",
  ].reduce((c, key) => ({ ...c, [key]: parseFloat(formElements[key].value) }), {
    // swapXY: true,
  });
  config.flipXY = formElements['flipXY'].checked;
  if (regionMask !== null) {
    config.regionMask = regionMask;
  }
  return config;
};

const getKiwotigoOriginData = () => localStorage.getItem("kiwotigoOriginData");

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
        if (el.type === 'checkbox') {
          el.checked = Boolean(value);
        } else {
          el.value = value;
        }
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
    document.querySelectorAll(".kiwotigo-form .create-only input, .kiwotigo-form .create-only button")
  ).forEach((el) => {
    el.disabled = checked;
  });
  document
    .querySelector(".kiwotigo-form")
    .classList[checked ? "add" : "remove"]("just-update");
});

document.getElementById("editRegionMaskBtn").addEventListener("click", () => {
  const { elements } = document.forms.kiwotigo;
  initMaskDialog(
    parseInt(elements.gridWidth.value),
    parseInt(elements.gridHeight.value)
  );
  document.getElementById("regionMaskDialog").showModal();
});

document.getElementById("clearMaskBtn").addEventListener("click", () => {
  regionMask = null;
  const { elements } = document.forms.kiwotigo;
  initMaskDialog(
    parseInt(elements.gridWidth.value),
    parseInt(elements.gridHeight.value)
  );
});

document.getElementById("closeMaskDialogBtn").addEventListener("click", () => {
  document.getElementById("regionMaskDialog").close();
});

document.getElementById("closeErrorDialogBtn").addEventListener("click", () => {
  document.getElementById("errorDialog").close();
});

["gridWidth", "gridHeight"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    const { elements } = document.forms.kiwotigo;
    initMaskDialog(
      parseInt(elements.gridWidth.value),
      parseInt(elements.gridHeight.value)
    );
  });
});

document.addEventListener("pointerup", () => { isPainting = false; });
document.addEventListener("pointercancel", () => { isPainting = false; });

document.querySelector(".mapLegendContainer").addEventListener("change", (e) => {
  console.debug("legend options", getMapLegendOptions());
  drawContinent(getMapLegendOptions());
});

startBroadcasting();
