
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
