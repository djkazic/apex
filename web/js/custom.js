var map;
var locMarker;
var locRadius;
var pointBuffer;

var loggedIn = 0;

var repositionCounter = 0;

function initMap() {
	// Register button hooks
	$('#inventory-open').on('click', function() {
		$('#inventory').modal("show");
	});

	$('#stats-open').on('click', function() {
		$('#stats').modal("show");
	});

	$('#hardpoint-data-close').on('click', function() {
		$('#hardpoint-data').html("");
	});

	$('#sign-out').on('click', function() {
		var now = new Date();
		var time = now.getTime();
		time -= 3600 * 1000;
		now.setTime(time);
		document.cookie = "api_token=\"\"" + "; expires = " 
						  + now.toUTCString() + "; path=/";
		location.reload();
	});

	// Check on login status
	if (document.cookie.indexOf("api_token") == -1) {
		$('#register').modal("show");
	} else {
		var splitCookie = document.cookie.split(";");
		for (var i=0; i < splitCookie.length; i++) {
			if (splitCookie[i].indexOf("api_token") != -1) {
				var splitEntry = splitCookie[i].split("=");
				apiToken = splitEntry[1];
			}
		}
		
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
		data: JSON.stringify({ api_token: apiToken, user_lat: locMarker.position.lat(), user_lng: locMarker.position.lng() }),
		success: function(result) {
			var parsed = JSON.parse(result);
			if (parsed.token_expired == "true") {
				alert("Requesting new token!");
				requestNewToken();
			} else {
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
							var markerLat = this.position.lat().toFixed(6);
							var markerLng = this.position.lng().toFixed(6);
							if (pointBuffer[j].lat == markerLat
								&& pointBuffer[j].lng == markerLng) {
								
								// Distance check
								if (distanceCheck(locMarker.position.lat(),
												  locMarker.position.lng(),
												  markerLat,
												  markerLng) <= 40) {
									var hostname = pointBuffer[j].name.toLowerCase()
									var consolePrefix = "root@" + hostname + ":~# ";
									var initialState = consolePrefix + " Awaiting user input... <br>";
									$('#hardpoint-content').html(initialState);

									$('#hardpoint-title').html(pointBuffer[j].name.toUpperCase());
									$('#hardpoint-data').modal("show");

									// Register AJAX event to deploy button
									$('#hardpoint-deploy').on('click', function() {
										$('#hardpoint-content').html(initialState + consolePrefix + "<br>");
										
										var typeWriting = new TypeWriting({
											targetElement   : document.getElementsByClassName('terminal')[0],
											inputString     : consolePrefix + './configure; make -j4 <br>',
											typing_interval : 50, // Interval between each character
											blink_interval  : '1s', // Interval of the cursor blinks
											cursor_color    : '#00fd55', // Color of the cursor
										}, 
										function() {
											$('#hardpoint-content').append(consolePrefix + "./scan -target=" + hostname + "<br>");
										});
										
										setTimeout(function() {
											$.post({
												url: "http://localhost:8888/api/hardpoint",
												data: JSON.stringify({ api_token: apiToken, lat: markerLat, lng: markerLng }),
												success: function(result) {
													$('#hardpoint-content').append("> Execution completed. result = [" + result + "]");
												}
											});
										}, 3500);
									});
								} else {
									$('#hardpoint-fail').modal("show");
								}
							}
						}
					});
				}
			}
		}
	});
}

function onSignIn(googleUser) {
	var profile = googleUser.getAuthResponse().id_token;
	$.post({
		url: 'http://localhost:8888/api/auth',
		data: JSON.stringify({ token: profile }),
		success: function(result) {
			console.log("Auth result: [" + result + "]");
			result = JSON.parse(result);
			if (result.token == "registration") {
				// Handle registration logic (prompt for username)

			} else if (result.error == "Invalid token") {
				alert("Invalid Google sign-in token!");
			} else {
				// Handle incoming token as a cookie
				var now = new Date();
				var time = now.getTime();
				time += 3600 * 1000;
				now.setTime(time);
				document.cookie = "api_token=" + result.token + "; expires = " 
								  + now.toUTCString() + "; path=/";
			}
		}
	});
}

function requestNewToken() {
	$.post({
		url: 'http://localhost:8888/api/tokenrequest',
		data: JSON.stringify({ api_token: apiToken }),
		success: function(result) {
			result = JSON.parse(result);
			if (result.token) {
				apiToken = result.token;
				var now = new Date();
				var time = now.getTime();
				time += 3600 * 1000;
				now.setTime(time);
				document.cookie = "api_token=" + result.token + "; expires = " 
								  + now.toUTCString() + "; path=/";
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