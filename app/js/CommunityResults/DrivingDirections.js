//NameSpace Declaration
var NHS = { Scripts: { CommunityResults: {}} };


//class declaration 
//constructor
NHS.Scripts.CommunityResults.DrivingDirections = function (ddParams) {

    this._partnerId = ddParams.PartnerID;
    this._mapContainer = ddParams.MapContainer;

};


//class definition
NHS.Scripts.CommunityResults.DrivingDirections.prototype = {

//method in a class
  ResizeMap : function()
    {
        newMapSize = getMapSize();           
        nhsMqMap.setSize(newMapSize);
        this._mapContainer.style.width = newMapSize.getWidth() + "px";
        this._mapContainer.style.height = newMapSize.getHeight() + "px";
    }



}