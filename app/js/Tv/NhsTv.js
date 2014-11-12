NHS.Scripts.NhsTv = function () {
};

NHS.Scripts.NhsTv.prototype =
{
    get_log: function () { return this._log; },
    initialize: function () {

        this._setUi();
    },
    
    _setUi: function() {
        var col1 = $jq('.nhs_TvCol1').height();
        var col2 = $jq('.nhs_TvCol2').height();
        if (col1 >= col2) {
            $jq('.nhs_TvCol2').height(col1 - 45);
        }
        else {
            $jq('.nhs_TvCol1').height(col2);
        }

        var tvSearchNav = $jq(".nhs_TvSearchMenu ul");
        //add indicators and hovers to submenu parents
        tvSearchNav.find("li").each(function () {
            //$jq(this).find("ul").hide();
            if ($jq(this).find("ul").length > 0) {
                $jq(this).children("li > span").on("touchstart mouseenter mouseup", function (event) {
                    if ($jq(this).hasClass("nhs_Active")) {
                        if (event.type == "mouseenter") return false;
                        if (event.type == "touchstart") return true;
                        if (event.type == "mouseup") {
                            //hide submenus
                            $jq(this).parent().find("ul").stop(true, true).hide();
                            $jq(this).removeClass("nhs_Active");
                        }
                    }
                    else {
                        //show subnav
                        $jq(this).parent().find("ul").stop(true, true).show();
                        $jq(this).addClass("nhs_Active");

                        $jq.googlepush('NHS TV Page', 'Search', 'Sub Market Hover');
                    }
                    if (event.type == "touchstart") return false;
                });
                //hide submenus on exit  
                $jq(this).mouseleave(function () {
                    $jq(this).find("ul").stop(true, true).hide();
                    $jq(this).find("span").removeClass("nhs_Active");
                });
            }
        });
    }
    
    
};



