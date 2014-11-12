
$jq(document).ready(function () {
    InitializeLeadForm();
});

function InitializeLeadForm() {
    $jq('#frmBrochure').ajaxForm({ target: '#divLeadMain' });
    //SetAutoresize();
    $jq('textarea#Comments').focusin(function () {
        //$jq('#expanded').removeClass('hidden');
        //$jq(this).attr('rows', '3');
        $jq('input[type="text"]').removeClass('nhs_Focus');
        $jq(this).addClass('nhs_Focus');
        //SetAutoresize();
    });
    $jq('textarea#Comments').blur(function () {
        $jq(this).removeClass('nhs_Focus');
    });

    $jq('#LiveOutside').click(function () {
        if ($jq(this).is(':checked')) {
            $jq('input#UserPostalCode').attr('disabled', 'true');
            $jq('input#UserPostalCode').addClass('nhs_Disabled');
            $jq('input#UserPostalCode').val('');
        }
        else {
            $jq('input#UserPostalCode').removeAttr('disabled');
            $jq('input#UserPostalCode').removeClass('nhs_Disabled');
        }
    });

    $jq('input[type="text"]').focus(function () {
        $jq('input[type="text"]').removeClass('nhs_Focus');
        $jq(this).addClass('nhs_Focus');
    });
    $jq('input[type="text"]').blur(function () {
        $jq(this).removeClass('nhs_Focus');
    });

    $jq('input[type="password"]').focus(function () {
        $jq('input[type="text"]').removeClass('nhs_Focus');
        $jq(this).addClass('nhs_Focus');
    });
    $jq('input[type="password"]').blur(function () {
        $jq(this).removeClass('nhs_Focus');
    });

    $jq('textarea#Comments').keypress(function () {
        var len = this.value.length;
        if (len >= 250) {
            this.value = this.value.substring(0, 250);
        }
    });


}

function SetAutoresize() {
    $jq('textarea#Comments').autoResize({
        // On resize:
        onResize: function () {
            $jq(this).css({ opacity: 1 });
        },
        // After resize:
        animateCallback: function () {
            $jq(this).css({ opacity: 1 });
        },
        //Slow anim
        animateDuration: 300,
        extraSpace: 0,
        limit: 100
    });
}

//Form
function toggleZipField() {
    if ($jq('#LiveOutside').is(':checked')) {
        $jq('input#UserPostalCode').attr('disabled', 'true');
        $jq('input#UserPostalCode').addClass('nhs_Disabled');
        $jq('input#UserPostalCode').val('');
    }
    else {
        $jq('input#UserPostalCode').removeAttr('disabled');
        $jq('input#UserPostalCode').removeClass('nhs_Disabled');
    }
}

//Confirmation
function toggleRegZipField() {
    if ($jq('#LiveOutsideReg').is(':checked')) {
        $jq('input#ZipCodeReg').attr('disabled', 'true');
        $jq('input#ZipCodeReg').addClass('nhs_Disabled');
        $jq('input#ZipCodeReg').val('');
    }
    else {
        $jq('input#ZipCodeReg').removeAttr('disabled');
        $jq('input#ZipCodeReg').removeClass('nhs_Disabled');
    }
}

function showLogin(isComm) {
    var divLogin = document.getElementById('divLogin');
    divLogin.style.display = '';

    var divConfirmationDefault = document.getElementById('divConfirmationDefault');
    divConfirmationDefault.style.display = 'none';

    if ($jq('#Email').val() == '')
        $jq('#Email').val($jq('#hfEmail').val());

    $jq.googlepush('Account Events', (isComm ? 'Community' : 'Home') + ' - Access Account', 'Open Form - Link');
}

function showCreateAccount(isComm) {
    var divCreateAccount = document.getElementById('divCreateAccount');
    divCreateAccount.style.display = '';

    var divConfirmationDefault = document.getElementById('divConfirmationDefault');
    divConfirmationDefault.style.display = 'none';

    var divInfoActions = document.getElementById('nhs_DetailsFormInfoActions');
    //divInfoActions.style.display = 'none';

    if ($jq('#FirstName').val() == '')
        $jq('#FirstName').val($jq('#hfFirstName').val());
    if ($jq('#LastName').val() == '')
        $jq('#LastName').val($jq('#hfLastName').val());
    if ($jq('#EmailReg').val() == '')
        $jq('#EmailReg').val($jq('#hfEmail').val());
    if ($jq('#ZipCodeReg').val() == '')
        $jq('#ZipCodeReg').val(jQuery.trim($jq('#hfPostalCode').val()));
    if ($jq('#hfLiveOutside').val() == "true")
        $jq('#LiveOutsideReg').attr('checked', 'checked');
    toggleRequestCreateAccountZipField();
    $jq.googlepush('Account Events', (isComm ? 'Community' : 'Home') + ' - Create Account', 'Open Form - Link');
}

function toggleRequestCreateAccountZipField() {
    if ($jq('#LiveOutsideReg').is(':checked')) {
        $jq('input#ZipCodeReg').attr('disabled', 'true');
        $jq('input#ZipCodeReg').addClass('nhs_Disabled');
        $jq('input#ZipCodeReg').val('');
    }
    else {
        $jq('input#ZipCodeReg').removeAttr('disabled');
        $jq('input#ZipCodeReg').removeClass('nhs_Disabled');
    }
}

function hideLogin() {
    var divLogin = document.getElementById('divLogin');
    divLogin.style.display = 'none';

    var divConfirmationDefault = document.getElementById('divConfirmationDefault');
    divConfirmationDefault.style.display = '';
}

function hideCreateAccount() {
    var divCreateAccount = document.getElementById('divCreateAccount');
    divCreateAccount.style.display = 'none';

    var divConfirmationDefault = document.getElementById('divConfirmationDefault');
    divConfirmationDefault.style.display = '';

    var divInfoActions = document.getElementById('nhs_DetailsFormInfoActions');
    divInfoActions.style.display = '';
}