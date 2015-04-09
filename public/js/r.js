function SpatiaR(){
	var local = 'http://127.0.0.1:5358/',
	remote = 'https://spatia.shinyapps.io/spatiaR/';

	function _rserve(){
		if (window.location.hostname == 'localhost') {
			return local;
		} else {
			return remote;
		}
	}

	this.spatiaRJSON = function(data){
		console.log(DATA_COMBINE.SPATIA_R_HASH);
		var keys = Object.keys(DATA_COMBINE.SPATIA_R_HASH);
		XHRP('/api/r/test',JSON.stringify({data:DATA_COMBINE.SPATIA_R_HASH[keys[0]]}),function(response){
			var jresp = JSON.parse(response);
			console.log(jresp);
		});
	}
}

var SPATIA_R = new SpatiaR();

function SpatiaRConsole(){
	var rDialog = $('#rDialog'),
	rDialogEnter = $('#r-dialog-enter'),
	rDialogCancel = $('#r-dialog-cancel');

	rDialogEnter.click(triggerKDECall);
	rDialogCancel.click(function(){R_CONSOLE.hideRDialog();});

	function triggerKDECall(){
		//SPATIA_R.spatiaRJSON();
	}

	this.showRDialog = function(){
		rDialog.addClass('show');
		rDialog.removeClass('hide');
	}

	this.hideRDialog = function(){
		rDialog.addClass('hide');
		rDialog.removeClass('show');
	}
}

var R_CONSOLE = new SpatiaRConsole();
R_CONSOLE.showRDialog();