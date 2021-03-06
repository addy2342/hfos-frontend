'use strict';


/**
 * @ngdoc function
 * @name hfosFrontendApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the hfosFrontendApp
 */
angular.module('hfosFrontendApp')
    .controller('MapCtrl', ['$scope', 'leafletData', 'navdata', 'socket', 'user', 'createDialog', 'Detector',
        'MapViewService', 'LayerService',
        function ($scope, leafletData, navdata, socket, user, createDialog, Detector, MapViewService,
                  LayerService) {
            console.log('Starting Map Controller');

            console.log(Detector.getResult());
            var deviceinfo = Detector.getDevice();
            var host = socket.host();

            $scope.mapviewuuid = '';
            $scope.mapview = {};

            $scope.btn_sync = '';
            $scope.btn_selectview = '';
            $scope.sync = true;
            $scope.follow = false;

            socket.send({'type': 'info', 'content': 'Map Controller activated'});

            $scope.$on('mapviewupdate', function (mapview) {
                if (mapview.uuid === $scope.mapviewuuid) {
                    $scope.mapview = mapview;
                    if ($scope.follow) {
                        $scope.center = mapview.coords;
                    }
                    console.log('Sync from MV: ', $scope.mapview);
                }
            });

            var syncToMapview = function (center) {
                console.log('MAPVIEWUUID: ', $scope.mapviewuuid);
                if ($scope.mapviewuuid !== '') {
                    $scope.mapview.coords = $scope.center;
                    console.log('Sync to MV: ', $scope.mapview);
                    if ($scope.sync) {
                        MapViewService.update($scope.mapview);
                    }

                }

            };

            var unsubscribe = function () {
                MapViewService.unsubscribe($scope.mapviewuuid);
                $scope.mapviewuuid = '';
            };

            var requestMapData = function () {
                console.log('Requesting mapdata from server.');
                var useruuid = user.user().uuid;
                console.log('Subscribing to useruuid mapview changes: ', useruuid);
                MapViewService.subscribe(useruuid);
                LayerService.requestData();
            };

            $scope.$on('User.Login', function (event) {
                console.log('Map Controller updating.');
                requestMapData();
            });

            if (user.signedin()) {
                requestMapData();
            }

            $scope.$on('mapviewupdate', function (mapview) {
                if (mapview.uuid === $scope.mapviewuuid) {
                    console.log('Map Controller updating.');
                    $scope.mapview = mapview;
                }
            });

            var handleEvent = function (event) {
                if (user.signedin()) {
                    console.log('Map Event:', event);
                    if (event.name === 'leafletDirectiveMap.moveend') {
                        if ($scope.sync) {
                            console.log('Synchronizing map');
                            syncToMapview($scope.center);
                        }
                    } else if (event.name === 'leafletDirectiveMap.dblclick') {
                        var subscriptionuuid = prompt('Enter subscription uuid:');
                        if (subscriptionuuid !== '') {
                            socket.send({'component': 'mapview', 'action': 'subscribe', 'data': subscriptionuuid});
                        }
                    }
                }
            };

            angular.extend($scope, {
                defaults: {
                    zoomControl: false
                },
                events: {
                    map: {
                        enable: ['moveend', 'dblclick'],
                        logic: 'emit'
                    }
                },
                center: {
                    lat: 0,
                    lon: 0,
                    zoom: 3,
                    autoDiscover: true
                },
                Vessel: {
                    coords: {
                        lat: 54.17825,
                        lon: 7.88888,
                    },
                    course: 0,
                    speed: 0,
                    radiorange: 700
                },
                settings: {
                    OSDMRangeDisplay: false,
                    OSDMDisplay: false,
                    VesselFollow: true
                },
                OSDMVessels: {},
                controls: {
                    draw: {},
                    scale: {}
                },
                geojson: {},
                layers: {
                    baselayers: {
                        osm: {
                            name: 'OpenStreetMap',
                            type: 'xyz',
                            // url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                            url: 'http://' + host + ':8055/tilecache/a.tile.osm.org/{z}/{x}/{y}.png',
                            layerOptions: {
                                //subdomains: ['a', 'b', 'c'],
                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                                continuousWorld: false
                            }
                        },
                        openseamap: {
                            name: 'OpenSeaMap',
                            type: 'xyz',
                            // http://c.tile.openstreetmap.org/{z}/{x}/{y}.png
                            url: 'http://' + host + ':8055/tilecache/tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
                            layerOptions: {
                                attribution: '&copy; OpenSeaMap contributors',
                            }
                        },
                        cycle: {
                            name: 'OpenCycleMap',
                            type: 'xyz',
                            url: 'http://' + host + ':8055/tilecache/a.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                            layerOptions: {
                                //subdomains: ['a', 'b', 'c'],
                                attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                continuousWorld: true
                            }
                        }
                    },
                    overlays: {
                        draw: {
                            name: 'draw',
                            type: 'group',
                            visible: true,
                            layerParams: {
                                showOnSelector: false
                            }
                        },
                        openseamap: {
                            name: 'OpenSeaMap',
                            type: 'xyz',
                            // http://c.tile.openstreetmap.org/{z}/{x}/{y}.png
                            url: 'http://' + host + ':8055/tilecache/t1.openseamap.org/seamark/{z}/{x}/{y}.png',
                            layerOptions: {
                                minZoom: 11,
                                maxZoom: 17,
                                attribution: '&copy; OpenSeaMap contributors',
                            }
                        },
                        openweathermap: {
                            name: 'OpenWeatherMap Clouds',
                            type: 'xyz',
                            url: 'http://' + host + ':8055/tilecache/a.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png',
                            layerOptions: {
                                attribution: '&copy; OpenWeatherMap',
                                continuousWorld: true,
                            }
                        },

                        hillshade: {
                            name: 'Hillshade Europa',
                            type: 'wms',
                            url: 'http://' + host + ':8055/tilecache/129.206.228.72/cached/hillshade',
                            visible: false,
                            layerOptions: {
                                layers: 'europe_wms:hs_srtm_europa',
                                format: 'image/png',
                                opacity: 0.25,
                                attribution: 'Hillshade layer by GIScience http://www.osm-wms.de',
                                crs: L.CRS.EPSG900913
                            }
                        },
                        fire: {
                            name: 'OpenFireMap',
                            type: 'xyz',
                            url: 'http://' + host + ':8055/tilecache/openfiremap.org/hytiles/{z}/{x}/{y}.png',
                            visible: false,
                            layerOptions: {
                                attribution: '&copy; <a href="http://www.openfiremap.org">OpenFireMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                continuousWorld: true
                            }
                        },
                        esriimagery: {
                            name: 'Satellite ESRI World Imagery',
                            type: 'xyz',
                            url: 'http://' + host + ':8055/tilecache/server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                            visible: false,
                            layerOptions: {
                                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                                continuousWorld: true,
                                opacity: 0.25
                            }
                        }
                    }
                }
            });

            var mapEvents = $scope.events.map.enable;

            for (var k in mapEvents) {
                var eventName = 'leafletDirectiveMap.' + mapEvents[k];
                $scope.$on(eventName, function (event) {
                    handleEvent(event);
                });
            }


            leafletData.getMap().then(function (map) {
                console.log('Setting up initial map settings.');
                map.setZoom(2);
                //map.panTo({lat: 52.513, lon: 13.41998});

                if (deviceinfo.type !== 'mobile') {
                    var Zoomslider = new L.Control.Zoomslider().addTo(map);
                    $('.leaflet-control-zoom').css('visibility', 'hidden');
                }

                var Terminator = terminator().addTo(map);
                var GraticuleOne = L.graticule({
                    style: {color: '#55A', weight: 1, dashArray: '.'},
                    interval: 1
                }).addTo(map);
                var MousePosition = L.control.mousePosition().addTo(map);
                var PanControl = L.control.pan().addTo(map);
                var courseplot = L.polyline([], {color: 'red'}).addTo(map);

                var togglefollow = L.easyButton({
                    id: 'btn_togglefollow',
                    states: [{
                        stateName: 'following',
                        icon: 'fa-eye',
                        onClick: function (control) {
                            $scope.follow = true;
                            control.state('static');
                        }
                    }, {
                        stateName: 'static',
                        icon: 'fa-eye-slash',
                        onClick: function (control) {
                            $scope.follow = false;
                            control.state('following');
                        }
                    }],
                    title: 'Toggle map following'
                });

                var togglesync = L.easyButton({
                    id: 'btn_togglesync',
                    states: [{
                        stateName: 'synchronized',
                        icon: 'fa-chain',
                        onClick: function (control) {
                            console.log('[MAP] Disabling synchronization');
                            $scope.sync = false;
                            control.state('unsynchronized');
                        }
                    }, {
                        stateName: 'unsynchronized',
                        icon: 'fa-chain-broken',
                        onClick: function (control) {
                            console.log('[MAP] Enabling synchronization');
                            $scope.sync = true;
                            control.state('synchronized');
                        }
                    }],
                    title: 'Toggle synchronization to ship'
                });

                var selectView = L.easyButton({
                    id: 'btn_selectview',
                    states: [{
                        stateName: 'select',
                        icon: 'fa-list-alt',
                        onClick: function (control) {
                            console.log('[MAP] Triggering view selection');
                            MapViewService.selectview();

                        }
                    }],
                    title: 'Select a view'
                });

                togglefollow.addTo(map);
                togglesync.addTo(map);
                selectView.addTo(map);

                console.log(togglefollow, togglesync, '########');

                L.RotatedMarker = L.Marker.extend({
                    options: {angle: 0},
                    _setPos: function (pos) {
                        L.Marker.prototype._setPos.call(this, pos);
                        if (L.DomUtil.TRANSFORM) {
                            // use the CSS transform rule if available
                            this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
                        } else if (L.Browser.ie) {
                            // fallback for IE6, IE7, IE8
                            var rad = this.options.angle * L.LatLng.DEG_TO_RAD,
                                costheta = Math.cos(rad),
                                sintheta = Math.sin(rad);
                            this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                                costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
                        }
                    }
                });

                L.rotatedMarker = function (pos, options) {
                    return new L.RotatedMarker(pos, options);
                };

                var Icons = {
                    Vessel: L.icon({
                        iconUrl: '/assets/images/icons/vessel.png',
                        //shadowUrl: 'leaf-shadow.png',

                        iconSize: [25, 25], // size of the icon
                        //shadowSize:   [50, 64], // size of the shadow
                        iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
                        //shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                    }),
                    VesselMoving: L.icon({
                        iconUrl: '/assets/images/icons/vessel-moving.png',
                        //shadowUrl: 'leaf-shadow.png',

                        iconSize: [25, 25], // size of the icon
                        //shadowSize:   [50, 64], // size of the shadow
                        iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
                        //shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                    }),
                    VesselStopped: L.icon({
                        iconUrl: '/assets/images/icons/vessel-stopped.png',
                        //shadowUrl: 'leaf-shadow.png',

                        iconSize: [25, 25], // size of the icon
                        //shadowSize:   [50, 64], // size of the shadow
                        iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
                        //shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                    })
                };

                console.log(L.rotatedMarker);
                var VesselMarker = L.rotatedMarker($scope.Vessel.coords, {icon: Icons.Vessel}).addTo(map);
                console.log(VesselMarker);

                leafletData.getLayers().then(function (baselayers) {
                    var drawnItems = baselayers.overlays.draw;
                    map.on('draw:created', function (e) {
                        var layer = e.layer;
                        drawnItems.addLayer(layer);

                        var geojson = layer.toGeoJSON();

                        console.log(geojson);

                        $scope.geojson = geojson;
                        socket.send(geojson);

                    });
                });
            })
            ;

            /*

             var map = L.map('map', {
             zoom: 16,
             maxZoom: 17,
             minZoom: 3,
             zoomControl: false,
             zoomsliderControl: true,
             contextmenu: true,
             contextmenuWidth: 200,
             contextmenuItems: [{
             text: 'Start new route',
             callback: startRoute
             }, {
             text: 'Close route',
             callback: closeRoute
             }, '-', {
             text: 'Center map on Vessel',
             callback: centerVessel
             }, {
             text: 'Center map here',
             callback: centerMap
             }, '-', {
             text: 'Zoom in',
             icon: '/assets/images/zoom-in.png',
             callback: zoomIn
             }, {
             text: 'Zoom out',
             icon: '/assets/images/zoom-out.png',
             callback: zoomOut
             }, {
             text: 'Zoom here',
             icon: '/assets/images/zoom-here.png',
             callback: zoomHere
             }]
             });

             var style = {color: 'red', opacity: 1.0, fillOpacity: 1.0, weight: 2, clickable: false};

             /*L.Control.FileLayerLoad.LABEL = '<i class='fa fa-folder-open filelayer-icon'></i>';
             L.Control.fileLayerLoad({
             fitBounds: true,
             layerOptions: {style: style,
             pointToLayer: function (data, latlng) {
             return L.circleMarker(latlng, {style: style});
             }},
             }).addTo(map);
             /**/
            /*
             function onMapClick(e) {
             if ($('#cb_identify').is(':checked')) {

             var popup = L.popup()
             .setLatLng(e.latlng)
             .setContent('Here is: ' + e.latlng.toString())
             .openOn(map);
             }
             }

             map.on('click', onMapClick);

             var VesselMarker = L.rotatedMarker(Coords, {icon: VesselIcon}).addTo(map);

             function update_show_vessels() {
             console.log('Toggling Show Vessels');

             if (!$('#cb_show_vessels').is(':checked')) {
             for (property in OSDMVessels) {

             var name = property;
             var marker = OSDMVessels[name].Marker;
             var plot = OSDMVessels[name].Plot;
             if (marker != false) {
             map.removeLayer(marker);
             }
             if (plot != false) map.removeLayer(plot);

             OSDMVessels[name].Marker = OSDMVessels[name].Plot = false;
             }
             } else {
             UpdateVessels();
             }
             }

             function update_show_radiorange() {
             console.log('Toggling Show Radiorange');

             if (!$('#cb_show_radiorange').is(':checked')) {
             for (property in OSDMVessels) {

             var name = property;
             var rangecircle = OSDMVessels[name].RangeDisplay;

             if (rangecircle != false) {
             map.removeLayer(rangecircle);
             OSDMVessels[name].RangeDisplay = false;
             }
             }
             map.removeLayer(RangeDisplay);
             RangeDisplay = false;
             } else {
             UpdateVessels();
             }
             }

             function UpdateVessels() {
             if ($('#cb_show_vessels').is(':checked')) {
             for (property in OSDMVessels) {

             name = property;
             coords = OSDMVessels[name].Coords;
             course = OSDMVessels[name].Course;
             speed = OSDMVessels[name].Speed;
             type = OSDMVessels[name].Type;
             radiorange = OSDMVessels[name].Range;

             var icon;

             //console.log('OSDMVESSELDISPLAY: ', type, name, ':',speed, '@', coords);

             if ($('#cb_show_radiorange').is(':checked')) {
             if (OSDMVessels[name].RangeDisplay == false) {
             var circle = L.circle(coords, radiorange, {
             color: '#6494BF',
             fillColor: '#4385BF',
             fillOpacity: 0.4
             }).addTo(map);
             OSDMVessels[name].RangeDisplay = circle;
             }
             }

             if (type == 'vessel') {
             if (speed > 0) {
             var dist = speed * (5 / 60);

             /* var target = [0,0];
             target[0] = Math.asin( Math.sin(coords[0])*Math.cos(d/R) + Math.cos(coords[0])*Math.sin(d/R)*Math.cos(course) );
             target[1] = coords[1] + Math.atan2(Math.sin(course)*Math.sin(d/R)*Math.cos(coords[0]), Math.cos(d/R)-Math.sin(coords[0])*Math.sin(target[0]));
             */
            /*

             var lat1 = Geo.parseDMS(coords[0]);
             var lon1 = Geo.parseDMS(coords[1]);
             var brng = Geo.parseDMS(course);


             // calculate destination point, final bearing
             var p1 = LatLon(lat1, lon1);
             var p2 = p1.destinationPoint(brng, dist);
             var brngFinal = p1.finalBearingTo(p2);

             //console.log('OSDMVESSELDISPLAY-ARROW: Distance travelled in 5 min:', dist, 'Coords: ', p1, ' Coords in 5 min:', p2, ' Final Bearing:', brngFinal);
             if (OSDMVessels[name].Plot == false) {
             OSDMVessels[name].Plot = L.polyline([p1, p2], {color: 'red'}).addTo(map);
             } else {
             OSDMVessels[name].Plot.setLatLngs([p1, p2]);
             }

             icon = VesselMovingIcon;

             } else {
             if (OSDMVessels[name].Plot != false) {
             map.removeLayer(OSDMVessels[name].Plot);
             OSDMVessels[name].Plot = false;
             }
             icon = VesselStoppedIcon;
             }
             } else if (type == 'lighthouse') {
             icon = LighthouseIcon;
             }

             if (OSDMVessels[name].Marker != false) {
             OSDMVessels[name].Marker.setLatLng(coords);
             OSDMVessels[name].Marker.options.angle = course;
             OSDMVessels[name].Marker.update();
             } else {
             OSDMVessels[name].Marker = marker = L.rotatedMarker(coords, {icon: icon}).addTo(map);
             OSDMVessels[name].Marker.options.angle = course;
             OSDMVessels[name].Marker.update();
             }
             }
             }
             }

             function UpdateMapMarker() {
             console.log('Getting current Vessel position');

             $.ajax({
             type: 'POST',
             url: 'logbook/latest',
             contentType: 'application/json',
             dataType: 'json',
             success: function (response) {
             Coords = response.coords;
             Course = response.course;
             console.log('Coords: ' + Coords + ' Course:' + Course);

             courseplot.addLatLng(Coords);
             plotted = courseplot.getLatLngs();

             if (plotted.length > 50) {
             courseplot.spliceLatLngs(0, 1);
             }

             VesselMarker.setLatLng(Coords);
             VesselMarker.options.angle = Course;
             VesselMarker.update();

             if ($('#cb_show_radiorange').is(':checked')) {
             if (RangeDisplay == false) {
             var circle = L.circle(Coords, Radiorange, {
             color: '#67BF64',
             fillColor: '#67BF64',
             fillOpacity: 0.4
             }).addTo(map);
             RangeDisplay = circle;
             }
             }


             }
             });

             if ($('#cb_follow').is(':checked')) {
             centerVessel();
             }
             }


             function Update() {
             if ($('#cb_update').is(':checked')) {
             UpdateMapMarker();
             UpdateVessels();
             }

             console.log(OSDMVessels);

             setTimeout(function () {
             Update();
             }, 3000);
             }

             $(document).ready(function () {
             Update();
             });
             };

             $scope.$on('$viewContentLoaded', function () {
             console.log('Fertig!');
             /* $scope.init($scope);
             $('#map').height($(window).height()-100).width($(window).width());
             $scope.map.invalidateSize(); */
        }]);
