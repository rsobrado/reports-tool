NHS.Scripts.AdUpdater = function (plhPrefix, currentUrl, currentAdParams, partnerSiteUrl) {
    this.plhPrefix = plhPrefix;
    this.currentUrl = currentUrl;
    this.currentAdParams = currentAdParams;
    this.partnerSiteUrl = partnerSiteUrl;
};

NHS.Scripts.AdUpdater.prototype =
{
    RenderSingleAd: function (adPos) {
        var self = this;

        var seconds = new Date().getTime();

        var adData = { url: self.currentUrl, adPosition: adPos, adParams: JSON.stringify(self.currentAdParams), useIFrame: true, javaScriptParams: false, dt:seconds };
        jQuery.ajax({
            url: self.partnerSiteUrl + "/admanager/getsingleadmarkup",
            cache: false,
            type: "POST",
            dataType: 'json',
            data: adData,
            success: function (data) {

                jQuery(self.plhPrefix + data.TargetPlaceHolder).each(function () {
                    jQuery(this).html(data.AdHtml);
                });
            }
        });
    },
    RenderAllAds: function () {
        var self = this;

        ///For trace the calls of this method
        //console.count('RenderAllAds');
        //console.log(self.currentUrl + "%O", self.currentAdParams);
        //console.error(self);

        if (window.builderIdsToShowCustomAd && window.builderIdsToShowCustomAd.length > 0 && window.displayCustomAd) {
            for (var x = 0; x < window.builderIdsToShowCustomAd.length; x += 1) {
                var y = self.currentAdParams.indexOf('b' + window.builderIdsToShowCustomAd[x].builderId);

                if (y >= 0) {
                    self.currentAdParams.splice(y, 1);
                }
            }
        }

        var seconds = new Date().getTime();
        var adData = { url: self.currentUrl, adPosition: "", adParams: JSON.stringify(self.currentAdParams), useIFrame: true, javaScriptParams: false, dt: seconds };
        jQuery.ajax({
            url: self.partnerSiteUrl + "/AdManager/GetAdMarkup",
            type: "POST",
            dataType: 'json',
            cache: false,
            data: adData
            }).done(function (data) {
                jQuery.each(data, function (i, item) {
                    jQuery(self.plhPrefix + item.TargetPlaceHolder).html(item.AdHtml);
                });
        });
    },
    RenderSkinAd: function (marketId) {
        var self = this;
        var screenWidth = screen.width;
        var minScreenWidth = 1280;
        var adPos = '_CommResultsSkin_';
        var vwoDisplaySkinAd = (window.displaySkinAd === true || window.displaySkinAd === null || window.displaySkinAd === undefined);

        if (screenWidth >= minScreenWidth && vwoDisplaySkinAd) {
            var seconds = new Date().getTime();       
            var adData = { url: self.currentUrl, adPosition:adPos, adParams: JSON.stringify(self.currentAdParams), marketId: marketId, dt:seconds };
            jQuery.ajax({
                url: self.partnerSiteUrl + "/admanager/getskinadmarkup",
                type: "POST",
                dataType: 'json',
                cache: false,
                data: adData                
            }).done(function(data) {
                if (data != null && data.AdHtml != null) {
                    var $anchorSkin = jQuery('a#adPageSkin');
                    var $skinAd = jQuery(data.AdHtml);
                    if ($anchorSkin == null || $anchorSkin.length == 0) {
                        jQuery('body').prepend($skinAd);
                        $anchorSkin = jQuery('a#adPageSkin');
                    } else {
                        var $newanchorSkin = jQuery($skinAd[2]);
                        $anchorSkin.attr('data-href', $newanchorSkin.attr('data-href'));
                        $anchorSkin.attr('data-urlimage', $newanchorSkin.attr('data-urlimage'));
                    }

                    $anchorSkin.hide();                    
                    $anchorSkin.attr('href', $anchorSkin.attr('data-href'));
                    $anchorSkin.css('background-image', 'url(' + $anchorSkin.attr('data-urlimage') + ')');
                    $anchorSkin.removeAttr('data-href');
                    $anchorSkin.removeAttr('data-urlimage');
                    $anchorSkin.show();
                }
                
            });
        }
    }
};
