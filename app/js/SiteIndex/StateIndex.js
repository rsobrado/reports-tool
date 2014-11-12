// Global Class for State Index Page
NHS.Scripts.CommunityResults.StateIndex = function (parameters) {
    this._nhsMqMap;
    this._mqCenter;
    this._mqZoom;
    this._nhsMapIconShadow;
    this._nhsMapIconMkt;
    this._mapCenterLat;
    this._mapCenterLng;

    this._partnerId = parameters.partnerId;
    this._state = parameters.state;
    this._siteRoot = parameters.siteRoot;
    this._resourceRoot = parameters.resourceRoot;
    this._brandPartnerId = parameters.brandPartnerId;

    this._mapCenterLat = parameters.mqCenterLat;
    this._mapCenterLng = parameters.mqCenterLng;

    this._mqZoom = parameters.mqZoomLevel;

    this._mapStatesAction = '/MapSearch/GetStateMarketMapPoints';

    if (this._brandPartnerId == 333) {
        //move & move partners
        this._mqIconMktPath = this._resourceRoot + "globalresources/move/images/map/marker_market.gif";
    } else {
        //nhs & nhs partners
        this._mqIconMktPath = this._resourceRoot + "globalresources/default/images/map/mkt_icon.gif";
    }

    this._mqIconShadowPath = this._resourceRoot + "globalresources/default/images/map/marker_shadow.png";
};

NHS.Scripts.CommunityResults.StateIndex.prototype =
{
    initialize: function () {
        var nhsStateIndexMap = document.getElementById('nhsStateIndexMap');

        // Check for missing state - i.e. no mqCenterLat or mqCenterLng
        if (this._mapCenterLat == null) {
            nhsStateIndexMap.style.display = "none";
            return false;
        }

        this._mqCenter = new MQA.LatLng(this._mapCenterLat, this._mapCenterLng);

        // Create the map object
        this._nhsMqMap = new MQA.TileMap(document.getElementById('nhsStateIndexMap'), this._mqZoom, this._mqCenter, 'map');

        this._nhsMapIconShadow = new MQA.Icon(this._mqIconShadowPath, 0, 0);

        //Market icon
        this._nhsMapIconMkt = new MQA.Icon(this._mqIconMktPath, 40, 37);

        // add zoom control
        var mqZoomControl = new MQA.ZoomControl();
        this._nhsMqMap.addControl(mqZoomControl, new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(10, 20)));

        // set map size
        nhsStateIndexMap.style.border = "1px solid #000";
        var mapWidth = nhsStateIndexMap.offsetWidth - 2 + "px";
        //var mapHeight = nhsStateIndexMap.offsetHeight - 2 + "px";
        var mapHeight = "400px";
        this._nhsMqMap.setSize(new MQA.Size(mapWidth, mapHeight));

        this._getStateMarketMapPois();

        $jq('#nhs_StateBrowseDiv0').css('display', 'none');
        $jq('#nhs_StateBrowseDiv1').css('display', 'none');
        $jq('#nhs_StateBrowseDiv2').css('display', 'none');
        $jq('#nhs_StateBrowseDiv').css('height', '250px');

        $jq('#indexTab1').click((function () { this._switchBoxDisplay('li1', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab2').click((function () { this._switchBoxDisplay('li2', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab3').click((function () { this._switchBoxDisplay('li3', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab4').click((function () { this._switchBoxDisplay('li4', 'nhs_StateBrowseDiv0', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv3'); return false; }).bind(this));

        $jq('#btnSearchHomes').click(function () { if ($jq('#SelectedMarketId').val() == "0") { alert("Area is required."); return false; } });
        if($jq('div#nhs_StateBrowseDiv0 ul li').length == 0) $jq('li#li4').hide();

    },

    _getStateMarketMapPois: function () {
        $jq.ajax({ url: this._mapStatesAction, data: { partnerId: this._partnerId, state: this._state }, success: this._onStateMarketPoiSuccess.bind(this) });
    },

    _onStateMarketPoiSuccess: function (result) {

        var poiNodes = result.getElementsByTagName("MapPoi");
        mqPoiCollection = new MQA.ShapeCollection();
        var poiNodesLength = poiNodes.length;

        for (i = 0; i < poiNodesLength; i++) {
            var id = this._getChildNodeValue(poiNodes[i], "Id");
            var lat = this._getChildNodeValue(poiNodes[i], "Lat");
            var lng = this._getChildNodeValue(poiNodes[i], "Lng");
            var title = this._getChildNodeValue(poiNodes[i], "Title");

            var mqPointLatLng = new MQA.LatLng(lat, lng);
            mqPoint = new MQA.Poi(mqPointLatLng, this._nhsMapIconMkt);
            mqPoint.setValue('iconOffset', new MQA.Point(-20, -37));
            mqPoint.setValue('shadow', this._nhsMapIconShadow);
            mqPoint.setValue('infoTitleHTML', "<strong>" + title + "</strong>");
            mqPoint.setValue('key', id);

            MQA.EventManager.addListener(mqPoint, "click", this._clickPoint);

            mqPoiCollection.add(mqPoint);
        }

        this._nhsMqMap.replaceShapes(mqPoiCollection);
    },

    _clickPoint: function (e) {
        window.location.href = "/communityresults/market-" + this.getKey();
    },

    _getChildNodeValue: function (parentNode, name) {
        if (parentNode.getElementsByTagName(name)[0].childNodes.length > 0) {
            return parentNode.getElementsByTagName(name)[0].childNodes[0].nodeValue;
        }
        else {
            return "";
        }
    },


    _switchBoxDisplay: function (linkId, popId, popId2, popId3, popId4) {

        var link = linkId;
        var pop = document.getElementById(popId);
        var list1 = document.getElementById('li1');
        var list2 = document.getElementById('li2');
        var list3 = document.getElementById('li3');
        var list4 = document.getElementById('li4');
        var stateDiv = document.getElementById('nhs_StateBrowseDiv');

        if (link == 'li1') {
            list1.className = 'nhs_Selected';
            list2.className = list3.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
        }
        if (link == 'li2') {
            list2.className = 'nhs_Selected';
            list1.className = list3.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }
        if (link == 'li3') {
            list3.className = 'nhs_Selected';
            list1.className = list2.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }
        if (link == 'li4') {
            list4.className = 'nhs_Selected';
            list1.className = list2.className = list3.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }

        pop.style.display = 'inline';
    }
}
