var geoExec;
var mapExec;

// Class Map
//Constructor, it receives a json object with parameters
NHS.Scripts.CommunityDetail.Map = function (mapParams) {

    this._nhsMqMap = "";
    
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
         
    this._brandPartnerId = mapParams.brandPartnerId;
    this._commDetailAction = mapParams.commDetailAction;
    this._resourceRoot = mapParams.resourceRoot;

    this._mqIconShadowPath = this._resourceRoot + "globalresources/default/images/map/marker_shadow.png";

    if (this._brandPartnerId == 333) {
        //move & move partners
        this._mqIconPath = this._resourceRoot + "globalResources/move/images/map/marker.gif";
        this._mqMainIconPath = this._resourceRoot + "globalResourcesMvc/move/images/icons/star_red.png";
    } else {
        //nhs & nhs partners
        this._mqIconPath = this._resourceRoot + "globalResources/default/images/map/marker.gif";
        this._mqMainIconPath = this._resourceRoot + "globalResourcesMvc/default/images/icons/star_red.png";
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

    this._commDetails = mapParams.commDetails;
}

NHS.Scripts.CommunityDetail.Map.prototype =
{
    // Public Functions 
    // Initialize and Display Map function
    show: function () {
        var mapZoom = 7;
        var mapCenter = new MQA.LatLng(this._commLat, this._commLng);
        var mapSize = new MQA.Size(this._mapWidth, this._mapHeight);

        $jq('#' + this._mapContainerId).width(this._mapWidth + "px");
        $jq('#' + this._mapContainerId).height(this._mapHeight + "px");


        this._nhsMqMap = new MQA.TileMap(document.getElementById(this._mapContainerId), mapZoom, mapCenter, 'map');

        var mqZoomControl = new MQA.ZoomControl();
        this._nhsMqMap.addControl(mqZoomControl, new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(10, 21)));

        var nhsMapIcon = new MQA.Icon(this._mqMainIconPath, 30, 30);
        var nhsMapIconShadow = new MQA.Icon(this._mqIconShadowPath, 0, 0);

        var mqPoint = new MQA.Poi(new MQA.LatLng(this._commLat, this._commLng), nhsMapIcon);
        mqPointOffset = new MQA.Point(-10, -26);
        mqPoint.setValue('iconOffset', mqPointOffset);
        mqPoint.setValue('shadow', nhsMapIconShadow);
        mqPoint.setValue('key', 'comm');

        if (this._nearlyCommunities && this._nearlyCommunities.length > 0) {
            this._renderNearlyComms(this._nearlyCommunities);
            tb_init('a.thickbox');
        }

        this._nhsMqMap.addPoi(mqPoint);

        if (this._startLat != 0 & this._startLng != 0) {
            this.addRouteToMap(this._startLat, this._startLng, this._commLat, this._commLng);
        }
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
    // After get the community points render the points into the map
    _renderNearlyComms: function (commCollection) {
        var commPois = new MQA.ShapeCollection();

        $jq(commCollection).each((function (i, item) {
            var commPoint = this._createCommPoi(item.CommunityId, item.BuilderId, item.CommunityName, item.City, item.StateAbbr, item.PostalCode, item.SpotlightThumbnail, '', item.PriceLow + ' - ' + item.PriceHigh, '', 0, 0, item.BCType, item.Latitude, item.Longitude, item.MarketId);
            commPois.add(commPoint);
        }).bind(this));

        this._nhsMqMap.replaceShapes(commPois);
    },
    // Create a single community point
    _createCommPoi: function (cid, bid, name, cty, st, zip, img, brandimg, price, brand, matches, promoid, type, lat, lng, market) {
        var typeImg = "";
        var currentZoom = this._nhsMqMap.getZoomLevel();

        if (type == "comingsoon") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_coming_soon.gif"; }
        if (type == "grandopening") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_grand_opening.gif"; }
        if (type == "closeout") { typeImg = this._resourceRoot + "globalresources/default/images/icons/icon_closeout.gif"; }

        if (img == "N" || img == "n" || img == "") {
            img = this._resourceRoot + "globalresources/default/images/nophoto_sm.gif";
        }
        else {
            img = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + img; //remove trailing slash
        }

        var contentHtml = new Array();

        contentHtml.push("<div class=\"nhsCommResHoverBox\"><div class=\"nhsHoverImgs\"><div class=\"nhs_ResultThumb\"><a href=\"");
        contentHtml.push(this._commDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("\" onclick=\"commResults.get_map().get_log().logAndRedirect(event,'");
        contentHtml.push(this._commDetailAction);
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

        if (brandimg != "N" && brandimg != "") {
            contentHtml.push("<img src=\"");
            contentHtml.push(brandimg);
            contentHtml.push("\" alt=\"");
            contentHtml.push(brand);
            contentHtml.push("\" />");
        }
        else {
            brandimg = this._resourceRoot.substring(0, this._resourceRoot.length - 1) + brandimg;
        }
        contentHtml.push("</div>");
        contentHtml.push("<h3><a href=\"");
        contentHtml.push(this._commDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("/builder-");
        contentHtml.push(bid);
        contentHtml.push("\" onclick=\"commResults.get_map().get_log().logAndRedirect(event,'");
        contentHtml.push(this._commDetailAction);
        contentHtml.push("community-");
        contentHtml.push(cid);
        contentHtml.push("/logevent-HOVNAME");
        contentHtml.push("', 'HOVNAME'," + cid + "," + bid + "); return false;\">");
        contentHtml.push(name)
        contentHtml.push("</a></h3>");
        contentHtml.push("<p class=\"nhsResultsBuilder\">by ");
        contentHtml.push(brand);
        contentHtml.push("</p>");

        if (typeImg != "") {
            contentHtml.push("<p class=\"nhsResultsCommStatus\"><img src=\"");
            contentHtml.push(typeImg);
            contentHtml.push("\" alt=\"Coming Soon\" /></p>");
        }

        if (price != "$ - $") {
            contentHtml.push("<p class=\"nhsResultsPrice\"><strong>From ");
            contentHtml.push(price);
            contentHtml.push("</strong></p>");
        }

        contentHtml.push("<ul><li><a href=\"");
        contentHtml.push(this._commDetailAction);
        contentHtml.push("/community-");
        contentHtml.push(cid);
        contentHtml.push("\" onclick=\"commResults.get_map().get_log().logAndRedirect(event,'");
        contentHtml.push(this._commDetailAction);
        contentHtml.push("community-");
        contentHtml.push(cid);
        contentHtml.push("/logevent-HOVPFPLN'");
        contentHtml.push(", 'HOVPFPLN'," + cid + "," + bid + "); return false;\">See new homes, photos and floor plans</a></li>");
        contentHtml.push("</ul>");

        var reqInfoLink = this._freeBrochureLink.replace("-text-", "Free brochure").replace("-commId-", cid).replace("-builderId-", bid).replace("-marketId-", market).replace("-logEvent-", 'HOVFBROCH');
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
        mqPoint.setValue('key', cid + bid);

        return mqPoint;
    }
};
