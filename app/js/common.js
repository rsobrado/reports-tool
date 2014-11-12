//NameSpace Declaration 
NHS = {};
NHS.Scripts = {};
NHS.Scripts.Helper = {};
NHS.Scripts.Helper.JSON = {};
NHS.Scripts.Globals = {};
NHS.Scripts.CommunityResults = {};
NHS.Scripts.CommunityDetail = {};
NHS.Scripts.HomeDetail = {};
NHS.Scripts.PropertyMap = {};
NHS.Scripts.MediaPlayer = {};
NHS.Scripts.SearchAlert = {};

var tempNum;
var fromP;
var createeBook = true;
//Renaming the $ function
var $jq = jQuery.noConflict();

$jq(document).ready(function () {

    HighlightNav();

    $jq("#lnkSignIn").click(function () {
        $jq.googlepush('Account Events', 'Create Account', 'Open Form - Header Link');
    });
    $jq(".GAPush li a").click(function () {
        var ul = $jq(this).parent().parent();
        var id = ul.attr("id");
        var listItem = ul.find("li");
        var index = listItem.index($jq(this).parent()) + 1;
        $jq.googlepush('Site Links', 'SEO Links', id + index);
    });

    setTimeout(function () {
        $jq(".nhs_SpotCommImg a").click(function () {
            var ul = $jq(this);
            var type = ul.attr("type");
            $jq.googlepush('Images', 'Spotlight - ' + type, 'Select Images');
        });
    }, 5000);

    // Global Nav
    jQuery("#nhs_Header > nav > ul > li > a").click(function (event) {
        jQuery.NhsCancelEvent(event);
    });
    var globalNav = jQuery("#nhs_Header > nav > ul");
    var timer = 0;
    //add hovers to submenu parents
    globalNav.find("li").each(function () {
        jQuery(this).find(">div").hide();
        if (jQuery(this).find(">div").length > 0) {
            jQuery(this).children("li>a").on("touchstart mouseenter mouseup", function (event) {
                if (jQuery(this).hasClass("nhs_Active")) {
                    if (event.type == "mouseenter") return false;
                    if (event.type == "touchstart") return true;
                    if (event.type == "mouseup") {
                        //hide submenus
                        jQuery(this).parent().find(">div").stop(true, true).fadeOut(500);
                        jQuery(this).removeClass("nhs_Active");
                    }
                }
                else {
                    //show subnav
                    if (event.type == "touchstart") {
                        globalNav.find("li>a").removeClass("nhs_Active");
                        globalNav.find("li>div").stop(true, true).fadeOut(500);
                    }
                    //jQuery(this).parent().find(">div").css("z-index", "9999999");
                    jQuery(this).parent().find(">div").stop(true, true).fadeIn(300);
                    jQuery(this).addClass("nhs_Active");
                }
                if (event.type == "touchstart") return false;
            });
            //hide submenus on exit  
            jQuery(this).mouseleave(function () {
                jQuery(this).find(">div").stop(true, true).fadeOut(500);
                //jQuery(this).find(">div").css("z-index", "9999998");
                jQuery(this).find("a").removeClass("nhs_Active");
            });
        }
    });

    ReferModuleHandler.SetRefer();

});



//This function create a JSON object to send it to the method controller on the server, and log the error in a file.
NHS.Scripts.Helper.logError = function logError(error, href, addInfo) {
    //keep the browser Info to the browserInfo variable to know in which browser occurs the error
    var browserInfo = "Browser: " + navigator.appCodeName + " - " + navigator.appName + " Version: " + navigator.appVersion;

    if (error !== null && typeof (error) !== 'undefined') {
        //Create the JSON object with the information error
        var dataPost = {
            Message: error.hasOwnProperty('message') ? error.message : error,
            Number: error.hasOwnProperty('lineNumber') ? error.lineNumber : error,
            Name: error.hasOwnProperty('message') ? error.name : error,
            Href: href,
            AddInfo: addInfo,
            BrowserInfo: browserInfo
        };

        var nhsJSONObject = $jq.toJSON(dataPost);

        //Call to the Server method to log the error on the file
        $jq.ajax({
            type: "POST",
            url: "/Log/LogError",
            data: { nhsJsError: nhsJSONObject },
            dataType: "json"
        });

        //Return true; to avoid show errors to the browsers users
        return true;
    }
};



//create delegate method
//can be used in ajax callbacks etc so that methods
//are executed in the context of the object instance
//and not that of jquery xhr object 
//read more abt this: http://weblogs.asp.net/bleroy/archive/2007/04/10/how-to-keep-some-context-attached-to-a-javascript-event-handler.aspx
NHS.Scripts.Helper.createDelegate = function createDelegate(object, method) {
    return function () { method.apply(object, arguments); };
};

Function.prototype.bind = function (owner) {
    var that = this;
    if (arguments.length <= 1) {
        return function () {
            return that.apply(owner, arguments);
        };
    } else {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return that.apply(owner, arguments.length === 0 ? args : args.concat(Array.prototype.slice.call(arguments)));
        };
    }
};


// Cookies Write Function
NHS.Scripts.Helper.createCookie = function (name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else {
        var expires = "";
    }

    document.cookie = name + "=" + value + expires + "; path=/";
};

// Cookies Read Function
NHS.Scripts.Helper.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

// Cookies Erase Function
NHS.Scripts.Helper.eraseCookie = function (name) {
    NHS.Scripts.Helper.createCookie(name, "", -1);
};

NHS.Scripts.Helper.JSON.toString = function toString(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type  
        //if (t == "string") obj = '"'+obj+'"';  
        return String(obj);
    }
    else {
        // recurse array or object  
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof (v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

NHS.Scripts.Helper.stopBubble = function (e) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    //alert("bubble stop");
};


//Attach window.onerror to logError function, please do not change the position
window.onerror = function (error, url, lineError) {
    //return NHS.Scripts.Helper.logError(error, url, lineError)
};

NHS.Scripts.Helper.FieldDefaultValue = function (fieldId, defaultValue, defaultValueClass, submitButtonId, submitButton2Id) {
    if (typeof (fieldId) == 'string')
        this._field = $jq('#' + fieldId);
    else
        this._field = $jq(fieldId);
    this._defaultValue = defaultValue;
    this._defaultValueClass = defaultValueClass;
   
    if (submitButtonId != null)
        this._submitButton = $jq('#' + submitButtonId);
    if (submitButton2Id != null) 
        this._submitButton2 = $jq('#' + submitButton2Id);
};

NHS.Scripts.Helper.FieldDefaultValue.prototype = {

    initialize: function () {

        //Set value initially if none are specified
        if (this._field.val() == '') {
            this._field.addClass(this._defaultValueClass);
            this._field.val(this._defaultValue);
        }

        // Create delegates
        this._focusHandler = NHS.Scripts.Helper.createDelegate(this, this._onFocus);
        this._blurHandler = NHS.Scripts.Helper.createDelegate(this, this._onBlur);
        this._submitHandler = NHS.Scripts.Helper.createDelegate(this, this._onSubmit);

        // Attach events
        this._field.focus(this._focusHandler);
        this._field.blur(this._blurHandler);
        if (this._submitButton != null)
            this._submitButton.click(this._submitHandler);

        if (typeof (this._submitButton2) != "undefined") {
            this._submitButton2.click(this._submitHandler);
        }
    },

    // Remove values on focus
    _onFocus: function () {
        if (this._field.val() == this._defaultValue) {
            this._field.removeClass(this._defaultValueClass);
            this._field.val('');
        }
    },

    // Place values back on blur
    _onBlur: function () {
        if (this._field.val() == '') {
            this._field.addClass(this._defaultValueClass);
            this._field.val(this._defaultValue);
        }
    },

    //Capture form submission
    _onSubmit: function () {
        if (this._field != null && this._field.val() == this._defaultValue) {
            this._field.val('');
        }
    }
};


// Dropdown JSON fill helpers
$jq.fn.clearSelect = function () {
    return this.each(function () {
        if (this.tagName == 'SELECT')
            this.options.length = 0;
    });
};

$jq.fn.fillSelect = function (data) {
    return this.clearSelect().each(function () {
        if (this.tagName == 'SELECT') {
            var dropdownList = this;
            $jq.each(data, function (index, optionData) {
                var option = new Option(optionData.Text, optionData.Value);

                if ($jq.browser.msie) {
                    dropdownList.add(option);
                }
                else {
                    dropdownList.add(option, null);
                }
            });
        }
    });
};


Number.prototype.formatCurrency = function (p, c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return p + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

//What Browser
function UseOnSubmit() {
    var uA = navigator.userAgent.toLowerCase();
    var res = false;
    if (uA.indexOf("firefox") == -1 && uA.indexOf("apple") == -1 && uA.indexOf("msie 9.0") == -1 && uA.indexOf("chrome") == -1 && uA.indexOf("msie 10.0") == -1) {
        res = true;
    }

    return res;
}


//Method to fill Areas dropdown in Boyl search
function FillMarkets() {
    try {
        var areasSelect = $jq('#ddlMarket');

        var selectedState = $jq("[id*='ddlState'] :selected").text();
        if (selectedState != null && selectedState != '') {
            $jq.ajax({
                type: "GET",
                url: "/BoylSearch/GetAreas",
                dataType: 'json',
                data: { state: selectedState },
                success: function (data) {
                    areasSelect.empty();
                    $jq.each(data, function (index, area) {
                        areasSelect.append($jq('<option></option>').text(area.Text).val(area.Value));
                    });
                }
            });
        }
    }
    catch (ex) {

    }

}

//Close Static Content Overlay
/*$jq(document).ready(function () {
$jq("#stclose").click(function () {
$jq('#stcontent').hide();
});
});*/

//Gets the path for the file used in static content
function getThePath(ps, tit) {
    var res;
    for (var i = 0; i < ps.length; i++) {
        var elem = ps[i].replace("\\", "//");
        tit = tit.replace("/", "\\").toLowerCase();
        if ((elem.toLowerCase().indexOf(tit) != -1) && (tit != "")) {
            res = elem;
            break;
        }

    }
    return res;
}

function reload(url) {
    window.location.href = url;
}

//Identify static content regions in the page
function HighlightRegion(listDif) {

    var list = new Array();
    list = listDif.split(',');
    var paths = new Array();
    var num = 1;
    var ind;
    var path;

    for (var i = 0; i < list.length; i++) {
        var elem = list[i].split(';');
        paths.push(elem[1]);
    }

    $jq("div").each(function () {
        var cn = $jq(this).attr("class");
        if (cn == "nhsStaticContent") {

            $jq(this).addClass("nhs_Overlay");
            $jq(this).mouseover(function () {
                $jq(this).removeClass("nhs_Overlay_Out");
                $jq(this).addClass("nhs_Overlay_Over");

                var stnum = $jq(this).children().children("[class*='stNumber']");
                tempNum = $jq(stnum).html();
                var tit = $jq(stnum).attr("title");
                $jq(stnum).html(tempNum + "   " + "<b class=\"stNumberPath\">" + getThePath(paths, tit) + "</b>");

            });

            $jq(this).mouseout(function () {
                $jq(this).removeClass("nhs_Overlay_Over");
                $jq(this).addClass("nhs_Overlay_Out");

                var stnum = $jq(this).children().children("[class*='stNumber']");
                $jq(stnum).html(tempNum);

            });
        }
    });


    $jq("b").each(function () {
        var cn2 = $jq(this).attr("class");
        if (cn2 == "stNumber") {

            $jq(this).html(num);

            if (num > 9)
                $(this).css("left", "8px");
            num = num + 1;
        }
    });
}

//Close Modal
function closeThisModal() {
    reloadParent();
}


// Enable the place holder functionaly in browsers that doesnt support it 
function SetTextBoxesDescriptions() {
    if (!Modernizr.input.placeholder) {
        jQuery('[placeholder]').focus(function () {
            var input = jQuery(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function () {
            var input = jQuery(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur().parents('form').submit(function () {
            jQuery(this).find('[placeholder]').each(function () {
                var input = jQuery(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            })
        });
    }
}

function ss(w, h) {
    var el = $jq('#FromPage').val();
    //alert(el);
    //alert(valid);
    //alert(w + " : " + h);
    if (el.indexOf("createalertmodal") != -1) {
        //alert("try resize");
        $jq('#nhs_Login').fadeOut();
        tb_resizeWindow(w, h);
    }
}

function getRecoCheckedBox(box) {
    var chkval = box.checked;
    var arr = box.name.split('_');
    var index = arr[3];
    if (box.checked) {
        $jq('#CblReqComm_' + index.toString()).val(false);
    }
    else {
        $jq('#CblReqComm_' + index.toString()).val(true);
    }

}

function SetPromosToggle() {
    var charactersToShow = 215;
    var moreText = "...more";
    var lessText = "less";

    if ($jq('#liPromos').hasClass("option2")) {
        charactersToShow = 100;
    } else if ($jq('#liPromos').hasClass("option3")) {
        charactersToShow = 55;
    }
    
    

    $jq('.more').each(function () {
        var content = $jq(this).html();
        if (content.length > charactersToShow) {
            var chunkText = content.substr(0, charactersToShow);
            var otherText = content.substr(charactersToShow, content.length - charactersToShow + 1);
            var finalContent = chunkText + '<span class="moreellipses">' + '&nbsp;</span><span class="morecontent"><span>' + otherText + '</span>&nbsp;&nbsp;<a href="javascript:void(0)" class="morelink">' + moreText + '</a></span>';

            $jq(this).html(finalContent);
        }
    });

    $jq(".morelink").click(function () {
        if ($jq(this).hasClass("less")) {
            $jq(this).removeClass("less");
            $jq(this).html(moreText);
        } else {
            $jq(this).addClass("less");
            $jq(this).html(lessText);
        }

        $jq(this).parent().prev().toggle();
        $jq(this).prev().toggle();
        return false;
    });
}

//Ensure the parent detail page is refreshed fater modal close event
function tb_refresParentDetailPage() {
    refreshparentwindow = true;
}

//Use console.log freely in your scripts to log through firefox firebug only in debug mode
    $jq(document).ready(
        function() {
            if (NHS.Scripts.Globals.IsDebug && $j.browser.mozilla) {
                try {
                    window.loadFirebugConsole();
                } catch(err) {
                    if (typeof(console) == 'undefined')
                        console = {
                            log: function(msg) {
                            }
                        };
                }
            } else if (typeof(console) == 'undefined')
                console = {
                    log: function(msg) {
                    }
                };


        });

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] == obj) { return i; }
        }
        return -1;
    }
}

function Reload() {
    window.location.reload();
}

function ValidFullName(name) {
    var pattern = new RegExp(/^[a-zA-Z]+\s[a-zA-Z]+$/i);
    return pattern.test(name);
}

function ValidEmail(email) {
    var pattern = new RegExp(/^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/i);
    return pattern.test(email);
}

function ValidFullNameWithNumberLastName(name) {
//    var pattern = new RegExp(/^[a-zA-Z,.0-9''-]+ [a-zA-Z,.0-9''-]+/i);
    var pattern = new RegExp(/^([A-Za-z]+(-?'?[A-Za-z+'?-?]+)?)(\s([A-Za-z]+(-?'?[A-Za-z+'?-?]+)?))+?$/i);
    return pattern.test(name) && name.split(' ').length > 1;
}

function ValidZipcode(zip) {
    var pattern = new RegExp(/^\d{5}(-\d{4})?$/i);
    return pattern.test(zip);
}

function HighlightNav() {
    var path = location.pathname;

    var highlighted = false;

    if ($jq('#mv_SearchNav li a[href="' + path + '"]') != null) {
        $jq('#mv_SearchNav li a[href="' + path + '"]').parent().addClass('active');
        highlighted = true;
    }

    if ((path.charAt(path.length - 1) == '/') && (!highlighted)) {
        $jq('#mv_SearchNav li a[href="' + path.substring(0, path.length - 1) + '"]').parent().addClass('active');
        highlighted = true;
    }

    var pathsSlash = path.split('/');

    if (pathsSlash.length > 2) {
        $jq('#mv_SearchNav li a[href="/' + pathsSlash[1] + '/"]').parent().addClass('active');
    }
}

function FreeBrochureSubmitGAEvents() {
    if (jQuery('#CreateAlert').prop('checked')) {
        jQuery.googlepush('Lead Events', 'Search Results CTA Free Brochure', 'Option Checked - Send Me More');
    }
    if (jQuery('#Newsletter').prop('checked')) {        
        jQuery.googlepush('Lead Events', 'Search Results CTA Free Brochure', 'Option Checked - Free Newsletter');
    }
    if (jQuery('#Promos').prop('checked')) {
        jQuery.googlepush('Lead Events', 'Search Results CTA Free Brochure', 'Option Checked - Special Promotions');
    }
}

function disableScrollKeys() {
    jQuery(document).keypress(function (e) {
        var k = e.keyCode;
        if (k >= 37 && k <= 40) {
            return false;
        }
    });
}

function enableScrollKeys() {
    jQuery(document).unbind('keypress', null);
}

function SubmitGetBrochures() {
    var count = jQuery("input[id^='chkReqCommBrochure_']:checked").length + jQuery("input[id^='chkReqHomeBrochure_']:checked").length;
    jQuery.googlepush('Lead Events', 'Search Results CTA Free Brochure', 'Submit Form - Get Free Brochures', count);
    jQuery.SetDataLayerPair('recommendedLead',count);
}


var VWOCountTimer = null;
function VWOReady(action) {
    if (typeof (_vwo_code) != "undefined") {
        if (_vwo_code.finished()) {
            clearTimeout(VWOCountTimer);
            if (jQuery.isFunction(action))
                action.call();
        } else {
            VWOCountTimer = setTimeout(function () { VWOReady(action); }, 500);
        }
    } else if (jQuery.isFunction(action))
        action.call();
}

//This code just check for the refer after a # in the url, if is pass by QueryString or post the controller handle that
var ReferModuleHandler = (function ($) {
    /// the $ is just to handle a common way for jQuery, under this scope
    'use strict';
    var my = {}; // This is our internal object where we define the  

    ///Private Properties    
    var finalUrl = "/common/setrefer";
    ///END Private Properties

    ///Private Methods
    function getHashTagRefer() {
        return $.GetHashTagParameter('refer');
    }

//    function getHashTagParameter (parameterName) {
//        var exp = "[#|&]" + parameterName + "=" + "([^&]+)(&|$)";
//        var val = (RegExp(exp).exec(decodeURIComponent(location.hash)) || [, null])[1];

//        if (val == "null") {
//            val = "";
//        }

//        return val;
//    }
    
    function setReferTag() {
        var refVal = getHashTagRefer();
        var refUrl = "";

        if (refVal != null && refVal != "") {
            if (typeof (document.referrer) != 'undefined' && document.referrer != "") {
                refUrl = document.referrer;
            }

            $.ajax({
                type: "GET",
                url: finalUrl,
                data: { refVal: refVal, refUrl: refUrl }
            }).done(function (data) {
                //...do something here if is required                
            });
        }
    }
    ///END Private Methods


    ///Public Methods
    my.SetRefer = function () {
        setReferTag();
    };
    ///END Public Methods

    return my; //return the object when you define your public logic
} (jQuery));