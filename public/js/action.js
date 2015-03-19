//class declarations
var COLOR_PALETTE = function() {
  var colors = [
    'rgba(0, 172, 237, 1)',
    'rgba(59, 89, 152, 1)',
    'rgba(221, 75, 57, 1)',
    'rgba(203, 32, 39, 1)',
    'rgba(0, 123, 182, 1)',
    'rgba(187, 0, 0, 1)',
    'rgba(170, 212, 80, 1)',
    'rgba(50, 80, 109, 1)',
    'rgba(81, 127, 164, 1)',
    'rgba(255, 0, 132, 1)',
    'rgba(234, 76, 137, 1)',
    'rgba(168, 36, 0, 1)',
    'rgba(0, 114, 177, 1)',
    'rgba(91, 154, 104, 1)',
    'rgba(69, 102, 142, 1)',
    'rgba(33, 117, 155, 1)',
    'rgba(235, 72, 35, 1)',
    'rgba(123, 0, 153, 1)',
    'rgba(251, 143, 61, 1)',
    'rgba(255, 58, 0, 1)'
  ]

  this.randomColor = function(){
    return colors[Math.floor(Math.random() * (colors.length))];
  }
}

var GOOGLE_PLACES = function (XHR,map,base_location){
  this.XHR = XHR;
  this.API_KEY = 'AIzaSyBF9YdzEWQUMpYLLVkRu_UXDahy2UOCDmw';
  this.map = map;
  this.map_location = base_location;

  this.service = new google.maps.places.PlacesService(this.map);

  this.singaporePlacesSearch = function(type,callback){
    this.service.nearbySearch({
      location: this.map_location,
      radius: '25000',
      types: [type],
      key: this.API_KEY
    },callback);
  }

  this.placeDetailsRequest = function(placeID,callback){
    this.service.getDetails({
      placeId: placeID,
      key: this.API_KEY
    },callback);
  }

  this.singaporeTextSearch = function(content,callback){
    this.service.textSearch({
      query: content,
      bounds: new google.maps.LatLngBounds(new google.maps.LatLng(1.241805,103.613931),new google.maps.LatLng(1.463530,104.023172))
    },callback);
  }
}

var FOURSQUARE_VENUES = function(XHR, SINGAPORE_LATLON){
  this.venues_hash;
  this.XHR = XHR;
  this.SINGAPORE_LATLON = SINGAPORE_LATLON;

  this.singaporeVenuesSearch = function(place_name,callback){
    var venueID = this.venues_hash[place_name];
    XHR('/api/foursquare/venues_search?id='+venueID.id,function(response){
      var res = JSON.parse(response);
      if (res.error){
        callback(true);
      } else {
        callback(false,res);
      }
    });
  }

  this.singaporeVenuesTextSearch = function(query_term,callback){
    XHR('/api/foursquare/text_search?search='+query_term,function(response){
      var res = JSON.parse(response);
      if (res.error){
        callback(true);
      } else {
        callback(false,res);
      }
    });
  }
}

var SIDEBAR_CONTROLLER = function(MAP_CONTROLLER){
  MAP = MAP_CONTROLLER;

  OSM_LINK = $('#base_control_osm');
  OSM_LINK_ICON = $('#base_control_icon_osm');

  BING_LINK = $('#base_control_bing');
  BING_LINK_ICON = $('#base_control_icon_bing');

  GOOGLE_LINK = $('#base_control_google');
  GOOGLE_LINK_ICON = $('#base_control_icon_google');

  this.initialize = function(){
    OSM_LINK.click(toggleOSMBase);
    BING_LINK.click(toggleBingBase);
    GOOGLE_LINK.click(toggleGoogleBase);
    //pre-loaded data
    this.addPolylineSubLink('mrt_network','MRT Network',false,'fa-train');
  }

  function toggleGoogleBase() {
    if (GOOGLE_LINK_ICON.hasClass('base_control_google_icon_selected')) {   //switch off OSM
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');
      MAP.hideGoogleBasemap();
    } else {        //switch on OSM
      GOOGLE_LINK_ICON.addClass('base_control_google_icon_selected');
      GOOGLE_LINK.addClass('selected');

      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');

      MAP.hideBingBasemap();
      MAP.hideOSMBasemap();
      MAP.showGoogleBasemap();
    }
  }

  function toggleOSMBase(){
    if (OSM_LINK_ICON.hasClass('base_control_osm_icon_selected')) {   //switch off OSM
      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');
      MAP.hideOSMBasemap();
    } else {        //switch on OSM
      OSM_LINK_ICON.addClass('base_control_osm_icon_selected');
      OSM_LINK.addClass('selected');

      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');

      MAP.hideGoogleBasemap();
      MAP.hideBingBasemap();
      MAP.showOSMBasemap();
    }
  }

  function toggleBingBase(){
    if (BING_LINK_ICON.hasClass('base_control_bing_icon_selected')) {
      BING_LINK_ICON.removeClass('base_control_bing_icon_selected');
      BING_LINK_ICON.addClass('base_control_bing_icon');
      BING_LINK.removeClass('selected');
      MAP.hideBingBasemap();
    } else { //switch on bing
      BING_LINK_ICON.addClass('base_control_bing_icon_selected');
      BING_LINK_ICON.removeClass('base_control_bing_icon');
      BING_LINK.addClass('selected');

      OSM_LINK_ICON.removeClass('base_control_osm_icon_selected');
      OSM_LINK.removeClass('selected');
      GOOGLE_LINK_ICON.removeClass('base_control_google_icon_selected');
      GOOGLE_LINK.removeClass('selected');

      MAP.hideGoogleBasemap();
      MAP.hideOSMBasemap();
      MAP.showBingBasemap();
    }
  }

  POLYLINE_MASTER_LINK = $('#super_link_polyline');
  POLYLINE_MASTER_LINK.click(toggleSuperPolyline);

  POLYLINE_GROUP = $('#polyline_layer_group');
  POLYLINE_LINKS = {};

  POINTLAYER_MASTER_LINK = $('#super_link_point');
  POINTLAYER_MASTER_LINK.click(toggleSuperPointGroup);

  POINTLAYER_GROUP = $('#point_layer_group');
  POINTLAYER_LINKS = {};

  PROPORTIONAL_MASTER_LINK = $('#super_link_proportional');
  PROPORTIONAL_MASTER_LINK.click(toggleSuperProportionalGroup);

  PROPORTIONAL_GROUP = $('#proportional_layer_group');
  PROPORTIONAL_LINKS = {};

  CHOROPLETH_MASTER_LINK = $('#super_link_choropleth');
  CHOROPLETH_MASTER_LINK.click(toggleSuperChoroplethGroup);

  CHOROPLETH_GROUP = $('#choropleth_layer_group');
  CHOROPLETH_LINKS = {};

  function deactivateSublinks(links,className){
    var keys = Object.keys(links);
    for (var i in keys) {
      links[keys[i]]["link"].removeClass(className);
    }
  }

  function reinstateSublinks(links,className){
    var keys = Object.keys(links);
    for (var i in keys) {
      if (links[keys[i]]["active"]) {
        links[keys[i]]["link"].addClass(className);
      }
    }
  }

  function toggleSuperChoroplethGroup(){
    if (CHOROPLETH_MASTER_LINK.hasClass('choroplethlayer_selected')) {
      MAP.CHLOROPETH_CONTROLLER.hideAll();
      deactivateSublinks(CHOROPLETH_LINKS,'choroplethlayer_selected');
      CHOROPLETH_MASTER_LINK.removeClass('choroplethlayer_selected');
      $('#region_legend').css('visibility','hidden');
    } else {
      MAP.CHLOROPETH_CONTROLLER.showAll();
      reinstateSublinks(CHOROPLETH_LINKS,'choroplethlayer_selected');
      CHOROPLETH_MASTER_LINK.addClass('choroplethlayer_selected');
      $('#region_legend').css('visibility','visible');
    }
  }

  function toggleSuperPolyline(){
    if (POLYLINE_MASTER_LINK.hasClass('polyline_selected')) {
      MAP.POLYLINE_CONTROLLER.hideAll();
      deactivateSublinks(POLYLINE_LINKS,'polyline_selected');
      POLYLINE_MASTER_LINK.removeClass('polyline_selected');
    } else {
      MAP.POLYLINE_CONTROLLER.showAll();
      reinstateSublinks(POLYLINE_LINKS,'polyline_selected');
      POLYLINE_MASTER_LINK.addClass('polyline_selected');
    }
  }

  function toggleSuperPointGroup(){
    if (POINTLAYER_MASTER_LINK.hasClass('pointlayer_selected')) {
      MAP.POINT_CONTROLLER.hideAll();
      deactivateSublinks(POINTLAYER_LINKS,'pointlayer_selected');
      POINTLAYER_MASTER_LINK.removeClass('pointlayer_selected');
    } else {
      MAP.POINT_CONTROLLER.showAll();
      reinstateSublinks(POINTLAYER_LINKS,'pointlayer_selected');
      POINTLAYER_MASTER_LINK.addClass('pointlayer_selected');
    }
  }

  function toggleSuperProportionalGroup(){
    if (PROPORTIONAL_MASTER_LINK.hasClass('proportionallayer_selected')) {
      MAP.PROPORTIONAL_CONTROLLER.hideAll();
      deactivateSublinks(PROPORTIONAL_LINKS,'proportionallayer_selected');
      PROPORTIONAL_MASTER_LINK.removeClass('proportionallayer_selected');
      $('#legend').css('visibility','hidden');
    } else {
      MAP.PROPORTIONAL_CONTROLLER.showAll();
      reinstateSublinks(PROPORTIONAL_LINKS,'proportionallayer_selected');
      PROPORTIONAL_MASTER_LINK.addClass('proportionallayer_selected');
      $('#legend').css('visibility','visible');
    }
  }

  this.addChoroplethLayerSublink = function(id,textValue,faIcon,faIconColor){
    var new_link = addSubgroupLink(CHOROPLETH_GROUP,id,textValue,false,faIcon,undefined,undefined,faIconColor);
    new_link.addClass('choroplethlayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('choroplethlayer_selected')) {
        MAP.CHLOROPETH_CONTROLLER.hide(id);
        CHOROPLETH_LINKS[id]["active"] = false;
        new_link.removeClass('choroplethlayer_selected');
      } else {
        MAP.CHLOROPETH_CONTROLLER.show(id);
        CHOROPLETH_LINKS[id]["active"] = true;
        new_link.addClass('choroplethlayer_selected');
      }
    });
    CHOROPLETH_LINKS[id] = {"link":new_link,"active":true};
  }

  this.addProportionalLayerSubLink = function(id,textValue,faIcon,faIconColor){
    var new_link = addSubgroupLink(PROPORTIONAL_GROUP,id,textValue,false,faIcon,undefined,undefined,faIconColor);
    new_link.addClass('proportionallayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('proportionallayer_selected')) {
        MAP.PROPORTIONAL_CONTROLLER.hide(id);
        PROPORTIONAL_LINKS[id]["active"] = false;
        new_link.removeClass('proportionallayer_selected');
      } else {
        MAP.PROPORTIONAL_CONTROLLER.show(id);
        PROPORTIONAL_LINKS[id]["active"] = true;
        new_link.addClass('proportionallayer_selected');
      }
    });
    PROPORTIONAL_LINKS[id] = {"link":new_link,"active":true};
  }

  this.addPointlayerSubLink = function(id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor){
    var new_link = addSubgroupLink(POINTLAYER_GROUP,id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor);
    new_link.addClass('pointlayer_selected');
    new_link.click(function(e){
      if (new_link.hasClass('pointlayer_selected')) {
        MAP.POINT_CONTROLLER.hide(id);
        POINTLAYER_LINKS[id]["active"] = false;
        new_link.removeClass('pointlayer_selected');
      } else {
        MAP.POINT_CONTROLLER.show(id);
        POINTLAYER_LINKS[id]["active"] = true;
        new_link.addClass('pointlayer_selected');
      }
    });
    POINTLAYER_LINKS[id] = {"link":new_link,"active":true};
  }
  
  this.addPolylineSubLink = function(id,textValue,isCustomIcon,faIcon){
    var new_link = addSubgroupLink(POLYLINE_GROUP,id,textValue,isCustomIcon,faIcon);
    new_link.addClass('polyline_selected');
    new_link.click(function(e){
      if (new_link.hasClass('polyline_selected')) {
        MAP.POLYLINE_CONTROLLER.hide(id);
        POLYLINE_LINKS[id]["active"] = false;
        new_link.removeClass('polyline_selected');
      } else {
        MAP.POLYLINE_CONTROLLER.show(id);
        POLYLINE_LINKS[id]["active"] = true;
        new_link.addClass('polyline_selected');
      }
    });
    POLYLINE_LINKS[id] = {"link":new_link,"active":true};
  }
//tackle the custom color and positioning on dashboard
  function addSubgroupLink(parent_list_group,id,textValue,isCustomIcon,faIcon,customIconLink,customIconColor,faIconColor){
    var icon = $('<i></i>');
    if (isCustomIcon) {
      icon
      .css({
        "background": "transparent url("+customIconLink+")",
        "overflow": "auto",
        "width": "22px",
        "height": "22px",
        "background-color": customIconColor,
        "left": "10px",
        "position": "absolute",
        "background-size": "cover"
      });
    } else {
      icon
      .attr({
        class: "fa " + faIcon
      });
      if (faIconColor) { icon.css({
        "color": faIconColor,
        "width": "22px",
        "height": "22px",
        "border-radius": "11px",
        "position":"absolute",
        "left": "10px"
      }); }
    }

    var new_link = $('<a></a>')
      .attr({
        id: id,
        href: "#"
      })
      .text(textValue);
    new_link.append(icon);
    parent_list_group.append($('<p></p>').append(new_link));
    return new_link;
  }
}

var SUBGROUP_MAP_CONTROLLER = function(map,type){
  this.GROUP = new L.layerGroup();
  this.HASH = {};
  this.type = type;
  this.MIN = 999999;
  this.MAX = 0;
  this.bucketSizes = [0,100,250,500,1000,10000];
  this.cBucketSizes = [0,200,500,1000,2000,10000];
  this.cCircleSize = {
    0:{'opacity':.1},
    200:{'opacity':.2},
    500:{'opacity':.35},
    1000:{'opacity':.5},
    2000:{'opacity':.7},
    10000:{'opacity':.8},
    99999:{'opacity':.9}
  }
  this.circleSize = {
    0:{'size':50,'opacity':1},
    100:{'size':100,'opacity':.84},
    250:{'size':200,'opacity':.7},
    500:{'size':350,'opacity':.56},
    1000:{'size':550,'opacity':.42},
    10000:{'size':750,'opacity':.28},
    99999:{'size':1000,'opacity':.14}
  }

  //initialization
  map.addLayer(this.GROUP);

  this.hideAll = function(){
    map.removeLayer(this.GROUP);
  }

  this.showAll = function(){
    map.addLayer(this.GROUP);
  }

  this.add = function(key,name,layer){
    this.HASH[key] = {"name":name, "layer":layer};
    this.GROUP.addLayer(layer);
    //this.calibrateStats(key,layer);
  }

  this.remove = function(key){
    this.GROUP.removeLayer(this.HASH[key]["layer"]);
    this.HASH[key] = undefined;
    return this.GROUP.getLayers().length == 0;
  }

  this.show = function(key){
    if (this.HASH[key]) {
      if (this.GROUP.hasLayer(this.HASH[key]["layer"])) {
        return;
      } else {
        this.GROUP.addLayer(this.HASH[key]["layer"]);
      }
    }
  }

  this.hide = function(key){ //returns if hash is empty
    this.GROUP.removeLayer(this.HASH[key]["layer"]);
  }

  this.calibrateStats = function(key,count){
    if (count > this.MAX) { this.MAX = count; }
    if (count < this.MIN) { this.MIN = count; }
    this.HASH[key]["category"] = this.bucketize(count);
  }

  this.choroBucketize = function(layerCount){
    if (layerCount < this.cBucketSizes[1]){ return this.cBucketSizes[0]; }
    if (layerCount < this.cBucketSizes[2]){ return this.cBucketSizes[1]; }
    if (layerCount < this.cBucketSizes[3]){ return this.cBucketSizes[2]; }
    if (layerCount < this.cBucketSizes[4]){ return this.cBucketSizes[3]; }
    if (layerCount < this.cBucketSizes[5]){ return this.cBucketSizes[4]; }
    return 99999;
  }

  this.bucketize = function(layerCount){
    if (layerCount < this.bucketSizes[1]){ return this.bucketSizes[0]; }
    if (layerCount < this.bucketSizes[2]){ return this.bucketSizes[1]; }
    if (layerCount < this.bucketSizes[3]){ return this.bucketSizes[2]; }
    if (layerCount < this.bucketSizes[4]){ return this.bucketSizes[3]; }
    if (layerCount < this.bucketSizes[5]){ return this.bucketSizes[4]; }
    return 99999;
  }
}

var MAP_CONTROLLER = function(xhr, sg_ll, places_api, venues_api, colors_palette){
  XHR = xhr;
  COLORS = colors_palette;
  this.PLACES_API = places_api;
  this.VENUES_API = venues_api;

  SINGAPORE_LATLON = sg_ll;

  this.SIDEBAR;
  this.google = new L.Google('ROADMAP');
  this.bing = new L.BingLayer("AjG85RGpnN3qcJbMNxF7BWtnkq2qc_iVKntqYodZUt7n-cBTkU6qCeU47jfxJStJ");
  this.osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18
  });
  this.map = L.map('map',{
    minZoom: 11,
    maxBounds: L.latLngBounds(L.latLng(1.21539, 103.57625), L.latLng(1.48036, 104.04866)),
    layers: [this.google,this.bing,this.osm]
  }).setView(SINGAPORE_LATLON, 12);

  this.panControl = L.control.pan().addTo(this.map);
  this.scaleControl = L.control.scale({"position":"topright"}).addTo(this.map);

  POLYLINE_CONTROLLER = new SUBGROUP_MAP_CONTROLLER(this.map,'polyline');
  POINT_CONTROLLER = new SUBGROUP_MAP_CONTROLLER(this.map,'point');
  PROPORTIONAL_CONTROLLER = new SUBGROUP_MAP_CONTROLLER(this.map,'proportional');
  CHLOROPETH_CONTROLLER = new SUBGROUP_MAP_CONTROLLER(this.map,'chloropeth');

  this.POLYLINE_CONTROLLER = POLYLINE_CONTROLLER;
  this.POINT_CONTROLLER = POINT_CONTROLLER;
  this.PROPORTIONAL_CONTROLLER = PROPORTIONAL_CONTROLLER;
  this.CHLOROPETH_CONTROLLER = CHLOROPETH_CONTROLLER;

  this.initialize = function(){
    //load regions
    this.loadPlanningRegions(this.map,this.onEachRegionPopup);
    //init MRT polyline layer
    this.loadMRTNetwork();
  }

  this.setSidebar = function(sidebar_controller){
    this.SIDEBAR = sidebar_controller;
  }

  this.hideBingBasemap = function(){
    this.map.removeLayer(this.bing);
  }

  this.showBingBasemap = function(){
    this.map.addLayer(this.bing);
  }

  this.hideOSMBasemap = function(){
    this.map.removeLayer(this.osm);
  }

  this.showOSMBasemap = function(){
    this.map.addLayer(this.osm);
  }

  this.hideGoogleBasemap = function(){
    this.map.removeLayer(this.google);
  }

  this.showGoogleBasemap = function(){
    this.map.addLayer(this.google);
  }

  this.loadMRTNetwork = function(){
    var MAP = this.map;
    XHR('/api/data/mrt',function(response){
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
      });
      POLYLINE_CONTROLLER.add('mrt_network','MRT Network',mrt_layer);
    });
  }

  this.loadVenuesChoroplethLayer = function(input,response,color){
    var fs_venues = response.response.venues;
    for (var k in fs_venues) {
      var fs_location = fs_venues[k];
      fs_location['leaflet_ll'] = L.latLng(fs_location.location.lat,fs_location.location.lng);
    }
    this.getPlanningRegion(function(planning_response){
      var planning_geojson = JSON.parse(planning_response);
      var calculateValues = function(layerBounds){
        var checkinsCounter = 0, usersCounter = 0, tipsCounter = 0;
        for (var j in fs_venues) {
          var fs_location = fs_venues[j];
          if (layerBounds.contains(fs_location['leaflet_ll'])) {
            checkinsCounter += fs_location.stats.checkinsCount || 0;
            usersCounter += fs_location.stats.usersCount || 0;
            tipsCounter += fs_location.stats.tipCount || 0;
          }
        }
        return {"checkins": checkinsCounter, "users": usersCounter, "tips": tipsCounter};
      }
      var onEachFeatureChoropleth = function(feature,layer) {
        var regionValues = calculateValues(layer.getBounds()),
        regionCount = regionValues['checkins'],
        regionUsers = regionValues['users'],
        regionTips = regionValues['tips'];

        var bucketCatNo = CHLOROPETH_CONTROLLER.choroBucketize(regionCount),
        regionOpac = CHLOROPETH_CONTROLLER.cCircleSize[bucketCatNo]['opacity'];

        var defaultStyle = {
          color: color,
          weight: 2,
          opacity: regionOpac,
          fillOpacity: regionOpac,
          fillColor: color
        }, highlightStyle = {
          color: color, 
          weight: 3,
          opacity: 0.6,
          fillOpacity: .8,
          fillColor: color
        };
        layer.setStyle(defaultStyle);
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.DGPZ_NAME) {
          (function(layer, properties) {
            var content = '<h4>' + feature.properties.DGPZ_NAME + '<\/h4>' +
            '<p>Road Name: ' + layer.feature.properties.DGPSZ_NAME + '<br \/>' + '<\/p>' +
            '<p>Check ins: ' + regionCount + '<br \/>' + '<\/p>' +
            '<p>Users: ' + regionUsers + '<br \/>' + '<\/p>' +
            '<p>Tips given: ' + regionTips + '<br \/>' + '<\/p>';
            
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
      var subject_geo_layer = L.geoJson(planning_geojson,{
        onEachFeature: onEachFeatureChoropleth
      });

      //action to add choropleth to map
      if(CHLOROPETH_CONTROLLER.HASH[input]){return;}
      CHLOROPETH_CONTROLLER.add(input,input,subject_geo_layer);
      this.SIDEBAR.addChoroplethLayerSublink(input,input,'fa-th-large',color);
    });
  }

  this.loadVenuesProportionalLayer = function(input,response,color){
    var locationCirclesLayer = this.createVenuesProportionalLayer(response.response.venues,color);
    if(PROPORTIONAL_CONTROLLER.HASH[input]){return;}
    PROPORTIONAL_CONTROLLER.add(input,input,locationCirclesLayer);
    this.SIDEBAR.addProportionalLayerSubLink(input,input,'fa-circle',color);
    return color;
  }

  this.createVenuesProportionalLayer = function(locations,color){
    var circles = [];
    for (var i in locations) {
      var venue = locations[i],
      venueCategory = PROPORTIONAL_CONTROLLER.bucketize(venue.stats.checkinsCount),
      venueClassInfo = PROPORTIONAL_CONTROLLER.circleSize[venueCategory];
      var venueCircle = L.circle([venue.location.lat,venue.location.lng],venueClassInfo['size'],{
        "fillColor":color,
        "fillOpacity":venueClassInfo['opacity'],
        "color":color
      });
      venueCircle.bindPopup(this.generateVenuePopupContent(venue));
      circles.push(venueCircle);
    }
    return L.layerGroup(circles);
  }

  this.loadVenuesPointLayer = function(input,results){
    var icon = this.VENUES_API.venues_hash[input].icon,
    iconURL = icon.prefix + '32' + icon.suffix,
    iconColor = COLORS.randomColor();
    if (POINT_CONTROLLER.HASH[input]) {return;}
    POINT_CONTROLLER.add(input,input,this.createVenuesPointLayer(input,results.response.venues,iconColor));
    this.SIDEBAR.addPointlayerSubLink(input,input,true,undefined,iconURL,iconColor);
    return iconColor;
  }

  this.loadPlacesPointLayer = function(input,token,results){
    var pointLayerPayload = POINT_CONTROLLER.HASH[input],
    iconURL = results[0].icon;
    if (POINT_CONTROLLER.HASH[input]) {
      if ($.inArray(token, POINT_CONTROLLER.HASH[input]["tokens"]) > -1){
        return;
      }else{
        POINT_CONTROLLER.HASH[input].tokens.push(token);
        //add points to existing layer
        this.addToPointLayer(results,POINT_CONTROLLER.HASH[input]['layer']);
      }
    } else { //for non-existing layer. show new
      POINT_CONTROLLER.HASH[input] = {
        "name"    : input,
        "layer"   : this.createPointLayer(results),//generate layer here
        "tokens"  : [token]
      };
      POINT_CONTROLLER.GROUP.addLayer(POINT_CONTROLLER.HASH[input]['layer']);
      this.SIDEBAR.addPointlayerSubLink(input,input.replace('_',' '),true,undefined,iconURL,'rgba(0,0,0,0)');
    }
    //POINT_CONTROLLER.calibrateStats(input,POINT_CONTROLLER.HASH[input]['layer']);
  }

  this.createPointLayer = function(payloadGroup){
    var points = [];
    for (var i in payloadGroup) {
      points.push(this.createPlacePointMarker(payloadGroup[i]));
    }
    return L.layerGroup(points);
  }

  this.createVenuesPointLayer = function(input,payloadGroup,iconColor){
    var points = [];
    for (var i in payloadGroup) {
      points.push(this.createVenuePointMarker(input,payloadGroup[i],iconColor));
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
    var marker = L.marker([info.lat,info.lng],{icon: this.generatePlacePointIcon(payload.icon,'rgba(0,0,0,0)')});
    
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

  this.createVenuePointMarker = function(input,payload,iconColor){
    var info = this.extractVenuePointData(payload);
    var icon = this.VENUES_API.venues_hash[input].icon,
    iconURL = icon.prefix + '32' + icon.suffix;
    var marker = L.marker([info.lat,info.lng],{icon: this.generatePlacePointIcon(iconURL,iconColor)});
    marker.bindPopup(this.generateVenuePopupContent(payload));

    return marker;
  }

  this.generateVenuePopupContent = function(payload){
    var info = this.extractVenuePointData(payload);

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
    return content;
  }

  this.generatePlacePointIcon = function(iconUrl,iconColor){
    return L.divIcon({
      html: "<div class='logo' style='width:30px;height:30px;background-image: url("+iconUrl+");background-color:"+iconColor+";background-size: contain;background-repeat: no-repeat;background-position: center;'> </div>",
      iconSize: [32, 32],
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

  this.loadPlanningRegions = function(map,onEachRegionPopup){
    XHR('/api/data/planning_regions',function(response){
      var planning_geojson = JSON.parse(response);
      var planning_geo_layer = L.geoJson(planning_geojson,{
        onEachFeature: onEachRegionPopup
      });
      //layerControl.addOverlay(planning_geo_layer,'Planning Chloropeth');
      var layers = planning_geo_layer.getLayers();
    });
  }

  this.getPlanningRegion = function(callback){
    XHR('/api/data/planning_regions',function(response){
      callback(response);
    });
  }
}

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

var COLORS = new COLOR_PALETTE();
var PLACES_API = new GOOGLE_PLACES(XHR,fake_google_map,fake_google_map_location);
var VENUES_API = new FOURSQUARE_VENUES(XHR,SINGAPORE_LATLON);
var MAP = new MAP_CONTROLLER(XHR,SINGAPORE_LATLON,PLACES_API,VENUES_API,COLORS);
MAP.initialize();
var SIDEBAR = new SIDEBAR_CONTROLLER(MAP);
SIDEBAR.initialize();
MAP.setSidebar(SIDEBAR);

var place_categories,
venues_categories,
venues_hash;

var submitTextSearchParameters = function(){
  var input = $('#search_text').val();
  var showSearchErrorMessage = function(){

  };

  showTextLoader(); //show loading spinner for results
  PLACES_API.singaporeTextSearch(input,function(results,status,pagination){
    if (status == google.maps.places.PlacesServiceStatus.OK) {

      MAP.loadPlacesPointLayer(input,pagination.D,results);
      if (pagination.hasNextPage){
        pagination.nextPage();
      }else{
        hideTextLoader(); // finally done loading
      }

    }

    if (status == "ZERO_RESULTS") {
      alert('No results found');
      hideTextLoader();
    }
  });
}

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