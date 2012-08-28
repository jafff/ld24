var util = require('util')

module.exports = {
    round: function (n, dec) {
        return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
    }
}
