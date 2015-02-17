//class declarations
var GOOGLE_PLACES = function (map,base_location){
  this.API_KEY = 'AIzaSyBF9YdzEWQUMpYLLVkRu_UXDahy2UOCDmw';
  this.map = map;
  this.map_location = base_location;

  this.service = new google.maps.places.PlacesService(this.map);

  this.singaporePlacesSearch = function(type,callback){
    this.service.nearbySearch({
      location: this.map_location,
      radius: '50000',
      types: [type],
      key: this.API_KEY
    },callback);
  }

  this.placeDetailsRequest = function(placeID,callback){
    this.service.getDetails({
      placeId: placeID
    },callback);
  }
}

var FOURSQUARE_VENUES = function(XHR, SINGAPORE_LATLON){
  this.venues_hash;
  this.XHR = XHR;
  this.SINGAPORE_LATLON = SINGAPORE_LATLON;

  this.singaporeVenuesSearch = function(place_name,callback){
    var venueID = this.venues_hash[place_name];
    XHR('/api/venues_search?id='+venueID.id,function(response){
      var res = JSON.parse(response);
      if (res.error){
        callback(true);
      } else {
        callback(false,res);
      }
    });
  }
}

var MAP_CONTROLLER = function(XHR, SINGAPORE_LATLON, PLACES_API, VENUES_API){
  this.XHR = XHR;
  this.PLACES_API = PLACES_API;
  this.VENUES_API = VENUES_API;

  this.SINGAPORE_LATLON = SINGAPORE_LATLON;
  this.map = L.map('map').setView(this.SINGAPORE_LATLON, 13);
  this.bing = new L.BingLayer("AjG85RGpnN3qcJbMNxF7BWtnkq2qc_iVKntqYodZUt7n-cBTkU6qCeU47jfxJStJ");
  //map.addLayer(bing);
  this.osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18
  }).addTo(this.map);
  this.layerControl = L.control.layers({"OpenStreetMap":this.osm, "Bing":this.bing},{},{"position":"bottomleft"}).addTo(this.map);
  this.panControl = L.control.pan().addTo(this.map);
  this.pointLayers = {};
  this.pointLayerGroup = L.layerGroup();

  this.initialize = function(){
    this.loadPlanningRegions(this.XHR,this.map,this.layerControl,this.onEachRegionPopup);
    //init MRT polyline layer
    this.loadMRTNetwork();
    //init point layers
    this.map.addLayer(this.pointLayerGroup);
    this.layerControl.addOverlay(this.pointLayerGroup,'Place points');
  }

  this.loadMRTNetwork = function(){
    var LAYER_CONTROL = this.layerControl,
    MAP = this.map;
    this.XHR('/api/data/mrt',function(response){
      var mrt_layer = L.geoJson(JSON.parse(response),{
        onEachFeature: function(feature,layer){
          var default_style = {
            color: "rgba(0,0,0,0.7)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(0,0,0,0.7)"
          }, ns_style = {
            color: "rgba(255,0,0,1)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(255,0,0,1)"
          }, ew_style = {
            color: "rgba(0,153,0,1)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(0,153,0,1)"
          }, circle_style = {
            color: "rgba(255,255,0,1)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(255,255,0,1)"
          }, ne_style = {
            color: "rgba(153,51,255,1)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(153,51,255,1)"
          }, tsl_style = {
            color: "rgba(102,51,0,1)",
            weight: 4,
            opacity: 1,
            fillOpacity: 1,
            fillColor: "rgba(102,51,0,1)"
          };
          var line_type = feature.properties.name;
          switch(line_type){
            case 'North South Line (NS)':
                layer.setStyle(ns_style);
              break;
            case 'MRT East West Line (EW)':
                layer.setStyle(ew_style);
              break;
            case 'Circle Line Extension':
            case 'Circle Line MRT':
                layer.setStyle(circle_style);
              break;
            case 'North East Line (NE)':
                layer.setStyle(ne_style);
              break;
            case 'Thomson Line (TSL)':
                layer.setStyle(tsl_style);
              break;
            default:
                layer.setStyle(default_style);
              break;
          }
          if (line_type) {
            layer.bindPopup('<h4>' + line_type + '<\/h4>')
          }
        }
      }).addTo(MAP);
      LAYER_CONTROL.addOverlay(mrt_layer,'MRT Network');
    });
  }

  this.loadVenuesPointLayer = function(input,results){
    if (this.pointLayers[input]) {return;}

    this.pointLayers[input] = {
      layer   : this.createVenuesPointLayer(input,results.response.venues),//generate layer here
      tokens  : [input]
    };
    this.pointLayerGroup.addLayer(this.pointLayers[input]['layer']);
  }

  this.loadPlacesPointLayer = function(input,token,results){
    var pointLayerPayload = this.pointLayers[input]
    if (pointLayerPayload) {
      if ($.inArray(token, pointLayerPayload.tokens) > -1){
        return;
      }else{
        pointLayerPayload.tokens.push(token);
        //add points to existing layer
        this.addToPointLayer(results,this.pointLayers[input]['layer']);
      }
    } else { //for non-existing layer. show new
      this.pointLayers[input] = {
        layer   : this.createPointLayer(results),//generate layer here
        tokens  : [token]
      };
      this.pointLayerGroup.addLayer(this.pointLayers[input]['layer']);
    }
  }

  this.createPointLayer = function(payloadGroup){
    var points = [];
    for (var i in payloadGroup) {
      points.push(this.createPlacePointMarker(payloadGroup[i]));
    }
    return L.layerGroup(points);
  }

  this.createVenuesPointLayer = function(input,payloadGroup){
    var points = [];
    for (var i in payloadGroup) {
      points.push(this.createVenuePointMarker(input,payloadGroup[i]));
    }
    return L.layerGroup(points);
  }

  this.addToPointLayer = function(payloadGroup,layergroup){
    for (var i in payloadGroup) {
      layergroup.addLayer(this.createPlacePointMarker(payloadGroup[i]));
    }
  }

  this.extractPlacePointData = function(payload){
    return {
      lat       : payload.geometry.location.k,
      lng       : payload.geometry.location.D,
      id        : payload.id,
      name      : payload.name,
      address   : payload.vicinity,
      photo     : payload.photos && payload.photos[0] ? payload.photos[0].getUrl : ''
    }
  }

  this.extractVenuePointData =function(payload){
    return {
      lat       : payload.location.lat,
      lng       : payload.location.lng,
      id        : payload.id,
      name      : payload.name,
      address   : payload.location.address,
      stats     : payload.stats
    }
  }

  this.createPlacePointMarker = function(payload){
    var info = this.extractPlacePointData(payload);
    var marker = L.marker([info.lat,info.lng],{icon: this.generatePlacePointIcon(payload.icon)});
    
    var content = '<h4>' + info.name + '<\/h4>' + '<p>Address: ' + info.address + '<br \/>';
    
    if (payload.rating) {
      content += 'Rating: ' + payload.rating + '<br \/>';
    }
    if (payload.website) {
      content += '<a href="' + payload.website + '">Official web page<\/a><br \/>';
    }
    //var photo = payload.photos[0];
    if (info.length > 0) {
      content += '<img src="' + info.photo + '" alt="' + info.name + '_photo" height="150" width="300" overflow="hidden">'
    }

    content += '<\/p>';
    marker.bindPopup(content);

    return marker;
  }

  this.createVenuePointMarker = function(input,payload){
    var info = this.extractVenuePointData(payload);
    var icon = this.VENUES_API.venues_hash[input].icon,
    iconURL = icon.prefix + 'bg_64' + icon.suffix;
    var marker = L.marker([info.lat,info.lng],{icon: this.generatePlacePointIcon(iconURL)});
    
    var content = '<h4>' + info.name + '<\/h4>' + '<p>Address: ' + info.address + '<br \/>';
    
    if (payload.rating) {
      content += 'Rating: ' + payload.rating + '<br \/>';
    }
    if (payload.website) {
      content += '<a href="' + payload.website + '">Official web page<\/a><br \/>';
    }
    if (payload.stats) {
      content += 'Check In(s): ' + payload.stats.checkinsCount + '<br \/>';
      content += 'Users: ' + payload.stats.usersCount + '<br \/>';
    }

    content += '<\/p>';
    marker.bindPopup(content);

    return marker;
  }

  this.generatePlacePointIcon = function(iconUrl){
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [30, 30],
      iconAnchor: [0, 0]
      //popupAnchor: [-3, -76]
    });
  }

  this.onEachRegionPopup = function(feature, layer) {
    var defaultStyle = {
      color: "#2262CC",
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.1,
      fillColor: "#2262CC"
    }, highlightStyle = {
      color: '#2262CC', 
      weight: 3,
      opacity: 0.6,
      fillOpacity: 0.65,
      fillColor: '#2262CC'
    };
    layer.setStyle(defaultStyle);
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.DGPZ_NAME) {
      (function(layer, properties) {
        var content = '<h4>' + feature.properties.DGPZ_NAME + '<\/h4>' +
        '<p>Road Name: ' + layer.feature.properties.DGPSZ_NAME + '<br \/>' + '<\/p>';
        layer.bindPopup(content);
        // Create a mouseover event
        layer.on("mouseover", function (e) {
          // Change the style to the highlighted version
          layer.setStyle(highlightStyle);
        });
        // Create a mouseout event that undoes the mouseover changes
        layer.on("mouseout", function (e) {
          // Start by reverting the style back
          layer.setStyle(defaultStyle); 
        });
        // Close the "anonymous" wrapper function, and call it while passing
        // in the variables necessary to make the events work the way we want.
      })(layer, feature.properties);
    }
  }

  this.loadPlanningRegions = function(XHR,map,layerControl,onEachRegionPopup){
    XHR('/api/data/planning_regions',function(response){
      var planning_geojson = JSON.parse(response);
      var planning_geo_layer = L.geoJson(planning_geojson,{
        onEachFeature: onEachRegionPopup
      });
      layerControl.addOverlay(planning_geo_layer,'Planning Chloropeth');
      var layers = planning_geo_layer.getLayers();
    });
  }
}

//UI interactions

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
$('#map').height(window.innerHeight);
$('#search_places_container').width(542);
$('#search_places_container').css('left',window.innerWidth/2 - 540/2);
$('#search_venues_container').width(542);
$('#search_venues_container').css('left',window.innerWidth/2 - 540/2);

$('#search_amenities').width(500);
$('#search_foursquare').width(500);

function cancelEvents(){
    if ($('#search_places_container').css('visibility') == 'visible'){
        $('#search_places_container').css('visibility','hidden');
    }
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
    searchVenuesContainer = $('#search_venues_container');
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode && String.fromCharCode(charCode) == "`") {
        $("#wrapper").toggleClass("toggled");
    }

    if (charCode && String.fromCharCode(charCode) == "1") {
      hideVenuesSearch(searchVenuesContainer);
      if (searchPlacesContainer.css('visibility') == 'hidden') {
        showPlacesSearch(searchPlacesContainer);
      }else{
        hidePlacesSearch(searchPlacesContainer);
      }
      setTimeout(function(){$('#search_amenities').val("");},100);
    }

    if (charCode && String.fromCharCode(charCode) == "2") {
      hidePlacesSearch(searchPlacesContainer);
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
venues_search_taskbar_icon = document.getElementById('taskbar_venues_search');
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

//helper functions
var XHR = function(url,callback){
  var xhr;
  if (window.XMLHttpRequest)
    xhr=new XMLHttpRequest();
  else
    xhr=new ActiveXObject("Microsoft.XMLHTTP");
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4 && xhr.status==200){
     callback(xhr.responseText);
    }
  }
  xhr.open("GET",url,true);
  xhr.send();
}

//mapping functions
var SINGAPORE_LATLON = [1.3520830,103.819836];
var fake_google_map_location = new google.maps.LatLng(SINGAPORE_LATLON[0],SINGAPORE_LATLON[1]);
fake_google_map = new google.maps.Map(document.getElementById('fake_map'),{
    center: fake_google_map_location,
    zoom: 15
});

var PLACES_API = new GOOGLE_PLACES(fake_google_map,fake_google_map_location);
var VENUES_API = new FOURSQUARE_VENUES(XHR,SINGAPORE_LATLON);
var MAP = new MAP_CONTROLLER(XHR,SINGAPORE_LATLON,PLACES_API,VENUES_API);
MAP.initialize();

var place_categories,
venues_categories,
venues_hash;

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
          MAP.loadVenuesPointLayer(input,response);
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

autosuggestPlacesSearch();
autosuggestVenuesSearch();