'use strict';

var GoogleMapsUtils = {};

GoogleMapsUtils.findCurrentLocation = function (geocoder, settings, locations, sendResults) {

    if (!!navigator.geolocation && settings.useGeoLocation !== '0') {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            sendResults(findResults(geolocate, parseInt(settings.defaultRadius, 10), locations));
        });
    } else {
        geocoder.geocode({ 'address': settings.defaultZip }, function (results, status) {
            switch (status) {
                case google.maps.GeocoderStatus.OVER_QUERY_LIMIT :
                    alert('The daily query limit has been reached. Sorry. Try again Tomorrow!');
                    break;

                case google.maps.GeocoderStatus.OK :
                    sendResults(findResults(results[0].geometry.location, parseInt(settings.defaultRadius, 10), locations));
                    break;

                case google.maps.GeocoderStatus.ZERO_RESULTS :
                    alert('Address Can\'t be Found!');
                    break;

                default :
                    alert('Geocode error:' + status);
                    break;
            }

        });
    }
};

GoogleMapsUtils.findLocation = function (geocoder, zip, radius, locations, sendResults) {
    geocoder.geocode({ 'address': zip }, function (results, status) {
        switch (status) {
            case google.maps.GeocoderStatus.OVER_QUERY_LIMIT :
                alert('The daily query limit has been reached. Sorry. Try again Tomorrow!');
                break;

            case google.maps.GeocoderStatus.OK :
                sendResults(findResults(results[0].geometry.location, radius, locations));
                break;

            case google.maps.GeocoderStatus.ZERO_RESULTS :
                alert('Address Can\'t be Found!');
                break;

            default :
                alert('Geocode error:' + status);
                break;
        }
    });
};

GoogleMapsUtils.setupMap = function (geocoder, zip, mapContainer, callback) {
    findLngLat(geocoder, zip, function (results) {
        let center = new google.maps.LatLng(results.lat, results.lng);
        let mapSettings = {
            center: center,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
        };
       callback(new google.maps.Map(mapContainer, mapSettings));
    });
};

GoogleMapsUtils.addMapMarkers = function (map, locations) {
    var bounds = new google.maps.LatLngBounds();
    for (var d = 0; d < locations.length; d++) {
        let position = new google.maps.LatLng(locations[d].latitude, locations[d].longitude);
        bounds.extend(position);
        let marker = new google.maps.Marker({
            position: position,
            title: locations[d].name,
            map: map,
            url: 'http://maps.google.com/?q='+ locations[d].address1 + '+' + locations[d].city + '+' + locations[d].state + '+' + locations[d].zipCode
        });
        var infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'click', (function (marker, d, locations) {
            let address2 = locations[d].address2.length ? '<br>' + locations[d].address2 : '';
            return function() {
                infoWindow.setContent('<div class="info_content"><h3>' + locations[d].name + '</h3><p>' + locations[d].address1 + '<br>' + address2 + locations[d].city + ',' + locations[d].state + locations[d].zipCode + '<br><a href="' + locations[d].websiteLink + '" target="_blank">' + locations[d].website + '</a></p>');
                infoWindow.open(map, marker);
            }
        })(marker, d, locations));
        map.fitBounds(bounds);
    }
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
        google.maps.event.removeListener(boundsListener);
    });
};

var findLngLat = function (geocoder, zip, callback) {
    var lat = '';
    var lng = '';
    geocoder.geocode( { 'address': zip}, function (results, status) {
        switch (status) {
            case google.maps.GeocoderStatus.OVER_QUERY_LIMIT :
                alert('The daily query limit has been reached. Sorry. Try again Tomorrow!');
            break;
            case google.maps.GeocoderStatus.OK :
                callback({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()})
            break;
            case google.maps.GeocoderStatus.ZERO_RESULTS :
                alert('Address Can\'t be Found!');
            break;
            default :
                alert('Geocode error:' + status);
            break;
        }
    });
};

var findResults = function (location, radius, locations) {
    let latSearched = location.lat();
    let lngSearched = location.lng();
    var nearBy = [];
    for (var j = 0; j < locations.length; j++) {
        var locLat = locations[j].latitude;
        var locLng = locations[j].longitude;
        var distance = 3959 * Math.acos(Math.cos(toRadian(latSearched)) *
                Math.cos(toRadian(locLat)) * Math.cos(toRadian(locLng) -
                    toRadian(lngSearched)) + Math.sin(toRadian(latSearched)) *
                        Math.sin(toRadian(locLat)));
        if (distance < radius) {
            nearBy.push(j);
        }
    }
    nearBy.sort(function(a, b) { 
        return a.distance - b.distance;
    });
    return nearBy;
};

var toRadian = function (degree) {
    return degree * Math.PI / 180;
};

module.exports = GoogleMapsUtils;
