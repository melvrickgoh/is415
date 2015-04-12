//UI interactions
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
$('#map').height(window.innerHeight);
$('#search_text_container').width(542);
$('#search_text_container').css('left',window.innerWidth/2 - 540/2);
$('#search_places_container').width(542);
$('#search_places_container').css('left',window.innerWidth/2 - 540/2);
$('#search_venues_container').width(542);
$('#search_venues_container').css('left',window.innerWidth/2 - 540/2);

$('#search_amenities').width(500);
$('#search_foursquare').width(500);
$('#search_text').width(500);

function cancelEvents(){
    if ($('#search_places_container').css('visibility') == 'visible'){
        $('#search_places_container').css('visibility','hidden');
    }
}

function showTextSearch(searchContainer){
  $('#taskbar_text_search_icon').css('color','rgba(250,70,0,1)');
  searchContainer.css('visibility','visible');
  $('#search_text').focus();
}

function hideTextSearch(searchContainer){
  $('#taskbar_text_search_icon').css('color','rgba(250,70,0,0.7)');
  searchContainer.css('visibility','hidden');
  $('#search_text_enter_arrow').css('visibility','hidden');
}

function showPlacesSearch(searchContainer){
  $('#taskbar_search_icon').css('color','rgba(250,70,0,1)');
  searchContainer.css('visibility','visible');
  $('#search_amenities').focus();
}

function hidePlacesSearch(searchContainer){
  $('#taskbar_search_icon').css('color','rgba(250,70,0,0.7)');
  searchContainer.css('visibility','hidden');
}

function showVenuesSearch(searchContainer){
  $('#taskbar_venues_icon').css('color','rgba(255,0,132,1)');
  searchContainer.css('visibility','visible');
  $('#search_foursquare').focus();
}

function hideVenuesSearch(searchContainer){
  $('#taskbar_venues_icon').css('color','rgba(0,114,177,1)');
  searchContainer.css('visibility','hidden');
}

function toggleEvents(e){
    e = e || window.event;
    var searchPlacesContainer = $('#search_places_container'),
    searchVenuesContainer = $('#search_venues_container'),
    textSearchContainer = $('#search_text_container');
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode && String.fromCharCode(charCode) == "`") {
        $("#wrapper").toggleClass("toggled");
    }

    if (charCode && String.fromCharCode(charCode) == "1") {
      hideVenuesSearch(searchVenuesContainer);
      hidePlacesSearch(searchPlacesContainer);
      if (textSearchContainer.css('visibility') == 'hidden') {
        showTextSearch(textSearchContainer);
      }else{
        hideTextSearch(textSearchContainer);
      }
      setTimeout(function(){$('#search_text').val("");},100);
    }

    if (charCode && String.fromCharCode(charCode) == "2") {
      hideVenuesSearch(searchVenuesContainer);
      hideTextSearch(textSearchContainer);
      if (searchPlacesContainer.css('visibility') == 'hidden') {
        showPlacesSearch(searchPlacesContainer);
      }else{
        hidePlacesSearch(searchPlacesContainer);
      }
      setTimeout(function(){$('#search_amenities').val("");},100);
    }

    if (charCode && String.fromCharCode(charCode) == "3") {
      hidePlacesSearch(searchPlacesContainer);
      hideTextSearch(textSearchContainer);
      if (searchVenuesContainer.css('visibility') == 'hidden') {
        showVenuesSearch(searchVenuesContainer);
      }else{
        hideVenuesSearch(searchVenuesContainer);
      }
      setTimeout(function(){$('#search_foursquare').val("");},100);
    }
}
document.onkeypress=toggleEvents

var places_search_taskbar_icon = document.getElementById('taskbar_places_search'),
venues_search_taskbar_icon = document.getElementById('taskbar_venues_search'),
text_search_taskbar_icon = document.getElementById('taskbar_text_search');
places_search_taskbar_icon.onclick = function(){
  var searchContainer = $('#search_places_container');
  if (searchContainer.css('visibility') == 'hidden') {
    showPlacesSearch(searchContainer);
  }else{
    hidePlacesSearch(searchContainer);
  }
}
venues_search_taskbar_icon.onclick = function(){
  var searchContainer = $('#search_venues_container');
  if (searchContainer.css('visibility') == 'hidden') {
    showPlacesSearch(searchContainer);
  }else{
    hidePlacesSearch(searchContainer);
  }
}
text_search_taskbar_icon.onclick = function(){
  var searchContainer = $('#search_text_container');
  if (searchContainer.css('visibility') == 'hidden') {
    showPlacesSearch(searchContainer);
  }else{
    hidePlacesSearch(searchContainer);
  }
}

var place_categories,
venues_categories,
venues_hash;

var submitTextSearchParameters = function(){
  //hide text search bar
  hideTextSearch($('#search_text_container'));

  var input = $('#search_text').val(),
  masterIconURL, masterIconColor,
  googleDone = false,
  foursquareDone = false,
  checkTextSearchComplete = function(){
    if (googleDone && foursquareDone) {
      OVERLAY.show('Aggregating and combining results');
      DATA_COMBINE.cleanData(input);
      MAP.loadCombinedPoints(input,masterIconURL,masterIconColor);
      var postSavingAction = function(){
        //KDE ACTION HERE
      }
      SPREADSHEETS_UI.setTitlesWithResults(input,Object.keys(LUNR.aggregated_store).length);
      SPREADSHEETS_UI.setSearchDoneActionFlow(function(){
        //yes to saving data
        console.log('user decides to save data');
      },postSavingAction);

      SPREADSHEETS_UI.setSaveActionTrigger(function(){
        SPREADSHEETS.API.storeDataToDrive();
      });
      SPREADSHEETS_UI.setCancelActionTrigger(postSavingAction);

      OVERLAY.hide();

      SPREADSHEETS_UI.showSearchDoneDialog();
      hideTextLoader();
    }
  };

  OVERLAY.show('Searching Google and Foursquare for ' + input);

  if (MAP.POINT_CONTROLLER.HASH[input]){
    alert('The search layer ' + input + ' already exists!');
  }else{
    showTextLoader(); //show loading spinner for results
    PLACES_API.singaporeTextSearch(input,function(results,status,pagination){
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        var iconInfo = MAP.aggregatedTextSearchPoints('google',input,pagination.D,results);
        masterIconURL = iconInfo['url']; masterIconColor = iconInfo['color'];
        if (pagination.hasNextPage){
          pagination.nextPage();
        }else{
          googleDone = true;
        }

      }

      if (status == "ZERO_RESULTS") {
        alert('No results found');
        googleDone = true;
      }
      checkTextSearchComplete();
    });

    VENUES_API.singaporeVenuesTextSearch(input,function(err,response){
      if (err) {
        alert('Unable to load layer. Please try again later.');
      }else{
        var iconInfo = MAP.aggregatedTextSearchPoints('foursquare',input,undefined,response,masterIconURL);
        masterIconURL = iconInfo['url']; masterIconColor = iconInfo['color'];
        //MAP.loadVenuesProportionalLayer(input,response,groupColor);
        MAP.loadVenuesChoroplethLayer(input,response,COLORS.randomColor());
      }
      foursquareDone = true;
      checkTextSearchComplete();
    });
  }
}

var submitSearchParameters = function(){
  var input = $('#search_amenities').val(),
  masterIconURL, masterIconColor,
  googleDone = false,
  foursquareDone = false,
  checkTextSearchComplete = function(){
    if (googleDone && foursquareDone) {
      OVERLAY.show('Aggregating and combining results');
      DATA_COMBINE.cleanData(input);
      MAP.loadCombinedPoints(input,masterIconURL,masterIconColor);
      var postSavingAction = function(){
        //KDE ACTION HERE
      }
      SPREADSHEETS_UI.setTitlesWithResults(input,Object.keys(LUNR.aggregated_store).length);
      SPREADSHEETS_UI.setSearchDoneActionFlow(function(){
        //yes to saving data
        console.log('user decides to save data');
      },postSavingAction);

      SPREADSHEETS_UI.setSaveActionTrigger(function(){
        SPREADSHEETS.API.storeDataToDrive();
      });
      SPREADSHEETS_UI.setCancelActionTrigger(postSavingAction);

      OVERLAY.hide();

      SPREADSHEETS_UI.showSearchDoneDialog();
      hideTextLoader();
    }
  };

  OVERLAY.show('Searching Google and Foursquare for ' + input);

  if (MAP.POINT_CONTROLLER.HASH[input]){
    alert('The search layer ' + input + ' already exists!');
  }else{
    showTextLoader(); //show loading spinner for results
    PLACES_API.singaporeTextSearch(input,function(results,status,pagination){
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        var iconInfo = MAP.aggregatedTextSearchPoints('google',input,pagination.D,results);
        masterIconURL = iconInfo['url']; masterIconColor = iconInfo['color'];
        if (pagination.hasNextPage){
          pagination.nextPage();
        }else{
          googleDone = true;
        }

      }

      if (status == "ZERO_RESULTS") {
        alert('No results found');
        googleDone = true;
      }
      checkTextSearchComplete();
    });

    VENUES_API.singaporeVenuesTextSearch(input,function(err,response){
      if (err) {
        alert('Unable to load layer. Please try again later.');
      }else{
        var iconInfo = MAP.aggregatedTextSearchPoints('foursquare',input,undefined,response,masterIconURL);
        masterIconURL = iconInfo['url']; masterIconColor = iconInfo['color'];
        //MAP.loadVenuesProportionalLayer(input,response,groupColor);
        MAP.loadVenuesChoroplethLayer(input,response,COLORS.randomColor());
      }
      foursquareDone = true;
      checkTextSearchComplete();
    });
  }
}

/* old search parameters for google
var submitSearchParameters = function(){
  var input = $('#search_amenities').val();
  var showSearchErrorMessage = function(){

  };

  if ($.inArray(input, place_categories) > -1){
      showLoader(); //show loading spinner for results
      PLACES_API.singaporePlacesSearch(input,function(results,status,pagination){
        if (status == google.maps.places.PlacesServiceStatus.OK) {

          MAP.loadPlacesPointLayer(input,pagination.D,results);
          if (pagination.hasNextPage){
            pagination.nextPage();
          }else{
            hideLoader(); // finally done loading
          }

        }
      });
  }
}
*/
var submitVenuesSearchParameters = function(){
  var input = $('#search_foursquare').val();
  var showSearchErrorMessage = function(){

  };

  if ($.inArray(input, venues_categories) > -1){
    showVenuesLoader(); //show loading spinner for results
    VENUES_API.singaporeVenuesSearch(input,function(err,response){
      if (err) {
        alert('Unable to load layer. Please try again later.');
      }else{
        var groupColor = MAP.loadVenuesPointLayer(input,response);
        MAP.loadVenuesProportionalLayer(input,response,groupColor);
        MAP.loadVenuesChoroplethLayer(input,response,groupColor);
      }
      hideVenuesLoader();
    });
  }
}

//search functions

var search_places_arrow = document.getElementById('search_enter_arrow');
search_places_arrow.onmouseover = function(e){
    search_places_arrow.style.color = 'rgba(64,153,255, 0.8)';
}
search_places_arrow.onmouseout = function(e){
    search_places_arrow.style.color = 'rgba(0,0,0,0.8)';
}
search_places_arrow.onclick = function(e){
    submitSearchParameters();
}

var search_venues_arrow = document.getElementById('search_venues_enter_arrow');
search_venues_arrow.onmouseover = function(e){
  search_venues_arrow.style.color = 'rgba(64,153,255, 0.8)';
}
search_venues_arrow.onmouseout = function(e){
  search_venues_arrow.style.color = 'rgba(0,0,0,0.8)';
}
search_venues_arrow.onclick = function(e){
  submitVenuesSearchParameters();
}

var search_text_arrow = document.getElementById('search_text_enter_arrow');
search_text_arrow.onmouseover = function(e){
  search_text_arrow.style.color = 'rgba(64,153,255, 0.8)';
}
search_text_arrow.onmouseout = function(e){
  search_text_arrow.style.color = 'rgba(0,0,0,0.8)';
}
search_text_arrow.onclick = function(e){
  submitTextSearchParameters();
}

var search_places_loading = document.getElementById('search_enter_loading');
var showLoader = function(){
    search_places_arrow.style.visibility = 'hidden';
    search_places_loading.style.visibility = 'visible';
}, hideLoader = function(){
    search_places_loading.style.visibility = 'hidden';
    search_places_arrow.style.visibility = 'visible';
}

var search_venues_loading = document.getElementById('search_venues_enter_loading');
var showVenuesLoader = function(){
    search_venues_arrow.style.visibility = 'hidden';
    search_venues_loading.style.visibility = 'visible';
}, hideVenuesLoader = function(){
    search_venues_loading.style.visibility = 'hidden';
    search_venues_arrow.style.visibility = 'visible';
}

var search_text_loading = document.getElementById('search_text_enter_loading');
var showTextLoader = function(){
    search_text_arrow.style.visibility = 'hidden';
    search_text_loading.style.visibility = 'visible';
}, hideTextLoader = function(){
    search_text_loading.style.visibility = 'hidden';
    search_text_arrow.style.visibility = 'visible';
}

var main_categories = function(callback) {
  var xmlhttp = new XMLHttpRequest();
  var url = "../data/categories.json";

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = JSON.parse(xmlhttp.responseText);
      callback(data);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}
/* original
var autosuggestPlacesSearch = function(){
  XHR('/autosuggest/places',function(response){
    place_categories = JSON.parse(response);
    var states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(place_categories, function(state) { return { value: state }; })
    });
     
    // kicks off the loading/processing of `local` and `prefetch`
    states.initialize();
     
    $('#search_amenities').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'states',
      displayKey: 'value',
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: states.ttAdapter(),
      templates: {
        empty: [
          '<div class="empty-message">',
          'No such category found',
          '</div>'
        ].join('\n')
      }
    });
  });
}
*/

var autosuggestPlacesSearch = function(){
     
  main_categories(function(data) {
    //console.log("place categories : " + JSON.stringify(data));
    var categories = [];
    for (var category in data) {
      categories.push(category);
    }
    console.log("place categories : " + JSON.stringify(categories));
    
    var states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(categories, function(state) { return { value: state }; })
    });
     
    // kicks off the loading/processing of `local` and `prefetch`
    states.initialize();
     
    $('#search_amenities').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'states',
      displayKey: 'value',
      source: states.ttAdapter(),
      templates: {
        empty: [
          '<div class="empty-message">',
          'No such category found',
          '</div>'
        ].join('\n')
      }
    });
  }); 
}


var autosuggestVenuesSearch = function(){
  XHR('/api/foursquare/custom_categories',function(response){
    var venues_results = JSON.parse(response);
    venues_categories = venues_results.array,
    venues_hash = venues_results.hash;

    VENUES_API.venues_hash = venues_hash;

    var states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(venues_categories, function(state) { return { value: state }; })
    });
     
    // kicks off the loading/processing of `local` and `prefetch`
    states.initialize();
     
    $('#search_foursquare').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'states',
      displayKey: 'value',
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: states.ttAdapter(),
      templates: {
        empty: [
          '<div class="empty-message">',
          'No such category found',
          '</div>'
        ].join('\n')
      }
    });
  });
}

var search_places_input = document.getElementById('search_amenities');
search_places_input.onkeypress = function(e){
    if (e.keyCode == 49) {
        e.preventDefault();
    }
    if (e.keyCode == 13) {
        submitSearchParameters();
    }
}

var search_venues_input = document.getElementById('search_foursquare');
search_venues_input.onkeypress = function(e){
    if (e.keyCode == 49) {
        e.preventDefault();
    }
    if (e.keyCode == 13) {
        submitVenuesSearchParameters();
    }
}

var search_text_input = document.getElementById('search_text');
search_text_input.onkeypress = function(e){
    if (e.keyCode == 49) {
        e.preventDefault();
    }
    if (e.keyCode == 13) {
        submitTextSearchParameters();
    }
}

autosuggestPlacesSearch();
autosuggestVenuesSearch();