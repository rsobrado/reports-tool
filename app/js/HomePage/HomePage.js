NHS.Scripts.HomePage = function (searchClass) {
    this.searchClass = searchClass;
};

NHS.Scripts.HomePage.prototype =
{
    initialize: function () {
        this._setUpCommonControls();
    },

    _setUpCommonControls: function (setupCarousel) {

        // Home page
        $jq('#SearchText').on('focus', function () {
            $jq('#nhs_HomeSearchOptions').slideDown(250, function () {
                $jq('#nhs_HomeSearchOptions > fieldset').fadeIn(1000);
            });
        });

        $jq('#PriceLow, #PriceHigh').on('focus', function () {
            var control = $jq(this);
            if (control.val().length != 0) {
                control.priceFormat({
                    prefix: '$',
                    thousandsSeparator: ',',
                    centsLimit: 0,
                    insertPlusSign: false,
                    limit: 7
                });
            }
        });

        $jq('#PriceLow, #PriceHigh').on('blur', function () {
            var control = $jq(this);
            if (control.val().length != 0) {
                control.priceFormat({
                    prefix: '$',
                    thousandsSeparator: ',',
                    centsLimit: 0,
                    insertPlusSign: false,
                    limit: 7
                });
            }
        });

//        $jq('#frmHomePage').on('submit', function (e) {
//            if ($jq('#SearchText').val().trim() == "" || ($jq('#SearchText').val().indexOf(',') != -1 && $jq('#SearchText').val().split(',')[1] == '')) {
//                e.preventDefault();
//                $jq("#nhs_field_validation_error_home").show();
//                return false;
//            }
//            return true;
//        });

        if (typeof this.searchClass != 'undefined') {
            this.searchClass.validateSearchBox(jQuery('#frmHomePage'), jQuery("#nhs_field_validation_error_home"), 
                jQuery('#SearchText'), false);
        }

        //Example Text
        //var fdv = new NHS.Scripts.Helper.FieldDefaultValue('SearchText', this._typeAheadText, 'nhs_LocationDefault', 'Search');
        //fdv.initialize();

        if (setupCarousel) {
            //Carousel
            $jq("#nhs_HomeBoutiqueBar").jCarouselLite({
                btnNext: "#nhs_HomeBoutiqueCarouselNext",
                btnPrev: "#nhs_HomeBoutiqueCarouselPrev",
                visible: 4,
                circular: true,
                auto: 5000,
                speed: 1000
            });

            //Accordion
            $jq(".nhs_HomeArticleWPhoto div:not(:first)").hide();
            $jq(".nhs_HomeArticleWPhoto a[class*='nhs_HomeArticleLink']").click(function () {
                var isSelected = $jq(this).attr("selected");
                if (isSelected == "true")
                    return false;

                $jq(".nhs_HomeArticleWPhoto a[class*='nhs_HomeArticleLink']").removeAttr("selected");
                $jq(this).attr("selected", "true");
                $jq(".nhs_HomeArticleWPhoto div:visible").slideUp("fast");
                $jq(this).parent().next().slideDown("fast");
                return false;
            });

            // $jq('#nhs_HomeSearchForm').corner('top 5px');
        }
    },

    initNhlSlideShow: function () {
        //Slideshow - NHL only
        $jq('.fadein img:gt(0)').hide();
        setInterval(function () { $jq('.fadein :first-child').fadeOut(1000).next('img').fadeIn(250).end().appendTo('.fadein'); }, 5000);
    }
}




