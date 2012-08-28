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
