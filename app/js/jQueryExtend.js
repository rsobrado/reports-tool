jQuery.extend({
    Console: {
        Log: function (text) {
            if (console && console.log)
                console.log(text);
        },
        Error: function (text) {
            if (console && console.error)
                console.error(text);
        },
        Warn: function (text) {
            if (console && console.warn)
                console.warn(text);
        },
        Assert: function (text) {
            if (console && console.assert)
                console.assert(text);
        },
        Group: function (text) {
            if (console && console.group)
                console.group(text);
        },
        GroupEnd: function () {
            if (console && console.groupEnd)
                console.groupEnd();
        },
        Time: function (text) {
            if (console && console.time)
                console.time(text);
        },
        TimeEnd: function (text) {
            if (console && console.timeEnd)
                console.timeEnd(text);
        },
        TimeStamp: function (text) {
            if (console && console.timeStamp)
                console.timeStamp(text);
        },
        Clear: function () {
            if (console && console.clear)
                console.clear();
        }
    }
});


jQuery.extend({
    NhsCancelEvent: function (event) {
        var ev = event ? event : window.event; //Moz support requires passing the event argument manually     
        //Cancel the event   
        ev.cancelBubble = true;
        ev.returnValue = false;
        //if (ev.stopPropagation) ev.stopPropagation();
        if (ev.preventDefault) ev.preventDefault();
    },
    NhsCancelEventAndStopPropagation: function (event) {
        var ev = event ? event : window.event; //Moz support requires passing the event argument manually     
        //Cancel the event   
        ev.cancelBubble = true;
        ev.returnValue = false;
        if (ev.stopPropagation) ev.stopPropagation();
        if (ev.preventDefault) ev.preventDefault();
    },
    ResizeWindowModal: function (width, height) {
        var isAjaxForm = parent.AjaxForm != null ? true : false;

        if (isAjaxForm)
            parent.AjaxForm.SetWindowSize(width + 40, height + 20);
        else
            tb_resizeWindow(width, height);
    },

    CloseWindowModal: function (isLoggedIn) {
        var isAjaxForm = parent.AjaxForm != null ? true : false;
        if (isAjaxForm) {
            if (isLoggedIn == false) {
                parent.AjaxForm.UpdateMainPage();
            }

            parent.AjaxForm.CloseCurrentWindow();
        } else {
            if (isLoggedIn == false) {
                window.parent.tb_refresParentDetailPage();
            }

            window.parent.tb_remove();
        }
    },
    ResizeCreateAlert: function (width, height) {
        var isAjaxForm = parent.AjaxForm != null ? true : false;

        if (jQuery('.validation-summary-errors li').length > 0) {
            var errorCount = jQuery('.validation-summary-errors li').size();
            errorCount = errorCount * 15;
            height = height + errorCount;
        }

        if (jQuery('#alertSettingsPanel').attr("style").indexOf("none") == -1) {
            height = height + jQuery('#alertSettingsPanel').height() + 20;
        }

        if (isAjaxForm)
            parent.AjaxForm.SetWindowSize(width + 60, height + 40);
        else
            tb_resizeWindow(width, height);
    },
    ScrollToFast: function (targetOffset) {
        if (typeof targetOffset == "undefined")
            targetOffset = this.offset().top;
        this.ScrollTo(targetOffset, true);
    },
    ScrollTo: function (targetOffset, fast) {

        function scrollableElement(els) {
            for (var i = 0, argLength = arguments.length; i < argLength; i++) {
                var el = arguments[i], $scrollElement = jQuery(el);
                if ($scrollElement.scrollTop() > 0) {
                    return el;
                } else {
                    $scrollElement.scrollTop(1);
                    var isScrollable = $scrollElement.scrollTop() > 0;
                    $scrollElement.scrollTop(0);
                    if (isScrollable) {
                        return el;
                    }
                }
            }
            return [];
        }

        var scrollElem = scrollableElement('html', 'body');
        if (fast) {
            jQuery(scrollElem).scrollTop(targetOffset);
        } else {
            jQuery(scrollElem).animate({ scrollTop: targetOffset }, "slow", function () {
            });
        }
    }
});

jQuery.extend({
    ShowLoading: function () {
        var control = jQuery("#nhs_Loading,#nhs_Overlay");
        if (control.length == 0) {
            var overlay = jQuery('<div id="nhs_Overlay" style="position: fixed;z-index:99999;top: 0px;left: 0px;height:100%;width:100%;background-color: #000;filter: alpha(opacity=35);-moz-opacity: 0.35;opacity: 0.35;"></div>');
            var loading = jQuery('<div id="nhs_Loading" class="nhs_Loading"><p>Updating</p></div>');
            jQuery("body").append(overlay);
            jQuery("body").append(loading);
            loading.show();
            overlay.show();
        } else {
            control.show();
        }
    },

    HideLoading: function () {
        jQuery("#nhs_Overlay").hide();
        jQuery("#nhs_Loading").hide();
    }
});

jQuery.extend({
    GetHashTagParameter: function (parameterName) {
        var exp = "[#|&]" + parameterName + "=" + "([^&]+)(&|$)";
        var val = (RegExp(exp).exec(decodeURIComponent(location.hash)) || [, null])[1];

        if (val == "null") {
            val = "";
        }

        return val;
    },
    GetCookie: function (cookieName) {
        var nameEq = cookieName + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
        }
        return '';
    },

    GetUtmzCookieAsQueryString: function (locationUrl) {
        var cookie = jQuery.GetCookie('__utmz');

        if (cookie.trim().length < 1) {
            return '';
        }
        var queryStringCookieArr = [];
        var arrCookie = String(cookie).split('|');

        for (var i = 0; i < arrCookie.length; i++) {
            var param = arrCookie[i].split('=');

            //jQuery.Console.Log('Param index :' + String(i) + ' :: ' + param);

            if (param[0].indexOf('utmcsr') >= 0 && locationUrl.indexOf('utm_source=') < 0) {
                queryStringCookieArr.push('utm_source=' + param[1]);
            }

            if (param[0].indexOf('utmccn') >= 0 && locationUrl.indexOf('utm_campaign=') < 0) {
                queryStringCookieArr.push('utm_campaign=' + param[1]);
            }

            if (param[0].indexOf('utmcmd') >= 0 && locationUrl.indexOf('utm_medium=') < 0) {
                queryStringCookieArr.push('utm_medium=' + param[1]);
            }

            if (param[0].indexOf('utmctr') >= 0 && locationUrl.indexOf('utm_term=') < 0) {
                queryStringCookieArr.push('utm_term=' + param[1]);
            }

            if (param[0].indexOf('utmcct') >= 0 && locationUrl.indexOf('utm_content=') < 0) {
                queryStringCookieArr.push('utm_content=' + param[1]);
            }
            if (param[0].indexOf('utmgclid') >= 0 && locationUrl.indexOf('gclid=') < 0) {
                queryStringCookieArr.push('gclid=' + param[1]);
            }

        }

        return queryStringCookieArr.join('&');
    },
    GetLocationHrefWithUtmzAndRefer: function (referName) {
        var locationUrl = location.href;
        
        //-----------------------------------------------------------------
        // REMOVE # from the url

        if (locationUrl.indexOf('#') < locationUrl.indexOf('?')) {
            locationUrl = locationUrl.replace('?', '&').replace('#','?');
        }

        var arrSp1 = locationUrl.split('?');       
        var query = '';
        var tempUrl = arrSp1[0];      
        var arrNum = [];
        if (arrSp1.length > 1) {
            arrNum = arrSp1[1].split('#');            
            query = arrNum.join('&');
        } else {
            arrNum = arrSp1[0].split('#');            
            if (arrNum.length > 1) {
                tempUrl = arrNum[0];
                var queryTemp = [];
                for (var i = 1; i < arrNum.length; i++) {
                    queryTemp.push(arrNum[i]);
                }               
                query = queryTemp.join('&');
            }
        }
        locationUrl = tempUrl + (query.length > 0 ? ('?' + query) : '');
        //-----------------------------------------------------------------

        var hasQuestion = locationUrl.indexOf('?') >= 0;
        var queryCookie = jQuery.GetUtmzCookieAsQueryString(locationUrl);
        var hasQueryCookie = queryCookie.trim().length > 0;
        var hasTagRefer = locationUrl.indexOf('#refer=') >= 0;
        var hasParameterRefer = (locationUrl.indexOf('?refer=') >= 0 || locationUrl.indexOf('&refer=') >= 0);
        var refer = '';
        var completeOriginationUrl = [];

        if (hasTagRefer) {
            var locationUrlArr = locationUrl.split('#refer=');
            locationUrl = locationUrlArr[0];
            refer = 'refer=' + locationUrlArr[1];
        } else if (hasParameterRefer == false && typeof referName !== 'undefined' && referName.trim().length > 0) {
            refer = 'refer=' + referName;
        }

        completeOriginationUrl.push(locationUrl);
        var pushQuestion = false;

        if (hasQuestion == false && hasQueryCookie) {
            completeOriginationUrl.push('?');
            pushQuestion = true;
        } else if (hasQueryCookie) {
            completeOriginationUrl.push('&');
        }

        if (hasQueryCookie) {
            completeOriginationUrl.push(queryCookie);
        }

        if (refer.length > 0) {
            if (hasQueryCookie && hasQuestion) {
                completeOriginationUrl.push('&');
            } else if (pushQuestion == false && hasQuestion == false) {
                completeOriginationUrl.push('?');
            } else {
                completeOriginationUrl.push('&');
            }
            completeOriginationUrl.push(refer);
        }

        return encodeURIComponent(completeOriginationUrl.join(''));
    }
});

jQuery.fn.extend({
    ScrollTo: function (targetOffset) {
        if (typeof targetOffset == "undefined")
            targetOffset = this.offset().top;
        jQuery.ScrollTo(targetOffset, false);
    },
    ScrollToFast: function (targetOffset) {
        if (typeof targetOffset == "undefined")
            targetOffset = this.offset().top;
        jQuery.ScrollTo(this.offset().top, true);
    },
    ScrollClickTo: function (targetOffset) {
        var self = this;
        this.click(function (mozEvent) {
            var ev = mozEvent ? mozEvent : window.event; //Moz support requires passing the event argument manually     
            //Cancel the event   
            ev.cancelBubble = true;
            ev.returnValue = false;
            if (ev.stopPropagation) ev.stopPropagation();
            if (ev.preventDefault) ev.preventDefault();
            self.ScrollTo(targetOffset);
        });
        return this;
    }
});

(function ($) {
    $.fn.serializefiles = function (selector) {
        var obj = $(this);
        
        var formData;
        var useFormData = true;
        if (typeof FormData == "undefined") {
            formData = {};
            useFormData = false;            
        } else {
            formData = new FormData();            
        }

        $.each($(obj).find("input[type='file']"), function (i, tag) {
            if (useFormData) {
                $.each($(tag)[0].files, function(i, file) {
                    formData.append(tag.name, file); 
                });
            }
        });
        var params = $(obj).serializeArray();
        $.each(params, function (i, val) {
            useFormData
               ? formData.append(val.name, val.value)
               : formData.push(val.name, val.value);
        });

        if (selector) {
            var customData = $(selector).serializeArray();
            $.each(customData, function (i, val) {
                if (useFormData) {
                    formData.append(val.name, val.value);
                } else {                   
                    formData[val.name] = val.value;                   
                }
            });
        }

        if (useFormData == false) {
            formData = JSON.stringify(formData);
        }

        return formData;
    };
})(jQuery);