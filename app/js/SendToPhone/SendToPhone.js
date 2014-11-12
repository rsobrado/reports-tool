NHS.Scripts.SendToPhone = function () {

};

NHS.Scripts.SendToPhone.prototype =
{
    initialize: function (elementId) {

        if (elementId === undefined) elementId = "Phone";

        $jq("#" + elementId).mask("(999) 999-9999");
        $jq("#" + elementId).focus();
        $jq("#Cancel").click(tb_remove);
    }
};