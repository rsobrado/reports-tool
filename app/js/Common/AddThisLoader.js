

NHS.Scripts.AddThisLoader = function () {

};


NHS.Scripts.AddThisLoader.prototype =
{
    init: function () {
        
        jQuery.getScript("http://s7.addthis.com/js/250/addthis_widget.js?pub=newhomesource", function () {
            try {
                var tbx = document.getElementById("smToolbox"),
                svcs = {
                    facebook: 'Facebook',
                    twitter: 'Twitter',
                    pinterest_share: 'Pinterest',
                    google_plusone_share: 'Google',
                    email: 'Email',
                    print: 'Print'
                };

                if (tbx != null) {
                    for (var s in svcs) {
                        tbx.innerHTML += '<a class="addthis_button_' + s + '"></a>';
                    }
                    addthis.toolbox("#smToolbox");
                                                  

                    jQuery('#nhs_SocialSideBar > p').click(function () {                   
                        if (!jQuery(this).parent().hasClass('nhs_Active')) 
                        {
                            jQuery(this).parent().addClass('nhs_Active');
                        }
                        else 
                        {
                            jQuery(this).parent().removeClass('nhs_Active');
                        }
                    });
                }

                if (typeof (addthis) != 'undefined' && addthis != null)
                {
                    addthis.addEventListener('addthis.menu.share', function(evt) {
                        jQuery.SetDataLayerPair('siteSocialMediaS');
                    });
                }

            } catch (e) {
                
            }
        });
        jQuery("#addThisImage").attr("src", "http://s7.addthis.com/static/btn/sm-plus.gif").attr("alt", "Bookmark and Share");
    }
};

var addthis_config =
{
    data_track_addressbar: false,
    ui_use_css: true // put this to false in order to add the custom CSS    
};  

jQuery(document).ready(function () {
    var addthis = new NHS.Scripts.AddThisLoader();
    addthis.init();
});

