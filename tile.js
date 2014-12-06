

var SCALE = 32;  //To adjust Box2D units

function toWorld(x) { return x / SCALE; }
function toScreen(x) { return x * SCALE; }


function Tile(renderer, img, x, y, w, h, xpos, ypos, collision)
{
	this.renderer = renderer;
	this.img = img;

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.collision = collision;

	this.position = new b2.Vec2(xpos, ypos);

	this.Render = function() {
		this.renderer.DrawTile(this.img, this.x, this.y, this.w, this.h, this.position.x, this.position.y, this.w, this.h);
	}

	this.SetupPhysics = function(b2world)
	{
		if (this.collision)
		{
			var fixDef = new b2.FixtureDef();
			fixDef.density = 1;
			fixDef.friction = 0.5;

			var bodyDef = new b2.BodyDef();
			bodyDef.type = b2.Body.b2_staticBody;
			bodyDef.position.x = toWorld(this.position.x + (this.w/2));
			bodyDef.position.y = toWorld(this.position.y + (this.h/2));

			fixDef.shape = new b2.PolygonShape();
			fixDef.shape.SetAsBox(toWorld(this.w/2), toWorld(this.h/2));
	
			//console.log(fixDef);
			//console.log(bodyDef);

			b2world.CreateBody(bodyDef).CreateFixture(fixDef);
		}
	}
};



function TileFactory(renderer, img)
{
	this.renderer = renderer;
	this.img = img;

	this.MakeTile = function(which, xpos, ypos) {
		if (which == "floor" || which == "floor1")
		{
			return new Tile(this.renderer, this.img, 32, 0, 32, 32, xpos, ypos, false);
		}
		if (which == "floor2")
		{
			return new Tile(this.renderer, this.img, 64, 0, 32, 32, xpos, ypos, false);
		}
		if (which == "wall")
		{
			return new Tile(this.renderer, this.img, 32*3, 0, 32, 32, xpos, ypos, true);
		}

		//Else grab an error texture
		return new Tile(this.renderer, this.img, 0, 0, 32, 32, xpos, ypos, true);
	}

}


