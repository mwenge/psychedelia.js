import {psychedelia} from "./src/psychedelia.js";
import * as c from './src/constants.js'

const NUM_COLS = 0x28;
const NUM_ROWS = 0x18;
const SCALE_FACTOR = 1;
  const DEMO_MODE = true;

const psy = createDOM();

document.body.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName == 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    psy.updateYPos(-1);
    return;
  }

  if (keyName == 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    psy.updateYPos(1);
    return;
  }

  if (keyName == 'ArrowLeft') {
    event.preventDefault();
    event.stopPropagation();
    psy.updateXPos(-1);
    return;
  }

  if (keyName == 'ArrowRight') {
    event.preventDefault();
    event.stopPropagation();
    psy.updateXPos(1);
    return;
  }
});

function createDOM() {
  function updateDOM(o, rgba, pixelXPos, pixelYPos) {
    //console.log(domcontainer.children.item(o), `rgb('${rgba.slice(0,3).join("','")}')`);
    const cv = `rgb(${rgba.slice(0,3).join(',')})`;
    domcontainer.children.item(o).style.backgroundColor = cv;
  }
  for (var i=0; i< (NUM_COLS * NUM_ROWS); i++) {
    const p = document.createElement("div");
    p.className = "pixel";
    domcontainer.appendChild(p);
  }
  return psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, updateDOM, DEMO_MODE);
}

