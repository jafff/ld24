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
                0.0, // lethality (rate at which entity health decays) (4)
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
