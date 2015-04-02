function GooglePlaces(XHR,map,base_location){
  this.XHR = XHR;
  this.API_KEY = 'AIzaSyBF9YdzEWQUMpYLLVkRu_UXDahy2UOCDmw';
  this.map = map;
  this.map_location = base_location;

  /*text search bar */
  this.text_search_input = document.getElementById('search_text');
  autocomplete = new google.maps.places.Autocomplete(this.text_search_input, {
    bounds: new google.maps.LatLngBounds(new google.maps.LatLng(1.241805,103.613931),new google.maps.LatLng(1.463530,104.023172))
  });

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

var PLACES_API = new GooglePlaces(XHR,fake_google_map,fake_google_map_location);
