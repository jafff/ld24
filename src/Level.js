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
