function Asteroid(_id, Game){
	this.id = _id;
	this.level_objects = [];
    this.width = Math.floor(Game.canvas.width);
    this.height = Math.floor(Game.canvas.height);
	this.coords = {};
    this.coords.x = Math.floor((this.width * 0.3) + Math.random() * (this.width * 0.4));
    this.coords.y = Math.floor((this.height * 0.3) + Math.random() * (this.height * 0.4));
    this.x = this.coords.x;
	this.y = this.coords.y;
	
	this.sim = new Simulation(Game, this.id);
	//console.log(this.id, this.coords);
	this.starsize = 4 + Math.random() * 8;
    this.world = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.heightmap = this.randomTerrain(this.world.length, 5, 40)//[20,10,5,10,20,30,40,0,0,20,10,5,0,10,20,10];
	this.colonised = false;
	this.discovered = false;
	this.destroyed = false;
	this.collision = false;
	this.building_total = 0;
};

Asteroid.prototype.randomTerrain = function(world_length, min_height, max_height){
	var temp = [];
	var height = 0;
	for (i=0; i < world_length; i++){
	    height = Math.floor(min_height + Math.random() * max_height);
		temp.push(height);
	}
	return temp;
};

var Building = function(tileX, x, y, rotation, buildtype){
	this.type = buildtype;
    this.tileX = tileX || 0;
    this.x = x || 0;
    this.y = y || 0;
    this.height = Math.floor(64 + Math.random() * 256);
    this.width = Math.floor(64 + Math.random() * 96);
    this.rotation = rotation || 0;
	this.size=60;
    this.state = {

    }
};

Building.prototype.draw = function(dt, context, xScroll, yScroll){
    context.save();
    context.rotate(this.rotation);
	context.font = this.size + "px Arial";
    context.fillText(this.type, (-this.size * 0.5)-xScroll, (-this.y - (Game.current_world.heightmap[this.tileX]+(this.size*.2))));
    context.restore();
};

function Starfield(Game){
    this.game = Game;
    this.canvas = this.game.canvas;
    this.particles = []; 
    this.zIndex = 0;
    this.createParticles();   
};

Starfield.prototype.draw = function(dt, context){ 
    context.save();
    context.fillStyle="white";
    for(var i=0; i<this.particles.length; i++) { 
        var part = this.particles[i];
        context.fillRect(part.x, part.y, part.radius, part.radius);
    } 
    context.restore();
};

Starfield.prototype.createParticles = function() { 
    //add particle if fewer than 100 
   for(var i=0; i < 100; i++) { 
        this.particles.push({ 
                x: Math.random() * this.canvas.width, //between 0 and canvas width 
                y: Math.random() * this.canvas.height, 
                opacity: Math.random()/1,
                speed: 1 + Math.random() * 2, 
                radius: 1+Math.random(),
                color: '', 
                sourceX: Math.floor(1 * Math.random() * 5) * 64, 
                angle: Math.PI/ 1 + Math.random() * 4,
        }); 
    } 
};

function Level(Game){
    this.game = Game;
	this.starfield = new Starfield(Game);
    this.state = {
        _current: 0,
        BUILD: 0,
		UNIVERSE: 1
    }
};

Level.prototype.Init = function(width, height){
    this.width = 32;
    this.height = 64;
    this.threesixty = Math.PI * 2;
    this.radius = (this.game.current_world.world.length) * this.width;
    this.segment = (this.threesixty/this.game.current_world.world.length);   
    
    this.offset = (Math.PI*3/2);
    this.rotation = 0;
    this.x = (this.game.canvas.width * 0.5);
    this.y = (this.game.canvas.height);
    
    this.selection = "No tile clicked";
	this.buildings = ['🏢','🏭','🏪','⚗️','🚰','🏬', '🏗']; // Add buildings here
	this.description = ['A mine: get ore, sell ore, make money!','Power! You need power to keep it all going!','Food! Feed your workers a hearty meal.','Oxygen generator - Trust me you need O2!','Water - quench your workers thirst!','Accomodation! Everyone needs a place to rest their head!', 'Factory! Build cool stuff!']; // Add buildings here
	this.current_building_type = 0;
	
};

Level.prototype.showDescription = function(_id){
    Game.addMessage("Building type", this.description[_id]);	
};

Level.prototype.setBuildingType = function(_id){
	this.current_building_type = _id;
    //this.game.SellMenu()
};

Level.prototype.Build = function(action_button){    
	var player_idx = Game.player.tile;
	var mouse_idx = this.mouse.tile;
	var idx = mouse_idx;
	this.building_total = Game.current_world.building_total;
	if (action_button == true){
		idx = player_idx;
	}
	console.log(this.game.current_world.world[idx])
	if (Game.state._current == Game.state.PLANET && Game.current_world.world[idx] == 0) { // Nothing in this space yet.
        var radian = idx * this.segment+(this.segment * 0.5);
        var x = (idx * this.segment);
        var y = this.radius;
        console.log(Game.current_world.sim.power, this.current_building_type) 
     	if((Game.current_world.sim.power== 0 || Game.current_world.sim.power/this.building_total < 5) && this.current_building_type != 1){ // Is there enough power to build. Stop unless building a power plant.
		 
			Game.addMessage("Asteroid " + Game.current_world.id, "You need more power! Build a power plant.");
		//	return;
        }

	    var building = new Building(idx, x, y, radian, this.buildings[this.current_building_type]);
		Game.current_world.building_total += 1;
        
        this.selection = idx;
		Game.current_world.world[idx] = building;
		
	    Game.current_world.level_objects.push(building); 
		
		// Update the sim with the building type and costs
		switch (this.current_building_type){
            case 0: //Mine
                Game.current_world.sim.buyMine();
                break;
            case 1: //Power
                Game.current_world.sim.buyPower();
                break;
            case 2: // Food
			    Game.current_world.sim.buyFood();
                break;
            case 3: // Oxygen
			    Game.current_world.sim.buyOxygen();
                break;
            case 4: //Water
			    Game.current_world.sim.buyWater();
                break;
            case 5: //House
			    Game.current_world.sim.buyHouse();
                break;
            case 6: //Factory
			    Game.current_world.sim.buyFactory();
                break;

        }
	}
	Game.ProcessMessages();
	Game.current_world.sim.update();
	Game.current_world.sim.draw();
    return true;
};

Level.prototype.AdjustTile = function(alpha, beta){
    return (alpha - beta) * Game.current_world.world.length / (2 * Math.PI);
};

Level.prototype.deleteBuilding = function(){
	var player_idx = Game.player.tile;
	var mouse_idx = this.mouse.tile;
	var idx = mouse_idx;
	this.building_total = Game.current_world.building_total;
	//console.log(this.game.current_world.world[idx])
	if (Game.state._current == Game.state.PLANET && Game.current_world.world[idx] != 0) { // Nothing in this space yet.
		Game.current_world.world[idx] = 0;
	    Game.current_world.level_objects.splice(idx); 
	}
	Game.ProcessMessages();
	Game.current_world.sim.update();
	Game.current_world.sim.draw();
    return true;
};

Level.prototype.getMouseAngle = function(mouse){
    // Calculate the arctan between the mouse and the level x and y at the world center.
    var dx = mouse.x - (this.x - Game.camera.xScroll);
    var dy = mouse.y - ((this.y - Game.camera.yScroll) * Game.camera.zoom);
    var arctan = Math.atan2(dy, dx); 
 
    // Reset angle to 0 on full rotation
    if(dy < 0){
        angle = (Math.PI * 2) + arctan;
    } else { 
        angle = arctan;
    }

    // Deduct world rotation
    angle -= this.rotation;

    // Get original tile position offset tile position and calculate final tile.
    // N.B segment = 360/worldsize.

    var orig_tile = angle/this.segment;
    var offset_tile = this.offset/this.segment;
    var final_tile = Math.floor(offset_tile - orig_tile);

    // Adjust tile according to offset.
    var tile = final_tile;
    if (tile < 0){
        tile = (tile + Game.current_world.world.length);
    } 
    if(tile > 0){
        tile = Math.abs((Game.current_world.world.length-1) - tile);
    }
    if(Game.current_world.world.length + final_tile == Game.current_world.world.length){
        tile = this.game.current_world.world.length - 1;
    }
    
    return {dx: dx, dy: dy, degrees: (angle * 180/Math.PI).toFixed(2), tile: Math.floor(tile), radian: angle.toFixed(2)}; 
};

Level.prototype.Terraform = function(){
    var segment = this.getMouseAngle(Game.mouse);
    this.game.current_world.heightmap[segment.tile] -= 10;
};

Level.prototype.checkRotation = function(angle){
    if(angle < -this.threesixty){
        angle = this.threesixty;
    }
    if(angle > this.threesixty){
        angle = 0;
    }
    return angle;
};

Level.prototype.update = function(dt, xScroll, yScroll){
    if (Game.player.left){
        this.rotation += Game.player.vx*dt;
    }
    if (Game.player.right){
        this.rotation -= Game.player.vx*dt;
    }
	
    this.rotation = this.checkRotation(this.rotation); 
	this.mouse = this.getMouseAngle(Game.mouse);
	
    if(Game.mouse.clicked){
        Game.mouse.clicked = false;
        this.Build();
    }
    
    if(Game.player.action) {
        this.Build(true);
    }
    Game.camera.Set(Game.player.x, Game.player.y - (this.radius * 0.98)-150);
};

Level.prototype.drawWorld = function(context, xScroll, yScroll){
    // Draw world
    context.strokeStyle = "rgb(100,100,100)";
    context.lineWidth = 10;
	
    for(this.tileX = 0; this.tileX < Game.current_world.world.length; this.tileX++){
        context.beginPath();
        //arc(x, y, radius, startAngle, endAngle, anticlockwise)
        context.arc(
            0, 
            0, 
            this.radius + Game.current_world.heightmap[this.tileX], 
            this.offset + (this.tileX * this.segment), 
            this.offset + ((this.tileX + 1) * this.segment), 
            false
        );
        context.stroke();

		// Draw ground
		context.lineStyle = "grey"
		
        context.lineTo(0, 0);
		
        context.fillStyle = "grey"
        context.fill();
        context.closePath();
    }
};

Level.prototype.draw = function(dt, context, xScroll, yScroll) {
	
    context.save();
    context.setTransform(
        Game.camera.zoom, 
        0, 
        0, 
        Game.camera.zoom, 
        this.x - xScroll, 
        (this.y - yScroll) * Game.camera.zoom
    );
    context.rotate(this.rotation);
    // Draw Buildings
    for (var i = 0; i < Game.current_world.level_objects.length; i++) {
        if(Game.current_world.level_objects[i]){
            Game.current_world.level_objects[i].draw(dt, context, xScroll, yScroll);
        }
    }
	// Draw the world
    this.drawWorld(context, xScroll, yScroll);
    context.restore();
};