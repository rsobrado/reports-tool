NHS.Scripts.AdvancedSearch = function () {
};

NHS.Scripts.AdvancedSearch.prototype =
{
    initialize: function () {
        var self = this;
        $jq("#rblHomeAll").attr('checked', true);
        $jq("#rblOfferAll").attr('checked', true);
        
        SetTextBoxesDescriptions();
        
        $jq("#SearchText").blur(function () {
            self.EntryValidator.call(self, $jq("#SearchText").attr('id'));
        });


        $jq('#btnSearchHomes').click(function () {
            var res = self.ValidateAdvForm('2');
            if (res)
                $jq('#frmValidate').submit();
        });
    },

    ResetForm: function () {
        $jq('select').removeAttr('selected').find('option:first').attr('selected', 'selected');
        $jq("input[type='radio'], input[type='checkbox']").removeAttr('checked');
        $jq("#rblHomeAll, #rblOfferAll, #rblPromoAny").attr('checked', true);

    },
    ShowValidatorMessage: function (flag) {

        var labelError = $jq("#locationErrorMessage");
        if (flag) labelError[0].style.display = 'block';
        else
            labelError[0].style.display = 'none';
    },
    ValidateAdvForm: function (stype) {
        var self = this;
        var txtLoc = $jq('#SearchText');
        var schtext = txtLoc.val().trim();
        var res = true;

        var messageContainer = $jq('#divMessage');
        var message = '<p class=\'field-validation-error\'>Please enter a City, ST or Zip.</p>';

        messageContainer.html('');

        if (schtext == '' || (schtext.indexOf(',') != -1 && schtext.split(',')[1] == '')) {
            messageContainer.html(message);
            res = false;
        }
        else
            if (!self.isZip(schtext) && schtext.indexOf(",") == -1) {
                messageContainer.html(message);
                res = false;
            }
            else
                if (!self.isZip(schtext)) {
                    var commaPos = schtext.indexOf(",");
                    var locText = schtext.substring(0, commaPos);
                    var state = schtext.substring(commaPos + 1);
                    if (locText == "" || state == "") {
                        messageContainer.html(message);
                        res = false;
                    }
                }

        if (res) {
            if (stype == '1')
                $jq("#CommSearch").val(true);
            else if (stype == '2')
                $jq("#CommSearch").val(false);
        }

        return res;
    },

    isZip: function (s) {

        // Check for correct zip code
        var reZip = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);

        if (!reZip.test(s)) {
            // alert("Zip Code Is Not Valid");
            return false;
        }

        return true;
    },



    EntryValidator: function (id) {
        var self = this;
        setTimeout(function () { self.ValidateLocation.call(self, id); }, 150);

    },
    ValidateLocation: function (id) {
        var self = this;
        var location = $jq("#" + id);
        if (location == null) return;
        if (location.val() == '') return;
        var textArea = $jq('.ui-autocomplete');
        if (textArea == null || textArea[0].childNodes.length == 0) return;
        var list = textArea[0];

        if (list == null) return;
        for (i = 0; i < list.childNodes.length; i++) {
            if (list.childNodes[i].nodeName == "LI") {
                var aItem = list.childNodes[i].innerHTML;
                aItem = list.childNodes[i].innerText;
                if (aItem == undefined) {
                    aItem = list.childNodes[i].textContent;
                }
                var sch = location.val().toUpperCase();
                if (aItem.toUpperCase() == sch) {
                    self.ShowValidatorMessage.call(self, false);
                    return;
                }
            }
        }

        ShowValidatorMessage(true);
    }
};
