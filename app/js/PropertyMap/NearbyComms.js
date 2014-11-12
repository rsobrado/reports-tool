
NHS.Scripts.PropertyMap.NearbyComms = function (parameters) {
    this._communityId = parameters.communityId;
    this._builderId = parameters.builderId;
    this._planId = parameters.specId > 0 ? 0 : parameters.planId;
    this._specId = parameters.specId;

    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, fromPage: parameters.fromPage, partnerId: parameters.partnerId, marketId: parameters.marketId });
};

NHS.Scripts.PropertyMap.NearbyComms.prototype = {
    get_log: function () { return this._log; },

    attachClickEventsToCommLinks: function () {
        $jq(".nhs_NearbyImgBox a").click((function () {
            attachLogEventToHomesNearby(this);
        }).bind(this));
        $jq(".nhs_selector a").click((function () {
            attachLogEventToHomesNearby(this);
        }).bind(this));
    }
};