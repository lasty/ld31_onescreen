
function Game(renderer, tileimg)
{
	this.renderer = renderer;
	this.tilefactory = new TileFactory(this.renderer, tileimg);

	this.world = new World(this.renderer, this.tilefactory, 32, 20);

	this.world.InitPhysics();


	this.Render = function() {

		this.world.Render();

	}


	this.Update = function(dt) {
		this.world.Update(dt);
	}

}


