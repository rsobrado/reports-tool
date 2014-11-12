NHS.Scripts.Search = function (typeAheadUrl, callInitialize) {
    this._typeAheadUrl = typeAheadUrl;
    this.alreadyiInitialize = false;
    callInitialize = (typeof callInitialize === 'undefined') ? true : callInitialize;
    if (callInitialize) {
        this.initialize();
    }
};


NHS.Scripts.Search.prototype =
{
    initialize: function () {
        var self = this;
        if (self.alreadyiInitialize == false) {

            jQuery("#nhs_GlobalSearchNavSubmit").click(function () {
                //alert('#nhs_GlobalSearchNavSubmit');
                var validateFuncion = self.showErrorSearchTextMessage;
                var value = jQuery("#nhs_GlobalSearchNavLocation").val();
                if (!validateFuncion(value)) {
                    value = jQuery.trim(value);
                    if (value.length > 0 && value != "Enter Location or Community Name") {
                        jQuery.googlepush('Search Events', 'Search Action', 'Search - NavigationNew');
                        return true;
                    }
                }
                jQuery("#nhs_field_validation_error").show();
                jQuery("#nhs_GlobalSearchNavSubmit").removeAttr("disabled");
                return false;
            });

            var megaMenuInputText = jQuery("#nhs_GlobalSearchNavLocation");
            self.validateSearchBox(megaMenuInputText.closest('form'), jQuery('span.field-validation-error'), megaMenuInputText, false);

            this.setupSearchBox("nhs_GlobalSearchNavLocation", "SearchType", false);

            SetTextBoxesDescriptions();
            self.alreadyiInitialize = true;
        }
    },
    //this is a debug function, the console.log are ok here
    testValidation: function (extValues) {
        var self = this;
        // true if is when must show the error message
        var toTest = [
                 ['', true, 'NOK'],
                 [' ', true, 'NOK'],
                 [' , ', true, 'NOK'],
                 ['123', true, 'NOK'],
                 ['12345', false, 'NOK'],
                 ['123456', true, 'NOK'],
                 ['123,', true, 'NOK'],
                 ['12345,', true, 'NOK'],
                 ['123456,', true, 'NOK'],
                 ['test', false, 'NOK'],
                 ['test test', false, 'NOK'],
                 ['test,', true, 'NOK'],
                 ['test test,', true, 'NOK'],
                 ['test 23', false, 'NOK'],
                 ['test 123', false, 'NOK'],
                 ['test 1234', false, 'NOK'],
                 ['test 23,', true, 'NOK'],
                 ['test 123,', true, 'NOK'],
                 ['test 1234,', true, 'NOK'],
                 ['g 5 q a,r', true, 'NOK'],
                 ['g 5 q a, r', true, 'NOK'],
                 ['g 5 q a, 1', true, 'NOK'],
                 ['test 23,tx', false, 'NOK'],
                 ['test 123,fx', false, 'NOK'],
                 ['test 1234, zd', false, 'NOK'],
                 ['test 23,tx Area', false, 'NOK'],
                 ['test 123,fx Area', false, 'NOK'],
                 ['test 1234, zd Area', false, 'NOK'],
                 [',', true, 'NOK'],
                 [',t', true, 'NOK'],
                 [',tx', true, 'NOK'],
                 [', t', true, 'NOK'],
                 [', t x', true, 'NOK'],
                 [',  tx', true, 'NOK'],
                 ['  ,  tx', true, 'NOK'],
                 [',tx Area', true, 'NOK'],
                 ['0,tx Area', false, 'NOK']
                ];

        console.log(toTest);

        if (typeof extValues != 'undefined') {
            for (index in extValues) {
                toTest.push(extValues[index]);
            }
        }

        for (index in toTest) {
            var text = String(toTest[index][0]);
            var isValid = self.showErrorSearchTextMessage(text) == Boolean(toTest[index][1]);
            if (isValid == false) {
                console.info('\n ============ + ERROR + =================');
                console.info('ERROR :: ' + text + ' [' + index + ']' + ' :: '
                    + String(self.showErrorSearchTextMessage(text))
                    + ' == '
                    + String(toTest[index][1])
                    + ' => '
                    + String(isValid));

                if (typeof text == "undefined"
            || text == "") {
                    console.info('num #1 :: ' + String(true));
                } else if (text.indexOf(',') == -1 && !isNaN(text) && new RegExp(/(?:^|[^\d])(\d{5})(?:$|[^\d])/mg).test(text) == false) {
                    console.info('num #2 :: ' + String(true));
                } else if ((text.split(',').length > 1 && (text.split(',')[0].trim() === "" || text.split(',')[1].trim() === "" || text.split(',')[1].trim().length < 2))) {
                    console.info('num #3 :: ' + String(true));
                } else if ((text.indexOf(',') == -1 && new RegExp("[a-zA-Z0-9 ]+$").test(text) == false)) {
                    console.info('num #4 :: ' + String(true));
                }

                console.info('=================================== \n');
            } else {
                toTest[index][2] = 'OK';
            }
        }

        var testEndMesage = 'The test is 100% OK!';
        var isTestOk = true;
        for (index in toTest) {
            if (toTest[index][2] == 'NOK') {
                testEndMesage = 'TEST FAIL!';
                isTestOk = false;
                break;
            }
        }
        console.info('\n ************************');
        if (isTestOk) {
            console.info(testEndMesage);
        } else {
            console.error(testEndMesage);
        }
        console.info('************************ \n');
    },

    showErrorSearchTextMessage: function (textInput) {
        var text = String(textInput).trim();
       
        var hasError = false;

        if (typeof text == "undefined"
            || text == "") {
            hasError = true;
        } else if (text.indexOf(',') == -1 && !isNaN(text) && new RegExp(/(?:^|[^\d])(\d{5})(?:$|[^\d])/mg).test(text) == false) {
            hasError = true;
        } else if ((text.split(',').length > 1 && (text.split(',')[0].trim() === "" || text.split(',')[1].trim() === "" || text.split(',')[1].trim().length < 2))) {
            hasError = true;
        } else if ((text.indexOf(',') == -1 && new RegExp("[a-zA-Z0-9 ]+$").test(text) == false)) {
            hasError = true;
        }    

        return hasError;
    },

    validateSearchFormFromInputText: function (searchTextBox, useAlert) {
        var self = this;
        useAlert = (typeof useAlert === 'undefined') ? false : useAlert;
        self.validateSearchBox(searchTextBox.closest('form'), searchTextBox.closest('form').find('.field-validation-error'), searchTextBox, useAlert);
    },

    validateSearchBox: function (formElement, errorDiv, searchText, useAlert) {
        var self = this;
        jQuery(formElement).on('submit', function (e) {
            var text = jQuery(searchText).val().trim();
            var innerSelf = self;
            if (innerSelf.showErrorSearchTextMessage(text)) {
                jQuery.NhsCancelEvent(e);
                if (useAlert) {
                    alert("Enter a valid text to search");
                } else {
                    jQuery(errorDiv).show();
                }
                return false;
            }
            return true;
        });
    },
    setupSearchBox: function (textBoxName, typeElement, useAlert) {
        var self = this;
        useAlert = (typeof useAlert === 'undefined') ? false : useAlert;
        jQuery("#" + textBoxName).keypress(function () {
            jQuery(".field-validation-error").hide();
        });

        //Autocomplete
        var searchTextBox = jQuery('#' + textBoxName);
        //check search text box exists
        if (searchTextBox !== null && searchTextBox.length > 0) {

            self.validateSearchBox(searchTextBox.closest('form'), searchTextBox.closest('form').find('.field-validation-error'), searchTextBox, useAlert);

            searchTextBox.autocomplete({
                source: this._typeAheadUrl,
                select: function (event, ui) {
                    event.preventDefault();
                    var value = ui.item.value.substring(ui.item.value.indexOf("|") + 1);
                    var text = ui.item.value.substring(0, ui.item.value.indexOf("|"));
                    jQuery("#" + typeElement).val(value);
                    jQuery("#" + textBoxName).val(text);
                    if (jQuery.isFunction(self.AutoCompleteSelect)) {
                        self.AutoCompleteSelect(value, text);
                    }
                },
                focus: function (event, ui) {
                    event.preventDefault();
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                item.label = item.value.substring(0, item.value.indexOf("|"));
                item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $jq.ui.autocomplete.escapeRegex(this.term.trim()) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong id='ui-id'>$1</strong>");
                if (item.label.indexOf(" in ") != -1)
                    item.label = item.label.substring(0, item.label.indexOf(" in ")) + "<span id='ui-id'> in " + item.label.substring(item.label.indexOf(" in ") + 4) + "</span>";

                return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
            };
            searchTextBox.autocomplete().data("ui-autocomplete").menu.element.detach().appendTo(jQuery('#' + textBoxName).parent());
        }
    }
};
