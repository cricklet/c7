requirejs.config({
  baseUrl: 'js/',
  shim: {
    'lib/jquery': {
      exports: '$'
    },
    'lib/timbre': {
      exports: 'T'
    },
    'lib/flocking': {
      exports: 'flock'
    },
    'lib/underscore': {
      exports: '_'
    }
  }
});

requirejs(['game'], function (Game) {
  var game = new Game();
});
