
console.log("sketch2 loaded");

s = function( p ) {

  var x = 100; 
  var y = 100;


  p.setup = function() {
    canvas = null;
    myCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
    myCanvas.parent('myContainer');
  };

  p.draw = function() {
    p.background('green');
    p.fill(255);
    p.rect(p.mouseX,y,50,p.random(50));
  };

};

if(myp5){
  myp5.remove();
  myp5.canvas.remove();  
}



myp5 = new p5(s);
