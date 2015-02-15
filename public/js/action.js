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

var MAP_CONTROLLER = function(XHR, SINGAPORE_LATLON, PLACES_API){
  this.XHR = XHR;
  this.PLACES_API = PLACES_API;

  this.SINGAPORE_LATLON = SINGAPORE_LATLON;
  this.map = L.map('map').setView(this.SINGAPORE_LATLON, 13);
  this.bing = new L.BingLayer("AjG85RGpnN3qcJbMNxF7BWtnkq2qc_iVKntqYodZUt7n-cBTkU6qCeU47jfxJStJ").addTo(this.map);
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
    //init point layers
    this.map.addLayer(this.pointLayerGroup);
    this.layerControl.addOverlay(this.pointLayerGroup,'Place points');
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

  this.generatePlacePointIcon = function(iconUrl){
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [20, 20],
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
      }).addTo(map);
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
$('#search_amenities').width(500);

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

function toggleEvents(e){
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode && String.fromCharCode(charCode) == "`") {
        $("#wrapper").toggleClass("toggled");
    }

    if (charCode && String.fromCharCode(charCode) == "1") {
        var searchContainer = $('#search_places_container');
        if (searchContainer.css('visibility') == 'hidden') {
          showPlacesSearch(searchContainer);
        }else{
          hidePlacesSearch(searchContainer);
        }
        setTimeout(function(){$('#search_amenities').val("");},100);
    }
}
document.onkeypress=toggleEvents

var places_search_taskbar_icon = document.getElementById('taskbar_search');
places_search_taskbar_icon.onclick = function(){
  var searchContainer = $('#search_places_container');
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
var MAP = new MAP_CONTROLLER(XHR,SINGAPORE_LATLON,PLACES_API);
MAP.initialize();

var place_categories;

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

var search_places_loading = document.getElementById('search_enter_loading');
var showLoader = function(){
    search_places_arrow.style.visibility = 'hidden';
    search_places_loading.style.visibility = 'visible';
}, hideLoader = function(){
    search_places_loading.style.visibility = 'hidden';
    search_places_arrow.style.visibility = 'visible';
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

var search_places_input = document.getElementById('search_amenities');
search_places_input.onkeypress = function(e){
    if (e.keyCode == 49) {
        e.preventDefault();
    }
    if (e.keyCode == 13) {
        submitSearchParameters();
    }
}

autosuggestPlacesSearch();