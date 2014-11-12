var okToRunScript = false;
var campaignMarketTimer = null;
var campaignCountTimer = null;

$.extend({
    googlepush: function (events, action, label, value, flag) {
        if (_gaq) {
            if (typeof (value) !== "undefined" || typeof (flag) !== "undefined")
                if (typeof (flag) == 'undefined')
                    _gaq.push(['_trackEvent', events, action, label, value]);
                else
                    _gaq.push(['_trackEvent', events, action, label, value, flag]);
            else {
                if (!value)
                    value = 1;
                _gaq.push(['_trackEvent', events, action, label, value]);
            }
        }
    },
    googlepushList: function (tag, minselectedIndex, events, action, label, value) {
        if (tag.selectedIndex >= minselectedIndex) {
            this.googlepush(events, action, label, value);
        }
    },
    googlepushCheckBox: function (tag, events, action, label, value) {
        if (tag.checked)
            this.googlepush(events, action, label, value);
    },
    googlepushCustomVar: function (value1, action, label, value2) {
        if (_gaq) {
            _gaq.push(['_setCustomVar', value1, action, label, value2]);
        }
    },
    googlepushTrackPageview: function (url) {
        if (_gaq) {
            _gaq.push(['_trackPageview', url]);
        }
    },
    GATrafficCategorization: function (currentPartnerSiteUrl) {
        try {

            var refVal = "";
            var refUrl = "";
            var finalUrl = "/GoogleAnalytics/GetReferWithHashTag";
            if (location.href.indexOf("gclid") == -1 && location.href.indexOf("utm_") == -1) {
                if (window.location.hash) {
                    var candidate = window.location.hash.substring(1);
                    var refList = new Array();
                    refList = candidate.split('=');
                    if (refList.length > 0 && refList[0] == 'refer')
                        refVal = refList[1];
                } else {
                    var qr = this.getQueryString('refer');
                    if (typeof (qr) != 'undefined' && qr != "")
                        refVal = qr;
                }

                if (typeof (document.referrer) != 'undefined' && document.referrer != "")
                    refUrl = document.referrer;

                if (typeof (currentPartnerSiteUrl) != 'undefined' && currentPartnerSiteUrl != "")
                    finalUrl = "/" + currentPartnerSiteUrl + finalUrl;

                jQuery.ajax({
                    type: "GET",
                    url: finalUrl,
                    data: { refVal: refVal, refUrl: refUrl },
                    success: function (data) {
                        if (data != "" && typeof data === 'string') {
                            eval(data);
                        }
                        okToRunScript = true;
                    },
                    error: function (data) {
                        okToRunScript = true;
                    }
                });
            } else {
                okToRunScript = true;
            }
        }
        catch (ex) {

        }
    },
    SetDataLayerPair: function (key, optValue) {
        try {

            var finalUrl = "/GoogleAnalytics/SetDataLayerPair";

            if (typeof (optValue) == 'undefined')
                optValue = 0;
            
            jQuery.ajax({
                type: "GET",
                url: finalUrl,
                data: { key: key, optValue: optValue },
                success: function (data) {
                    if (data != "" && typeof data === 'string') {
                        if (typeof (dataLayer) == 'undefined') {
                            var tmpData = data;
                            var finalData = tmpData.replace("dataLayer", "window.parent.dataLayer");
                            eval(finalData);
                        }
                        else
                            eval(data);                        
                    }
                },
                error: function (data) {
                }
            });
        }
        catch (ex) {

        }
    },
    getQueryString: function (name) {
        function parseParams() {
            var params = {},
                    e,
                    a = /\+/g,  // Regex for replacing addition symbol with a space
                    r = /([^&=]+)=?([^&]*)/g,
                    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                    q = window.location.search.substring(1);

            while (e = r.exec(q))
                params[d(e[1])] = d(e[2]);

            return params;
        }

        if (!this.queryStringParams)
            this.queryStringParams = parseParams();

        return this.queryStringParams[name];
    }


});

//_gaq.push(['_setCustomVar', 1,'Market', 'Birmingham, AL:3',3]);
//_gaq.push(['_trackEvent', 'Market', 'Marketname, State', 'MarketID']);
//_trackEvent(category, action, opt_label, opt_value, opt_noninteraction)
function setMarketTrackEventAfterCampaignParams(marketName, stateName, marketId, timeout) {
    if (okToRunScript) {
        clearTimeout(campaignMarketTimer);
        _gaq.push(['_setCustomVar', 1, 'Market', marketName + ', ' + stateName + ':' + marketId, 3]);
        _gaq.push(['_trackEvent', 'Market', marketName + ', ' + stateName, marketId, 0, true]);
    } else {
        campaignMarketTimer = setTimeout(function () { setMarketTrackEventAfterCampaignParams(marketName, stateName, marketId, timeout); }, timeout);
    }
}

function setTimerToTrackCommunityCount(typeSearch, totalCommunities, timeout) {
    if (okToRunScript) {
        clearTimeout(campaignCountTimer);
        _gaq.push(['_trackEvent', 'CommunityResultsCount', typeSearch, totalCommunities, 0, true]);
    } else {
        campaignCountTimer = setTimeout(function () { setTimerToTrackCommunityCount(typeSearch, totalCommunities, timeout); }, timeout);
    }
}
