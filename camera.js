
var TILESIZE = 32;

var SCALE = 32;  //To adjust Box2D units

function toWorld(x) { return x / SCALE; }
function toScreen(x) { return x * SCALE; }

