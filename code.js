

/**
 * Our actual sketch
 * @param  {p5} p P5 reference
 * @return {}   nothing
 */
 s = function( p ) {


//----------------------------------
// variables
//----------------------------------
//

//change this to your own playername;
this.playername = "SEAD";

/**
 * Background: The background color for our sketch, can be modified
 * @type {String}
 * @namespace changeable variables
 */
 //----- COLORS ------------------
 this.backgroundColor = '#660066'; //rgb(102, 0, 102)
 this.sensorColor = 'yellow';
 this.gridColor = p.color(255, 200, 0, 50);
 this.avatarCircleColor = 'white';
 this.avatarRecentColor = 'grey';
 this.historyColor = 'white';

  //----- SIZES ------------------
 //the width of the sensor line
 this.sensorWidth = 1;

 //the width of the grid line
 this.gridWidth = 1;

 // the radius of the avatar circle
 this.avatarCircleWidth = 10;

//the circles at the corners of the history lines
this.historyCircleSize = 30;

// the width of the history lines
this.historyLineWidth = 1;




//----- TEXT ------------------
this.deadText = "WINNER";
this.winnerText = " † DEAD †";

//----- SENSORS ------------------
/**
 * Sensorlength is a variable that sets the length of the 
 * the sensors-graph in game so: width/sensorLength;
 * @type {Number}
 */
 this.sensorLength = 4;

/**
 * SensorHeigth is a variable that sets the height of the sensors-graph
 * in game so: height/sensorHeight;
 * @type {Number}
 */
 this.sensorHeigth = 20;


//----------------------------------
// game variables
//----------------------------------
// modifying these will change the game 
// behavior

/**
 * The desired framerate
 * @type {Number}
 */
 this.fps = 10;

/**
 * The grid is the amount of points that makes up the game field
 * So we have 100 (x) * 100 (y) points
 * @type {Number}
 */
 this.grid_size = 100;

/**
 * The avatar, the player, you.
 */
 this.avatar;

 /**
  * Additional object for storying other players history-lines
  */
  this.playerhistory;

  this.serverupdatepf = 30;

  this.serverURL = 'http://biomoddlondon-sead.rhcloud.com/';

  this.sensors = [];



//----------------------------------
// MAIN GAME FUNCTIONS
//----------------------------------
  // ---- setup ----------------------
  // will be executed once | at the beginning
  p.setup = function() {
    myCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
    myCanvas.parent('myContainer');

    //set the framerate
    p.frameRate(fps);
    avatar = Avatar();
    playerhistory = Playerhistory();

    login();

    getData();
  };

  // ---- draw ----------------------
  // will be executed every frame 
  // use this for updating and drawing
  p.draw = function() {
    if (p.frameCount%this.serverupdatepf==0){
      getData();
    }

    // -- update 
    avatar.update();

    if (avatar.checkTurned()){
      playerhistory.set(this.playername, avatar.history);
      sendHistory(); // send to server

    }

    if (playerhistory.checkBump(avatar.position)){
      avatar.kill();
    }

  // -- draw
  p.background(backgroundColor);
  drawGrid();
  drawSensors();
  playerhistory.draw();
  avatar.draw();

  var wrongsize = true;
  var twidth = null;
  var textSize = 100;

  while(wrongsize){
    var txt = "";
    p.textSize(textSize);
    if(playerhistory.winner()&&avatar.alive()){
      txt = this.deadText;
    } else if (!avatar.alive()) {
      txt = this.winnerText;
    }
    twidth = p.textWidth(txt);
    if (twidth < p.width*.8){
      wrongsize = false;
    } else {
      textSize /= 2;
    }
  }
  
  p.text(txt, (p.width-twidth)/2, p.height/12);
};


//----------------------------------
// SERVER FUNCTIONS
//----------------------------------
this.callAPI = function(path, callback, params){
  if(!params){
    params = {};
  }
  p.httpGet(this.serverURL+path, params, 'jsonp', callback);
}

function optimiseData(data){
  delete data.responseText;
}

this.getData = function(){
  callAPI("sensor/getSensors", function(data){
    optimiseData(data);
    this.sensors = data;
  })
}

this.login = function(){
  callAPI("game/login", function(data){
    console.log(data);
    if(!data){
      this.deadText = this.winnerText = "ACCOUNT ALREADY IN USE";
      avatar.kill(true);
    }
  }, {n:this.playername});
}

this.sendHistory = function(){
  callAPI("game/updateHistory", function(data){
    optimiseData(data);
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i].name !== this.playername){
        console.log(data[i].data);
        if(data[])
        this.playerhistory.set(data[i].name, data[i].data);
      }
    };
  }, {n: this.playername, d: this.avatar.history});
}

this.killAvatarServer = function(){
  callAPI("game/kill", function(data){}, {n:this.playername});
}


//----------------------------------
// SENSOR FUNCTIONS
//----------------------------------
this.drawSensors = function(){
  var beginy = p.height/4;
  var offset = p.height/this.sensorHeigth;
  var offsetx = p.width/this.sensorLength;
  var prevpoint = {};

  if(p.frameCount%3==0){
    return;
  }

  p.noFill();
  p.stroke(this.sensorColor);
  p.strokeWeight(this.sensorWidth);

  p.push();
  for (var i = this.sensors.length - 1; i >= 0; i--) {
    var data = this.sensors[i].averageData;
    p.beginShape();
    for (var d = data.length - 1; d >= 0; d--) {
      var x = offsetx + d/data.length*(p.width - offsetx*2);
      var y = beginy + data[d]*offset;
      p.vertex(x, y);

      //check for bump with avatar
      var newpoint = makePoint(x,y);

      if (d < data.length-1){
        if (pointOnLine(world2grid(prevpoint), world2grid(newpoint), this.avatar.position)){
          this.avatar.kill();
        } 
      }

      prevpoint = newpoint;

    };
    p.endShape();
    beginy+=p.height/4;
  }
  p.pop();
}




//----------------------------------
// I/O FUNCTIONS
//----------------------------------
// gets called everytime we press the keyboard
p.keyPressed = function() {
  switch (p.key) {
    case "W":
    avatar.move(true);
    break;
    case "X":
    avatar.move(false);
    break;
    case "R": //'r'
    globalReset(); 
    killAvatarServer();
    break;
  }
}



//----------------------------------
// WORLD FUNCTIONS
//----------------------------------

  /**
   * Drawgrid draws the grid function over the world
   * so when our [grid_size = 100] it will draw 10.000 lines
   * @return {}  returns nothing
   */
   this.drawGrid = function(){
    var gridColor = this.gridColor;

    p.push();
    p.noFill();
    p.strokeWeight(this.gridWidth);
    p.stroke(gridColor);

  //loop: goes from x=0 -> x=grid_size
  for (var x = 0; x < grid_size; x++){
    var worldpoint = grid2world(makePoint(x,x));
    // draws the vertical lines
    p.line(worldpoint.x, 0, worldpoint.x, p.height);
    // draws the horizontal lines
    p.line(0, worldpoint.y, p.width, worldpoint.y);
  }

  p.pop();
}

//----------------------------------
// AVATAR FUNCTIONS
//----------------------------------
/**
 * Constructs a new avatar
 *
 * @class  Avatar
 * @classdesc The player instance
 */
 this.Avatar =  function(){

  // ---- public ----------------------
  // -------- methods -----------------
  /**
   * Initializes the avatar
   * (private)
   * @return {} returns nothing
   */
   var init = function(){
    reset();
  }

  /**
   * resets the avatar
   */
   var reset = function(){

    function makeRandomGrid(){
      var offset = grid_size/4;
      return p.random(offset, grid_size-offset);
    }

    //set members
    position = makePoint(makeRandomGrid(), makeRandomGrid());
    orientation = p.floor(p.random(100)%8); 
    speed = 1;
    alive = true;
    history = [];

    updateHistory();
    
  }

  /**
   * updates the avatar location
   * @return {} nothing
   */
   var update = function(){
    if (!alive){ return; }

    /**
     * Updates the location based on the orientation
     */
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

    /**
     * Checks wether the avatar has hit the borders
     */
     var checkBorders = function(){
      if ((position.x <= 0) || (position.x >= grid_size) || (position.y <= 0) || (position.y >= grid_size)){
        updateHistory();
        alive = false;
      }
    }

    // call our 2 functions to perform the update
    updateOrientation();
    checkBorders();
  }

  /**
   * draws the actual avatar
   * @return {} returns nothing
   */
   var draw = function(){
    var circleSize = avatarCircleWidth;
    p.push();
    p.stroke(avatarCircleColor);
    p.noFill();
    var ppos = makePoint(Math.floor(position.x),Math.floor(position.y));
    var worldpoint = grid2world(ppos);
    circle(worldpoint, circleSize);
    p.stroke(avatarRecentColor);
    lineFromPoints(worldpoint, grid2world(getLastPoint()));
    p.pop();
  }

  /**
   * changes the orienation of the avatar,
   * gets called when a key is pressed
   * @param  {Bool} left set to "true" if you want 
   * to turn left
   * @return {}      returns nothing
   */
   var move = function(left){
    left? orientation--: orientation++;
    
    if (orientation<0){
      orientation = 7;
    } else if (orientation > 7){
      orientation = 0;
    }

    updateHistory();
  }

  /**
   * Check if the avatar has turned,
   * so we can update our location to the
   * server and so on.
   * @return {Bool} returns true if
   * we have turned.
   */
   var checkTurned = function(){
    var rv = hasturned;
    hasturned = false;
    return rv;
  }

  var kill = function(safeserver){
    if (!safeserver){
      killAvatarServer();  
    }
    alive = false;
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
  
  /**
   * Auxiliary function that gets called
   * when we have turned
   * (private)
   * @return {} returns nothing
   */
   function updateHistory(){
    hasturned = true;
    history.push(makePoint(Math.floor(position.x), Math.floor(position.y)));
  }

  /**
   * Gets the last point of our own history
   * (private)
   * @return {Point} A point object
   */
   function getLastPoint(){
    return history.last();
  }

  // -------- private members -----------------

  /**
   * The orientation of the avatar which is one of 8 numbers
   * C bottom sketch for more information
   * (private)
   * @type {Number}
   */
   var orientation;

  /**
   * The progressing speed of the avatar
   * (private)
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
    kill: kill,
    checkTurned: checkTurned,
    position: position,
    history: history,
    move: move,
    alive: function(){return alive;}
  }
}


//----------------------------------
//  PLAYERSHISTORY FUNCTIONS
//----------------------------------
/**
 * Constructs a new Playerhistory
 *
 * @class  Playerhistory
 * @classdesc datastructure that maintains
 * all of the history lines of the players
 */

 this.Playerhistory = function(){
  // ---- public ----------------------

  // -------- methods -----------------
  /**
   * resets the object
   */
   var reset = function(){
    memberlines = {};
  }

  /**
   * updates a specific players history
   * (could be highly modified) 
   * @param {string} name the name of the player
   * @param {Array} pts  an array of points
   */
   var set = function(name, pts){
    memberlines.name = pts;
  }

  /**
   * draws all of the players history
   */
   var draw = function(){

    for (var member in memberlines){
      p.push();
      p.noFill();
      p.strokeWeight(historyLineWidth);
      p.stroke(historyColor);

      var currentLine = memberlines[member];

      p.beginShape();

      for (var idx = 0, len = currentLine.length; idx < len; idx++){
        var pt = currentLine[idx];
        vertexFromPoint(grid2world(currentLine[idx]));
        circle(grid2world(currentLine[idx]), historyCircleSize);
      }
      p.endShape();

      p.pop();
    }
  }

  this.winner = function(){
    return (Object.keys(memberlines).length == 1);
  }

  /**
   * checks wether the point bumps into any of the lines
   * @param  {Point} pt the point we're checking
   */
   var checkBump = function(pt){

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
    checkBump: checkBump,
    winner: winner
  } 
}

//----------------------------------
// AUX FUNCTIONS
//----------------------------------
//makes an object containing x and y coordinates
/**
 * makePoint : makes an Point object containing x and y coordinates
 * @param  {number} x 
 * @param  {number} y 
 * @return {Point}   
 * @namespace functions
 *  */
 var makePoint = function(x, y){
  (x == null)? x = 0 : x=x;
  (y == null)? y = 0 : y=y;
  return {x: x, y: y};
}

/**
 * world2grid : Remaps a point from the world (screensize) to the grid
 * @param  {Point} pt the original point
 * @return {Point}    the remapped point
 * @namespace functions
 */
 function world2grid(pt){
  return makePoint(Math.floor(pt.x / p.width * grid_size), Math.floor(pt.y / p.height * grid_size));
}

/**
 * grid2world : Remaps a point from the grid to the world (screensize)
 * @param  {Point} pt the original point
 * @return {Point}    the remapped point
 * @namespace functions
 */
 function grid2world(pt){
  return makePoint(Math.floor(pt.x * p.width / grid_size), Math.floor(pt.y * p.height / grid_size));
}

/**
 * lineFromPoints : draws a line between two points
 * @param  {Point} p1 
 * @param  {Point} p2
 * @namespace functions
 */
 function lineFromPoints(p1, p2){
  p.line(p1.x, p1.y, p2.x, p2.y);
}

/**
 * circle: draws a circle using a point
 * @param  {Point} pt     the center of the circle
 * @param  {Number} radius the radius of the point
 * @namespace functions
 */
 function circle(pt, radius){
  p.ellipse(pt.x, pt.y, radius, radius);
}

/**
 * vertexFromPoint: draws a vertex from a Point object
 * @param  {Point} pt the point we're adding to the shape
 * @namespace functions
 */
 function vertexFromPoint(pt){
  p.vertex(pt.x, pt.y);
}

 // returns true if point lies on the line
 // http://stackoverflow.com/questions/11907947/how-to-check-if-a-point-lies-on-a-line-between-2-other-points
 /**
  * checks wether a point lays on the line between
  * two other points
  * @param  {Point} p1    the first point of the line
  * @param  {Point} p2    the second point of the line
  * @param  {Point} currp the point we're checking
  * @return {Bool}       returns true if the point lays on the line
  * @namespace functions
  */
  function pointOnLine(p1, p2, currp){

    p1 = makePoint(Math.floor(p1.x),Math.floor(p1.y));
    p2 = makePoint(Math.floor(p2.x),Math.floor(p2.y));
    currp = makePoint(Math.floor(currp.x),Math.floor(currp.y));

    var dxc = currp.x - p1.x;
    var dyc = currp.y - p1.y;

    var dxl = p2.x - p1.x;
    var dyl = p2.y - p1.y;

    var cross = p.floor(dxc * dyl - dyc * dxl);

        // check if point lays on line (not necessarily between the two outer points)
        if (cross !== 0){ return false; }
        var rval;
        if (p.abs(dxl) >= p.abs(dyl)){
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
    };

    var globalReset = function(){
      if(myp5){
        myp5.remove();
        myp5.canvas.remove();  
      }

      myp5 = new p5(s);  
    }

    globalReset();


//----------------------------------
//  NOTES
//----------------------------------
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
  //    +--------------------------+
  //    This is how our orientation works
  //    orientation is a number representing
  //    a direction in which the avatar is going
  //    for example "0" means going straight up
