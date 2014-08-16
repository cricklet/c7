define(function (require) {
  var Butler = require('lib/pixelbutler');

  var B = require('lib/backbone');
  var _ = require('lib/underscore');

  var CANVAS_WIDTH  = 600;
  var CANVAS_HEIGHT = 600;

  var DRAW_WIDTH  = 60; // dX, dY
  var DRAW_HEIGHT = 60;

  var WORLD_WIDTH  = 30; // wX, wY
  var WORLD_HEIGHT = 30;

  var canvasToWorld = function (cX) { return cX / 20.0; }
  var worldToDraw = function (wX) { return wX * 2; }
  var drawToWorld = function (dX) { return dX * 0.5; }

  /****************************************************************************
   * A space in the world. Contains any number of tones.
   * Can be rendered and heard.
   */
  function toneColor (tone) {
    var h = 255 * (tone.midi % 12) / 12.0;
    var s = 255 * (tone.midi - 48) / 36.0;
    var v = 255 * tone.vol;
    return Butler.hsv2rgb({ h: h, s: s, v: v });
  }

  var Space = function () {
    this.tone = {
      midi: 48 + Math.floor(Math.random() * 36),
      vol: Math.random() * 0.5 + 0.5
    }
    this.color = toneColor(this.tone);
  }
  Space.prototype.getColor = function () {
    return this.color;
  }
  Space.prototype.getTone = function () {
    return this.tone;
  }

  /****************************************************************************
   * A space in the world. Contains any number of tones.
   * Can be rendered and heard.
   */
  var World = function ($canvas) {
    $canvas.attr('width', CANVAS_WIDTH);
    $canvas.attr('height', CANVAS_HEIGHT);

    this.$pb = new Butler.Stage({
        width: DRAW_WIDTH,
        height: DRAW_HEIGHT,
        canvas: $canvas.attr('id')
    });

    this.world = new Array(WORLD_WIDTH);
    for (var wX = 0; wX < WORLD_WIDTH; wX++) {
      this.world[wX] = new Array(WORLD_HEIGHT);
      for (var wY = 0; wY < WORLD_HEIGHT; wY ++) {
        this.world[wX][wY] = new Space();
      }
    }

    $('#game').mousemove(function (e) {
      var cX = e.offsetX;
      var cY = e.offsetY;

      var tone = this.getTonesAt(cX, cY);
      this.trigger('playNote', tone);
    }.bind(this));
  }

  World.prototype.draw = function () {
    for (var wX = 0; wX < WORLD_WIDTH; wX ++) {
      for (var wY = 0; wY < WORLD_HEIGHT; wY ++) {
        var space = this.world[wX][wY];
        var color = space.getColor(wX, wY);

        var dX = worldToDraw(wX);
        var dY = worldToDraw(wY);
        var dS = worldToDraw(1);
        this.$pb.fillRect(dX, dY, dS, dS, color);
      }
      this.$pb.render();
    }
  }

  World.prototype.getTonesAt = function (cX, cY) {
    var wX = Math.floor(canvasToWorld(cX));
    var wY = Math.floor(canvasToWorld(cY));
    return this.world[wX][wY].getTone();
  }

  World.prototype.onKeyDown = function (e) {};
  World.prototype.onKeyUp   = function (e) {};
  World.prototype.onMouseMove = function (e) {};

  _.extend(World.prototype, B.Events);

  return World;
});
