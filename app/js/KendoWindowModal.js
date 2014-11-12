var reloadPageAfterLogin = false; // Globarl variable that handle the case where I have to reload the page, this is required after perform a sign in

jQuery(document).ready(function () {
    tb_init('a.thickbox, area.thickbox, input.thickbox'); 
});

function tb_init(domChunk) {
    jQuery(domChunk).click(function (e) {
        e.preventDefault();
        var t = this.title || "";
        var a = this.href || this.alt;
        var ut = jQuery(this).attr("data-usedTitle") == "false";
        if (ut)
            t = false;
        tb_show(t, a);
        this.blur();
        return false;
    });
}

function tb_initLive(domChunk) {
    jQuery(domChunk).live("click", function(e) {
        e.preventDefault();
        var t = this.title || "";
        var a = this.href || this.alt;
        var ut = jQuery(this).attr("data-usedTitle") == "false";
        if (ut)
            t = false;
        tb_show(t, a);
        this.blur();
        return false;
    });
}

function tb_show(caption, url) {
    var queryString = url.replace(/^[^\?]+\??/, '').toLowerCase(); 
    var params = tb_parseQuery(queryString);
    var width = (params['width'] * 1) || 630; //  + 48 || 630;
    var height = (params['height'] * 1) || 440; //  + 40 || 440;
    var iframe = queryString.indexOf('tb_iframe') != -1;
    var useActions = (queryString.indexOf('tb_notactions') != -1) == false;
    var actions = useActions ? ["Close"] : {};

    if (jQuery('#TelerikWindow').length == 0) {
        jQuery('body').append('<div id="TelerikWindow" style="min-height:' + (height -50)+ 'px"><div id="pro_loading" style="height: 48px;left: 45%;position: absolute;top: 40%;width: 48px;" class="k-loading-image"></div></div>');
    }

    var kendowindow = jQuery("#TelerikWindow").kendoWindow({        
        actions: actions,
        iframe: iframe,
        height: height,
        minHeight: height, //240,
        draggable: false,
        modal: true,
        title: caption,
        width: width,
        content: url,
        resizable: false,
        deactivate: function () {
            this.destroy();
        },
        refresh: function () {
            jQuery('#pro_loading').remove();
            tb_center();
        },
        open: function () {
            //jQuery(".k-overlay")
            jQuery(".k-content-frame").height(height).width(width);
        },
        close: function () {
            jQuery('#TB_overlay').remove();

            if (reloadPageAfterLogin) {
                window.location.reload();
            }
        }
    }).data("kendoWindow");

    kendowindow.center = function () {
        var e = this, t = e.wrapper;
        //var $window = jQuery(window);
        //var top = Math.max(0, (($window.height() - t.outerHeight()) / 2) + $window.scrollTop()) + "px";
        //var left = Math.max(0, (($window.width() - t.outerWidth()) / 2) + $window.scrollLeft()) + "px";

        return e.options.isMaximized ? e : (t.css({
            marginLeft: '-' + parseInt((t.width() / 2), 10) + 'px',
            marginTop: '-' + parseInt((t.height() / 2), 10) + 'px',
            top: "47%",
            left: "50%"            
        }), e);
    };

    kendowindow.center();

    window.onresize = function () {
        tb_center();
    };

    jQuery(window).scroll(function () {
        tb_center();
    });

    jQuery(".k-overlay").click(function () { tb_remove(); });
}

function tb_remove() {
    if (jQuery("#TelerikWindow").data("kendoWindow")) {
        jQuery("#TelerikWindow").data("kendoWindow").close();
    } else {
        window.parent.tb_remove();
    }

    if (reloadPageAfterLogin) {
        window.location.reload();
    }

    return false;
}

function tb_parseQuery(query) {
    var params = {};
    if (!query) { return params; } // return empty object
    var pairs = query.split(/[;&]/);
    for (var i = 0; i < pairs.length; i++) {
        var keyVal = pairs[i].split('=');
        if (!keyVal || keyVal.length != 2) { continue; }
        var key = unescape(keyVal[0]);
        var val = unescape(keyVal[1]);
        val = val.replace(/\+/g, ' ');
        params[key] = val;
    }
    return params;
}

function tb_center() {
    if (jQuery("#TelerikWindow").data("kendoWindow")) {
        jQuery("#TelerikWindow").data("kendoWindow").center();
    }
}

function tb_resizeWindow(width, height) {
    if (jQuery("#TelerikWindow").data("kendoWindow")) {
        jQuery("#TelerikWindow").data("kendoWindow").wrapper.css({
            width: width,
            minHeight: height
        });
        tb_center();
    }
}

function tb_ChangeUrl(url) {
    if (jQuery("#TelerikWindow").data("kendoWindow")) {
        jQuery("#TelerikWindow").data("kendoWindow").refresh({ url: url });
    }
}

function tb_ChangeTitle(title) {
    if (jQuery("#TelerikWindow").data("kendoWindow")) {
        jQuery("#TelerikWindow").data("kendoWindow").title(title);
    }
}

function tb_DisplayLoadingIcon() {
    jQuery('#TelerikWindow').html("<div id='pro_loading' class='k-loading-image'></div>");
}