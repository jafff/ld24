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
