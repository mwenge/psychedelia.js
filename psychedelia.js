function psychedelia(canvas) {

  const NUM_COLS = 0x28;
  const NUM_ROWS = 0x18;
  const COLOR_MAX = 0x07;
  const MAX_INDEX_VALUE = 0x1F;
  const SCALE_FACTOR = 1;


  let cursorXPosition = 10;
  let cursorYPosition = 10;
  let smoothingDelay = 0x0C;
  let currentXPosArray = starOneXPosArray;
  let currentYPosArray = starOneYPosArray;

  let pixel_matrix = new Array(NUM_COLS * NUM_ROWS).fill(0);

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

  const ctx = canvas.getContext("2d");
  canvas.width = NUM_COLS * SCALE_FACTOR;
  canvas.height = NUM_ROWS * SCALE_FACTOR;
  const imgData = new Uint8ClampedArray(new Array(NUM_COLS * SCALE_FACTOR * NUM_ROWS * SCALE_FACTOR).fill(0).map(x => RGBs[x]).flat());
  let imageData = new ImageData(imgData, NUM_COLS * SCALE_FACTOR, NUM_ROWS * SCALE_FACTOR);

  function initializeScreen() {
    pixel_matrix = pixel_matrix.fill(0, 0, NUM_COLS*NUM_ROWS);
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

  function scalePixel(rgba, pixelXPos, pixelYPos) {
    for (var y=0; y < SCALE_FACTOR; y++) {
      for (var x=0; x < SCALE_FACTOR; x++) {
        const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (NUM_COLS * y * SCALE_FACTOR)
            + (pixelXPos * SCALE_FACTOR) + x;
        for (var i=0; i<4; i++) {
          imageData.data[(o*4)+i] = rgba[i];
        }
      }
    }
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
    const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (pixelXPos * SCALE_FACTOR);
    for (var i=0; i<4; i++) {
      imageData.data[(o*4)+i] = rgba[i];
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
      pixelXPosition = initialPixelXPosition + currentXPosArray[i] & 0xFF;
      pixelYPosition = initialPixelYPosition + currentYPosArray[i] & 0xFF;

      PaintPixelForCurrentSymmetry();

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

      colorIndexForCurrentPixel = currentColorIndexArray[currentIndexToPixelBuffers];
      pixelXPosition = pixelXPositionArray[currentIndexToPixelBuffers];
      pixelYPosition = pixelYPositionArray[currentIndexToPixelBuffers];

      LoopThroughPatternAndPaint();

      currentColorIndexArray[currentIndexToPixelBuffers] = --currentColorIndexArray[currentIndexToPixelBuffers] & 0xFF;

      if (runs > 40) {
        break;
      }

    }
    if(Math.floor(Math.random() * (500 + 1)) == 0) {
      console.log("reset");
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
    initializeScreen();
    reinitializeSequences();
    window.requestAnimationFrame(MainPaintLoop);
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
}
