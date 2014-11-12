// Class Map
//Constructor, it receives a json object with parameters
NHS.Scripts.CommunityResults.Map = function (mapParams) {
    // PRIVATE VARIABLES
    this._partnerId = mapParams.partnerID;
    this._brandPartnerId = mapParams.brandPartnerId;
    this._siteRoot = mapParams.siteRoot;
    this._communityPage = mapParams.communityPage;
    this._basicListingPage = mapParams.basicListingPage;
    this._resourceRoot = mapParams.resourceRoot;
    this._mapContainerId = mapParams.mapContainerId;
    this._searchMapAreaParagraphId = mapParams.searchMapAreaParagrapId;
    this._mapLoadingId = mapParams.mapLoadingId;
    this._mapTipBox = mapParams.mapTipBoxId;
    this._mapMaxResultsMsgId = mapParams.mapMaxResultsMsgId;
    this._mqZoom = null;
    this._maxResults = mapParams.maxResults;

    // Map size
    this._mapWidth = 488; // *** NOTE it needs to be changed 
    this._mapHeight = 300;

    this._mapCommsAction = mapParams.mapCommsAction;
    this._mapMarketsAction = mapParams.mapMarketsAction;
    this._mapStatesAction = mapParams.mapStatesAction;

    if (this._brandPartnerId == 333) {
        //move & move partners
        this._mqIconPath = this._resourceRoot + "globalresources/move/images/map/marker.gif";
        this._mqIconMultPath = this._resourceRoot + "globalresources/move/images/map/marker_multiple.gif";
        this._mqIconMktPath = this._resourceRoot + "globalresources/move/images/map/marker_market.gif";
    }
    else {
        //nhs & nhs partners
        this._mqIconPath = this._resourceRoot + "globalresources/default/images/map/marker.gif";
        this._mqIconMultPath = this._resourceRoot + "globalresources/default/images/map/marker_multiple.gif";
        this._mqIconMktPath = this._resourceRoot + "globalresources/default/images/map/mkt_icon.gif";
    }

    this._mqBLIconPath = this._resourceRoot + "globalresourcesmvc/default/images/map/marker_basic.png";

    this._mqIconShadowPath = this._resourceRoot + "globalresources/default/images/map/marker_shadow.png";

    this._viewOnMapLinkScript = mapParams.viewOnMapLinkScript;
    this._viewOnMapLinkScript = mapParams.viewOnMapLinkScript;
    this._freeBrochureLink = mapParams.freeBrochureLink;
    this._requestPromoLink = mapParams.requestPromoLink;
    this._requestAppointmentLink = mapParams.requestAppointmentLink;

    this._pageUrl = document.location.href;
    this._iteration = 0;
    this._isBeingShowed = false;
    this._updateMapFlag = true;
    this._updateResultsFlag = true;

    this._nhsMqMap = null;
    this._nhsMapIconShadow = null;
    this._mqOrigZoom = null;
    this._mqOrigCenter = null;
    this._mqCenter = null;
    this._mqIconOffset = null;
    this._nhsMapIconMult = null;
    this._mqIconMultOffset = null;
    this._nhsMapIcon = null;

    this._nhsMapIconMkt = null;
    this._mqIconMktOffset = null;

    this._mqMoveRefPoint = null;
    this._prevBrowserSize = null;

    this._searchParameters = mapParams.searchParams;

    this._mqMinLat = mapParams.mqMinLat;
    this._mqMinLng = mapParams.mqMinLng;
    this._mqMaxLat = mapParams.mqMaxLat;
    this._mqMaxLng = mapParams.mqMaxLng;

    this._mqCenterLat = mapParams.mqCenterLat;
    this._mqCenterLng = mapParams.mqCenterLng;
    this._mqZoomLevel = mapParams.mqZoomLevel;

    this._commResults = mapParams.commResults;

    this._log = this._commResults.get_log();
}


NHS.Scripts.CommunityResults.Map.prototype =
{
    // Properties 
    get_searchParameters: function () { return this._searchParameters; },
    set_searchParameters: function (params) { this._searchParameters = params; },
    get_log: function () { return this._log; },
    get_updateMapFlag: function (value) { this._updateMapFlag = value; },
    get_updateResultsFlag: function (value) { this._updateResultsFlag = value; },

    // Public Functions 
    // Initialize and Display Map function
    show: function () {
        if (!this._isBeingShowed) {
            // do stuff
            this._resizeMapDiv();
            //window.alert("Resize Div");

            this._mqZoom = this._mqZoomLevel
            this._mqOrigZoom = this._mqZoom;
            this._mqOrigCenter = new MQA.LatLng(this._mqCenterLat, this._mqCenterLng);
            this._mqCenter = this._mqOrigCenter;

            // Create the map object                      
            this._nhsMqMap = new MQA.TileMap(document.getElementById(this._mapContainerId), this._mqZoom, this._mqOrigCenter, 'map');
            //window.alert("Map Created");

            this._nhsMapIconShadow = new MQA.Icon(this._mqIconShadowPath, 0, 0);

            //Standard NHS Community Icon
            this._nhsMapIcon = new MQA.Icon(this._mqIconPath, 20, 26);
            //Basic Listing Icon
            this._nhsBLMapIcon = new MQA.Icon(this._mqBLIconPath, 14, 14);

            this._mqIconOffset = new MQA.Point(-10, -26);

            //NHS Multiple Community Icon
            this._nhsMapIconMult = new MQA.Icon(this._mqIconMultPath, 28, 28);
            this._mqIconMultOffset = new MQA.Point(-14, -28);
            // nhsMapIconMult.setInfoWindowAnchor(new MQA.Point(16,-1));

            //Market icon
            this._nhsMapIconMkt = new MQA.Icon(this._mqIconMktPath, 40, 37);
            this._mqIconMktOffset = new MQA.Point(-20, -37);

            this._mqMoveRefPoint = this._nhsMqMap.pixToLL(new MQA.Point(0, 0));

            var mqZoomControl = null;

            //Zoom Control
            //if (this._brandPartnerId == 333) {
            mqZoomControl = new MQA.ZoomControl();
            //} else {
            //    mqZoomControl = new MQA.LargeZoomControl();
            //}

            this._nhsMqMap.addControl(mqZoomControl, new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(10, 21)));

            this._setMapWindowCoordinates();

            // Hide search map area box if zoom level is less than market. 
            if (this.mqZoom < 7) {
                $jq('#' + this._searchMapAreaParagraphId).hide();
            }
            else {
                $jq('#' + this._searchMapAreaParagraphId).show();
            }

            // Capture the browser size and kick off the 
            // timer for checking browser size. 
            this._prevBrowserSize = this._getBrowserSize();

            this.browserResize();

            MQA.EventManager.addListener(this._nhsMqMap, "zoomEnd", (function (e) { this.get_log().logEvent('MAPZOOM', 0, 0); this._zoomEnd(e); }).bind(this));
            MQA.EventManager.addListener(this._nhsMqMap, "moveend", this._mapMoveEnd.bind(this));
            MQA.EventManager.addListener(this._nhsMqMap.getInfoWindow(), "opened", this._infoWindowOpen);
            MQA.EventManager.addListener(this._nhsMqMap.getInfoWindow(), "closed", this._infoWindowClose);
            MQA.EventManager.addListener(this._nhsMqMap.getRolloverWindow(), "opened", this._rolloverWindowOpen.bind(this));
            MQA.EventManager.addListener(this._nhsMqMap.getRolloverWindow(), "closed", this._rolloverWindowClose.bind(this));

            // Run script
            this._autoViewOnMapLink();

            this._displayMapTip();

        }
        else {
            //alert('Just update map');
            this._updateMapPoints();
        }

        // flag this function so we don't do the same thing twice
        this._isBeingShowed = true;
    },

    // Refresh the maps after make a facet s
    refresh: function () {
        var radius = 0;

        if (this._searchParameters.Radius >= 10)
            radius = 7;
        else if (this._searchParameters.Radius == 5)
            radius = 8;
        else if (this._searchParameters.Radius == 3)
            radius = 9;
        else if (this._searchParameters.Radius == 1)
            radius = 10;
        else {
            if (this._searchParameters.City != '' || this._searchParameters.CityNameFilter != '' || this._searchParameters.PostalCode != '')
                radius = 8;
            else
                radius = 7;
        }

        if (radius != this._nhsMqMap.getZoomLevel() || this._nhsMqMap.getCenter().getLatitude() != this._mqCenterLat) {
            this._updateResultsFlag = false;
            this.zoomToLatLng(this._mqCenterLat, this._mqCenterLng, radius);
            this._updateResultsFlag = true;
        }
        else
            this._updateMapPoints();
    },
    // Reset the map initial values
    resetSearchArea: function () {
        this._mqMinLat = 0;
        this._mqMinLng = 0;
        this._mqMaxLat = 0;
        this._mqMaxLng = 0;
    },

    //shows transient hover on community result hover
    viewCommunityOnMapOnHover: function (e, cid, bid) {
        if (this._nhsMqMap) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

            poiCollection = this._nhsMqMap.getShapes();
            keyToFind = "" + cid + bid;

            for (i = 0; i < poiCollection.getSize(); i++) {
                commPoi = poiCollection.getAt(i);

                if (commPoi.getKey().match(keyToFind) == keyToFind) {
                    commPoi.showRolloverWindow();
                    break;
                }
            }
        }
    },

    //hides transient hover on community result hover
    hideCommunityOnMapOnHover: function (e, cid, bid) {
        if (this._nhsMqMap) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

            poiCollection = this._nhsMqMap.getShapes();
            keyToFind = "" + cid + bid;

            for (i = 0; i < poiCollection.getSize(); i++) {
                commPoi = poiCollection.getAt(i);

                if (commPoi.getKey().match(keyToFind) == keyToFind) {
                    if (commPoi.mqrw) {
                        commPoi.mqrw.hide();
                    }
                    break;
                }
            }
        }
    },

    //shows transient hover
    viewCommunityOnMap: function (e, cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market, isBasicListing) {
        if (isBasicListing == 'true')
        this.get_log().logEvent('CRBLMD', cid, bid);
    else
        this.get_log().logEvent('VIEWMAP', cid, bid);
        

        // Ignore if Auto Centering
        if (this._viewOnMapLinkScript == "") {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        }

        if (!$jq('#nhs_CommResShowMap').is(".nhs_CommResShowMapOpen"))
            commResults.showMap();

        poiCollection = this._nhsMqMap.getShapes();
        keyToFind = "" + cid + bid;

        pointFound = false;

        for (i = 0; i < poiCollection.getSize(); i++) {
            commPoi = poiCollection.getAt(i);

            if (commPoi.getKey().match("mkey") == "mkey") {
                if (commPoi.getKey().match(keyToFind) == keyToFind) {
                    pointFound = true;

                    commPoiLatLng = commPoi.getLatLng();

                    this._nhsMqMap.panToLatLng(commPoiLatLng);

                    // Ignore if Auto Centering
                    if (this._viewOnMapLinkScript == "") {
                        commPoi.showRolloverWindow();
                    }

                    break;
                }
            }
            else if (commPoi.getKey() == keyToFind) {
                pointFound = true;

                commPoiLatLng = commPoi.getLatLng();

                this._nhsMqMap.panToLatLng(commPoiLatLng);

                // Ignore if Auto Centering
                if (this._viewOnMapLinkScript == "") {
                    commPoi.showRolloverWindow();
                }
                //commPoi.showInfoWindow();
                //updateMapFlag = false;
                break;
            }
        }

        if (!pointFound && this._nhsMqMap.getZoomLevel() >= 7) {
            commPoi = this._createCommPoi(cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market, null, null, isBasicListing);
            this._nhsMqMap.addShape(commPoi);

            commPoi.setValue('rolloverEnabled', true);
            //nhsMqcommResults.get_map().setCenter(commPoi.getLatLng());

            commPoiLatLng = commPoi.getLatLng();

            this._nhsMqMap.panToLatLng(commPoiLatLng);

            // Ignore if Auto Centering
            if (this._viewOnMapLinkScript == "") {
                commPoi.showRolloverWindow();
            }
            //commPoi.showInfoWindow();
            this._setMapWindowCoordinates();
            //updateMapFlag = false;
        }
        else if (!pointFound && this._nhsMqMap.getZoomLevel() < 7) {
            commPoi = this._createCommPoi(cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market, null, null, isBasicListing);
            this._updateResultsFlag = false;
            this._nhsMqMap.setZoomLevel(7);

            commPoiLatLng = commPoi.getLatLng();
            this._nhsMqMap.panToLatLng(commPoiLatLng);

            commPoi.setValue('rolloverEnabled', true);

            this._nhsMqMap.addShape(commPoi);

            // Ignore if Auto Centering
            if (this._viewOnMapLinkScript == "") {
                commPoi.showRolloverWindow();
            }

            this._setMapWindowCoordinates();
            this._updateResultsFlag = true;
        }
    },

    // Zoom to communties level when u are at market level or state level
    zoomToLatLng: function (lat, lng, zoomLevel) {
        this._updateResultsFlag = false;
        this._nhsMqMap.setCenter(new MQA.LatLng(lat, lng));
        this._nhsMqMap.setZoomLevel(zoomLevel);
        this._updateResultsFlag = true;
    },

    // Zoom to the community detaul level u are at communities level 
    zoomToLatLngBC: function (lat, lng, zoomLevel, cid, bid) {
        this._updateResultsFlag = false;
        this._nhsMqMap.setCenter(new MQA.LatLng(lat, lng));
        this._nhsMqMap.setZoomLevel(zoomLevel);
        this.get_log.logEvent("HOVZOOM", cid, bid);
        this._updateResultsFlag = true;
    },

    // *** NOTE: check if it is still needed 
    _updateIFrameAd: function (adPosition, adSrc) {
        var adId = "nhsIFrameAd" + adPosition;
        var adElement = document.getElementById(adId);

        if (adElement && (adElement.style.display != 'none')) //check if adBlock is hiding iframe
        {
            //alert("Updating " + adId + " source:\n" + "Current: \n" + adElement.src + "\nNew: \n" + adSrc);
            adElement.src = adSrc;
        }
    },

    // Resize the map container Div
    _resizeMapDiv: function () {
        var newMapSize = this._getMapSize();

        $jq('#' + this._mapContainerId).width(newMapSize.getWidth());
        $jq('#' + this._mapContainerId).height(newMapSize.getHeight());
    },

    // Set the map global variables based in the current zoom or location
    _setMapWindowCoordinates: function () {
        var mpSize = this._getMapSize();
        var topLeftLL = this._nhsMqMap.pixToLL(new MQA.Point(0, 0));
        var bottomRightLL = this._nhsMqMap.pixToLL(new MQA.Point(mpSize.getWidth(), mpSize.getHeight()));

        // Set the hidden form values to the current map window coordinates. 
        this._mqMinLat = topLeftLL.getLatitude();
        this._mqMinLng = topLeftLL.getLongitude();
        this._mqMaxLat = bottomRightLL.getLatitude();
        this._mqMaxLng = bottomRightLL.getLongitude();
        this._mqCenterLat = this._nhsMqMap.getCenter().getLatitude();
        this._mqCenterLng = this._nhsMqMap.getCenter().getLongitude();
        this._mqZoomLevel = this._nhsMqMap.getZoomLevel();
    },

    // Set the search parameters upper and bottom cordinates values to match the map results with the list results
    updateResults: function () {

        this._searchParameters.MinLatitude = this._mqMaxLat;
        this._searchParameters.MinLongitude = this._mqMinLng;
        this._searchParameters.MaxLatitude = this._mqMinLat;
        this._searchParameters.MaxLongitude = this._mqMaxLng;
        this._commResults.saveSearchState();

        this.get_log().logEvent('MAPUPD', 0, 0);

        this._commResults.updateResults();
    },

    // Resize map sizes when browser is resized
    browserResize: function () {
        var newBrowserSize = this._getBrowserSize();

        if (this._prevBrowserSize.getWidth() != newBrowserSize.getWidth() ||
            this._prevBrowserSize.getHeight() != newBrowserSize.getHeight()) {
            this._resizeMap();
        }

        this._prevBrowserSize = newBrowserSize;
        var x = setTimeout("commResults.get_map().browserResize()", 250);
    },

    //Resize Map quest div
    _resizeMap: function () {
        var newMapSize = this._getMapSize();
        this._nhsMqMap.setSize(newMapSize);
        $jq('#' + this._mapContainerId).width(newMapSize.getWidth());
        $jq('#' + this._mapContainerId).height(newMapSize.getHeight());
    },

    // Calculate the maps size based in the space left in the results
    _getMapSize: function () {
        var mapWidth = this._mapWidth;
        var mapHeight = this._mapHeight;

        return new MQA.Size(mapWidth, mapHeight);
    },

    // Current Browser Size
    _getBrowserSize: function () {
        var size = new MQA.Size(0, 0);

        if (document.body.scrollHeight > document.body.offsetHeight) {
            size.width = document.body.scrollWidth;
            size.height = document.body.scrollHeight;
        }
        else {
            size.width = document.body.offsetWidth;
            size.height = document.body.offsetHeight;
        }
        if (document.body.clientWidth) {
            size.width = document.body.clientWidth;
            size.height = document.body.clientHeight;
        }
        else {
            size.width = document.body.offsetWidth;
            size.height = document.body.offsetHeight;
        }
        if (document.documentElement.clientWidth) {
            size.width = document.documentElement.clientWidth;
            size.height = document.documentElement.clientHeight;
        }
        if (self.innerWidth) {
            size.width = self.innerWidth; size.height = self.innerHeight;
        }

        return size;
    },

    // Render the poi data into the mapquest map and update "updating..." status
    _renderPoiCollection: function (poiCollection) {
        if (this._mqZoom < 7 || poiCollection.getSize() == 0)
            $jq('#' + this._searchMapAreaParagraphId).hide();
        else
            $jq('#' + this._searchMapAreaParagraphId).show();

        this._nhsMqMap.replaceShapes(poiCollection);

        this._hideMapStatus();
    },

    // On Map move event function
    _mapMoveEnd: function (e) {
        if (this._updateMapFlag) {
            this.get_log().logEvent('MAPDRAG', 0, 0);

            this._showMapStatus();
            this._setMapWindowCoordinates();
            this._updateMapPoints();

            if (this._updateResultsFlag)
                this.updateResults();
        }
    },

    // On Map zoom event function
    _zoomEnd: function (e) {
        //Log Zoom in/out
        if (e.zoom < 7) {
            $jq('#' + this._searchMapAreaParagraphId).hide();
        }
        else {
            $jq('#' + this._searchMapAreaParagraphId).show();
        }

        this._setMapWindowCoordinates();
        this._updateMapPoints();

        if (this._updateResultsFlag)
            this.updateResults();
    },

    // When the comm marker is clicked, log the information
    _infoWindowOpen: function (e) {
        commResults.get_map().get_updateMapFlag(false);
        commResults.get_map().get_log().logEvent('MAPCLICK', 0, 0);
        tb_init('.nhs_CommResHoverBox a.thickbox, .nhs_MultiHoverBox a.thickbox');
    },

    // When the comm marker is closed
    _infoWindowClose: function (e) {
        commResults.get_map().get_updateMapFlag(true);
    },

    _rolloverWindowOpen: function (e) {
        this._updateMapFlag = false;
    },

    _rolloverWindowClose: function (e) {
        this._updateMapFlag = true;
    },

    _autoViewOnMapLink: function () {
        if (this._viewOnMapLinkScript != "") {
            eval(this._viewOnMapLinkScript);
            this._hideMapStatus();
        }
    },

    _hideMapStatus: function () {
        $jq('#' + this._mapLoadingId).hide();
    },

    _showMapStatus: function () {
        $jq('#' + this._mapLoadingId).show();
    },

    // Update the map points when there are a facet change or a map location change 
    _updateMapPoints: function () {
        var minLat = this._mqMinLat;
        var minLng = this._mqMinLng;
        var maxLat = this._mqMaxLat;
        var maxLng = this._mqMaxLng;
        var maxResults = this._maxResults;

        this._showMapStatus();

        var currentZoom = this._nhsMqMap.getZoomLevel();

        if (currentZoom < 4) {
            this._getStateMapPois(minLat, minLng, maxLat, maxLng);
        }
        else {
            if (currentZoom < 7) {
                this._getMarketMapPois(minLat, minLng, maxLat, maxLng);
            }
            else {
                this._getCommMapPois(this._searchParameters, minLat, minLng, maxLat, maxLng, maxResults);
            }
        }
    },

    // Get points for community level calling the map controller
    _getCommMapPois: function (xmlSearchParams, minLat, minLng, maxLat, maxLng, maxResults) {
        $jq.ajax({ url: this._mapCommsAction, data: { searchParameters: NHS.Scripts.Helper.JSON.toString(xmlSearchParams), minLat: this._mqMinLat, minLng: this._mqMinLng, maxLat: this._mqMaxLat, maxLng: this._mqMaxLng, maxResults: maxResults }, success: this._onCommPoiSuccess.bind(this) });
    },

    // Get points for market level calling the map controller
    _getMarketMapPois: function (minLat, minLng, maxLat, maxLng) {
        $jq.ajax({ url: this._mapMarketsAction, data: { partnerId: this._partnerId, minLat: this._mqMinLat, minLng: this._mqMinLng, maxLat: this._mqMaxLat, maxLng: this._mqMaxLng }, success: this._onMarketPoiSuccess.bind(this) });
    },

    // Get points for state level calling the map controller
    _getStateMapPois: function (minLat, minLng, maxLat, maxLng) {
        $jq.ajax({ url: this._mapStatesAction, data: { partnerId: this._partnerId, minLat: this._mqMinLat, minLng: this._mqMinLng, maxLat: this._mqMaxLat, maxLng: this._mqMaxLng }, success: this._onStatePoiSuccess.bind(this) });
    },


    // After get the market points render the points into the map
    _onMarketPoiSuccess: function (result) {

        var mqPoiCollection = new MQA.ShapeCollection();

        result = eval(result);

        for (i in result) {
            var id = result[i].Id;
            var lat = result[i].Lat;
            var lng = result[i].Lng;
            var title = result[i].Title;
            var content = result[i].Content;

            var contentHtml = "<div class=\"nhsCommResHoverMarket\">";
            contentHtml += "<a href=\"javascript:void(0);\" onclick=\"commResults.get_map().zoomToLatLng(" + lat + "," + lng + ",7);\">View Communities in " + content + "</a>";
            contentHtml += "</div>";

            var mqPointLatLng = new MQA.LatLng(lat, lng);
            var mqPoint = new MQA.Poi(mqPointLatLng, this._nhsMapIconMkt);
            mqPoint.setValue('iconOffset', this._mqIconMktOffset);
            mqPoint.setValue('shadow', this._nhsMapIconShadow);
            mqPoint.setValue('infoTitleHTML', "<strong>" + title + "</strong>");
            mqPoint.setValue('infoContentHTML', contentHtml);
            mqPoint.setValue('key', id);

            mqPoiCollection.add(mqPoint);
        }

        this._renderPoiCollection(mqPoiCollection);
    },

    // After get the state points render the points into the map
    _onStatePoiSuccess: function (result) {

        var mqPoiCollection = new MQA.ShapeCollection();

        result = eval(result);

        for (i in result) {
            var lat = result[i].Lat;
            var lng = result[i].Lng;
            var stateName = result[i].StateName;
            var totalCommunities = result[i].TotalCommunities;

            var contentHtml = "<div class=\"nhsCommResHoverState\">";
            contentHtml += "<a href=\"javascript:void(0);\" onclick=\"commResults.get_map().zoomToLatLng(" + lat + "," + lng + ",4);\">View Markets in " + stateName + "</a>";
            contentHtml += "</div>";

            var mqPointLatLng = new MQA.LatLng(lat, lng);
            var mqPoint = new MQA.Poi(mqPointLatLng, this._nhsMapIconMkt);
            mqPoint.setValue('iconOffset', this._mqIconMktOffset);
            mqPoint.setValue('shadow', this._nhsMapIconShadow);
            mqPoint.setValue('infoTitleHTML', "<strong>" + stateName + " (" + totalCommunities + " communities)</strong>");
            mqPoint.setValue('infoContentHTML', contentHtml);
            mqPoint.setValue('key', stateName);

            mqPoiCollection.add(mqPoint);
        }

        this._renderPoiCollection(mqPoiCollection);

        this._commResults.hideProgressIndicator();

    },

    // After get the community points render the points into the map
    _onCommPoiSuccess: function (result) {
        // Ignore if there is a View On Map Link Script
        if (this._viewOnMapLinkScript == "") {
            var mqPoiCollection = this._buildCommPois(result);

            var total = eval(result)[0];
            if (total > this._maxResults)
                this._displayMapMaxResultsMsg(mqPoiCollection.getSize());

            this._renderPoiCollection(mqPoiCollection);

            this._commResults.hideProgressIndicator();
        }
        else {
            // Reset
            this._viewOnMapLinkScript = "";
        }
    },

    // Build  the community points based on some logic when there are more than 1 comm at the same location
    _buildCommPois: function (commArray) {
        var commPois = new MQA.ShapeCollection();

        commArray = eval(commArray);
        var dedupArray = [];
        var temporaryArray = [].concat(commArray);

        var commArrayLength = commArray.length - 1;

        // comparing comm array and de-dup array
        for (i = commArrayLength - 1; i > 0; i--) {
            var ary = commArray[i].split(";");

            var cid = ary[0];
            var bid = ary[1];
            var lat = ary[13];
            var lng = ary[14];
            var tempNode = "";

            var totalMatch = 1;

            var temporaryArrayLength = temporaryArray.length;


            for (j = temporaryArrayLength - 1; j > 0; j--) {
                var tAry = temporaryArray[j].split(";");
                var tCid = tAry[0];
                var tBid = tAry[1];
                var tLat = tAry[13];
                var tLng = tAry[14];

                // if exact Lat-Long and not same Key                
                if (tLat == lat && tLng == lng) {
                    // increase match # and key, remove matching Poi
                    totalMatch++;
                    tempNode += temporaryArray[j];
                    temporaryArray.splice(j, 1);
                }
            }
            //tempNode += tempArray[i];
            temporaryArray.splice(i, 1);
            if (tempNode != "") {
                dedupArray.push(tempNode);
            }
        }
        //alert("Comm Array: " + commArray.length);
        //alert("DeDup Array: " + dedupArray.length);
        dedupArray.reverse();
        commArray = dedupArray;
        commArrayLength = commArray.length;

        // create Pois and add to PoiCollection
        for (i = 0; i < commArrayLength; i++) {
            var cAry = commArray[i].split(";");
            var cAryLength = cAry.length;

            if (cAryLength == 18) {
                var cid = cAry[0];
                var bid = cAry[1];
                var name = cAry[2];
                var cty = cAry[3];
                var st = cAry[4];
                var zip = cAry[5];
                var img = cAry[6];
                var brandimg = cAry[7];
                var price = cAry[8];
                var brand = cAry[9];
                var matches = cAry[10];
                var promoid = cAry[11];
                var type = cAry[12];
                var lat = cAry[13];
                var lng = cAry[14];
                var market = cAry[15];
                var isBasicListing = cAry[16] == "True";
                var isGreen = false; //cAry[16];
                var isHotHome = false; //cAry[17];

                var commPoint = this._createCommPoi(cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market, isGreen, isHotHome, isBasicListing);

            }
            else if (cAryLength > 18) {
                var commNumber = ((cAryLength - 1) / 17);
                var key = "mkey"; // multipoi key

                var contentHtml = new Array();

                contentHtml.push("<div class=\"nhs_MultiHoverBox\">");

                var isBasicListing = false;
                var basicListingCount = 0;

                for (j = 0; j < commNumber; j++) {
                    var k = 17 * j;
                    var cid = cAry[(0 + k)];
                    var bid = cAry[(1 + k)];
                    var name = cAry[(2 + k)];
                    var cty = cAry[(3 + k)];
                    var st = cAry[(4 + k)];
                    var zip = cAry[(5 + k)];
                    var img = cAry[(6 + k)];
                    var brandimg = cAry[(7 + k)];
                    var price = cAry[(8 + k)];
                    var brand = cAry[(9 + k)];
                    var matches = cAry[(10 + k)];
                    var promoid = cAry[(11 + k)]; //not used
                    var type = cAry[(12 + k)]; //not used
                    var lat = cAry[(13 + k)];
                    var lng = cAry[(14 + k)];
                    var market = cAry[(15 + k)];
                    var isBasicListing = cAry[(16 + k)] == "True";

                    if (isBasicListing) basicListingCount++;

                    key += "_" + cid + bid;

                    contentHtml.push("<div class=\"nhs_MultiHoverRow\">");

                    if (img == "N" || img == "n" || img == "") {
                        if (isBasicListing) {
                            img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_75x58.png";
                        }
                        else {
                            img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_sm.png";
                        }
                    }
                    else {
                        img = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + img; //remove trailing slash
                    }

                    var basicHomeUrl = this._siteRoot + this._basicListingPage + "/" + cid + "/" + (name + "-" + cty + "-" + st + "-" + zip).replace(' ', '-').trim();
                    var communityUrl = this._siteRoot + this._communityPage + "/community-" + cid + "/builder-" + bid;

                    var detailsUrl = isBasicListing ? basicHomeUrl : communityUrl;

                    var basicHomeLog = " onclick=\"commResults.get_map().get_log().logBasicListingAndRedirect(event,'" + detailsUrl + "', 'CRBLMD'," + cid + "); return false;\">";
                    var communityLog = " onclick=\"commResults.get_map().get_log().logAndRedirect(event,'" + detailsUrl + "/" + "logevent-HOVNAME', 'HOVNAME', " + cid + "," + bid + "); return false;\">";

                    var detailsLog = isBasicListing ? basicHomeLog : communityLog;

                    contentHtml.push("<div class=\"nhs_ResultsThumb\"><a ");
                    contentHtml.push(detailsLog);
                    contentHtml.push("<img src=\"");
                    contentHtml.push(img);
                    contentHtml.push("\" alt=\"");
                    contentHtml.push(name);
                    contentHtml.push("\" />");
                    contentHtml.push("</a></div>");

                    contentHtml.push("<h3><a ");
                    contentHtml.push(detailsLog);
                    contentHtml.push(name);
                    contentHtml.push("</a></h3>");

                    if (!isBasicListing) {
                        contentHtml.push("<p class=\"nhs_ResultsBuilder\">by ");
                        contentHtml.push(brand);
                        contentHtml.push("</p>");
                    }


                    if (price != "$ - $") {
                        contentHtml.push("<p class=\"nhs_ResultsPrice\">" + (!isBasicListing ? "from " : ""));

                        if (isBasicListing)
                            contentHtml.push(price.substring(0, price.indexOf(" - ")));
                        else
                            contentHtml.push(price);

                        contentHtml.push("</p>");
                    }

                    if (!isBasicListing) {
                        var reqInfoLink = this._freeBrochureLink.replace("-text-", "Free brochure").replace("-commid-", cid).replace("-builderid-", bid).replace("-marketid-", market).replace("-logEvent-", 'HOVFBROCH');
                        contentHtml.push("<p>" + reqInfoLink + "</p>");
                    }


                    contentHtml.push("<br style=\"clear: both;\" />");

                    contentHtml.push("</div>");
                }

                if (commNumber > 2) {
                    contentHtml.push("</div></div>");
                }
                else {
                    contentHtml.push("</div>");
                }

                isBasicListing = basicListingCount == commNumber;

                var contentHtmlString = contentHtml.join("");

                commPoint = this._createMultiCommPoi(commNumber, key, contentHtmlString, lat, lng, isBasicListing);
            }
            commPois.add(commPoint);
        }
        return commPois;
    },

    // Create a single community point
    _createCommPoi: function (cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market, isGreen, isHotHome, isBasicListing) {
        var typeImg = "";
        var typeAlt = "";
        var thereAreIcons = false;
        var currentZoom = this._nhsMqMap.getZoomLevel();

        // if (type == "comingsoon") { typeImg = this._resourceRoot + "GlobalResourcesMvc/Default/images/icons/icon_coming_soon.png"; typeAlt = "Coming Soon"; }
        //  if (type == "grandopening") { typeImg = this._resourceRoot + "GlobalResourcesMvc/Default/images/icons/icon_grand_opening.png"; typeAlt = "Grand Opening"; }
        // if (type == "closeout") { typeImg = this._resourceRoot + "GlobalResourcesMvc/Default/images/icons/icon_closeout.png"; typeAlt = "Closeout"; }

        if (img == "N" || img == "n" || img == "") {
            if (isBasicListing) {
                img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_75x58.png";
            }
            else {
                img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_sm.png";
            }
        }
        else {
            img = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + img; //remove trailing slash
        }

        var contentHtml = new Array();

        var basicHomeUrl = this._siteRoot + this._basicListingPage + "/" + cid + "/" + (name + "-" + cty + "-" + st + "-" + zip).replace(' ', '-').trim();
        var communityUrl = this._siteRoot + this._communityPage + "/community-" + cid + "/builder-" + bid;

        var detailsUrl = isBasicListing ? basicHomeUrl : communityUrl;

        var basicHomeLog = " onclick=\"commResults.get_map().get_log().logBasicListingAndRedirect(event,'" + detailsUrl + "', 'CRBLMD'," + cid + "); return false;\">";
        var communityLog = " onclick=\"commResults.get_map().get_log().logAndRedirect(event,'" + detailsUrl + "/" + "logevent-HOVNAME', 'HOVNAME', " + cid + "," + bid + "); return false;\">";

        var detailsLog = isBasicListing ? basicHomeLog : communityLog;

        if (isBasicListing) {
            contentHtml.push("<div class=\"nhs_CommResHoverBox nhs_BasicHoverBox\">");
        }
        else {
            contentHtml.push("<div class=\"nhs_CommResHoverBox\">");
        }
        contentHtml.push("<div class=\"nhs_ResultsThumb\"><a ");
        contentHtml.push(detailsLog);
        contentHtml.push("<img src=\"" + img);
        contentHtml.push("\" alt=\"");
        contentHtml.push(name);
        contentHtml.push("\" /></a></div>");

        contentHtml.push("<h3><a ");
        contentHtml.push(detailsLog);
        contentHtml.push(name);
        contentHtml.push("</a></h3>");

        if (!isBasicListing) {
            contentHtml.push("<p class=\"nhs_ResultsBuilder\">by ");
            contentHtml.push(brand);
            contentHtml.push("</p>");
        }

        if (price != "$ - $" && price != "") {
            contentHtml.push("<p class=\"nhs_ResultsPrice\">" + (!isBasicListing ? "from " : ""));

            if (isBasicListing)
                contentHtml.push(price.substring(0, price.indexOf(" - ")));
            else
                contentHtml.push(price);

            contentHtml.push("</p>");
        }

        contentHtml.push("<p class=\"nhs_ResultsLink\"><a ");
        contentHtml.push(detailsLog);
        contentHtml.push((isBasicListing ? "View Details" : "See new homes, <br />photos and floor plans") + "</a>");

        contentHtml.push("</p>");

        if (!isBasicListing) {
            var reqInfoLink = this._freeBrochureLink.replace("-text-", "Free brochure").replace("-commid-", cid).replace("-builderid-", bid).replace("-marketid-", market).replace("-logEvent-", 'HOVFBROCH');
            contentHtml.push("<p>" + reqInfoLink + "</p>");
        }

        contentHtml.push("</div>");

        var contentHtmlString = contentHtml.join("");

        var mqPointLatLng = new MQA.LatLng(lat, lng);

        mqPoint = new MQA.Poi(mqPointLatLng, isBasicListing ? this._nhsBLMapIcon : this._nhsMapIcon);

        mqPoint.setValue('iconOffset', this._mqIconOffset);
        mqPoint.setValue('shadow', this._nhsMapIconShadow);
        mqPoint.setValue('infoTitleHTML', "<strong>" + name + "</strong>");
        mqPoint.setValue('infoContentHTML', contentHtmlString);
        mqPoint.setValue('key', cid + bid);
        mqPoint.setValue('onclick', "alert('onclick')");
        return mqPoint;
    },

    // Create a multi community point when there are more than one community at the same location
    _createMultiCommPoi: function (numberComms, key, contentHtml, lat, lng, isBasicListing) {
        //contentHtml = "Test Info";
        var mqPointLatLng = new MQA.LatLng(lat, lng);
        mqPoint = new MQA.Poi(mqPointLatLng, isBasicListing ? this._nhsBLMapIcon : this._nhsMapIconMult);
        mqPoint.setValue('iconOffset', isBasicListing ? this._mqIconOffset : this._mqIconMultOffset);
        mqPoint.setValue('shadow', this._nhsMapIconShadow);
        mqPoint.setValue('infoTitleHTML', "<strong>" + numberComms + " communities</strong>");
        mqPoint.setValue('infoContentHTML', contentHtml);
        mqPoint.setValue('key', key);

        return mqPoint;
    },

    // Check cookies and display map tip    
    _displayMapTip: function () {
        $jq('#' + this._mapTipBox).css('left', (($jq('#' + this._mapContainerId).width() / 2) - ($jq('#' + this._mapTipBox).width() / 2)) + "px");
        $jq('#' + this._mapTipBox).show('medium');
        $jq('#' + this._mapContainerId).mouseenter((function () { if ($jq('#' + this._mapTipBox).is(':visible')) $jq('#' + this._mapTipBox).hide('medium'); }).bind(this));
    },

    // Check cookies and display map tip    
    _displayMapMaxResultsMsg: function (pinsCount) {
        $jq('#' + this._mapMaxResultsMsgId).show('medium');
        $jq('#' + this._mapMaxResultsMsgId + " p").text($jq('#' + this._mapMaxResultsMsgId + " p").text().replace('[pincount]', pinsCount));
        setTimeout((function () { $jq('#' + this._mapMaxResultsMsgId).hide('medium'); }).bind(this), 4000);
    }

};
