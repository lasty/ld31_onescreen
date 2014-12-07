
function Entity(renderer, x, y, radius)
{
	this.renderer = renderer;

	this.position = new b2.Vec2(x, y);
	this.radius = radius;

	this.body = null;
	this.b2world = null;

	this.categoryBits = BITS_ALL;
	this.maskBits = BITS_ALL;
	this.maskBits = BITS_ALL_BUT_PARTICLES;


	this.FillColour = "black";

	this.Alive = true;

	this.SetupPhysics = function(b2world) {
		var fixDef = new b2.FixtureDef();
		fixDef.density = 0.2;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.5;

		fixDef.filter.categoryBits = this.categoryBits;
		fixDef.filter.maskBits = this.maskBits;

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

		this.body.SetUserData(this);

		this.body.SetLinearDamping(4);
		this.b2world = b2world;
	}

	this.RemovePhysics = function() {
		if (this.b2world && this.body)
		{
			this.b2world.DestroyBody(this.body);
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
		//console.log("Entity::update");
		if (this.body)
		{
			this.position.x = toScreen(this.body.GetPosition().x);
			this.position.y = toScreen(this.body.GetPosition().y);
			this.rotation = this.body.GetAngle();
		}
	}


	this.Kill = function() {
		//console.log("Kill() called");
		this.Alive = false;

		if (this.SpawnOnKill) this.SpawnOnKill();
	}

	this.Render = function() {
		this.renderer.SetStroke("yellow");
		this.renderer.SetFill(this.FillColour);//"rgba(255, 255, 128, 0.3)");
		this.renderer.CircleFill(this.position.x, this.position.y, this.radius);
		this.renderer.Circle(this.position.x, this.position.y, this.radius);
	}

	this.Delete = function() {
		this.RemovePhysics();
	}

	this.onContact = function(other) {

	}

	this.ShotBy = function(bullet) {
		this.Kill();
	}

}


function Monster(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_MONSTERS;

	//everything except monster bullets and particles, and pickups
	this.maskBits = BITS_WALL | BITS_PLAYER | BITS_MONSTERS | BITS_PLAYER_BULLETS;

	this.Collide = function(what) {
		if (what instanceof PlayerProjectile)
		{
			this.Kill();
			what.Kill();
			sound.Explosion();
		}
	}
}


function Player(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.moving_up = false;
	this.moving_down = false;
	this.moving_left = false;
	this.moving_right = false;

	this.move_force = 10;

	this.categoryBits = BITS_PLAYER;

	//everything except player bullets and particles
	this.maskBits = BITS_WALL | BITS_PLAYER | BITS_MONSTERS | BITS_MONSTER_BULLETS | BITS_PICKUPS;


	var parent_update = this.Update;
	this.Update = function(dt) {
		//console.log("Player-update");
		var f = this.move_force * dt;
		if (this.moving_up) { this.AddForce(0, -f); }
		if (this.moving_down) { this.AddForce(0, f); }
		if (this.moving_left) { this.AddForce(-f, 0); }
		if (this.moving_right) { this.AddForce(f, 0); }

		parent_update.call(this, dt);
	}
}


function Projectile(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.ttl = 3;  // time to live in seconds

	var parent_update = this.Update;
	this.Update = function(dt) {
		this.ttl -= dt;

		if (this.ttl <= 0)
		{
			this.Kill();
		}

		parent_update.call(this, dt);

	}

}


function PlayerProjectile(renderer, x, y, radius) {
	Projectile.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_PLAYER_BULLETS;

	//everything except player bullets and particles
	this.maskBits = BITS_ALL_BUT_PARTICLES;

	
	this.SpawnOnKill = function() {
		var vel = this.body.GetLinearVelocity();
		if (vel.Length() < 5)
		{
			game.world.SpawnEffect("bullet_crumble", this.position, this.body.GetLinearVelocity());
		}
		else
		{
			game.world.SpawnEffect("bullet_hit", this.position, this.body.GetLinearVelocity());
		}
	}
}


function Particle(renderer, x, y, radius) {
	Projectile.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_PARTICLES;

	//Particles only collide with walls and other particles
	this.maskBits = BITS_WALL | BITS_PARTICLES;

	
}


function EntityFactory(renderer, img)
{
	this.renderer = renderer;
	this.img = img;

	this.MakeEntity = function(which, xpos, ypos) {
		if (which == "big")
		{
			var e = new Monster(this.renderer, xpos, ypos, 32);
			e.FillColour = "rgba(255, 128, 255, 0.3)";
			return e;
		}

		if (which == "little")
		{
			var e = new Monster(this.renderer, xpos, ypos, 16);
			e.FillColour = "rgba(255, 255, 128, 0.3)";
			return e;
		}

		if (which == "player")
		{
			var e = new Player(this.renderer, xpos, ypos, 16);
			e.FillColour = "rgba(128, 255, 128, 0.3)";
			return e;
		}

		if (which == "bullet")
		{
			var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			e.FillColour = "rgba(128, 128, 255, 0.8)";
			return e;
		}

		if (which == "particle")
		{
			//var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			var e = new Particle(this.renderer, xpos, ypos, Math.random() * 6 + 2);
			e.FillColour = "rgba(128, 128, 128, 0.5)";
			return e;
		}

		//Else grab an error entity
		var e = new Entity(this.renderer, xpos, ypos, 8);
		e.FillColour = "rgba(255, 0, 0, 0.5)";
		return e;
		
	}

}


