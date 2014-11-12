function onTemplateLoaded(expID) {
    _bcExperienceID = expID;
    homeDetail.get_mp().loadMediaPlayer('home');
}

NHS.Scripts.HomeDetail.HomeDetails = function (parameters) {
    this._parameters = parameters;
    this.displayFullWidthGallery = parameters.displayFullWidthGallery;
    this.method = parameters.method;
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._planId = parameters.specId > 0 ? 0 : parameters.planId;
    this._specId = parameters.specId;
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerID: parameters.partnerId, marketId: parameters.marketId });
    this._type = parameters.fromPage;
    this._showSocialIcons = parameters.showSocialIcons;

    _commIdHD = parameters.communityId;
    _builderIdHD = parameters.builderId;

    parameters.galleryParams.logger = this._log;
    this._mp = new NHS.Scripts.MediaPlayerVideo(parameters.galleryParams);

    parameters.viewerParams.logger = this._log;
    this.imageViewer = new NHS.Scripts.ImageViewer(parameters.viewerParams);

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    this.googlePropertyMap = new NHS.Scripts.GooglePropertyMap(parameters.mapParametes);

    this._nearbyHomes = new NHS.Scripts.PropertyMap.NearbyComms(parameters.carouselParams);
    this._homeCarousel = new NHS.Scripts.HomeDetail.Carousel(parameters.carouselParams);
    InitGallery(parameters.galleryParams);
};

NHS.Scripts.HomeDetail.HomeDetails.prototype =
{
    get_log: function () { return this._log; },
    get_mp: function () { return this._mp; },
    get_commId: function () { return this._communityId; },
    get_builderId: function () { return this._builderId; },
    get_plan: function () { return this._planId; },
    get_spec: function () { return this._specId; },

    initialize: function () {
        this._setUpControls(),
        this.googlePropertyMap.init();
        this._homeCarousel.initialize();
        this._nearbyHomes.attachClickEventsToCommLinks();
        this._updateAdsPosition();
    },

    // Initialize home details view controls
    _setUpControls: function () {

        if (this._showSocialIcons.toLowerCase() == 'false') {
            $jq('#addthis_bookmark').hide();
            $jq('.addthis_separator').hide();
            $jq('.addthis_button_facebook').hide();
            $jq('.addthis_button_twitter').hide();
            $jq('.nhs_DetailSmBrandImg').hide();
            $jq('.builder_link').hide();

            $jq('#addthis_more_sharing').hide();
            $jq('#addthis_bookmark_bottom').hide();
            $jq('.nhs_MediaShareOverlay, .nhs_PinterestOverlayBig').hide();
            $jq('#brochure_pro_step2').hide();
        }

        $jq('#nhs_NextStepsBackSearch').attr('href', $jq('.nhs_BreadcrumbBackSearch').attr('href'));

        if (this._type.indexOf('v3') != -1 || this._type.indexOf('v4') != -1) {
            $jq('#nhs_AdColumn').css('margin-top', '118px');
            $jq('#mv_AdColumn').css('margin-top', '118px');
        }

        $jq("#btnFreeBrochure").hover(
              function () {
                  $jq(this).addClass("btn_FreeBrochureHover");
              },
              function () {
                  $jq(this).removeClass("btn_FreeBrochureHover");
              }
            );

        $jq('#button_pin_it a').click(function () { setTimeout(function () { homeDetail.get_log().logEvent('HDSMS', homeDetail.get_commId(), homeDetail.get_builderId(), homeDetail.get_plan(), homeDetail.get_spec()); }, 1); });

        if (this.displayFullWidthGallery && $jq('.nhs_MediaPlayerMaximize').length > 0 && (this._parameters.galleryParams.mediaObjs.length > 0 || this._parameters.galleryParams.externalLinks.length > 0)) {
            this.imageViewer.initialize();
            $jq(document).bind('keydown', (function (evt) { evt = evt || window.event; if (evt.keyCode == 27) { this._closePopupMediaViewer(); } }).bind(this));

            $jq('.nhs_PlayerPopupClose').click((function () { this._closePopupMediaViewer(); }).bind(this));

            $jq('#nhs_mediaPlayerPopup').css('z-index', '10000').height($jq(document).height());

            $jq(".nhs_MediaPlayerMaximize span").click((function (event) {
                this._openGalleryPopup();
            }).bind(this));
        } else {
            $jq('.nhs_MediaShareOverlay').css('right', '5px');
            $jq('.nhs_MediaPlayerMaximize').hide();
            $jq('#nhs_mediaPlayerPopup').hide();
        }

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
        $jq('body').css('overflow', 'auto');
        $jq('#nhs_mediaPlayerPopup').hide();
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
    _updateAdsPosition: function () {
        if ((jQuery('#nhs_DetailsMain').length > 0) & (jQuery('#nhs_AdColumn').length > 0)) {
            //floating column
            var colHeight = jQuery('#nhs_DetailsMain').height();
            this._adsHeight = jQuery('#nhs_AdColumn').height();

            var colBottom = colHeight + jQuery('#nhs_AdColumn').offset().top;

            var adsTop = colHeight - this._adsHeight - 10;
            var adsBottom = this._adsHeight + jQuery('#nhs_AdColumn').offset().top;
            var browserHeight = jQuery(window).height();
            var browserBottomY;

            jQuery(window).scroll((function (event) {

                // what the y position of the scroll is
                var y = jQuery(document).scrollTop();
                colHeight = jQuery('#nhs_DetailsMain').height();

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
    SaveHome: function () {
        var self = this;
        $jq.post(self.method, null, (function (json) {
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
    NextStepsSaveHome: function () {
        this.SaveHome();
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
}
