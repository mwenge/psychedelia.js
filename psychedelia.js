const NUM_COLS = 0x28;
const NUM_ROWS = 0x18;
const COLOR_MAX = 0x07;

let cursorXPosition = 10;
let cursorYPosition = 10;
let smoothingDelay = 0x0C;

let pixel_matrix = new Array(NUM_COLS*NUM_ROWS).fill(0);

let currentColorForPixel;

let pixelXPositionArray   = [
         0x0F,0x0E,0x0D,0x0C,0x0B,0x0A,0x09,0x04,
         0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,
         0x0D,0x0E,0x0F,0x10,0x11,0x12,0x13,0x14,
         0x15,0x16,0x17,0x14,0x13,0x12,0x11,0x10,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
];
let pixelYPositionArray   = [
         0x0C,0x0D,0x0E,0x0F,0x0F,0x0F,0x0E,0x04,
         0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x05,
         0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,
         0x0D,0x0D,0x0D,0x07,0x09,0x09,0x0A,0x0B,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
];
let currentColorIndexArray   = [
         0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
         0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
         0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
         0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
];
const initialFramesRemainingToNextPaintForStep   = [
         0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,
         0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,
         0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,
         0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
];
let framesRemainingToNextPaintForStep   = [
         0x04,0x07,0x01,0x02,0x03,0x06,0x07,0x06,
         0x0C,0x02,0x03,0x06,0x07,0x01,0x02,0x02,
         0x04,0x04,0x07,0x01,0x02,0x03,0x06,0x07,
         0x0C,0x02,0x03,0x02,0x03,0x07,0x01,0x02,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
         0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
];
                                                              
const BLACK   = 0x00;
const WHITE   = 0x01;
const RED     = 0x02;
const CYAN    = 0x03;
const PURPLE  = 0x04;
const GREEN   = 0x05;
const BLUE    = 0x06;
const YELLOW  = 0x07;
const presetColorValuesArray = [BLACK,BLUE,RED,PURPLE,GREEN,CYAN,YELLOW,WHITE];

const RGBs = {
  0x00: [0,0,0,255],
  0x01: [255,255,255,255],
  0x02: [255,0,0,255],
  0x03: [0,255,255,255],
  0x04: [128,0,128,255],
  0x05: [0,128,0,255],
  0x06: [0,0,255,255],
  0x07: [255,255,0,255],
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imgData = new Uint8ClampedArray(pixel_matrix.map(x => RGBs[x]).flat());
let imageData = new ImageData(imgData, NUM_COLS, NUM_ROWS);

//  The pattern data structure consists of up to 7 rows, each
//  one defining a stage in the creation of the pattern. Each
//  row is assigned a unique color. The X and Y positions given
//  in each array refer to the position relative to the cursor
//  at the centre. 'Minus' values relative to the cursor are
//  given by values such as FF (-1), FE (-2), and so on.
// 
//  In this illustration the number used represents which row
//  the 'pixel' comes from. So for example the first row
//  in starOneXPosArray and starOneYPosArray 
//  draws the square of 0s at the centre of the star.
// 

const starOneXPosArray  = [
                  0x00,0x01,0x01,0x01,0x00,0xFF,0xFF,0xFF,0x55,
                  0x00,0x02,0x00,0xFE,0x55,
                  0x00,0x03,0x00,0xFD,0x55,
                  0x00,0x04,0x00,0xFC,0x55,
                  0xFF,0x01,0x05,0x05,0x01,0xFF,0xFB,0xFB,0x55,
                  0x00,0x07,0x00,0xF9,0x55,
                  0x55
];
const starOneYPosArray  = [
                  0xFF,0xFF,0x00,0x01,0x01,0x01,0x00,0xFF,0x55,
                  0xFE,0x00,0x02,0x00,0x55,
                  0xFD,0x00,0x03,0x00,0x55,
                  0xFC,0x00,0x04,0x00,0x55,
                  0xFB,0xFB,0xFF,0x01,0x05,0x05,0x01,0xFF,0x55,
                  0xF9,0x00,0x07,0x00,0x55,
                  0x55
];

function initializeScreen() {
  pixel_matrix = pixel_matrix.fill(0, 0, NUM_COLS*NUM_ROWS);
}

function paintPixel(pixelXPos, pixelYPos) {
  if (pixelXPos < 0) {
    return;
  }
  if (pixelXPos >= NUM_COLS) {
    return;
  }
  if (pixelYPos < 0) {
    return;
  }
  if (pixelYPos >= NUM_ROWS) {
    return;
  }

  const x = (pixelYPos * NUM_COLS) + pixelXPos;
  currentColorForPixel = pixel_matrix[x] & COLOR_MAX;

  const indexOfCurrentColor = presetColorValuesArray.indexOf(currentColorForPixel);

  let cx = colorIndexForCurrentPixel + 1;

  if (cx < indexOfCurrentColor) {
    return;
  }

  const newColor = presetColorValuesArray[colorIndexForCurrentPixel];
  pixel_matrix[x] = newColor;

  const rgba = RGBs[newColor];
  for (var i=0; i<4; i++) {
    imageData.data[(x*4)+i] = rgba[i];
  }
  ctx.putImageData(imageData,0,0);
}

const currentSymmetrySettingForStep = 0x01;

function PaintPixelForCurrentSymmetry() {
  paintPixel(pixelXPosition, pixelYPosition);

  if (!currentSymmetrySettingForStep) {
    return;
  }

  const symmPixelXPosition = NUM_COLS - pixelXPosition;
  paintPixel(symmPixelXPosition, pixelYPosition);

  if (currentSymmetrySettingForStep == 0x01) {
    return;
  }

  const symmPixelYPosition = NUM_ROWS - pixelYPosition;
  paintPixel(pixelXPosition, symmPixelYPosition);
}

function LoopThroughPatternAndPaint() {
  PaintPixelForCurrentSymmetry();
  
  if (colorIndexForCurrentPixel == COLOR_MAX) {
    return;
  }

  let countToMatchCurrentIndex = COLOR_MAX;

  const initialPixelXPosition = pixelXPosition;
  const initialPixelYPosition = pixelYPosition;

  let i = 0;
  while (true) {
    pixelXPosition = initialPixelXPosition + starOneXPosArray[i] & 0xFF;
    pixelYPosition = initialPixelYPosition + starOneYPosArray[i] & 0xFF;

    PaintPixelForCurrentSymmetry();

    i++;
    if (starOneXPosArray[i] != 0x55) {
      continue;
    }

    countToMatchCurrentIndex--;
    if (countToMatchCurrentIndex == colorIndexForCurrentPixel) {
      break;
    }
    if (countToMatchCurrentIndex == 0x01) {
      break;
    }

    i++;
  }
  pixelXPosition = initialPixelXPosition;
  pixelYPosition = initialPixelYPosition;

}

const MAX_INDEX_VALUE = 0x1F;

function MainPaintLoop() {
  let currentIndexToPixelBuffers = 0x00;
  let runs = 0;
  //while (true) {
  for (var i=0; i < 10**6; i++) {
    currentIndexToPixelBuffers = ++currentIndexToPixelBuffers & MAX_INDEX_VALUE;


    // Wait for this to hit zero before actually painting the pixels.
    framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = --framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] & 0xFF;
    if (framesRemainingToNextPaintForStep[currentIndexToPixelBuffers]) {
      continue;
    }
    framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = initialFramesRemainingToNextPaintForStep[currentIndexToPixelBuffers];

    // Hitting 0xFF means we have decremented below zero for this phase.
    if (currentColorIndexArray[currentIndexToPixelBuffers] == 0xFF) {
      continue;
    }

    colorIndexForCurrentPixel = currentColorIndexArray[currentIndexToPixelBuffers];
    pixelXPosition = pixelXPositionArray[currentIndexToPixelBuffers];
    pixelYPosition = pixelYPositionArray[currentIndexToPixelBuffers];
    //console.log({pixelXPosition}, {pixelYPosition}, {currentIndexToPixelBuffers});

    LoopThroughPatternAndPaint();

    currentColorIndexArray[currentIndexToPixelBuffers] = --currentColorIndexArray[currentIndexToPixelBuffers] & 0xFF;

    runs++;
    //drawCanvas();
    if (runs > 20) {
      break;
    }
  }
}

function reinitializeSequences() {
  for (var i = 0; i < 0x40; i++) {
    pixelXPositionArray[i] = 0;
    pixelYPositionArray[i] = 0;
    currentColorIndexArray[i] = 0;
    initialFramesRemainingToNextPaintForStep[i] = 0;
    framesRemainingToNextPaintForStep[i] = 0;
  }
}

let indexIntoArrays = 0;

/*
 * Cycles through each of the first 32 bytes in the arrays.
 * Resets the array once it has cycle through all the colors.
 */
function interruptHandler() {
  indexIntoArrays++;
  indexIntoArrays = indexIntoArrays & MAX_INDEX_VALUE;
  if (currentColorIndexArray[indexIntoArrays] != 0xFF) {
    return;
  }

  pixelXPositionArray[indexIntoArrays] = cursorXPosition;
  pixelYPositionArray[indexIntoArrays] = cursorYPosition;
  currentColorIndexArray[indexIntoArrays] = COLOR_MAX;
  initialFramesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;
  framesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;

  /**
  cursorXPosition++;
  if (cursorXPosition > NUM_COLS) {
    cursorXPosition = 0;
  }
  **/
  cursorYPosition++;
  if (cursorYPosition > NUM_ROWS) {
    cursorYPosition = 0;
  }
}

function LaunchPsychedelia() {
  initializeScreen();
  reinitializeSequences();
}


function drawCanvas() {
  const imgData = new Uint8ClampedArray(pixel_matrix.map(x => RGBs[x]).flat());
  let imageData = new ImageData(imgData, NUM_COLS, NUM_ROWS);
  ctx.putImageData(imageData,0,0);
}

function log() {
  console.log('----------------------------');
  for (var y = 0 ; y < NUM_ROWS; y++) {
    const i = (NUM_COLS * y);
    console.log(pixel_matrix.slice(i, i + NUM_COLS).toString());
  }
}

LaunchPsychedelia();
setInterval(interruptHandler, 5);
setInterval(MainPaintLoop, 100);
/*
output.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName == 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    cursorYPosition--;
    if (cursorYPosition < 0) {
      cursorYPosition = NUM_ROWS;
    }
    return;
  }

  if (keyName == 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    cursorYPosition++;
    if (cursorYPosition == NUM_ROWS) {
      cursorYPosition = 0;
    }
    return;
  }

  if (keyName == 'ArrowLeft') {
    event.preventDefault();
    event.stopPropagation();
    cursorXPosition--;
    if (cursorXPosition < 0) {
      cursorXPosition = NUM_COLS;
    }
    return;
  }

  if (keyName == 'ArrowRight') {
    event.preventDefault();
    event.stopPropagation();
    cursorXPosition++;
    if (cursorXPosition == NUM_COLS) {
      cursorXPosition = 0;
    }
    return;
  }
});
*/
