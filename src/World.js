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
