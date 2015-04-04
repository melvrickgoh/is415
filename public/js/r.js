function SpatiaR(){
	var local = 'http://127.0.0.1:7790/',
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
	rTestButton = $('#r-trigger');

	rTestButton.click(_testSpatiaRFunction);

	function _testSpatiaRFunction(){
		SPATIA_R.spatiaRJSON();
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
//R_CONSOLE.showRDialog();