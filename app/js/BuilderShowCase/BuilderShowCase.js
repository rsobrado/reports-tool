NHS.Scripts.BuilderShowCase = function (parameters) {
    this.parameters = parameters;
    if (parameters) {
        this._log = new NHS.Scripts.Globals.EventLogger({ siteRoot: parameters.siteRoot, partnerId: parameters.partnerID, marketId: parameters.marketID, builderId: parameters.brandID });
    }
};

NHS.Scripts.BuilderShowCase.prototype =
{
    get_log: function () { return this._log; },

    initMap: function () {
        var mapOptions = this.parameters.OptionsForMap;
        var parameters = this.parameters;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);
        googleApi.options.Events.OnMapCreate = function () {
            var bounds = googleApi.getBoundsFromMap();
            var data = {
                partnerId: parameters.partnerID,
                brandId: parameters.brandID,
                minLat: bounds.minLat,
                minLng: bounds.minLng,
                maxLat: bounds.maxLat,
                maxLng: bounds.maxLng
            };
            jQuery.getJSON('/MapSearch/GetBrandMarketMapPoints', data, function (results) {
                googleApi.processResult(results);
            });
        };

        googleApi.processResult = function (results) {
            var self = this;
            self.showLoading();
            for (var i = 0; i < results.length; i++) {

                var id = results[i].Id;
                var lat = results[i].Lat;
                var lng = results[i].Lng;
                var name = results[i].Title.replace('<strong>', '').replace('</strong>', '');

                var contentHtml = "<div class=\"nhs_CommResHoverMarket\">";
                var communityResultsUrl = parameters.siteRoot + parameters.communityResultsPage + "/market-" + id + "/brandid-" + parameters.brandID;
                var marketName = name.substring(0, name.indexOf('('));
                var commsCount = name.substring(name.indexOf('('));
                contentHtml += "<h2><a href=\"" + communityResultsUrl + "\" >" + marketName + "</a></h2> <p>by " + parameters.brandName + "</p> <p>" + commsCount + "</p>";
                contentHtml += "</div>";
                self.createMarkerPoint(lat, lng, name, contentHtml, parameters.icon, results[i]);
            }
            self.hideLoading();
            self.AutoFit();
        };

        googleApi.createMap();
    },


    initialize: function () {
        if (this.parameters)
            this.initMap();

        //Pinterest
        $jq("#pinit").click(function () {
            $jq("#pinmarklet").remove();
            var e = document.createElement('script');
            e.setAttribute('type', 'text/javascript');
            e.setAttribute('charset', 'UTF-8');
            e.setAttribute('id', 'pinmarklet');
            e.setAttribute('src', 'http://assets.pinterest.com/js/pinmarklet.js?r=' + Math.random() * 99999999);
            document.body.appendChild(e);
        });

        $jq("#btnSend").click(function () {
            $jq(this).hide();
            $jq("#btnSendFake").show();
        });

        if (this._map) {
            this._map.show(true);
            this._map.refresh();
        }
    },
    setupTwitter: function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = "//platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
        }
    },
    checkLatestNewsItems: function (d) {
        var latestNews = d.getElementById('nhs_ShowcaseLatestNews');
        if (latestNews.childNodes.length < 4) {
            latestNews.style.display = "none";
        }
    },
    initGallery: function (options) {
        $jq("#nhs_ShowcaseSlides").slides(options);

        $jq(".bigprev").hide();
        $jq(".bignext").hide();

        $jq("#nhs_ShowcaseSlides").on("mouseenter", function () {
            $jq(".bigprev").show();
            $jq(".bignext").show();
        });
        $jq("#nhs_ShowcaseSlides").on("mouseleave", function () {
            $jq(".bigprev").hide();
            $jq(".bignext").hide();
        });
    },
    InitVideoGallery: function (brandid, brightcoveEnvSuffix, url) {
        this.Initialize("NHS.Scripts.BuilderShowCase.PopVideos");
        tags = "brandvideo_" + brandid + "_" + brightcoveEnvSuffix;
        Url = url;
        //tags += ",showcasevideo";

        BCMAPI.find('find_videos_by_tags',
            {
                or_tags: tags,
                fields: "name,id,referenceId,thumbnailURL,tags,videoStillURL"
            });
    },
    Initialize: function (callback) {

        BCMAPI.token = 'HYWld5USmeg7f3O0xaq2UgSaQBVyuw72JRRcM_k4sRX7yIGlb-lcuQ..';
        BCMAPI.callback = callback;

    },
    LoadVideo: function (videoId) {
        VideoId = videoId;
    },
    Pagination: function (option) {
        this.currentPage = 1;
        var self = this;
        var div = $jq("#" + option.id).find(".nhs_ShowcaseMetroArea > ul > li");
        div.hide();
        var ul = $jq("." + option.navigation).find("ul");
        $jq(ul).find("li").remove();
        if (div.length > 0) {
            var n = div.length / option.maxPage;
            var pages = parseInt(n, 10);
            if (div.length - (pages * option.maxPage) > 0) {
                pages++;
            }
            if (pages > 1)
                ul.append('<li><a page="back"><</a></li>');
            for (var i = 0; i < pages; i++) {
                for (var j = i * option.maxPage; j < (i + 1) * option.maxPage; j++) {
                    if (j <= div.length) {
                        $jq(div[j]).attr("page", i + 1);
                    }
                }
                if ((i + 1) == 1)
                    ul.append('<li><a class="nhs_Active" page="' + (i + 1) + '">' + (i + 1) + '</a></li>');
                else
                    ul.append('<li><a page="' + (i + 1) + '">' + (i + 1) + '</a></li>');
            }

            $jq("li[page^='1']").show();
            if (pages > 1)
                ul.append('<li><a page="next">></a></li><li><a page="all">View All</a></li>');

            if (pages > 1) {
                var a = ul.find("a");
                for (var k = 0; k < a.length; k++) {
                    $jq(a[k]).click(function () {
                        $jq("a.nhs_Active").removeClass("nhs_Active");
                        var pageNumber = $jq(this).attr('page');
                        if (pageNumber == "back") {
                            if (self.currentPage > 1)
                                pageNumber = self.currentPage - 1;
                        } else if (pageNumber == "next") {
                            if (self.currentPage < pages) {
                                pageNumber = self.currentPage + 1;
                            }
                        }

                        if (pageNumber == "all") {
                            if ($jq(this).html() == "View All") {
                                $jq("li[page]").fadeIn("normal");
                                a.hide();
                                $jq("a[page='all']").show().addClass("nhs_Active");
                                $jq("a[page='all']").html("Collapse");
                            } else {
                                a.show();
                                $jq("a[page^='" + self.currentPage + "']").addClass("nhs_Active");
                                $jq("li[page]").hide();
                                $jq("li[page^='" + self.currentPage + "']").fadeIn("normal");
                                $jq("a[page='all']").html("View All");
                            }
                        } else if (pageNumber != self.currentPage && pageNumber != "back" && pageNumber != "next") {
                            $jq("a[page^='" + pageNumber + "']").addClass("nhs_Active");
                            $jq("li[page]").hide();
                            $jq("li[page^='" + pageNumber + "']").fadeIn("normal");
                            self.currentPage = parseInt(pageNumber, 10);
                        }
                    });
                }

            }
        }
    },
    setupCarousel: function () {
        $jq("#nhs_ShowcaseSpotlightCarousel").jCarouselLite({
            btnNext: ".bignext",
            btnPrev: ".bigprev",
            visible: 4,
            circular: true
        });
    }
};
var tags = "";
var VideoId;
var Url = "";
var bcVP;
var bcExp;
var modExp;
var modCon;

function myTemplateLoaded(pExperienceID) {      
    bcExp = brightcove.api.getExperience(pExperienceID);
    bcVP = bcExp.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
    modExp = bcExp.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
    modCon = bcExp.getModule(brightcove.api.modules.APIModules.CONTENT);    
}

function onTemplateReady(evt) {   
    bcVP.loadVideoByID(VideoId);     
    bcVP.play();       
}

NHS.Scripts.BuilderShowCase.PopVideos = function (response) {
    var videos = new Array();
    tags += "_";
    if (response.items.length != 0) {
        $jq("#nhs_ShowcaseVideos").show();

        if (response.items.length == 1) {
            if ($jq("#nhs_ShowcaseVideos").find("a").length > 1)
                $jq("#nhs_ShowcaseVideos .nhs_Title").html('Videos');
            else
                $jq("#nhs_ShowcaseVideos .nhs_Title").html('Video');
        }
        else
            $jq("#nhs_ShowcaseVideos .nhs_Title").html('Videos');
        
        videos = response.items.sort(function (a, b) {
            var _a = parseInt(a.referenceId.substring(tags.length));
            var _b = parseInt(b.referenceId.substring(tags.length));
            return _a - _b;
        });

        var mytemp = $jq.template("mpTmpl", "<a class=\"thickbox\" href=\"" + Url + "?videoref=${id}&KeepThis=true&TB_iframe=true&width=700&height=500&videowidth=670&videoheight=480&videourl=frombrightcove&title=${name}\"><span></span><img src=\"${thumbnailURL}\" alt=\"\"  /><p>${name}</p></a>");

        //$jq('#nhs_ShowcaseVideosGallery').empty();
        $jq.tmpl('mpTmpl', videos).appendTo("#nhs_ShowcaseVideosGallery");
        tb_init('#nhs_ShowcaseVideosGallery a.thickbox');
    }
};
