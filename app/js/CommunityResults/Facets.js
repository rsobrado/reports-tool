// Class Facets
// Handle all the facets events and js ui for community results facets
NHS.Scripts.CommunityResults.Facets = function (parameters) {

    this._locationControlId = parameters.locationControlId;
    this._autoCompleteAction = parameters.autoCompleteAction;

    // Location Radius control
    this._locationSliderControlId = parameters.locationSliderControlId;
    this._locationSliderTextId = parameters.locationSliderTextId;
    this._locationButtonControlId = parameters.locationButtonControlId;
    this._intervalId = 0;
    this._pageSize = parameters.pageSize;


    this._priceLow = 1;
    this._priceHigh = 28;
    this._sqFtLow = 0;
    this._sqFtHigh = 20;

    // Price control
    this._priceSliderControlId = parameters.priceSliderControlId;
    this._priceSliderTextFromId = parameters.priceSliderTextFromId;
    this._priceSliderTextToId = parameters.priceSliderTextToId;

    // Sq Ft control
    this._sqFtSliderControlId = parameters.sqFtSliderControlId;
    this._sqFtSliderTextFromId = parameters.sqFtSliderTextFromId;
    this._sqFtSliderTextToId = parameters.sqFtSliderTextToId;

    // Facet links and modals for types, schools, bedrooms and amenities
    this._facetModalAmenities = parameters.facetModalAmenities;
    this._facetModalSchools = parameters.facetModalSchools;
    this._facetModalStatus = parameters.facetModalStatus;
    this._facetModalBedrooms = parameters.facetModalBedrooms;
    this._facetModalBathrooms = parameters.facetModalBathrooms;
    this._facetModalVideo = parameters.facetModalVideo;
    this._facetModalEvent = parameters.facetModalEvent;
    this._facetModalPromotions = parameters.facetModalPromotions;
    this._facetLinkBuilder = parameters.facetLinkBuilder;
    this._facetModalBuilder = parameters.facetModalBuilder;
    this._facetModalCities = parameters.facetModalCities;

    // Initial Search Parameters that will be changed by the facets and send it back for search
    this._searchParameters = parameters.searchParameters;

    var priceMinText = 'Under $100K';
    var priceMaxText = '$1.0M & Up';
    if (this._searchParameters.PartnerId == 333)
        priceMinText = 'No Minimum';
    if (this._searchParameters.PartnerId == 333)
        priceMaxText = 'No Maximum';

    var sqFtMinText = 'Under 600';
    var sqFtMaxText = '10,000 & Up';

    this._originalTop = 0;
    this._adsBottom = 0;
    this._adsHeight = 0;

    this._priceSliderText = [priceMinText, '$110,000', '$120,000', '$130,000', '$140,000', '$150,000', '$160,000', '$170,000', '$180,000', '$190,000', '$200,000', '$220,000', '$240,000', '$260,000', '$280,000', '$300,000', '$325,000', '$350,000', '$375,000', '$400,000', '$425,000', '$450,000', '$475,000', '$500,000', '$600,000', '$700,000', '$800,000', '$900,000', priceMaxText];
    this._priceSliderValues = ['100000', '110000', '120000', '130000', '140000', '150000', '160000', '170000', '180000', '190000', '200000', '220000', '240000', '260000', '280000', '300000', '325000', '350000', '375000', '400000', '425000', '450000', '475000', '500000', '600000', '700000', '800000', '900000', '1000000'];

    this._sqFtSliderText =   [sqFtMinText, '1,000', '1,500', '2,000', '2,500', '3,000', '3,500', '4,000', '4,500', '5,000', '5,500', '6,000', '6,500', '7,000', '7,500', '8,000', '8,500', '9,000', '9,500', sqFtMaxText];
    this._sqFtSliderValues = ['600',       '1000',  '1500',  '2000',  '2500',  '3000',  '3500',  '4000',  '4500',  '5000',  '5500',  '6000',  '6500',  '7000',  '7500',  '8000',  '8500',  '9000',  '9500',  '10000'];

    this._locationSliderText = ['Exact Location', '1 Mile from center', '3 Miles from center', '5 Miles from center', '10 Miles from center', '15 Miles from center', '25 Miles from center'];
    this._locationSliderValues = ['0', '1', '3', '5', '10', '15', '25'];

    this._commResults = parameters.commResults;

    this._log = this._commResults.get_log();

    this.validateSearchTextFunction = parameters.validateSearchTextFunction;
};


NHS.Scripts.CommunityResults.Facets.prototype =
    {
        set_searchParameters: function (params) { this._searchParameters = params; },
        get_log: function () { return this._log; },

        initialize: function () {
            var self = this;
            $jq('#LocationName').keypress(function (ev) {
                var keycode = (ev.keyCode ? ev.keyCode : ev.which);
                if (keycode == '13') {
                    $jq('#btnGo').click();
                }
            });
            $jq('#' + this._locationButtonControlId).click((function () {
                self._searchParameters.SchoolDistrictId = 0;

                var isLocalBox = false;
                if (this._locationButtonControlId == 'btnGo') {
                    this._resetFacets();
                    isLocalBox = true;
                }
                var value = $jq('#' + this._locationControlId).val();
                if (!self.validateSearchTextFunction(value)) {
                    $jq.googlepush('Search Events', 'Search Action', 'Search - Location');
                    $jq.ajax({
                        url: this._commResults.get_SearchAction(),
                        type: "POST",
                        data: { searchParameters: NHS.Scripts.Helper.JSON.toString(this._searchParameters), searchLocation: $jq('#' + this._locationControlId).val(), page: 1, pageSize: this._pageSize, isLocationSearchBox: isLocalBox, locationType: $jq('#LocationType').val() },
                        success: (function (data) {
                            if (data.indexOf('locationhandler') != -1)
                                window.location = data;
                            else {
                                $jq('#nhs_Facets').html(data);

                                $jq(document).ready((function () {
                                    this.initialize();
                                }).bind(this));
                            }
                        }).bind(this),
                        error: (function (obj, status, error) {
                            NHS.Scripts.Helper.logError(error, this._searchAction, "error on search");
                            this.hideProgressIndicator();
                        }).bind(this)
                    });
                } else {
                    alert("Please enter a valid location or select an item from the list.");
                }
            }).bind(this));

            $jq('.nhs_FacetMenuBox').hover(function () { $jq(this).addClass('hover'); }, function () { $jq(this).removeClass('hover'); });

            $jq('.nhs_FacetModalClose').click(function () {
                self._closeFacetMenu();
            });

            $jq('.nhs_FacetGroupTitle span,  #nhs_FacetLinkCities')
                .hover(function () {
                    self._closeFacetMenu();
                    clearInterval(self._intervalId);
                    //$jq(this).addClass('nhs_Hover');

                    $jq(this).addClass('nhs_FacetLinkOpen');
                    $jq($jq(this).parent().parent().find('.nhs_FacetMenuBox')[0]).show('Fold');
                    return false;
                }, function () {
                    var menu = $jq($jq(this).parent().parent().find('.nhs_FacetMenuBox')[0]);
                    self._intervalId = setInterval(
                        function () {
                            if (!$jq(menu).is('.hover') && !$jq(this).is('.nhs_Hover')) {
                                //$jq(this).removeClass('nhs_Hover');
                                self._closeFacetMenu();
                                clearInterval(self._intervalId);
                            }
                        }, 300);
                });

            $jq('#' + this._facetLinkBuilder).click((function () {
                $jq('#' + this._facetModalBuilder).toggle('fast', (function () {
                    this._setColHeight();
                }).bind(this));
                if ($jq('#' + this._facetLinkBuilder).html().indexOf('All') >= 0) {
                    $jq('#' + this._facetLinkBuilder).html('< Hide builder list');
                } else {
                    $jq('#' + this._facetLinkBuilder).html('All area builders >');
                }
                return false;
            }).bind(this));

            $jq('#' + this._facetModalAmenities + ' ul li a, #nhs_FacetTypeAmenities .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_FacetRemove') && $jq(this).is('.type')) {
                    self._searchParameters.HomeType = '';
                } else if ($jq(this).is('.amenity') && $jq(this).is('.nhs_FacetRemove')) {
                    if ($jq(this).attr('rel') == "pool" || $jq(this).attr('rel') == "")
                        self._searchParameters.Pool = false;
                    if ($jq(this).attr('rel') == "gated" || $jq(this).attr('rel') == "")
                        self._searchParameters.Gated = false;
                    if ($jq(this).attr('rel') == "green" || $jq(this).attr('rel') == "")
                        self._searchParameters.GreenProgram = false;
                    if ($jq(this).attr('rel') == "golf" || $jq(this).attr('rel') == "")
                        self._searchParameters.GolfCourse = false;
                } else if ($jq(this).is('.nhs_Facet')) {
                    var logCode = '';

                    $jq.googlepush('Search Events', 'Search Refinement', 'Type/Amenities');

                    if ($jq(this).is('.type')) {
                        self._searchParameters.HomeType = $jq(this).attr('rel');
                        logCode = self._searchParameters.HomeType == 'SF' ? 'FAHTSF' : 'FAHTCT';
                    } else if ($jq(this).is('.amenity') && $jq(this).attr('rel') == 'green') {
                        self._searchParameters.GreenProgram = true;
                        logCode = 'FAAMGRN';
                    } else if ($jq(this).is('.amenity') && $jq(this).attr('rel') == 'pool') {
                        self._searchParameters.Pool = true;
                        logCode = 'FAAMP';
                    } else if ($jq(this).is('.amenity') && $jq(this).attr('rel') == 'golf') {
                        self._searchParameters.GolfCourse = true;
                        logCode = 'FAAMGO';
                    } else if ($jq(this).is('.amenity') && $jq(this).attr('rel') == 'gated') {
                        self._searchParameters.Gated = true;
                        logCode = 'FAAMGA';
                    }

                    self.get_log().logEvent(logCode, 0, 0);
                }

                self._updateResults();

                return false;
            });

            $jq('#' + this._facetModalBuilder + ' a.nhs_BoylLink, #nhs_BuilderPromoBrands a.nhs_BoylLink').each(
                function (index, item) {
                    $jq(item).attr('temp', $jq(item).attr('href'));
                    $jq(item).attr('href', '#');

                    $jq(item).click(function () {
                        self.get_log().logEvent('CRBR', 0, $jq(this).attr('rel'));
                        url = $jq(this).attr('temp');
                        setTimeout(function () {
                            $jq(location).attr('href', url);
                        }, 1000);

                    });
                });

            $jq('#' + this._facetModalBuilder + ' ul li a.nhs_Facet, #nhs_BuilderPromoBrands a.nhs_LogoFacet, #nhs_FacetBuilderDisplay .nhs_FacetRemove').click(function () {
                if (!$jq(this).find('img')[0])
                    brandId = $jq(this).attr('rel');
                else
                    brandId = $jq($jq(this).find('img')[0]).attr('rel');

                self._searchParameters.BrandId = brandId;
                self._updateResults();

                return false;
            });

            $jq('#' + this._facetModalStatus + ' ul li a, #nhs_FacetStatus .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.CommunityStatus = $jq(this).attr('rel');
                    if (self._searchParameters.CommunityStatus != '')
                        $jq.googlepush('Search Events', 'Search Refinement', 'Community Stage');

                    self._updateResults();
                }

                return false;
            });

            $jq('#' + this._facetModalBedrooms + ' ul li a, #nhs_FacetBedrooms .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.NumOfBeds = $jq(this).attr('rel');
                    if (self._searchParameters.NumOfBeds > 0)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Bedrooms');
                    self._updateResults();
                    self.get_log().logEvent('FAHS' + self._searchParameters.NumOfBeds, 0, 0);
                }

                return false;
            });

            $jq('#' + this._facetModalBathrooms + ' ul li a, #nhs_FacetBathrooms .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.NumOfBaths = $jq(this).attr('rel');
                    if (self._searchParameters.NumOfBaths > 0)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Bathrooms');
                    self._updateResults();
                    self.get_log().logEvent('FAHB' + self._searchParameters.NumOfBaths, 0, 0);
                }

                return false;
            });

            $jq('#' + this._facetModalVideo + ' ul li a, #nhs_FacetVideo .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.HasVideo = $jq(this).attr('rel') == "" ? false : true;
                    if (self._searchParameters.HasVideo)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Video Available');
                    self._updateResults();
                    self.get_log().logEvent('CRVDCT', 0, 0);
                }

                return false;
            });

            $jq('#' + this._facetModalEvent + ' ul li a, #nhs_FacetEvents .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.HasEvent = $jq(this).attr('rel') == "" ? false : true;
                    if (self._searchParameters.HasEvent)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Event Available');
                    self._updateResults();
                    self.get_log().logEvent('CREVCT', 0, 0);
                }

                return false;
            });

            $jq('#' + this._facetModalPromotions + ' ul li a, #nhs_FacetPromotions .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.PromotionType = $jq(this).attr('rel') == "" ? 0 : $jq(this).attr('rel');
                    if (self._searchParameters.PromotionType > 0)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Promotion Available');
                    self._updateResults();
                    self.get_log().logEvent('FAPRM', 0, 0);
                }

                return false;
            });
            $jq('#' + this._facetModalSchools + ' ul li a, #nhs_FacetSchools .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    self._searchParameters.SchoolDistrictId = $jq(this).attr('rel');
                    if (self._searchParameters.SchoolDistrictId > 0)
                        $jq.googlepush('Search Events', 'Search Refinement', 'Schools');
                    self._updateResults();
                    self.get_log().logEvent('FASCH', 0, 0);
                }
                return false;
            });

            $jq('#' + this._facetModalCities + ' ul li a, #nhs_FacetLocation .nhs_FacetRemove').click(function () {
                if ($jq(this).is('.nhs_Facet') || $jq(this).is('.nhs_FacetRemove')) {
                    if ($jq(this).attr('rel') == "latlong") {
                        self._searchParameters.MinLatitude = 0;
                        self._searchParameters.MinLongitude = 0;
                        self._searchParameters.MaxLatitude = 0;
                        self._searchParameters.MaxLongitude = 0;
                        self._commResults.restoreSearchState();

                        self._commResults.resetSearchArea();
                    } else if ($jq(this).attr('rel') != "" && $jq(this).attr('rel') != "0") {
                        self._searchParameters.CityNameFilter = $jq(this).attr('rel').split(',')[0];
                        self._searchParameters.State = $jq(this).attr('rel').split(',')[1];
                        self._searchParameters.SortOrder = 10;
                        $jq.googlepush('Search Events', 'Search Refinement', 'Related Area');
                    } else {
                        self._searchParameters.City = "";
                        self._searchParameters.State = "";
                        self._searchParameters.CityNameFilter = "";
                        self._searchParameters.Radius = 0;
                        self._searchParameters.SortOrder = 0;

                    }
                    self._citiChanged = true;
                    self._updateResults();
                }

                return false;
            });

            // coming soon link that acts like a facet
            $jq('a#ComingSoonFacet').click(function () {
                self.get_log().logEvent("CRGO", 0, 0);
                var url = $jq(this).attr('href');
                setTimeout(function () {
                    $jq(location).attr('href', url);
                }, 500);

                return false;
            });


            var locationIndex = this._locationSliderValues.indexOf(this._searchParameters.Radius == 0 ? this._locationSliderValues[0] : this._searchParameters.Radius.toString());


            if (locationIndex == -1) {
                if (this._searchParameters.Radius > this._locationSliderValues[this._locationSliderValues.length - 1])
                    locationIndex = this._locationSliderValues[this._locationSliderValues.length - 1];
                else
                    for (i = 0; i < this._locationSliderValues.length - 1; i++)
                        if (this._searchParameters.Radius > this._locationSliderValues[i] &&
                            this._searchParameters.Radius < this._locationSliderValues[i + 1])
                            locationIndex = i;
            }

            $jq('#' + this._locationSliderTextId).text(this._locationSliderText[locationIndex]);

            // Create the location slider
            $jq("#" + this._locationSliderControlId).slider({
                value: 100,
                min: 0,
                max: 6,
                step: 1,
                value: locationIndex,
                slide: (function (event, ui) {
                    // set the radius text in the UI
                    $jq('#' + this._locationSliderTextId).text(this._locationSliderText[ui.value]);
                }).bind(this),
                change: (function (event, ui) {
                    // set the radius parameter in the search parameters
                    this._searchParameters.Radius = this._locationSliderValues[ui.value];

                    $jq.googlepush('Search Events', 'Search Refinement', 'Select Distance');

                    if (this._searchParameters.City != '')
                        this._searchParameters.CityNameFilter = (this._searchParameters.Radius == 0) ? this._searchParameters.City : '';

                    // Update Results
                    this._updateResults();
                }).bind(this)
            });

            var priceLowIndex = this._priceSliderValues.indexOf(this._searchParameters.PriceLow == 0 ? this._priceSliderValues[0] : this._searchParameters.PriceLow.toString());
            var priceHighIndex = this._priceSliderValues.indexOf(this._searchParameters.PriceHigh == 0 ? this._priceSliderValues[this._priceSliderValues.length - 1] : this._searchParameters.PriceHigh.toString());

            $jq('#' + this._priceSliderTextFromId).text(this._priceSliderText[priceLowIndex]);
            $jq('#' + this._priceSliderTextToId).text(this._priceSliderText[priceHighIndex]);

            // Create the Price slider
            $jq("#" + this._priceSliderControlId).slider({
                value: 100,
                min: 0,
                max: 28,
                range: true,
                step: 1,
                values: [priceLowIndex, priceHighIndex],
                slide: (function (event, ui) {
                    // set the radius text in the UI
                    $jq('#' + this._priceSliderTextFromId).text(this._priceSliderText[ui.values[0]]);
                    $jq('#' + this._priceSliderTextToId).text(this._priceSliderText[ui.values[1]]);
                }).bind(this),
                change: (function (event, ui) {
                    // set the radius parameter in the search parameters

                    this._searchParameters.PriceLow = this._priceSliderValues[ui.values[0]];
                    this._searchParameters.PriceHigh = this._priceSliderValues[ui.values[1]];
                    if (ui.values[0] != this._priceLow) {
                        $jq.googlepush('Search Events', 'Search Refinement', 'Select Price - Low');
                        this._priceLow = ui.values[0];
                    }
                    if (ui.values[1] != this._priceHigh) {
                        $jq.googlepush('Search Events', 'Search Refinement', 'Select Price - High');
                        this._priceHigh = ui.values[1];
                    } // Update Results
                    this._updateResults();

                    self.get_log().logEvent("FAPRICE", 0, 0);
                }).bind(this)
            });

            //Square Feet SLider
            var sqFtLowIndex = this._sqFtSliderValues.indexOf(this._searchParameters.SqFtLow == 0 ? this._sqFtSliderValues[0] : this._searchParameters.SqFtLow.toString());
            var sqFtHighIndex = this._sqFtSliderValues.indexOf(this._searchParameters.SqFtHigh == 0 ? this._sqFtSliderValues[this._sqFtSliderValues.length - 1] : this._searchParameters.SqFtHigh.toString());           

            $jq('#' + this._sqFtSliderTextFromId).text(this._sqFtSliderText[sqFtLowIndex]);
            $jq('#' + this._sqFtSliderTextToId).text(this._sqFtSliderText[sqFtHighIndex]);

            // Create the Price slider
            $jq("#" + this._sqFtSliderControlId).slider({
                value: 100,
                min: 0,
                max: self._sqFtSliderValues.length - 1,
                range: true,
                step: 1,
                values: [sqFtLowIndex, sqFtHighIndex],
                slide: (function (event, ui) {
                    // set the radius text in the UI
                    $jq('#' + this._sqFtSliderTextFromId).text(this._sqFtSliderText[ui.values[0]]);
                    $jq('#' + this._sqFtSliderTextToId).text(this._sqFtSliderText[ui.values[1]]);
                }).bind(this),
                change: (function (event, ui) {
                    // set the radius parameter in the search parameters

                    this._searchParameters.SqFtLow = this._sqFtSliderValues[ui.values[0]];
                    this._searchParameters.SqFtHigh = this._sqFtSliderValues[ui.values[1]];                   

                    if (ui.values[0] != this._sqFtLow) {
                        $jq.googlepush('Search Events', 'Search Refinement', 'Select SqFt - Low');
                        this._sqFtLow = ui.values[0];
                    }
                    if (ui.values[1] != this._sqFtHigh) {
                        $jq.googlepush('Search Events', 'Search Refinement', 'Select SqFt - High');
                        this._sqFtHigh = ui.values[1];
                    } // Update Results
                    this._updateResults();

                    self.get_log().logEvent("FASQFT", 0, 0);
                }).bind(this)
            });

            searchTypeahead.setupSearchBox("LocationName", "LocationType");

            var textBoxDefaulValueHelper = new NHS.Scripts.Helper.FieldDefaultValue('SearchText', 'Enter City, State (or Zip code)', 'fieldDefaultText', 'btnGo');
            textBoxDefaulValueHelper.initialize();
            this._updateAdsPosition();
        },

        _resetFacets: function () {
            this._searchParameters.Radius = "0";
            this._searchParameters.CityNameFilter = "";
            this._searchParameters.PriceLow = "100000";
            this._searchParameters.PriceHigh = "1000000";
            this._searchParameters.CommunityStatus = "";
            this._searchParameters.NumOfBeds = "0";
            this._searchParameters.NumOfBaths = 0;
            this._searchParameters.HasVideo = false;
            this._searchParameters.SchoolDistrictId = 0;
            this._searchParameters.HomeType = "";
            this._searchParameters.Pool = false;
            this._searchParameters.GreenNatureAreas = false;
            this._searchParameters.GreenProgram = false;
            this._searchParameters.GolfCourse = false;
            this._searchParameters.Gated = false;
            this._searchParameters.Parks = false;
            this._searchParameters.Adult = false;
            this._commResults.set_searchParameters(this._searchParameters);
        },

        _updateResults: function () {
            this._closeFacetMenu();
            this._closeBuilderMenu();
            this._commResults.set_searchParameters(this._searchParameters);
            this._commResults.update();
            this._updateAdsPosition();
        },

        _updateAdsPosition: function () {

            $jq('#nhs_Mediatitle').text('Community video gallery');

            if ($jq('#nhs_CommResRightAds').length > 0) {
                //floating ads
                var colHeight = $jq('#nhs_CommResMapListCol').height();
                this._adsHeight = $jq('#nhs_CommResRightAds').height();
                var skyHeight = $jq('#nhs_RightTopSky,#nhs_RightTopSky2').height();
                this._originalTop = $jq('#nhs_CommResRightAds').offset().top - parseFloat($jq('#nhs_CommResRightAds').css('marginTop').replace(/auto/, 0));
                var originalTop2 = $jq('#nhs_RightTopSky,#nhs_RightTopSky2').offset().top - parseFloat($jq('#nhs_RightTopSky,#nhs_RightTopSky2').css('marginTop').replace(/auto/, 0));
                var colBottom = colHeight + $jq('#nhs_CommResMapListCol').offset().top - this._adsHeight;
                var colSkyBottom = colHeight + $jq('#nhs_CommResMapListCol').offset().top - skyHeight;
                var adsTop = colHeight - this._adsHeight - 10;
                var skyTop = colHeight - skyHeight - 10;
                this._adsBottom = this._adsHeight + $jq('#nhs_CommResRightAds').offset().top;
                var skyBottom = skyHeight + $jq('#nhs_RightTopSky,#nhs_RightTopSky2').offset().top;

                $jq(window).scroll((function (event) {

                    // what the y position of the scroll is
                    var y = $jq(document).scrollTop();
                    colHeight = $jq('#nhs_CommResMapListCol').height();

                    // whether scroll is below the ad's top position
                    if (colHeight > this._adsBottom) {
                        if (y >= this._originalTop) {
                            // if so, ad the fixed class            
                            if (y > colBottom) {
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').removeClass('fixed');
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').addClass('absolute');
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').css('top', (adsTop + 'px'));
                            } else {
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').removeClass('absolute');
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').addClass('fixed');
                                $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').css('top', 0);
                            }
                        } else {
                            // otherwise remove it
                            $jq('#nhs_CommResVideoAds #nhs_CommResRightAds').removeClass('fixed');
                        }
                    }
                    if (colHeight > skyBottom) {
                        if (y >= originalTop2) {
                            // if so, ad the fixed class            
                            if (y > colSkyBottom) {
                                if (skyTop > 0) {
                                    $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').removeClass('fixed');
                                    $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').addClass('absolute');
                                    $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').css('top', (skyTop + 'px'));
                                }
                            } else {
                                $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').removeClass('absolute');
                                $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').addClass('fixed');
                                $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').css('top', 0);
                            }
                        } else {
                            // otherwise remove it               
                            $jq('#nhs_CommResFacetCol #nhsAdContainerRight2').removeClass('fixed');
                        }
                    }

                }).bind(this));
            }
        },

        _setColHeight: function () {
            if ($jq('#nhs_CommResRightAds').length > 0) {
                this._originalTop = $jq('#nhs_CommResRightAds').offset().top - parseFloat($jq('#nhs_CommResRightAds').css('marginTop').replace(/auto/, 0));
                this._adsBottom = this._adsHeight + $jq('#nhs_CommResRightAds').offset().top;
            }
        },

        _closeFacetMenu: function () {
            $jq('.nhs_FacetMenuBox').hide();
            $jq('.nhs_FacetLinkOpen').removeClass('nhs_FacetLinkOpen');
        },
        _closeBuilderMenu: function () {
            $jq('#' + this._facetModalBuilder).hide();
            $jq('#' + this._facetLinkBuilder).html('All area builders >');
        }
    };
