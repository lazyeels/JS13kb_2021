function Camera(Game){
    this.x = Game.canvas.width * 0.5;
    this.y = Game.canvas.height * 0.5
    this.xScroll = 0;
    this.yScroll = 0;
};

Camera.prototype.Init = function(){
    this.speed = 2;
    this.vx = this.speed;
    this.vy = this.speed;
    this.xScroll = 0;
    this.yScroll = 0;
    this.zoom = 1;
	this.zoom_limit = 0.3;
    this.width = 32;
    this.height = 32;
    this.state = {
        _current: 0,
        FOLLOW: 0,
        PAN: 1,
    }
    this.cameraPosition = [this.xScroll, this.yScroll];
    //these will be used to lerp to the next position 
    this.prevCameraPosition = [this.xScroll, this.yScroll]; 
    this.curCameraPosition = [this.xScroll, this.yScroll]; 
    this.lerpAmount = 1.0;
    this.target = undefined; 
	this.prev_target = null;
	
};

Camera.prototype.Set = function(X, Y){
	this.prev_target = this.target;
    this.target = {x: X, y: Y};
};

// Update Method
Camera.prototype.update = function(dt){

    //if(this.target){
    this.dx = (this.target.x - this.x);
    this.dy = (this.target.y - this.y);
    //the camera moved 
    this.cameraPosition = [this.xScroll, this.yScroll];
	
    if(this.cameraPosition != this.curCameraPosition){ 
        this.lerpAmount = 0.0; 
        this.curCameraPosition = this.cameraPosition; 
    } 
		
    if(this.lerpAmount < 1.0){
        this.lerpAmount += 0.05; 
    } else {
        this.prevCameraPosition = this.curCameraPosition; 
    }

    this.xScroll = utils.Lerp(this.dx, this.curCameraPosition[0], this.lerpAmount); 
    this.yScroll = utils.Lerp(this.dy, this.curCameraPosition[1], this.lerpAmount); 
    //}
    if (this.zoom <= this.zoom_limit) {
		this.target = {'x': Game.player.x, 'y': Game.player.y};	
	    
	} else {
		this.target = {'x': Game.canvas.width*0.5, 'y': Game.canvas.height*0.5};
	}
};

Camera.prototype.keydown = function (event) {
    switch (event.keyCode) {
        case 187: //+  
            this.zoom += 0.1;
            break;
        case 189: //-
            this.zoom -= 0.1;
            break;
        case 107: //+  
            this.zoom += 0.1;
            break;
        case 109: //-
            this.zoom -= 0.1;
            break;

    }
};

Camera.prototype.keyup = function (event) {
    switch (event.keyCode) {
        case 187: //+        
            break;
        case 189: //-
            break;
    }
};


function Player(Game){
    // Init
    this.game = Game;
};

Player.prototype.Init = function(color, x, y){
//    this.sprite = Game.asset.cache['robot'];
    this.x = x || this.game.canvas.width * 0.5;
    this.y = 200//y || this.game.canvas.height * 0.5
    this.orig_width = 16;
    this.orig_height = 32;

    this.width = this.orig_width;
    this.height = this.orig_height;
    this.size = 30;
    this.color = color || 'black';
    this.vx = 0;
    this.vy = 0;
    this.speed = 0.5;
    this.rotation = 0;
    // Key detection
    this.right = false;
    this.left = false;
    this.up = false;
    this.down = false;
    this.fire = false;
    this.pause = false;
    this.jump = false;
    this.friction = 0.1;
    this.gravity = -6;
	this.AABB = {};
};


Player.prototype.getBoundingBox = function(xScroll, yScroll){
    this.newposition = {
        x: this.x + this.vx, 
        y: this.y + this.vy
    };

    this.AABB['bottom'] = {
        x: this.x + (this.width * 0.5), 
        y: this.newposition.y
    };
};

Player.prototype.checkCollisions = function(tiletype){
    this.tile = this.getTile(Game.level.rotation);
    if(this.AABB['bottom'].y < (Game.level.y - Game.current_world.heightmap[this.tile])){
        this.vy += 0.5;
    } else if(this.vy != this.gravity){
        this.up = false;
        this.jump = false;
        this.vy = 0;
    } else if(this.up && this.jump){
        this.jump = true;
        this.vy = this.gravity;
    }
};

Player.prototype.getTile = function(rotation){
    var tile = Math.floor(rotation/Game.level.segment); 

    if(rotation > 0.0){
        tile = Math.abs((Game.current_world.world.length - tile)-1);
    } else {
        tile = Math.abs(tile)-1;
    }
    if(rotation == 0){
        tile = 0;
    }
    return tile;
};


Player.prototype.Gravity = function(dt){
    this.y += this.vy;
};

// Update Method
Player.prototype.update = function(dt, xScroll, yScroll){
    this.zindex = this.y;
    this.Gravity(dt);
    this.getBoundingBox();
    this.checkCollisions();
    Game.player = this;
};

Player.prototype.draw = function(dt, context, xScroll, yScroll){
    context.save();
    context.fillStyle = this.color;    
    //context.setTransform(scaleX, skewX, skewY, scaleY, translateX, translateY);
    context.setTransform(Game.camera.zoom, 0, 0, Game.camera.zoom, this.x-xScroll, (this.y-yScroll) * Game.camera.zoom);
    // Draw helmet base
	context.beginPath();
	context.fillStyle = "silver";    
    context.arc(0, -(Game.level.radius + (this.height-3)), 13, 0, 2 * Math.PI, false);
    context.fill();
	context.lineWidth = 2;
    context.stroke();

	// Draw body
    context.fillStyle = "pink";    
    context.fillRect(-(this.width*0.5), -(Game.level.radius + this.height), this.width, this.height);
      
	// Draw helmet outline
	context.beginPath();
    context.arc(0, -(Game.level.radius + (this.height-3)), 13, 0, 2 * Math.PI, false);
    context.strokeStyle = "silver";    
	context.fillStyle = "silver";    
	context.lineWidth = 2;
    context.stroke();
	
	// Draw suit
    context.fillRect(-(this.width*0.5), -(Game.level.radius + this.height-10), this.width, this.height-10);
	
	// Draw eyes
    context.fillStyle = "black";    
	if (this.left){
	    context.fillRect(-(this.width*0.5)+5, -(Game.level.radius + this.height)+5, 3, 4);
	    context.fillRect(-(this.width*0.5)+1, -(Game.level.radius + this.height)+5, 3, 4);
	} else
    if (this.right){
	    context.fillRect(-(this.width*0.5)+8, -(Game.level.radius + this.height)+5, 3, 4);
	    context.fillRect(-(this.width*0.5)+12, -(Game.level.radius + this.height)+5, 3, 4);
	} else{
	    context.fillRect(-(this.width*0.5)+4, -(Game.level.radius + this.height)+5, 3, 4);
	    context.fillRect(-(this.width*0.5)+8, -(Game.level.radius + this.height)+5, 3, 4);
	}
	//context.rotate(this.rotation);
	//context.font = this.size + "px Arial";
	//context.fillText('👨🏽‍🚀', (-this.size * 0.5) -(Game.level.radius + this.size), this.size, this.size);
	//context.fillText('👨🏽‍🚀', (-this.size * 0.5)-xScroll, (-this.y - (Game.level.heightmap[this.tileX]+(this.size*.2))));
    context.restore();
};

Player.prototype.keydown = function (event) {
   // console.log(event.keyCode);
    event.preventDefault(); 
    switch (event.keyCode) {
        case 37: //left
            this.left = true;
            this.vx = this.speed;
            break;
        case 39: //right
            this.idle = false;
            this.right = true;
            this.vx = this.speed;
            break;
        case 38: //up
            this.up = true;
            if(this.up && !this.jump){
                this.jump = true;
                this.vy = this.gravity;
            }
            break;
        case 40: //down
            this.down = true;
            break;
        case 65: //left
            this.left = true;
            this.vx = this.speed;
            break;
        case 68: //right
            this.right = true;
            this.vx = this.speed;
            break;
        case 87: //up
            this.up = true;
            if(this.up && !this.jump){
                this.jump = true;
                this.vy = this.gravity;
            }
            break;
        case 83: //down
            this.down = true;
 //           this.vy = this.speed;
            break;

        case 32: //action - SPACE
            this.action = true;
            break;

        case 69: //debug
            if(Game.debug == false){
                Game.debug = true;
            } else if(Game.debug == true){
                Game.debug = false;
            }
            break;
    }
};

Player.prototype.keyup = function (event) {
   // this.vy = 0;
    switch (event.keyCode) {
        case 37: //left
            this.left = false;
            this.vx = 0;
            break;
        case 39: //right
            this.right = false;
            this.vx = 0;
            break;
        case 38: //up
            this.up = false;
            break;
        case 40: //down
            this.down = false;
            break;

        case 65: //left
            this.left = false;
            this.vx = 0;
            break;
        case 68: //right
            this.right = false;
            this.vx = 0;
            break;
        case 87: //up
            this.up = false;
            break;
        case 83: //down
            this.down = false;
            break;

        case 32: //Action
            this.action = false;
            break;
    }
};
