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
