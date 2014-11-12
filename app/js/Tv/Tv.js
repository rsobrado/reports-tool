NHS.Scripts.Tv = function (parameters) {
    this.parameters = parameters;
    this.searchTypeahead = new NHS.Scripts.Search(this.parameters.AutoCompliteUrl);
};

onYouTubeIframeAPIReady= function () {
    var playerDivs = jQuery(".nhs_EmbedYTPlayer");
    var aux, self, id, videoId, urlSplitted, match, originUrl;
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      
    for (aux = 0; aux < playerDivs.length; aux += 1) {
        self = jQuery(playerDivs[aux]);
        urlSplitted = self.attr("data").split("&");
        match = urlSplitted[0].match(regExp);
        originUrl = urlSplitted[1].split("=");
        id = self.attr("id");
        
        if (match&&match[2].length==11){
            videoId= match[2];      
        }
        if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
            NHS.Scripts.Tv.prototype.nhsYoutubePlayers[id] = new YT.Player(id, {
                videoId: videoId,
                playerVars: {
                    autohide: 1,
                    autoplay: 0,
                    controls: 2,
                    showinfo: 0,
                    fs: 1,
                    modestbranding: 0,
                    enablejsapi: 1,
                    cc_load_policy: 0,
                    origin: originUrl[1],
                    wmode: "opaque"
                },
                events: {
                    'onStateChange': NHS.Scripts.Tv.prototype.onPlayerStateChange
                }
            });
        } else {
            NHS.Scripts.Tv.prototype.nhsYoutubePlayers[id] = new YT.Player(id, {
                videoId: videoId,
                playerVars: {
                    autohide: 1,
                    autoplay: 0,
                    controls: 2,
                    showinfo: 0,
                    fs: 1,
                    modestbranding: 0,
                    enablejsapi: 1,
                    cc_load_policy: 0,
                    origin: originUrl[1]
                },
                events: {
                    'onStateChange': NHS.Scripts.Tv.prototype.onPlayerStateChange
                }
            });
        }
    }
};

jQuery('#nhs_TvSegments a.btnCss').click(function() {
    var id = jQuery(this).attr("data");
    var currentPlayer = NHS.Scripts.Tv.prototype.nhsYoutubePlayers[id];
            
    if (currentPlayer && currentPlayer.getPlayerState && currentPlayer.getPlayerState() != 1) {
        currentPlayer.playVideo();
    }
    return false;
});

NHS.Scripts.Tv.prototype =
{
    nhsYoutubePlayers: {},
    init: function() {
        this.initMap();
        this.initLocationBox();
        this.loadYoutubeAPI();
        this.initPagination();
        this.bindPaginationEvents();
        this.initEvents();
        this.createNavigationMenu();
    },
    
    createNavigationMenu: function() {
        var self = this;
        var featureHomes = jQuery("#FeaturedHomes");
        var findCommunities = jQuery("#FindCommunities");
        var viewSegments = jQuery("#ViewSegments");
        var showSponsors = jQuery("#ShowSponsors");
        var features, findComms, segments, sponsors;
        
        if (featureHomes !== null && featureHomes.length > 0) {
            features = jQuery("<li><a href='#FeaturedHomes' onclick=\x22jQuery.googlepush(\x27NHS TV Page\x27, \x27Button Row\x27, \x27Featured Homes\x27)\x22>Featured Homes</a></li>");
        }
        if (findCommunities !== null && findCommunities.length > 0) {
            findComms = jQuery("<li><a href='#FindCommunities' onclick=\x22jQuery.googlepush(\x27NHS TV Page\x27, \x27Button Row\x27, \x27Find Communities\x27)\x22>Find Communities</a></li>");
        }

        if (viewSegments !== null && viewSegments.length > 0) {
            segments = jQuery("<li><a href='#ViewSegments' onclick=\x22jQuery.googlepush(\x27NHS TV Page\x27, \x27Button Row\x27, \x27View Segments\x27)\x22>View Segments</a></li>");
        }

        if (showSponsors !== null && showSponsors.length > 0) {
            sponsors = jQuery("<li><a href='#ShowSponsors' onclick=\x22jQuery.googlepush(\x27NHS TV Page\x27, \x27Button Row\x27, \x27Show Sponsors\x27)\x22>Show Sponsors</a></li>");
        }

        if (self.parameters.PartnerId != 1) {
            jQuery('#nhs_UlNavigation').append(segments, features, findComms);
        } else {
            jQuery('#nhs_UlNavigation').append(features, findComms, segments);
        }

        jQuery('#nhs_UlNavigation').append(sponsors);
    },
    
    initEvents: function() {
        var self = this;
        jQuery("#nhs_tvSignUp").click(function() {
            self.validateNewsLetterValues('#nhs_tvSignUp', false);
        });
        jQuery("#nhs_tvSmallSignUp").click(function() {
            self.validateNewsLetterValues('#nhs_tvSmallSignUp', true);
        });        
        

        jQuery("#nhs_TvMarketSlides").slidesjs({
            width: 960,
            height: 425,
            pagination: {
                active: true,
                effect: "slide"
            },
            effect: {
                slide: {
                    speed: 900
                },
                fade: {
                    speed: 300,
                    crossfade: true
                }
            },
            play: {
                active: false,
                effect: "slide",
                interval: 6000,
                auto: true,
                swap: true,
                pauseOnHover: true,
                restartDelay: 20000
            }
        });

        jQuery('#nhs_TvMarketSlides .slidesjs-next').click(function() {
            jQuery.googlepush('NHS TV Page', 'Slider', 'Slider Right');
        });

        jQuery('#nhs_TvMarketSlides').find('ul').find('li').find('a').click(function() {
            jQuery.googlepush('NHS TV Page', 'Slider', 'Slider Button');
        });


        jQuery("#nhs_TvMarketFeaturedSlides").slidesjs({
            width: 960,
            height: 320,
            pagination: {
                active: true,
                effect: "slide"
            },
            effect: {
                slide: {
                    speed: 900
                },
                fade: {
                    speed: 300,
                    crossfade: true
                }
            },
            play: {
                active: false,
                effect: "slide",
                interval: 7000,
                auto: true,
                swap: true,
                pauseOnHover: true,
                restartDelay: 20000
            }
        });

        jQuery('#nhs_TvMarketFeaturedSlides').find('.slidesjs-next').click(function() {
            jQuery.googlepush('NHS TV Page', 'Featured', 'Slider Right');
        });

        jQuery('.btnContestModal').click(function() {
            jQuery.googlepush('NHS TV Page', 'Slider', 'Contest Click');
        });


        jQuery('a.btnContestModal').attr('href', '/newhomesourcetv/contestmodal/' + self.parameters.MarketId + '?width=640&amp;height=320');

    },

    bindPaginationEvents: function() {
        var elem = jQuery('.nhs_TvVideoPage').parent();
        var videos = jQuery('.nhs_TvVideoItem');
        var videosLen = videos.length;
        var itemsPerSlide = 6;

        jQuery('.slidesjs-pagination li a', elem).click(function() {
            jQuery.googlepush('NHS TV Page', 'Segments', 'Slider Button');
            var currentElem = jQuery('.slidesjs-pagination li .active', elem);
            var clickedElem = jQuery(this);
            var clicked = clickedElem.attr('data').match('[^#/]+$');
            var current = currentElem.attr('data').match('[^#/]+$');


            if (current[0] !== clicked[0]) {
                currentElem.removeClass("active");
                clickedElem.addClass("active");
                var start = (clicked * itemsPerSlide);
                var toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "";
                }

                start = (current * itemsPerSlide);
                toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "none";
                }

                jQuery('html,body').animate({ scrollTop: jQuery("#ViewSegments").offset().top });
                jQuery('html,body').scrollTop(jQuery("#ViewSegments").offset().top + 1); //Safari - IE thumbnail hack
            }
        });

        jQuery('.slidesjs-previous', elem).click(function() {
            jQuery.googlepush('NHS TV Page', 'Segments', 'Slider Left');
            var currentElem = jQuery('.slidesjs-pagination li .active', elem);
            var current = currentElem.attr('data').match('[^#/]+$');
            var clicked = parseInt(current) - 1;
            var clickedElem = currentElem.parent().prev().find('a:first');

            if (0 <= clicked) {
                currentElem.removeClass("active");
                clickedElem.addClass("active");
                var start = (clicked * itemsPerSlide);
                var toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "";
                }

                start = (current * itemsPerSlide);
                toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "none";
                }
                jQuery('html,body').animate({ scrollTop: jQuery("#ViewSegments").offset().top });
                jQuery('html,body').scrollTop(jQuery("#ViewSegments").offset().top + 1);
            }
        });

        jQuery('.slidesjs-next', elem).click(function() {
            jQuery.googlepush('NHS TV Page', 'Segments', 'Slider Right');
            var currentElem = jQuery('.slidesjs-pagination li .active', elem);
            var current = currentElem.attr('data').match('[^#/]+$');
            var clicked = parseInt(current) + 1;
            var clickedElem = currentElem.parent().next().find('a:first');

            if (clicked < Math.ceil((videosLen + 1) / itemsPerSlide)) {
                currentElem.removeClass("active");
                clickedElem.addClass("active");
                var start = (clicked * itemsPerSlide);
                var toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "";
                }

                start = (current * itemsPerSlide);
                toVideo = start + itemsPerSlide;
                for (start; start < toVideo && start < videosLen; start += 1) {
                    videos[start].style.display = "none";
                }

                jQuery('html,body').animate({ scrollTop: jQuery("#ViewSegments").offset().top });
                jQuery('html,body').scrollTop(jQuery("#ViewSegments").offset().top + 1);
            }
        });
    },
    
    capitalizeFirst: function(inputName) {
        inputName = inputName.toLowerCase().trim();
        if (inputName == "washington-dc")
            return "Washington DC";
        else
            return inputName.charAt(0).toUpperCase() + inputName.slice(1);
    },

    initMap: function() {
        var self = this;
        var mapOptions = this.parameters.OptionsForMap;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);

        googleApi.getIconMarkerPoint = function(results, result) {

            if (self.parameters.isTvMarketPage)
                return self.parameters.icon;

            return result.Image;
        };
        

        googleApi.options.Events.MarkerClickCallBack = function(info, infowindow,infowindowTooltip, marker) {
            if (self.parameters.isTvMarketPage) {
//HotFix 68394 NHS TV: Remove pin popups from market maps
//                if (marker.InfoWindow) {
//                    marker.InfoWindow.close();
//                    marker.InfoWindow = null;
//                }
                
                var html = self.GetHtmlPoints(info);
                jQuery.googlepush('NHS TV Page', 'Map Button', 'Pin-Expand');
                jQuery.googlepush('NHS TV Page', 'Map Button', 'Pin-Click');
                infowindow.setContent(html);
                infowindow.open(googleApi.map, marker);
            } else {

                jQuery.googlepush('NHS TV Page', 'Map Button', self.capitalizeFirst(info.Keyword));
                var url = self.parameters.urlTvMarket + "/" + info.Keyword;
                window.location = url;
            }

        };

        jQuery('#nhs_TvMap').on('click', ".nhs_commDetail", function() {
            jQuery.googlepush('NHS TV Page', 'Map Button', 'Featured Community-Click');
        });

        googleApi.createMap();
        if (self.parameters.isTvMarketPage) {
//HotFix 68394 NHS TV: Remove pin popups from market maps
//            googleApi.options.Events.OnMarkersCreate = function(info, infowindow, marker) {
//                if (info.IsFeature) {
//                    var html = self.GetHtmlPoints(info);
//                    var markerInfoWindow = new google.maps.InfoWindow(googleApi.options.InfoWindowOptions);
//                    google.maps.event.addListener(markerInfoWindow, 'domready', function(){
//                        jQuery(".nhs_TvMapCard").parent().parent().next('div').hide();
//                    });
//                    markerInfoWindow.setContent(html);
//                    markerInfoWindow.open(googleApi.map, marker);
//                    marker.InfoWindow = markerInfoWindow;
//                    
//                }
//            };

            googleApi.processResult(self.parameters.TvMarketPoints);
            googleApi.processResult(self.parameters.CommunitiesForTvBuilderPoints);
        } else {
            googleApi.processResult(self.parameters.TvMarketPoints);
        }
        
        googleApi.AutoFit();

        setTimeout(function() {
            var zoom = googleApi.map.getZoom() - 1;
            googleApi.map.setZoom(zoom);
        }, 1000);

    },
    
    GetHtmlPoints: function(info) {
        var priceText ="";
        var priceValue ="";
        var sections = null;

        if (info.PriceRage) {
            sections = info.PriceRage.split(" ");
        }

        if (sections) {
            if (sections.length == 4) { //From xx - xx
                priceText = sections[0] + " ";
                priceValue = sections[1] + " " + sections[2] + " " + sections[3];
            } else if (sections.length == 2) { //From xx
                priceText = sections[0] + " ";
                priceValue = sections[1];
            } else if (sections.length == 3) { //Up to xx
                priceText = sections[0] + " " + sections[1] + " ";
                priceValue = sections[2];
            } else {
                priceText = info.PriceRage;
            }
        }

        var html = "<div class=\"nhs_TvMapCard\"><a class=\"nhs_commDetail\" target='_blank' href='" + this.parameters.urlDetailPage.replace("{builder}", info.BuilderId).replace("{community}", info.Id) + "' >";
       
        if (info.IsFeature)
            html += "<p>FEATURED ON THE SHOW</p>";
        html += "<h3>" + info.CommunityName + "</h3><p class=\"nhs_Price\">" + priceText.toLowerCase() + "<strong>" + priceValue + "</strong>" +"</p>";
        html += "</a></div>";
        return html;
    },

    initLocationBox: function() {
        var self = this;

        jQuery("#nhs_LocationSubmit").click(function() {
            var value = jQuery("#nhs_LocationSearchTextBox").val();
            jQuery("#nhs_LocationSubmit").hide();
            jQuery("#nhs_LocationSubmitFake").show();
            if (value.length > 0 && !(value.indexOf(',') != -1 && value.split(',')[1] == '')) {
                value = jQuery.trim(value);
                if (value.length > 0 && value != "Enter location or community name") {
                    jQuery("#nhs_LocationSubmitFake").hide();
                    jQuery("#nhs_LocationSubmit").show();
                    return true;
                } else {
                    alert("Please enter a valid location or select an item from the list.");
                    jQuery("#nhs_LocationSubmitFake").hide();
                    jQuery("#nhs_LocationSubmit").show();
                    return false;
                }
            }
            jQuery("#nhs_LocationSubmitFake").hide();
            jQuery("#nhs_LocationSubmit").show();
            return false;
        });

        self.searchTypeahead.setupSearchBox("nhs_LocationSearchTextBox", "nhs_LocationSearchType");

        SetTextBoxesDescriptions();
    },

    initPagination: function() {
        var videos = jQuery('.nhs_TvVideoItem');
        var videosCount = videos.length - 1;
        var itemsPerSlide = 6;

        if (videosCount >= itemsPerSlide) {
            var container = jQuery('.nhs_TvVideoPage');
            var containerParent = container.parent();
            var totalPages = Math.ceil((videosCount + 1) / itemsPerSlide);
            var count = 0;

                containerParent.append('<a class="slidesjs-previous">Prev</a>');
                jQuery('.slidesjs-previous', containerParent, containerParent.parent()).after('<a class="slidesjs-next">Next</a>');
                containerParent.append('<ul class="slidesjs-pagination"></ul>');
                jQuery('.slidesjs-pagination', containerParent).append('<li class="slidesjs-paginationV2"><a class="active" data="#' + count + '">' + (count + 1) + '</a></li>');

                for (count = 1; count < totalPages; count += 1) {
                    jQuery('.slidesjs-pagination', containerParent).append('<li class="slidesjs-paginationV2"><a data="#' + count + '">' + (count + 1) + '</a></li>');
                }

            for (count = itemsPerSlide; count <= videosCount; count += 1) {
                videos[count].style.display = 'none';
            }
        }
    },

   loadYoutubeAPI: function() {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },
    
    onPlayerStateChange : function(event) {
        var element = event.target.a.id;
        element = parseInt(element.substr(8, 1)) + 1;
        if (event.data == 1)
            jQuery.googlepush('NHS TV Page', 'Segments', 'Place ' + element);            
    },
   
    submitNewsletter: function(isSmallSignUp) {
            var self = this;
            var data;
            if (isSmallSignUp) {
                data = jQuery("#nhs_TvMarketFormSmall input, #nhs_TvMarketFormSmall textarea").serialize();
            } else {
                data = jQuery("#nhs_TvMarketForm input, #nhs_TvMarketForm textarea").serialize();
            }            


            jQuery.ajax({
                url: this.parameters.ContestModalUrl,
                type: "POST",
                data: data,
                success: function(html) {
                    if (isSmallSignUp)
                        jQuery('#nhs_TvMarketSignUpSmall').html(html);
                    else
                        jQuery('#nhs_TvMarketSignUp').html(html);
                    
                    tb_show('', '/newhomesourcetv/contestmodal/' + self.parameters.MarketId + '?width=640&amp;height=320&showSignUp=false', false);
                }
            });
    },

    validateNewsLetterValues: function(inputBtn, isSmallTvSignup) {
        var self = this;
        jQuery(inputBtn).hide();
        if (isSmallTvSignup)
            jQuery('#fakeInputLoadingSmall').show();
        else
            jQuery('#fakeInputLoading').show();

        var returnValue = true;
        var email = (isSmallTvSignup) ? jQuery('#smallSignUpEmail').val() : jQuery('#Email').val();
        email = jQuery.trim(email);
        if (!ValidEmail(email)) {
            if (isSmallTvSignup)
                jQuery('.nhs_NewsletterSmallSignUpErrors').html('<p class="nhs_Error">Please enter a valid email address.</p>');
            else
                jQuery('.nhs_NewsletterSignUpErrors').html('<p class="nhs_Error">Please enter a valid email address.</p>');
            returnValue = false;
            if (isSmallTvSignup)
                jQuery('#fakeInputLoadingSmall').hide();
            else
                jQuery('#fakeInputLoading').hide();

            jQuery(inputBtn).show();
        }

        if (returnValue) {
            if (isSmallTvSignup) {
                jQuery.googlepush('NHS TV Page', 'About the Show', 'About-Email Submit');
                self.submitNewsletter(true);
            } else {
                jQuery.googlepush('NHS TV Page', 'Main', 'Offers-Email Submit');
                self.submitNewsletter(false);
            }

        }
    },
};
