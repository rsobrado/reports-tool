NHS.Scripts.GooglePropertyMap = function (parameters) {
    this.parameters = parameters;
    this.isMapCreate = false;

    this.log = new NHS.Scripts.Globals.EventLogger({
        siteRoot: parameters.siteRoot,
        fromPage: parameters.fromPage,
        partnerId: parameters.partnerId,
        marketId: parameters.marketId
    });
};

NHS.Scripts.GooglePropertyMap.prototype =
{
    init: function () {
        jQuery('#dd-collapsible').hide();
        jQuery('#nhs_propertyMapCollapsibleClose').hide();

        var self = this;
        var parameters = self.parameters;
        var mapOptions = this.parameters.OptionsForMap;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);
        googleApi.initializeAutoComplete();

        googleApi.getIconMarkerPoint = function (results, result) {
            if (result.MarketPoints.length > 1)
                return parameters.iconNearByCommMulti;
            return parameters.iconNearByComm;
        };

        googleApi.options.Events.MarkerClickCallBack = function (info, infowindow, infowindowTooltip, marker) {
            if (info) {
                var commIds = [];
                for (var i = 0; i < info.MarketPoints.length; i++) {
                    commIds.push(info.MarketPoints[i]['CommunityId'] + "|" + 0);
                }

                jQuery.ajax({
                    url: parameters.getCommunityMapCards,
                    type: "GET",
                    data: {
                        commIds: commIds.join(),
                        basicIds: ""
                    },
                    success: function (html) {
                        if (html) {
                            infowindow.setContent(html);
                            infowindow.open(googleApi.map, marker);
                            tb_initLive("a.thickbox");
                        }
                    }
                });
            }
        };

        googleApi.placeChangedProcess = function (marker, autocomplete) {
            var place = autocomplete.getPlace();
            self.location = place.geometry.location;
        };

        jQuery('#nhs_PropertyMap').width(parameters.mapWidth).height(parameters.mapHeight);
        jQuery('#nhs_propertyMapCollapsibleOpen, #nhs_mapTab').click(function (event) {
            jQuery.NhsCancelEvent(event);

            if (jQuery("#dd-collapsible").css('display') == 'none') {
                jQuery('#dd-collapsible').toggle('fast');
            }
            jQuery('#nhs_propertyMapCollapsibleOpen').hide();
            jQuery('#nhs_propertyMapCollapsibleClose').show();

            if (self.isMapCreate) {
                self.log.logMultiEvent('BLMAPV', self.parameters.communityId, self.parameters.builderId, 0, 0);
            }

            if (!self.isMapCreate) {
                self.isMapCreate = true;
                googleApi.createMap();
                if (self.parameters.NearbyComms) {
                    googleApi.processResult(self.parameters.NearbyComms);
                }
                google.maps.event.addListener(googleApi.map, 'idle', self.RemoveGoogleInfo);
                googleApi.createMarkerPoint(mapOptions.MapOptions.Latitude, mapOptions.MapOptions.Longitude, null, null, self.parameters.icon, null);
                self.logClickEvent_propertyMapExpand();
            }
        });

        jQuery('#nhs_propertyMapCollapsibleClose').click(function (event) {
            jQuery.NhsCancelEvent(event);
            jQuery('#dd-collapsible').toggle('fast');
            jQuery('#nhs_propertyMapCollapsibleClose').hide();
            jQuery('#nhs_propertyMapCollapsibleOpen').show();
        });

        self.InitDrivingDirection();
    },

    logClickEvent_propertyMapExpand: function () {
        var self = this;

        var alreadyClicked = NHS.Scripts.Helper.readCookie('drivingDirectionsClicked');
        if (!parseInt(alreadyClicked)) {
            if (self.parameters.isBasicCommunity) {
                self.log.logMultiEvent('bcMapSectionReveal', self.parameters.communityId, self.parameters.builderId, 0, 0);
                jQuery.googlepush('Basic Listing', 'Driving Directions', self.parameters.communityId, 2, false);
            } else if (self.parameters.isBasicListing) {
                //just do nothing               
            } else if (self.parameters.specId > 0 || self.parameters.planId > 0)
                self.log.logMultiEvent('HDSDD', self.parameters.communityId, self.parameters.builderId, self.parameters.planId, self.parameters.specId);
            else
                self.log.logMultiEvent('CDSDD', self.parameters.communityId, self.parameters.builderId, 0, 0);

            NHS.Scripts.Helper.createCookie('drivingDirectionsClicked', 1, 0);
        }
    },

    InitDrivingDirection: function () {
        var self = this;
        var date = new Date();
        var currentMonth = date.getMonth();
        var currentDate = date.getDate();
        var currentYear = date.getFullYear();
        jQuery('#nhs_drivingDirections').show();

        jQuery('#tabMQMap a').click(
            function () {
                if (!jQuery('#nhs_PropertyMap').is(':visible')) {
                    jQuery('#nhs_PropertyMap').toggle();
                    jQuery(this).toggleClass('On');
                    jQuery(jQuery('#tabBuilderMap').find('a')[0]).toggleClass('On');
                    jQuery('#nhs_BuilderPropertyMap').toggle();
                    jQuery('#nhs_drivingDirections').hide();
                    jQuery('#nhs_GetDirections').show();
                    jQuery('#nhs_drivingDirections').show();
                }

                return false;
            }
        );

        jQuery('#tabBuilderMap a').click(
            function () {
                if (!jQuery('#nhs_BuilderPropertyMap').is(':visible')) {
                    jQuery('#nhs_BuilderPropertyMap').toggle();
                    jQuery(this).toggleClass('On');
                    jQuery(jQuery('#tabMQMap').find('a')[0]).toggleClass('On');
                    jQuery('#nhs_PropertyMap').toggle();
                    jQuery('#nhs_drivingDirections').show();
                    jQuery('#nhs_GetDirections').hide();
                    jQuery('#nhs_drivingDirections').show();
                }

                var alreadyBuilderMapClicked = NHS.Scripts.Helper.readCookie('drivingDirectionsBuilderMapClicked');

                if (!alreadyBuilderMapClicked) {
                    if (!self.parameters.isBasicListing || !self.parameters.isBasicCommunity) {
                        if (self.parameters.specId > 0 || self.parameters.planId > 0) {
                            self.log.logMultiEvent('HDSDD', self.parameters.communityId, self.parameters.builderId, self.parameters.planId, self.parameters.specId);
                        } else {
                            self.log.logMultiEvent('CDSDD', self.parameters.communityId, self.parameters.builderId, 0, 0);
                        }
                    }

                    NHS.Scripts.Helper.createCookie('drivingDirectionsBuilderMapClicked', 1, 0);
                }

                return false;
            }
        );

        jQuery("#nhsTxtDate").kendoDatePicker({
            min: new Date(),            
            change: function () {
                var kdate = kendo.toString(this.value(), 'd');
                var link = jQuery(".btn_NhsMapSend"); 
                var linkHref = link.attr('href');
                if (typeof linkHref != "undefined") {
                    var linkComment = linkHref.substring(linkHref.indexOf('=') + 1, linkHref.indexOf('&'));
                    link.attr('href', encodeURI(linkHref.replace(linkComment, kdate)));
                }
            },
            month: {
                empty:'<div class="kdp-outofdayarray">#= data.value #</div>'
            }
        });

        jQuery("#nhsTxtDate").attr("disabled", "disabled");

        jQuery('#btnUpdate').click(function () {
            if (self.parameters.isBasicCommunity) {
                self.log.logMultiEvent('bcRoute', self.parameters.communityId, self.parameters.builderId, self.parameters.planId, self.parameters.specId);
                jQuery.googlepush('Basic Listing', 'Driving Route', self.parameters.communityId, 4, false);
            } else if (self.parameters.isBasicListing) {
                //do nothing with this
            }
            else if (self.parameters.specId > 0 || self.parameters.planId > 0) {
                self.log.logMultiEvent('HDSHWRT', self.parameters.communityId, self.parameters.builderId, self.parameters.planId, self.parameters.specId);
                self.log.logMultiEvent('HDSDD', self.parameters.communityId, self.parameters.builderId, self.parameters.planId, self.parameters.specId);
            } else {
                self.log.logMultiEvent('CDSHWRT', self.parameters.communityId, self.parameters.builderId, 0, 0);
                self.log.logMultiEvent('CDSDD', self.parameters.communityId, self.parameters.builderId, 0, 0);
            }
            if (self.location) {
                var left = (screen.width - 840) / 2;
                var top = (screen.height - 600) / 2;
                var address = jQuery("#nhsTxtStreeAddress").val();
                jQuery('#nhsWrongAddress').hide();
                //self.parameters
                var url = self.parameters.drivingDirectionAction + '?communityId=' + self.parameters.communityId +
                    "&lat=" + self.location.lat() + "&lng=" + self.location.lng() + '&check=false' + '&isBasicListing=' + self.parameters.isBasicListing + '&startingPoint=' + address; ;
                jQuery.SetDataLayerPair('siteDrivingRoute');
                window.open(url, '_blank', 'width=840,height=600,top=' + top + ',left=' + left + ',menubar=yes,status=no,location=no,toolbar=no,scrollbars=yes');
            } else {

                var address = jQuery("#nhsTxtStreeAddress").val();
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var url = self.parameters.drivingDirectionAction + '?communityId=' + self.parameters.communityId +
                            "&lat=" + results[0].geometry.location.lat()
                            + "&lng=" + results[0].geometry.location.lng() + '&check=false' + '&isBasicListing=' + self.parameters.isBasicListing + '&startingPoint=' + address;
                        jQuery.SetDataLayerPair('siteDrivingRoute');
                        window.open(url, '_blank', 'width=840,height=600,top=' + top + ',left=' + left + ',menubar=yes,status=no,location=no,toolbar=no,scrollbars=yes');
                    } else {
                        jQuery('#nhsWrongAddress').show();
                    }
                });
            }

            return false;
        });

    },
    RemoveGoogleInfo: function () {
        if (jQuery(".gm-style > div > a").attr("href")) {
            var aux;
            var len = jQuery('.gm-style-cc').length;
            for (aux = 1; aux < len; aux += 1) {
                jQuery('.gm-style-cc').eq('-1').remove();
            }
            jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title");
        }
    }
};
