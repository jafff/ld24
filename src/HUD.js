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
