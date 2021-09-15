// Game Objects
function Game(fps){
    this.debug = true;
    this.initialised = false;
    this.info = false;
     
    this.time = 0; 
    this.timepassed = 0;
    this.canvas = document.getElementById('canvas'); 
	this.context = this.canvas.getContext('2d'); 
    this.canvas.width = document.body.clientWidth-10;
	this.canvas.height = document.body.clientHeight-10;

    this.mouse = utils.captureMouse(this.canvas);
    
    this.camera = new Camera(this);
    this.level = new Level(this);
    this.player = new Player(this);
	this.game_started = false;
	
    this.ship_wait_time = 0;
	
	this.messages = [];
    this.state = {
        _current: 0,
        PLANET: 0,
		UNIVERSE: 1,
		UNIVERSE_VIEW: 2,
    }
	this.universe = [];
	this.current_world = null;
	this.num_worlds = 10;
	document.getElementById("ui").style.display = 'none';
	document.getElementById("menu").style.display = 'none';
	document.getElementById("build_menu").style.display = 'none';
    this.start_world = null;
   // this.Init(60);
};

Game.prototype.generateUniverse = function(num_asteroids){
	var temp = [];
	for (var i =0; i< num_asteroids; i++){
	    temp.push(new Asteroid(i, this));
	}
	return temp;x
	
};

Game.prototype.playGame = function(elem){
	document.getElementById("titlescreen").style.display = 'none';
	document.getElementById("ui").style.display = 'block';
	document.getElementById("menu").style.display = 'block';
	document.getElementById("build_menu").style.display = 'block';
	Game.game_started = true;
	Game.Init(30);
	
};

Game.prototype.Init = function(fps){
    this.initialised = false;
    this.fps = fps || 25;
    this.timeSinceLastFrame = new Date().getTime();
    this.timeBetweenFrames = 1/fps;
    this.night_time = true;
    this.game_objects = [];
    
    this.camera.Init();
	
	this.universe = this.generateUniverse(this.num_worlds);
	
	for (var s=0; s < this.universe.length; s++){
	    this.universe[s].sim.Init();
	}
	
	this.current_world = this.universe[0];
	this.current_world.sim.P = 1;
	this.current_world.sim.store = 1000;
	this.current_world.sim.M = 2500+Math.floor((180 + Math.random() * 150)) * this.current_world.sim.P; // Money
    this.current_world.discovered = true;
	this.current_world.colonised = true;
	
    this.level.Init();
    this.player.Init('pink', undefined, 200);
    this.camera.Set(this.level);
	this.cargo_ship = new Ship(this);
	this.cargo_ship.Init();
    document.getElementById('world-id').innerHTML = this.current_world.id;


	if (this.game_started == true){
		this.cargo_ship.drawSellMenu();
		document.getElementById("menu").style.display = 'block';	
	};
	
	
    this.initialised = true;
	
};

Game.prototype.keydown = function (event) {
    if(this.initialised){
        this.player.keydown(event);
        this.camera.keydown(event); 
    }
};

Game.prototype.keyup = function (event) {
    if(this.initialised){
        this.player.keyup(event);
        this.camera.keyup(event); 
    }
};

Game.prototype.GameOver = function(){
    var html = ""
};

Game.prototype.addMessage = function(id, text){
    this.messages.push(id + ': ' + text);
	console.log("Message", text)
};

Game.prototype.ProcessMessages = function(){
    if(this.messages.length == []){
        this.drawAlert("Nothing to report.");
    } else {
        for (var i = 0; i < this.messages.length; i++) {
            this.drawAlert(this.messages[i]);
			
            if(this.time){
				if (this.messages.length <= 1) {
				   this.messages = [];
				} else {
                    this.messages.splice(i, 1);
				}
            }
        }
    }
};

Game.prototype.drawAlert = function(message){
    var html = '<span id="mymessage" class="title">'+message+'</span>';
    document.getElementById('alert_text').innerHTML = html;
};

Game.prototype.Resize = function(){
    var screen_height = window.innerHeight;
    var screen_width = window.innerWidth;
    var width = screen_width;
    var height = screen_height;
    if(screen_height > screen_width){
        this.ratio = this.canvas.height/this.canvas.width;
        height = this.ratio * screen_width;
    }else{
        this.ratio = this.canvas.width/this.canvas.height;
        var width = screen_height * this.ratio;
    }
};

Game.prototype.Timer = function(dt){
    if(this.timepassed >= 2){
        this.timepassed = 0;
        return true;
    } else {
        this.timepassed += dt;
        return false;
    }
};

Game.prototype.getLift = function(){
	if (this.state._current == this.state.PLANET){
	    this.state._current = this.state.UNIVERSE;
	}
};

Game.prototype.showStarMap = function(){
	if (this.state._current == this.state.PLANET){
	    this.state._current = this.state.UNIVERSE_VIEW;
		document.getElementById('get-lift').innerHTML = "Back"
		this.start_world = this.current_world;
	} else
	if (this.state._current == this.state.UNIVERSE_VIEW){
	    this.state._current = this.state.PLANET;
		document.getElementById('get-lift').innerHTML = "Star map";
		this.current_world = this.start_world;
	}
};


Game.prototype.increaseSale = function(type){
    var quantity = 0;
    switch(type) {
        case 'ore':
            quantity = 100;
            break;
        case 'food':
            quantity = 10;
            break;
        case 'worker': 
            quantity = 1;
            break;
        case 'water': 
            quantity = 10;
            break;

    }
    if(this.cargo_ship.supply[type].bought + quantity <= this.cargo_ship.supply[type].total + this.cargo_ship.supply[type].bought){
        this.cargo_ship.supply[type].total -= quantity;
        this.cargo_ship.supply[type].bought += quantity;
        document.getElementById(type +'saletotal').innerHTML = parseInt(this.cargo_ship.supply[type].bought);
        document.getElementById('total' + type).innerHTML = parseInt(this.cargo_ship.supply[type].total);
    }
};

Game.prototype.decreaseSale = function(type){
    var quantity = 0;
    switch(type) {
        case 'ore':
            quantity = 100;
            break;
        case 'food':
            quantity = 10;
            break;
        case 'worker': 
            quantity = 1;
            break;
    }

    if(this.cargo_ship.supply[type].bought - quantity >= 0){
        this.cargo_ship.supply[type].total += quantity;
        this.cargo_ship.supply[type].bought -= quantity;
        document.getElementById(type + 'saletotal').innerHTML = this.cargo_ship.supply[type].bought;
        document.getElementById('total' + type).innerHTML = this.cargo_ship.supply[type].total;
    }
};

Game.prototype.Sell = function(type='ore'){
    this.current_world.sim.M += (this.cargo_ship.supply[type].bought * this.cargo_ship.supply[type].cost);
    this.current_world.sim.store -= this.cargo_ship.supply[type].bought;
    this.cargo_ship.supply[type].bought = 0;
	document.getElementById(type+'saletotal').innerHTML = this.cargo_ship.supply[type].bought;
	document.getElementById('profit').innerHTML = this.cargo_ship.supply[type].bought * this.cargo_ship.supply[type].cost;
	this.cargo_ship.drawSellMenu();
};

Game.prototype.Purchase = function(type){
    this.current_world.sim.M -= this.cargo_ship.supply[type].bought * this.cargo_ship.supply[type].cost;
    this.current_world.sim[type] += this.cargo_ship.supply[type].bought;
	this.cargo_ship.supply[type].bought = 000;
	document.getElementById(type+'saletotal').innerHTML = this.cargo_ship.supply[type].bought;
	document.getElementById('profit').innerHTML = this.cargo_ship.supply[type].bought * this.cargo_ship.supply[type].cost;
	this.cargo_ship.drawSellMenu();
};

Game.prototype.getMouseCollision = function(objectA, objectB){
    var dx = (objectB.x) - objectA.x;
    var dy = (objectB.y) - objectA.y;
    dist = Math.sqrt(dx * dx + dy * dy);
	if (dist < 25){
		return true;
	} else {
		return false;
	}
};


Game.prototype.update = function(){
    if(this.initialised){
        // Calculate the time since the last frame
        var thisFrame = new Date().getTime();
        this.dt = (thisFrame - this.timeSinceLastFrame)/1000;
        this.timeSinceLastFrame = thisFrame;
        this.time = this.Timer(this.dt);
		
		if (this.current_world.id != this.cargo_ship.current_world.id){
            document.getElementById('menu').style.display = 'none';
		} else {
			document.getElementById('menu').style.display = 'block';
		}
       
		if(this.time) {
			for (var s=0; s < this.universe.length; s++){
				this.universe[s].sim.update();
				this.universe[s].sim.day += this.universe[s].sim.day_speed;
                if (this.universe[s].sim.day >= 365 ) {
		    		this.universe[s].sim.year += 1;
                    Game.addMessage("MineCorp", 'You survived another year! \(^__^)/');
	    		}
	        }
			if (this.ship_wait_time >= 2 && this.cargo_ship.show == true){
                Game.addMessage("MINECORP CARGO SHIP", 'Cargo ship leaving soon...!');
            }
             
			if (this.ship_wait_time >= 3 && this.cargo_ship.show == true){
				this.cargo_ship.leave();
				this.ship_wait_time = 0;
				Game.addMessage("MINECORP CARGO SHIP", 'Cargo ship has left for asteroid ' + this.cargo_ship.current_world.id);
			} 
			if (this.ship_wait_time >= 4 && this.cargo_ship.show == false){
                Game.addMessage("MINECORP CARGO SHIP", 'Cargo ship arriving shortly...!');
            }

			if (this.ship_wait_time >= 5 && this.cargo_ship.show == false){
				this.cargo_ship.arrive();
				this.cargo_ship.drawSellMenu();
				this.ship_wait_time = 0;
				Game.addMessage("MINECORP CARGO SHIP", 'Cargo ship orbiting!');
			}

			this.ship_wait_time += this.current_world.sim.day_speed;
						
			this.ProcessMessages();
			
			document.getElementById('day').innerHTML = parseInt(this.current_world.sim.day);
            document.getElementById('year').innerHTML = this.current_world.sim.year;
		}
        // Get a lift
		if (this.state._current == this.state.UNIVERSE){
		    for (var a=0; a < this.universe.length; a ++){
			    var asteroid = this.universe[a];
		        var col_state = this.getMouseCollision(this.mouse, asteroid);
			
			    if (col_state == true){
					if (this.mouse.clicked == true){
						this.mouse.clicked = false;
					    this.current_world = asteroid;
					    this.state._current = this.state.PLANET;
					    document.getElementById('world-id').innerHTML = this.current_world.id;
						this.player.y = -100;
						this.cargo_ship.Init();
						
						this.cargo_ship.current_world.id = asteroid.id;
						
					} else {
						col_state = false;
					}
				}
				asteroid.collision = col_state;
		    }
        }
		if (this.state._current == this.state.UNIVERSE_VIEW){
		    for (var a=0; a < this.universe.length; a ++){
			    var asteroid = this.universe[a];
		        var col_state = this.getMouseCollision(this.mouse, asteroid);
			
			    if (col_state == true){
					if (this.mouse.clicked == true){
						this.mouse.clicked = false;
					    this.current_world = asteroid;
					} else {
						col_state = false;
					}
				}
				asteroid.collision = col_state;
		    }
        }
		
		this.level.update(this.dt);
        this.player.update(this.dt);
        this.cargo_ship.update(this.dt);
        this.camera.update(this.dt);
    }
}; 

Game.prototype.draw = function(timer){
    if(this.initialised){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.level.starfield.draw(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
        this.current_world.sim.draw(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
		
		if (this.state._current == this.state.PLANET){
        	this.level.draw(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
		    this.player.draw(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
			
		} else {
			this.drawUniverse(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
		}
		this.cargo_ship.draw(this.dt, this.context, this.camera.xScroll, this.camera.yScroll);
    }
};

Game.prototype.drawUniverse = function(dt, context, xScroll, yScroll) {
    context.fillStyle = "rgba(255,255,255,0.2)";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (var a = 0; a < this.universe.length; a++) {
        var asteroid = this.universe[a];
		
        if(asteroid.destroyed == false){
            if(asteroid.id == this.current_world.id){
                context.fillStyle = "rgba(255, 255, 0, 1)";
                context.fillRect(asteroid.x, asteroid.y, 16, 16);
							
                context.fillText("Home", asteroid.x+16, asteroid.y);

            } else {
			    context.fillText("Asteroid " + asteroid.id, asteroid.x+16, asteroid.y);	
			}
            if(asteroid.colonised){
                context.fillStyle = "green";
                context.beginPath();
                context.arc(asteroid.x + 8, asteroid.y + 8, asteroid.starSize, 0, Math.PI*2, true);
                context.closePath();
                context.fill();
            }
            context.save();
            context.fillStyle = "rgba(255,255,255,1)";
            context.beginPath();
            context.arc(
                asteroid.x+8, 
                asteroid.y+8, 
                asteroid.starsize, 
                0, 
                Math.PI*2, 
                true
            );
            context.closePath();
            context.fill();	
            context.restore();          
        }
    }
};
