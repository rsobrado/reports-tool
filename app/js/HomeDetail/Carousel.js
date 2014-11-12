
NHS.Scripts.HomeDetail.Carousel = function (parameters) {
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._planId = parameters.specId > 0 ? 0 : parameters.planId;
    this._specId = parameters.specId;
    this._totalImagesOnFloorPlanSection = 2;
    this._partnerId = parameters.partnerId;
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerId: parameters.partnerId, marketId: parameters.marketId });
};

NHS.Scripts.HomeDetail.Carousel.prototype =
{
    get_log: function () { return this._log; },
    get_commId: function () { return this._communityId; },
    get_builderId: function () { return this._builderId; },
    get_plan: function () { return this._planId; },
    get_spec: function () { return this._specId; },

    initialize: function () {
        this._setUpControls(),
        this._initSimilarHomes()
    },

    // Initialize carousel controls
    _setUpControls: function () {
        $jq(".nhs_SimilarHomePlanCarousel").jCarouselLite({
            btnNext: ".nhs_SimilarHomePlanCarouselNext",
            btnPrev: ".nhs_SimilarHomePlanCarouselPrev",
            visible: 4,
            circular: true
        });
        var images = $jq(".nhs_FloorPlanCarousel").find('a');
        if (images.length == 1) return;
        $jq(".nhs_FloorPlanCarousel").jCarouselLite({
            btnNext: ".nhs_FloorPlanImageNext",
            btnPrev: ".nhs_FloorPlanImagePrev",
            visible: this._totalImagesOnFloorPlanSection,
            circular: true,
            start: 0
        });
        // Workarround for ticket 42703, remove thickbox class and rel att (replicated images)
        var images = $jq(".nhs_FloorPlanCarousel").find('a');
        images.each(function (index) {
            if (index < this._totalImagesOnFloorPlanSection || index >= (images.size() - this._totalImagesOnFloorPlanSection)) {
                if (this._partnerId != 88)
                    $jq(this).removeClass("thickbox");
                $jq(this).removeAttr('rel');
            }
        });
    },
    _initSimilarHomes: function () {
        $jq('#lnkSimilarAvailableHomes').click((function () {
            this.get_log().logMultiEvent('COMDETSIM', this._communityId, this._builderId, this._planId, this._specId);
        }).bind(this));


        $jq('#nhs_expandCollapseMarketingSection').click((function () {
            if ($jq("#nhs_expandCollapseMarketingSection").hasClass("plus")) {
                $jq("#nhs_expandCollapseMarketingSection").removeClass("plus");
                $jq("#nhs_expandCollapseMarketingSection").addClass("minus");
                $jq('#nhs_expandCollapseLink').text("(click to collapse)");
                $jq('#nhs_crossMarketinglist').show();
            }
            else {
                $jq("#nhs_expandCollapseMarketingSection").removeClass("minus");
                $jq("#nhs_expandCollapseMarketingSection").addClass("plus");
                $jq('#nhs_expandCollapseLink').text("(click to expand)");
                $jq('#nhs_crossMarketinglist').hide();
            }
            return false;
        }));

        $jq('#nhs_expandCollapseLink').click((function () {
            if ($jq("#nhs_expandCollapseMarketingSection").hasClass("plus")) {
                $jq("#nhs_expandCollapseMarketingSection").removeClass("plus");
                $jq("#nhs_expandCollapseMarketingSection").addClass("minus");
                $jq('#nhs_expandCollapseLink').text("(click to collapse)");
                $jq('#nhs_crossMarketinglist').show();
            }
            else {
                $jq("#nhs_expandCollapseMarketingSection").removeClass("minus");
                $jq("#nhs_expandCollapseMarketingSection").addClass("plus");
                $jq('#nhs_expandCollapseLink').text("(click to expand)");
                $jq('#nhs_crossMarketinglist').hide();
            }
            return false;
        }));
    }
}
