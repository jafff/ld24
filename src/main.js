"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')   // Import the cocos2d module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , events = require('events')    // Import the events module
  , geom   = require('geometry')  // Import the geometry module
  , ccp    = geom.ccp              // Short hand to create points
  , util   = require('util')
  , Level = require('./Level')
  , HUD = require('./HUD')

// Convenient access to some constructors
var Layer    = nodes.Layer
  , Scene    = nodes.Scene
  , Label    = nodes.Label
  , Director = cocos.Director


/**
 * @class Title card
 * @extends cocos.nodes.Layer
 */
function Plague() {
    // You must always call the super class constructor
    Plague.superclass.constructor.call(this)

    // Get size of canvas
    var s = Director.sharedDirector.winSize

    // Create label
    var titleLabel = new Label({ string:   'Plague'
                          , fontName: 'Frijole'
                          , fontSize: 82
                          , fontColor: 'black'
                          })

    // Position the label in the centre of the view
    titleLabel.position = ccp(s.width / 4, s.height - 100)
    titleLabel.zOrder = 2

    var bylineLabel = new Label({ string: 'A Ludum Dare 24 entry by @tastelessnudes'
        , fontName: 'Frijole'
        , fontSize: 19
        , fontColor: 'white'
    })

    bylineLabel.position = ccp(s.width / 2, s.height / 4)
    bylineLabel.zOrder = 2

    // Add label to layer
    this.addChild(titleLabel)
    this.addChild(bylineLabel)

    this.isMouseEnabled = true
    this.scheduleUpdate()
}

// Inherit from cocos.nodes.Layer
Plague.inherit(Layer, {
    dot: null,
    dotCount: 0,
    mouseDown: function () {
        var scene = new Scene(),
            level = new Level(),
            hud = new HUD(level)

        scene.addChild(level)
        scene.addChild(hud)
        Director.sharedDirector.replaceScene(scene)
    },
    update: function (delta) {
        if (this.dotCount > 300) return

        var s = Director.sharedDirector.winSize
        var x = parseInt(Math.random() * 450) + 50
        var y = parseInt(Math.random() * 75) + 440

        var dot = new cocos.nodes.Sprite({
            file: '/resources/whitedot.png',
            rect: new geom.Rect(0, 0, 24, 24)
        })
        dot.anchorPoint = new geom.Point(0, 0)
        dot.position = new geom.Point(x, y)
        dot.zOrder = 1
        this.addChild(dot)
        this.dotCount++
    }
})

/**
 * Entry point for the application
 */
function main () {
    // Initialise application

    // Get director singleton
    var director = Director.sharedDirector

    // Wait for the director to finish preloading our assets
    events.addListener(director, 'ready', function (director) {
        // Create a scene and layer
        var scene = new Scene()
          , layer = new Plague()

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main
