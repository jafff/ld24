(function(){
__jah__.resources["/a_star.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
/*
Copyright (C) 2009 by Benjamin Hardin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function a_star(start, destination, board, columns, rows)
{
	//Create start and destination as true nodes
	start = new node(start[0], start[1], -1, -1, -1, -1);
	destination = new node(destination[0], destination[1], -1, -1, -1, -1);

	var open = []; //List of open nodes (nodes to be inspected)
	var closed = []; //List of closed nodes (nodes we've already inspected)

	var g = 0; //Cost from start to current node
	var h = heuristic(start, destination); //Cost from current node to destination
	var f = g+h; //Cost from start to destination going through the current node

	//Push the start node onto the list of open nodes
	open.push(start); 

	//Keep going while there's nodes in our open list
	while (open.length > 0)
	{
		//Find the best open node (lowest f value)

		//Alternately, you could simply keep the open list sorted by f value lowest to highest,
		//in which case you always use the first node
		var best_cost = open[0].f;
		var best_node = 0;

		for (var i = 1; i < open.length; i++)
		{
			if (open[i].f < best_cost)
			{
				best_cost = open[i].f;
				best_node = i;
			}
		}

		//Set it as our current node
		var current_node = open[best_node];

		//Check if we've reached our destination
		if (current_node.x == destination.x && current_node.y == destination.y)
		{
			var path = [destination]; //Initialize the path with the destination node

			//Go up the chain to recreate the path 
			while (current_node.parent_index != -1)
			{
				current_node = closed[current_node.parent_index];
				path.unshift(current_node);
			}

			return path;
		}

		//Remove the current node from our open list
		open.splice(best_node, 1);

		//Push it onto the closed list
		closed.push(current_node);

		//Expand our current node (look in all 8 directions)
		for (var new_node_x = Math.max(0, current_node.x-1); new_node_x <= Math.min(columns-1, current_node.x+1); new_node_x++)
			for (var new_node_y = Math.max(0, current_node.y-1); new_node_y <= Math.min(rows-1, current_node.y+1); new_node_y++)
			{
				if (board[new_node_x][new_node_y] == 0 //If the new node is open
					|| (destination.x == new_node_x && destination.y == new_node_y)) //or the new node is our destination
				{
					//See if the node is already in our closed list. If so, skip it.
					var found_in_closed = false;
					for (var i in closed)
						if (closed[i].x == new_node_x && closed[i].y == new_node_y)
						{
							found_in_closed = true;
							break;
						}

					if (found_in_closed)
						continue;

					//See if the node is in our open list. If not, use it.
					var found_in_open = false;
					for (var i in open)
						if (open[i].x == new_node_x && open[i].y == new_node_y)
						{
							found_in_open = true;
							break;
						}

					if (!found_in_open)
					{
						var new_node = new node(new_node_x, new_node_y, closed.length-1, -1, -1, -1);

						new_node.g = current_node.g + Math.floor(Math.sqrt(Math.pow(new_node.x-current_node.x, 2)+Math.pow(new_node.y-current_node.y, 2)));
						new_node.h = heuristic(new_node, destination);
						new_node.f = new_node.g+new_node.h;

						open.push(new_node);
					}
				}
			}
	}

	return [];
}

//An A* heurisitic must be admissible, meaning it must never overestimate the distance to the goal.
//In other words, it must either underestimate or return exactly the distance to the goal.
function heuristic(current_node, destination)
{
	//Find the straight-line distance between the current node and the destination. (Thanks to id for the improvement)
	//return Math.floor(Math.sqrt(Math.pow(current_node.x-destination.x, 2)+Math.pow(current_node.y-destination.y, 2)));
	var x = current_node.x-destination.x;
	var y = current_node.y-destination.y;
	return x*x+y*y;
}


/* Each node will have six values: 
 X position
 Y position
 Index of the node's parent in the closed array
 Cost from start to current node
 Heuristic cost from current node to destination
 Cost from start to destination going through the current node
*/	

function node(x, y, parent_index, g, h, f)
{
	this.x = x;
	this.y = y;
	this.parent_index = parent_index;
	this.g = g;
	this.h = h;
	this.f = f;
}

module.exports = a_star;

}, mimetype: "application/javascript", remote: false}; // END: /a_star.js


__jah__.resources["/Citizen.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util'),
    LivingEntity = require('./LivingEntity'),
    World = require('./World')

function Citizen() {
    Citizen.superclass.constructor.call(this)

    var sprite = new cocos.nodes.Sprite({
        file: '/resources/characters.png',
        rect: new geom.Rect(64, 0, 32, 32)
    })

    sprite.anchorPoint = new geom.Point(0, 0)
    this.addChild(sprite)
    this.contentSize = sprite.contentSize

    this.npc = true
    this.sprite = sprite
    this.velocity = 1
    this.scheduleUpdate()
}

Citizen.inherit(LivingEntity, {
    choosePoint: function () {
        var s = cocos.Director.sharedDirector.winSize
        var x = (Math.random() * (s.width - 64)) + 32
        var y = (Math.random() * (s.height - 64)) + 32

        return World.tileXY(new geom.Point(x, y), s)
    },

    update: function (delta) {
        Citizen.superclass.update.call(this, delta)

        if (this.npc) {
            var pos = util.copy(this.position)
            var s = this.parent.map._boundingBox.size
            if (this.path == null && this.pathIndex < 0 && Math.random() < 0.01) {
                if ((this.path = this.getPath(this.choosePoint()))) {
                    this.pathIndex = 0
                }
            }
        
            this.pathNext(delta)
        }
    }
})

module.exports = Citizen

}, mimetype: "application/javascript", remote: false}; // END: /Citizen.js


__jah__.resources["/Entity.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    ccp = geom.ccp,
    util = require('util'),
    pathfind = require('./a_star'),
    World = require('./World')

function Entity() {
    Entity.superclass.constructor.call(this)

    this.movementQueue = []
    this.grid = null
    this.path = null
    this.pathIndex = -1
    this.velocity = 10
    this.stuck = 0
    this.scheduleUpdate()
}

Entity.inherit(cocos.nodes.Node, {
    velocity: 0,
    getPath: function (point) {
        if (!this.grid) this.grid = this.parent.grid
        var pos = World.tileXY(this.position, this.parent.map._boundingBox.size)
        var path = pathfind([pos.x, pos.y], [point.x, point.y], this.grid, 25, 19)
        
        if (path.length == 0)
            return null

        return path
    },
    move: function (direction, hcb) {
        var pos = util.copy(this.position)
        if (direction == World.DIRECTION.UP && !this.testHits('y', this.velocity, hcb)) {
            pos.y += this.velocity
            this.position = pos
        } else if (direction == World.DIRECTION.DOWN && !this.testHits('y', -this.velocity, hcb)) {
            pos.y -= this.velocity
            this.position = pos
        } else if (direction == World.DIRECTION.LEFT && !this.testHits('x', -this.velocity, hcb)) {
            pos.x -= this.velocity
            this.position = pos
        } else if (direction == World.DIRECTION.RIGHT && !this.testHits('x', this.velocity, hcb)) {
            pos.x += this.velocity
            this.position = pos
        }
    },
    queueMove: function (direction, n, onDest, onHit) {
        this.movementQueue.push({direction: direction, n: n, onDest: onDest, onHit: onHit})
    },
    pathNext: function (delta) {
        if (this.path == null || this.pathIndex < 0) return
     
        var next = this.path[this.pathIndex]
        var pos = World.tileXY(this.position, this.parent.map._boundingBox.size)
        var incr = 0
        var lastPos = util.copy(this.position)

        if (next.x < pos.x)
            this.move(World.DIRECTION.LEFT)
        else if (next.x > pos.x)
            this.move(World.DIRECTION.RIGHT)
        else if (next.y > pos.y)
            this.move(World.DIRECTION.DOWN)
        else if (next.y < pos.y)
            this.move(World.DIRECTION.UP)
        else
            incr = 1
        
        this.pathIndex += incr

        if (lastPos.x == this.position.x && lastPos.y == this.position.y)
            this.stuck++ // prevents getting stuck around objects while wandering

        if (this.pathIndex >= this.path.length || this.stuck > 50) {
            this.path = null
            this.pathIndex = -1
            this.stuck = 0
        }
    },
    testHits: function (axis, vel, hitcb) {
        this.testEntityHit(axis, vel, hitcb)
        return this.testEdgeHit(axis, vel, hitcb)
    },
    testEntityHit: function (axis, vel, hitcb) {
        var citizens = this.parent.citizens
        var box = this.boundingBox

        for (var i = 0; i < citizens.length; i++) {
            if (geom.rectOverlapsRect(box, citizens[i].boundingBox)) {
                if (hitcb)
                    hitcb('entity', citizens[i])
            }
        }
    },
    testEdgeHit: function (axis, vel, hitcb) {
        var box = this.boundingBox
        var s = cocos.Director.sharedDirector.winSize

        if (axis == 'x' && vel < 0 && geom.rectGetMinX(box) < World.TILE_WIDTH)
            return true
        
        if (axis == 'x' && vel > 0 && geom.rectGetMaxX(box) > s.width - World.TILE_WIDTH)
            return true
        
        if (axis == 'y' && vel > 0 && geom.rectGetMaxY(box) > s.height - World.TILE_HEIGHT)
            return true

        if (axis == 'y' && vel < 0 && geom.rectGetMinY(box) - 10 < World.TILE_HEIGHT)
            return true
    },
    testObjectHit: function (axis, vel, hitcb) {
        // skip expensive test if there aren't even objects in this map
        if (this.parent.map.objectGroups.length == 0) return false
        var box = this.boundingBox
        var objLayer = this.parent.map.objectGroups[0]

        var s = cocos.Director.sharedDirector.winSize

        box.origin[axis] += vel

        var hits = []
        var testPoints = {
            nw: util.copy(box.origin),
            sw: new geom.Point(box.origin.x, box.origin.y + box.size.height),
            ne: new geom.Point(box.origin.x + box.size.width, box.origin.y),
            se: new geom.Point(box.origin.x + box.size.width, box.origin.y + box.size.height)
        }

        for (var corner in testPoints) {
            var p = testPoints[corner]
            var entityRect = new geom.Rect(p.x, p.y, World.TILE_WIDTH, World.TILE_HEIGHT)

            for (var i in objLayer.objects) {
                var objRect = new geom.Rect(objLayer.objects[i].x,
                                            objLayer.objects[i].y,
                                            objLayer.objects[i].width,
                                            objLayer.objects[i].height)
                if (geom.rectOverlapsRect(entityRect, objRect)) {
                    hits.push(entityRect)
                }
            }
        }
        return (hits.length > 0)
    },
    update: function (delta) {
        var n = this.movementQueue.length
        for (var i = 0; i < n; i++) {
            var movement = this.movementQueue.shift()
            this.move(movement.direction, function (type, obj) {
                movement.n = -1
                movement.onHit(type, obj)
            })
            movement.n--

            if (movement.n <= 0)
                movement.onDest()
            else
                this.movementQueue.push(movement)
        }
    }
})

module.exports = Entity

}, mimetype: "application/javascript", remote: false}; // END: /Entity.js


__jah__.resources["/HUD.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util')

var Label = cocos.nodes.Label

function HUD(level) {
    HUD.superclass.constructor.call(this)

    var labelFont = 'Frijole'
    var labelFontSize = 19

    this.level = level

    var infected = new Label({
        string: 'Infected: 0',
        fontName: labelFont,
        fontSize: labelFontSize
    })

    var dead = new Label( {
        string: 'Dead: 0',
        fontName: labelFont,
        fontSize: labelFontSize
    })

    var healthy = new Label({
        string: 'Healthy: 0',
        fontName: labelFont,
        fontSize: labelFontSize
    })

    var immune = new Label({
        string: 'Immune: 0',
        fontName: labelFont,
        fontSize: labelFontSize
    })

    var health = new Label({
        string: 'Health: 0',
        fontName: labelFont,
        fontSize: labelFontSize
    })

    infected.position = new geom.Point(500, 20)
    dead.position = new geom.Point(675, 20)
    healthy.position = new geom.Point(250, 20)
    immune.position = new geom.Point(96, 590)
    health.position = new geom.Point(296, 590)

    this.infected = infected
    this.dead = dead
    this.healthy = healthy
    this.immune = immune
    this.health = health
    this.addChild(infected)
    this.addChild(dead)
    this.addChild(healthy)
    this.addChild(immune)
    this.addChild(health)
    this.scheduleUpdate()
}

HUD.inherit(cocos.nodes.Layer, {
    update: function (delta) {
        this.infected.string = 'Infected: ' + this.level.infectedPercent() + '%'
        this.dead.string = 'Dead: ' + this.level.deadPercent() + '%'
        this.healthy.string = 'Healthy: ' + this.level.healthyPercent() + '%'
        this.immune.string = 'Immune: ' + this.level.immunePercent() + '%'
        this.health.string = 'Health: ' + this.level.healthPercent() + '%'
    }
})

module.exports = HUD

}, mimetype: "application/javascript", remote: false}; // END: /HUD.js


__jah__.resources["/InfectedCitizen.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util'),
    Citizen = require('./Citizen')

function InfectedCitizen() {
    InfectedCitizen.superclass.constructor.call(this)

    this.removeChild(this.sprite)

    var sprite = new cocos.nodes.Sprite({
        file: '/resources/characters.png',
        rect: new geom.Rect(128, 0, 32, 32)
    })

    sprite.anchorPoint = new geom.Point(0, 0)

    this.sprite = sprite
    this.addChild(sprite)
    this.contentSize = sprite.contentSize

    this.plagueGenome = this.initGenome()
    this.mutationRate = 0.1
    this.immuneSystem = 0.0
    this.velocity = 0.1 + (this.plagueGenome[5] * 10) + (this.plagueGenome[3] * 10)
    this.scheduleUpdate()
}

InfectedCitizen.inherit(Citizen, {
    die: function () {
        this.velocity = 0
        //this.plagueGenome[0] = this.plagueGenome[1]
        this.plagueGenome[0] = 0
        this.plagueGenome[7] = 0

        this.health = -1
        this.immuneSystem = -1

        var deadSprite = new cocos.nodes.Sprite({
            file: '/resources/characters.png',
            rect: new geom.Rect(96, 0, 32, 32)
        })

        deadSprite.anchorPoint = new geom.Point(0, 0)
        this.removeChild({child: this.sprite})
        this.addChild(deadSprite)
        this.sprite = deadSprite
        this.parent.infected--
        this.parent.dead++
    },

    draw: function (ctx) { // extend base draw function to show infectious radius
        var pos = this.boundingBox.origin
        ctx.save();
        if (this.getInfectionRadius() > 0) {
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(16, 16, this.getInfectionRadius(), 0, 2 * Math.PI)
            ctx.closePath()
            ctx.stroke()
        }
        ctx.restore()
    },

    getInfectionRadius: function () {
        return this.plagueGenome[0] > 0.0 ? ((this.plagueGenome[0] * 0.1) + 0.1) * 250 : 0
    },

    getTransmissionP: function () { // the probability of transmission
        return this.plagueGenome[7] * 0.5
    },
    
    copyGenome: function () {
        var newGenome = []
        for (var i = 0; i < this.plagueGenome.length; i++) {
            if (Math.random() < this.mutationRate) {
                newGenome.push(Math.random())
            } else {
                newGenome.push(this.plagueGenome[i])
            }
        }

        return newGenome
    },

    initGenome: function () {
        // starting genome
        return [0.05, // airborne spread radius (0)
                0.0, // buboes! (1)
                0.0, // medicine resistance (2)
                0.1, // fever strength (+panic) (3)
                0.1, // lethality (rate at which entity health decays) (4)
                0.0, // entity velocity modifier (5)
                0.1, // dehydration (6)
                0.05, // virality (7)
                ]
    },

    setGenome: function (genome) {
        this.plagueGenome = genome
    },

    update: function (delta) {
        if (this.health < 0.0) return
        InfectedCitizen.superclass.update.call(this)
        this.health -= this.plagueGenome[4]
        if (this.health <= 0) return this.die()

        if (this.immuneSystem == 100) {
            this.parent.healCitizen(this)
        }
    }
})

module.exports = InfectedCitizen

}, mimetype: "application/javascript", remote: false}; // END: /InfectedCitizen.js


__jah__.resources["/InfectedPlayer.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util'),
    InfectedCitizen = require('./InfectedCitizen'),
    Player = require('./Player')

function InfectedPlayer() {
    InfectedPlayer.superclass.constructor.call(this)
    var sprite = new cocos.nodes.Sprite({
        file: '/resources/characters.png',
        rect: new geom.Rect(160, 0, 32, 32)
    })

    sprite.anchorPoint = new geom.Point(0, 0)
    this.npc = false
    this.velocity = 2
    this.contentSize = sprite.contentSize
    this.addChild(sprite)
    this.scheduleUpdate()
}

InfectedPlayer.inherit(InfectedCitizen, {
    die: function () {
        var deadSprite = new cocos.nodes.Sprite({
            file: '/resources/characters.png',
            rect: new geom.Rect(192, 0, 32, 32)
        })
        
        deadSprite.anchorPoint = new geom.Point(0, 0)
        this.removeChildren({})
        this.addChild(deadSprite)
        this.sprite = deadSprite
        this.parent.gameover()
    },

    update: function (delta) {
        if (this.immuneSystem >= 75) {
            console.log('immuneSystem == 100')
            console.log(this.inactivePlayer instanceof Player)
            this.parent.restorePlayer()
            return
        }
        InfectedPlayer.superclass.update.call(this, delta)
    }
})

module.exports = InfectedPlayer

}, mimetype: "application/javascript", remote: false}; // END: /InfectedPlayer.js


__jah__.resources["/Level.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
"use strict"

var cocos = require('cocos2d'),
    nodes = cocos.nodes,
    events = require('events'),
    geom = require('geometry'),
    ccp = geom.ccp,
    util = require('util'),
    Citizen = require('./Citizen'),
    HUD = require('./HUD'),
    InfectedCitizen = require('./InfectedCitizen'),
    InfectedPlayer = require('./InfectedPlayer'),
    Player = require('./Player'),
    World = require('./World'),
    PlagueUtil = require('./Util')

var Scene = nodes.Scene

function Level() {
    Level.superclass.constructor.call(this)
    
    var s = cocos.Director.sharedDirector.winSize
    var map = new nodes.TMXTiledMap({file: '/resources/levelbase.tmx'})
    map.position = new geom.Point(0, 0)
    this.addChild({child: map, z: -1})

    var go = new nodes.Label({
        string: 'Game over! Press any key to retry.',
        fontName: 'Frijole',
        fontSize: 28
    })

    go.position = ccp(s.width / 2, s.height / 2)

    this.go = go
    this.finished = false

    var player = new Player()
    player.position = ccp(s.width / 2, s.height / 2)

    var inactivePlayer = null

    var grid = []
    for (var i = 0; i < World.COLS; i++) {
        grid[i] = []
        for (var j = 0; j < World.ROWS; j++)
            grid[i][j] = 0 // todo: reconcile with map objects
    }

    var citizens = []
    this.startingPop = 1
    this.infected = 0
    this.dead = 0
    for (var i = 0; i < this.startingPop; i++) {
        citizens.push(new Citizen())
        if (i < 2) {
            citizens[i].cleanup()
            citizens[i].removeChild(citizens[i].sprite)
            citizens[i] = new InfectedCitizen()
            this.infected++
        }

        citizens[i].position = ccp((Math.random() * 600) + 100, (Math.random() * 400) + 100)
        this.addChild(citizens[i])
    }

    this.addChild({child: player, z: 1})

    this.citizens = citizens
    this.map = map
    this.player = player
    this.grid = grid

    this.isKeyboardEnabled = true;
    this.scheduleUpdate()
}

Level.inherit(nodes.Layer, {
    healCitizen: function (citizen) {
        this.swapCitizen(citizen, Citizen)
        this.infected--
    },

    infectCitizen: function (citizen, source) {
        var infectedCitizen = this.swapCitizen(citizen, InfectedCitizen)
        infectedCitizen.setGenome(source.copyGenome())
        this.infected++
    },

    swapCitizen: function (citizen, CitizenClass) {
        var i = this.citizens.indexOf(citizen)
        var newCitizen = new CitizenClass()

        newCitizen.position = util.copy(citizen.position)
        this.addChild(newCitizen)
        this.removeChild(citizen)
        this.citizens[i] = newCitizen

        citizen.cleanup()

        return newCitizen
    },

    restorePlayer: function () {
        console.log('restoring player')
        this.inactivePlayer.position = util.copy(this.player.position)
        this.removeChild(this.player)
        this.player.cleanup()
        this.player = this.inactivePlayer
        this.addChild(this.player)
        this.inactivePlayer = null
    },

    deadPercent: function () {
        return PlagueUtil.round((this.dead / this.startingPop) * 100, 2)
    },

    infectedPercent: function () {
        if (this.infected == 0) {
            this.gameover()
        }
        return PlagueUtil.round((this.infected / this.startingPop) * 100, 2)
    },

    healthyPercent: function () {
        return PlagueUtil.round(100 - this.deadPercent() - this.infectedPercent(), 2)
    },

    immunePercent: function () {
        return Math.round((this.player.immuneSystem < 0 ? 0 : this.player.immuneSystem))
    },

    healthPercent: function () {
        return Math.round((this.player.health < 0 ? 0 : this.player.health))
    },

    gameover: function () {
        this.addChild(this.go)
        this.finished = true
    },

    restart: function () {
        var scene = new Scene(),
            level = new Level(),
            hud = new HUD(level)
            
        scene.addChild(level)
        scene.addChild(hud)
        cocos.Director.sharedDirector.replaceScene(scene)
    },

    routeKeyEvent: function (ev) {
        if (this.finished) {
            this.restart()
            return
        }

        if (ev.keyCode == 87) // w
            this.player.move(World.DIRECTION.UP)
        
        if (ev.keyCode == 65) // a
            this.player.move(World.DIRECTION.LEFT)
        
        if (ev.keyCode == 83) // s
            this.player.move(World.DIRECTION.DOWN)
        
        if (ev.keyCode == 68) // d
            this.player.move(World.DIRECTION.RIGHT)

        if (ev.keyCode == 37) // left arrow
            this.player.fire(World.DIRECTION.LEFT)

        if (ev.keyCode == 38) // up arrow
            this.player.fire(World.DIRECTION.UP)

        if (ev.keyCode == 39) // right arrow
            this.player.fire(World.DIRECTION.RIGHT)

        if (ev.keyCode == 40) // down arrow
            this.player.fire(World.DIRECTION.DOWN)

    },
    keyDown: function (ev) {
        this.routeKeyEvent(ev)
    },
    keyRepeat: function (ev) {
        this.routeKeyEvent(ev)
    },

    update: function (delta) {
        var citizens = this.citizens

        for (var i = 0; i < citizens.length; i++) {
            if (citizens[i] instanceof InfectedCitizen) {
                var source = citizens[i]
                var centerX = source.position.x + (source.contentSize.width / 2)
                var centerY = source.position.y + (source.contentSize.height / 2)
                var infectionRect = new geom.Rect(centerX, centerY, source.getInfectionRadius() * 2, source.getInfectionRadius() * 2)
                var playerBox = this.player.boundingBox

                if (geom.rectOverlapsRect(infectionRect, playerBox)) {
                    if (Math.random() < citizens[i].getTransmissionP()) {
                        var playerImmune = this.player.immuneSystem
                        this.player.immuneSystem = Math.max(playerImmune - 10, 0)
                        if (this.player.immuneSystem <= 0.0 && this.inactivePlayer == null) {
                            var infectedPlayer = new InfectedPlayer()
                            infectedPlayer.position = util.copy(this.player.position)
                            infectedPlayer.immuneSystem = this.player.immuneSystem
                            infectedPlayer.health = this.player.health
                            this.inactivePlayer = this.player
                            this.player = infectedPlayer

                            this.removeChild(this.inactivePlayer)
                            this.addChild(this.player)
                            console.log(this.inactivePlayer instanceof Player)
                        }
                    }
                }

                for (var j = 0; j < citizens.length; j++) {
                    if (citizens[j] instanceof InfectedCitizen) continue
                    var box = citizens[j].boundingBox
                    if (geom.rectOverlapsRect(infectionRect, box)) {
                        if (Math.random() > citizens[i].getTransmissionP()) continue
                        citizens[j].immuneSystem = Math.max(citizens[j].immuneSystem - 25, 0)
                        if (citizens[j].immuneSystem <= 0)
                            this.infectCitizen(citizens[j], citizens[i])
                    }
                }
            }
        }
    }
})

module.exports = Level

}, mimetype: "application/javascript", remote: false}; // END: /Level.js


__jah__.resources["/LivingEntity.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    ccp = geom.ccp,
    util = require('util'),
    Entity = require('./Entity'),
    World = require('./World')

function LivingEntity() {
    LivingEntity.superclass.constructor.call(this)

    this.health = 100
    this.immuneSystem = 100.0
    this.scheduleUpdate()
}

LivingEntity.inherit(Entity, {
    update: function (delta) {
        LivingEntity.superclass.update.call(this, delta)
        var imm = this.immuneSystem
        this.immuneSystem = (imm >= 100 ? 100 : imm + (delta ? delta : 0.05))
    }
})

module.exports = LivingEntity

}, mimetype: "application/javascript", remote: false}; // END: /LivingEntity.js


__jah__.resources["/main.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')   // Import the cocos2d module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , events = require('events')    // Import the events module
  , geom   = require('geometry')  // Import the geometry module
  , ccp    = geom.ccp              // Short hand to create points
  , util   = require('util')
  , Level = require('./Level')
  , HUD = require('./HUD')

// Convenient access to some constructors
var Layer    = nodes.Layer
  , Scene    = nodes.Scene
  , Label    = nodes.Label
  , Director = cocos.Director


/**
 * @class Title card
 * @extends cocos.nodes.Layer
 */
function Plague() {
    // You must always call the super class constructor
    Plague.superclass.constructor.call(this)

    // Get size of canvas
    var s = Director.sharedDirector.winSize

    // Create label
    var titleLabel = new Label({ string:   'Plague'
                          , fontName: 'Frijole'
                          , fontSize: 82
                          , fontColor: 'black'
                          })

    // Position the label in the centre of the view
    titleLabel.position = ccp(s.width / 4, s.height - 100)
    titleLabel.zOrder = 2

    var bylineLabel = new Label({ string: 'A Ludum Dare 24 entry by @tastelessnudes'
        , fontName: 'Frijole'
        , fontSize: 19
        , fontColor: 'white'
    })

    bylineLabel.position = ccp(s.width / 2, s.height / 4)
    bylineLabel.zOrder = 2

    // Add label to layer
    this.addChild(titleLabel)
    this.addChild(bylineLabel)

    this.isMouseEnabled = true
    this.scheduleUpdate()
}

// Inherit from cocos.nodes.Layer
Plague.inherit(Layer, {
    dot: null,
    dotCount: 0,
    mouseDown: function () {
        var scene = new Scene(),
            level = new Level(),
            hud = new HUD(level)

        scene.addChild(level)
        scene.addChild(hud)
        Director.sharedDirector.replaceScene(scene)
    },
    update: function (delta) {
        if (this.dotCount > 300) return

        var s = Director.sharedDirector.winSize
        var x = parseInt(Math.random() * 450) + 50
        var y = parseInt(Math.random() * 75) + 440

        var dot = new cocos.nodes.Sprite({
            file: '/resources/whitedot.png',
            rect: new geom.Rect(0, 0, 24, 24)
        })
        dot.anchorPoint = new geom.Point(0, 0)
        dot.position = new geom.Point(x, y)
        dot.zOrder = 1
        this.addChild(dot)
        this.dotCount++
    }
})

/**
 * Entry point for the application
 */
function main () {
    // Initialise application

    // Get director singleton
    var director = Director.sharedDirector

    // Wait for the director to finish preloading our assets
    events.addListener(director, 'ready', function (director) {
        // Create a scene and layer
        var scene = new Scene()
          , layer = new Plague()

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main

}, mimetype: "application/javascript", remote: false}; // END: /main.js


__jah__.resources["/Medicine.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util'),
    Entity = require('./Entity'),
    World = require('./World')

function Medicine() {
    Medicine.superclass.constructor.call(this)

    var sprite = new cocos.nodes.Sprite({
        file: '/resources/items.png',
        rect: new geom.Rect(0, 0, 32, 32)
    })

    sprite.anchorPoint = new geom.Point(0, 0)
    
    this.contentSize = sprite.contentSize
    this.addChild(sprite)
    this.sprite = sprite
}

Medicine.inherit(Entity, {
    destroy: function () {
        this.removeChild(this.sprite)
        this.cleanup()
    },
    hit: function (entity) {
        if (entity.health > 0.0) {
            entity.health += 25
            entity.immuneSystem += 25
        }
    },
    update: function (delta) {
        Medicine.superclass.update.call(this, delta)
    }
})

module.exports = Medicine

}, mimetype: "application/javascript", remote: false}; // END: /Medicine.js


__jah__.resources["/Player.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util'),
    LivingEntity = require('./LivingEntity'),
    Medicine = require('./Medicine')

function Player() {
    Player.superclass.constructor.call(this)

    var sprite = new cocos.nodes.Sprite({
        file: '/resources/characters.png',
        rect: new geom.Rect(32, 0, 32, 32)
    })

    sprite.anchorPoint = new geom.Point(0, 0)
    this.addChild(sprite)
    this.contentSize = sprite.contentSize
    this.equipped = null
    this.inventory = {
    }

    this.velocity = 10
}

Player.inherit(LivingEntity, {
    fire: function (direction) {
        var projectile = new Medicine()
        var level = this.parent

        projectile.position = util.copy(this.position)
        level.addChild(projectile)

        var cleanup = function () {
            level.removeChild(projectile)
            projectile.destroy()
        }
        
        var hitcb = function (type, obj) {
            if (type == 'entity')
                projectile.hit(obj)

            cleanup()
        }

        projectile.queueMove(direction, 15, cleanup, hitcb)
    }
})

module.exports = Player

}, mimetype: "application/javascript", remote: false}; // END: /Player.js


__jah__.resources["/resources/characters.png"] = {data: __jah__.assetURL + "/resources/characters.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/citywalls.png"] = {data: __jah__.assetURL + "/resources/citywalls.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/items.png"] = {data: __jah__.assetURL + "/resources/items.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/levelbase.tmx"] = {data: __jah__.assetURL + "/resources/levelbase.tmx", mimetype: "text/plain", remote: true};
__jah__.resources["/resources/stone.png"] = {data: __jah__.assetURL + "/resources/stone.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/tiles.png"] = {data: __jah__.assetURL + "/resources/tiles.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/whitedot.png"] = {data: __jah__.assetURL + "/resources/whitedot.png", mimetype: "image/png", remote: true};
__jah__.resources["/Util.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var util = require('util')

module.exports = {
    round: function (n, dec) {
        return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
    }
}

}, mimetype: "application/javascript", remote: false}; // END: /Util.js


__jah__.resources["/World.js"] = {data: function (exports, require, resource, module, __filename, __dirname) {
var geom = require('geometry')

module.exports = {
    TILE_WIDTH: 32,
    TILE_HEIGHT: 32,
    COLS: 25,
    ROWS: 19,
    KEY: {
        FIRE: 0,
    },
    DIRECTION: {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3
    },

    tileXY: function (pos, mapSize) {
        return new geom.Point(Math.floor(pos.x / this.TILE_WIDTH), Math.floor((mapSize.height - pos.y) / this.TILE_HEIGHT))
    }
}

}, mimetype: "application/javascript", remote: false}; // END: /World.js


})();