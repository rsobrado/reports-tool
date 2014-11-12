// Global Class for Community Detail Page
NHS.Scripts.PropertyMap.DrivingDirections = function (parameters) {

    this._drivingDirectionAction = parameters.drivingDirectionAction;
    this._resourceRoot = parameters.resourceRoot;

    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._planId = parameters.specId > 0 ? 0 : parameters.planId;
    this._specId = parameters.specId;
    this._isBasicListing = parameters.isBasicListing == null ? false : parameters.isBasicListing;
    this._isBasicCommunity = parameters.isBasicCommunity == null ? false : parameters.isBasicCommunity;
    this._drivingDirectionsButton = 'btnUpdate';
    this._drivingDirectionsTextBox = 'nhsTxtDate';
    this._drivingDirectionsDiv = 'nhsDrivingDirections';
    this._drivingDirectionsError = 'nhsWrongAddress';
    this._showDrivingDirectionsControlId = 'nhs_BuilderDir';
    this._drivingDirectionsControlId = 'nhs_drivingDirections';
    this._dateTimeBoxId = 'nhsTxtDate';
    var mapParameters = {
        brandPartnerId: parameters.brandPartnerId,
        propertyDetailAction: parameters.propertyDetailAction,
        commLat: parameters.commLat,
        commLng: parameters.commLng,
        startLat: parameters.startLat,
        startLng: parameters.startLng,
        resourceRoot: parameters.resourceRoot,
        freeBrochureLink: parameters.freeBrochureLink,
        nearlyCommunities: parameters.nearlyCommunities,
        proxyServerPath: '/ServiceProxy/MapQuestJSProxy.aspx',
        mapWidth: parameters.mapWidth,
        mapHeight: parameters.mapHeight,
        mapContainerId: 'nhs_PropertyMap',
        siteRoot: parameters.siteRoot,
        parent: this,
        communityId: parameters.communityId,
        builderId: parameters.builderId,
        planId: parameters.specId > 0 ? 0 : parameters.planId,
        specId: parameters.specId,
        isBasicCommunity: parameters.isBasicCommunity,
        basicCommPage: parameters.basicCommPage,
        mapUrl: parameters.mapUrl
    };

    this._map = new NHS.Scripts.PropertyMap.Map(mapParameters);

    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerId: parameters.partnerId, marketId: parameters.marketId });

};

NHS.Scripts.PropertyMap.DrivingDirections.prototype =
{
    get_log: function () { return this._log; },

    get_map: function () { return this._map; },

    initialize: function () {
        this._setUpControls();
    },

    // Initialize comm results view controls
    _setUpControls: function () {
        var self = this;

        this._map.preInit();

        var date = new Date();
        var currentMonth = date.getMonth();
        var currentDate = date.getDate();
        var currentYear = date.getFullYear();
        $jq('#nhs_drivingDirections').show();

        $jq('#tabMQMap a').click(
            function () {
                if (!$jq('#nhs_PropertyMap').is(':visible')) {
                    $jq('#nhs_PropertyMap').toggle();
                    $jq(this).toggleClass('On');
                    $jq($jq('#tabBuilderMap').find('a')[0]).toggleClass('On');
                    $jq('#nhs_BuilderPropertyMap').toggle();
                    $jq('#nhs_drivingDirections').hide();
                    $jq('#nhs_GetDirections').show();
                    $jq('#nhs_drivingDirections').show();
                }

                return false;
            }
        );

        $jq('#tabBuilderMap a').click(
            function () {
                if (!$jq('#nhs_BuilderPropertyMap').is(':visible')) {
                    $jq('#nhs_BuilderPropertyMap').toggle();
                    $jq(this).toggleClass('On');
                    $jq($jq('#tabMQMap').find('a')[0]).toggleClass('On');
                    $jq('#nhs_PropertyMap').toggle();
                    $jq('#nhs_drivingDirections').show();
                    $jq('#nhs_GetDirections').hide();
                    $jq('#nhs_drivingDirections').show();
                }

                var alreadyBuilderMapClicked = NHS.Scripts.Helper.readCookie('drivingDirectionsBuilderMapClicked');

                if (!alreadyBuilderMapClicked) {
                    if (!self.isBasicListing || !self.isBasicCommunity) {
                        if (self._specId > 0 || self._planId > 0) {
                            self.get_log().logMultiEvent('HDSDD', self._communityId, self._builderId, self._planId, self._specId);
                        }
                        else {
                            self.get_log().logMultiEvent('CDSDD', self._communityId, self._builderId, 0, 0);
                        }
                    }

                    NHS.Scripts.Helper.createCookie('drivingDirectionsBuilderMapClicked', 1, 0);
                }

                return false;
            }
        );

        $jq('#' + this._drivingDirectionsTextBox).blur(function () {
            var link = $jq($jq('#nhsRequestAppointment').find('.btn_NhsMapSend')[0]);
            var linkHref = link.attr('href');
            var linkComment = linkHref.substring(linkHref.indexOf('=') + 1, linkHref.indexOf('&'));
            link.attr('href', encodeURI(linkHref.replace(linkComment, $jq(this).val() == "" ? '***' : $jq(this).val())));
            link = $jq($jq('#nhsRequestAppointment').find('.btn_NhsMapSendVWO')[0]);
            linkHref = link.attr('href');
            linkComment = linkHref.substring(linkHref.indexOf('=') + 1, linkHref.indexOf('&'));
            link.attr('href', encodeURI(linkHref.replace(linkComment, $jq(this).val() == "" ? '***' : $jq(this).val())));
        });

        jQuery('#nhsFakeDate').datepicker({
            minDate: new Date(currentYear, currentMonth, currentDate),
            beforeShow: (function (input) {
                field = jQuery('#' + this._drivingDirectionsTextBox);
                var left = field.offset().left;
                var top = field.offset().top + 30;
                setTimeout(function () {
                    jQuery('#ui-datepicker-div').css({ 'position': 'absolute', 'top': top + 'px', 'left': left + 'px' });
                }, 1);
            }).bind(this),
            showOn: "button",
            buttonImageOnly: true,
            buttonImage: this._resourceRoot + "globalresourcesmvc/default/images/icons/calendar.png",
            onSelect: (function (dateText, inst) {
                var link = jQuery(jQuery('.nhs_RequestAppointment').find('.btn_NhsMapSend')[0]);
                var linkvwo = $jq($jq('#nhsRequestAppointment').find('.btn_NhsMapSendVWO')[0]);
                var textBoxStr = jQuery('#' + this._drivingDirectionsTextBox).val();

                if (textBoxStr != '' && textBoxStr.indexOf('Date: ') != -1)
                    textBoxStr = textBoxStr.substring(0, textBoxStr.indexOf('Date: '));

                var text = jQuery.trim(textBoxStr) + (textBoxStr == '' ? '' : ', ') + 'Date: ' + dateText.replace('/', '-').replace('/', '-');
                text = text.replace(',,', ',');
                jQuery('#' + this._drivingDirectionsTextBox).val(text);
                text = text.replace('Date: ', 'Requested appointment date: ');

                var linkHref = link.attr('href');
                var linkHrefvwo = linkvwo.attr('href');
                if (typeof linkHref != "undefined") {
                    var linkComment = linkHref.substring(linkHref.indexOf('=') + 1, linkHref.indexOf('&'));
                    link.attr('href', encodeURI(linkHref.replace(linkComment, text)));
                }
                if (typeof linkHrefwvo != "undefined") {
                    var linkCommentvwo = linkHrefvwo.substring(linkHrefvwo.indexOf('=') + 1, linkHrefvwo.indexOf('&'));
                    linkvwo.attr('href', encodeURI(linkHrefvwo.replace(linkCommentvwo, text)));
                }
                return false;
            }).bind(this)
        });

        $jq('#' + this._drivingDirectionsButton).click((function () {
           
            if (this._isBasicCommunity) {
                this.get_log().logMultiEvent('bcRoute', this._communityId, this._builderId, this._planId, this._specId);
                $jq.googlepush('Basic Listing', 'Driving Route', this._communityId, 4, false);
            }else if (this._isBasicListing) {
                 //just do nothing
            } else if (this._specId > 0 || this._planId > 0)
                this.get_log().logMultiEvent('HDSHWRT', this._communityId, this._builderId, this._planId, this._specId);
            else
                this.get_log().logMultiEvent('CDSHWRT', this._communityId, this._builderId, 0, 0);

            $jq.ajax({
                url: this._drivingDirectionAction,
                type: "POST",
                data: { communityId: this._communityId, street: $jq('#nhsTxtStreeAddress').val(), cityOrZip: $jq('#nhsTxtCityOrZip').val(), check: 'true', isBasicListing: this._isBasicListing },
                success: (function (data, textStatus, jqXHR) {
                    if (data.indexOf('Unable') != -1) {
                        $jq('#' + this._drivingDirectionsError).show();
                    }
                    else {
                        var left = (screen.width - 840) / 2;
                        var top = (screen.height - 600) / 2;

                        $jq('#' + this._drivingDirectionsError).hide();
                        var url = this._drivingDirectionAction + '?communityId=' + this._communityId + '&street=' + $jq('#nhsTxtStreeAddress').val() + '&cityOrZip=' + $jq('#nhsTxtCityOrZip').val() + '&check=false' + '&isBasicListing=' + this._isBasicListing;
                        window.open(url, '_blank', 'width=840,height=600,top=' + top + ',left=' + left + ',menubar=yes,status=no,location=no,toolbar=no,scrollbars=yes');
                    }
                }).bind(this),
                error: function (obj, status, error) {
                    NHS.Scripts.Helper.logError(error, this._drivingDirectionAction, "Error on Property Map");
                }
            });

            return false;
        }).bind(this));

    }
}
