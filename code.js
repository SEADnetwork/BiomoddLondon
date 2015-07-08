function setup() {
  // uncomment this line to make the canvas the full size of the window
  var myCanvas = createCanvas(600, 400);
  myCanvas.parent('myContainer');
}

function draw() {
  // draw stuff here
  ellipse(width/2, height/2, 100, 50);
  ellipse(width/2, height/2, 100, random(50));
}