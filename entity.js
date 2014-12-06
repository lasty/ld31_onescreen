
function Entity(renderer, x, y, radius)
{
	this.renderer = renderer;

	this.position = new b2.Vec2(x, y);
	this.radius = radius;

	this.body = null;
	this.b2world = null;

	this.FillColour = "black";

	this.SetupPhysics = function(b2world) {
		var fixDef = new b2.FixtureDef();
		fixDef.density = 0.2;
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

		this.body.SetLinearDamping(4);
		this.b2world = b2world;
	}

	this.RemovePhysics = function() {
		if (this.b2world && this.body)
		{
			this.b2world.RemoveBody(this.body);
		}
	}

	this.AddForce = function (x, y) {
		if (this.body)
		{
			var force = new b2.Vec2(x,y);
			this.body.ApplyLinearImpulse(force, this.body.GetWorldCenter());
		}
	}

	this.AddForceRandom = function(size) {
		this.AddForce( Math.random() * size*2 - size, Math.random() * size*2 - size);
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
		this.renderer.SetFill(this.FillColour);//"rgba(255, 255, 128, 0.3)");
		this.renderer.CircleFill(this.position.x, this.position.y, this.radius);
		this.renderer.Circle(this.position.x, this.position.y, this.radius);
	}

}


function EntityFactory(renderer, img)
{
	this.renderer = renderer;
	this.img = img;

	this.MakeEntity = function(which, xpos, ypos) {
		if (which == "big")
		{
			var e = new Entity(this.renderer, xpos, ypos, 32);
			e.FillColour = "rgba(255, 255, 128, 0.3)";
			return e;
		}
		if (which == "little")
		{
			var e = new Entity(this.renderer, xpos, ypos, 16);
			e.FillColour = "rgba(255, 128, 255, 0.3)";
			return e;
		}

		//Else grab an error entity
		return new Entity(this.renderer, xpos, ypos, 8);
	}

}


