function RControls () {
  this.overlay = $('#r-overlay');
  this.overlay_toggle = $('#r-overlay > .icon-bar');
  
  //initialize values
  this.overlay_toggle.click(this.toggleOverlay); //toggling of r overlay sidebar

}

RControls.prototype.toggleOverlay = function(e){
	var overlay = R_OVERLAY.overlay;
	if (overlay.hasClass("closed")) {
		overlay.removeClass("closed");
		overlay.css("max-width",$(window).width() - 225);
		R_OVERLAY.overlay_toggle.addClass("selected");
	} else {
		overlay.addClass("closed");
		overlay.css("max-width",0);
		R_OVERLAY.overlay_toggle.removeClass("selected");
	}
}

RControls.prototype.resizeUI = function(){
	R_OVERLAY.overlay.css("max-width",600);
}

var R_OVERLAY = new RControls();

window.onresize = R_OVERLAY.resizeUI;