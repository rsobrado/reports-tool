NHS.Scripts.Mortgage = function () {
 
};

NHS.Scripts.Mortgage.prototype =
{
    initializeCalculator: function () {

        var self = this;

        $jq("#Calculate").click(function () {
            $jq("#CalcUpdateProgress").show();
            var data = {
                CalcLoanAmount: $jq("#CalcLoanAmount").val(),
                CalcDownPayment: $jq("#CalcDownPayment").val(),
                CalcLoanTerm: $jq("#CalcLoanTerm").val(),
                CalcInterestRate: $jq("#CalcInterestRate").val(),
                CalcPropertyTax: $jq("#CalcPropertyTax").val(),
                CalcInsurance: $jq("#CalcInsurance").val()
            }
            $jq.ajax({
                type: "POST",
                url: "/mortgagecalculator/calculate",
                data: data,
                success: function (msg) {
                    $jq("#CalcMonthlyPayment").html(msg);
                    $jq("#CalcUpdateProgress").hide();
                }
            });
        });
    },

    initializeRates: function () {

        var self = this;

        $jq("#hiddenProductId").val("1");
        $jq("#hiddenPointId").val("1");

        init($jq('#hiddenDownPayment').val(), $jq('#hiddenDownPayment').attr('id'));

        $jq("#btnGetQuotes").click(function () {
            $jq("#CalcUpdateProgress").show();
            $jq("#nhs_Loading").show();
            var data = {
                CommunityID: $jq("#hiddenCommunityId").val(),
                ProductID: $jq("#hiddenProductId").val(),
                PointID: $jq("#hiddenPointId").val(),
                DownPay: $jq("#hiddenDownPayment").val(),
                PostalCode: $jq("#hiddenPostalCode").val()
            }
            $jq.ajax({
                type: "POST",
                url: "/mortgagerates/getmatches",
                data: data,
                success: function (msg) {
                    $jq("#pLoanMatches").html(msg);
                }
            });
            $jq.ajax({
                type: "POST",
                url: "/mortgagerates/getrates",
                data: data,
                success: function (msg) {
                    SetLoanHeader($jq('#radValue').text());
                    $jq("#pnlContent").html(msg);
                    $jq("#CalcUpdateProgress").hide();
                    $jq("#nhs_Loading").hide();
                }
            });            

        });
    }
}
