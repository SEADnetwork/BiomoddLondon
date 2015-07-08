var s = function( p ) {

  var x = 100; 
  var y = 100;

  p.setup = function() {
    p.createCanvas(700, 410);
    console.log(whaddup);
  };

  p.draw = function() {
    p.background(0);
    p.fill(115);
    p.rect(x,y,50,p.random(5));
  };

  p.mousePressed = function(){
  	p.remove();
  }

};

var myp5 = new p5(s, 'myContainer');