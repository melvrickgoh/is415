function Spreadsheets () {
	this.name = name || 'monkey';

  this.overlay = $('#spreadsheets-overlay');
  this.overlay_toggle = $('#spreadsheets-overlay > .icon-bar');
  this.files_nil_message = $('#spreadsheets-overlay > .container-fluid > .nil-message');
  this.spreadsheets_container = $('#spreadsheets-overlay > .container-fluid > .sheets'); 
  this.spreadsheet_control = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-control');

  this.active_container = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-sheet')
  this.active_spreadsheet = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-sheet > iframe');
  
  this.active_layer_refresh_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-refresh');
  this.active_layer_load_data_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-load-data');
  this.active_layer_unload_data_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-unload-data');
  this.active_layer_name;
  //initialize values
  this.overlay_toggle.click(this.toggleOverlay);
}

Spreadsheets.prototype.toggleOverlay = function(e){
	var overlay = SPREADSHEETS.overlay;
	if (overlay.hasClass("closed")) {
		overlay.removeClass("closed");
		overlay.css("max-width",$(window).width() - 225);
		SPREADSHEETS.overlay_toggle.addClass("selected");
		SPREADSHEETS.showNilMessage();
		SPREADSHEETS.showSheetsContainer();
	} else {
		overlay.addClass("closed");
		overlay.css("max-width",0);
		SPREADSHEETS.overlay_toggle.removeClass("selected");
		SPREADSHEETS.hideNilMessage();
		SPREADSHEETS.hideSheetsContainer();
	}
}
//Hide no matter what. Problem of overlay insufficient space
Spreadsheets.prototype.hideNilMessage = function(){
	if (!SPREADSHEETS.files_nil_message.hasClass("hide")){
		SPREADSHEETS.files_nil_message.addClass("hide");
	}
}
//Show only if class noFiles exists
Spreadsheets.prototype.showNilMessage = function(){
	if (SPREADSHEETS.files_nil_message.hasClass("noFiles") && !SPREADSHEETS.overlay.hasClass("closed")) {
		SPREADSHEETS.files_nil_message.removeClass("hide");
	}
}
//Show sheets if class hasFiles exists
Spreadsheets.prototype.showSheetsContainer = function(){
	if (SPREADSHEETS.spreadsheets_container.hasClass('hasFiles') && !SPREADSHEETS.overlay.hasClass("closed")){
		SPREADSHEETS.spreadsheets_container.removeClass("hide");
	}
}
//Hide sheets no matter what
Spreadsheets.prototype.hideSheetsContainer = function(){
	if (!SPREADSHEETS.spreadsheets_container.hasClass("hide")){
		SPREADSHEETS.spreadsheets_container.addClass("hide");
	}
}
//Notify Nil Files
Spreadsheets.prototype.userHasNilFiles = function(){
	if (!SPREADSHEETS.files_nil_message.hasClass("noFiles")) {
		SPREADSHEETS.files_nil_message.addClass("noFiles");
	}
	if (SPREADSHEETS.spreadsheets_container.hasClass("hasFiles")){
		SPREADSHEETS.spreadsheets_container.removeClass("hasFiles");
	}
	SPREADSHEETS.hideSheetsContainer();
	SPREADSHEETS.showNilMessage();
}
//Unsub Nil Files
Spreadsheets.prototype.userNoMoreNilFiles = function(){
	if (!SPREADSHEETS.spreadsheets_container.hasClass("hasFiles")){
		SPREADSHEETS.spreadsheets_container.addClass("hasFiles");
	}
	if (SPREADSHEETS.files_nil_message.hasClass("noFiles")){
		SPREADSHEETS.files_nil_message.removeClass("noFiles");
	}
	SPREADSHEETS.hideNilMessage();
	SPREADSHEETS.showSheetsContainer();
}

Spreadsheets.prototype.initialize = function(){
	_SheetXHR('/api/user/spreadsheets_meta',function(spreadsheets){
		if (!spreadsheets || spreadsheets.length == 0) {
			SPREADSHEETS.userHasNilFiles();
		}else{
			SPREADSHEETS.userNoMoreNilFiles();
			SPREADSHEETS.initializeSheetContainer(spreadsheets);
		}
	});
}

Spreadsheets.prototype.initializeSheetContainer = function(spreadsheets){
	//Set active content region
	SPREADSHEETS.active_container.height(window.innerHeight - 50);

	SPREADSHEETS.generateNewSheetControls(spreadsheets);

}

Spreadsheets.prototype.generateNewSheetControls = function(spreadsheets){
	var last_control;
	for (var i in spreadsheets) {
		var sheet = spreadsheets[i];
		last_control = this.generateNewSheetControl(sheet.id,sheet.title,sheet.alternateLink);
	}
	if (last_control) { last_control.trigger("click"); }
}

Spreadsheets.prototype.generateNewSheetControl = function(sheetId,sheetTitle,sheetLink){
	return $('<div></div>')
		.addClass("row")
		.attr("sheetId",sheetId)
		.attr("sheetLink",sheetLink)
		.click(function(e){
			$('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-control > div.selected').removeClass('selected');
			$(e.target).addClass('selected');
			SPREADSHEETS.activateSpreadsheet(sheetId,sheetLink);
		})
		.html(sheetTitle)
		.appendTo(SPREADSHEETS.spreadsheet_control);
}

Spreadsheets.prototype.activateSpreadsheet = function(sheetId,sheetLink) {
	SPREADSHEETS.active_spreadsheet.attr("src",sheetLink);
	SPREADSHEETS.active_layer_refresh_button.attr("fileId",sheetId);
	SPREADSHEETS.active_layer_unload_data_button.attr("fileId",sheetId);
	SPREADSHEETS.active_layer_load_data_button.attr("fileId",sheetId);
}

Spreadsheets.prototype.resizeSpreadsheetsUI = function(){
	SPREADSHEETS.overlay.css("max-width",$(window).width() - 225);
	SPREADSHEETS.active_container.height($(window).height() - 50);
}

Spreadsheets.prototype.refreshLayer = function(){
	
}

function _SheetXHR(url,callback){
  var xhr;
  if (window.XMLHttpRequest)
    xhr=new XMLHttpRequest();
  else
    xhr=new ActiveXObject("Microsoft.XMLHTTP");
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4 && xhr.status==200){
     callback(JSON.parse(xhr.responseText));
    }
  }
  xhr.open("GET",url,true);
  xhr.send();
}

var SPREADSHEETS = new Spreadsheets();
//initialize data governing point information
setTimeout(SPREADSHEETS.initialize,2500);

window.onresize = SPREADSHEETS.resizeSpreadsheetsUI;