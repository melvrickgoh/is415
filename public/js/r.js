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

	this.triggerKDEDBLoad = function(){
		OVERLAY.show();
		var layertitle = R_CONSOLE.rAnalysisFormValues();
		XHRP('/api/r/test',JSON.stringify({data:DATA_COMBINE.SPATIA_R_HASH[layertitle]}),function(response){
			var dbPayload = JSON.parse(response);
			R_CONSOLE.hideRDialog();
			R_OVERLAY.initializeKDEAnalysisProcess(dbPayload);
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

	var rLayersAnalysisSelector = $('#analyzeLayerR');

	function triggerKDECall(){
		SPATIA_R.triggerKDEDBLoad();
	}

	this.showRDialog = function(){
		rDialog.addClass('show');
		rDialog.removeClass('hide');
	}

	this.hideRDialog = function(){
		rDialog.addClass('hide');
		rDialog.removeClass('show');
	}

	function _emptyRLayersDropdown(){
    rLayersAnalysisSelector.empty();
  }

	//workbook selectors
  this.loadRLayers = function(){
    _emptyRLayersDropdown();
    _loadRLayersAnalyzeSelection();
  }
  
  function _loadRLayersAnalyzeSelection(){
  	var r_hash = DATA_COMBINE.SPATIA_R_HASH,
  	rLinks = Object.keys(r_hash);

    var createAnalysisOption = function(payload){
      $('<option></option>')
        .html(payload.title)
        .attr('value',payload.title)
        .appendTo(rLayersAnalysisSelector);
    }

    for (var r in rLinks) {
      createAnalysisOption(DATA_COMBINE.SPATIA_R_HASH[rLinks[r]]);
    }
  }

  //data results acquisition
  this.rAnalysisFormValues = function(){
    return rLayersAnalysisSelector[0].value;
  }
}

var R_CONSOLE = new SpatiaRConsole();
