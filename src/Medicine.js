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
