NHS.Scripts.ImageViewer = function (parameters) {
    this.parameters = parameters;

    this.brightcovePlayer = null;
    this.youtubePlayer = null;
    this.logger = parameters.looger || logger;
    this.defaultWidth = 640;
    this.defaulHeight = 480;
    this.youtubePlayer = null;

        // Slider using the jssor slider http://www.jssor.com/
    this.slider = null;

    this.sliderOptions = {
        $FillMode: 4,                                   //[Optional] The way to fill image in slide, 0 stretch, 1 contain (keep aspect ratio and put all inside slide), 2 cover (keep aspect ratio and cover whole slide), 4 actuall size, default value is 0
        $AutoPlay: false,                               //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
        $DragOrientation: 1,                            //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
        $ArrowKeyNavigation: true,   			        //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
        $SlideDuration: 900,                            //Specifies default duration (swipe) for slide in milliseconds
        $StartIndex: 0,
        $LazyLoading: 1,
        $Loop: 0,
        $ArrowNavigatorOptions: {                       //[Optional] Options to specify and enable arrow navigator or not
            $Class: $JssorArrowNavigator$,              //[Requried] Class to create arrow navigator instance
            $ChanceToShow: 2,                           //[Required] 0 Never, 1 Mouse Over, 2 Always
            $AutoCenter: 2
        },
        $ThumbnailNavigatorOptions: {                   //[Optional] Options to specify and enable thumbnail navigator or not
            $Class: $JssorThumbnailNavigator$,          //[Required] Class to create thumbnail navigator instance
            $ChanceToShow: 2,                           //[Required] 0 Never, 1 Mouse Over, 2 Always
            $Loop: 0,
            $SpacingX: 2,                               //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
            $DisplayPieces: 9,                          //[Optional] Number of pieces to display, default value is 1
            $ParkingPosition: 360,                      //[Optional] The offset position to park thumbnail

            $ArrowNavigatorOptions: {
                $Class: $JssorArrowNavigator$,          //[Requried] Class to create arrow navigator instance
                $ChanceToShow: 2,                       //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 2,                         //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: 9                               //[Optional] Steps to go for each navigation request, default value is 1
            }
        }
    };

};

NHS.Scripts.ImageViewer.prototype =
{
    initialize: function () {
        // Setup slides divs in the slider container before construct the slider with the jssor slider 
        //this.createSlides();
        var self = this;

        // Create the slider functionality based in the jssor sldier
        this.slider = new $JssorSlider$(this.parameters.containerName, this.sliderOptions);
        this.slider.$On($JssorSlider$.$EVT_PARK, this.onSlideChanges.bind(this));
        this.slider.$On($JssorSlider$.$EVT_CLICK, this.onSlideClick.bind(this));
        this.playingVideo = false;
        this.youtubePlayer = null;
        this.brightCovePlayer = null;

        this.brightCovePlayerTemplate = '<object id=\"nhs_brightCovePlayer\" class=\"BrightcoveExperience\"><param name=\"bgcolor\" value=\"#FFF /><param name=\"width\" value=\"{{width}}\" /><param name=\"height\" value=\"{{height}}\" /><param name=\"playerID\" value=\"{{playerID}}\" /><param name=\"playerKey\" value=\"{{playerKey}}\" /><param name=\"isVid\" value=\"true\" /><param name=\"isUI\" value=\"true\" /><param name=\"dynamicStreaming\" value=\"true\" /><param name="wmode" value="transparent"><param name=\"@videoPlayer\" value=\"{{videoID}}\"; /><param name=\"htmlFallback\" value=\"true\" /><param name=\"autoStart\" value=\"true\" /></object>';

        this.slides = $jq("div[u='slides'] .nhs_slide");

        $jq('div.w').each((function (i, o) {
            var dataType = $jq(this.slides[i]).data('type');
            if (dataType == 'v-bc' || dataType == 'v-yt') {
                $jq(o).append('<div class="nhs_videoThumbIcon"></div>');
            }
        }).bind(this));


        $jq('#' + this.parameters.arrowLeftControlId).click((function (event) { this.onNextorPrevClicked(0, event); }).bind(this));
        $jq('#' + this.parameters.arrowRightControlId).click((function (event) { this.onNextorPrevClicked(1, event); }).bind(this));

        $jq('.nhs_thumbsControls .nhs_arrowXLl').click((function () { this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Icon Backward'); }).bind(this));
        $jq('.nhs_thumbsControls .nhs_arrowXLr').click((function () { this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Icon Forward'); }).bind(this));

        if (this.areThereYoutubeVideos()) {
            var tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        $jq('.nhs_iconsBarWapper a, .nhs_iconsBarWapper span').click(function (e) {
            var type = $jq(this).data('type');
            var firstOftheKind = $jq($jq(".nhs_slides div[data-type^='" + type.split(',')[0] + "']")[0]);

            if (firstOftheKind.length == 0) {
                firstOftheKind = $jq($jq(".nhs_slides div[data-type^='" + type.split(',')[1] + "']")[0]);
            }

            if (firstOftheKind != null && firstOftheKind.index() != -1) {
                self.slider.$PlayTo(firstOftheKind.index() - 1);
            }

            return false;
        });

        $jq('#' + this.parameters.freeBrochureTopButton).click((function (event) {
            this.slider.$PlayTo(this.getSlidesCount() - 1);
        }).bind(this));


        $jq('#' + this.parameters.arrowLeftControlId).addClass('nhs_disabledArrow');

        // GA EVENTS 

        $jq('#nhs_PlayerCommunityName a').click((function () {
            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Favorite');
        }).bind(this));

        $jq('#nhs_PinterestOverlayBig #button_pin_it a').click((function () {
            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Pinterest');
        }).bind(this));

        $jq('#nhs_playerLeadForm #btnFreeBrochure').click((function () {
            this.logGAEvent('Lead Events', 'Image Viewer - Main Form', 'Submit Form - Free Brochure');
        }).bind(this));

        //responsive code begin, you can remove responsive code if you don't want the slider scales while window resizes        
        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|BlackBerry|IEMobile)/)) {
            $jq(window).bind('resize', this.scaleSlider.bind(this));
        }

        // set visibility of the media icons 
        if ($jq(".nhs_slide[data-type^='i-']").length == 0)
            $jq('.nhs_iconBarImage').hide();
        if ($jq(".nhs_slide[data-type^='l-flp']").length == 0)
            $jq('.nhs_iconBarFloorPlan').hide();
        if ($jq(".nhs_slide[data-type^='l-vt']").length == 0)
            $jq('.nhs_iconBarTour').hide();
        if ($jq(".nhs_slide[data-type^='l-ev']").length == 0 && $jq(".nhs_slide[data-type^='v-']").length == 0)
            $jq('.nhs_iconBarVideo').hide();

        // if not hosted videos show the video icon after the images icon
        if (!this.areThereVideos()) {
            $jq('li.nhs_iconBarVideo').insertAfter($jq('li.nhs_iconBarImage'));
        }

        this.setupIconsBar();

        if (this.getSlidesCount() > 0)
            $jq('#' + this.parameters.titleControlId).text($jq(this.getCurrentSlide()).data('title'));

        if (this.getSlidesCount() <= 9)
            $jq(".nhs_thumbsControls").hide();

    },
    getCurrentSlide: function () {
        return $jq(this.slides[this.slider.$CurrentIndex()]);
    },
    getSlidesCount: function () {
        return this.slider.$SlidesCount();
    },
    areThereYoutubeVideos: function () {
        return $jq("#nhs_SliderContainer div[data-type='v-yt']").length > 0;
    },
    areThereVideos: function () {
        return $jq("#nhs_SliderContainer div[data-type='v-yt'], #nhs_SliderContainer div[data-type='v-bc']").length > 0;
    },
    playYouTubeVideo: function (id) {
        this.playingVideo = true;

        if (this.youtubePlayer != undefined && this.youtubePlayer != null) {
            this.youtubePlayer.loadVideoById(id);
        }
        else {
            this.youtubePlayer = new YT.Player(this.parameters.youtubeControlId, {
                height: this.parameters.videoHeight,
                width: this.parameters.videoWidth,
                videoId: id,
                playerVars: { autoplay: 1 }
            });
        }
    },
    playBrightcoveVideo: function (id) {
        this.playingVideo = true;

        if (this.brightCovePlayer == null) {
            var data = { "playerID": '1667945989001', "videoID": id, "width": this.parameters.videoWidth, "height": this.parameters.videoHeight, "playerKey": this.parameters.brightcoveToken };
            var playerHtml = this.markup(this.brightCovePlayerTemplate, data);
            $jq('#' + this.parameters.brightcoveControlId).html(playerHtml);

            brightcove.createExperiences();
        }
        else {
            this.brightCovePlayer.loadVideo(id);
        }
    },
    stopVideo: function () {
        this.playingVideo = false;
        $jq("#" + this.parameters.youtubeControlId).css('display', 'none');
        $jq("#" + this.parameters.brightcoveControlId).css('display', 'none');

        if (this.youtubePlayer != undefined && this.youtubePlayer != null)
            this.youtubePlayer.stopVideo();

        $jq('#' + this.parameters.brightcoveControlId).html('');
    },
    scaleSlider: function () {
        var bodyWidth = document.body.clientWidth;
        if (bodyWidth)
            this.slider.$SetScaleWidth(Math.min(bodyWidth, 1920));
        else
            window.setTimeout(this.scaleSlider.bind(this), 30);

    },
    resizeSlider: function () {
        var parentWidth = this.slider.$Elmt.parentNode.clientWidth - 100;
        if (parentWidth > 1500) {
            parentWidth = 1500;
        }
        var newWidthCss = parentWidth + "px";
        if (parentWidth) {
            jQuery('#nhs_SliderContainer, .nhs_SliderWrapper, .nhs_slide, .nhs_thumbnails, .nhs_thumbnails > div, .nhs_thumbs').css('width', newWidthCss);
            var heightCss = jQuery('.nhs_slide').height() + "px";
            jQuery('.nhs_slide').css('line-height', heightCss);
            jQuery('.nhs_slide').css('left', newWidthCss);
        }
        else {
            window.setTimeout(this.resizeSlider, 30);
        }
    },
    setupIconsBar: function () {
        $jq('.nhs_iconsBar li').removeClass('active');
        $jq('.nhs_iconsBar li span').removeClass('active');
        var type = this.getCurrentSlide().data('type');

        if (type == 'l-flp') {
            $jq('.nhs_iconBarFloorPlan').addClass('active');
            $jq('.nhs_iconBarFloorPlan > span').addClass('active');
        }
        else if (type == 'l-vt') {
            $jq('.nhs_iconBarTour').addClass('active');
            $jq('.nhs_iconBarTour > span').addClass('active');
        }
        else if (type == 'l-ev' || type.indexOf('v-') != -1) {
            $jq('.nhs_iconBarVideo').addClass('active');
            $jq('.nhs_iconBarVideo > span').addClass('active');
        }
        else if (type.indexOf('i') != -1) {
            $jq('.nhs_iconBarImage').addClass('active');
            $jq('.nhs_iconBarImage > span').addClass('active');
        }
    },
    createSlides: function () {
        if (this.parameters != null && this.parameters.mediaObjects != null) {
            $.each(this.parameters.mediaObjects, (function (i, o) {
                $jq('#' + this.parameters.containerName + " div[u='slides']").append('<div><img u="image" src="' + this.parameters.imagesResourceDomain + o.Url + '" /><img u="thumb" src="' + this.parameters.imagesResourceDomain + o.Thumbnail + '" /></div>');
            }).bind(this));
        }
    },
    logGAEvent: function (category, action, label) {
        $jq.googlepush(category, action, label);
    },

    onSlideClick: function (slideIndex, event) {
        var type = this.getCurrentSlide().data('type');

        if (type == 'l-flp') {
            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Floorplan Click');
        }

        if (type == 'l-vt') {
            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Tour Click');
        }

        if (type.indexOf('i-') != -1)
            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Media Click');

        if (type.indexOf('l-') != -1) {
            var url = this.getCurrentSlide().data('url');
            var eventCode = this.getCurrentSlide().data('event');
            this.logger.logAndRedirect(event, url, eventCode, this.parameters.communityId, this.parameters.builderId, this.parameters.planId, this.parameters.specId, this.parameters.marketId, true);
        }
        else if (type == 'v-yt') {
            var videoId = this.getCurrentSlide().data('id');

            $jq("#" + this.parameters.youtubeControlId).show();
            this.playYouTubeVideo(videoId);

            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Video Click');
        }
        else if (type == 'v-bc') {
            var videoId = this.getCurrentSlide().data('id');

            $jq("#" + this.parameters.brightcoveControlId).show();
            this.playBrightcoveVideo(videoId);

            this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Video Clic');
        }
    },
    onNextorPrevClicked: function (direction, event) {

        if (this.playingVideo)
            this.stopVideo();

        this.wasArrowClick = true;

        if ((this.slider.$CurrentIndex() > 0 && direction == 0) || (this.slider.$CurrentIndex() < this.getSlidesCount() - 1 && direction == 1)) {
            $jq.googlepush('Image Viewer', 'Image Viewer', (direction ? 'Image Viewer - Main Forward' : 'Image Viewer - Main Backward'));
        }
    },
    onSlideChanges: function (position, fromPosition, virtualPosition, virtualFromPosition) {
        var type = this.getCurrentSlide().data('type');

        if (this.playingVideo)
            this.stopVideo();

        this.setupIconsBar();

        if (!this.wasArrowClick) {
            if (type.indexOf('v-') != -1 || type.indexOf('l-ev') != -1)
                this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Video Slide');
            if (type.indexOf('l-flp') != -1)
                this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Floorplan Slide');
            else if (type.indexOf('i-') != -1)
                this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Media Slide');
            else if (type.indexOf('l-vt') != -1)
                this.logGAEvent('Image Viewer', 'Image Viewer', 'Image Viewer - Tours');
            else if (type == 'brochure')
                this.logGAEvent('Lead Events', 'Image Viewer - Main Form', 'Open Form - Free Brochure');
        } else {
            this.wasArrowClick = false;
        }

        if ($jq(this.getCurrentSlide()).data('title') == undefined)
            $jq('#' + this.parameters.titleControlId).text('');
        else
            $jq('#' + this.parameters.titleControlId).text($jq(this.getCurrentSlide()).data('title'));

        $jq('#' + this.parameters.arrowLeftControlId).removeClass('nhs_disabledArrow');
        $jq('#' + this.parameters.arrowRightControlId).removeClass('nhs_disabledArrow');

        if (position == this.getSlidesCount() - 1) {
            $jq('#' + this.parameters.arrowRightControlId).addClass('nhs_disabledArrow');
        }
        else if (position == 0) {
            $jq('#' + this.parameters.arrowLeftControlId).addClass('nhs_disabledArrow');
        }

    },
    markup: function (html, data) {
        var m;
        var i = 0;
        var match = html.match(data instanceof Array ? /{{\d+}}/g : /{{\w+}}/g) || [];

        while (m = match[i++]) {
            html = html.replace(m, data[m.substr(2, m.length - 4)]);
        }
        return html;
    }
};
