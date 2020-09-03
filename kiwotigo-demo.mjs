import { build } from "./kiwotigo.mjs";
import draw from "./kiwotigo-painter.mjs";

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

const onCreate = (config) => {
  showLoadingState();

  build(config, displayProgress).then((data) => {
    console.log("received new build", data);
    hideLoadingState();

    canvas.width = data.continent.canvasWidth;
    canvas.height = data.continent.canvasHeight;
    const DPR = window.devicePixelRatio || 1;
    if (DPR !== 1) {
      canvas.style.width = `${Math.round(canvas.width / DPR)}px`;
      canvas.style.height = `${Math.round(canvas.height / DPR)}px`;
    }
    draw(canvasCtx, data.continent);
  });
};

const getConfig = () => {
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
    "canvasMargin",
  ].reduce((c, key) => ({ ...c, [key]: parseFloat(formElements[key].value) }), {
    // swapXY: true,
  });
};

document.forms.kiwotigo.addEventListener("submit", (event) => {
  event.preventDefault();

  onCreate(getConfig());

  document.querySelector(".kiwotigo-createContinentBtn").blur();
});

document.addEventListener("DOMContentLoaded", () => {
  const originData = localStorage.getItem("kiwotigoOriginData");
  if (originData) {
    onCreate({ ...getConfig(), originData });
  }
});
