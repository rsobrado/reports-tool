function onTemplateLoaded(expID) {
    _bcExperienceID = expID;
    commDetail.get_mp().loadMediaPlayer('community');
}

// Global Class for Community Detail Page
NHS.Scripts.CommunityDetail.CommDetail = function (parameters) {
    this._parameters = parameters;
    this.displayFullWidthGallery = parameters.displayFullWidthGallery;
    this.method = parameters.method;
    this._searchParameters = parameters.searchParameters;
    this._searchAction = parameters.searchAction;
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._totalHomes = parameters.totalHomes;
    this._tabsControlId = parameters.tabsControlId;
    this._loadingControlId = parameters.loadingControlId;
    this._partnerId = parameters.partnerId;
    this._isBilled = parameters.isBilled;
    this._showSocialIcons = parameters.showSocialIcons;
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerID: parameters.partnerId, marketId: parameters.marketId });

    this.selectedTab = parameters.SelectedTab;
    this.allNewHomesCount = parameters.AllNewHomesCount;
    this.quickMoveInCount = parameters.QuickMoveInCount;
    this.filteredHomesCount = parameters.FilteredHomesCount;

    parameters.galleryParams.logger = this._log;

    this._mp = new NHS.Scripts.MediaPlayerVideo(parameters.galleryParams);

    parameters.viewerParams.logger = this._log;
    this.imageViewer = new NHS.Scripts.ImageViewer(parameters.viewerParams);

    this.googlePropertyMap = new NHS.Scripts.GooglePropertyMap(parameters.mapParametes);

    this._nearbyHomes = new NHS.Scripts.PropertyMap.NearbyComms(parameters.nearByParams);

    this._paging = new NHS.Scripts.Paging({ onGoToPage: this._goToPage.bind(this) });

    this._sort = new NHS.Scripts.CommunityResults.Sorting({ onSort: this._sortResults.bind(this) });

    InitGallery(parameters.galleryParams);
};

NHS.Scripts.CommunityDetail.CommDetail.prototype =
{
    // Public properties
    get_searchParameters: function () { return this._searchParameters; },
    set_searchParameters: function (params) { this._searchParameters = params; },
    get_log: function () { return this._log; },
    get_drivingDirections: function () { return this._drivingDirections; },
    get_commId: function () { return this._communityId; },
    get_builderId: function () { return this._builderId; },
    get_totalHomes: function () { return this._totalHomes; },
    get_mp: function () { return this._mp; },

    initialize: function () {
        this._setUpControls();
        this._setupTabs();
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
        this.isMediaPlayerOpened = false;
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

        $jq('#nhs_Mediatitle').text('Community Gallery');

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        $jq('#nhs_NextStepsBackSearch').attr('href', $jq('.nhs_BreadcrumbBackSearch').attr('href'));

        $jq('a[href=#top]').live("click", function () {
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

        jQuery('#nhs_propertyMapCollapsibleClose').click(function () {
            jQuery("#Maps").ScrollToFast();
        });

        $jq("#nhs_CommunityDetailsV1 .nhs_DetailsForm #btnFreeBrochure").hover(
            function () {
                $jq(this).addClass("btn_FreeBrochureHover");
            },
            function () {
                $jq(this).removeClass("btn_FreeBrochureHover");
            }
        );
        $jq('.addthis_button_print').click(function () { setTimeout(function () { commDetail.get_log().logEvent('CDSMS', commDetail.get_commId(), commDetail.get_builderId()); }, 1); });

        // Home gallery tabs
        $jq('#' + this._tabsControlId + ' li a').live("click", function () {
            self.filterTab = false;
            $jq(this).parent().parent().find("li").removeClass('nhs_Selected');
            $jq(this).parent().addClass('nhs_Selected');
            if ($jq(this).parent().attr('id') == 'allCommunitiesTab') {
                self.selectedTab = "AllCommunities";
                self._searchParameters.SpecialOfferComm = 0;
                self._searchParameters.HomeStatus = 0;
            } else if ($jq(this).parent().attr('id') == 'quickMoveInTab') {
                self.selectedTab = "QuickMoveIn";
                self._searchParameters.SpecialOfferComm = 0;
                self._searchParameters.HomeStatus = 5;
            } else if ($jq(this).parent().attr('id') == 'newHomesTab') {
                self.selectedTab = "NewHomes";
                self._searchParameters.SpecialOfferComm = 0;
                self._searchParameters.HomeStatus = -1;
            }
            self.update();
            return false;
        });

        $jq('#divLeadMain input#Name, #divLeadMain input#MailAddress').focus(function () {
            $jq('.nhs_LeadCollapse').removeClass('nhs_LeadCollapse').addClass('nhs_LeadExpand');
        });

        $jq('span#nhs_LeadCollapseX').click(function () {
            $jq('.nhs_LeadExpand, #nhs_LeadCollapseX').removeClass('nhs_LeadExpand').addClass('nhs_LeadCollapse');
            $jq('.validation-summary-errors').hide();
        });

        $jq("#nhs_detailDescriptionToggle").live("click", function () {
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

        $jq("#nhs_HomesGalleryLink").live("click", function () {
            var url = window.location.pathname;
            if ($jq(".nhsFlag").hasClass("nhsHideRow")) {
                $jq(".nhsFlag").removeClass("nhsHideRow");
                $jq(".nhsFlag").addClass("nhsShowRow");
                if (url.indexOf("communitydetailv1") != -1)
                    $jq("#nhs_HomesGalleryLink").text('Show only top 9 matching homes');
                else
                    $jq("#nhs_HomesGalleryLink").text('Show only top 12 matching homes');
            }
            else if ($jq(".nhsFlag").hasClass("nhsShowRow")) {
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


        if (this.displayFullWidthGallery && $jq('.nhs_MediaPlayerMaximize').length > 0 && (this._parameters.galleryParams.mediaObjs.length > 0 || this._parameters.galleryParams.externalLinks.length > 0)) {
            this.imageViewer.initialize();

            $jq(document).bind('keydown', (function (evt) { evt = evt || window.event; if (evt.keyCode == 27) { this._closePopupMediaViewer(); } }).bind(self));

            $jq('.nhs_PlayerPopupClose').click((function () { this._closePopupMediaViewer(); }).bind(self));

            $jq('#nhs_mediaPlayerPopup').css('z-index', '10000').height($jq(document).height());

            $jq(".nhs_MediaPlayerMaximize span").click((function (event) {
                this._openGalleryPopup();
            }).bind(this));
        } else {
            $jq('.nhs_MediaShareOverlay').css('right', '5px');
            $jq('.nhs_MediaPlayerMaximize').hide();
            $jq('#nhs_mediaPlayerPopup').hide();
        }

        $jq('a[href=#top]').click(function () {
            $jq('html, body').animate({ scrollTop: 0 }, 'slow');
            return false;
        });
    },
    _openGalleryPopup: function () {
        $jq.googlepush('Image Viewer', 'Community - Gallery', 'Image Viewer - Expand');

        // hide scroll bars and disable scrolling on gallery popup
        $jq('body').css('overflow', 'hidden');
        disableScrollKeys();
        this.imageViewer.scaleSlider(); // resize player after remove the scroll bars                
        $jq('.nhs_PlayerPopupClose').removeClass('leadform');

        this.isMediaPlayerOpened = true;
        $jq('#nhs_mediaPlayerPopup').css('padding-top', $jq(document).scrollTop() + 'px').show();

        $jq("#btnFreeBrochure").addClass('popup');
        $jq('#divLeadMain').appendTo('#nhs_playerLeadForm');

        //                if ($jq('#nhs_PlayerCommunityName').length > 0) {
        //                    $jq('#liSaveToPlanner').appendTo('#nhs_FavIconContainer');
        //                    this.favText = $jq('#nhs_SaveThisItem').text();
        //                    $jq('#nhs_SaveThisItem').text('');
        //                }
    },
    _closePopupMediaViewer: function () {
        $jq('#nhs_mediaPlayerPopup').hide();
        $jq('body').css('overflow', 'auto');
        $jq('.validation-summary-errors').hide();
        $jq('#divLeadMain').appendTo('.nhs_DetailsFormWrapper>div:first');
        $jq("#btnFreeBrochure").removeClass('popup');

        //                        $jq('#liSaveToPlanner').prependTo('#nhs_FormSaveSend');
        //                        $jq('#nhs_SaveThisItem').text(this.favText);

        this.imageViewer.stopVideo();
        this.isMediaPlayerOpened = false;

        enableScrollKeys();

        if (!$jq('.nhs_PlayerPopupClose').is('.leadform')) {
            $jq.googlepush('Image Viewer', 'Image Viewer', 'Image Viewer - Close');
        }
    },
    _setupTabs: function () {
        $jq('div.tabdiv').hide();
        $jq('div.tabdiv:first').show();
        $jq('#nhs_CommDetailsMainTabs li:first').addClass('nhs_Selected');

        $jq('#nhs_CommDetailsMainTabs li a').click(function () {
            $jq('#nhs_CommDetailsMainTabs li').removeClass('nhs_Selected');
            $jq(this).parent().addClass('nhs_Selected');
            var currentTab = $jq(this).attr('href');
            $jq('div.tabdiv').hide();
            $jq(currentTab).show();
            if (currentTab == '#nhs_CommDetailsTabInfoDiv') {
                FB.XFBML.parse();
            }
            return false;
        });
    },
    _sort2: function () {
        var self = this;

        $jq('#SortOptionSelected').live("change", function (event) {
            self._sortResults(event.currentTarget.value);
        });

    },
    // Paging
    _goToPage: function (pageNumber) {
        this._retrieveResults(pageNumber, null);
    },

    update: function () {
        this._retrieveResults(1, null);
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

        this._retrieveResults(1, sortColumn);
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

    _retrieveResults: function (page, sort) {
        jQuery.ShowLoading();
        var self = this;
        var url = this._searchAction + "?" + this.ToString(this._searchParameters) + "&page=" + page + "&sortColumn=" + sort + "&selectedTab=" + this.selectedTab +
            "&allNewHomesCount=" + this.allNewHomesCount +
            "&quickMoveInCount=" + this.quickMoveInCount +
            "&filteredHomesCount=" + this.filteredHomesCount;
        $jq.ajax({
            url: url,
            type: "POST",
            success: (function (data) {
                $jq('#ViewHomes').html(data);
                self._paging.initialize();
                jQuery.HideLoading();
            }).bind(this),
            error: function (obj, status, error) {
                NHS.Scripts.Helper.logError(error, this._searchAction, "error on search");
                jQuery.HideLoading();
            }
        });
    },
    ToString: function (obj) {
        var json = [];
        for (n in obj) {
            var v = obj[n];
            var t = typeof (v);
            if (t !== "object" && v !== null)
                if (v !== false && v !== 0)
                    json.push(n + '=' + v);
        }
        return json.join("&");
    },
    SaveCommunity: function () {
        var self = this;
        var community = { communityId: self._communityId, builderId: self._builderId };
        $jq.post(self.method, community, (function (json) {
            self.ShowSuccessMessage(json);
            if (json.data == undefined) {
                $jq('#nhs_NextStepsSaveThisItem').removeAttr('onclick');
                $jq('#nhs_NextStepsSaveThisItem').removeAttr('href');
                $jq('#pSaveThisItem').html('<span class="nhs_ItemSaved" id="nhs_NextStepsSaveThisItem">Saved to your profile</span>');
                $jq('#liSaveToPlanner').html('<span id=\"nhs_SaveThisItem\">Saved</span>');
                //                this.favText = $jq('#nhs_SaveThisItem').text();
                //                if (this.isMediaPlayerOpened)
                //                    $jq('#nhs_SaveThisItem').text('');
            }
        }).bind(this), "json");
    },
    NextStepsSaveCommunity: function () {
        this.SaveCommunity();
        loggin.LogNextStepsSave();
    },
    ShowSuccessMessage: function (json) {
        if (json.data != undefined) {
            window.location.href = json.redirectUrl;
        }
        else {
            $jq("#nhs_SaveThisItem").hide();
            $jq("#SuccessMessage").show();
        }
    }
};
var paging;
