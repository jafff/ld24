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
