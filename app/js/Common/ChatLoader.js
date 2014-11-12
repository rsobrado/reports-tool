NHS.Scripts.ChatLoader = function () {

};


NHS.Scripts.ChatLoader.prototype =
{
    init: function(parameters) {
        /*if (parameters) {
            var url = parameters[0];
            $jq.getScript(url, function () {
                eval(parameters[1]);
                url = parameters[2];
                $jq.getScript(url, function () {
                });
            });
        }// */

        try {
            popIn();
            //console.log('popIn');
        } catch (Exception) {
            //console.log(Exception);
        }
    }
};