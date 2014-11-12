var geoExec;
var mapExec;
var isMapLoaded;
var mapRef;
// Class Map
//Constructor, it receives a json object with parameters
NHS.Scripts.PropertyMap.Map = function (mapParams) {
    this._nhsMqMap = "";

    this.mapZoom = mapParams.mapZoom ? mapParams.mapZoom : 7;
    var proxyServerName = "";
    var proxyServerPort = "";
    var proxyServerPath = "";

    var routeServerName = "route.access.mapquest.com";
    var routeServerPort = "80";
    var routeServerPath = "mq";

    var geoServerName = "geocode.access.mapquest.com";
    var geoServerPort = "80";
    var geoServerPath = "mq";

    var mapServerName = "map.access.mapquest.com";
    var mapServerPort = "80";
    var mapServerPath = "mq";

    this._siteRoot = mapParams.siteRoot;
    this._brandPartnerId = mapParams.brandPartnerId;
    this._propertyDetailAction = mapParams.propertyDetailAction;
    this._resourceRoot = mapParams.resourceRoot;

    this._mqIconShadowPath = this._resourceRoot + "globalresources/default/images/map/marker_shadow.png";

    if (this._brandPartnerId == 333) {
        //move & move partners
        this._mqIconPath = this._resourceRoot + "globalResources/move/images/map/marker.gif";
        this._mqMainIconPath = this._resourceRoot + "globalResourcesMvc/default/images/icons/star_red.png";
        this._mqIconMultPath = this._resourceRoot + "globalresources/move/images/map/marker_multiple.gif";
    } else {
        //nhs & nhs partners
        this._mqIconPath = this._resourceRoot + "globalResources/default/images/map/marker.gif";
        this._mqMainIconPath = this._resourceRoot + "globalResourcesMvc/default/images/icons/star_red.png";
        this._mqIconMultPath = this._resourceRoot + "globalresources/default/images/map/marker_multiple.gif";
    }

    this._mqIconShadowPath = this._resourceRoot + "globalresources/default/images/map/marker_shadow.png";

    this._freeBrochureLink = mapParams.freeBrochureLink;

    proxyServerPath = mapParams.proxyServerPath;

    routeExec = new MQExec(routeServerName, routeServerPath, routeServerPort, proxyServerName, proxyServerPath, proxyServerPort);

    mapExec = new MQExec(mapServerName, mapServerPath, mapServerPort, proxyServerName, proxyServerPath, proxyServerPort);

    geoExec = new MQExec(geoServerName, geoServerPath, geoServerPort, proxyServerName, proxyServerPath, proxyServerPort);

    this._commLat = mapParams.commLat;
    this._commLng = mapParams.commLng;

    this._startLat = mapParams.startLat || 0;
    this._startLng = mapParams.startLng || 0;

    this._mapWidth = mapParams.mapWidth;
    this._mapHeight = mapParams.mapHeight;

    this._nearlyCommunities = mapParams.nearlyCommunities;

    this._mapContainerId = mapParams.mapContainerId;

    this._parent = mapParams.parent;
    isMapLoaded = false;

    this._communityId = mapParams.communityId;
    this._isBasicCommunity = mapParams.isBasicCommunity;
    this._builderId = mapParams.builderId;
    this._planId = mapParams.specId > 0 ? 0 : mapParams.planId;
    this._specId = mapParams.specId;


    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: mapParams.siteRoot, fromPage: mapParams.fromPage, partnerId: mapParams.partnerId, marketId: mapParams.marketId });

};

NHS.Scripts.PropertyMap.Map.prototype =
{

    get_log: function () { return this._log; },

    preInit: function () {
        mapRef = this;
        $jq('#dd-collapsible').hide();
        setup_propertyMapCollapsible();
        $jq('#nhs_propertyMapCollapsibleClose').hide();
        NHS.Scripts.Helper.eraseCookie('drivingDirectionsClicked');
    },

    // Public Functions 
    // Initialize and Display Map function
    show: function () {
        var self = this;


        var mapCenter = new MQA.LatLng(self._commLat, self._commLng);
        var mapSize = new MQA.Size(self._mapWidth, self._mapHeight);

        $jq('#' + self._mapContainerId).width(self._mapWidth + "px");
        $jq('#' + self._mapContainerId).height(self._mapHeight + "px");


        self._nhsMqMap = new MQA.TileMap(document.getElementById(self._mapContainerId), self.mapZoom, mapCenter, 'map');

        var mqZoomControl = new MQA.ZoomControl();
        self._nhsMqMap.addControl(mqZoomControl, new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(10, 21)));

        var nhsMapIcon = new MQA.Icon(self._mqMainIconPath, 30, 30);
        var nhsMapIconShadow = new MQA.Icon(self._mqIconShadowPath, 0, 0);

        //NHS Multiple Community Icon
        self._nhsMapIconMult = new MQA.Icon(self._mqIconMultPath, 28, 28);
        self._mqIconMultOffset = new MQA.Point(-14, -28);

        var mqPoint = new MQA.Poi(new MQA.LatLng(self._commLat, self._commLng), nhsMapIcon);
        mqPointOffset = new MQA.Point(-10, -26);
        mqPoint.setValue('iconOffset', mqPointOffset);
        mqPoint.setValue('shadow', nhsMapIconShadow);
        mqPoint.setValue('key', 'comm');


        self._nhsMqMap.addPoi(mqPoint);

        if (self._nearlyCommunities && self._nearlyCommunities.length > 0) {
            self._renderNearlyComms(self._nearlyCommunities, mqPoint);
        } else {
            self._nhsMqMap.addPoi(mqPoint);
        }

        if (self._startLat != 0 & self._startLng != 0) {
            self.addRouteToMap(self._startLat, self._startLng, self._commLat, self._commLng);
        }

        MQA.EventManager.addListener(self._nhsMqMap.getInfoWindow(), "opened", self._infoWindowOpen);

    },

    addRouteToMap: function (startLat, startLng, endLat, endLng) {
        var start = new MQGeoAddress();
        var end = new MQGeoAddress();

        start.setMQLatLng(new MQA.LatLng(startLat, startLng));
        end.setMQLatLng(new MQA.LatLng(endLat, endLng));

        var session = new MQSession();
        var routeRes = new MQRouteResults();
        var wayPoints = new MQLocationCollection();
        var myBB = new MQA.RectLL(new MQA.LatLng(), new MQA.LatLng());

        wayPoints.add(start);
        wayPoints.add(end);

        var routeOpt = new MQRouteOptions();

        var sessId = routeExec.createSessionEx(session);
        routeExec.doRoute(wayPoints, routeOpt, routeRes, sessId, myBB);

        this._nhsMqMap.addRouteHighlight(myBB, "http://map.access.mapquest.com", sessId, true);
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

    // When the comm marker is clicked, log the information
    _infoWindowOpen: function (e) {
        if (typeof (commDetail) != "undefined") {
            commDetail.get_log().logEvent('CDHMNRBY', commDetail.get_commId(), commDetail.get_builderId());
        }
        if (typeof (homeCarousel) != "undefined") {
            homeCarousel.get_log().logEvent('HOMNRBY', homeCarousel.get_commId(), homeCarousel.get_builderId(), homeCarousel.get_plan(), homeCarousel.get_spec());

        }
        tb_init('.nhs_CommResHoverBox a.thickbox, .nhs_MultiHoverBox a.thickbox');
    },

    // After get the community points render the points into the map
    _renderNearlyComms: function (commCollection, communityPoint) {
        var commPois = new MQA.ShapeCollection();

        var mqPoiCollection = this._buildCommPois(commCollection, communityPoint);

        this._nhsMqMap.replaceShapes(mqPoiCollection);
    },

    // Build  the community points based on some logic when there are more than 1 comm at the same location
    _buildCommPois: function (commCollection, communityPoint) {
        var commPois = new MQA.ShapeCollection();

        commPois.add(communityPoint);

        var dedupArray = [];
        var temporaryArray = [].concat(commCollection);

        var commArrayLength = commCollection.length;

        // comparing comm array and de-dup array
        for (i = commArrayLength - 1; i >= 0; i--) {
            var ary = commCollection[i];

            var cid = ary.CommunityId;
            var bid = ary.BuilderId;
            var lat = ary.Latitude;
            var lng = ary.Longitude;
            var tempNode = [];

            var totalMatch = 1;

            var temporaryArrayLength = temporaryArray.length;


            for (j = temporaryArrayLength - 1; j >= 0; j--) {
                var tAry = temporaryArray[j];
                var tCid = tAry.CommunityId;
                var tBid = tAry.BuilderId;
                var tLat = tAry.Latitude;
                var tLng = tAry.Longitude;

                // if exact Lat-Long and not same Key                
                if (tLat == lat && tLng == lng) {
                    // increase match # and key, remove matching Poi
                    totalMatch++;
                    tempNode.push(temporaryArray[j]);
                    temporaryArray.splice(j, 1);
                }
            }
            //tempNode += tempArray[i];
            temporaryArray.splice(i, 1);
            if (tempNode && tempNode.length > 0) {
                dedupArray.push(tempNode);
            }
        }

        dedupArray.reverse();
        commCollection = dedupArray;
        commArrayLength = commCollection.length;

        // create Pois and add to PoiCollection
        for (i = 0; i < commArrayLength; i++) {
            var cAry = commCollection[i];
            var cAryLength = cAry.length;

            if (!cAryLength || (cAryLength && cAryLength == 1)) {
                cAry = cAry[0];

                var cid = cAry.CommunityId;
                var bid = cAry.BuilderId;
                var name = cAry.CommunityName;
                var cty = cAry.City;
                var st = cAry.StateAbbr;
                var zip = cAry.PostalCode;
                var img = cAry.SpotlightThumbnail.replace("small_", "homnb_");
                var brandimg = '';
                var price = cAry.Price;
                var brand = cAry.BrandName;
                var matches = 0;
                var promoid = 0;
                var type = cAry.BCType
                var lat = cAry.Latitude
                var lng = cAry.Longitude;
                var market = cAry.MarketId;

                var commPoint = this._createCommPoi(cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market);

            }
            else if (cAryLength && cAryLength > 1) {
                var commNumber = cAryLength;
                var key = "mkey"; // multipoi key

                var contentHtml = [];

                //if (commNumber > 2) {
                //contentHtml.push("<div class=\"nhs_MultiHoverBox nhs_MultiBoxScroll\"><div class=\"nhs_MultiScroll\">");
                //}
                //else {
                contentHtml.push("<div class=\"nhs_MultiHoverBox\">");
                //}

                for (j = 0; j < commNumber; j++) {

                    var cid = cAry[j].CommunityId;
                    var bid = cAry[j].BuilderId;
                    var name = cAry[j].CommunityName;
                    var cty = cAry[j].City;
                    var st = cAry[j].StateAbbr;
                    var zip = cAry[j].PostalCode;
                    var img = cAry[j].SpotlightThumbnail.replace("small_", "homnb_");
                    var brandimg = '';
                    var price = cAry[j].Price;
                    var brand = cAry[j].BrandName;
                    var matches = 0;
                    var promoid = 0;
                    var type = cAry[j].BCType
                    var lat = cAry[j].Latitude
                    var lng = cAry[j].Longitude;
                    var market = cAry[j].MarketId;

                    key += "_" + cid.toString() + bid.toString();

                    contentHtml.push("<div class=\"nhs_MultiHoverRow\">");

                    if (img == "N" || img == "n" || img == "") {
                        img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_sm.png";
                    }
                    else {
                        img = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + img; //remove trailing slash
                    }
                    contentHtml.push("<div class=\"nhs_ResultsThumb\"><a href=\"");
                    contentHtml.push(this._siteRoot);
                    contentHtml.push(this._propertyDetailAction);
                    contentHtml.push("/community-");
                    contentHtml.push(cid);
                    contentHtml.push("/builder-");
                    contentHtml.push(bid);
                    contentHtml.push("\" onclick=\"drivingDirections.get_log().logAndRedirect(event,'");
                    contentHtml.push(this._siteRoot);
                    contentHtml.push(this._propertyDetailAction);
                    contentHtml.push("/community-");
                    contentHtml.push(cid);
                    contentHtml.push("/builder-");
                    contentHtml.push(bid);
                    contentHtml.push("/logevent-HOVNAME");
                    contentHtml.push("', 'HOVNAME'," + cid + "," + bid + "); return false;\">");
                    contentHtml.push("<img src=\"");
                    contentHtml.push(img);
                    contentHtml.push("\" alt=\"");
                    contentHtml.push(name);
                    contentHtml.push("\" />");
                    contentHtml.push("</a></div>");

                    contentHtml.push("<h3><a href=\"");
                    contentHtml.push(this._siteRoot);
                    contentHtml.push(this._propertyDetailAction);
                    contentHtml.push("/community-");
                    contentHtml.push(cid);
                    contentHtml.push("/builder-");
                    contentHtml.push(bid);
                    contentHtml.push("\" onclick=\"drivingDirections.get_log().logAndRedirect(event,'");
                    contentHtml.push(this._siteRoot);
                    contentHtml.push(this._propertyDetailAction);
                    contentHtml.push("/community-");
                    contentHtml.push(cid);
                    contentHtml.push("/builder-");
                    contentHtml.push(bid);
                    contentHtml.push("/logevent-HOVNAME");
                    contentHtml.push("', 'HOVNAME'," + cid + "," + bid + "); return false;\">");
                    contentHtml.push(name);
                    contentHtml.push("</a></h3>");

                    contentHtml.push("<p class=\"nhs_ResultsBuilder\">by ");
                    contentHtml.push(brand);
                    contentHtml.push("</p>");

                    if (price != "$ - $") {
                        contentHtml.push("<p class=\"nhs_ResultsPrice\">From ");
                        contentHtml.push(price);
                        contentHtml.push("</p>");
                    }

                    var reqInfoLink = this._freeBrochureLink.replace("-text-", "Free brochure").replace("-commid-", cid).replace("-builderid-", bid).replace("-marketid-", market).replace("-logEvent-", 'HOVFBROCH');
                    contentHtml.push("<p>" + reqInfoLink + "</p>");
                    contentHtml.push("<br style=\"clear: both;\" />");

                    contentHtml.push("</div>");

                }


                if (commNumber > 2) {
                    contentHtml.push("</div></div>");
                }
                else {
                    contentHtml.push("</div>");
                }

                var contentHtmlString = contentHtml.join("");

                commPoint = this._createMultiCommPoi(commNumber, key, contentHtmlString, lat, lng);
            }
            commPois.add(commPoint);
        }
        return commPois;
    },
    // Create a multi community point when there are more than one community at the same location
    _createMultiCommPoi: function (numberComms, key, contentHtml, lat, lng) {
        //contentHtml = "Test Info";
        var mqPointLatLng = new MQA.LatLng(lat, lng);
        mqPoint = new MQA.Poi(mqPointLatLng, this._nhsMapIconMult);
        mqPoint.setValue('iconOffset', this._mqIconMultOffset);
        mqPoint.setValue('shadow', this._nhsMapIconShadow);
        mqPoint.setValue('infoTitleHTML', "<strong>" + numberComms + " communities</strong>");
        mqPoint.setValue('infoContentHTML', contentHtml);
        mqPoint.setValue('key', key);

        return mqPoint;
    },

    // Create a single community point
    _createCommPoi: function (cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market) {
        var typeImg = "";
        var currentZoom = this._nhsMqMap.getZoomLevel();

        if (type == "comingsoon") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_coming_soon.gif"; }
        if (type == "grandopening") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_grand_opening.gif"; }
        if (type == "closeout") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_closeout.gif"; }

        if (img == "N" || img == "n" || img == "") {
            img = this._resourceRoot + "globalresourcesmvc/default/images/nophoto_sm.png";
        }
        else {
            img = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + img; //remove trailing slash
        }

        var contentHtml = new Array();

        contentHtml.push("<div class=\"nhs_CommResHoverBox\"><div class=\"nhs_ResultsThumb\"><a href=\"");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("\" onclick=\"drivingDirections.get_log().logAndRedirect(event,'");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("/logevent-HOVNAME");
        contentHtml.push("', 'HOVNAME'," + cid + "," + bid + "); return false;\"><img src=\"");
        contentHtml.push(img);
        contentHtml.push("\" alt=\"");
        contentHtml.push(name);
        contentHtml.push("\" /></a></div>");

        contentHtml.push("<h3><a href=\"");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("\" onclick=\"drivingDirections.get_log().logAndRedirect(event,'");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("/logevent-HOVNAME");
        contentHtml.push("', 'HOVNAME'," + cid + "," + bid + "); return false;\">");
        contentHtml.push(name)
        contentHtml.push("</a></h3>");
        contentHtml.push("<p class=\"nhs_ResultsBuilder\">by ");
        contentHtml.push(brand);
        contentHtml.push("</p>");

        if (price != "$ - $") {
            contentHtml.push("<p class=\"nhs_ResultsPrice\">from ");
            contentHtml.push(price);
            contentHtml.push("</p>");
        }

        contentHtml.push("<p class=\"nhs_ResultsLink\"><a href=\"");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("\" onclick=\"drivingDirectioCSns.get_log().logAndRedirect(event,'");
        contentHtml.push(this._siteRoot);
        contentHtml.push(this._propertyDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("/logevent-HOVPFPLN'");
        contentHtml.push(", 'HOVPFPLN'," + cid + "," + bid + "); return false;\">See new homes, <br />photos and floor plans</a>");
        contentHtml.push("</p>");

        var reqInfoLink = this._freeBrochureLink.replace("-text-", "Free brochure").replace("-commid-", cid).replace("-builderid-", bid).replace("-marketid-", market).replace("-logEvent-", 'HOVFBROCH');
        contentHtml.push("<p>" + reqInfoLink + "</p>");
        contentHtml.push("</div>");

        var contentHtmlString = contentHtml.join("");

        var mqPointLatLng = new MQA.LatLng(lat, lng);

        nhsMapIconShadow = new MQA.Icon(this._mqIconShadowPath, 0, 0);
        nhsMapIcon = new MQA.Icon(this._mqIconPath, 20, 26);

        mqPoint = new MQA.Poi(mqPointLatLng, nhsMapIcon);
        var mqIconOffset = new MQA.Point(-10, -26);
        mqPoint.setValue('iconOffset', mqIconOffset);
        mqPoint.setValue('shadow', nhsMapIconShadow);
        mqPoint.setValue('infoTitleHTML', "<strong>" + name + "</strong>");
        mqPoint.setValue('infoContentHTML', contentHtmlString);
        mqPoint.setValue('key', cid.toString() + bid.toString());

        return mqPoint;
    }
};

NHS.Scripts.PropertyMap.NearbyComms = function (parameters) {
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._planId = parameters.specId > 0 ? 0 : parameters.planId;
    this._specId = parameters.specId;

    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerId: parameters.partnerId, marketId: parameters.marketId });
};

NHS.Scripts.PropertyMap.NearbyComms.prototype = {
    get_log: function () { return this._log; },

    attachClickEventsToCommLinks: function () {
        $jq(".nhs_NearbyImgBox a").click((function () {
            attachLogEventToHomesNearby(this);
        }).bind(this));
        $jq(".nhs_selector a").click((function () {
            attachLogEventToHomesNearby(this);
        }).bind(this));
    }
};

function attachLogEventToHomesNearby(object) {
    var hdPage = object._planId > 0 || object._specId > 0;
    var eventCode = hdPage ? 'HDNBI' : 'cdhmnrby';
    object.get_log().logMultiEvent(eventCode, object._communityId, object._builderId, object._planId, object._specId);
}

function setup_propertyMapCollapsible() {
    $jq('#nhs_propertyMapCollapsibleOpen, #nhs_mapTab').click(function () {

        if ($jq("#dd-collapsible").css('display') == 'none') {
            $jq('#dd-collapsible').toggle('fast');
        }
        $jq('#nhs_propertyMapCollapsibleOpen').hide();
        $jq('#nhs_propertyMapCollapsibleClose').show();

        if (!isMapLoaded) {
            isMapLoaded = true;
            mapRef.show();
            logClickEvent_propertyMapExpand();
        }

        return false;
    });

    $jq('#nhs_propertyMapCollapsibleClose').click(function () {
        $jq('#dd-collapsible').toggle('fast');
        $jq('#nhs_propertyMapCollapsibleClose').hide();
        $jq('#nhs_propertyMapCollapsibleOpen').show();
        return false;
    });
}

function logClickEvent_propertyMapExpand() {
    var alreadyClicked = NHS.Scripts.Helper.readCookie('drivingDirectionsClicked');
    if (!parseInt(alreadyClicked)) {
        if (mapRef._isBasicCommunity || mapRef._isBasicListing) {
            mapRef.get_log().logMultiEvent('bcMapSectionReveal', mapRef._communityId, mapRef._builderId, 0, 0);
            $jq.googlepush('Basic Listing', 'Driving Directions', mapRef._communityId, 2, false);
        }
        else if (mapRef._specId > 0 || mapRef._planId > 0)
            mapRef.get_log().logMultiEvent('HDSDD', mapRef._communityId, mapRef._builderId, mapRef._planId, mapRef._specId);
        else
            mapRef.get_log().logMultiEvent('CDSDD', mapRef._communityId, mapRef._builderId, 0, 0);

        NHS.Scripts.Helper.createCookie('drivingDirectionsClicked', 1, 0);
    }
}