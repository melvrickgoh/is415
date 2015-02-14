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

function toggleEvents(e){
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode && String.fromCharCode(charCode) == "`") {
        $("#wrapper").toggleClass("toggled");
    }

    if (charCode && String.fromCharCode(charCode) == "1") {
        var searchContainer = $('#search_places_container');
        if (searchContainer.css('visibility') == 'hidden') {
            searchContainer.css('visibility','visible');
            $('#search_amenities').focus();
        }else{
            searchContainer.css('visibility','hidden');
        }
        setTimeout(function(){$('#search_amenities').val("");},100);
    }
}
document.onkeypress=toggleEvents

var map = L.map('map').setView([1.365118, 103.818630], 13);
var bing = new L.BingLayer("AjG85RGpnN3qcJbMNxF7BWtnkq2qc_iVKntqYodZUt7n-cBTkU6qCeU47jfxJStJ");
map.addLayer(bing);
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);
var layerControl = L.control.layers({"OpenStreetMap":osm, "Bing":bing},{},{"position":"bottomleft"}).addTo(map);
var panControl = L.control.pan().addTo(map);

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

var loadPlanningRegions = function(map){
    var highlightStyle = {
        color: '#2262CC', 
        weight: 3,
        opacity: 0.6,
        fillOpacity: 0.65,
        fillColor: '#2262CC'
    }, defaultStyle = {
        color: "#2262CC",
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.1,
        fillColor: "#2262CC"
    };

    function onEachRegionPopup(feature, layer) {
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

    XHR('/api/data/planning_regions',function(response){
        var planning_geojson = JSON.parse(response);
        var planning_geo_layer = L.geoJson(planning_geojson,{
            onEachFeature: onEachRegionPopup
        }).addTo(map);
        var layers = planning_geo_layer.getLayers();
    });
}

loadPlanningRegions(map);

var place_categories;

var submitSearchParameters = function(){
    var input = $('#search_amenities').val();
    var showSearchErrorMessage = function(){
        
    };

    if ($.inArray(input, place_categories) > -1){
        showLoader();

        XHR('/api/places_search?place='+input,function(response){
            hideLoader();
            var places = JSON.parse(response);
        });
    }
}

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