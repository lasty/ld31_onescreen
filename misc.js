
var TILESIZE = 32;

var SCALE = 32;  //To adjust Box2D units

function toWorld(x) { return x / SCALE; }
function toScreen(x) { return x * SCALE; }

//For collision masks

var BITS_WALL = 1;
var BITS_PLAYER = 2;
var BITS_MONSTERS = 4;
var BITS_PLAYER_BULLETS = 8;
var BITS_MONSTER_BULLETS = 16;
var BITS_PICKUPS = 32;
var BITS_PARTICLES = 64;

var BITS_ALL = 127;
var BITS_ALL_BUT_PARTICLES = BITS_WALL | BITS_PLAYER | BITS_MONSTERS
	| BITS_PLAYER_BULLETS | BITS_MONSTER_BULLETS | BITS_PICKUPS;
