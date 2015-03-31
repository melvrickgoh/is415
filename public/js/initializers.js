//initializer vars
var SINGAPORE_LATLON = [1.3520830,103.819836];
var fake_google_map_location = new google.maps.LatLng(SINGAPORE_LATLON[0],SINGAPORE_LATLON[1]);
fake_google_map = new google.maps.Map(document.getElementById('fake_map'),{
    center: fake_google_map_location,
    zoom: 15
});

var LOADING_URL_MOMENT;