
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

}


