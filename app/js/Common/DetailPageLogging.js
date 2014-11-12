NHS.Scripts.Loggin = function (parameters) {
    this._parameters = parameters;
};

NHS.Scripts.Loggin.prototype =
    {
        initialize: function () {
            var self = this;
            
            $jq("#btnFreeBrochure").live("click", function () {
                var action = $jq(this).is('.popup') ? 'Image Viewer - Main Form' : (((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - Gallery CTA Main Form');
                var label = $jq(this).is('.popup') ? 'Submit Form - Free Brochure' : 'Submit Form - Free Brochure';

                $jq.googlepush('Lead Events', action, label);
            });

            $jq("#SendAlerts").live("change", function () {
                $jq.googlepushCheckBox(this, 'Lead Events',
                    ((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - Gallery CTA Main Form', 'Choose Option - Free Info');
            });

            $jq("#btn_NhsScheduleAppointment").click(function () {
                $jq.googlepush('Lead Events',
                    ((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - CTA Next Steps Appointment', 'Open Form - Free Brochure');
            });

            $jq("#btnUpdate").click(function () {
                $jq.googlepush(((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' Detail Events',
                    ((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - Map', 'Show Route');                
            });

            $jq("#btn_NhsMapSend").click(function () {
                $jq.googlepush('Lead Events',
                    ((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - CTA Request Appointment', 'Open Form - Free Brochure');
            });

            $jq("#nhs_PhoneLink").click(function () {
                $jq.googlepush(((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' Detail Events',
                    ((self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home') + ' - Gallery', 'See Phone Numbers');

                self.ShowPhoneNumber('nhs_LnkPhoneNum', 'nhs_FormPhone');
                return false;
            });

            $jq('#nhs_FormIPhone a, .Iphone_number a').click(function () {
                self.LogClick('LogIPhoneNumber');
            });

            $jq("#nhs_PhoneNumHeaderLink").click(function () {
                self.ShowPhoneNumber('nhs_LnkPhoneNumHeader', 'nhs_FormPhoneHeader');
                return false;
            });

            $jq(".MortgageRates").click(function () {
                $jq.googlepush('Community Detail Events', 'Community - Gallery', 'Get Mortgage Rates');
                self.LogClick('LogMortgageRates');
            });

            $jq("#MortgageMatch").click(function () {
                //$jq.googlepush('Community Detail Events', 'Community - Gallery', 'Get Prequalified Today');
                self.LogClick('LogMortgageMatch');
            });

            $jq(".nhs_FormMapLink  li a").click(function () {
                $jq('#nhs_propertyMapCollapsibleOpen').click();
            });

            $jq("#nhs_StepsPrintLink").click(function () {
                var label = (self._parameters.specId == 0 && self._parameters.planId == 0) ? 'Community' : 'Home';
                $jq.googlepush(label + ' Detail Events', label + ' - Next Steps', 'Print This Page');
                window.print();
                self.LogClick('LogNextStepsPrint');
            });

            $jq(".LogNextStepsBrochure").click(function () {
                self.LogClick('LogNextStepsBrochure');
            });

            $jq("#nhs_LnkNextStepsPhoneNum2").click(function () {
                var lnkPhoneNumber = $jq('#nhs_LnkNextStepsPhoneNum');
                if (lnkPhoneNumber === null) return;
                lnkPhoneNumber.hide();
                $jq.googlepush('Community Detail Events', 'Community - Next Steps', 'See Phone Numbers');
                $jq('#nhs_NextStepsFormPhone').show();
                jQuery.SetDataLayerPair('sitePhoneNumV');
                self.LogClick('LogNextStepsSeePhone');
            });

            $jq('td.estaradefaultstyle a').live("click", function () {
                var img = $(this).find("img");
                if (img.length == 1) {
                    if (img.attr("src") == " http: //as00.estara.com/OneCC/200106300209/float_button.gif")
                        $jq.googlepush('Chat Links', 'Tab', 'Chat Now');
                }
            });
        },
        LogNextStepsSave: function () {
            var self = this;
            self.LogClick('LogNextStepsSave');
        },
        ShowPhoneNumber: function (buttonSection, numberSection) {
            var lnkPhoneNumber = $jq('#' + buttonSection);
            if (lnkPhoneNumber === null) return;
            lnkPhoneNumber.hide();
            $jq('#' + numberSection).show();
            jQuery.SetDataLayerPair('sitePhoneNumV');
            this.LogClick('LogPhoneNumber');
        },
        LogClick: function (method) {
            var self = this;
            var dataPost = {
                communityId: self._parameters.commId,
                builderId: self._parameters.builderId,
                planId: self._parameters.planId,
                specId: self._parameters.specId
            };
            $jq.ajax({
                type: "POST",
                url: self._parameters.logActionMethodUrl + method,
                data: dataPost,
                dataType: "json"
            });
        }
    };
