

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


function World(renderer, tilefactory, entityfactory)
{
	this.renderer = renderer;
	this.tilefactory = tilefactory;
	this.entityfactory = entityfactory;

	this.map = new Map(tilefactory, 32, 20);
	this.map.ClearMap();

	this.boxworld = null;

	this.entities = Array();

	this.InitPhysics = function()
	{
		//this.gravity = new b2.Vec2(0, +20);
		this.gravity = new b2.Vec2(0, 0);

		this.boxworld = new b2.World(this.gravity, true);

		this.map.SetupPhysics(this.boxworld);


		for (var i=0; i<10; i++)
		{
			var e = this.AddEnitity("big", Math.random() * 400 + 200, Math.random() * 100 + 100);
			e.AddForceRandom(20);
		}

		for (var i=0; i<10; i++)
		{
			var e = this.AddEnitity("little", Math.random() * 400 + 200, Math.random() * 100 + 100);
			e.AddForceRandom(20);
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


	this.AddEnitity = function(name, x, y)
	{
		var ent = this.entityfactory.MakeEntity(name, x, y);
		ent.SetupPhysics(this.boxworld);

		this.entities.push(ent);

		return ent;
	}


}


