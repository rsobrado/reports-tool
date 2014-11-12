NHS.Scripts.HomeGuideCategory = function (params) {
    this._params = params;
};

NHS.Scripts.HomeGuideCategory.prototype =
{
    initialize: function () {
        var self = this;
        $jq(document).keypress(function (e) {
            if (e.which == 13) {
                $jq("#btnSearch").click();
            }
        });

        $jq("#btnSearch").click(function () {

            var SearchPhrase = $jq("#SearchPhrase").val();
            if (SearchPhrase == "") {
                alert("Enter the Article to Search")
                $jq("#SearchPhrase").focus();
            } else {
                var url = "/" + self._params.page + "/" + self._params.paramName + "-" + SearchPhrase;
                window.location = url;
            }
        });

        var nav = $jq("#nhs_CmsNav > ul");

        //add indicators and hovers to submenu parents
        nav.find(">li").each(function () {
//            if (!Modernizr.borderradius) {
//                $jq(this).children("ul").corner("tr bl br 5px");
//                $jq(this).children(":first").corner("top 5px");
//            }
            if ($jq(this).find("ul").length > 0) {
                $jq(this).children(":first").addClass('nhs_HasSubList');
                //show subnav on hover
                $jq(this).mouseenter(function () {
                    $jq(this).children(":first").addClass('nhs_Active');
                    $jq(this).find("ul").stop(true, true).slideDown();
                });
                //hide submenus on exit
                $jq(this).mouseleave(function () {
                    $jq(this).children(":first").removeClass('nhs_Active');
                    $jq(this).find("ul").stop(true, true).slideUp('fast');
                });
            }
        });

    }
};