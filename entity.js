
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
	this.box = null;


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

		if (this.box) //this is a sword
		{
			fixDef.density = 0.05;
			fixDef.shape = new b2.PolygonShape();
			fixDef.shape.SetAsBox(toWorld(this.sword_width), toWorld(this.sword_length), 0, toWorld(this.sword_length));
			bodyDef.angle = this.angle;
		}
		else //this is a circle
		{
			fixDef.shape = new b2.CircleShape();
			fixDef.shape.m_radius = toWorld(this.radius);   //XXX Hackery!  Can't work out how to set this normally
		}


		//console.log(fixDef);
		//console.log(bodyDef);

		this.body = b2world.CreateBody(bodyDef);
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

	this.AddAngularForce = function (f) {
		if (this.body)
		{
			this.body.ApplyAngularImpulse(f, this.body.GetWorldCenter());
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
		var actual_damage = damage - this.armour;
		if (actual_damage < 1) { actual_damage = 1; }

		this.hitpoints -= actual_damage;

		game.world.SpawnEffect("damage_text", this.position, this.body.GetLinearVelocity(), actual_damage);

		if (this.Alive)
		{
			sound.Hit();
		}
	}

	this.AddHealth = function(damage) {
		if (this.Alive)
		{
			this.hitpoints += damage;
			if (this.hitpoints > this.maxpoints) { this.hitpoints = this.maxpoints; }

			sound.Powerup();
		}
	}

}


function Monster(renderer, x, y, radius) {
	Entity.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_MONSTERS;

	//everything except monster bullets and particles, and pickups
	this.maskBits = BITS_WALL | BITS_PLAYER | BITS_MONSTERS | BITS_PLAYER_BULLETS;

	this.show_health_bars = true;
	this.show_fill = false;

	this.move_force = 1;
	this.stunned_cooldown = 1;
	this.attack_cooldown = 2;
	this.melee_range = 10;
	this.melee_damage = 10;

	this.Collide = function(what) {
		if (what instanceof PlayerProjectile)
		{
			this.ShotBy(what);
			what.Kill();
		}
		else if (what instanceof MeleeWeapon)
		{
			this.ShotBy(what);
			what.Kill();
		}
	}

	this.SpawnOnKill = function() {
		sound.Explosion();
		game.world.SpawnEffect("monster_die", this.position, this.body.GetLinearVelocity());
	}

	var parent_update = this.Update;
	this.Update = function(dt) {
		//console.log("Player-update");

		//Don't apply moving when dead
		if (this.Alive && this.stunned_cooldown < 0)
		{
			//Completely cheat and just get players location

			var player = game.world.GetPlayer();
			var playerloc = player.position;
			var vectoplayer = b2.Vec2.Subtract(playerloc, this.position);
			var dist_to_player = vectoplayer.Length() - this.radius - player.radius;
			vectoplayer.Normalize();
			vectoplayer.Multiply(this.move_force * dt);

			this.AddForce(vectoplayer.x, vectoplayer.y);

			parent_update.call(this, dt);

			this.angle = VectorToAngle(vectoplayer);

			if (dist_to_player < this.melee_range && this.attack_cooldown < 0)
			{
				player.ApplyDamage(this.melee_damage);
				if (player.Alive)
				{
					sound.Shoot();
				}
				this.attack_cooldown = 1.0 + Math.random() * 1;
			}
		}
		else
		{
			parent_update.call(this, dt);
		}

		this.stunned_cooldown -= dt;
		this.attack_cooldown -= dt;

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


	this.melee_cooldown = 0.0;
	this.ranged_cooldown = 0.0;

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

		this.melee_cooldown -= dt;
		this.ranged_cooldown -= dt;

		parent_update.call(this, dt);
	}

	this.shotgun_ammo = 0;
	this.pistol_ammo = 0;

	this.has_pistol = false;
	this.has_shotgun = false;
	this.has_sword = false;


	this.Attack = function(id, playerpos, clickpos)
	{
		if (!this.Alive) return;

		if (this.ranged_cooldown >= 0) { console.log ("range attack on cooldown: " + this.ranged_cooldown); return; }
		if (this.melee_cooldown >= 0) { console.log ("melee attack on cooldown: " + this.melee_cooldown); return; }

		var selected_weap = "";

		//console.log("Attack: id is "+id);
		if (id == 1)
		{
			if (this.has_shotgun && this.shotgun_ammo)
			{
				selected_weap = "shotgun";
			}
			else if (this.has_pistol && this.pistol_ammo)
			{
				selected_weap = "pistol";
			}
			else
			{
				selected_weap = "knife";
			}
		}
		else if (id == 2)
		{
			if (this.has_sword)
			{
				selected_weap = "sword";
			}
			else
			{
				selected_weap = "knife";
			}
		}
		else throw "unknown id in Player.Attack()";


		if (selected_weap == "pistol")
		{
			this.pistol_ammo--;
			game.world.CreateProjectile(1, "bullet1", "pistol_sprite", playerpos, clickpos);
			sound.Shoot();
		}
		else if (selected_weap == "shotgun")
		{
			this.shotgun_ammo--;
			game.world.CreateProjectile(4, "bullet3", "shotgun_sprite", playerpos, clickpos);
			this.ranged_cooldown = 0.5;
			sound.Shoot();
		}
		else if (selected_weap == "sword")
		{
			var m = game.world.CreateMelee("sword_sprite", playerpos, clickpos);
			this.melee_cooldown = m.ttl + 0.01;
			sound.Shoot();
		}
		else if (selected_weap == "knife")
		{
			var m = game.world.CreateMelee("knife", playerpos, clickpos);
			this.melee_cooldown = m.ttl + 0.01;
			sound.Shoot();
		}
		else throw "unknown weapon in Player.Attack()";
	}

	this.AddAmmo = function(what, num) {
		if (this.Alive)
		{
			if (what == "bullet")
			{
				this.pistol_ammo += num;
				sound.Pickup();
			}
			else if (what == "shell")
			{
				this.shotgun_ammo += num;
				sound.Pickup();
			}
		}
	}

	this.AddWeapon = function(what) {
		if (this.Alive)
		{
			if (what == "pistol")
			{
				this.has_pistol = true;
				sound.Pickup();
			}
			else if (what == "shotgun")
			{
				this.has_shotgun = true;
				sound.Pickup();
			}
			else if (what == "sword")
			{
				this.has_sword = true;
				sound.Pickup();
			}
		}
	}


	this.AddArmour = function(ac) {
		if (this.Alive)
		{
			this.armour += ac;

			sound.Pickup();
		}
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


function MeleeWeapon(renderer, x, y, radius, sword_width, sword_length, angle) {
	Particle.call(this, renderer, x, y, radius);

	this.sword_width = sword_width;
	this.sword_length = sword_length;
	this.sword_swing_speed = -180;
	this.angle = angle;
	

	this.box = true;
	//this.angle = rotation;

	this.show_outline = false;
	this.show_fill = false;
	this.FillColour = "black";
	this.OutlineColour = "white";

	//Ok sorta bullets
	this.categoryBits = BITS_PLAYER_BULLETS;

	//everything except player bullets and particles
	this.maskBits = BITS_ALL_BUT_PARTICLES;


	this.rotate_to_velocity = false;

	this.ttl = 0.2;
	this.ttl_fade = 0.1;
	this.bullet_damage = 25;
	
}


function SpriteOnly(renderer, x, y, radius, angle)
{
	Particle.call(this, renderer, x, y, radius);

	this.angle = angle;

	this.ttl = 0.2;
	this.ttl_fade = 0.1;

	this.show_fill = false;
	this.show_outline = false;

	this.SetupPhysics = function(b2world) {  }
}


function Pickup(renderer, x, y, radius)
{
	Entity.call(this, renderer, x, y, radius);

	this.categoryBits = BITS_PICKUPS;

	//everything except player bullets and particles
	this.maskBits = BITS_PLAYER | BITS_MONSTERS | BITS_WALL;

	this.health = null;
	this.armour = null;
	this.ammo1 = null;
	this.ammo2 = null;

	this.show_fill = false;
	this.show_outline = true;

	this.weapon = null;


	this.Collide = function(what) {
		if (what instanceof Player)
		{
			if (this.health)
			{
				what.AddHealth(this.health);
				console.log("+health : " + this.health);

				//sound.Powerup();
			}

			if (this.armour)
			{
				what.AddArmour(this.armour);
				console.log("+armour : " + this.armour);

				//sound.Powerup();
			}

			if (this.ammo1)
			{
				what.AddAmmo("bullet", this.ammo1);
				console.log("+bullet : " + this.ammo1);
			}

			if (this.ammo2)
			{
				what.AddAmmo("shell", this.ammo2);
				console.log("+shell : " + this.ammo2);
			}

			if (this.weapon)
			{
				what.AddWeapon(this.weapon);
				console.log("+weapon : " + this.weapon);
			}

			this.Kill();
		}
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

		"knife" : new Sprite(this.renderer, this.img, 0, 4, 25, 25),
		"sword" : new Sprite(this.renderer, this.img, 21, 3, 55, 55),
		"pistol" : new Sprite(this.renderer, this.img, 61, 9, 43, 43),
		"shotgun" : new Sprite(this.renderer, this.img, 96, 6, 39, 39),

		"ammo1" : new Sprite(this.renderer, this.img, 71, 46, 20, 20),
		"ammo2" : new Sprite(this.renderer, this.img, 105, 46, 20, 20),

		"health" : new Sprite(this.renderer, this.img, 134, 45, 20, 20),
		"armour" : new Sprite(this.renderer, this.img, 167, 46, 20, 20),

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
			var e = new Player(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["player"];

			e.hitpoints = e.maxpoints = 100;

			return e;
		}

		// pistol bullet
		if (which == "bullet1")
		{
			var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			e.sprite = this.sprites["bullet1"];

			e.bullet_damage = 10;
			return e;
		}

		// not used
		if (which == "bullet2")
		{
			var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			e.sprite = this.sprites["bullet2"];

			e.bullet_damage = 5;
			return e;
		}

		// shotgun bullet
		if (which == "bullet3")
		{
			var e = new PlayerProjectile(this.renderer, xpos, ypos, 8);
			e.sprite = this.sprites["bullet3"];

			e.bullet_damage = 15;
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

		if (which == "knife")
		{
			var e = new MeleeWeapon(this.renderer, xpos, ypos, 13, 5, 15, data);
			e.sprite = this.sprites["knife"];

			e.bullet_damage = 10;
			e.projectile_speed = 0.1;
			return e;
		}

		if (which == "sword_sprite")
		{
			var e = new MeleeWeapon(this.renderer, xpos, ypos, 27, 10, 25, data);
			e.sprite = this.sprites["sword"];

			e.bullet_damage = 25;
			e.projectile_speed = 0.4;
			return e;
		}

		if (which == "pistol_sprite")
		{
			var e = new SpriteOnly(this.renderer, xpos, ypos, 27, data);
			e.sprite = this.sprites["pistol"];
			return e;
		}

		if (which == "shotgun_sprite")
		{
			var e = new SpriteOnly(this.renderer, xpos, ypos, 27, data);
			e.sprite = this.sprites["shotgun"];
			return e;
		}

		if (which == "health")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["health"];

			e.health = 25;
			return e;
		}

		if (which == "armour")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["armour"];

			e.armour = 1;
			return e;
		}

		if (which == "bullet")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["ammo1"];

			e.ammo1 = 10;
			return e;
		}

		if (which == "shell")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["ammo2"];

			e.ammo2 = 5;
			return e;
		}

		if (which == "pistol")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["pistol"];

			e.weapon = "pistol";
			return e;
		}
		
		if (which == "shotgun")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["shotgun"];

			e.weapon = "shotgun";
			return e;
		}

		if (which == "sword")
		{
			var e = new Pickup(this.renderer, xpos, ypos, 15);
			e.sprite = this.sprites["sword"];

			e.weapon = "sword";
			return e;
		}

		//Else grab an error entity
		var e = new Entity(this.renderer, xpos, ypos, 8);
		e.FillColour = "rgba(255, 0, 0, 0.5)";
		return e;
	}

}


