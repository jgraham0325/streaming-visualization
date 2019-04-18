const maxNumPoints = 5000;

var map = setupBaseMap(lat, lng, zoom);
var markersForClusterLayer = [];
var pruneClusterLayer = new PruneClusterForLeaflet();
var heatLayer = L.heatLayer([]).addTo(map);
registerWebSocketListeners(io());

heatLayer._latlngs.push = function () {
    if (this.length >= maxNumPoints) {
        this.shift();
    }
    return Array.prototype.push.apply(this, arguments);
};

markersForClusterLayer.push = function () {
    if (this.length >= maxNumPoints) {
        var markerToRemove = markersForClusterLayer.shift();
        pruneClusterLayer.RemoveMarkers([markerToRemove])
    }
    return Array.prototype.push.apply(this, arguments);
};

var overlayMaps = {
    "Heat": heatLayer,
    "Points": pruneClusterLayer
};

L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);



function setupBaseMap(lat, lng, zoom) {
    //variables may have been passed in from URL, otherwise default to view of UK
    var map = L.map('map').setView([lat ? lat : 52.777814, lng ? lng : -3.430458], zoom ? zoom : 5);

    L.streetView({position: 'topleft'}).addTo(map);

    var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //clear points (markers) button
    L.easyButton('fas fa-trash-alt', function(btn, map){
        if (heatLayer._map != null) {
            heatLayer.setLatLngs([]);
            heatLayer.redraw();
        }
        pruneClusterLayer.RemoveMarkers(markersForClusterLayer);
        markersForClusterLayer = [];
        pruneClusterLayer.ProcessView();
    }, "Clear points").addTo( map );

    return map;
}

function create_UUID() {
    var dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function addHighRiskTransactionMarker(coord) {
    var latlng = L.latLng(coord.lat, coord.lng);
    var marker = createMarker(latlng);

    if (heatLayer._map != null) heatLayer.addLatLng(latlng);

    markersForClusterLayer.push(marker)
    pruneClusterLayer.RegisterMarker(marker)
    pruneClusterLayer.ProcessView();

}

function createMarker(latlng) {

    var popup = "<b>Transaction ID:<br/></b>" + create_UUID() + "<br/>"
                + "<b>Position: </b>" + latlng.lat + ", " + latlng.lng + "<br/>"
                + "<b>Risk classification: </b>High risk (95)<br/>"
                + "<a class='btn btn-outline-primary btn-sm' target='_blank' href='https://www.google.com/maps?layer=c&cbll="
                + latlng.lat + "," + latlng.lng + "'>Open streetview</a>"
    var redIcon = new L.Icon({
                                 iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                 iconSize: [25, 41],
                                 iconAnchor: [12, 41],
                                 popupAnchor: [1, -34],
                                 shadowSize: [41, 41]
                             });
    var marker = new PruneCluster.Marker(latlng.lat, latlng.lng);
    marker.data.icon = redIcon
    marker.data.popup = popup
    return marker;
}

function registerWebSocketListeners(socket) {
    socket.on('message', function (coord) {
        addHighRiskTransactionMarker(coord)
    });

    socket.on('history', function (coords) {
        coords.forEach(function (coord) {
            addHighRiskTransactionMarker(coord)
        });
    });
}