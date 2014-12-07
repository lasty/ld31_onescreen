

function MyContactListener() {

	this.BeginContact = function(contact) {
		var ent1 = contact.GetFixtureA().GetBody().GetUserData();
		var ent2 = contact.GetFixtureB().GetBody().GetUserData();

		//console.log("Contact!");
		if (ent1 && ent2)
		{
			if (ent1.Collide) ent1.Collide(ent2);
			if (ent2.Collide) ent2.Collide(ent1);
		}
	}

	this.EndContact = function(contact) { }
	this.PreSolve = function(contact, oldManifold) { }
	this.PostSolve = function(contact, impulse) { }
}


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
	this.contactlistener = null;

	this.player = null;

	this.entities = Array();

	this.InitPhysics = function()
	{
		//this.gravity = new b2.Vec2(0, +20);
		this.gravity = new b2.Vec2(0, 0);

		this.boxworld = new b2.World(this.gravity, true);

		this.contactlistener = new MyContactListener();

		this.boxworld.SetContactListener(this.contactlistener);

		this.map.SetupPhysics(this.boxworld);

		this.NewGame();
	}

	this.NewGame = function()
	{

		for (var i=0; i<10; i++)
		{
			var e = this.AddEntity("big", Math.random() * 400 + 200, Math.random() * 100 + 100);
			e.AddForceRandom(20);
		}

		for (var i=0; i<10; i++)
		{
			var e = this.AddEntity("little", Math.random() * 400 + 200, Math.random() * 100 + 100);
			e.AddForceRandom(20);
		}


		this.player = this.entityfactory.MakeEntity("player", 500, 500);
		this.player.SetupPhysics(this.boxworld);
		this.player.AddForceRandom(20);
	}

	this.GetPlayer = function() { return this.player; }

	this.Update = function(dt)
	{
		//Create any pending entities from the spawn list
		this.CreateFromSpawnList();


		this.boxworld.Step(1/60, 10, 10);
		this.boxworld.ClearForces();

		//console.log("Update("+dt+") - num entities: " + this.entities.length);

		for(var i=0; i<this.entities.length;)
		{
			var e = this.entities[i];

			e.Update(dt);

			if (!e.Alive)
			{
				e.Delete();
				this.entities.splice(i, 1);
			}
			else
			{
				i++;
			}
		}

		this.player.Update(dt);

	}

	this.Render = function()
	{
		//Render tilemap
		//this.renderer.SetSmooth(false);

		this.map.Render();

		//this.renderer.SetSmooth(true);

		//Render entities
		for(var i=0; i<this.entities.length; i++)
		{
			var e = this.entities[i];

			e.Render();
		}

		this.player.Render();
	}


	this.AddEntity = function(name, x, y)
	{
		var ent = this.entityfactory.MakeEntity(name, x, y);
		ent.SetupPhysics(this.boxworld);

		this.entities.push(ent);

		return ent;
	}


	this.CreateProjectile = function(name, pos, aimto) {
		var projectile_speed = 10.0;  //TODO set in entity

		var direction = b2.Vec2.Subtract(aimto, pos);
		direction.Normalize();

		var offset_pos = b2.Vec2.Multiply(18, direction);

		var ent = this.entityfactory.MakeEntity(name, pos.x+offset_pos.x, pos.y+offset_pos.y);
		ent.SetupPhysics(this.boxworld);

		ent.body.SetBullet(true);

		ent.AddForce(direction.x * projectile_speed, direction.y * projectile_speed);

		this.entities.push(ent);

		return ent;
	}

	this.spawnlist = Array();

	this.CreateFromSpawnList = function()
	{
		for(var i=0; i<this.spawnlist.length; i++)
		{
			var e = this.spawnlist[i];
			var name = e[0];
			var pos = e[1];
			var vel = e[2];

			var ent = this.AddEntity(name, pos.x, pos.y);
			ent.AddForce(vel.x, vel.y);
		}

		this.spawnlist = Array();

		if (this.spawnlist.length)
		{
			debugger;
		}
	}

	this.SpawnEntity = function(what, pos, vel) {
		this.spawnlist.push([what, pos, vel ]);
	}

	this.SpawnEffect = function(what, pos, vel) {
		if (what == "bullet_hit")
		{
			for (var i=0; i<5; i++)
			{
				this.SpawnEntity("particle", pos, vel);
			}
		}

		if (what == "bullet_crumble")
		{
			for (var i=0; i<1; i++)
			{
				this.SpawnEntity("particle", pos, vel);
			}
		}
	}


}


