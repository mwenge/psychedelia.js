import {psychedelia} from "./src/psychedelia.js";
import * as c from './src/constants.js'

const NUM_COLS = 0x28;
const NUM_ROWS = 0x18;
const SCALE_FACTOR = 1;

function createCanvas() {
  function updateCanvas(o, rgba, pixelXPos, pixelYPos) {
    for (var i=0; i<4; i++) {
      imageData.data[(o*4)+i] = rgba[i];
    }
    ctx.putImageData(imageData,0,0, pixelXPos, pixelYPos, 2, 2 );
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = NUM_COLS * SCALE_FACTOR;
  canvas.height = NUM_ROWS * SCALE_FACTOR;
  const imgData = new Uint8ClampedArray(new Array(NUM_COLS * SCALE_FACTOR * NUM_ROWS * SCALE_FACTOR)
    .fill(0).map(x => c.RGBs[x]).flat());
  let imageData = new ImageData(imgData, NUM_COLS * SCALE_FACTOR, NUM_ROWS * SCALE_FACTOR);
  ctx.putImageData(imageData,0,0);
  return {canvas: canvas, updateCanvas: updateCanvas};
}

function littlePsychedelias() {
  for (var i=0; i<185; i++) {
    let c = createCanvas();
    psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, c.updateCanvas);
    setTimeout(() => {container.appendChild(c.canvas)}, 1000);
  }
}

littlePsychedelias();
