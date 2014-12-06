
function TileFactory(renderer, img)
{
	this.renderer = renderer;
	this.img = img;

	this.MakeTile = function(which) {
		if (which == "floor" || which == "floor1")
		{
			return new Tile(this.renderer, this.img, 32, 0, 32, 32);
		}
		if (which == "floor2")
		{
			return new Tile(this.renderer, this.img, 64, 0, 32, 32);
		}
		if (which == "wall")
		{
			return new Tile(this.renderer, this.img, 32*3, 0, 32, 32);
		}

		//Else grab an error texture
		return new Tile(this.renderer, this.img, 0, 0, 32, 32);
	}

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

				if (x==0 || y==0 || x==(this.width-1) || y==(this.height-1)) tile = "wall";

				//if (y==5) tile = "wall";

				this.SetTile(x, y, tile);
			}
		}
	}


	this.SetTile = function(x, y, which)
	{
		var newtile = this.tilefactory.MakeTile(which);
		this.data[this.width * y + x] = newtile;
	}

	this.GetTile = function(x, y) {
		return this.data[this.width * y + x];
	}

	this.Render = function()
	{
		var zoom = 1;
		var tilesize = 32;

		for(var x=0; x<this.width; x++)
		{
			for(var y=0; y<this.height; y++)
			{
				var t = this.GetTile(x, y);
				if (t)
				{
					t.Render(x * tilesize*zoom, y*tilesize*zoom, zoom);
				}
			}
		}

	}

}


function Game(renderer, tileimg)
{
	this.renderer = renderer;
	this.tilefactory = new TileFactory(this.renderer, tileimg);

	this.map = new Map(this.tilefactory, 32, 20);
	this.map.ClearMap();


	this.Render = function()
	{
		this.renderer.SetSmooth(false);

		this.map.Render();

		this.renderer.SetSmooth(true);

		//Render entities here
	}
}


