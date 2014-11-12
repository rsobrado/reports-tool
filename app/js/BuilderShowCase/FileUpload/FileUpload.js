FileUpload = function (options) {
    this._options = options;
};

FileUpload.prototype = {
    init: function () {
        var self = this;
        $jq('.editor').cleditor({ width: '99%', height: '300px' });
        $jq('#fileupload').fileupload();
        $jq('#fileupload2').fileupload();

        var options =
        {
            startHandler: function (e, _options) {
                _options.description = "description=" + _options.context.find(".nhs_Caption").val() 
                    + "&title=" + _options.context.find(".nhs_Caption").val();
            },		
			 AJAXSettings: function (e, _options) {
                var brandId = $jq("#BrandId option:selected").val();
                if (!brandId)
                    brandId = $jq("#BrandId").val();
			     _options.url = _options.url + "?brandid=" + brandId + "&ImageTypeCode=BRD&" + _options.description;
			 },
            maxNumberOfFiles: 24
        };

        var options2 =
        {
            startHandler: function(e, _options) {
                _options.description = "description=" + _options.context.find(".nhs_Caption").val() +
                    "&title=" + _options.context.find(".nhs_Title").val() +
                    "&accreditationurl=" + _options.context.find(".nhs_AccreditationUrl").val();
            },
            AJAXSettings: function(e, _options) {
                var brandId = $jq("#BrandId option:selected").val();
                if (!brandId)
                    brandId = $jq("#BrandId").val();
                _options.url = _options.url + "?brandid=" + brandId + "&ImageTypeCode=BAA&" + _options.description;
            },
            maxNumberOfFiles: 6,
            uploadTemplateId: 'template-upload2',
            downloadTemplateId: 'template-download2',
        };

        var finaloptions = $jq.extend({}, this._options, options);
        var finaloptions2 = $jq.extend({}, this._options, options2);

        $jq('#fileupload').fileupload('option', finaloptions);
        $jq('#fileupload2').fileupload('option', finaloptions2);

        var url = this._options.url;
        var brandId = $jq("#BrandId option:selected").val();
        if (!brandId)
            brandId = $jq("#BrandId").val();

        var url1 = url + "?brandid=" + brandId + "&server=" + self._options.server + "&ImageTypeCode=BRD";
        var url2 = url + "?brandid=" + brandId + "&server=" + self._options.server + "&ImageTypeCode=BAA";


        $jq(".fileupload-loading").show();
        $jq.ajax({
            url: url1,
            dataType: 'json',
            context: $jq('#fileupload')[0],
            success: function (result) {
                $jq(this).fileupload('option', 'done').call(this, null, { result: result });
                $jq("#fileupload .fileupload-loading").hide();
            }
        });

        $jq.ajax({
            url: url2,
            dataType: 'json',
            context: $jq('#fileupload2')[0],
            success: function (result) {
                $jq(this).fileupload('option', 'done').call(this, null, { result: result });
                $jq("#fileupload2 .fileupload-loading").hide();
            }
        });

        $jq(".nhs_Tabs li a").click(function (e) {
            e.preventDefault();
            $jq('.tab').hide();
            $jq('#' + $jq(this).attr("for")).show();
            $jq('.nhs_Tabs li').removeClass('nhs_Selected');
            $jq(this).parent().addClass('nhs_Selected');
        });
        $jq("#nhs_submit3, #nhs_submit2, #nhs_submit").click(function () {
            $jq.loading();
        });

        $jq("select#BrandId").change(function () {
            var brandId = $jq("#BrandId option:selected").val();
            $jq(".nhs_brandid").val(brandId);
        });

        $jq(".nhs_update").live("click", function() {
            var parent = $jq(this).parent().parent();
            var imageid = parent.find(".id").html();
            var description = parent.find(".description").find(".nhs_Caption").val();
            var title = parent.find(".nhs_Title").val();
            var accreditationSealUrl = parent.find(".nhs_AccreditationUrl").val();
            var data = { imageid: imageid, description: description, title: title, accreditationSealUrl: accreditationSealUrl };
            $jq.ajax({
                data: data,
                type: "POST",
                url: '/updatetextimagebuilder',
                success: function(result) {
                    if (result.result)
                        $jq.showSuccess('Image text updated successfully.');
                    else
                        $jq.showError('Problem trying to update image text.');
                }
            });
        });

        HideShowTestimonials();

        $jq("#nhs_submit2").click(function () {
            $jq('#nhs_submit2').hide();
            $jq('#nhs_submitFake2').show();
            var arr = $jq(".nhs_testimonialsBody tr");
            $jq.each(arr, function () {
                var tr = $jq(this);
                var testimonialid = tr.find(".nhs_testimonialid");
                var data = {
                    TestimonialId: testimonialid.val(),
                    Citation: tr.find(".nhs_citation").val(),
                    BrandId: tr.find(".nhs_brandid").val(),
                    Description: tr.find(".nhs_description").val()
                };
                if (data.TestimonialId > 0 || data.Citation.length > 0 || data.Description > 0) {
                    $jq.ajax({
                        type: "POST",
                        url: "/submitbuildershowcasetestimonial",
                        data: data,
                        success: function (result) {
                            if (result.result) {
                                testimonialid.val(result.testimonialid);
                                $jq.showSuccess('The brand showcase testimonials were saved successfully.');
                                HideShowTestimonials();
                            } else {
                                $jq.showError('Problem trying to save brand showcase testimonials');
                            }
                        }
                    });
                };
            });

            $jq('#nhs_submit2').show();
            $jq('#nhs_submitFake2').hide();
        });

        $jq(".nhs_delete button.btn-danger").live("click", function () {
            $jq.loading();
            var parent = $jq(this).parent().parent();
            var testimonialId = parent.find(".nhs_testimonialid").val();
            $jq.ajax({
                type: "POST",
                url: "/deletebuildershowcasetestimonial",
                data: { testimonialId: testimonialId },
                success: function (result) {
                    if (result.result) {
                        $jq.showSuccess('The brand showcase testimonials wwere deleted successfully.');
                        parent.find(".nhs_testimonialid").val('');
                        parent.find(".nhs_citation").val('');
                        parent.find(".nhs_description").val('');
                        HideShowTestimonials();
                    } else {
                        $jq.showError('Problem trying to delete brand showcase testimonials.');
                    }
                }
            });
        });
    }
};


function HideShowTestimonials() {
    var arr = $jq(".nhs_testimonialsBody tr");
    $jq.each(arr, function () {
        var val = $jq(this).find(".nhs_testimonialid").val();
        if (val == null || val == 0)
            $jq(this).find(".nhs_delete>button").hide();
        else
            $jq(this).find(".nhs_delete>button").show();
    });
}

$jq.extend({
    showError: function(str, delay) {
        $jq.ManageMessages(str, 'nhs_error', delay);
    },
    showSuccess: function(str, delay) {
        $jq.ManageMessages(str, 'nhs_success', delay);
    },
    showWarning: function(str, delay) {
        $jq.ManageMessages(str, 'nhs_warning', delay);
    },
    showInfo: function(str, delay) {
        $jq.ManageMessages(str, 'nhs_info', delay);
    },
    ManageMessages: function(str, style, delay) {
        if (!delay)
            delay = 5000;
        $jq('#nhs_Message').removeClass('nhs_error nhs_success  nhs_warning nhs_info').addClass(style).html(str).stop(true, true).show().animate({ opacity: 1, right: '10' }, 500);
        setTimeout('$jq("#nhs_Message").fadeOut();', delay);
        $jq.unloading();
    },
    loading: function() {
        $jq('#nhs_Loading').fadeIn(); 
        return false;
    },
    unloading: function() {
        setTimeout(' $jq("#nhs_Loading").fadeOut("fast");', 500);
    }
});