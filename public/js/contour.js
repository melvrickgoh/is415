// popup
function Contour(){

	function onEachFeature(feature, layer) {
		if (feature.properties &&  feature.properties.Value) {
			layer.bindPopup("Value: " + feature.properties.Value);
		}
	}

	// styling
	function getValue(x) {
		return x == "200" ? "#41AB5D" :
		       x == "400" ? "#74C476" :
		       x == "600" ? "#A1D99B" :
		       x == "800" ? "#C7E9C0" :
		       x == "1000" ? "#E5F5E0" :
		       x == "1200" ? "#F7FCF5" :
		       x == "1400" ? "#4799c2" :
		       x == "1600" ? "#b0ecf5" :
		       x == "1800" ? "#7da9cd" :
		       x == "2000" ? "#135486" :
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
	var fitBounds = true; 		
	function addDataToMap(data, style, layer) {
		layers[layer] = L.geoJson(data, {
			onEachFeature: (typeof onEachFeature == "undefined") ? undefined : onEachFeature,
			pointToLayer: function (feature, latlng) {return L.circleMarker(latlng);},
			style: style,
		});
		layers[layer].addTo(MAP.map);
		
		if(fitBounds) {
			MAP.map.fitBounds(layers[layer].getBounds());
			fitBounds = false;
		}
	};

	this.initializeKDE = function(userid,uuid){
		if(typeof style1 == "undefined") style1 = undefined;
		$.getJSON("r/Contour._"+userid+"_._"+uuid+".geojson", function(x) {addDataToMap(x, style1, "Farms")});

		// legend
		var legend = L.control({position: 'bottomright'});
		legend.onAdd = function(map) {
			var div = L.DomUtil.create('div', 'legend');
		    var labels = [];
		    var cats = ['200','400','600','800','1000','1200','1400','1600','1800','2000'];

			div.innerHTML += 'Tree Cover<br>';
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
