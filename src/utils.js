
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

