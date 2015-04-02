function SpreadsheetsUI(){
  var self = this,
  dialog = $('#searchLayerLoad'),
  dialog_title = $('#searchLayerLoad > div > div > .modal-header > .modal-title'),
  dialog_error_message = $('#searchLayerWarningMessage'),
  dialog_workbook_selector = $('#searchLayerWorkbookName'),
  dialog_worksheet_input = $('#searchLayerSheetName'),

  search_done_dialog = $('#searchDoneDialog'),
  search_done_dialog_title = $('#searchDoneDialog > div > div > .modal-header > .modal-title'),
  search_done_dialog_no = $('#searchDoneDialog > div > .modal-content > .modal-footer > .nosaveBtn'),
  search_done_dialog_yes = $('#searchDoneDialog > div > .modal-content > .modal-footer > .saveBtn'),

  search_store_btn = $('#saveToDriveBtn'),
  search_store_cancel_btn = $('#cancelSaveToDriveBtn');

  //set dialog titles with results no
  this.setTitlesWithResults = function (input,noResults){
    dialog_title.html('Saving your Search Data - ' + input + ' (' + noResults + ' results)');
    search_done_dialog_title.html('Search Complete! - ' + input + ' (' + noResults + ' results found)');
  }

  //search done dialog
  this.showSearchDoneDialog = function(){
    search_done_dialog.removeClass('hide');
    search_done_dialog.addClass('show');
  }
  this.hideSearchDoneDialog = function(){
    search_done_dialog.removeClass('show');
    search_done_dialog.addClass('hide');
  }

  //search done set action flow
  this.setSearchDoneActionFlow = function(yesAction,noAction){
    search_done_dialog_yes.click(function(){
      search_done_dialog.addClass('hide');
      search_done_dialog.removeClass('show');
      self.showLayerLoadDialog();
      //yesAction();
    });
    search_done_dialog_no.click(function(){
      search_done_dialog.addClass('hide');
      search_done_dialog.removeClass('show');
      noAction();
    });
  }

  //search save to drive button
  this.setSaveActionTrigger =function(callback){
    search_store_btn.click(callback);
  }
  this.setCancelActionTrigger = function(callback){
    search_store_cancel_btn.click(function(){
      self.hideLayerLoadDialog();
      callback();
    });
  }
  search_store_cancel_btn.click(function(){
    self.hideLayerLoadDialog();
  });

  //spreadsheet form dialog
  this.showLayerLoadDialog = function(){
    dialog.removeClass('hide');
    dialog.addClass('show');
  }
  this.hideLayerLoadDialog = function(){
    dialog.removeClass('show');
    dialog.addClass('hide');
  }

  //error message
  this.showErrorMessage = function(message){
    dialog_error_message.html(message);
    _errorMessageShow();
    this.showLayerLoadDialog();
  }

  this.hideErrorMessage = function(){
    _errorMessageHide();
  }

  function _errorMessageShow(){
    dialog_error_message.removeClass('hide');
    dialog_error_message.addClass('show');
  }
  function _errorMessageHide(){
    dialog_error_message.addClass('hide');
    dialog_error_message.removeClass('show');
  }

  //workbook selectors
  this.loadWorkbooks = function(workbooks){
    _emptyWorkbookDropdown();
    dialog_worksheet_input.value = ""
    _loadWorkbookData(workbooks);
  }
  function _emptyWorkbookDropdown(){
    dialog_workbook_selector.empty();
  }
  function _loadWorkbookData(workbooks){
    var createWorkbookOption = function(payload){
      $('<option></option>')
        .html(payload.title)
        .attr('value',payload.id)
        .appendTo(dialog_workbook_selector);
    }
    for (var w in workbooks) {
      createWorkbookOption(workbooks[w]);
    }
  }

  //data results acquisition
  this.worksheetFormValues = function(){
    return _pullValues();
  }
  function _pullValues(){
    return { 
      worksheet: dialog_worksheet_input[0].value,
      workbook: dialog_workbook_selector[0].value
    }
  }
}

var SPREADSHEETS_UI = new SpreadsheetsUI();