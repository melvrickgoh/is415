function FoursquareVenues(XHR, SINGAPORE_LATLON){
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

var VENUES_API = new FoursquareVenues(XHR,SINGAPORE_LATLON);