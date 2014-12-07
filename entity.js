
function Sprite(renderer, img, x, y, w, h)
{
	this.renderer = renderer;
	this.img = img;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.Render = function(x, y, rot, zoom) {
		this.renderer.DrawSprite(this.img, this.x, this.y, this.w, this.h, x, y, zoom, rot);
	}
}

function VectorToAngle(v) {
	var r = Math.atan2(v.y, v.x);
	var d = r * 180 / Math.PI;
	
	return d + 90;
}

function Entity(renderer, x, y, radius)
{
	this.renderer = renderer;

	this.position = new b2.Vec2(x, y);
	this.angle = 0;
	this.radius = radius;

	this.body = null;
	this.b2world = null;

	this.categoryBits = BITS_ALL;
	this.maskBits = BITS_ALL;
	this.maskBits = BITS_ALL_BUT_PARTICLES;


	this.maxpoints = 100;
	this.hitpoints = 100;
	this.armour = 1.0;

	this.sprite = null;

	this.show_health_bars = false;
	this.show_outline = false;
	this.show_fill = true;

	this.rotate_to_velocity = false;

	this.FillColour = "black";
	this.OutlineColour = "grey";
	this.Alpha = 1.0;
	

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
			this.angle = this.body.GetAngle();
		}

		if (this.hitpoints <= 0)
		{
			this.Kill();
		}
	}


	this.Kill = function() {
		//console.log("Kill() called");
		this.Alive = false;

		if (this.SpawnOnKill) this.SpawnOnKill();
	}

	this.Render = function() {

		if (this.GetParticleFade)
		{
			this.renderer.SetAlpha(this.GetParticleFade());
		}
		else
		{
			this.renderer.SetAlpha(this.Alpha);
		}

		if (this.sprite)
		{
			if (this.rotate_to_velocity)
			{
				var angle = VectorToAngle(this.body.GetLinearVelocity());
				this.sprite.Render(this.position.x, this.position.y, angle, this.radius);
			}
			else
			{
				this.sprite.Render(this.position.x, this.position.y, this.angle, this.radius);
			}
		}

		if (this.show_fill)
		{
			this.renderer.SetFill(this.FillColour);//"rgba(255, 255, 128, 0.3)");
			this.renderer.CircleFill(this.position.x, this.position.y, this.radius);
		}

		if (this.show_outline)
		{
			this.renderer.SetStroke(this.OutlineColour);
			this.renderer.Circle(this.position.x, this.position.y, this.radius);
		}

		if (this.show_health_bars)
		{
			this.RenderHealthBars();
		}
	}

	this.GetHealthBarColour = function() {
		var pct = this.hitpoints / this.maxpoints * 100;
		if (pct == 100) return "";
		else if (pct >= 100) return "teal";
		else if (pct >66) return "green";
		//else if (pct > 40) return "lime";
		else if (pct > 33) return "orange";
		else if (pct >= 0) return "red";
		else return "black";
	}

	this.RenderHealthBars = function()
	{

		var col = this.GetHealthBarColour();
		if (col)
		{
			this.renderer.SetAlpha(1.0);
			this.renderer.SetStroke(col);

			var ctx = this.renderer.GetContext();
			var pct = this.hitpoints / this.maxpoints;
			if (pct < 0) pct = 0.01;
			if (pct > 1) pct = 1.0;

			var rad = (Math.PI / 2) * pct;
			var offset = +(Math.PI / 2);

			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.radius * 1.10, offset-rad, offset+rad, false);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.radius * 1.15, offset-rad, offset+rad, false);
			ctx.stroke();

		}
	}

	this.Delete = function() {
		this.RemovePhysics();
	}

	this.onContact = function(other) {

	}

	this.ShotBy = function(bullet) {
		var bullet_damage = bullet.bullet_damage;

		this.ApplyDamage(bullet.bullet_damage);
	}

	this.ApplyDamage = function(damage) {
		var actual_damage = damage * this.armour;

		this.hitpoints -= actual_damage;

		game.world.SpawnEffect("damage_text", this.position, this.body.GetLinearVelocity(), actual_damage);
		sound.Hit();
	}
}


function Monster(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_MONSTERS;

	//everything except monster bullets and particles, and pickups
	this.maskBits = BITS_WALL | BITS_PLAYER | BITS_MONSTERS | BITS_PLAYER_BULLETS;

	this.show_health_bars = true;
	this.show_fill = false;

	this.Collide = function(what) {
		if (what instanceof PlayerProjectile)
		{
			this.ShotBy(what);
			what.Kill();
		}
	}

	this.SpawnOnKill = function() {
		sound.Explosion();
		game.world.SpawnEffect("monster_die", this.position, this.body.GetLinearVelocity());
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

	this.show_health_bars = true;
	this.show_fill = false;

	this.rotate_to_velocity = true;

	//everything except player bullets and particles
	this.maskBits = BITS_WALL | BITS_PLAYER | BITS_MONSTERS | BITS_MONSTER_BULLETS | BITS_PICKUPS;


	var parent_update = this.Update;
	this.Update = function(dt) {
		//console.log("Player-update");

		//Don't apply moving when dead
		if (this.Alive)
		{
			var f = this.move_force * dt;
			if (this.moving_up) { this.AddForce(0, -f); }
			if (this.moving_down) { this.AddForce(0, f); }
			if (this.moving_left) { this.AddForce(-f, 0); }
			if (this.moving_right) { this.AddForce(f, 0); }
		}

		parent_update.call(this, dt);
	}
}


function Projectile(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.ttl = 3;  // time to live in seconds

	this.ttl_fade = 1;  // start fading out here

	var parent_update = this.Update;
	this.Update = function(dt) {
		this.ttl -= dt;

		if (this.ttl <= 0)
		{
			this.Kill();
		}

		parent_update.call(this, dt);

	}

	this.GetParticleFade = function()
	{
		if (this.ttl > this.ttl_fade) return 1.0;

		var f = (this.ttl / this.ttl_fade);

		if (f < 0) f = 0.0;
		if (f > 1) f = 1.0;

		return f;
	}

}


function PlayerProjectile(renderer, x, y, radius) {
	Projectile.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_PLAYER_BULLETS;

	//everything except player bullets and particles
	this.maskBits = BITS_ALL_BUT_PARTICLES;


	this.show_fill = false;
	this.rotate_to_velocity = true;

	this.ttl = 2;
	this.ttl_fade = 0;
	this.bullet_damage = 25;
	
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

	this.show_fill = true;
}


function DamageNumbers(renderer, x, y, nums) {
	Particle.call(this, renderer, x, y, 16);

	this.numbertext = nums;

	this.ttl = 1.0;
	this.ttl_fade = 0.25;

	this.Render = function() {
		
		var ctx = this.renderer.GetContext();
		ctx.font = "16px Roboto";

		var fade = this.GetParticleFade();

		ctx.fillStyle = "rgba(255, 0, 0, " + fade + ")";

		ctx.fillText(this.numbertext, this.position.x, this.position.y);

	}

}


function EntityFactory(renderer, img, playerimg)
{
	this.renderer = renderer;
	this.img = img;
	this.playerimg = playerimg;


	this.sprites = {
		"rat" : new Sprite(this.renderer, this.img, 87, 81, 29, 29),
		"blob" : new Sprite(this.renderer, this.img, 9, 79, 34, 34),
		"spider" : new Sprite(this.renderer, this.img, 77, 134, 51, 51),
		"snowman" : new Sprite(this.renderer, this.img, 2, 128, 57, 57),

		"player" : new Sprite(this.renderer, this.playerimg, 8, 211, 44, 44),

		"bullet1" : new Sprite(this.renderer, this.img, 136, 12, 17, 17),
		"bullet2" : new Sprite(this.renderer, this.img, 160, 12, 17, 17),
		"bullet3" : new Sprite(this.renderer, this.img, 185, 12, 17, 17),
	}

	this.MakeEntity = function(which, xpos, ypos, data) {
		if (which == "rat")
		{
			var e = new Monster(this.renderer, xpos, ypos, 29/2);
			e.sprite = this.sprites["rat"];

			e.hitpoints = e.maxpoints = 50;

			return e;
		}
		if (which == "blob")
		{
			var e = new Monster(this.renderer, xpos, ypos, 34/2);
			e.sprite = this.sprites["blob"];

			e.hitpoints = e.maxpoints = 40;

			return e;
		}

		if (which == "spider")
		{
			var e = new Monster(this.renderer, xpos, ypos, 51/2);
			e.sprite = this.sprites["spider"];

			e.hitpoints = e.maxpoints = 100;

			return e;
		}

		if (which == "snowman")
		{
			var e = new Monster(this.renderer, xpos, ypos, 57/2);
			e.sprite = this.sprites["snowman"];

			e.hitpoints = e.maxpoints = 200;

			return e;
		}

		if (which == "player")
		{
			var e = new Player(this.renderer, xpos, ypos, 16);
			e.sprite = this.sprites["player"];

			e.hitpoints = e.maxpoints = 100;

			return e;
		}

		if (which == "bullet")
		{
			var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			e.sprite = this.sprites["bullet1"];
			return e;
		}

		if (which == "particle")
		{
			//var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			var e = new Particle(this.renderer, xpos, ypos, Math.random() * 6 + 2);
			e.FillColour = "rgba(128, 128, 128, 0.8)";
			return e;
		}

		if (which == "damage_text")
		{
			//var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			var e = new DamageNumbers(this.renderer, xpos, ypos, data);
			//e.FillColour = "rgba(128, 128, 128, 0.8)";
			return e;
		}

		//Else grab an error entity
		var e = new Entity(this.renderer, xpos, ypos, 8);
		e.FillColour = "rgba(255, 0, 0, 0.5)";
		return e;
	}

}


