/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function esriMapScopeWrapper($) {
	var wrMap = WildRydes.map;

	function updateCenter(newValue) {
		wrMap.center = {latitude: newValue.coords.latitude, longitude: newValue.coords.longitude};
	}

	function updateExtent(newValue) {			//	TODO moved
		let b = wrMap.getBounds();
		wrMap.extent = {minLat: b._northEast.lat, minLng: b._northEast.lng,
			maxLat: b._southWest.lat, maxLng: b._southWest.lng};
	}

	wrMap.animate = function animate(origin, dest, callback) {          //  TODO moved
		let tick = 0;
		let id = null;
		const unicorn = WildRydes.unicorn;

		let latlng = unicorn.getLatLng();
		let latInc = (dest.latitude - latlng.lat) / 100;
		let lngInc = (dest.longitude - latlng.lng) / 100;
		// let latInc = (dest.latitude - origin.latitude) / 100;
		// let lngInc = (dest.longitude - origin.longitude) / 100;
		// let latlng = {lat: origin.latitude, lng: origin.longitude};

		clearInterval(id);
		id = setInterval(frame, 5);
		function frame() {
			if (tick === 100) {
				clearInterval(id);
				callback();
			} else {
				tick++;
				latlng = {lat: latlng.lat +  latInc, lng: latlng.lng +  lngInc};
				unicorn.setLatLng(latlng);
				console.log(latlng);
			}
		}
	}

	wrMap.unsetLocation = function unsetLocation() {		//	TODO moved
		if (WildRydes.marker)
			WildRydes.marker.remove();
	};
}(jQuery));