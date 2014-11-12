// classes for sorting on the community results page

NHS.Scripts.CommunityResults.Sorting = function (settings) {
    this.onSort = settings.onSort;
}

NHS.Scripts.CommunityResults.Sorting.prototype = {
    initialize: function () {

        // Create delegates
        this._sortingHandler = NHS.Scripts.Helper.createDelegate(this, this._onSort);

        // Attach events
        $jq('.nhs_Sorting select').change(this._sortingHandler);

    },

    _onSort: function (e) {
        this.onSort.call(this, $jq(e.target).find('option:selected').val());
    }
}