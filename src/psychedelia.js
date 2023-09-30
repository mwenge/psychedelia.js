import {patterns} from "./patterns.js";
import * as c from './constants.js'

export function psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, updatePixel) {

  const COLOR_MAX = 0x07;
  const MAX_INDEX_VALUE = 0x1F;

  let cursorXPosition = 10;
  let cursorYPosition = 10;
  let smoothingDelay = 0x0C;
  let currentXPosArray = patterns[0];
  let currentYPosArray = patterns[0];

  const ARRAY_SIZE = 64;
  let pixelXPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let pixelYPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let currentColorIndexArray = new Array(ARRAY_SIZE).fill(0);
  const initialFramesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(0x0C);
  let framesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(0);
  const currentSymmetrySettingForStep = 0x01;
                                                                
  const presetColorValuesArray = [c.BLACK,c.BLUE,c.RED,c.PURPLE,c.GREEN,c.CYAN,c.YELLOW,c.WHITE];

  let pixel_matrix = new Array(NUM_COLS * NUM_ROWS).fill(0);

  function reinitializeSequences() {
    for (var i = 0; i < ARRAY_SIZE; i++) {
      pixelXPositionArray[i] = 0;
      pixelYPositionArray[i] = 0;
      currentColorIndexArray[i] = 0;
      initialFramesRemainingToNextPaintForStep[i] = 0;
      framesRemainingToNextPaintForStep[i] = 0;
    }
  }

  function paintPixel(pixelXPos, pixelYPos, colorIndexForCurrentPixel) {
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
    const currentColorForPixel = pixel_matrix[x] & COLOR_MAX;

    const indexOfCurrentColor = presetColorValuesArray.indexOf(currentColorForPixel);

    let cx = colorIndexForCurrentPixel + 1;

    if (cx < indexOfCurrentColor) {
      return;
    }

    const newColor = presetColorValuesArray[colorIndexForCurrentPixel];
    pixel_matrix[x] = newColor;

    const rgba = c.RGBs[newColor];
    const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (pixelXPos * SCALE_FACTOR);
    updatePixel(o, rgba, pixelXPos, pixelYPos);
  }

  function PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel) {
    paintPixel(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

    if (!currentSymmetrySettingForStep) {
      return;
    }

    const symmPixelXPosition = NUM_COLS - pixelXPosition;
    paintPixel(symmPixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

    if (currentSymmetrySettingForStep == 0x01) {
      return;
    }

    const symmPixelYPosition = NUM_ROWS - pixelYPosition;
    paintPixel(pixelXPosition, symmPixelYPosition, colorIndexForCurrentPixel);
  }

  function LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel) {
    PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);
    
    if (colorIndexForCurrentPixel == COLOR_MAX) {
      return;
    }

    let countToMatchCurrentIndex = COLOR_MAX;

    const initialPixelXPosition = pixelXPosition;
    const initialPixelYPosition = pixelYPosition;

    let i = 0;
    while (true) {
      pixelXPosition = initialPixelXPosition + currentXPosArray[i] & 0xFF;
      pixelYPosition = initialPixelYPosition + currentYPosArray[i] & 0xFF;

      PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

      i++;
      if (currentXPosArray[i] != 0x55) {
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

  function MainPaintLoop() {
    let currentIndexToPixelBuffers = 0x00;
    let runs = 0;
    while (true) {
      runs++;
      if (runs % 20 == 0) {
        interruptHandler();
        continue;
      }
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

      let colorIndexForCurrentPixel = currentColorIndexArray[currentIndexToPixelBuffers];
      let pixelXPosition = pixelXPositionArray[currentIndexToPixelBuffers];
      let pixelYPosition = pixelYPositionArray[currentIndexToPixelBuffers];

      LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

      currentColorIndexArray[currentIndexToPixelBuffers] = --currentColorIndexArray[currentIndexToPixelBuffers] & 0xFF;

      if (runs > 40) {
        break;
      }

    }
    if(Math.floor(Math.random() * (500 + 1)) == 0) {
      let pi = Math.floor(Math.random() * ((patterns.length-1) + 1));
      [currentXPosArray, currentYPosArray] = patterns[pi];
    }

    window.requestAnimationFrame(MainPaintLoop);
  }

  let indexIntoArrays = 0;
  let randX = Math.floor(Math.random() * (1 - -1 + 1) + -1);
  let randY = Math.floor(Math.random() * (1 - -1 + 1) + -1);

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

    if (indexIntoArrays % 10 == 0) {
      randX = Math.floor(Math.random() * (1 - -1 + 1) + -1);
    }
    if (indexIntoArrays % 25 == 0) {
      randY = Math.floor(Math.random() * (1 - -1 + 1) + -1);
    }

    cursorXPosition += randX;
    if (cursorXPosition > NUM_COLS) {
      cursorXPosition = 0;
    }
    if (cursorXPosition < 0) {
      cursorXPosition = NUM_COLS;
    }

    cursorYPosition += randY;
    if (cursorYPosition > NUM_ROWS) {
      cursorYPosition = 0;
    }
    if (cursorYPosition < 0) {
      cursorYPosition = NUM_ROWS;
    }
  }

  function LaunchPsychedelia() {
    let pi = Math.floor(Math.random() * ((patterns.length-1) + 1));
    [currentXPosArray, currentYPosArray] = patterns[pi];
    reinitializeSequences();
    window.requestAnimationFrame(MainPaintLoop);
  }

  LaunchPsychedelia();
}
