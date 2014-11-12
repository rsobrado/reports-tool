function onTemplateLoaded(expID) {
    _bcExperienceID = expID;
    commDetail.get_mp().loadMediaPlayer('community');
}

// Global Class for Community Detail Page
NHS.Scripts.BasiCommunityDetail = function (parameters) {

    this.method = parameters.method;
    this._searchParameters = parameters.searchParameters;
    this._searchAction = parameters.searchAction;
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._tabsControlId = parameters.tabsControlId;
    this._loadingControlId = parameters.loadingControlId;
    this._partnerId = parameters.partnerId;
    this._isBilled = parameters.isBilled;
    this._showSocialIcons = parameters.showSocialIcons;
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerID: parameters.partnerId, marketId: parameters.marketId });
    this._currentSort = null;

    parameters.galleryParams.logger = this._log;
    this._mp = new NHS.Scripts.MediaPlayerVideo(parameters.galleryParams);

    this.googlePropertyMap = new NHS.Scripts.GooglePropertyMap(parameters.mapParametes);

    this._nearbyHomes = new NHS.Scripts.PropertyMap.NearbyComms(parameters.nearByParams);

    this._paging = new NHS.Scripts.Paging({ onGoToPage: this._goToPage.bind(this) });

    this._sort = new NHS.Scripts.CommunityResults.Sorting({ onSort: this._sortResults.bind(this) });

    InitGallery(parameters.galleryParams);
};

NHS.Scripts.BasiCommunityDetail.prototype =
{
    // Public properties
    get_searchParameters: function () { return this._searchParameters; },
    set_searchParameters: function (params) { this._searchParameters = params; },
    get_log: function () { return this._log; },
    get_drivingDirections: function () { return this._drivingDirections; },
    get_commId: function () { return this._communityId; },
    get_builderId: function () { return this._builderId; },
    get_mp: function () { return this._mp; },

    initialize: function () {
        this._setUpControls();
        this._paging.initialize();
        this._sort2();

        this.googlePropertyMap.init();
        this._nearbyHomes.attachClickEventsToCommLinks();
        this._updateAdsPosition();
    },

    initializeEvents: function () {
        this._setUpControls();
        this._paging.initialize();
    },

    // Hide Progress Indicator
    hideProgressIndicator: function () {
        $jq('#' + this._loadingControlId).hide();
    },


    // Initialize comm results view controls
    _setUpControls: function () {
        var self = this;

        if (self._showSocialIcons.toLowerCase() == 'false') {
            $jq('#addthis_bookmark').remove();
            $jq('.addthis_separator').remove();
            $jq('.addthis_button_facebook').remove();
            $jq('.addthis_button_twitter').remove();
            $jq('.nhs_DetailSmBrandImg').remove();
            $jq('.builder_link').remove();

            $jq('#addthis_more_sharing').remove();
            $jq('#addthis_bookmark_bottom').remove();
            $jq('.nhs_MediaShareOverlay, .nhs_PinterestOverlayBig').hide();
            $jq('#brochure_pro_step2').remove();
        }

        $jq('a[href=#top]').click(function () {
            $jq('html, body').animate({ scrollTop: 0 }, 'slow');
            return false;
        });
        $jq(window).bind("mousewheel", function () {
            $jq("html, body").stop();
        });
        $jq(window).bind("keydown", function (event) {
            var keyCode = event.which;
            /* up, down, left, right, or page up or page down */
            if (keyCode === 33 || keyCode == 34 || (keyCode >= 37 && keyCode <= 40)) {
                $jq("html, body").stop();
            }
        });

        $jq('.addthis_button_print').click(function () {
            setTimeout(function () { commDetail.get_log().logEvent('bcPrint', commDetail.get_commId(), commDetail.get_builderId()); }, 1);
            $jq.googlepush('Basic Listing', 'Print Page', commDetail.get_commId(),null,false);
        });

        $jq('#button_pin_it a,.addthis_button_email,#btn_fb_mh,#btn_tw_mh').click(function () {
            setTimeout(function () { commDetail.get_log().logEvent('bcSocialShare', commDetail.get_commId(), commDetail.get_builderId()); }, 1);
            $jq.googlepush('Basic Listing', 'Social Media Share', commDetail.get_commId(), 1, false);
        });

        
        if (typeof addthis != 'undefined') {
            addthis.addEventListener('addthis.menu.share', function(evt) {
                if (_callAddThis) {
                    if (evt.data.service == "print") {
                        setTimeout(function() { commDetail.get_log().logEvent('bcPrint', commDetail.get_commId(), commDetail.get_builderId()); }, 1);
                        $jq.googlepush('Basic Listing', 'Print Page', commDetail.get_commId(), null, false);
                    } else {
                        setTimeout(function () { commDetail.get_log().logEvent('bcSocialShare', commDetail.get_commId(), commDetail.get_builderId()); }, 1);
                        $jq.googlepush('Basic Listing', 'Social Media Share', commDetail.get_commId(), 1, false);
                    }
                }
            });
        }
        
        $jq('#galleryList a').click(function () {
            setTimeout(function () { commDetail.get_log().logEvent('bcViewPicture', commDetail.get_commId(), commDetail.get_builderId()); }, 1);
            $jq.googlepush('Basic Listing', 'Photo View', commDetail.get_commId(),null,false);
        });

        
        $jq("#nhs_detailDescriptionToggle").click(function () {
            if ($jq('#nhs_detailDescriptionToggle').text().trim() == "...more") {
                $jq('#nhs_detailDescriptionToggle').text("less");
                $jq("#nhsDetailDescriptionArea").html("");
                $jq("#nhsDetailDescriptionArea").html(Encoder.htmlDecode(description));
                return false;
            } else {
                $jq('#nhs_detailDescriptionToggle').text("...more");
                $jq("#nhsDetailDescriptionArea").html("");
                $jq("#nhsDetailDescriptionArea").html(Encoder.htmlDecode(chunkedDescription));
                return false;
            }
        });

        $jq("#nhs_HomesGalleryLink").click(function () {
            var url = window.location.pathname;
            if ($jq(".nhsFlag").hasClass("nhsHideRow")) {
                $jq(".nhsFlag").removeClass("nhsHideRow");
                $jq(".nhsFlag").addClass("nhsShowRow");
                if (url.indexOf("communitydetailv1") != -1)
                    $jq("#nhs_HomesGalleryLink").text('Show only top 9 matching homes');
                else
                    $jq("#nhs_HomesGalleryLink").text('Show only top 12 matching homes');
            } else if ($jq(".nhsFlag").hasClass("nhsShowRow")) {
                $jq(".nhsFlag").removeClass("nhsShowRow");
                $jq(".nhsFlag").addClass("nhsHideRow");
                if (url.indexOf("communitydetailv1") != -1)
                    $jq("#nhs_HomesGalleryLink").text('9 matching homes shown. See all »');
                else
                    $jq("#nhs_HomesGalleryLink").text('12 matching homes shown. See all »');
            }
            metricLogger.logHomeResultsMetrics('CDHV', 0);
            return false;
        });

        $jq('a[href=#top]').click(function () {
            $jq('html, body').animate({ scrollTop: 0 }, 'slow');
            return false;
        });
    },

    _sort2: function () {
        var self = this;

        $jq('#SortOptionSelected').change(function (event) {
            self._sortResults(event.currentTarget.value);
        });

    },
    // Paging
    _goToPage: function (pageNumber) {
        this._retrieveResults(pageNumber, null, false);
    },

    update: function () {
        this._retrieveResults(1, null, true);
    },

    _updateAdsPosition: function () {
        if ((jQuery('#nhs_CommunityDetails').length > 0) & (jQuery('#nhs_AdColumn').length > 0)) {
            //floating column
            var colHeight = jQuery('#nhs_CommunityDetails').height();
            this._adsHeight = jQuery('#nhs_AdColumn').height();

            var colBottom = colHeight + jQuery('#nhs_AdColumn').offset().top;

            var adsTop = colHeight - this._adsHeight - 10;
            var adsBottom = this._adsHeight + jQuery('#nhs_AdColumn').offset().top;
            var browserHeight = jQuery(window).height();
            var browserBottomY;

            jQuery(window).scroll((function (event) {

                // what the y position of the scroll is
                var y = jQuery(document).scrollTop();
                colHeight = jQuery('#nhs_CommunityDetails').height();

                colBottom = colHeight + jQuery('#nhs_AdColumn').offset().top;

                adsTop = colHeight - this._adsHeight - 10;
                adsBottom = this._adsHeight + jQuery('#nhs_AdColumn').offset().top;
                browserHeight = jQuery(window).height();
                browserBottomY = y + browserHeight;
                //console.log(colHeight);
                //console.log(this._adsHeight);
                //console.log(adsTop);

                // is list column longer than ad column
                if (colBottom > adsBottom) {
                    // whether scroll is below the ad's top position
                    if (y >= (adsBottom - browserHeight)) {
                        // if so, ad the fixed class          
                        if (browserBottomY > colBottom) {
                            jQuery('#nhs_AdColumn > div').removeClass('fixedBottom');
                            jQuery('#nhs_AdColumn > div').addClass('absolute');
                            jQuery('#nhs_AdColumn > div').css('top', (adsTop + 'px'));
                            jQuery('#nhs_AdColumn > div').css('bottom', 'auto');
                        } else {
                            jQuery('#nhs_AdColumn > div').removeClass('absolute');
                            jQuery('#nhs_AdColumn > div').addClass('fixedBottom');
                            jQuery('#nhs_AdColumn > div').css('top', 'auto');
                            jQuery('#nhs_AdColumn > div').css('bottom', 0);
                        }
                    } else {
                        // otherwise remove it
                        jQuery('#nhs_AdColumn > div').removeClass('fixedBottom');
                        jQuery('#nhs_AdColumn > div').removeClass('absolute');
                        jQuery('#nhs_AdColumn > div').css('top', 'auto');
                        jQuery('#nhs_AdColumn > div').css('bottom', 'auto');
                    }
                }

            }).bind(this));
        }
    },

    _sortResults: function (sortColumn) {
        switch (sortColumn) {
            case "homematches":
                this._searchParameters.SortOrder = 3;
                break;
            case "Price":
                this._searchParameters.SortOrder = 2;
                break;
            case "Size":
                this._searchParameters.SortOrder = 6;
                break;
            case "Status":
                this._searchParameters.SortOrder = 5;
                break;
            case "Name":
                this._searchParameters.SortOrder = 7;
                break;
        }

        this._retrieveResults(1, sortColumn, false);
    },

    _getCurrentSort: function () {
        var curr = $jq('#SortOptionSelected').val();
        switch (curr) {
            case "homematches":
                this._currentSort = 3;
                break;
            case "Price":
                this._currentSort = 2;
                break;
            case "Size":
                this._currentSort = 6;
                break;
            case "Status":
                this._currentSort = 5;
                break;
            case "Name":
                this._currentSort = 7;
                break;
        }
        return this._currentSort;
    },

    _retrieveResults: function (page, sort, updateMap) {
        $jq('#' + this._loadingControlId).show();
        if (sort == null)
            sort = this._getCurrentSort();
        $jq.ajax({
            url: this._searchAction,
            type: "POST",
            data: { searchParameters: NHS.Scripts.Helper.JSON.toString(this._searchParameters), page: page, sortColumn: sort },
            success: (function (data) {
                $jq('#ViewHomes').html(data);
                this.initializeEvents();
            }).bind(this),
            error: function (obj, status, error) {
                NHS.Scripts.Helper.logError(error, this._searchAction, "error on search");
            }
        });

        this.hideProgressIndicator();
    }
};
var paging;
