

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


	this.hud_timer = 0;
	this.next_level_timer = 0;


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

		this.SpawnRound(1);


		this.player = this.entityfactory.MakeEntity("player", 500, 500);
		this.player.SetupPhysics(this.boxworld);
		this.player.AddForceRandom(2);
	}

	
	this.GotoNextLevel = function()
	{
		this.GotoLevel(this.wave+1);
	}

	this.GotoLevel = function(n)
	{
		this.SpawnRound(n);
	}

	this.ClearBoard = function()
	{
		for (var i in this.entities)
		{
			var e = this.entities[i];
			e.Delete();
		}

		this.entities = Array();

		//Clear spawn list, if any
		this.spawnlist = Array();
	}

	this.SpawnRound = function(i)
	{
		this.wave = i;

		this.ClearBoard();

		var thisround = wave_data[i];  //See wave_data.js for details
		console.log(thisround);

		var monsters = thisround.monsters;
		var items = thisround.items;
		var loot = thisround.loot;
		var intro = thisround.intro || "";
		var hint = thisround.hint || "";

		var monstercount_text = [];

		this.monsters_left = 0;

		if (monsters) for(var monster in monsters)
		{
			var n = monsters[monster];
	
			monstercount_text.push(n + " x " + monster);

			// console.log(monster);
			//console.log(n);

			this.monsters_left += n;

			for(var i=0; i<n; i++)
			{
				var e = this.AddEntity(monster, Math.random() * 400 + 200, Math.random() * 100 + 100);
				e.AddForceRandom(2);
			}
		}

		if (loot) for(var item in loot)
		{
			//TODO spawn inside monsters
			var n = loot[item];
	
			//console.log(item);
			//console.log(n);

			for(var i=0; i<n; i++)
			{
				var e = this.AddEntity(item, Math.random() * 400 + 200, Math.random() * 300 + 100);
				e.AddForceRandom(2);
			}
		}

		if (items) for(var item in items)
		{
			var n = items[item];
	
			console.log(item);
			console.log(n);

			for(var i=0; i<n; i++)
			{
				var e = this.AddEntity(item, Math.random() * 400 + 200, Math.random() * 300 + 100);
				e.AddForceRandom(2);
			}
		}

		//setup HUD strings

		monstercount_text = monstercount_text.join("<br/>");
		console.log(monstercount_text);

		this.SetWaveTitle("Wave " + this.wave, intro, hint, monstercount_text)
	}

	this.SetWaveTitle = function(wave, intro, hint, counts)
	{

		var wave_title = document.getElementById("wave_title");
		var wave_intro = document.getElementById("wave_intro");
		var hint_text = document.getElementById("hint_text");

		wave_title.innerHTML = wave;

		wave_intro.innerHTML = intro;
		hint_text.innerHTML = hint;

		var monster_counts = document.getElementById("monster_counts");
		monster_counts.innerHTML = counts;

		this.hud_timer = 5;
		this.next_level_timer = 2;
	}

	this.TestRemoveHud = function(dt)
	{
		//console.log(this.hud_timer);
		this.hud_timer -= dt;

		var hud = document.getElementById("hud")

		if (this.hud_timer < 0)
		{
			hud.style.display = "none";
		}
		else
		{
			hud.style.display = "";
		}
	}

	this.TestGotoNextLevel = function(dt)
	{
		if (this.monsters_left <= 0)
		{
			this.next_level_timer -= dt;
			if (this.next_level_timer < 0)
			{
				this.GotoNextLevel();
			}
		}
	}

	this.TestPlayerDied = function()
	{
		var player = this.GetPlayer();

		if (!player.Alive)
		{
			this.SetWaveTitle("You Died.",  "Press Reload or Restart to try again", "", "");
		}

	}

	this.SetHudText = function()
	{
		var wave = document.getElementById("wave");
		var monsters_left = document.getElementById("monsters_left");

		var player = this.GetPlayer();

		var has_knife = document.getElementById("has_knife");  //Always has knife
		var has_sword = document.getElementById("has_sword");
		var has_pistol = document.getElementById("has_pistol");
		var has_shotgun = document.getElementById("has_shotgun");

		var health = document.getElementById("health");
		var armour = document.getElementById("armour");

		var pistol_ammo = document.getElementById("pistol_ammo");
		var shotgun_ammo = document.getElementById("shotgun_ammo");

		wave.value = this.wave;
		monsters_left.value = this.monsters_left;

		has_knife.checked = true;
		has_sword.checked = player.has_sword;
		has_pistol.checked = player.has_pistol;
		has_shotgun.checked = player.has_shotgun;

		health.value = player.hitpoints;
		armour.value = player.armour;

		pistol_ammo.value = player.pistol_ammo;
		shotgun_ammo.value = player.shotgun_ammo;
	}

	this.GetPlayer = function() { return this.player; }

	this.Update = function(dt)
	{
		//Create any pending entities from the spawn list
		this.CreateFromSpawnList();


		this.boxworld.Step(1/60, 10, 10);
		this.boxworld.ClearForces();

		//console.log("Update("+dt+") - num entities: " + this.entities.length);

		this.monsters_left = 0;

		for(var i=0; i<this.entities.length;)
		{
			var e = this.entities[i];

			if (e instanceof Monster) { this.monsters_left++; }

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


		this.SetHudText();
		this.TestRemoveHud(dt);
		this.TestGotoNextLevel(dt);

		this.TestPlayerDied();
	}

	this.Render = function()
	{
		//Render tilemap
		//this.renderer.SetSmooth(false);
		this.renderer.SetAlpha(1.0);

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


	this.AddEntity = function(name, x, y, data)
	{
		var ent = this.entityfactory.MakeEntity(name, x, y, data);
		ent.SetupPhysics(this.boxworld);

		this.entities.push(ent);

		return ent;
	}


	this.CreateProjectile = function(num, bulletname, gunname, pos, aimto) {
		var projectile_speed = 10.0;  //TODO set in entity

		var direction = b2.Vec2.Subtract(aimto, pos);
		direction.Normalize();
		var angle = VectorToAngle(direction);

		var offset_pos = b2.Vec2.Multiply(18, direction);

		var ent;
		for (var i=0; i<num; i++)
		{
			ent = this.entityfactory.MakeEntity(bulletname, pos.x+offset_pos.x, pos.y+offset_pos.y);
			ent.SetupPhysics(this.boxworld);

			ent.body.SetBullet(true);

			ent.AddForce(direction.x * projectile_speed, direction.y * projectile_speed);

			this.entities.push(ent);
		}

		var effect = this.entityfactory.MakeEntity(gunname, pos.x+offset_pos.x/2, pos.y+offset_pos.y/2, angle);
		this.entities.push(effect);


		return ent;
	}


	this.CreateMelee = function(name, pos, aimto) {

		var direction = b2.Vec2.Subtract(aimto, pos);
		direction.Normalize();
		var offset_pos = b2.Vec2.Multiply(5, direction);

		var angle = VectorToAngle(direction);

		//angle -= 45;

		var ent = this.entityfactory.MakeEntity(name, pos.x+offset_pos.x, pos.y+offset_pos.y, angle);
		ent.SetupPhysics(this.boxworld);

		ent.body.SetBullet(true);

		var projectile_speed = ent.projectile_speed;
		ent.AddForce(direction.x * projectile_speed, direction.y * projectile_speed);

		//ent.AddAngularForce(ent.sword_swing_speed);//direction.x * projectile_speed, direction.y * projectile_speed);

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
			var data = e[3];

			var ent = this.AddEntity(name, pos.x, pos.y, data);
			ent.AddForce(toWorld(vel.x), toWorld(vel.y));
		}

		this.spawnlist = Array();

		if (this.spawnlist.length)
		{
			debugger;
		}
	}

	this.SpawnEntity = function(what, pos, vel, data) {
		this.spawnlist.push([what, pos, vel, data]);
	}

	this.SpawnEffect = function(what, pos, vel, data) {
		if (what == "bullet_hit")
		{
			for (var i=0; i<0; i++)
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

		if (what == "monster_die")
		{
			for (var i=0; i<10; i++)
			{
				this.SpawnEntity("particle", pos, vel);
			}
		}

		if (what == "damage_text")
		{
			this.SpawnEntity("damage_text", pos, vel, data);
		}

		if (what == "pickup_text")
		{
			this.SpawnEntity("pickup_text", pos, vel, data);
		}
	}


}


