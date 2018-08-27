// array of locations in Chicago
var locations = [
  {title: 'Wrigley Field', lat: 41.9484384, lng: -87.6553327},
  {title: 'Navy Pier', lat: 41.8913633, lng: -87.6085364},
  {title: 'Millennium Park', lat: 41.8825524, lng: -87.6225514},
  {title: 'The Art Institute of Chicago', lat: 41.879547, lng: -87.623724},
  {title: 'Shedd Aquarium', lat: 41.8675726, lng: -87.614038},
  {title: 'The Field Museum', lat: 41.866261, lng: -87.6169805},
  {title: 'Buckingham Fountain', lat: 41.8757944, lng: -87.6189483},
  {title: 'Maggie Daley Park', lat: 41.8823598, lng: -87.6194393},
  {title: 'The Adler Planetarium', lat: 41.866333, lng: -87.6067829}
];

var map;

// create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  var myLatlng = {lat: 41.9088619, lng: -87.6387012};
  // constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatlng,
    zoom: 12
  });

  var infoWindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (i = 0; i < locations.length; i++) {
    (function() {
      // Get the position from the location array.
      var title = locations[i].title;
      var location = locations[i];
      var position = new google.maps.LatLng(location.lat, location.lng);
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        address: address,
        city: city,
        state: state,
        zip: zip
      });
      // Push the marker to our array of markers.
      markers.push(marker);

      appViewModel.attractions()[i].marker = marker;

      // Create an onclick event to open an infowindow at each marker.
      marker.addListener("click", function() {
        populateInfoWindow(this, infoWindow);
        infoWindow.setContent(contentString);
        map.setCenter(marker.getPosition());
        map.setZoom(15);
      });

      function populateInfoWindow(marker, infoWindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != marker) {
          infoWindow.marker = marker;
          infoWindow.setContent(
            '<div class="title">' +
              marker.title +
              "</div>" +
              marker.contentString
          );
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            marker.setAnimation(null);
          }, 800);
          infoWindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infoWindow.addListener("closeclick", function() {
            infoWindow.marker = null;
            map.setCenter(myLatlng);
            map.setZoom(12);
          });
        }
      }

      // Foursquare api used to provide location information
      var venue, address, city, state, zip, contentString;

      $.ajax({
        url: "https://api.foursquare.com/v2/venues/search",
        dataType: "json",
        data: {
          ll: '41.878114, -87.629798',
          query: marker.title,
          client_id: "3OWBUL1SQQFBBI1N4BUCIEE05X2IKGFPS0K3EBQX2ZV2LTGM",
          client_secret:"ZUAKAYY1B3LLLR40ZDGRDDVHM1XNL2H0SHEBTEJMNFWBTYCR",
          v: 20180821
        },
        success: function(data) {
          venue = data.response.venues[0];
          address = venue.location.address;
          city = venue.location.city;
          state = venue.location.state;
          zip = venue.location.postalCode;
          contentString = '<div class="info-content">' +
            '<h2>' + title + '</h2>' +
            '<div class="location">' + address + '<br>' +
            city + ',' + state + '&nbsp' + zip + '</div>' +
            '<a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
						 location.lat + ',' + location.lng + '>Directions</a>' + '</div>';
          marker.contentString;
        },
        // Return error message is foursquare fails to provide location information
        error: function() {
          contentString =
            '<div class="info-content">Data is currently not available. Please try again.</div>';
        }
      });
    })(i);
  }
}

// Return error message if Google Maps fails to load
function mapError() {
  alert("Map could not be loaded at this moment. Please try again");
}

// Location Constructor
var Location = function(data) {
  var self = this;
  this.title = data.title;
  this.location = data.location;
  this.show = ko.observable(true);
};

// VIEW MODEL //
var AppViewModel = function() {
  var self = this;

  this.attractions = ko.observableArray();
  this.filterAttractions = ko.observable('');
  self.visibleLocations = ko.observable(false);

  for (i = 0; i < locations.length; i++) {
    var place = new Location(locations[i]);
    self.attractions.push(place);
  }

  //  Create search in order to filter through locations
  this.searchFilter = ko.computed(function() {
    var filter = self.filterAttractions().toLowerCase();
    for (i = 0; i < self.attractions().length; i++) {
      if (self.attractions()[i].title.toLowerCase().indexOf(filter) > -1)
      {
        self.attractions()[i].show(true);
        if (self.attractions()[i].marker) {
          self.attractions()[i].marker.setVisible(true);
        }
      } else {
        self.attractions()[i].show(false);
        if (self.attractions()[i].marker) {
          self.attractions()[i].marker.setVisible(false);
        }
      }
    }
  });

  // map marker bounces when location within the list is clicked
  this.showLocation = function(locations) {
    google.maps.event.trigger(locations.marker, "click");
  };

  // toggleShow triggered when the menu icon is clicked to hide/show the locations
  self.toggleShow = function() {
      self.visibleLocations(!self.visibleLocations());
  };
};

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);
