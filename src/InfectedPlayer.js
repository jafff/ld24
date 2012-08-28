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
