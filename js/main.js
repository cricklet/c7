requirejs.config({
  baseUrl: 'js/',
  shim: {
    'lib/jquery': {
      exports: '$'
    }
  , 'lib/timbre': {
      exports: 'T'
    }
  , 'lib/flocking': {
      exports: 'flock'
    }
  }
});

requirejs(['game'], function (Game) {
  new Game().start();
});
