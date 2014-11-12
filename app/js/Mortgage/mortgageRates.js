var priceValue;
var baseHost = '';
var regHost = '';
this._ratesSliderText = ['% down payment'];
this._priceValue = '$0';



function showHelpBox(a, b) {
    helpLayer = new YAHOO.widget.Panel("helpCnt", { context: [b, "tl", "bl"], underlay: false, visible: false, draggable: false, close: false });
    helpLayer.render(document.body);
    var obj = document.getElementById(a);
    document.getElementById("helpTxt").innerHTML = obj.innerHTML;
    document.getElementById("helpCnt").className = "mtgHlpCnt";
    helpLayer.show();
}

function showRateHelp(a, i) {
    if (oQuoteSearch.loanType.toLowerCase() == 'arm') {
        helpLayer = new YAHOO.widget.Panel("helpCnt", { context: [a, "tl", "tr"], underlay: false, visible: false, draggable: false, close: false });
        helpLayer.render(document.body);
        document.getElementById("helpTxt").innerHTML = "This rate could increase to as much as <b>" + oQuoteSearch.loanQuotes.mme.quotes[i].firstcaprate + "%</b> "
+ "when the fixed period ends, and to as much as <b>" + oQuoteSearch.loanQuotes.mme.quotes[i].lifecaprate + "%</b> over the life of the loan.<div class='brm_RateUpdated' style='line-height:16px;height:16px;vertical-align:middle;'>rate updated " + oQuoteSearch.loanQuotes.mme.quotes[i].ratesupdated + "</div>";
        document.getElementById("helpCnt").className = "rateNoteCnt";
        helpLayer.show();
    }
}

function closeHelpBox() {
    helpLayer.hide();
}

function checkDropDown(productId) {
    if (productId == 'other') {
        document.getElementById("selectOtherLoanTypes").disabled = false;
    } else {
        document.getElementById("selectOtherLoanTypes").disabled = true;
    }
    if (productId == '1' || productId == '2' || productId == '6' || productId == '390') {
        var type = $jq("#selectOtherLoanTypes").val();
        if(type != "other")
            $jq("#selectOtherLoanTypes").val('other');
    }

    document.getElementById("hiddenProductId").value = productId;
    checkPoints(productId);
}

function checkPoints(productId) {
    if (productId == '565') {
        document.getElementById("selectOtherPoints").disabled = true;
    } else {
        document.getElementById("selectOtherPoints").disabled = false;
    }

    document.getElementById("hiddenProductId").value = productId;
}

function assignPoints(pointId) {
    document.getElementById("hiddenPointId").value = pointId;
}

function initBtn() {
    init($jq('#hiddenDownPayment').val(), $jq('#hiddenDownPayment').attr('id'));
    return true;
}

function init(price, idDownPayment) {
    
        startBankRateSlider(price, idDownPayment);    
}

function startBankRateSlider(price, idDownPayment) {

    _priceValue = price;
    var downPayment = (price - (price - (price * 0.20))).toNearest(1000);
    var loanAmount = (price - (price * 0.20)).toNearest(1000);
    $jq('#radValue').text('$' + downPayment.formatMoney(0, ",", ","));
    $jq('#totalLoanAmount').text('$' + loanAmount.formatMoney(0, ",", ",") + ' total loan amount');
    $jq('#' + idDownPayment).val(downPayment);

    
    SetLoanHeader($jq('#radValue').text());

    // Create the rates slider
    $jq("#nhs_FacetRatesSlider").slider({ value: 100,
        min: 5,
        max: 50,
        step: 1,
        value: 20,
        slide: (function (event, ui) {
            // set the percentage text in the UI
            $jq('#percentageValue').text(ui.value + this._ratesSliderText[0]);

            downPayment = (_priceValue - (_priceValue - (_priceValue * (ui.value / 100)))).toNearest(1000);
            $jq('#radValue').text('$' + downPayment.formatMoney(0, ",", ","));
            $jq('#' + idDownPayment).val(downPayment);
            loanAmount = (price - (_priceValue * (ui.value / 100))).toNearest(1000);
            $jq('#totalLoanAmount').text('$' + loanAmount.formatMoney(0, ",", ",") + ' total loan amount');

        }).bind(this),
        change: (function (event, ui) {

            downPayment = (_priceValue - (_priceValue - (_priceValue * (ui.value / 100)))).toNearest(1000);
            $jq('#radValue').text('$' + downPayment.formatMoney(0, ",", ","));
            $jq('#' + idDownPayment).val(downPayment);
            loanAmount = (price - (_priceValue * (ui.value / 100))).toNearest(1000);
            $jq('#totalLoanAmount').text('$' + loanAmount.formatMoney(0, ",", ",") + ' total loan amount');

        }).bind(this)
    });
}

function SetLoanHeader(downForHeader) {
    var productId = document.getElementById("hiddenProductId").value;
    var pointId = document.getElementById("hiddenPointId").value;

    var res = "";
    var points = "";

    switch (pointId) {
        case "1":            
            points = "0";
            break;
        case "2":            
            points = "0.1 to 1.0";
            break;
        case "3":            
            points = "1.1 to 2.0";
            break;
        case "6":            
            points = "All";
            break;
    }

    var loaninfo = downForHeader + " down and " + points + " points";

    switch (productId)
    {
        case "1":
            res = "for 30 Year Fixed with " + loaninfo;
            break;
        case "2":
            res = "for 15 Year Fixed with " + loaninfo;
            break;
        case "6":
            res = "for 5 Year ARM with " + loaninfo;
            break;
        case "390":
            res = "for Interest Only 5 Year ARM with " + loaninfo;
            break;
        case "387":
            res = "for Fixed - 20 year with " + loaninfo;
            break;
        case "8":
            res = "for ARM 3/1 with " + loaninfo;
            break;
        case "9":
            res = "for ARM 7/1 with " + loaninfo;
            break;
        case "10":
            res = "for ARM 10/1 with " + loaninfo;
            break;
        case "389":
            res = "for Interest Only ARM 3/1 with " + loaninfo;
            break;
        case "447":
            res = "for Interest Only ARM 7/1 with " + loaninfo;
            break;
        case "565":
            res = "for Interest Only Fixed 30-year with " + loaninfo;
            break;
    }

    $jq('#pLoanInfo').text(res);
}


Number.prototype.formatMoney = function (c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "",
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
	+ (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


Number.prototype.toNearest = function (num) { // num is an exponent of 10
    return Math.round(this / num) * num;
}
