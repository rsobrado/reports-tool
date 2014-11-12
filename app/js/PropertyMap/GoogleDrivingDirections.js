// Global Class for Community Detail Page
NHS.Scripts.GoogleDrivingDirections = function (parameters) {

    this.parameters = parameters;
};

NHS.Scripts.GoogleDrivingDirections.prototype =
{
    init: function () {

        var self = this;
        var parameters = self.parameters;
        var mapOptions = this.parameters.OptionsForMap;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);
       
        var end = new google.maps.LatLng(parameters.endLat, parameters.endLng);
        var start = new google.maps.LatLng(parameters.startLat, parameters.startLng);
        googleApi.createMap();
        googleApi.initializeDrivingDirections(start, end);
    }   
};
