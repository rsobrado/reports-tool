// Global Class for BoylResults Page
NHS.Scripts.BoylResults = function (parameters) {
    this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, partnerId: parameters.partnerId, marketId: parameters.marketId });
};

NHS.Scripts.BoylResults.prototype =
{
    get_log: function () { return this._log; },

    initialize: function () {
        this.checkImgs();
    },

    checkImgs: function () {
        $jq("div").each(function () {
            var cn = $jq(this).attr("class");
            if (cn == "nhsBoylBuilderLogo") {
                var s = $jq(this).html();
                if (s == "") {
                    var pDiv = $jq(this).parent();
                    pDiv.css("margin-left", "100px");
                }
            }

        });
    }
};  