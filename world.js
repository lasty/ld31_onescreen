
var TILESIZE = 32;

var SCALE = 32;  //To adjust Box2D units

function toWorld(x) { return x / SCALE; }
function toScreen(x) { return x * SCALE; }


function Map(tilefactory, width, height)
{
	this.tilefactory = tilefactory;
	this.width = width;
	this.height = height;


	this.data = new Array(width*height);


	this.ClearMap = function()
	{
		for(var x=0; x<this.width; x++)
		{
			for(var y=0; y<this.height; y++)
			{
				var tile = (Math.random() < 0.5) ? "floor1" : "floor2";

				if (Math.random() < 0.01) tile = "wall";

				if (x==0 || y==0 || x==(this.width-1) || y==(this.height-1)) tile = "wall";

				//if (y==5) tile = "wall";

				this.SetTile(x, y, tile);
			}
		}
	}


	this.SetTile = function(x, y, which)
	{
		var newtile = this.tilefactory.MakeTile(which, x*TILESIZE, y*TILESIZE);
		this.data[this.width * y + x] = newtile;
	}

	this.GetTile = function(x, y) {
		return this.data[this.width * y + x];
	}

	this.SetupPhysics = function(b2world) {
		for(var x=0; x<this.width; x++)
		{
			for(var y=0; y<this.height; y++)
			{
				var t = this.GetTile(x, y);
				if (t)
				{
					t.SetupPhysics(b2world);
				}
			}
		}
	}

	this.Render = function() {
		var zoom = 1;

		for(var x=0; x<this.width; x++)
		{
			for(var y=0; y<this.height; y++)
			{
				var t = this.GetTile(x, y);
				if (t)
				{
					t.Render();
				}
			}
		}

	}

	this.Update = function(dt) {

	}

}


function Entity(renderer, x, y, radius)
{
	this.renderer = renderer;

	this.position = new b2.Vec2(x, y);
	this.radius = radius;

	this.body = null;
	this.b2world = null;


	this.SetupPhysics = function(b2world) {
		var fixDef = new b2.FixtureDef();
		fixDef.density = 1;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.5;

		var bodyDef = new b2.BodyDef();
		bodyDef.type = b2.Body.b2_dynamicBody;
		bodyDef.position.x = toWorld(this.position.x);
		bodyDef.position.y = toWorld(this.position.y);

		var pos = b2.Vec2( toWorld(this.position.x), toWorld(this.position.y));

		fixDef.shape = new b2.CircleShape();
		fixDef.shape.m_radius = toWorld(this.radius);   //XXX Hackery!  Can't work out how to set this normally

		//fixDef.shape = new b2.PolygonShape();
		//fixDef.shape.SetAsBox(toWorld(this.radius), toWorld(this.radius));

		//console.log(fixDef);
		//console.log(bodyDef);

		this.body = b2world.CreateBody(bodyDef);
		//this.body.SetPosition(pos);
		this.body.CreateFixture(fixDef);
		this.b2world = b2world;
	}

	this.RemovePhysics = function() {
		if (this.b2world && this.body)
		{
			this.b2world.RemoveBody(this.body);
		}
	}

	this.Update = function(dt) {
		if (this.body)
		{
			this.position.x = toScreen(this.body.GetPosition().x);
			this.position.y = toScreen(this.body.GetPosition().y);
			this.rotation = this.body.GetAngle();
		}
	}


	this.Render = function() {
		this.renderer.SetStroke("yellow");
		this.renderer.SetFill("rgba(255, 255, 128, 0.3)");
		this.renderer.CircleFill(this.position.x, this.position.y, this.radius);
		this.renderer.Circle(this.position.x, this.position.y, this.radius);
	}

}



function World(renderer, tilefactory)
{
	this.renderer = renderer;

	this.map = new Map(tilefactory, 32, 20);
	this.map.ClearMap();

	this.boxworld = null;

	this.entities = Array();

	this.InitPhysics = function()
	{
		this.gravity = new b2.Vec2(0, +20);

		this.boxworld = new b2.World(this.gravity, true);

		this.map.SetupPhysics(this.boxworld);


		for (var i=0; i<10; i++)
		{
			this.AddEnitity(Math.random() * 400 + 200, Math.random() * 100 + 100, 32);
		}

		for (var i=0; i<10; i++)
		{
			this.AddEnitity(Math.random() * 400 + 200, Math.random() * 100 + 100, 16);
		}

	}


	this.Update = function(dt)
	{
		this.boxworld.Step(1/60, 8, 3);
		this.boxworld.ClearForces();

		//console.log("Update("+dt+") - num entities: " + this.entities.length);

		for(var i=0; i<this.entities.length; i++)
		{
			var e = this.entities[i];

			e.Update(dt);
		}

	}

	this.Render = function()
	{
		this.renderer.SetSmooth(false);

		this.map.Render();

		this.renderer.SetSmooth(true);

		for(var i=0; i<this.entities.length; i++)
		{
			var e = this.entities[i];

			e.Render();
		}

		//Render entities here
	}


	this.AddEnitity = function(x, y, r)
	{
		var ent = new Entity(this.renderer, x, y, r);
		ent.SetupPhysics(this.boxworld);

		this.entities.push(ent);
	}


}


