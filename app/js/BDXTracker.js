BDX = {}; BDX.Scripts = {};

// Class EventLogger
// Constructor, it receives a json object with parameters
BDX.Scripts.Tracker = function (parameters) {
    this._testMode = parameters.testMode == null ? false : parameters.testMode;
    this._partnerId = parameters.partnerId;
    this._bhiSite = parameters.bhiSite == null ? 'http://www.newhomesource.com/' : parameters.bhiSite;
}


BDX.Scripts.Tracker.prototype =
{   
    logEvent: function (eventCode, id) {
        if (eventCode) {
            var url = this._bhiSite + "partnereventlogger/partnerId-" + this._partnerId + "/eventCode-" + eventCode + "/propertyId-" + id + "/testMode-" + this._testMode;

            this._logEvent(url);    
        }
    },

    _logEvent : function(url)
    {
        jQuery.ajax({
            type: "Post",
            url: url,
            data: null
        });

    }

}
