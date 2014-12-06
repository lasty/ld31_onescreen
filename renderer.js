
var renderer;

var canvas;


function Renderer(width, height, canvasid)
{
	this.canvas = document.getElementById(canvasid);
	if (!canvas.canvas.getContext)
	{
		alert ("Requires a browser that supports HTML5 Canvas");
		throw "Canvas fail";
	}

	this.context = canvas.getContext("2d");
	if (!this.context)
	{
		alert ("Error getting canvas 2d context");
		throw "Context fail";
	}


	this.width = canvas.width = width;
	this.height = canvas.height = height;

	this.GetContext = function () {
		return this.context;
	};

	// Sets smooth or pixelated image rendering.  Should work for all browsers.
	this.setSmooth = function(val)
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

	
	// Draws line segment
	this.Line = function(x1, y1, x2, y2) {
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
	}

	// Draws line segment
	this.Circle = function(x, y, r) {
		this.context.beginPath();
		this.context.arc(x, y, r, 0, Math.PI * 2, false);
		this.context.stroke();
	}


};

