var map;
var locMarker;
var locRadius;
var pointBuffer;

var repositionCounter = 0;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		streetViewControl: false, 
		mapTypeControl: false,
		draggable: false,
		zoomControl: false,
		scrollwheel: false,
		disableDoubleClickZoom: true
	});

	setStyles();

	if (navigator.geolocation) {
		setUserLocation();
	} else {
		alert("Looks like this device isn't supported for Apex :(");
		return;
	}
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

	console.log("Setting map center listener");
	map.addListener('center_changed', function() {
		$('#hardpoint-data').empty();
	});

	console.log("Setting map center");
	map.setCenter(new google.maps.LatLng(41.228972, -101.740995));

	console.log("Setting map zoom");
	map.setZoom(4);

	if (navigator.geolocation) {
		setUserLocation();
	} else {
		alert("Looks like this device isn't supported for Apex :(");
	}
}

function setUserLocation() {
	var optn = {
		enableHighAccuracy: true,
		timeout: Infinity,
		maximumAge: 0 
	};
	navigator.geolocation.watchPosition(
			function(position) {
				var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				if (position.coords.latitude != 0 && position.coords.longitude != 0) {
					if (!locMarker) {
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

				  		console.log("Initiating first hardpoints pull");
				  		getHardpoints();

				  		map.setZoom(18);
					} else {
						locMarker.setPosition(latLng);
					}

					console.log("Repositioning map center");
					map.setCenter(locMarker.position);
					repositionCounter++;

					if (repositionCounter % 4 == 0) {
						console.log("Pulling sequential hardpoints");
						getHardpoints();
					}
				}
			}, 
			function() {
				console.log("Geolocation acquisition failure");
			}, 
			optn
	);
}

function getHardpoints() {
	console.log("Getting hardpoints for user loc: " + locMarker.position);
	$.post({
		url: "http://localhost:8888/api/enumerate",
		data: JSON.stringify({ user_lat: locMarker.position.lat(), user_lng: locMarker.position.lng() }),
		success: function(result) {
			var parsed = JSON.parse(result);
			pointBuffer = parsed.value;
			for (var i=0; i < pointBuffer.length; i++) {
				var markerPos = new google.maps.LatLng(pointBuffer[i].lat, pointBuffer[i].lng);
				var markerLatLng = new google.maps.Marker({
					map: map,
					position: markerPos,
					icon: 'img/hardpoint.png'
				});

				markerLatLng.addListener('click', function() {
					console.log("Attempting match for: " + this.position.lat() + ", " + this.position.lng().toFixed(6));
					for (var j=0; j < pointBuffer.length; j++) {
						if (pointBuffer[j].lat == this.position.lat().toFixed(6)
							&& pointBuffer[j].lng == this.position.lng().toFixed(6)) {
							alert("Debug: " + pointBuffer[j].name);

							// Distance check
							if (distanceCheck(locMarker.position.lat(),
											  locMarker.position.lng(),
											  this.position.lat(),
											  this.position.lng()) <= 40) {
								alert("Within distance!");

								// Fire off AJAX request here
								$.post({
									url: "http://localhost:8888/api/hardpoint",
									data: JSON.stringify({ lat: this.position.lat().toFixed(6), lng: this.position.lng().toFixed(6) }),
									success: function(result) {
										alert(result);
									}
								});
							}
						}
					}
				});
			}
		}
	});
}

function distanceCheck(lat1, lon1, lat2, lon2) {
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}