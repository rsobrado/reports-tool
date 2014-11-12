// Class for javascript for Pager.ascx
// View that uses this class must send in a function for onGoToPage in order to define what to do when user navigates to a different page.  Function parameter is the new page number user is navigating to.

NHS.Scripts.Paging = function (settings) {
    this._currentPage = 0;
    this.onGoToPage = settings.onGoToPage;
}

NHS.Scripts.Paging.prototype = {
    get_currentPage: function () { return this._currentPage; },

    initialize: function () {

        this._currentPage = Number($jq('#txtPageNumber').val());

        // Create delegates
        this._previousHandler = NHS.Scripts.Helper.createDelegate(this, this._onPreviousClick);
        this._nextHandler = NHS.Scripts.Helper.createDelegate(this, this._onNextClick);
        this._goHandler = NHS.Scripts.Helper.createDelegate(this, this._onGoClick);

        // Attach events
        $jq('#btnPrevious').click(this._previousHandler);
        $jq('#btnNext').click(this._nextHandler);
        $jq('#aGo').click(this._goHandler);

    },

    _onPreviousClick: function () {
        /// <summary>
        /// Handle the element's click events
        /// </summary>
        this.onGoToPage.call(this, this._currentPage - 1, "PAGEPREV");
    },

    _onNextClick: function () {
        /// <summary>
        /// Handle the element's click events
        /// </summary>
        this.onGoToPage.call(this, this._currentPage + 1, "PAGENEXT");
    },

    _onGoClick: function () {
        /// <summary>
        /// Handle the element's click events
        /// </summary>
        this.onGoToPage.call(this, Number($jq('#txtPageNumber').val()), "PAGEGO");
    }
}