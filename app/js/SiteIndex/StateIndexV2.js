// Global Class for State Index Page
NHS.Scripts.StateIndex = function (parameters) {
    this.parameters = parameters;
};

NHS.Scripts.StateIndex.prototype =
{
    init: function () {
        var self = this;
        var mapOptions = this.parameters.OptionsForMap;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);

        googleApi.options.Events.MarkerClickCallBack = function (info, infowindow, infowindowTooltip, marker) {
            var url = "";
            if (!info.UserFriendlyUrls)
                url = self.parameters.url.replace("{market}", info.MarketId);
            else
                url = (self.parameters.url.replace("market-{market}", info.StateName) + '/' + info.MarketName + '-area').replace(' ', '-').toLowerCase();
                
            window.location = url;
        };

        googleApi.options.Events.MarkerMouseOverCallBack = function (info, infowindow, infowindowTooltip, marker) {

            var name = info.MarketName + "(" + info.TotalCommunities + ")";
            var html = "<div id=\"nhs_MapCards\"><p style='margin:0;padding:0;'>" + name + "</p></div>";
            infowindow.close();
            infowindowTooltip.setContent(html);
            infowindowTooltip.open(googleApi.map, marker);
        };

        googleApi.options.Events.MarkerMouseOutCallBack = function (info, infowindow, infowindowTooltip, marker) {
            infowindowTooltip.close();
        };

        googleApi.options.Events.InfowindowTooltipReady = function () {
            var card = jQuery("#nhs_MapCards").parent().parent();
            var arrow = card.parent().find("> div").first().find("> div");
            arrow.first().hide();
            arrow.eq(2).hide();
            card.next('div').hide();
            var width = card.width() - 75;
            var height = card.height() + 75;
            this.infowindowTooltip.setOptions({ pixelOffset: this.GetInfowindowOffset(width, height, googleApi.map, this.infowindowTooltip.getAnchor()) });
        };

        googleApi.getIconMarkerPoint = function (sources, data) {
            return self.parameters.icon;
        };

        googleApi.getNameMarkerPoint = function (sources, data) {
            var prOptions = this.options.ProcessResultOptions;
            return data[prOptions.Name] + "(" + data.TotalCommunities + ")";
        };

        googleApi.createMap();
        google.maps.event.addListener(googleApi.map, 'idle', self.RemoveGoogleInfo);
        self.processResult(self.parameters.MarketPoints, googleApi);

        $jq('#nhs_StateBrowseDiv0').css('display', 'none');
        $jq('#nhs_StateBrowseDiv1').css('display', 'none');
        $jq('#nhs_StateBrowseDiv2').css('display', 'none');
        $jq('#nhs_StateBrowseDiv').css('height', '250px');

        $jq('#indexTab1').click((function () { this._switchBoxDisplay('li1', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab2').click((function () { this._switchBoxDisplay('li2', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab3').click((function () { this._switchBoxDisplay('li3', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv3', 'nhs_StateBrowseDiv0'); return false; }).bind(this));
        $jq('#indexTab4').click((function () { this._switchBoxDisplay('li4', 'nhs_StateBrowseDiv0', 'nhs_StateBrowseDiv1', 'nhs_StateBrowseDiv2', 'nhs_StateBrowseDiv3'); return false; }).bind(this));

        $jq('#btnSearchHomes').click(function () { if ($jq('#SelectedMarketId').val() == "0") { alert("Area is required."); return false; } });
        if ($jq('div#nhs_StateBrowseDiv0 ul li').length == 0) $jq('li#li4').hide();

        googleApi.AutoFit();
    },

    processResult: function (results, googleApi) {
        googleApi.showLoading();
        var prOptions = googleApi.options.ProcessResultOptions;
        if (results !== null) {
            for (var i = 0; i < results.length; i++) {
                var html = googleApi.getHtmlInfowindow(results, results[i]);
                var icon = googleApi.getIconMarkerPoint(results, results[i]);
                googleApi.createMarkerPoint(results[i][prOptions.Latitude], results[i][prOptions.Longitude], null, html, icon, results[i]);
            }
        }
        googleApi.hideLoading();
    },

    _switchBoxDisplay: function (linkId, popId, popId2, popId3, popId4) {

        var link = linkId;
        var pop = document.getElementById(popId);
        var list1 = document.getElementById('li1');
        var list2 = document.getElementById('li2');
        var list3 = document.getElementById('li3');
        var list4 = document.getElementById('li4');
        var stateDiv = document.getElementById('nhs_StateBrowseDiv');

        if (link == 'li1') {
            list1.className = 'nhs_Selected';
            list2.className = list3.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
        }
        if (link == 'li2') {
            list2.className = 'nhs_Selected';
            list1.className = list3.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }
        if (link == 'li3') {
            list3.className = 'nhs_Selected';
            list1.className = list2.className = '';
            if (list4) list4.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }
        if (link == 'li4') {
            list4.className = 'nhs_Selected';
            list1.className = list2.className = list3.className = '';
            $jq('#' + popId2).hide(); $jq('#' + popId3).hide(); $jq('#' + popId4).hide();
            stateDiv.style.height = 'auto';
            stateDiv.style.maxHeight = '250px';
        }

        pop.style.display = 'inline';
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