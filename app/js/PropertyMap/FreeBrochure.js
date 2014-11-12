NHS.Scripts.FreeBrochure = function (parameters) {
    this.parameters = parameters;
};

NHS.Scripts.FreeBrochure.prototype =
{
    init: function () {
        var self = this;
        var mapOptions = this.parameters.OptionsForMap;
        var googleApi = new NHS.Scripts.GoogleMapApi(mapOptions);

        googleApi.createMap();
        googleApi.createMarkerPoint(mapOptions.MapOptions.Latitude, mapOptions.MapOptions.Longitude, null, null, self.parameters.icon, null);
        googleApi.map.setCenter(new google.maps.LatLng(self.parameters.OptionsForMap.MapOptions.Latitude, self.parameters.OptionsForMap.MapOptions.Longitude));
        this.AttachEvents();
    },

    AttachEvents: function () {
        var date = new Date();
        var currentMonth = date.getMonth();
        var currentDate = date.getDate();
        var currentYear = date.getFullYear();
        
        jQuery('#nhsFakeDate').datepicker({
            minDate: new Date(currentYear, currentMonth, currentDate),
            beforeShow: (function (input) {
                field = jQuery('#Comments');
                var left = field.offset().left;
                var top = field.offset().top + 30;
                setTimeout(function () {
                    jQuery('#ui-datepicker-div').css({ 'position': 'absolute', 'top': top + 'px', 'left': left + 'px' });
                }, 1);
            }).bind(this),
            showOn: "button",
            buttonImageOnly: true,
            buttonImage: this.parameters.resourceRoot + "globalresourcesmvc/default/images/icons/calendar.png",
            onSelect: (function (dateText, inst) {
                var textBoxStr = jQuery('#Comments').val();

                if (textBoxStr != '' && textBoxStr.indexOf('Date: ') != -1)
                    textBoxStr = textBoxStr.substring(0, textBoxStr.indexOf('Date: '));

                var text = jQuery.trim(textBoxStr) + (textBoxStr == '' ? '' : ', ') + 'Date: ' + dateText.replace('/', '-').replace('/', '-');
                text = text.replace(',,', ',');
                jQuery('#Comments').val(text);
                return false;
            }).bind(this)
        });
    },
    
    RemoveGoogleInfo: function () {
        if (jQuery(".gm-style > div > a").attr("href")) {
            var aux;
            var len = jQuery('.gm-style-cc').length;
            for (aux = 1; aux < len; aux += 1) {
                jQuery('.gm-style-cc').eq('-1').remove();
            }
            jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title");
        }
    }
}