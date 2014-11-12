function onTemplateLoaded(pExperienceID) {
    _bcExperienceID = pExperienceID;
    commResults.get_mp().loadMediaPlayer('results');
}

// Global Class for Community Results Page
NHS.Scripts.CommunityResults.CommResults = function (parameters) {

    this._parameters = parameters;
    this.validateSearchTextFunction = parameters.validateSearchTextFunction;
    this._hideDelay = 500;
    this._hideTimer = null;
    this._ajaxCall = null;
    this._wasAlreadyCreated = false;
    this._openQuickViewCommunityId = null;
    this._MarketIdForBroshure = parameters.marketId;
    this.UrlForBrosure = parameters.urlForBrosure;
    this._CurrentPageForBrosure = parameters.currentPageForBrosure;    

    this._searchParameters = parameters.searchParameters;
    this._searchAction = parameters.searchAction;
    this.method = parameters.method;
    this.partnerID = parameters.partnerID;
    this.brandPartnerId = parameters.brandPartnerId;

    this._adAction = parameters.adAction;
    this._pageSize = parameters.pageSize;
    this._resourceRoot = parameters.resourceRoot;
    this._quickViewUrl = ("/" + parameters.partnerSiteUrl + '/CommunityResults/QuickView').replace("//", "/");
    _marketIdCR = parameters.marketId;

    if (this._searchAction.indexOf("//" != -1))
        this._searchAction = this._searchAction.replace("//", "/");

    if (this._adAction.indexOf("//" != -1))
        this._adAction = this._adAction.replace("//", "/");

    this._tabsControlId = parameters.tabsControlId;
    this._loadingControlId = parameters.loadingControlId;

    this._listHubBasicListinIds = parameters.listHubBasicListinIds;
    this._listHubBasicListinIdsList = parameters.listHubBasicListinIdsList.replace("]", "").replace("[", "").split(",");

    this._listHubProviderId = parameters.listHubProviderId;
    this._listHubTestLogging = parameters.listHubTestLogging;
    this._desckey = parameters.desckey;

    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, partnerId: parameters.partnerId, marketId: parameters.marketId });

    this._lastLocationName = "";
    this._lastCity = "";
    this._lastCounty = "";
    this._lastZipCode = "";
    this._searchUrl = parameters.searchUrl;

    // Once the doc is ready, loads the map.
    var facetParameters = {
        locationSliderControlId: 'nhs_FacetLocationSlider',
        locationSliderTextId: 'nhs_FacetLocationText',
        priceSliderControlId: 'nhs_FacetPriceSlider',
        priceSliderTextFromId: 'nhs_FacetPriceTextFrom',
        priceSliderTextToId: 'nhs_FacetPriceTextTo',
        sqFtSliderControlId: 'nhs_FacetSqFtSlider',
        sqFtSliderTextFromId: 'nhs_FacetSqFeetTextFrom',
        sqFtSliderTextToId: 'nhs_FacetSqFeetTextTo',
        facetModalCities: 'nhs_FacetModalCities',
        facetModalStatus: 'nhs_FacetModalStatus',
        facetModalBedrooms: 'nhs_FacetModalBedrooms',
        facetModalBathrooms: 'nhs_FacetModalBathrooms',
        facetModalPromotions: 'nhs_FacetModalPromotions',
        facetModalVideo: 'nhs_FacetModalVideo',
        facetModalEvent: 'nhs_FacetModalEvent',
        facetModalBuilder: 'nhs_BuilderPromoList',
        facetLinkBuilder: 'nhs_FacetLinkBuilder',
        facetModalSchools: 'nhs_FacetModalSchools',
        facetModalAmenities: 'nhs_FacetModalAmenities',
        searchParameters: this._searchParameters,
        locationControlId: 'LocationName',
        locationButtonControlId: 'btnGo',
        pageSize: parameters.pageSize,
        autoCompleteAction: parameters.autoCompleteAction,
        commResults: this,
        validateSearchTextFunction : this.validateSearchTextFunction
    };

    this._facets = new NHS.Scripts.CommunityResults.Facets(facetParameters);
    

    var mapParameters = {
        MapOptions: {
            Latitude: parameters.Map.centerLat,
            Longitude: parameters.Map.centerLng,
            Zoom: parameters.Map.zoomLevel,
            ContainerName: 'nhs_CommResMap',
            zoomControl: true,
            ZoomControlStyle: 'SMALL',
            disableDefaultUI: true,
            Scrollwheel: false,
        },
        MarkerPointOptions: {
            optimized: true
        },
        MinZoom: 3,
        MarkerClustererOptions: {
            gridSize: 40,
            maxZoom: 18,
            cssName: "nhs_Cluster",
            imagePath: "",
            zoomOnClick: true,
            minimumClusterSize: 5
        },
        UseClusterer: true,
        ProcessResultOptions: {
            Latitude: 'Lat',
            Longitude: 'Lng',
            Name: 'Name'
        }
    };

    parameters.galleryParams.logger = this._log;
    this._galleryParameters = parameters.galleryParams;
    this._mp = new NHS.Scripts.MediaPlayerVideo(parameters.galleryParams);

    this._map = new NHS.Scripts.GoogleMapApi(mapParameters);

    this._paging = new NHS.Scripts.Paging({ onGoToPage: this._goToPage.bind(this) });

    this._sort = new NHS.Scripts.CommunityResults.Sorting({ onSort: this._sortResults.bind(this) });    
};


NHS.Scripts.CommunityResults.CommResults.prototype =
{
    // Public properties
    get_searchParameters: function () { return this._searchParameters; },
    get_galleryParameters: function () { return this._galleryParameters; },
    get_SearchAction: function () { return this._searchAction; },
    get_map: function () { return this._map; },
    set_lastLocationName: function (value) { this._lastLocationName = value; },
    get_hideDelay: function () { return this._hideDelay; },
    get_hideTimer: function () { return this._hideTimer; },
    get_openQuickViewCommunityId: function () { return this._openQuickViewCommunityId; },
    get_log: function () { return this._log; },
    get_mp: function () { return this._mp; },

    set_hideTimer: function (timer) { this._hideTimer = timer; },
    set_openQuickViewCommunityId: function (qvCommunityId) {
        this._openQuickViewCommunityId = qvCommunityId;
    },
    set_searchParameters: function (params) {
        if (typeof (params) == "string")
            params = $jq.evalJSON(params);

        this._searchParameters = params;        
    },

    initialize: function () {
        this._setUpControls();
        this._setupBrandCarousel();
        this._facets.initialize();
        this._paging.initialize();
        this._sort.initialize();
        this.setupMap();
        
        var mapStatus = NHS.Scripts.Helper.readCookie("mapState");

        if (mapStatus && mapStatus == 'expanded') {
            this.showMap(true);
        }


        $jq('#hdnAdCurrentMiddle').val($jq('#nhsIFrameAdMiddle').attr('src'));
        $jq('#hdnAdCurrentMiddle3').val($jq('#nhsIFrameAdMiddle3').attr('src'));
        $jq('#hdnAdCurrentRight2').val($jq('#nhsIFrameAdRight2').attr('src'));

        if (this._listHubBasicListinIds.length > 0) {
            for (i = 0; i < this._listHubBasicListinIds.length; i++) {
                var listingKey = this._listHubBasicListinIds[i];
                this._log.logBasicListingEvent(this._desckey, this._listHubBasicListinIdsList[i]);
                this._log.logListHubEvent(this._listHubProviderId, this._listHubTestLogging, this._desckey, listingKey);
            }
        }
        setTimeout("$jq('.estaradefaultstyle a').click(function() {$jq.googlepush('Chat Links','Tab','Chat Now');});", 5000);
    },

    refresh: function () {

        this._setUpControls();
        this._setupBrandCarousel();
        this._facets.initialize();
        this._paging.initialize();
        this._sort.initialize();
    },

    // Update entire e
    update: function () {
        this._retrieveResults(1, null, null, true, true);
    },

    // Update entire e
    updateResults: function () {
        this._retrieveResults(1, null, null, false, true);
    },
    setupMap : function() {
        var parent = this;
        
        this._map.options.Events.InfowindowTooltipReady = function() {
            var card = jQuery(".nhs_MapHoverCard").parent().parent();
            var arrow= card.parent().find("> div").first().find("> div");
            arrow.first().hide();        
            arrow.eq(2).hide();
            card.next('div').hide();
            var width = card.width()+ 75;
            var height =card.height() + 75;
            this.infowindowTooltip.setOptions({ pixelOffset: this.GetInfowindowOffset(width, height, this.map, this.infowindowTooltip.getAnchor()) });
        };
       
        this._map.options.Events.InfowindowReady= function() {
            var card = jQuery("#nhs_MapCards").parent().parent();
            var arrow= card.parent().find("> div").first().find("> div");
            arrow.first().hide();        
            arrow.eq(2).hide();
            var width = card.width()+ 75;
             var height =card.height() + 75;
            this.infowindow.setOptions({ pixelOffset: this.GetInfowindowOffset(width, height, this.map, this.infowindow.getAnchor()) });
       };
        
       this._map.options.Events.MarkerMouseOverCallBack = function(info, infowindow,infowindowTooltip, marker) {
            var mapCard = jQuery("div.nhs_MapCard");
            if (mapCard != null && mapCard.length > 0)
                return false;
            var  name = (info.MarketPoints.length > 1) ? info.MarketPoints.length.toString() + " Communities" : info.MarketPoints[0]['Name'];
            var information = info.Price;



            var html = "<div class=\"nhs_MapHoverCard\"><h2>" + name + "</h2>"
                + information + "</div>";

            infowindow.close();
            infowindowTooltip.setContent(html);
            infowindowTooltip.open(this.map, marker);


        };

        
        this._map.options.Events.MarkerMouseOutCallBack = function(info, infowindow,infowindowTooltip, marker) {
            infowindowTooltip.close();
        };
        
       
        tb_initLive("#nhs_MapCards a.thickbox");
        this._map.options.Events.MarkerClickCallBack = function (info, infowindow,infowindowTooltip, marker) {
            infowindowTooltip.close();
            marker.setCursor("wait");
            
            parent.get_log().logEvent('MAPCLICK', 0, 0);
            
            if (info.MarketPoints) {
                var commIds = [];
                var basicIds = [];
                for (var i = 0; i < info.MarketPoints.length; i++) {
                    if(info.MarketPoints[i].IsBl)
                        basicIds.push(info.MarketPoints[i]['Id'] );
                    else
                        commIds.push(info.MarketPoints[i]['Id'] + "|" + info.MarketPoints[i]['NumHomes']);
                }
                jQuery.ajax({
                    url: parent._parameters.getMapCardAction,
                    type: "GET",
                    cache: false,
                    data: {
                        commIds: commIds.join(),
                        basicIds: basicIds.join()
                    },
                    success: function(html) {
                        if (html) {
                            infowindow.setContent(html);
                            infowindow.open(parent._map.map, marker);
                            marker.setCursor("default");
                        }
                    }
                });
            } else {
                if (this.map.getZoom() <= 5) 
                    this.map.setZoom(6);
                else if(this.map.getZoom() <= 8)
                    this.map.setZoom(9);
                    
                this.map.setCenter(marker.position);
            }
        };
        
        
        this._map.ZoomListener = function() {
            parent.get_log().logEvent('MAPZOOM', 0, 0);
            parent.updateMapAndResults();
        };

        this._map.DragListener = function() {
            parent.get_log().logEvent('MAPDRAG', 0, 0);
            parent.updateMapAndResults();
        };

        this._map.getNameMarkerPoint = function (sources, data) {            
            var prOptions = this.options.ProcessResultOptions;
            if (data.MarketPoints.length > 1) {
                return data[prOptions.Name] + " Communities";
            }
            return data.MarketPoints[0][prOptions.Name];
        };

        this._map.processResult = function (results) {
            var prOptions = this.options.ProcessResultOptions;
            results = results.Results;
            for (var i = 0; i < results.length; i++) {
                var icon = this.getIconMarkerPoint(results, results[i]);
              
                for (var j = 0; j < results[i].MarketPoints.length; j++) {
                   this.createMarkerPoint(results[i][prOptions.Latitude], results[i][prOptions.Longitude], null, null, icon, results[i]);            
                }
            }
        };

        this._map.processMarketsAndStates = function (results) {
            for (var i = 0; i < results.length; i++) {
                var html = null;
                var icon = parent._parameters.iconMulti;
                var name = (results[i]['Title'])? results[i].Title.replace('<strong>', '').replace('</strong>','') : (results[i]['StateName'] + "(" + results[i]['TotalCommunities'] + " Communities)") ;
              
                this.createMarkerPoint(results[i].Lat, results[i].Lng, name, html, icon, results[i]);
            }
            this.hideLoading();
        };


        this._map.getIconMarkerPoint = function(results, result) {
            var count = result.MarketPoints.length;
            if (parent.currentResultType != "CommunityResults") {
                count = result.HomesCount;
            }

            if (parent.showBasics) {
                if (result.IsBl)
                    return parent.parameters.iconBasic;

                if (result.IsBasic) {
                    if (count > 1)
                        return parent.parameters.iconMultiBasic;
                    return parent.parameters.iconBasic;
                }
            }

            if (count > 1)
                return parent._parameters.iconMulti;
            return parent._parameters.icon;
        };
        
        this._map.options.Events.OnMapCreate = function() {
            parent.plotMap();
            parent._map.options.Events.OnMapCreate = null;
        };                            
    },
    updateMapAndResults : function() {
        var data = this._map.getBoundsFromMap();
                    
        this._searchParameters.MinLatitude = data.minLat;
        this._searchParameters.MinLongitude = data.minLng;
        this._searchParameters.MaxLatitude = data.maxLat;
        this._searchParameters.MaxLongitude = data.maxLng;
        this.saveSearchState();

        if (this._map.map.getZoom() > 8)
            this.updateResults();
        else
            this.plotMap();
    },
    plotMap: function () {
        var self = this;
        
        self.get_log().logEvent('MAPUPD', 0, 0);
        
        if (self.isMapOpen()) {
            self.showProgressIndicator();
            var data = self._map.getBoundsFromMap();

            self._map.map.clearOverlays();

            if (self._map.map.getZoom() <= 5) {
                jQuery.getJSON('/MapSearch/GetStateMapPoints', { partnerId: self._parameters.partnerID, minLat: data.maxLat, minLng: data.minLng, maxLat: data.minLat, maxLng: data.maxLng }, function(results) {
                    self._map.processMarketsAndStates($jq.evalJSON(results));
                    self.hideProgressIndicator();
                });
            } else if (self._map.map.getZoom() <= 8) {
                jQuery.getJSON('/MapSearch/GetMarketMapPoints', { partnerId: self._parameters.partnerID, minLat: data.maxLat, minLng: data.minLng, maxLat: data.minLat, maxLng: data.maxLng }, function(results) {
                    self._map.processMarketsAndStates($jq.evalJSON(results));
                    self.hideProgressIndicator();
                });            
            } else {
                
                jQuery.getJSON('/MapSearch/GetCommMapPointsV2', { searchParameters: NHS.Scripts.Helper.JSON.toString(self._searchParameters), minLat: data.maxLat, minLng: data.minLng, maxLat: data.minLat, maxLng: data.maxLng }, function(results) {
                    self._map.processResult($jq.evalJSON(results));
                    self.hideProgressIndicator();
                });
            }
        }
    },

    saveSearchState: function () {

        if (this._searchParameters.City != "" || this._searchParameters.County != "" || this._searchParameters.PostalCode != "") {
            this._lastCity = this._searchParameters.City;
            /// <reference path="../jquery-1.4.4.min.js" />

            this._lastCounty = this._searchParameters.County;
            this._lastZipCode = this._searchParameters.PostalCode;
            this._lastRadius = this._searchParameters.Radius;
            this._lastCenterLat = this.get_map()._mqCenterLat;
            this._lastCenterLng = this.get_map()._mqCenterLng;
        }

        this._searchParameters.City = "";
        this._searchParameters.County = "";
        this._searchParameters.PostalCode = "";
        this._searchParameters.Radius = 0;

    },
    resetSearchArea : function() {
       this._map.createMap();    
    },
    restoreSearchState: function () {
        var map = this.get_map();

        this._searchParameters.City = this._lastCity;
        this._searchParameters.County = this._lastCounty;
        this._searchParameters.PostalCode = this._lastZipCode;

        map._mqCenterLat = this._lastCenterLat;
        map._mqCenterLng = this._lastCenterLng;

        this._lastCity = "";
        this._lastCounty = "";
        this._lastZipCode = "";
        this._lastRadius = "";
        this._lastCenterLat = "";
        this._lastCenterLng = "";
    },

    // reset search parameter
    reset: function (searchParameters) {
        this.set_searchParameters(searchParameters);
        this.update();
        this.hideProgressIndicator();
    },

    // Hide Progress Indicator
    hideProgressIndicator: function () {
        $jq('#' + this._loadingControlId).hide();
    },
    
    // Show Progress Indicator
    showProgressIndicator: function () {
        $jq('#' + this._loadingControlId).show();
    },
    
    isMapOpen : function() {
        return $jq('#nhs_CommResShowMap').hasClass('nhs_CommResShowMapOpen');
    },
    // Show Map
    showMap: function (createMap) {
        var mapPosition = $jq('#nhs_CommResShowMap').position();

        if (mapPosition) {
            $jq('#nhs_CommResShowMap').addClass('nhs_CommResShowMapOpen');
            $jq('#nhs_CommResMapMain').show();
            $jq('#nhs_CommResMapMain').css('top', mapPosition.top + 'px');

            NHS.Scripts.Helper.createCookie('mapState', 'expanded', 0);
        }

        if (createMap) {
            if(!this._wasAlreadyCreated)
                this._map.createMap();
            this._wasAlreadyCreated = true;
        } else
            this.plotMap();
    },

    // Hide Map
    hideMap: function () {
        $jq('#nhs_CommResShowMap').removeClass('nhs_CommResShowMapOpen');
        $jq('#nhs_CommResMapMain').hide();
        $jq.googlepush('Search Events', 'Search Results', 'Collapse Map');
    },

    // Show Quick View Homes panel - Sept 2011
    showQuickViewHomes: function (communityId, builderId, marketId) {
        // hide all currently open quick view divs
        $jq(".nhs_ResultQuickView").hide();
        $jq(".nhs_CommResRow").removeClass("nhs_CommResRowOpen");

        var bkgnd = this._resourceRoot + '/globalresourcesmvc/default/images/quickview_loading.gif';
        $jq('div[id^="nhs_ResultQuickView"]').css('background', 'url(' + bkgnd + ') no-repeat scroll 50% 50% #FFFFFF');

        if ($jq('#nhs_CommResRow' + communityId + " .nhs_ResultShowQVBtn").text() == "Show") {
            var searchParams = commResults.get_searchParameters();

            $jq(".nhs_ResultShowQVBtn").text("Show");
            $jq('#nhs_CommResRow' + communityId + " .nhs_ResultShowQVBtn").text("Hide");
            $jq('#nhs_ResultQuickView' + communityId).show();
            $jq('#nhs_CommResRow' + communityId).addClass("nhs_CommResRowOpen");

            $jq('.nhs_ResultQVList').html("");

            $jq.ajax({
                url: this._quickViewUrl,
                type: "POST",
                data: { communityId: communityId, searchParameters: NHS.Scripts.Helper.JSON.toString(searchParams) },
                success: function (data) {

                    $jq('.nhs_ResultQVList').html(data);
                    $jq('#nhs_ResultQuickView' + communityId).css("background", "none");
                }
            });
            this._log.logEvent("CRQVEXP", communityId, builderId, 0, 0);
        } else {
            $jq(".nhs_ResultShowQVBtn").text("Show");
        }
    },

    // show quick view panel - Spring 2011
    showQuickView: function (communityId) {

        // hide all currently open quick view divs
        $jq(".nhs_ResultQuickView").hide();
        $jq(".btn_QuickViewOpen").removeClass('btn_QuickViewOpen');

        var openQVId = commResults.get_openQuickViewCommunityId();

        if (communityId == openQVId) {
            commResults.set_openQuickViewCommunityId(null);
            return false;
        }

        //if (this.hideTimer)
        //    clearTimeout(this.hideTimer);

        // check if data for quick view already retrieved
        if ($jq('#nhs_ResultQuickView' + communityId).html().length <= 0) {
            // make a call to get data for quick view
            var searchParams = commResults.get_searchParameters();

            $jq.ajax({
                url: '/CommunityResults/QuickView',
                type: "POST",
                data: { communityId: communityId, searchParameters: NHS.Scripts.Helper.JSON.toString(searchParams) },
                success: function (data) {

                    $jq('#lnkQuickView' + communityId).addClass('btn_QuickViewOpen');
                    $jq('#nhs_ResultQuickView' + communityId).html(data);
                    $jq('#nhs_ResultQuickView' + communityId).show();

                    $jq("#div_" + communityId).jCarouselLite({
                        btnNext: "#next_" + communityId + ", #cimgnext_" + communityId + ", #himgnext_" + communityId,
                        btnPrev: "#prev_" + communityId + ", #cimgprev_" + communityId + ", #himgprev_" + communityId,
                        visible: 1,
                        scroll: 1,
                        circular: true
                    });

                    tb_init('div#nhs_ResultQuickView' + communityId + ' a.thickbox');


                    // hide on moving off of quick view button
                    //                    $jq('#lnkQuickView' + communityId).mouseout(function () {
                    //                        if (commResults.get_hideTimer())
                    //                            clearTimeout(commResults.get_hideTimer());
                    //                        var t = setTimeout(function () {
                    //                            $jq('#nhs_ResultQuickView' + communityId).hide();
                    //                            $jq('#lnkQuickView' + communityId).removeClass('btn_QuickViewOpen');
                    //                        }, commResults.get_hideDelay());
                    //                        commResults.set_hideTimer(t);
                    //                    });

                    // Allow mouse over of details without hiding details
                    //                    $jq('#nhs_ResultQuickView' + communityId).mouseover(function () {
                    //                        if (commResults.get_hideTimer()) {
                    //                            clearTimeout(commResults.get_hideTimer());
                    //                        }
                    //                    });

                    // Hide after mouseout of details
                    //                    $jq('#nhs_ResultQuickView' + communityId).mouseout(function () {
                    //                        if (commResults.get_hideTimer())
                    //                            clearTimeout(commResults.get_hideTimer());
                    //                        var t = setTimeout(function () {
                    //                            $jq('#nhs_ResultQuickView' + communityId).hide();
                    //                            $jq('#lnkQuickView' + communityId).removeClass('btn_QuickViewOpen');
                    //                        }, commResults.get_hideDelay());
                    //                        commResults.set_hideTimer(t);
                    //                    });
                },
                error: function (obj, status, error) {
                    NHS.Scripts.Helper.logError(error, '/communityResults/QuickView', "error on quick view");
                }
            });
        } else {
            // data has already been retrieved, just toggle the div
            $jq('#nhs_ResultQuickView' + communityId).toggle();
            $jq('#lnkQuickView' + communityId).toggleClass('btn_QuickViewOpen');
        }
        commResults.set_openQuickViewCommunityId(communityId);
    },

    // Initialize comm results view controls
    _setUpControls: function () {
        var self = this;

        $jq('#nhs_PageCountSelect').change((function (e) {
            this._retrieveResults(1, null, null, false, false);
        }).bind(this));

        $jq('#nhs_ImagePlayerCaption').hide();

        $jq("#nhs_CommResMapListCol .nhs_MapLink").click(function (event) {
            $jq.NhsCancelEventAndStopPropagation(event);
            var id = $jq(this).attr('id');            
	        
            jQuery.googlepush('Search Events', 'Search Results', 'View on Map');
            self.get_log().logEvent('VIEWMAP', id.split('-')[0], id.split('-')[1]);                                 
        });

        brightcove.createExperiences();
        InitGallery(this._galleryParameters);

        // tabs
        $jq('#' + this._tabsControlId + ' li a').click(function () {

            // check if the link is disabled or not
            if ($jq(this).attr("disabled") != true && $jq(this).attr("disabled") != "disabled") {
                if ($jq(this).parent().attr('id') == 'allCommunitiesTab') {
                    self._searchParameters.SpecialOfferComm = 0;
                    self._searchParameters.HomeStatus = 0;
                } else if ($jq(this).parent().attr('id') == 'hotDealsTab') {
                    self._searchParameters.SpecialOfferComm = 1;
                    self._searchParameters.HomeStatus = 0;
                } else if ($jq(this).parent().attr('id') == 'quickMoveInTab') {
                    self._searchParameters.SpecialOfferComm = 0;
                    self._searchParameters.HomeStatus = 5;
                }

                self.update();
            }
            return false;
        });

    },
    // Paging
    _goToPage: function (pageNumber, pagingCommand) {
        this._retrieveResults(pageNumber, pagingCommand, null, false, false);
    },

    _setupBrandCarousel: function () {
        //var brandCount = $jq('#nhs_BuilderPromoBrands div ul li').length;
        //if (brandCount > 3) {
        $jq("#nhs_BuilderPromoBrands div").jCarouselLite({
            auto: 2500,
            speed: 1000,
            vertical: true,
            visible: 1
        });
        //}
    },

    _sortResults: function (sortColumn) {
        switch (sortColumn) {
            case "Random":
                this._searchParameters.SortOrder = 0;
                break;
            case "HomeMatches":
                this._searchParameters.SortOrder = 3;
                break;
            case "Price":
                this._searchParameters.SortOrder = 2;
                break;
            case "Location":
                this._searchParameters.SortOrder = 1;
                break;
            case "Builder":
                this._searchParameters.SortOrder = 4;
                break;
            case "Name":
                this._searchParameters.SortOrder = 7;
                break;
        }

        var option = $jq("#nhs_SortingSelect").find("option:selected");
        var type = option.attr("type");
        $jq.googlepush('Search Events', 'Search Refinement', 'Sort - ' + type);
        this._retrieveResults(1, null, sortColumn, false, false);
    },
    _retrieveResults: function (page, pageCommand, sort, updateMap, trigerByFacets) {
        $jq('#' + this._loadingControlId).show();
        var self = this;
        var data = {};
        data.searchParameters = NHS.Scripts.Helper.JSON.toString(this._searchParameters);
        data.page = page;
        data.pageSize = $jq('#nhs_PageCount').find('option:selected').val() || this._pageSize;
        data.trigerByFacets = trigerByFacets;
        data.showCode = $jq('#ShowCode').val();
        data.searchUrl = self._searchUrl;

        if (sort != null) {
            data.sortColumn = sort;
        }
        if (pageCommand != null) {
            data.pageCommand = pageCommand;
        }
        data.numPostbacks = $jq('#NumPostBacks').val();


        if (this._ajaxCall)
            this._ajaxCall.abort();

        this._ajaxCall = $jq.ajax({
            url: this._searchAction,
            type: "POST",
            data: data,
            success: (function (data) {
                if (data) {

                    //$jq("#nhs_BreadCrumb").load("/common/breadcrumb", { refresh: true });

                    var writeFunction = document.write;
                    document.write = function (t) { $jq(t).appendTo('#nhs_commResultsAd'); };

                    $jq('#nhs_CommResData').html(data);

                    if (self.brandPartnerId == 1 || self.brandPartnerId == 333) {
                        self.ChangeCommuntyImage();
                    }
                    var adData = { position: 'x01', frame: true, jsParameters: false };

                    $jq.ajax({ url: this._adAction, type: "POST", data: adData, success: function (data) { $jq('#nhs_FooterAdBox').html(data); } });

                    document.write = writeFunction;
                    adUpdater.RenderAllAds();
                    $jq(document).ready((function () {

                        tb_init('div.nhs_CommResRow a.thickbox');
                        tb_init('div#nhs_FacetModalPromotions a.thickbox');

                        if (self.brandPartnerId == 88) {
                            tb_init('.pro_SendSelectedBrochures a.thickbox');
                        }

                        var mapStatus = NHS.Scripts.Helper.readCookie("mapState");

                        this.refresh();

                        if (mapStatus && mapStatus == 'expanded')
                            this.showMap(false);
                        else
                            this.hideProgressIndicator();

                        if ($jq('#hdnAdUpdateTop').val() != "" && $jq('#hdnAdUpdateMiddle').val() != "" && $jq('#hdnAdUpdateMiddle3').val() != null && $jq('#hdnAdUpdateRight2').val() != "") {
                            $jq('#nhsIFrameAdTop').attr('src', $jq('#hdnAdUpdateTop').val());
                            $jq('#nhsIFrameAdMiddle').attr('src', $jq('#hdnAdUpdateMiddle').val());
                            $jq('#nhsIFrameAdMiddle3').attr('src', $jq('#hdnAdUpdateMiddle3').val());
                            $jq('#nhsIFrameAdRight2').attr('src', $jq('#hdnAdUpdateRight2').val());
                        } else {
                            $jq('#nhsIFrameAdMiddle').attr('src', $jq('#hdnAdCurrentMiddle').val());
                            $jq('#nhsIFrameAdMiddle3').attr('src', $jq('#hdnAdCurrentMiddle3').val());
                            $jq('#nhsIFrameAdRight2').attr('src', $jq('#hdnAdCurrentRight2').val());
                        }

                        var crumsHtml = jQuery("#nhs_Crumbs").html();

                        jQuery("#nhs_Crumbs").load("/common/breadcrumb",
                        {
                             sParams: this._searchParameters,
                             refresh: true, 
                             marketId : this._parameters.marketId
                        },function(response, status, xhr) {
                            if (status == "error") {
                                jQuery("#nhs_Crumbs").html(crumsHtml);
                            }
                        });
                    }).bind(this));
                    
                    this.AddRemoveBrochure(this.UrlForBrosure, this._MarketIdForBroshure, this._CurrentPageForBrosure);
                }
            }).bind(this),
            error: (function (obj, status, error) {
                NHS.Scripts.Helper.logError(error, this._searchAction, "error on search");
                this.hideProgressIndicator();
            }).bind(this)
        });

    },
    SaveCommunity: function (communityId, builderId) {
        var self = this;
        var community = { communityId: communityId, builderId: builderId };
        $jq.ajax({
            type: "POST",
            url: self.method,
            data: community,
            success: function (saved) {
                if (saved) {
                    $jq("#nhs_SaveThisItem_" + communityId).parent().replaceWith('<span><span class="pro_Saved">Saved to Favorites</span></span>');
                }
            }
        });
    },
    UnCheckAll: function () {
        $jq(".pro_ResultSendBrochure").attr('checked', false);
        $jq("label[for^='pro_ResultSendBrochure_']").html("Select");
        $jq("#pro_SendSelectedBrochuresCount").val("0");
        $jq(".pro_SendSelectedBrochures a.thickbox").hide();
        $jq(".pro_SendSelectedBrochures a.nhs_fake").show();
        $jq(".pro_SendSelectedBrochures a").html("Send Selected Brochures (0)");
    },
    AddRemoveBrochure: function (url, marketId, currentPage) {

        $jq(".pro_ResultSendBrochure").on("change", function () {
            
            var count = parseInt($jq("#pro_SendSelectedBrochuresCount").val());
            var add = true;
            var self = $jq(this);
            var chkIdName = self.attr('id');


            var item2Times = $jq('input[id=' + chkIdName + ']').length;
            var listItems = $jq('input[id=' + chkIdName + ']');

            if (self.is(":checked")) {
                self.parent().find("label[for^='pro_ResultSendBrochure_']").html("Selected");
                count++;
                if (item2Times > 1) {
                    listItems.each(function (index) {
                        $jq(this).parent().find("label[for^='pro_ResultSendBrochure_']").html("Selected");
                        $jq(this).attr('checked', true);
                    });
                }
            } else {
                self.parent().find("label[for^='pro_ResultSendBrochure_']").html("Select");
                count--;
                add = false;
                if (item2Times > 1) {
                    listItems.each(function (index) {
                        $jq(this).parent().find("label[for^='pro_ResultSendBrochure_']").html("Select");
                        $jq(this).attr('checked', false);
                    });
                }
            }

            $jq(".pro_SendSelectedBrochures a").html("Send Selected Brochures (" + count + ")");

            if (count == 0) {
                $jq(".pro_SendSelectedBrochures a.thickbox").hide();
                $jq(".pro_SendSelectedBrochures a.nhs_fake").show();
            } else {
                $jq(".pro_SendSelectedBrochures a.thickbox").show();
                $jq(".pro_SendSelectedBrochures a.nhs_fake").hide();
            }

            $jq("#pro_SendSelectedBrochuresCount").val(count);
            var community = {
                communityId: self.attr("communityId"),
                builderId: self.attr("builderId"),
                isBilled: self.attr("isBilled"),
                marketId: marketId,
                add: add,
                isFeatured: self.attr("isFeatured"),
                page: currentPage,
                position: self.attr("position")
            };
            $jq.ajax({
                type: "POST",
                url: url,
                data: community,
                success: function (count) {
                    $jq(".pro_SendSelectedBrochures a").html("Send Selected Brochures (" + count + ")");

                    if (count == 0) {
                        $jq(".pro_SendSelectedBrochures a.thickbox").hide();
                        $jq(".pro_SendSelectedBrochures a.nhs_fake").show();
                    } else {
                        $jq(".pro_SendSelectedBrochures a.thickbox").show();
                        $jq(".pro_SendSelectedBrochures a.nhs_fake").hide();
                    }
                }
            });

        });

        var allItems = $jq('input[id^=' + 'pro_ResultSendBrochure_' + ']');
        allItems.each(function (index) {
            if ($jq(this).is(":checked"))
                $jq(this).parent().find("label[for^='pro_ResultSendBrochure_']").html("Selected");

        });
    },
    ChangeCommuntyImage: function () {
        if ($jq("#ShowAlternateImage").val() == "true") {
            $jq(".nhs_DefaultImages").remove();
            $jq(".nhs_AlterImages").show();
        }
    }
};
