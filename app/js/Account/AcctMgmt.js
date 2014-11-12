
function ShowSavedMessage(json) {
    if (json.data != undefined) {
        window.location.href = json.redirectUrl;
    }
    else {
        $jq('#liSaveToPlanner').html('<span id="nhs_SaveThisItem">Saved</span>');
    }
}


