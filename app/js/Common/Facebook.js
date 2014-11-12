if (typeof NHS == "undefined") {
    NHS = {};
    NHS.Scripts = {};
}

NHS.Scripts.Facebook = function (parameters) {
    this._parameters = parameters;
};

var redirect = null;

NHS.Scripts.Facebook.prototype =
{
    initialize: function () {
        var self = this;

        //jQuery.ajaxSetup({ cache: true });
        jQuery.getScript("//connect.facebook.net/en_US/all.js", function () {

            jQuery("#fbLoginButton").click(function () {
                jQuery.googlepush('Account Events', 'Access Account', 'Sign In - Create Account - Facebook');
            });

            redirect = jQuery("#FromPage").val();
            if (self._parameters.redirect)
                redirect = self._parameters.redirect;

            jQuery.InitFacebookControls(self._parameters.appId);

            /*Login to Facebook ***** scope-> set the permitions to get the email
            because by default the email is not return
            */

            jQuery("#fbLoginButton").click(function (e) {
                jQuery.NhsCancelEventAndStopPropagation(e);
                FB.login(self.statusChange, { scope: 'email' });
                return false;
            });

            jQuery("#lnkSignOff,.lnkSignOff").click(function () {
                FB.logout();
            });

            //            FB.getLoginStatus(function (response) {
            //                self.statusChange(response);
            //            });

            //FB.Event.subscribe('auth.statusChange', this.statusChange);
        });
    },
    statusChange: function (response) {
        if (response.status === 'connected') {
            // user has auth'd your app and is logged into Facebook
            FB.api('/me', function (info) {
                var params = {
                    Email: info.email,
                    Id: info.id,
                    FirstName: info.first_name,
                    LastName: info.last_name,
                    MiddleName: info.middle_name,
                    Name: info.name
                };
                jQuery.ajax({
                    type: "POST",
                    url: "/Facebook/FacebookLogin",
                    data: params,
                    success: function (msg) {
                        if (msg) {
                            if (typeof _gaq != 'undefined') _gaq.push(['_setCustomVar', 1, 'User', '{facebook:' + info.id + '}', 2]);

                            setTimeout(function () {
                                if (redirect) location.href = redirect;
                                else location.reload();
                            }, 100);
                        }
                    }
                });
            });
        }
    }
};

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.

jQuery.extend({
    CheckLoginState: function () {
        FB.getLoginStatus(function (response) {
            var facebook = new NHS.Scripts.Facebook();
            facebook.statusChange(response);
        });
    },

    InitFacebookControls: function (appId) {
        FB.init({
            appId: appId, //'206672489434716',
            status: true,
            cookie: true,
            xfbml: true,
            oauth: true,
            version: 'v2.0'
        });
    }
});