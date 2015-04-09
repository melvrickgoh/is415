function Spreadsheets () {
	var dialog_worksheets_refresh = $('#dialogSpreadsheetsRefresh'),
	dialog_worksheets_refresh_msg = $('#dialogSpreadsheetsRefreshMsg');
	
	this.dialog_worksheets_refresh = dialog_worksheets_refresh;
	this.dialog_worksheets_refresh_msg = dialog_worksheets_refresh_msg;

	this.name = name || 'monkey';

  this.overlay = $('#spreadsheets-overlay');
  this.overlay_toggle = $('#spreadsheets-overlay > .icon-bar');
  this.files_nil_message = $('#spreadsheets-overlay > .container-fluid > .nil-message');
  this.spreadsheets_container = $('#spreadsheets-overlay > .container-fluid > .sheets'); 
  this.spreadsheet_control = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-control');

  this.spreadsheets_refresh_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-control > .spreadsheets-refresh');

  this.active_container = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-sheet')
  this.active_spreadsheet = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-sheet > iframe');
  
  this.active_layer_refresh_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-refresh');
  this.active_layer_load_data_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-load-data');
  this.active_layer_unload_data_button = $('#spreadsheets-overlay > .container-fluid > .sheets > .sheet-content > .active-taskbar > .btn-unload-data');
  this.active_layer_name;
  //initialize values
  this.overlay_toggle.click(this.toggleOverlay); //toggling of sheets sidebar
  this.spreadsheets_refresh_button.click(this.API.refreshDrive); //refreshing of user drive info
  this.active_layer_refresh_button.click(this.API.refreshLayer);//refresh front end loading of user data
  this.active_layer_load_data_button.click(this.API.loadLayer);//load layer on the front end

  //refresh workbooks at dialog level
  function _refreshWorkbooks(){
    dialog_worksheets_refresh.addClass('fa-spin');
    dialog_worksheets_refresh.addClass('blue-twitter');

    dialog_worksheets_refresh_msg.removeClass('hide');
    dialog_worksheets_refresh_msg.addClass('show');

    SPREADSHEETS.API.refreshDrive();
  }
  dialog_worksheets_refresh.click(_refreshWorkbooks);

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

Spreadsheets.prototype.emptySheetControls = function(){
	$('div').remove('.row.sheet-control');
}

Spreadsheets.prototype.generateNewSheetControls = function(spreadsheets){
	var last_control;
	SPREADSHEETS_UI.loadWorkbooks(spreadsheets);
	for (var i in spreadsheets) {
		var sheet = spreadsheets[i];
		last_control = this.generateNewSheetControl(sheet.id,sheet.title,sheet.alternateLink);
	}
	if (last_control) { last_control.trigger("click"); }
}

Spreadsheets.prototype.generateNewSheetControl = function(sheetId,sheetTitle,sheetLink){
	return $('<div></div>')
		.addClass("row")
		.addClass("sheet-control")
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
	SPREADSHEETS.active_layer_refresh_button.attr("fileId",sheetId).click(SPREADSHEETS.refreshLayer);
	SPREADSHEETS.active_layer_unload_data_button.attr("fileId",sheetId);
	SPREADSHEETS.active_layer_load_data_button.attr("fileId",sheetId).click(SPREADSHEETS.loadLayer);
}

Spreadsheets.prototype.resizeSpreadsheetsUI = function(){
	SPREADSHEETS.overlay.css("max-width",$(window).width() - 225);
	SPREADSHEETS.active_container.height($(window).height() - 50);
}

Spreadsheets.prototype.refreshLayer = function(){
	var fileid = SPREADSHEETS.active_layer_refresh_button.attr('fileid');
	SPREADSHEETS.API.getSheet(fileid,function(spreadsheet){
		var processed_layers = SPREADSHEETS._postProcessSheetData(spreadsheet);
		//reload layers render

		MAP.reset();
		for (var i = 0; i<processed_layers.length; i++) {
			var layer = processed_layers[i];
			MAP.loadSpreadsheetCombinedPoints(layer.title,layer.iconURL,layer.data,'rgba(255,255,255,0.5)');
		}
	});
}

Spreadsheets.prototype._postProcessSheetData = function(spreadsheet){
	var layers = [],
	worksheets = spreadsheet['worksheets'],
	worksheetKeys = Object.keys(worksheets);

	for (var i = 0; i<worksheetKeys.length; i++) {
		var key = worksheetKeys[i];
		var worksheet = worksheets[key];
		var cells = worksheet['cells'],
		payload = {
			id: worksheet['id'],
			title: worksheet['title'],
			iconURL: '',
			data: {}
		};

		for (var j = 0; j<cells.length; j++ ) {
			var cell = cells[j];
			var cellAttrs = Object.keys(cell),
			cellID,
			pointData = {};
			for (var k =0; k<cellAttrs.length; k++ ) {
				var attr = cellAttrs[k];
				switch(attr){
					case 'rating':
					case 'lat':
					case 'lng':
					case 'tipsCount':
					case 'checkinsCount':
					case 'usersCount':
						pointData[attr] = parseFloat(cell[attr]);
						break;
					default:
						pointData[attr] = cell[attr];
				}

				if (attr == 'icon' && cell[attr] && cell[attr].length > 1) {
					payload.iconURL = cell[attr];
				}
				if (attr == 'id'){
					cellID = cell[attr];
				}
			}
			payload.data[cellID] = pointData;
		}

		layers.push(payload);
		DATA_COMBINE.SPATIA_R_HASH[payload.title] = payload;
	}
	return layers;
}

Spreadsheets.prototype.loadLayer = function(){
	//action to load layers data here

}

/*IMPORTANT: For classing API methods of sheets in */
Spreadsheets.prototype.API = {};

Spreadsheets.prototype.API.refreshDrive = function(){
	SPREADSHEETS.spreadsheets_refresh_button.addClass('fa-spin');
	_SheetXHR('/api/user/refresh_drive_profile',function(user){
		SPREADSHEETS.emptySheetControls();
		SPREADSHEETS.generateNewSheetControls(user.data_spreadsheets);
		//done refreshing and rendering information
		SPREADSHEETS.spreadsheets_refresh_button.removeClass('fa-spin');
		SPREADSHEETS.dialog_worksheets_refresh.removeClass('fa-spin');
		SPREADSHEETS.dialog_worksheets_refresh.removeClass('blue-twitter');
		SPREADSHEETS.dialog_worksheets_refresh_msg.addClass('hide');
		SPREADSHEETS.dialog_worksheets_refresh_msg.removeClass('show');
	});
}

Spreadsheets.prototype.API.getSheet = function(sheetId,callback) {
	OVERLAY.show();
	_SheetXHR('/api/spreadsheet/load?id='+sheetId,function(results){
		if (results.error) { alert('Error trying to retrieve spreadsheet data. Please try again'); }
		else {callback(results);}
		OVERLAY.hide();
	});
}

Spreadsheets.prototype.API.storeDataToDrive = function(){
	OVERLAY.show('Saving your data to your Google Spreadsheet now');
	var sheetValues = SPREADSHEETS_UI.worksheetFormValues();
	var payload = {
		sheet: sheetValues['worksheet'],
		workbook: sheetValues['workbook'],
		data: LUNR.aggregated_store
	};
	XHRP('/api/spreadsheet/save',JSON.stringify(payload),function(response){
		var res = JSON.parse(response);
		if (res.error) { //package has error
			SPREADSHEETS_UI.showErrorMessage(res.message);
		} else { //package returns with the data now stored on the spreadsheet
			OVERLAY.hide();
		}
		SPREADSHEETS_UI.hideLayerLoadDialog();
	});

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