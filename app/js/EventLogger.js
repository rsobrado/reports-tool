// Class EventLogger
var _callAddThis = true;
var _commIdHD = 0;
var _builderIdHD = 0;
var _marketIdCR = 0;
// Constructor, it receives a json object with parameters
NHS.Scripts.Globals.EventLogger = function(logParameters) {
    this._siteRoot = logParameters.siteRoot;
    this._partnerId = logParameters.partnerID;
    this._marketId = logParameters.marketId;
    this._fromPage = logParameters.fromPage;
    this._communityId = logParameters.communityId;
    this._builderId = logParameters.builderId;
    this._planId = logParameters.planId;
    this._specId = logParameters.specId;
    this._homeSearchViewMetricDisplayed = logParameters.homeSearchViewMetricDisplayed;
    this._homeSearchViewMetricHidden = logParameters.homeSearchViewMetricHidden;  
};


NHS.Scripts.Globals.EventLogger.prototype =
{
    // Public Members
    logListHubEvent: function (listHubProviderId, testkey, desckey, listingKey) {
        try {
            var _lh = new ListHubTracker({ provider: listHubProviderId, test: testkey });
            _lh.submit(desckey, listingKey);
        } catch (err) { }
    },

    logAndRedirect: function (e, url, eventCode, cid, bid, pid, sid, mid, external) {
        this._marketId = mid;
        this.logEvent(eventCode, cid, bid, pid, sid);
        this._redirect(e, url, external);
        return false;
    },
    logFeaturedListingAndRedirect: function (e, url, eventCode, flid, cid, bid, mid, external) {
        this._marketId = mid;
        var params = { featuredlistingId: flid, communityId: cid, builderId: bid, marketId: mid };
        this.logEventWithParameters(eventCode, params);
        this._redirect(e, url, external);
        return false;
    },
    logBasicListingAndRedirect: function (e, url, eventCode, bsid, mid) {
        this.logBasicListingEvent(eventCode, bsid);
        this._redirect(e, url);
        return false;
    },
    logEventWithParameters: function (eventCode, parameters) {
        if (eventCode) {
            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;

            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logViewWithParameters(url, eventCode, parameters);
        }
    },

    logEvent: function (eventCode, cid, bid) {
        if (eventCode) {
            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;

            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logView(url, eventCode, cid, bid, 0, 0, 0);
        }
    },
    logBasicListingEvent: function (eventCode, bsid) {        
        if (eventCode) {
            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;

            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logView(url, eventCode, 0, 0, 0, 0, bsid);
        }
    },
    logEvent: function (eventCode, cid, bid, pid, sid) {
        if (eventCode) {
            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;

            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logView(url, eventCode, cid, bid, pid, sid, 0);
        }
    },
    setAllowAddThis: function () {
        _callAddThis = false;
        setTimeout(function () {
            _callAddThis = true;
        }, 2000);
    },
    logMultiEvent: function (eventCode, communityId, builderId, planId, specId) {      
        if (eventCode) {
            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;

            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logView(url, eventCode, communityId, builderId, planId, specId, 0);
        }
    },
    logHomeResultsMetrics: function (eventCode, flag) {

        if (eventCode) {
            var logString;
            if (flag == 1) {
                logString = this._homeSearchViewMetricDisplayed;
            }
            else {
                logString = this._homeSearchViewMetricHidden;

            }

            var url = this._siteRoot + "eventlogger/logevent-" + eventCode;
            if (this._siteRoot.substring(this._siteRoot.length - 1) != "/") {
                url = "/" + url;
            }

            this._logMetrics(url, logString);
        }
    },
    attachEventsToAddThis: function () {
        var self = this;

        if (typeof addthis != 'undefined') {
            addthis.addEventListener('addthis.menu.share', function (evt) {
                if (_callAddThis) {
                    var serviceShared = evt.data.service.toString().toLowerCase();
                    var eventCode = 'MHSMS';
                    var hdPage = self._planId > 0 || self._specId > 0;
                    if (serviceShared.indexOf('favorites') == -1 && serviceShared.indexOf('print') == -1 && serviceShared.indexOf('email') == -1) {
                        if (self._planId == 0 && self._specId == 0 && self._communityId == 0) {
                            eventCode = 'MHSMS';
                        } else {
                            hdPage = self._planId > 0 || self._specId > 0;
                            eventCode = hdPage ? 'HDSMS' : 'CDSMS';
                        }
                        self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
                    }
                    else if (serviceShared.indexOf('email') > -1) {
                        hdPage = self._planId > 0 || self._specId > 0;
                        eventCode = hdPage ? 'HOMSTF' : 'COMSTF';
                        self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
                        self.setAllowAddThis();
                    } else if (serviceShared.indexOf('print') > -1) {
                        hdPage = self._planId > 0 || self._specId > 0;
                        eventCode = hdPage ? 'HOMPR' : 'COMPR';
                        if ($jq(this).hasClass('nextStepsPrint')) {
                            eventCode = hdPage ? 'HDNSPRN' : 'CDNSPRN';
                        }
                        self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
                        self.setAllowAddThis();
                    }
                }
            });
        }


        $jq(".addthis_button_email").click((function () {
            var hdPage = self._planId > 0 || self._specId > 0;
            var eventCode = hdPage ? 'HOMSTF' : 'COMSTF';
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();
        }));


        $jq(".addthis_button_print").click((function () {
            var hdPage = self._planId > 0 || self._specId > 0;
            var eventCode = hdPage ? 'HOMPR' : 'COMPR';
            if ($jq(this).hasClass('nextStepsPrint')) {
                eventCode = hdPage ? 'HDNSPRN' : 'CDNSPRN';
            }
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();
        }));

        $jq("#btn_fb_mh").click((function () {
            var eventCode = 'MHSMS';
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();

        }));

        $jq("#btn_tw_mh").click((function () {
            var eventCode = 'MHSMS';
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();
        }));



    },
    attachEventsToDetails: function () {
        var self = this;

        try {
            FB.Event.subscribe('edge.create',
                function (response) {
                    var hdPage = self._planId > 0 || self._specId > 0;
                    var eventCode = hdPage ? 'HDSMS' : 'CDSMS';
                    self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
                    self.setAllowAddThis();
                }
            );
        } catch (err)
        { }


        $jq("#btn_fb_bottom").click((function () {
            var hdPage = self._planId > 0 || self._specId > 0;
            var eventCode = hdPage ? 'HDSMS' : 'CDSMS';
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();
            jQuery.SetDataLayerPair('siteSocialMediaS');
        }));


        $jq("#btn_tw_bottom").click((function () {
            var hdPage = self._planId > 0 || self._specId > 0;
            var eventCode = hdPage ? 'HDSMS' : 'CDSMS';
            self.logMultiEvent(eventCode, self._communityId, self._builderId, self._planId, self._specId);
            self.setAllowAddThis();
            jQuery.SetDataLayerPair('siteSocialMediaS');
        }));
    },
    // Private Members

    // Redirect function
    _redirect: function (e, url, newWin) {
        if (!e) var e = window.event;
        try { e.cancelBubble = true; } catch (err) { }
        if (e.stopPropagation) e.stopPropagation();
        if (url) {
            if (newWin) {
                window.open(url);
            }
            else {
                setTimeout(function () { window.location.href = url; }, 500);
            }
        }
    },

    _logViewWithParameters: function (url, eventCode, parameters) {
        var wturl = url;

        if (this._fromPage == 'communityresults') {
            wturl = url;

            if (this._siteRoot == '/') {
                wturl = "/NewHomeSource" + url;
            }
        }

        if (parameters.builderId)
            url = url + "/builder-" + parameters.builderId;
        if (parameters.communityId)
            url = url + "/community-" + parameters.communityId;
        if (parameters.communityList)
            url = url + "/communitylist-" + parameters.communityList;
        if (parameters.marketId)
            url = url + "/market-" + parameters.marketId;
        if (parameters.planId)
            url = url + "/planid-" + parameters.planId;
        if (parameters.specId)
            url = url + "/specid-" + parameters.specId;
        if (parameters.basiclistingId)
            url = url + "/basiclistingid-" + parameters.basiclistingId;
        if (parameters.featuredlistingId)
            url = url + "/featuredlistingid-" + parameters.featuredlistingId;
        if (parameters.refer)
            url = url + "/refer-" + parameters.refer;
        if (parameters.totalHomes)
            url = url + "/totalhomes-" + parameters.totalHomes;
        if (parameters.builderCommunityList)
            url = url + "?buildercommunitylist=" + parameters.builderCommunityList;
        if (parameters.basicListingList)
            url = url + "?basiclistinglist=" + parameters.basicListingList;
        if (parameters.homeList)
            url = url + "?homeList=" + parameters.homeList;
        if (parameters.featuredListingList)
            url = url + "?featuredlistinglist=" + parameters.featuredListingList;

        var async = true;
        if (typeof parameters.async != 'undefined')
            async = parameters.async;

        $jq.ajax({ type: "Post", url: url, async: async });
    },

    _logView: function (url, eventCode, cid, bid, planId, specId, bsId) {

        if (url.indexOf("http://") < 0) {
            url = url.replace(' ', '').replace('//', '/');
        }

        var fromPageUrl = this._fromPage;
        var wturl = url;

        var hdPage = planId > 0 || specId > 0;
        if (cid == 0 && hdPage)
            cid = _commIdHD;
        if (bid == 0 && hdPage)
            bid = _builderIdHD;
            
        if (this._fromPage == 'communityresults') {
            wturl = url;
            fromPageUrl = this._siteRoot + "communityresults";

            if (this._siteRoot == '/') {
                wturl = "/NewHomeSource" + url;
                fromPageUrl = "/NewHomeSource/communityresults";
            }
        }
        
        //Log to custom via http req 
        if (bsId == 0)
            url = url + "/builder-" + bid + "/community-" + cid + "/planid-" + planId + "/specid-" + specId + "/market-" + this._marketId;
        else
            url = url + "/basiclisting-" + bsId + "/market-" + this._marketId;
                 
        $jq.ajax({ type: "Post", url: url, async: true });
    },
    _logMetrics: function (url, logString) {
        var dataPost = { logsInChains: logString };
        $jq.ajax({
            type: "POST",
            url: "http://" + location.host + "/metricseventlogger/",
            data: dataPost,
            dataType: "json"
        });
    }
}
