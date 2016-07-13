var map;
var geocoder;
var latLng;
var locMarker;
var locRadius;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {streetViewControl: false, mapTypeControl: false});
	setStyles();

	console.log("Setting map center");
	map.setCenter(new google.maps.LatLng(41.228972, -101.740995));

	console.log("Setting map zoom");
	map.setZoom(4);

	if (navigator.geolocation) {
		setTimeout(setUserLocation, 2500);
	} else {
		alert("Looks like this device isn't supported for Apex :(");
	}

	//map.setCenter(latLng);
	console.log("Setting RTL listener");
	$('#rtl').on('click', function() {
		map.panTo(latLng);
		map.setZoom(19);
	});

	console.log("Setting map center listener");
	map.addListener('center_changed', function() {
		$('#hardpoint-data').empty();
	});

	geocoder = new google.maps.Geocoder();
	geolocate(geocoder, "Boston College, MA", true);
}

function setUserLocation() {
	var optn = {
		enableHighAccuracy: true,
		timeout: Infinity,
		maximumAge: 0 
	};
	navigator.geolocation.watchPosition(
			function(position) {
				//console.log("SUCCESS");
				//console.log("\tLock: " + position.coords.latitude + ", " + position.coords.longitude);
				latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				if (position.coords.latitude != 0 && position.coords.longitude != 0) {
					if (!locMarker) {
						console.log("Setting map zoom limit");
						map.setOptions({minZoom: 16, maxZoom: 40});

						locMarker = new google.maps.Marker({
				  			map: map,
				  			position: latLng,
				  			icon: 'img/current.png'
				  		});
				  		
				  		locRadius = new google.maps.Circle({
				  			strokeColor: '#FF0000',
							strokeOpacity: 0.8,
							strokeWeight: 1.5,
							fillColor: '#FF0000',
							fillOpacity: 0.25,
							map: map,
							radius: 40
				  		});
				  		
				  		locRadius.bindTo('center', locMarker, 'position');

				  		setTimeout(function(latLng) {
							$('#rtl').click();
						}, 1500, latLng);
					} else {
						locMarker.setPosition(latLng);
					}
				}
			}, 
			function() {
				console.log("FAILURE");
			}, 
			optn
	);
}

function geolocate(geocoder, address, marker) {
	geocoder.geocode({'address': address}, function(results, status) {
	  	if (status == google.maps.GeocoderStatus.OK) {
	  		var zoomLevel = 12;
	  		if (marker) {
	  			var markerLatLng = new google.maps.Marker({
		  			map: map,
		  			position: results[0].geometry.location,
		  			icon: 'img/full.png',
		  			animation: google.maps.Animation.DROP
		  		});
		  		//console.log(address + " => " + markerLatLng.position);
		  		zoomLevel += 5;
	  		}

			markerLatLng.addListener('click', function() {
				map.panTo(markerLatLng.getPosition());
				map.setZoom(40);

				$.ajax({
					url: 'http://localhost:8888/api/hardpoint',
					method: 'POST',
					data: JSON.stringify({
						lat: markerLatLng.getPosition().lat(), 
						lon: markerLatLng.getPosition().lng()
					}),
					success: function(raw) {
						var data = JSON.parse(raw);
						var hpData = $('#hardpoint-data');
						hpData.html(
									  "<div> Name: " + data['name'] + "</div>"
									+ "<div> Stability: " + data['stability'] + "</div>"
								   );
					}
				});
			});
	  		//map.panTo(results[0].geometry.location);
	  		//map.setZoom(zoomLevel);
	  	} else {
	  		console.log("Maps API error: " + status);
	  	}
	});
}

function setStyles() {
	var styles = [
	    {
	        "featureType": "all",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#191f1f"
	            }
	        ]
	    },
	    {
	        "featureType": "all",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#a4b0b0"
	            }
	        ]
	    },
	    {
	        "featureType": "all",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "color": "#000000"
	            },
	            {
	                "weight": "1.5"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.country",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#0c0e0e"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.country",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#9a9a9a"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#191f1f"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.man_made",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#191f1f"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#0c0e0e"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural.landcover",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#0c0e0e"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural.terrain",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#223030"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "visibility": "on"
	            },
	            {
	                "color": "#38a6a6"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#52c2c2"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway.controlled_access",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#38a6a6"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway.controlled_access",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#38a6a6"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "geometry",
	        "stylers": [
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#080b0b"
	            },
	            {
	                "weight": "0.80"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#3f3f3f"
	            },
	            {
	                "weight": "0.50"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#080b0b"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#2c3434"
	            },
	            {
	                "weight": "0.41"
	            }
	        ]
	    },
	    {
	        "featureType": "transit",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#c6d4ec"
	            }
	        ]
	    }
	];
	map.setOptions({styles: styles});

	console.log("Setting map center");
	map.setCenter(new google.maps.LatLng(41.228972, -101.740995));

	console.log("Setting map zoom");
	map.setZoom(4);

	if (navigator.geolocation) {
		setTimeout(setUserLocation, 2500);
	} else {
		alert("Looks like this device isn't supported for Apex :(");
	}

	//map.setCenter(latLng);
	console.log("Setting RTL listener");
	$('#rtl').on('click', function() {
		map.panTo(latLng);
		map.setZoom(18);
	});

	console.log("Setting map center listener");
	map.addListener('center_changed', function() {
		$('#hardpoint-data').empty();
	});

	geocoder = new google.maps.Geocoder();
	geolocate(geocoder, "Boston College, MA", true);
}

function setUserLocation() {
	var optn = {
		enableHighAccuracy: true,
		timeout: Infinity,
		maximumAge: 0 
	};
	navigator.geolocation.watchPosition(
			function(position) {
				//console.log("SUCCESS");
				//console.log("\tLock: " + position.coords.latitude + ", " + position.coords.longitude);
				latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				if (position.coords.latitude != 0 && position.coords.longitude != 0) {
					if (!locMarker) {
						console.log("Setting map zoom limit");
						map.setOptions({minZoom: 15, maxZoom: 40});

						locMarker = new google.maps.Marker({
				  			map: map,
				  			position: latLng,
				  			icon: 'img/current.png'
				  		});
				  		
				  		locRadius = new google.maps.Circle({
				  			strokeColor: '#FF0000',
							strokeOpacity: 0.8,
							strokeWeight: 1.5,
							fillColor: '#FF0000',
							fillOpacity: 0.25,
							map: map,
							radius: 40
				  		});
				  		locRadius.bindTo('center', locMarker, 'position');

				  		setTimeout(function(latLng) {
							$('#rtl').click();
						}, 1500, latLng);
					} else {
						locMarker.setPosition(latLng);
					}
				}
			}, 
			function() {
				console.log("Failure to obtain geolocation lock");
			}, 
			optn
	);
}