//----------------------------------
// variables
//----------------------------------
/**
 * The background color of the game
 * @type {Color}
 */
 var backgroundColor = '#660066'; //rgb(102, 0, 102)


//----------------------------------
// game variables
//----------------------------------
// modifying these will change the game 
// behavior

/**
 * The desired framerate
 * @type {Number}
 */
 var fps = 10;


/**
 * The grid is the amount of points that makes up the game field
 * So we have 100 (x) * 100 (y) points
 * @type {Number}
 */
 var grid_size = 100;

 var avatar;
 var playerhistory;

 // temp fixes
 var mrandom;

//----------------------------------
// MAIN GAME FUNCTIONS
//----------------------------------
// ---- setup ----------------------
// will be executed once | at the beginning
function setup() {
  // we create a full screen canvas
  createCanvas(windowWidth, windowHeight);

  //set the framerate
  frameRate(fps);
  avatar = makeAvatar();
  playerhistory = makePlayersHistory();
}

// ---- draw ----------------------
// will be executed every frame 
// use this for updating and drawing
function draw() {
  // draw stuff here
  

  // -- update 
  avatar.update();

  if (avatar.checkTurned()){
    playerhistory.set("self", avatar.history);
  }

  if (playerhistory.checkBump(avatar.position)){
    avatar.kill();
  }

  // -- draw
  background(backgroundColor);
  drawGrid();
  playerhistory.draw();
  avatar.draw();

}

//----------------------------------
// I/O FUNCTIONS
//----------------------------------
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
    avatar.move(true);
    break;
    case RIGHT_ARROW:
    avatar.move(false);
    break;
    case 'r':
    avatar.reset();
    playerhistory.reset();
    break;
  }
}

//----------------------------------
// WORLD FUNCTIONS
//----------------------------------
// draws the grid over the background
function drawGrid(){
  var gridColor = color(255, 204, 0, 50);

  push();
  noFill();
  stroke(gridColor);

  //loop: goes from x=0 -> x=grid_size
  for (var x = 0; x < grid_size; x++){
    var worldpoint = grid2world(makePoint(x,x));
    // draws the vertical lines
    line(worldpoint.x, 0, worldpoint.x, height);
    // draws the horizontal lines
    line(0, worldpoint.y, width, worldpoint.y);
  }

  pop();
}

//----------------------------------
// AVATAR FUNCTIONS
//----------------------------------
/**
 * Constructs a new avatar
 *
 * @class  Avatar
 * @classdesc The player instance
 * @property {Function} test a simple test
 */
 function makeAvatar(){

  // ---- public ----------------------
  // -------- methods -----------------
  
  /**
   * private: initializes the avatar
   */
   function init(){
    reset();
   }

  /**
   * resets the avatar
   */
   function reset(){

    function makeRandomGrid(){
      var offset = grid_size/4;
      return random(offset, grid_size-offset);
    }

    //set members
    position = makePoint(makeRandomGrid(), makeRandomGrid());
    orientation = floor(random(100)%8); 
    speed = 1;
    alive = true;
    history = [];

    updateHistory();
    
  }

  function update(){
    if (!alive){ return; }

    function updateOrientation(){
      switch (orientation) {
        case 0:
        position.y-=speed;
        break;
        case 1:
        position.x+=speed;
        position.y-=speed;
        break;
        case 2:
        position.x+=speed;
        break;
        case 3:
        position.x+=speed;
        position.y+=speed;
        break;
        case 4:
        position.y+=speed;
        break;
        case 5:
        position.x-=speed;
        position.y+=speed;
        break;
        case 6:
        position.x-=speed;
        break;
        case 7:
        position.x-=speed;
        position.y-=speed;
        break;
        default:
        console.log("wrong position");
        break;
      }
    }

    function checkBorders(){
      if ((position.x <= 0) || (position.x >= grid_size) || (position.y <= 0) || (position.y >= grid_size)){
        updateHistory();
        alive = false;
      }
    }

    updateOrientation();
    checkBorders();
  }

  function draw(){
    var circleSize = 10;
    push();
    stroke('white');
    noFill();
    var worldpoint = grid2world(position);
    circle(worldpoint, circleSize);
    stroke('grey');
    lineFromPoints(worldpoint, grid2world(getLastPoint()));
    pop();
  }

  function move(left){
    left? orientation--: orientation++;
    
    if (orientation<0){
      orientation = 7;
    } else if (orientation > 7){
      orientation = 0;
    }

    updateHistory();
  }

  function checkTurned(){
    var rv = hasturned;
    hasturned = false;
    return rv;
  }

  // -------- public members -----------------
  
  /**
   * The grid position of the avatar
   * @type {Point}
   */
   var position;

   var hasturned;

  /**
   * boolean value to check wether the avatar is alive
   * @type {Bool}
   */
   var alive;

  /**
   * Array of Points of the avatars earlier locations
   * @type {Array}
   */
   var history = [];

  // ---- private ----------------------
  function updateHistory(){
    hasturned = true;

    history.push(makePoint(position.x, position.y));
  }

  function getLastPoint(){
    return history.last();
  }

  // -------- private members -----------------

  /**
   * The orientation of the avatar which is one of 8 numbers
  //    +--------------------------+
  //    |             0            |
  //    |   7        +             |
  //    |     X      |    XX 1     |
  //    |     XXX    |   XX        |
  //    |       XXX  |XXXX         |
  //    | 6  +--------------+  2   |
  //    |          XX|XXXXX        |
  //    |        XXX |    XX       |
  //    |       XX   |     X       |
  //    |       X    +        3    |
  //    |     5      4             |
  //    |                          |
  //    |                          |
  //    +--------------------------+
   * @type {Number}
   */
   var orientation;

  /**
   * The progressing speed of the avatar
   * @type {Number}
   */
   var speed;


  // ---- init ------------------------
  init();

  // ---- return ----------------------
  return {
    reset : reset,
    draw : draw,
    update: update,
    kill: function(){ alive = false; },
    checkTurned: checkTurned,
    position: position,
    history: history,
    move: move
  }
}

//----------------------------------
//  PLAYERSHISTORY FUNCTIONS
//----------------------------------
function makePlayersHistory(){
  // ---- public ----------------------
  function reset(){
    memberlines = {};
  }

  // -------- methods -----------------
  function set(name, pts){
    memberlines.name = pts;
  }

  function draw(){
    

    for (var member in memberlines){
      push();
      noFill();
      stroke('white');

      var currentLine = memberlines[member];

      beginShape();

      for (var idx = 0, len = currentLine.length; idx < len; idx++){
        var pt = currentLine[idx];
        vertexFromPoint(grid2world(currentLine[idx]));
        circle(grid2world(currentLine[idx]), 4);
      }
      endShape();

      pop();
    }
  }

  function checkBump(pt){

    for (var member in memberlines){

      var currentLine = memberlines[member];

      if (currentLine.length > 1){
        for (var idx = 1, len = currentLine.length; idx < len; idx++){
          if (pointOnLine(currentLine[idx-1], currentLine[idx], pt)){
            return true;
          }
        } 
      }
    }
    return false;
  }

  // -------- properties --------------
  
  /// ---- private --------------------
  function init(){
    reset();
  }

  // -------- methods -----------------
  // -------- properties --------------
  var memberlines = {};

  /// ---- init -----------------------
  init();
  
  /// ---- return ---------------------
  return {
    reset : reset,
    set : set,
    draw: draw,
    checkBump: checkBump
  }

  
}


//----------------------------------
// AUX FUNCTIONS
//----------------------------------
//makes an object containing x and y coordinates
/**
 * makes an Point object containing x and y coordinates
 * @param  {number} x 
 * @param  {number} y 
 * @return {Point}   
 */
 function makePoint(x, y){
  (x == null)? x = 0 : x=x;
  (y == null)? y = 0 : y=y;
  return {x: x, y: y};
 }

/**
 * Remaps a point from the world (screensize) to the grid
 * @param  {Point} pt the original point
 * @return {Point}    the remapped point
 */
 function world2grid(pt){
  return makePoint(pt.x / width * grid_size, pt.y / height * grid_size);
 }

/**
 * Remaps a point from the grid to the world (screensize)
 * @param  {Point} pt the original point
 * @return {Point}    the remapped point
 */
 function grid2world(pt){
  return makePoint(pt.x * width / grid_size, pt.y * height / grid_size);
 }

/**
 * draws a line between two points
 * @param  {Point} p1 
 * @param  {Point} p2 
 */
 function lineFromPoints(p1, p2){
  line(p1.x, p1.y, p2.x, p2.y);
 }

 function circle(p, radius){
  ellipse(p.x, p.y, radius, radius);
 }

 function vertexFromPoint(pt){
  vertex(pt.x, pt.y);
 }

 // returns true if point lies on the line
 // http://stackoverflow.com/questions/11907947/how-to-check-if-a-point-lies-on-a-line-between-2-other-points
 function pointOnLine(p1, p2, currp){

  var dxc = currp.x - p1.x;
  var dyc = currp.y - p1.y;

  var dxl = p2.x - p1.x;
  var dyl = p2.y - p1.y;

  var cross = floor(dxc * dyl - dyc * dxl);

        // check if point lays on line (not necessarily between the two outer points)
        if (cross !== 0){ return false; }
        var rval;
        if (abs(dxl) >= abs(dyl)){
          rval = (dxl > 0) ? ((p1.x <= currp.x) && (currp.x <= p2.x )) : ((p2.x <= currp.x) && (currp.x <= p1.x ));
        } else {
          rval= (dyl > 0) ? ((p1.y <= currp.y) && (currp.y <= p2.y )) : ((p2.y <= currp.y) && (currp.y <= p1.y ));
        }
        return rval;
    }



    if (!Array.prototype.last){
      Array.prototype.last = function(){
        return this[this.length - 1];
      };
    };



