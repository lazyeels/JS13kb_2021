var Simulation = function(Game, _id){
    this.game = Game;
	if (_id == 0){
    	// starter asteroid
	    this.power = 0;
	    this.food = 10;;
        this.water = 10;
        this.oxygen = 10;
	} else {
		// All other asteroids
		this.power = 0;
	    this.food = 0;;
        this.water = 0;
        this.oxygen = 0;
	}
    
    this.id = "Asteroid " + _id;
};

Simulation.prototype.Init = function(){
    this.S = 100; // Satisfaction level
	this.day = 1;
	this.day_speed = 0.06
    this.year = 2063; // Year set to 1
    this.mine_total = 0; //Math.floor(5 + Math.random() * 3); // Number of mines
    this.P = 0; //Math.floor(40 + Math.random() * 60); // Number of people
    this.M = 0;

	
	this.power_supply = Math.floor(25 + Math.random() * 50) * this.P; // Food supply;	
    this.food_supply = Math.floor(10 + Math.random() * 20) * this.P; // Food supply
	this.oxygen_supply = Math.floor(10 + Math.random() * 20) * this.P;
	this.water_supply = Math.floor(10 + Math.random() * 20) * this.P;
	
	this.ore_cost_of_mine = 50;
	this.ore_cost_of_house = 100;
	this.ore_cost_of_food = 150;
	this.ore_cost_of_oxygen = 170;
	this.ore_cost_of_power = 120;
	this.ore_cost_of_water = 100;
	this.ore_cost_of_factory = 550;
	
    this.ore_per_mine = 0//Math.floor(80 + Math.random() * 40); // Ore per mine
    this.mine_price = Math.floor(70 + Math.random() * 90); // Buying/Selling price mines
    this.ore_price = Math.floor(10 + Math.random() * 15); // Buying/Selling price ore
    this.food_price = Math.floor(115 + Math.random() * 125);
	this.water_price = Math.floor(110 + Math.random() * 120);
	this.oxygen_price = Math.floor(150 + Math.random() * 170);
    this.worker_price = Math.floor(100 + Math.random() * 120);
	this.power_price = Math.floor(200 + Math.random() * 220);
    this.factory_price = Math.floor(450 + Math.random() * 500);
	
    
    
    this.store = 0; // Amount of ore in storage
    this.mines_to_sell = 0;
    this.mine_to_buy = 0;
    
	this.gameover = false;
    this.gamewin = false;
    
    this.leavetotal = 0;
    this.workers =  this.P;
	
    this.homeless =  this.P;
    this.newWorkers = 0;
	this.draw();
    
};

Simulation.prototype.checkGameOver = function(){
    if(this.S < 60){
        this.game.addMessage(this.id, "The people are revolting!");
		
    }
    if(this.P < 10){
        Game.addMessage("Not enough people left in the colony!")
    }
    if(this.year >= 10){
        this.game.addMessage(this.id, "You survived your term of office!")
    }
};

Simulation.prototype.randomDisaster = function(){
    var event = Math.random();
    if(event == 0.01){
        this.P = this.P/2;
    }
    if(event == 0.02){
        var previousprice = this.ore_price;
        if(this.ore_price > 1){
            this.ore_price -= Math.floor(this.ore_price*(0.2 + Math.random() * 0.8));
            this.game.messages.push('Market Glut!<span> Was '+previousprice+' now '+this.ore_price+' (down '+((this.ore_price/previousprice)*100).toFixed(2)+'%)</span>');
        }
    }
};

Simulation.prototype.update = function(){
        this.updateMines();
        this.updateSatisfaction();
        this.updatePopulation();
		this.randomDisaster();
		this.draw();
};

Simulation.prototype.sellOre = function(amount){
    var total = amount || 1;
    this.M += (total * this.ore_price);
};        

Simulation.prototype.loadOre = function(amount){
    var total = amount || 1;
    this.store -= total;
};        

Simulation.prototype.sellMine = function(amount){
    this.M += (this.mines_to_sell * this.mine_price);
    this.mine_total -= this.mines_to_sell;
};

Simulation.prototype.checkFunds = function(deduct){
    if(this.M - deduct >= 0){
		return true;
	}
	Game.addMessage(this.id, "You don't have enough funds for that...")
	return false;
	
};

Simulation.prototype.buyMine = function(){
//    this.ore_per_mine += Math.floor(80 + Math.random() * 40);
    if(this.checkFunds(this.mine_price)){
        this.M -= this.mine_price;
        this.mine_total += 1;
        this.store -= this.ore_cost_of_mine;
	}
};
 
Simulation.prototype.buyFood = function(){
	if(this.checkFunds(this.food_price)){
        this.M -= this.food_price;
	    this.food += this.food_supply;
	    this.store -= this.ore_cost_of_food;
	}
};

Simulation.prototype.buyOxygen = function(){
	if(this.checkFunds(this.oxyen_price)){
        this.M -= this.oxygen_price;
	    this.oxygen += this.oxygen_supply;
	    this.store -= this.ore_cost_of_oxygen;
	}
};

Simulation.prototype.buyHouse = function(){
	var people = Math.floor(3 + Math.random() * 8)
	var cost = this.worker_price * people
	if(this.checkFunds(cost)){
        this.M -= cost;
	    this.P += people; // Number of people    
	    this.store -= this.ore_cost_of_house;
	}
};

Simulation.prototype.buyWater = function(){
	if(this.checkFunds(this.water_price)){
        this.M -= this.water_price;
	    this.water += this.water_supply;
	    this.store -= this.ore_cost_of_water;
	}
};

Simulation.prototype.buyFactory = function(){
	if(this.checkFunds(this.factory_price)){
        this.M -= this.factory_price;
	    this.store -= this.ore_cost_of_factory;
	}
};

Simulation.prototype.buyPower = function(){
	if(this.checkFunds(this.power_price)){
        this.M -= this.power_price;
	    this.power += this.power_supply;
	    this.store -= this.ore_cost_of_power;
		console.log()
	}
};

Simulation.prototype.updateMines = function(){
	//console.log("Updating sim", this.S, this.ore_per_mine)
	if (this.mine_total > 0){
        if(this.S >= 90){
            this.ore_per_mine += 1 + Math.random() * 20;
        } else
        if(this.S <= 50){
            this.ore_per_mine -= 1 + Math.random() * 20;
        }
		this.store += this.ore_per_mine;
	}
	
};

Simulation.prototype.updateSatisfaction = function(){
    if(parseInt(this.P)/parseInt(this.mine_total) <= 3){
		if(this.S - .2 >= 0){
            this.S -= .2;
		}
        Game.addMessage(this.id, "You're overworking everyone! Build more homes to attract more workers.");
    }
    if(this.food_supply/this.P >= 1){
        if(this.S + .1 <= 100){
            this.S += .1;
        }
    }
	if(this.food_supply/this.P <= 0.2){
        Game.addMessage(this.id, 'You need more food! Build more food processors.');
		if(this.S - .1 >= 0){
            this.S -= .2;
		}
    }
	if(this.water_supply/this.P <= 0.25){
        Game.addMessage(this.id, 'You need more water! Build more water silos.');
        if(this.S - .5 >= 0){
            this.S -= .5;
		}
    }
	if(this.oxygen_supply/this.P <= 0.25){
        Game.addMessage(this.id, 'You need more oxygen! Build more oxygen convertors.');
        if(this.S - .5 >= 0){
            this.S -= .5;
		}
    }
	this.satisfaction_icon = Math.floor(this.S) + "%";
};

Simulation.prototype.updatePopulation = function(){
    if(this.S > 80){
        this.newWorkers = Math.floor(1 + Math.random() * 3);
    } else {
		this.workers -= Math.floor(1 + Math.random() * 3);
		
	}
};

Simulation.prototype.updateDisplay = function(elem, val){
	
	document.getElementById(elem).innerHTML = val;
};

Simulation.prototype.draw = function(dt, context){
    this.updateDisplay('store', parseInt(this.store));
	this.updateDisplay('profit', this.M);
	this.updateDisplay('mine_total', this.mine_total);
	this.updateDisplay('ore_per_mine', parseInt(this.ore_per_mine));
	this.updateDisplay('population', parseInt(this.P));
	this.updateDisplay('food_supply', parseInt(this.food));
	this.updateDisplay('oxygen_supply', parseInt(this.oxygen));
	this.updateDisplay('satisfaction', parseInt(this.S));
	this.updateDisplay('power_supply', parseInt(this.power));
	this.updateDisplay('water_supply', parseInt(this.water));
};

var Ship = function(Game){
    this.game = Game;
    this.ship = "🚀";
	this.size = 80;
	this.id = "CARGO SHIP: "
    this.universe_speed = 2;
    this.angleX = 0;
    this.angleY = 0;
    this.range = 0.1;
    this.speed = 0.1; 
    this.mineload = 0;
    this.oreload = 0;
    this.minemax = 10;
    this.oremax = 10000;
    this.minemaxreached = false;
    this.oremaxreached = false;
    this.leaveflag = false;
    this.timepassed = 0;
    this.journeytime = 0;
    this.destination = 0;
    this.location = 0;
    this.x = Game.canvas.width*0.5;
    this.y = 100;
	this.left = false;
    this.right = true;
    this.radius = 20;
    this.speed = 0.01;
    this.rotation = 30;
    this.angle = 0;	
    this.universeX = 0;
    this.universeY = 0;
    this.state = {
        _current: 0,
        DESELECTED: 0,
        SELECTED: 1
    }
	this.ticket_price = Math.floor(1120 + Math.random() * 1780);
    this.cargo = {
        'ore': {'capacity': 10000, 'load': 000},
    };
	this.show = true;
	this.current_world = {
		'id': 0
	};
};

Ship.prototype.Init = function(){
    this.mineload = 0;
    this.oreload = 0;
    this.minemaxreached = false;
    this.oremaxreached = false;
    this.leaveflag = false;
    this.destination = 0;
    this.location = 0;
    this.id = 0;
    this.total_sale = 0;
   
};

Ship.prototype.update = function(dt){
//	if(this.right == true){
//        this.x -= this.speed// * dt;
 //   }
 //   this.rotation = this.x;
 //   var dx = this.game.mouse.x - (this.x);
 //   var dy = this.game.mouse.y - (this.y);
 //   dist = Math.sqrt(dx * dx + dy * dy);
	
  //  if(dist <= 80){
   //     if(Game.state._current != Game.state.MENU){
   //         Game.addMessage(this.location, "Transporter");
   //     }
   //     Game.state._current = Game.state.MENU;
   // }
   this.idle();
};

Ship.prototype.idle = function(){
    this.x += Math.sin(this.angleX)*this.range;
    this.angleX += this.speed;
    this.y += Math.cos(this.angleY)*this.range;
    this.angleY += this.speed;
};


Ship.prototype.leave = function(){
	this.show = false;
	document.getElementById('menu').style.display = 'none';
	if (this.current_world.id + 1 >= Game.num_worlds){
		this.current_world.id = 0;
	} else {
	    this.current_world.id += 1;
	}
};

Ship.prototype.arrive = function(){
	this.show = true;
	document.getElementById('menu').style.display = 'block';
	this.loadship();
	Game.addMessage(this.current_world.id, "MineCorp cargo ship arrived! at asteroid " + this.current_world.id);
};

Ship.prototype.drawSellMenu = function(){

	this.supply = {};
    this.supply.cash = this.game.current_world.sim.M;
    this.supply.ore = {total: this.game.current_world.sim.store, bought: 000, cost: this.game.current_world.sim.ore_price};
    this.supply.food = {total: this.game.current_world.sim.food_supply, bought: 000, cost: this.game.current_world.sim.food_price};
	this.supply.water = {total: this.game.current_world.sim.water_supply, bought: 000, cost: this.game.current_world.sim.water_price};
	

    html = '<table>';
	html += '<tr>';
	html += '<td>MineCorp cargo ship</td>';
	html += '</tr>';
	html += '<tr>';
	html += '<td class="fixedcolumn" style="border-bottom: solid 2px white;padding:3px;"><br>SELL:</td>';
	html += '</tr>';

    html += '<tr>';
    if(this.game.current_world.sim.store <= 0){
        html += '<td class="title">You have no ore to sell!</td>';
    } else {
        html += '<td class="fixedcolumn" onMousemove=Game.drawAlert("Sell_ore.") >ORE</td><td><span id="totalore" class="title">' + parseInt(this.game.current_world.sim.store) +'</span></td>';
        html += '<td id="moreore" class="borlderline" onClick=Game.increaseSale("ore")><span style="padding:10px;" class="borderline">+</span></td>';
        html += '<td id="lessore" class="smallbutton title" onClick=Game.decreaseSale("ore")><span style="padding:10px;" class="borderline">-</span></td>';
        html += '<td id="oresaletotal" class="title">' + this.supply['ore'].bought + '</td>';
        html += '<td id="load-ship" style="text-align: right;" onClick=Game.Sell("ore") ><span class="borderline" style="padding:10px;">Sell</span></td>';
    }
    html += '</tr>';
	html += '<tr>';
	html += '<td class="fixedcolumn" style="border-bottom: solid 2px white;padding:3px;"><br>BUY:</td>';
	html += '</tr>';
    html += '<tr>';
	
    html += '<td class="fixedcolumn" onMousemove=Game.drawAlert("Sell_food.") >FOOD</td><td><span id="totalfood" class="title">' + parseInt(this.game.current_world.sim.food_supply) +'</span></td>';
    html += '<td id="morefood" class="borlderline" onClick=Game.increaseSale("food")><span style="padding:10px;" class="borderline">+</span></td>';
    html += '<td id="lessfood" class="smallbutton title" onClick=Game.decreaseSale("food")><span style="padding:10px;" class="borderline">-</span></td>';
    html += '<td id="foodsaletotal" class="title">' + this.supply['food'].bought + '</td>';
    html += '<td id="load-ship" style="text-align: right;" onClick=Game.Purchase("food") ><span class="borderline" style="padding:10px;">Buy</span></td>';
    html += '</tr>';
	html += '<tr>';
    html += '<td class="fixedcolumn" style="border-bottom: solid 2px white;padding:3px;" onMousemove=Game.drawAlert("Sell_water.") >WATER</td><td><span id="totalwater" class="title">' + parseInt(this.game.current_world.sim.water_supply) +'</span></td>';
    html += '<td id="morewater" class="borlderline" onClick=Game.increaseSale("water")><span style="padding:10px;" class="borderline">+</span></td>';
    html += '<td id="lesswater" class="smallbutton title" onClick=Game.decreaseSale("water")><span style="padding:10px;" class="borderline">-</span></td>';
    html += '<td id="watersaletotal" class="title">' + this.supply['water'].bought + '</td>';
    html += '<td id="load-ship" style="text-align: right;" onClick=Game.Purchase("water") ><span class="borderline" style="padding:10px;">Buy</span></td>';
    html += '</tr>';
	html += '<tr>';
    html += '<td class="fixedcolumn" onMousemove=Game.drawAlert("Get a lift to the next asteroid.")>TRAVEL</td><td><span class="title">' + parseInt(this.ticket_price) +'</span></td>';
    html += '<td><span style="padding:10px;" ></span></td>';
    html += '<td><span style="padding:10px;" ></span></td>';
    html += '<td class="title">&nbsp</td>';
    html += '<td id="load-ship" style="text-align: right;"  onClick=Game.getLift()><span class="borderline" style="padding:10px;">Buy</span></td>';
	html += '</tr>';
    html += '</table>';
	
    document.getElementById('menu').innerHTML = html;
};


Ship.prototype.draw = function(dt, context, xScroll, yScroll){
	if (Game.state._current == Game.state.PLANET && Game.current_world.id == this.current_world.id){
		//if (this.show == true){	
    		context.save();
    		context.fillStyle = this.color;
    		context.setTransform(Game.camera.zoom, 0, 0, Game.camera.zoom, ((Game.level.x-200)- xScroll), ((Game.level.radius+Game.level.height+250)*Game.camera.zoom) - yScroll);
			//context.setTransform(Game.camera.zoom, 0, 0, Game.camera.zoom, (Game.canvas.width*0.5)*Game.camera.zoom, (Game.canvas.height * 0.5)*Game.camera.zoom);
    		context.rotate(this.rotation);
			context.font = this.size + "px Arial";
    		context.fillText(this.ship, this.x-Game.player.rotation, this.y);
    		context.restore();
			//this.drawSellMenu();
		//}
	}
	
	if (Game.state._current != Game.state.PLANET){
		    var loc = Game.universe[this.current_world.id]; // Current asteroid being orbited.
		    context.save();
    		context.fillStyle = "red";
			context.fillText("Cargo ship", loc.x+30, loc.y+40);
            context.fillRect(loc.x + 20, loc.y + 20, 10,10);		
			context.restore();
	}
};
