
var renderer;

var canvas;


function Renderer(width, height, canvas)
{
	this.canvas = canvas;
	if (!this.canvas.getContext)
	{
		alert ("Requires a browser that supports HTML5 Canvas");
		throw "Canvas fail";
	}

	this.context = this.canvas.getContext("2d");
	if (!this.context)
	{
		alert ("Error getting canvas 2d context");
		throw "Context fail";
	}


	this.width = this.canvas.width = width;
	this.height = this.canvas.height = height;

	this.GetContext = function () {
		return this.context;
	};

	// Sets smooth or pixelated image rendering.  Should work for all browsers.
	this.SetSmooth = function(val)
	{
		if (this.context.imageSmoothingEnabled != undefined)
		{
			//Hooray, you win the internet
			this.context.imageSmoothingEnabled = val;
		}
		else
		{
			//Boo, I hate prefix tags
			this.context.mozImageSmoothingEnabled = val;
			this.context.webkitImageSmoothingEnabled = val;
			this.context.msImageSmoothingEnabled = val;
		}
	}


	this.SetFill = function(fillstyle) {
		this.context.fillStyle = fillstyle;
	};

	this.SetStroke = function(strokestyle) {
		this.context.strokeStyle = strokestyle;
	};

	// Fills canvas with current fill colour
	this.Fill = function() {
		this.context.fillRect(0, 0, this.width, this.height);
	};

	// Clears canvas to transparent
	this.Clear = function() {
		this.context.clearRect(0, 0, this.width, this.height);
	};

	this.SetAlpha = function(a) {
		this.context.globalAlpha = a;
	}
	
	// Draws line segment
	this.Line = function(x1, y1, x2, y2) {
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
	}

	// Draws circle
	this.Circle = function(x, y, r) {
		this.context.beginPath();
		this.context.arc(x, y, r, 0, Math.PI * 2, false);
		this.context.stroke();
	}

	this.CircleFill = function(x, y, r) {
		this.context.beginPath();
		this.context.arc(x, y, r, 0, Math.PI * 2, false);
		this.context.fill();
	}


	this.DrawTile = function(img, srcx, srcy, srcw, srch, x, y, w, h) {
		this.context.drawImage(img, srcx, srcy, srcw, srch, x, y, w, h);
	}

	this.DrawSprite = function(img, srcx, srcy, srcw, srch, x, y, zoom, rot) {
		this.context.save();
		this.context.translate(x, y);
		this.context.rotate(rot*Math.PI/180);
		this.context.drawImage(img, srcx, srcy, srcw, srch, -1*zoom, -1*zoom, 2*zoom, 2*zoom);
		this.context.restore();
		
	}
};



