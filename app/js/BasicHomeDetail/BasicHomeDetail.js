// Global Class for Basic Home Details Page
NHS.Scripts.CommunityDetail.BasicHome = function (parameters) {

    this._parameter = parameters;
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, partnerId: parameters.partnerId, marketId: parameters.marketId });
};

NHS.Scripts.CommunityDetail.BasicHome.prototype =
{
    // Public properties
    get_log: function () { return this._log; },

    initialize: function () {
        var self = this;

        if (this._parameter.feedProviderId == 1) {
            self.get_log().logListHubEvent(this._parameter.listHubProviderId, this._parameter.listHubTestLogging, this._parameter.desckey, this._parameter.basicListingNumber);
        }

        //Add because issue 50114
        //Log the Event for Map Showing (Moved from Show action in the controller for ticket 57096)
        //this.get_log().logBasicListingEvent('BLMAPV', this._parameter.communityId);
        this.get_log().logBasicListingEvent('BLDetail', this._parameter.communityId);

        var googlePropertyMap = new NHS.Scripts.GooglePropertyMap(this._parameter.mapParametes);
        googlePropertyMap.init();

        var params = {
            brandPartnerId: this._parameter.brandPartnerId,
            marketId: this._parameter.marketId,
            siteRoot: this._parameter.siteRoot,
            partnerId: this._parameter.partnerId,
            specId: this._parameter.specId,
            planId: this._parameter.planId,
            communityId: this._parameter.communityId,
            builderId: this._parameter.builderId
        };

        nearbyHomes = new NHS.Scripts.PropertyMap.NearbyComms(params);
        nearbyHomes.attachClickEventsToCommLinks();
        //******************************************************************************
        //Fix for the ticket: 49294 Basic Listing Detail Page :: Design Updates      
        //******************************************************************************
        $jq('#nhs_propertyMapCollapsibleOpen').click();
        //$jq('#nhs_propertyMapCollapsibleClose').hide();
        //******************************************************************************
        $jq('#nhs_PhoneLink').click(function () {
            var lnkPhoneNumber = $jq('#nhs_LnkPhoneNum');

            if (lnkPhoneNumber === null) return;

            lnkPhoneNumber.hide();
            $jq('#nhs_FormPhone').show();
            jQuery.SetDataLayerPair('sitePhoneNumV');

            self.get_log().logBasicListingEvent(self._parameter.logevent, self._parameter.builderId);
            if (self._parameter.feedProviderId == 1) {
                self.get_log().logListHubEvent(self._parameter.listHubProviderId, self._parameter.listHubTestLogging, self._parameter.AgentPhoneClicked, self._parameter.basicListingNumber);
            }

        });

        $jq('#btnUpdate').click(function () {
            self.get_log().logBasicListingEvent(self._parameter.logeventShowRoute, self._parameter.builderId);
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

        this._updateAdsPosition();

    },

    _updateAdsPosition: function () {
        if ((jQuery('.nhs_Content').length > 0) & (jQuery('#nhs_AdColumn').length > 0)) {
            //floating column
            var colHeight = jQuery('.nhs_Content').height();
            this._adsHeight = jQuery('#nhs_AdColumn').height();

            var colBottom = colHeight + jQuery('#nhs_AdColumn').offset().top;

            var adsTop = colHeight - this._adsHeight - 10;
            var adsBottom = this._adsHeight + jQuery('#nhs_AdColumn').offset().top;
            var browserHeight = jQuery(window).height();
            var browserBottomY;

            jQuery(window).scroll((function (event) {

                // what the y position of the scroll is
                var y = jQuery(document).scrollTop();
                colHeight = jQuery('.nhs_Content').height();

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
    }
};
