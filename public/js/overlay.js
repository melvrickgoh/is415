function Overlay(){
	this.overlay = $('#loading');
	this.message = $('#loading > .loading-message').html('Spinning up the hamster...');

	this.messages = [
		"Spinning up the hamster...",
		"Shovelling coal into the server...",
		"While the little elves draw your map...",
		"The server is powered by a lemon and two electrodes...",
		"It's still faster than you could draw it...",
		"the bits are breeding...",
		"we love you just the way you are...",
		"we're testing your patience...",
		"I should have had a Milo this morning...",
		"Please wait. You're not on Google anymore..."
	];

	this.messageInterval;
}

Overlay.prototype.randomMessage = function(){
	OVERLAY.message.html(OVERLAY.messages[Math.floor(Math.random()*OVERLAY.messages.length)]);
}

Overlay.prototype.rollingMessage = function(){
	return setInterval(function(){
		OVERLAY.randomMessage();
	},4500);
}

Overlay.prototype.show = function(){
	OVERLAY.overlay.removeClass('hide');
	OVERLAY.messageInterval = OVERLAY.rollingMessage();
}

Overlay.prototype.hide = function(){
	clearInterval(OVERLAY.messageInterval);
	OVERLAY.overlay.addClass('hide');
}

var OVERLAY = new Overlay();