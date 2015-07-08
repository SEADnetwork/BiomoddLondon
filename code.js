function setup() {
  // uncomment this line to make the canvas the full size of the window
  var myCanvas = createCanvas(600, 400);
  myCanvas.parent('myContainer');
}

function draw() {
  // draw stuff here
  fill('red');
  ellipse(width/2, height/2, 100, 50);
}