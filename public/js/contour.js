// popup
function Contour(){

	function onEachFeature(feature, layer) {
		if (feature.properties &&  feature.properties.Value) {
			layer.bindPopup("Value: " + feature.properties.Value);
		}
	}

	// styling
	function getValue(x) {
		return x == "100" ? "#fc9272" :
		       x == "200" ? "#fb6a4a" :
		       x == "300" ? "#ef3b2c" :
		       x == "400" ? "#fa9fb5" :
		       x == "500" ? "#f768a1" :
		       x == "600" ? "#dd3497" :
		       x == "700" ? "#ae017e" :
		       x == "800" ? "#7a0177" :
		       x == "900" ? "#49006a" :
		       x == "1000" ? "#E5F5E0" :
		       x == "1100" ? "#f7f4f9" :
		       x == "1200" ? "#e7e1ef" :
		       x == "1300" ? "#d4b9da" :
		       x == "1400" ? "#c994c7" :
		       x == "1500" ? "#b0ecf5" :
		       x == "1600" ? "#df65b0" :
		       x == "1700" ? "#e7298a" :
		       x == "1800" ? "#ce1256" :
		       x == "1900" ? "#980043" :
		       x == "2000" ? "#67001f" :
		       "";
	}
				
	function style1(feature) {
		return {
			"color": getValue(feature.properties.Value),
			"fillOpacity": 0.5
		};
	}

	// data layers
	var layers = {};
	var layersDisplay = new L.layerGroup().addTo(MAP.map);
	var fitBounds = true; 		
	function addDataToMap(data, style, layerName) {
		layers[layerName] = L.geoJson(data, {
			onEachFeature: (typeof onEachFeature == "undefined") ? undefined : onEachFeature,
			pointToLayer: function (feature, latlng) {return L.circleMarker(latlng);},
			style: style,
		});
		//layers[layerName].addTo(MAP.map);
		
		if(fitBounds) {
			MAP.map.fitBounds(layers[layerName].getBounds());
			fitBounds = false;
		}
	};

	this.showContourPlot = function(userid,uuid,number){
		layersDisplay.clearLayers();
		layersDisplay.addLayer(layers[userid+"_"+uuid+"_"+number]);
	}

	this.initializeKDESeries = function(userid,uuid){
		layersDisplay.clearLayers();
		CONTOUR.initializeKDE(userid,uuid,50);
		CONTOUR.initializeKDE(userid,uuid,100);
		CONTOUR.initializeKDE(userid,uuid,200);
		CONTOUR.initializeKDE(userid,uuid,300);
		CONTOUR.initializeKDE(userid,uuid,400);
	}

	this.initializeKDE = function(userid,uuid,number){
		if(typeof style1 == "undefined") style1 = undefined;
		$.getJSON("r/Contour._"+userid+"_._"+number+"_._"+uuid+".geojson", function(x) {addDataToMap(x, style1, userid+"_"+uuid+"_"+number)});		
	}

	this.rawInitializeKDE = function(name){
		if(typeof style1 == "undefined") style1 = undefined;
		$.getJSON("r/"+name+".geojson", function(x) {addDataToMap(x, style1, userid+"_"+uuid+"_"+number)});

		// legend
		var legend = L.control({position: 'bottomright'});
		legend.onAdd = function(map) {
			var div = L.DomUtil.create('div', 'legend');
		    var labels = [];
		    var cats = ['200','400','600','800','1000','1200','1400','1600','1800','2000'];

			div.innerHTML += 'KDE Density<br>';
			for (var i = 0; i < cats.length; i++) {
				div.innerHTML +=
				    '<i style="background:' + getValue(cats[i]) + '"></i> ' +
					cats[i] + '<br>';
			}
			return div;
		};
		legend.addTo(MAP.map);
	}
}

var CONTOUR = new Contour();