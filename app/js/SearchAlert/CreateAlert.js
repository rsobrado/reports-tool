// Global Class for Create Alert Page
if (typeof NHS == "undefined") {
    NHS = {};
    NHS.Scripts = {};
}
if (typeof NHS.Scripts.SearchAlert == "undefined") {
    NHS.Scripts.SearchAlert = {};
}

NHS.Scripts.SearchAlert.CreateAlert = function () {
    this._ddlStateId = 'State';
    this._ddlAreaId = 'Area';
    this._ddlCityId = 'City';
    this._ddlSchoolId = 'School';
    this._ddlBuilderId = 'Builder';

    this._txtZipId = 'Zip';
    this._txtPriceFromId = 'PriceFrom';
    this._txtPriceToId = 'PriceTo';
    this._txtSuggestedNameId = 'SuggestedName';
    this._txtCurrentPageId = "CurrentPage";

    this._jsonActionsPath = '/SearchAlert/';
    this._actionGetSuggestedName = 'GetSuggestedName';
    this._actionGetSchools = 'GetSchools';
    this._actionGetBuilders = 'GetBuilders';
    this._actionGetAreas = 'GetAreas';
    this._actionGetCities = 'GetCities';
};

NHS.Scripts.SearchAlert.CreateAlert.prototype =
{
    initialize: function () {        
        var txtCurrentPage = jQuery('#' + this._txtCurrentPageId);
        if (txtCurrentPage != null && txtCurrentPage.val() == "CreateAlert") {
            jQuery("#" + this._ddlStateId).change(this._stateChangeHandler.bind(this));
            jQuery("#" + this._ddlAreaId).change(this._areaChangeHandler.bind(this));
            jQuery("#" + this._txtZipId).change(this._zipChangeHandler.bind(this));
            jQuery('#' + this._ddlAreaId + ', #' + this._ddlCityId + ', #' + this._txtZipId + ', #' + this._txtPriceFromId + ', #' + this._txtPriceToId).change(this._suggestNameHandler.bind(this));
        }
        
        jQuery('#nhs_ModalContainer #State').change(function () {
            try {
                var areasSelect = jQuery('#nhs_ModalContainer #Area');
                var citiesSelect = jQuery('#nhs_ModalContainer #City');
                var selectedState = jQuery("#nhs_ModalContainer #State :selected").text();
                if (selectedState != null && selectedState != '') {
                    jQuery.ajax({
                        type: "GET",
                        url: "/SearchAlert/GetAreas",
                        dataType: 'json',
                        data: { state: selectedState },
                        success: function(data) {
                            citiesSelect.empty();
                            citiesSelect.append(jQuery('<option></option>').text('No preference').val(''));
                            areasSelect.empty();
                            jQuery.each(data, function(index, area) {
                                areasSelect.append(jQuery('<option></option>').text(area.Text).val(area.Value));
                            });
                        }
                    });
                }
            } catch (ex) {
                // console.error(ex);                
            }
        });
       
        jQuery('#nhs_ModalContainer #Area').change(function () {
            try {
                var citiesSelect = jQuery('#nhs_ModalContainer #City');
                var selectedArea = jQuery("#nhs_ModalContainer #Area :selected").val();
                if (selectedArea != null && selectedArea != '') {
                    jQuery.ajax({
                        type: "GET",
                        url: "/SearchAlert/GetCities",
                        dataType: 'json',
                        data: { market: selectedArea },
                        success: function(data) {
                            citiesSelect.empty();
                            jQuery.each(data, function(index, city) {
                                citiesSelect.append(jQuery('<option></option>').text(city.Text).val(city.Value));
                            });
                        }
                    });
                }
            } catch (ex) {
                //console.error(ex);                
            }
        });
        
    },

    _stateChangeHandler: function () {
        this._clearZipLocation();
        var state = jQuery("#" + this._ddlStateId).val();
        jQuery.getJSON(this._getActionPath(this._actionGetAreas, "state=" + state), (function (data) {
            jQuery("#" + this._ddlAreaId).fillSelect(data);
        }).bind(this));
    },

    _areaChangeHandler: function () {
        var area = jQuery("#" + this._ddlAreaId).val();

        // Cities
        jQuery.getJSON(this._getActionPath(this._actionGetCities, "market=" + area), (function (data) {
            jQuery("#" + this._ddlCityId).fillSelect(data);
        }).bind(this));

        this._fillMarketRelatedDropdowns(area);
    },

    _zipChangeHandler: function () {
        var zip = jQuery("#" + this._txtZipId).val();
        if (this._isValidZip(zip)) {
            this._clearStateLocation();
            this._fillMarketRelatedDropdowns(zip);
        }
    },

    _suggestNameHandler: function () {
        var area = jQuery('#' + this._ddlAreaId).val();
        var areaText = jQuery('#' + this._ddlAreaId + ' :selected').text();
        var city = jQuery('#' + this._ddlCityId).val();
        var zip = jQuery('#' + this._txtZipId).val();
        var priceFrom = jQuery('#' + this._txtPriceFromId).val();
        var priceTo = jQuery('#' + this._txtPriceToId).val();

        if ((area != '' || this._isValidZip(zip)) && (priceFrom != '' && priceTo != '')) {
            var params = "area=" + area + "&areaText=" + areaText + "&city=" + city + "&zip=" + zip + "&priceFrom=" + priceFrom + "&priceTo=" + priceTo;
            var url = this._getActionPath(this._actionGetSuggestedName, params);
            jQuery.getJSON(url, (function (data) {
                jQuery('#' + this._txtSuggestedNameId).val(data);
            }).bind(this));
        }
    },

    _fillMarketRelatedDropdowns: function (market) {
        // Schools
        jQuery.getJSON(this._getActionPath(this._actionGetSchools, "market=" + market), (function (data) {
            jQuery("#" + this._ddlSchoolId).fillSelect(data);
        }).bind(this));

        // Builders
        jQuery.getJSON(this._getActionPath(this._actionGetBuilders, "market=" + market), (function (data) {
            jQuery("#" + this._ddlBuilderId).fillSelect(data);
        }).bind(this));
    },

    _clearStateLocation: function () {
        jQuery("#" + this._ddlStateId).val('');  // option label
        jQuery("#" + this._ddlAreaId).get(0).options.length = 1;
        jQuery("#" + this._ddlCityId).get(0).options.length = 1;
    },

    _clearZipLocation: function () {
        jQuery("#" + this._txtZipId).val('');
    },

    _isValidZip: function (zip) {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
    },

    _getActionPath: function (action, params) {
        return this._jsonActionsPath + action + "/?" + params;
    }
};
