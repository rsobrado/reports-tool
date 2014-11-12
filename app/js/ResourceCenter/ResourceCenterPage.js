NHS.Scripts.ResourceCenterSlideshow = function() {
};

NHS.Scripts.ResourceCenterSlideshow.prototype =
{
    setupTwitter: function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = "//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs); }
    }
};

NHS.Scripts.ResourceCenterPage = function (typeAheadUrl, typeAheadText) {
    this._typeAheadUrl = typeAheadUrl;
    this._typeAheadText = typeAheadText;
    this._search = new NHS.Scripts.Search(typeAheadUrl);  
};

NHS.Scripts.ResourceCenterPage.prototype =
{
    initialize: function () {
        this._setUpCommonControls();
    },

    _setUpCommonControls: function () {

        //Pinterest
        $jq("#pinit").click(function () {
            $jq("#pinmarklet").remove();
            var e = document.createElement('script');
            e.setAttribute('type', 'text/javascript');
            e.setAttribute('charset', 'UTF-8');
            e.setAttribute('id', 'pinmarklet');
            e.setAttribute('src', 'http://assets.pinterest.com/js/pinmarklet.js?r=' + Math.random() * 99999999); document.body.appendChild(e);
        });
     
        // Placeholder fix for IE
        if (!Modernizr.input.placeholder) {
            $jq("[placeholder]").focus(function () {
                var input = $jq(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                    input.removeClass('placeholder');
                }
            }).blur(function () {
                var input = $jq(this);
                if (input.val() == '' || input.val() == input.attr('placeholder')) {
                    input.addClass('placeholder');
                    input.val(input.attr('placeholder'));
                }
            }).blur();
        }

        var nav = $jq("#nhs_CmsNav > div > ul");

        //add indicators and hovers to submenu parents
        nav.find("> li").each(function () {
//            if (!Modernizr.borderradius) {
//                $jq(this).children("ul").corner("tr bl br 5px");
//                $jq(this).children(":first").corner("top 5px");
//            }
            if ($jq(this).find("ul").length > 0) {
                $jq(this).children(":first").addClass("nhs_HasSubList");
                //show subnav on hover
                $jq(this).on("touchstart mouseenter", function () {
                    if ($jq(this).find("a").hasClass("nhs_Active")) {
                        //hide submenus
                        $jq(this).find("ul").stop(true, true).slideUp("fast");
                        $jq(this).children(":first").removeClass("nhs_Active");
                    }
                    else {
                        //show subnav
                        $jq(this).children(":first").addClass("nhs_Active");
                        $jq(this).find("ul").stop(true, true).slideDown();
                    }
                    return false;
                });
                //hide submenus on exit
                $jq(this).mouseleave(function () {
                    $jq(this).children(":first").removeClass("nhs_Active");
                    $jq(this).find("ul").stop(true, true).slideUp("fast");
                });   
            }
        });

        if (this._typeAheadUrl != '')
            this._search.setupSearchBox("MktSearch", "nhs_SearchBoxType");

        //Example Text
        var fdv = new NHS.Scripts.Helper.FieldDefaultValue('MktSearch', this._typeAheadText, 'nhs_LocationDefaultCms', 'Submit');
        fdv.initialize();

    },
    SetupFeatureSlideShow: function (options) {

        $jq(options.detailsSection).click(function () {
            if ($jq(this).attr('class') === 'true') {
                $jq(this).text('see details');
                $jq(this).attr('class', 'false');
                $jq(this).parent().next('div').fadeToggle("slow");
            }
            else {
                $jq(this).text('close details');
                $jq(this).attr('class', 'true');
                $jq(this).parent().next('div').fadeToggle();
            }
        });

        $jq(options.nhs_CmsSlideIntroStartLink).click(function () {
            $jq(options.next_arrow).click();
        });

        $jq(options.previos_arrow).hide();
        $jq(options.next_arrow).hide();

        $jq(options.nhs_CMS_mainContainer).on("mouseenter", function () {
            if ($jq('.nhs_CmsSlidesFeaturePagination li:last').hasClass('nhs_CmsSlidesCurrentPage') == false) {
                $jq(options.next_arrow).show();
            }

            if ($jq('.nhs_CmsSlidesFeaturePagination li:first').hasClass('nhs_CmsSlidesCurrentPage') == false) {
                $jq(options.previos_arrow).show();
            }
        });
        $jq(options.nhs_CMS_mainContainer).on("mouseleave", function () {
            $jq(options.previos_arrow).hide();
            $jq(options.next_arrow).hide();
        });

    },
    Pagination: function (option) {
        this.currentPage = 1;
        var self = this;
        var div = $jq("#" + option.id).find(".nhs_CmsArticleTeaser");
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

            $jq("div[page^='1']").show();
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
                                $jq("div[page]").fadeIn("normal");
                                a.hide();
                                $jq("a[page='all']").show().addClass("nhs_Active");
                                $jq("a[page='all']").html("Collapse");
                            } else {
                                a.show();
                                $jq("a[page^='" + self.currentPage + "']").addClass("nhs_Active");
                                $jq("div[page]").hide();
                                $jq("div[page^='" + self.currentPage + "']").fadeIn("normal");
                                $jq("a[page='all']").html("View All");
                            }
                        } else if (pageNumber != self.currentPage && pageNumber != "back" && pageNumber != "next") {
                            $jq("a[page^='" + pageNumber + "']").addClass("nhs_Active");
                            $jq("div[page]").hide();
                            $jq("div[page^='" + pageNumber + "']").fadeIn("normal");
                            self.currentPage = parseInt(pageNumber, 10);
                        }

                        document.getElementById("Pagination").scrollIntoView();
                    });
                }

            }
        }
    }
};
