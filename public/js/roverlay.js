function RControls () {
  this.resultsActive = false;
  this.triggerActive = true;

  this.overlay = $('#r-overlay');
  this.overlay_toggle = $('#r-overlay > .icon-bar');

  this.resultsContainer = $('#ranalysis');
  this.resultsFrame = $('#ranalysisFrame');
  this.resultsButton = $('#r-contour-layer');
  this.resultsReAnalyze = $('#r-contour-redo');
  this.resultsActivePayload = {};
  this.resultsButtonSelectors = $('#contourBucketBtns');

  this.triggerContainer = $('#ranalysisTrigger');
  this.triggerDialogBtn = $('#r-trigger-dialog-btn');
  
  //initialize values
  this.overlay_toggle.click(this.toggleOverlay); //toggling of r overlay sidebar
  this.triggerDialogBtn.click(this.initializeAnalysisProcess);

  this.resultsButton.click(this.loadContourGEOJSON);
  this.resultsReAnalyze.click(this.reinitializeAnalysis);
}

RControls.prototype.reinitializeAnalysis = function(){
	//reset views
	R_OVERLAY.showTrigger();
	R_OVERLAY.hideResults();
	//reset load buttons control
	R_OVERLAY.resultsReAnalyze.addClass('hide');
	R_OVERLAY.resultsReAnalyze.removeClass('show');
	R_OVERLAY.resultsButton.addClass('show');
	R_OVERLAY.resultsButton.removeClass('hide');
	R_OVERLAY.hideContourButtons();
	//resetting view control
	R_OVERLAY.resultsActive = false;
	R_OVERLAY.triggerActive = true;
}

RControls.prototype.showContourButtons = function(){
	R_OVERLAY.resultsButtonSelectors.addClass('show');
	R_OVERLAY.resultsButtonSelectors.removeClass('hide');
}

RControls.prototype.hideContourButtons = function(){
	R_OVERLAY.resultsButtonSelectors.addClass('hide');
	R_OVERLAY.resultsButtonSelectors.removeClass('show');
}

RControls.prototype.loadContourGEOJSON = function(){
	CONTOUR.initializeKDESeries( R_OVERLAY.resultsActivePayload.userid , R_OVERLAY.resultsActivePayload.uuid );
	R_OVERLAY.loadContourBucketsButtons();
	R_OVERLAY.showContourButtons();
	R_OVERLAY.resultsButton.addClass('hide');
	R_OVERLAY.resultsButton.removeClass('show');
	R_OVERLAY.resultsReAnalyze.addClass('show');
	R_OVERLAY.resultsReAnalyze.removeClass('hide');
}

RControls.prototype.loadContourBucketsButtons = function(){
	R_OVERLAY.resultsButtonSelectors.empty();
	R_OVERLAY.appendButton(50);
	R_OVERLAY.appendButton(100);
	R_OVERLAY.appendButton(200);
	R_OVERLAY.appendButton(300);
	R_OVERLAY.appendButton(400);
}

RControls.prototype.appendButton = function(number){
	$('<button></button>')
		.attr('class','btn-group br0 bc0 blue-twitter-background white m0 width50px height30 fontOpenSans')
		.attr('role','group')
		.attr('value',number)
		.html(number+'m')
		.click(function(){
			CONTOUR.showContourPlot(R_OVERLAY.resultsActivePayload.userid, R_OVERLAY.resultsActivePayload.uuid, number);
		})
		.appendTo(R_OVERLAY.resultsButtonSelectors);
}

RControls.prototype.initializeKDEAnalysisProcess = function(dbPayload){
	if (dbPayload.userid && dbPayload.uuid){
		R_OVERLAY.resultsActivePayload = { userid: dbPayload.userid, uuid: dbPayload.uuid };
		this.hideTrigger();
		this.sendKDETriggerToR(dbPayload.userid,dbPayload.uuid);
		this.showResults();
		setTimeout(function(){
			CONTOUR.initializeKDESeries(dbPayload.userid,dbPayload.uuid);
		},10000);
		this.resultsActive = true;
		this.triggerActive = false;
		OVERLAY.hide();
	}else{
		alert('An error occurred with sending the data to DB for analysis');
	}
}

RControls.prototype.sendKDETriggerToR = function(userid,uuid){
	var generateRLink = function(userid,uuid){
		return "http://127.0.0.1:5358/?action=kde&uuid="+uuid+"&user="+userid;
	}
	R_OVERLAY.resultsFrame.attr('src',generateRLink(userid,uuid));
}

RControls.prototype.initializeAnalysisProcess = function(){
	if (Object.keys(DATA_COMBINE.SPATIA_R_HASH).length > 0){
		R_CONSOLE.loadRLayers();
		R_CONSOLE.showRDialog();
	}else{
		alert('You have no data loaded. Please load your spreadsheet data and try again');
	}
}

RControls.prototype.toggleOverlay = function(e){
	var overlay = R_OVERLAY.overlay;
	if (overlay.hasClass("closed")) {
		overlay.removeClass("closed");
		overlay.css("max-width",450);
		if (R_OVERLAY.resultsActive){ R_OVERLAY.showResults(); }
		if (R_OVERLAY.triggerActive){ R_OVERLAY.showTrigger(); }
		R_OVERLAY.overlay_toggle.addClass("selected");
	} else {
		overlay.addClass("closed");
		overlay.css("max-width",0);
		R_OVERLAY.hideTrigger();
		R_OVERLAY.hideResults();
		R_OVERLAY.overlay_toggle.removeClass("selected");
	}
}

RControls.prototype.showTrigger = function(e){
	R_OVERLAY.triggerContainer.addClass("show");
	R_OVERLAY.triggerContainer.removeClass("hide");
}

RControls.prototype.hideTrigger = function(e){
	R_OVERLAY.triggerContainer.addClass("hide");
	R_OVERLAY.triggerContainer.removeClass("show");
}

RControls.prototype.showResults = function(e){
	R_OVERLAY.resultsContainer.addClass("show");
	R_OVERLAY.resultsContainer.removeClass("hide");
}

RControls.prototype.hideResults = function(e){
	R_OVERLAY.resultsContainer.addClass("hide");
	R_OVERLAY.resultsContainer.removeClass("show");
}

RControls.prototype.resizeUI = function(){
	R_OVERLAY.overlay.css("max-width",450);
}

var R_OVERLAY = new RControls();

window.onresize = R_OVERLAY.resizeUI;