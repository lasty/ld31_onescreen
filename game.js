
function Game(renderer, tileimg, entimg, playerimg)
{
	this.renderer = renderer;
	this.tilefactory = new TileFactory(this.renderer, tileimg);
	this.entityfactory = new EntityFactory(this.renderer, entimg, playerimg);

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
		var kp = false;

		if (key == "W" || k.keyCode == 38) { this.world.GetPlayer().moving_up = down; kp=true; }
		if (key == "S" || k.keyCode == 40) { this.world.GetPlayer().moving_down = down; kp=true; }
		if (key == "A" || k.keyCode == 37) { this.world.GetPlayer().moving_left = down; kp=true; }
		if (key == "D" || k.keyCode == 39) { this.world.GetPlayer().moving_right = down; kp=true; }


		//Debugging sounds
		if (false)
		{
			if (key == "1") sound.Hit();
			if (key == "2") sound.Shoot();
			if (key == "3") sound.Pickup();
			if (key == "4") sound.Explosion();
			if (key == "5") sound.Powerup();
		}

		return kp;
	}

	this.Click = function(x, y)
	{
		var playerpos = this.world.GetPlayer().position;
		var clickpos = new b2.Vec2(x, y);

		this.world.GetPlayer().Attack(1, playerpos, clickpos);

	}


	this.RightClick = function(x, y)
	{
		var playerpos = this.world.GetPlayer().position;
		var clickpos = new b2.Vec2(x, y);

		this.world.GetPlayer().Attack(2, playerpos, clickpos);
	}

	this.RestartGame = function()
	{
		this.world = new World(this.renderer, this.tilefactory, this.entityfactory);

		this.world.InitPhysics();

	}

	this.GotoNextLevel = function()
	{
		this.world.GotoNextLevelButton();
	}

	this.GotoLevel = function(n)
	{
		this.world.GotoLevel(n);
	}
}


