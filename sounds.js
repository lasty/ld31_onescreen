
function SoundManager() {


	this.soundlist = { };

	this.Explosion = function() {
		this.PlaySound("Explosion1");
	}

	this.Shoot = function() {
		this.PlaySound("Shoot1");
	}

	this.Hit = function() {
		this.PlaySound("Hit1");
	}

	this.Pickup = function() {
		this.PlaySound("PickupCoin1");
	}

	this.Powerup = function() {
		this.PlaySound("Powerup1");
	}
	
	this.PlaySound = function(sndfile)
	{
		//Get the array of sound objects, or create empty
		var arr = this.soundlist[sndfile];
		if (!arr) { arr = this.soundlist[sndfile] = []; }

		//Loop through, finding first available one
		for (var i=0; i<arr.length; i++)
		{
			var snd = arr[i];
			if (snd.ended)
			{
				snd.play();
				return;
			}
		}

		//Otherwise create a new one, push on the back
		var audio = new Audio("Sounds/"+sndfile+".wav");
		arr.push(audio);

		audio.play();
	}
}


