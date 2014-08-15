define(function (require) {
  var Butler = require('lib/pixelbutler');

  var CANVAS_WIDTH  = 640;
  var CANVAS_HEIGHT = 480;

  var DRAW_WIDTH  = 128; // dX, dY
  var DRAW_HEIGHT = 96;

  var WORLD_WIDTH  = 64; // wX, wY
  var WORLD_HEIGHT = 48;

  var worldToDraw = function (wX) { return wX * 2; }
  var drawToWorld = function (dX) { return dX * 0.5; }

  var Space = function () {
    this.tones = [];
  }
  Space.prototype.addTone = function (midi, vol) {
    this.tones.push({
      midi: midi,
      vol: vol,
    })
  }
  Space.prototype.getColor = function () {
    return {
      r: Math.floor(255 * Math.random()),
      g: Math.floor(255 * Math.random()),
      b: Math.floor(255 * Math.random()),
    }
  }

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

          var randomMidi = 60 + Math.floor(Math.random() * 8);
          this.world[wX][wY].addTone(randomMidi, 1);
        }
    }
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

  return World;
});
