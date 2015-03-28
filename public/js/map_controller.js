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

var MAP = new MAP_CONTROLLER(XHR,SINGAPORE_LATLON,PLACES_API,VENUES_API,COLORS);
MAP.initialize();