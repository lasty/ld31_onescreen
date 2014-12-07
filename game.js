
function Game(renderer, tileimg, entimg)
{
	this.renderer = renderer;
	this.tilefactory = new TileFactory(this.renderer, tileimg);
	this.entityfactory = new EntityFactory(this.renderer, entimg);

	this.world = new World(this.renderer, this.tilefactory, this.entityfactory);

	this.world.InitPhysics();


	this.Render = function() {

		this.world.Render();
	}


	this.Update = function(dt) {
		this.world.Update(dt);
	}


	this.Key = function(k, key, down)
	{
		if (key == "W") { this.world.GetPlayer().moving_up = down; }
		if (key == "S") { this.world.GetPlayer().moving_down = down; }
		if (key == "A") { this.world.GetPlayer().moving_left = down; }
		if (key == "D") { this.world.GetPlayer().moving_right = down; }


		//Debugging sounds
		if (false)
		{
			if (key == "1") sound.Hit();
			if (key == "2") sound.Shoot();
			if (key == "3") sound.Pickup();
			if (key == "4") sound.Explosion();
			if (key == "5") sound.Powerup();
		}

	}

	this.Click = function(x, y)
	{
		var playerpos = this.world.GetPlayer().position;
		var clickpos = new b2.Vec2(x, y);

		for(var i=0; i<1; i++)
		{
			this.world.CreateProjectile("bullet", playerpos, clickpos);
		}
		sound.Shoot();
	}


	this.RightClick = function(x, y)
	{
		var playerpos = this.world.GetPlayer().position;
		var clickpos = new b2.Vec2(x, y);

		for(var i=0; i<5; i++)
		{
			this.world.CreateProjectile("particle", playerpos, clickpos);
		}
	}

}


