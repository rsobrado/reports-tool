var bcExp,
    bcVP,
    bcImg,
    bcVw,
    _imageBaseUrl,
    _imgNLinks,
    _mp_listingType,
    _bcExperienceID,
    mp_captionBarID,
    _videos,
    _currentObjCache,
    _globalParams,
    loadURL,
    loadSubType,
    loadTitle,
    loadIndex,
    loadCue,
    loadID,
    modExp,
    modCon;

NHS.Scripts.MediaPlayerVideo = function (mpParams) {

    if (mpParams.mediaObjs.length == 0) {
        mp_mediaItems = null;
    }
    else
        mp_mediaItems = mpParams.mediaObjs;  //mediaobjects jsonised

    /*eg: images is a coll of image => {Type:i|v|l , 
    SubType:cv|ci|hi|ev|pv|vt|ele|flp|int|com, //see NHS.Scripts.MediaPlayerVideo.lookUpTable
    Thumbnail: 'sml_1234.jpg',
    Title: 'Drees homes sonoma collection',
    Url: 'http://ctex.com/asd.html'
         
    ,                                       VideoID: 1234 --if a video only this field }*/

    _mp_ComID = mpParams.hasOwnProperty('communityID') ? mpParams.communityID : 0;
    _mp_PlanID = mpParams.hasOwnProperty('planID') ? mpParams.planID : 0;
    _mp_SpecID = mpParams.hasOwnProperty('specID') ? mpParams.specID : 0;
    _mp_builderID = mpParams.builderID;

    _mp_listingType = mpParams.hasOwnProperty('specID') ? "spec" : mpParams.hasOwnProperty('planID') ? "plan" : mpParams.hasOwnProperty('communityID') ? "com" : "commres";
    this._externalLinks = mpParams.externalLinks;
    _globalParams = mpParams;
    _bcExperienceID = mpParams.bcExperienceID;
    _imgBaseUrl = mpParams.imgBaseUrl;
    this._titlebarID = mpParams.titleBarID; (_mp_listingType == "com") ? $jq('#' + this._titlebarID).text("Community Gallery") : $jq('#' + this._titlebarID).text("Home Gallery");
    mp_captionBarID = mpParams.captionBarID;
    _mp_imgtitleBar = mpParams.imgtitleBar;
    _logger = mpParams.logger;
    this.marketId = mpParams.marketID;
    this.marketName = mpParams.marketName;

};

onTemplateReady = function () {
    var p1 = this.myvidid;
    var p2 = this.mysubtype;
    var p3 = this.mytitle;
    var p4 = this.myindex;
    var p5 = this.mycue;
    var p6 = this.myid;
    
    NHS.Scripts.MediaPlayerVideo.loadVideo(p1, p2, p3, p4, p5, p6);
    this.allLoaded = true;
};

myTemplateLoaded = function (pExperienceId) {

    bcExp = brightcove.api.getExperience(pExperienceId);
    bcVP = bcExp.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);

    modExp = bcExp.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
    modCon = bcExp.getModule(brightcove.api.modules.APIModules.CONTENT);
    //bcImg = bcExp.getElementByID("bcImage");
    //bcVw = bcExp.getElementByID("bcView");

    var vWidth = $jq(".BrightcoveExperience").width();
    var vHeight = $jq(".BrightcoveExperience").height();

    modExp.setSize(vWidth, vHeight);
};

NHS.Scripts.MediaPlayerVideo.prototype =
    {

        _initialize: function (callback) {
            
            BCMAPI.token = 'HYWld5USmeg7f3O0xaq2UgSaQBVyuw72JRRcM_k4sRX7yIGlb-lcuQ..';
            BCMAPI.callback = callback;

            //            bcExp = brightcove.api.getExperience(pExperienceId);
            //            bcVP = bcExp.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
            //            modExp = bcExp.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
            //            modCon = bcExp.getModule(brightcove.api.modules.APIModules.CONTENT);  

            //            bcImg = bcExp.getElementByID("bcImage");
            //            bcVw = bcExp.getElementByID("bcView");
            _currentObjCache = this;
        },

        _popImgnLnksFromMediaItems: function (hasVideos) {

            _imgNLinks = new Array();
            var hasImages = false;
            if (mp_mediaItems != null) {
                var mediaObjs = mp_mediaItems;
                jQuery.each(mediaObjs, function (index, asset) {
                    if (asset.Type === 'i') {
                        _imgNLinks.push(asset);
                        hasImages = true;
                    }
                });
            }

            if (_currentObjCache._externalLinks != null && _currentObjCache._externalLinks.length > 0) {
                var exlinks = _currentObjCache._externalLinks;
                jQuery.each(exlinks, function (index, extLink) {
                    _imgNLinks.push(extLink);
                    hasImages = true;
                });
            }



            if (!hasVideos && hasImages) {
                //NHS.Scripts.MediaPlayerVideo._bindTmpl(_imgNLinks, true);
                //NHS.Scripts.MediaPlayerVideo._buildCarousel(_imgNLinks.length, 3);
                //NHS.Scripts.MediaPlayerVideo.loadImage(_imgNLinks[0].Url, _imgNLinks[0].SubType, _imgNLinks[0].Title, 1, true);
            }
            if (!hasVideos && !hasImages) {
                NHS.Scripts.MediaPlayerVideo._noMedia();
            }


        },


        //commIDs:an array of community id's
        //containerID: ID of the div where mediaplayer will be inserted
        loadShowCasePlayer: function () {
            $jq("#videoList").empty();
            this._initialize('NHS.Scripts.MediaPlayerVideo._popShowcaseVideos');
            //Fix for ticket: 44616. this assignation was changing the if on the line 387 ( NHS.Scripts.MediaPlayerVideo._logVideo )
            //_mp_listingType = "com";
            var tags = NHS.Scripts.MediaPlayerVideo._getTags();
            var hasVideos = (tags != '');
            var marketTagName = this.marketName + "_" + this.marketId;
            tags += (tags !== '') ? ",showcasevideo," : "showcasevideo";
            tags = marketTagName + "," + "allmarkets-" + _globalParams.brightCoveSuffix + "," + tags;

            BCMAPI.find('find_videos_by_tags',
            {
                or_tags: tags,
                fields: "name,id,referenceId,thumbnailURL,tags"
            });
        },

        loadMediaPlayer: function (pageType) {
            if (pageType == "community")
                this.loadComDetailsMediaPlayer();
            else if (pageType == "home")
                this.loadHomDetailsMediaPlayer();
            else if (pageType == "results")
                this.loadShowCasePlayer();
        },

        loadComDetailsMediaPlayer: function () {
            this._loadDetailsMediaPlayer('NHS.Scripts.MediaPlayerVideo._popComVideos');
        },

        loadHomDetailsMediaPlayer: function () {
            this._loadDetailsMediaPlayer('NHS.Scripts.MediaPlayerVideo._popHomVideos');
        },



        //listingID:json object 
        //if community then {communityID:12343}, 
        //if plan then {planID: 12345}
        // if spec then {specID: 1235}
        //images: array of image paths
        //containerID: ID of the div where mediaplayer will be inserted
        _loadDetailsMediaPlayer: function (BCcallback) {
            this._initialize(BCcallback);
            var tags = NHS.Scripts.MediaPlayerVideo._getTags();
            var hasVideos = (tags != '');

            if (hasVideos) {
                BCMAPI.find('find_videos_by_tags',
                {
                    or_tags: tags,
                    fields: "id,referenceId,thumbnailURL,tags"
                });
            }
            else {
                this._popImgnLnksFromMediaItems(false);
            }
        }
    };

/*static methods*/

    NHS.Scripts.MediaPlayerVideo._getTags = function () {
    var tags = '';
    if (mp_mediaItems != null) {
        jQuery.each(mp_mediaItems, function (index, mi) {
            if (mi.Type === 'v') {
                tags += mi.VideoID + ',';

            }
        });
        tags = tags.substr(0, tags.length - 1);

    }
    return tags;
};

NHS.Scripts.MediaPlayerVideo._popComVideos = function (response) {
    NHS.Scripts.MediaPlayerVideo._popVideos(response, "cv");
};

NHS.Scripts.MediaPlayerVideo._popHomVideos = function (response) {
    NHS.Scripts.MediaPlayerVideo._popVideos(response, "hv");
};


NHS.Scripts.MediaPlayerVideo._popShowcaseVideos = function (response) {
    NHS.Scripts.MediaPlayerVideo._popVideos(response, 'sv');

};

NHS.Scripts.MediaPlayerVideo._popVideos = function (response, subtype) {

    _currentObjCache._popImgnLnksFromMediaItems((response.items.length != 0));
    var videos = new Array();
    var showcaseVideos = new Array();
    var marketVideos = new Array();
    var lkup = NHS.Scripts.MediaPlayerVideo.lookUpTable;
    var videoType = subtype;
    var videoTitle = '';
    //add refid check to remove deleted videos
    jQuery.each(response.items, function (index, video) {
        var nhsid = 0;
        var sort = 0;
        var videoid = 0;
        if (video.referenceId == null)
            video.referenceId = "";
        
        //get tags and tag info
        if (video.tags.length >= 2) {
            var hash = video.tags[1];
            var tag = video.tags[0];
            if (hash.indexOf('-') != -1) {
                var tmp = tag;
                tag = hash;
                hash = tmp;

            }
            var t = tag.split('-');
            if (t.length > 2) {
                nhsid = t[1];
                videoid = t[2];

            }

            var deletedVideo = true;
            //get title,sort
            if (mp_mediaItems != null && video.tags[0] != "showcasevideo") {
                jQuery.each(mp_mediaItems, function (index, mi) {
                    if (mi.RefID == videoid) {
                        deletedVideo = false;
                        videoTitle = mi.Title;
                        sort = mi.Sort * 1;
                        return false;
                    }
                });
            }
        }

        _videos = response.items;

        var duplicateVideo = false;
        //check hashtag check to remove duplicates
        if (videos.length > 0 && hash != "" && video.tags[0] != "showcasevideo") {
            jQuery.each(videos, function (i, v) {
                if (hash == v.hash) {
                    duplicateVideo = true;
                    return false;
                }
            });
        };



        if (!duplicateVideo && !deletedVideo && video.tags[0] != "showcasevideo") {
            videos[videos.length] =
                {
                    Type: "v",
                    SubType: videoType,
                    Thumbnail: video.thumbnailURL,
                    Title: (videoTitle == null || videoTitle == '') ? video.name : videoTitle,
                    Url: video.id,
                    ID: nhsid,
                    Sort: sort,
                    hash: hash,
                    refID: videoid,
                    IsYouTubeVideo: false
                };
        };


        if (video.tags[0] == "showcasevideo") {

            showcaseVideos[showcaseVideos.length] =
                {
                    Type: "v",
                    SubType: videoType,
                    Thumbnail: video.thumbnailURL,
                    Title: video.name,
                    Url: video.id,
                    ID: 0,
                    Sort: 1,
                    hash: hash,
                    IsYouTubeVideo: false
                };
        }


            if ($jq.inArray(this.marketName + "_" + this.marketID, video.tags) != -1 || $jq.inArray("allmarkets-" + _globalParams.brightCoveSuffix, video.tags) != -1) {
                var order = 1000;

                if (video.referenceId != null && video.referenceId.indexOf('_') != -1)
                    order = video.referenceId.substr(video.referenceId.lastIndexOf('_') + 1);

                marketVideos[marketVideos.length] =
                {
                    Type: "v",
                    SubType: videoType,
                    Thumbnail: video.thumbnailURL,
                    Title: video.name,
                    Url: video.id,
                    ID: nhsid,
                    Sort: parseInt(order),
                    hash: hash,
                    VideoStillURL: video.videoStillURL,
                    IsYouTubeVideo: false
                };
        }

    });

    if (response.items.length != 0) {

        //sort by comm results
        var newVideo = new Array();
        if (typeof mp_mediaItems != 'undefined' && mp_mediaItems != null) {
            for (var i = 0, l = mp_mediaItems.length; i < l; i++) {
                $jq.each(videos, function () {
                    if (mp_mediaItems[i].RefID.toString() == this.refID)
                        newVideo.push(this);
                });
            }
        }

        //sort correctly within each comm
        //alert("Sort "+ v1.Sort +" Title "+ v1.Title);
        //alert("Sort " + v2.Sort + " Title " + v2.Title);
        videos = newVideo.groupNSort(function (v) { return v.ID; }, function (v1, v2) { if (v1.Sort == v2.Sort) return v2.Sort.localeCompare(v1.Sort); else return v1.Sort - v2.Sort; });
        if (showcaseVideos.length > 1) {
            videos = videos.concat(showcaseVideos);
        }

        NHS.Scripts.MediaPlayerVideo._bindTmpl(videos, true);

        var noOfItems = videos.length;


        if (!!_imgNLinks && _imgNLinks.length != 0) {
            NHS.Scripts.MediaPlayerVideo._bindTmpl(_imgNLinks, false);
            noOfItems = noOfItems + _imgNLinks.length
        }
        var itemScrollLength = subtype == "sv" ? 2 : 3;

        NHS.Scripts.MediaPlayerVideo._buildCarousel(noOfItems, itemScrollLength);
        if (videos.length != 0)
            NHS.Scripts.MediaPlayerVideo.loadVideo(videos[0].Url, videos[0].SubType, videos[0].Title, 1, true, videos[0].ID);
        else
            NHS.Scripts.MediaPlayerVideo.loadVideo(showcaseVideos[0].Url, showcaseVideos[0].SubType, showcaseVideos[0].Title, 1, true, showcaseVideos[0].ID);

    }


};

NHS.Scripts.MediaPlayerVideo._bindTmpl = function (list, clear) {
    if (typeof list !== 'undefined') {

        if (list.length > 0) {
            if (clear)
                $jq('#videoList').empty();
            $jq.tmpl('mpTmpl', list).appendTo("#videoList");
        }
    }
};



NHS.Scripts.MediaPlayerVideo._buildCarousel = function (itemLength, scrollLength) {
    if (itemLength == 0) {
        NHS.Scripts.MediaPlayerVideo._noMedia();
    }
    /* else if(itemLength < 4){
    $jq('#nhs_VideoPlaylistNext,#nhs_VideoPlaylistPrev').hide()
    $jq("#nhs_VideoWrapper").jCarouselLite({
    circular : false
    });
    if(itemLength === 2){
    $jq('#videoList').css({
    "left" : "60px"
    });
    }
    if(itemLength === 1){
    $jq('#nhs_VideoWrapper').hide();
    }
    NHS.Scripts.MediaPlayerVideo.Animate();
    }*/
    else {

        $jq("#nhs_VideoWrapper").jCarouselLite({
            circular: (itemLength > 3),
            btnNext: "#nhs_VideoPlaylistNext",
            btnPrev: "#nhs_VideoPlaylistPrev",
            auto: 3700,
            speed: 1800,
            easing: 'swing',
            visible: Math.min(3, itemLength),
            scroll: 2
        });
        NHS.Scripts.MediaPlayerVideo._animate();
    }
    NHS.Scripts.MediaPlayerVideo._noOfCarouselItems = itemLength;
    // add tooltip
//    $jq('a.video img,a.image img').aToolTip({
//        inSpeed: 10,
//        outSpeed: 1
//    });

};



NHS.Scripts.MediaPlayerVideo._logMedia = function () {

    if (_mp_listingType == 'com') {
        _logger.logEvent('CDVM', _mp_ComID, _mp_builderID);
    }
    else {
        _logger.logEvent('HDVM', _mp_ComID, _mp_builderID, _mp_PlanID, _mp_SpecID);
    }

};


NHS.Scripts.MediaPlayerVideo._logVideo = function (nhsid) {

    var siteVar = "";
    if (_mp_listingType == 'commres') {
        _logger.logEvent('CRVID', nhsid, 0);
    }
    else if (_mp_listingType == 'com') {
        _logger.logEvent('CDVID', _mp_ComID, _mp_builderID);
        siteVar = 'siteCommVV';
    }
    else {
        _logger.logEvent('HDVID', _mp_ComID, _mp_builderID, (_mp_SpecID > 0? 0 : _mp_PlanID), _mp_SpecID);
        siteVar = 'siteHomeVV';
    }
    if(siteVar != "")
        jQuery.SetDataLayerPair(siteVar);
};

NHS.Scripts.MediaPlayerVideo._animate = function() {

    $jq('#nhsplayer').fadeIn(100);
    $jq('#nhsplayerloading').fadeOut();
    $jq('#nhsplayerloading').hide();
};

NHS.Scripts.MediaPlayerVideo._noMedia = function() {
    $jq('#nhsplayer').hide();
    $jq('#noImage').fadeIn(100);
    $jq('#nhsplayerloading').fadeOut();
    $jq('#nhsplayerloading').hide();
};

NHS.Scripts.MediaPlayerVideo.loadImage = function (url, subType, title, index, initialLoad) {

    //bcVP.stop();
    bcVP.setVisible(false);
    bcImg.setSource(_imgBaseUrl + url);
    bcImg.setScaleMode("scaleDown");
    
    $jq('#nhsplayerloading').hide();
    
    bcVw.setSelectedIndex(1);
    var caption;
    if (_mp_listingType == "com") {
        caption = (subType == "ci" || subType == "lm") ? "Community Image" : "Home Image";
    }
    else {
        caption = NHS.Scripts.MediaPlayerVideo.lookUpTable[subType];
    }
    var pager = index + ' of ' + NHS.Scripts.MediaPlayerVideo._noOfCarouselItems;
    caption = " Now Showing: " + caption;
    NHS.Scripts.MediaPlayerVideo._displayTitle(title, caption, pager)
    $jq('#nhs_MediaMaximize').show();

    if (initialLoad == false)
        NHS.Scripts.MediaPlayerVideo._logMedia();

};

NHS.Scripts.MediaPlayerVideo.loadVideoByTag = function (videoTag, subType, title, index, cue, nhsid) {
    if (videoTag != null) {
        var videoId = null;
        jQuery.each(_videos, function (index, video) { if ((video.tags.length > 1 && video.tags[1] == videoTag) || video.name == title) videoId = video.id; });
        if (videoId != null) NHS.Scripts.MediaPlayerVideo.loadVideo(videoId, subType, title, index, cue, nhsid);
    }
};

NHS.Scripts.MediaPlayerVideo.loadVideo = function (videoId, subType, title, index, cue, nhsid) {
    
    //bcVw.setSelectedIndex(0);
    var caption = (_mp_listingType == "com") ? "Community Video" : "Home Video";
    var pager = index + ' of ' + NHS.Scripts.MediaPlayerVideo._noOfCarouselItems;
    caption = "Now Showing: " + caption;
    NHS.Scripts.MediaPlayerVideo._displayTitle(title, caption, pager);
    $jq('#nhs_MediaMaximize').hide();
    //cue ? bcVP.cueVideo(videoId) : bcVP.loadVideo(videoId);    
    bcVP.loadVideoByID(videoId);
    bcVP.play();
    $jq('#nhsplayerloading').hide();
  
    //not from initial load on actual user click & showcase video
    if (cue == false) {
        NHS.Scripts.MediaPlayerVideo._logVideo(nhsid);
    }

};

NHS.Scripts.MediaPlayerVideo.loadVideoValues = function (videoId, subType, title, index, cue, nhsid) {

    this.loadURL = videoId;
    this.loadSubType = subType;
    this.loadTitle = title;
    this.loadCue = cue;
    this.loadID = nhsid;

};

NHS.Scripts.MediaPlayerVideo._displayTitle = function(title, caption, pager) {

    $jq('#' + mp_captionBarID).text(caption);
    //$jq('#nhs_MediaItemCounts').text(pager);

    if ($jq.trim(title) != '') {
        $jq('#' + _mp_imgtitleBar).show().text(title);
        $jq('div.nhs_MediaImageTitle').show();
    } else {
        $jq('div.nhs_MediaImageTitle').hide();
    }
};

NHS.Scripts.MediaPlayerVideo._carouselTmpl = $jq.template("mpTmpl", "<li>\
                        {{if Type === 'v'}}\
                        <a href='javascript:;'   onclick=\"NHS.Scripts.MediaPlayerVideo.loadVideo(\'${Url}\',\'${SubType}\',\'${Title}\',${$index+1}, false, ${ID});\" class=\"video\" >\
                         <img src=\"${Thumbnail}\" title=\"${Title} \" />  \
                         <span></span>\
                         </a>\
                         {{else Type === 'i'}}\
                         <a href='javascript:;' onclick=\"NHS.Scripts.MediaPlayerVideo.loadImage(\'${Url}\',\'${SubType}\',\'${Title}\','${$index+1}', false);\" class=\"image\">\
                         <img src=\"${_imgBaseUrl+Thumbnail}\" title=\"${Title}\" />\
                         </a>\
                         {{else Type === 'l'}}\
                         {{html Url}}\
                         {{/if}}\
                        </li>");

NHS.Scripts.MediaPlayerVideo.lookUpTable =
    {
        "cv": "Community Video",
        "sv": "Community Video",
        "hv": "Home Video",
        "ci": "Community Image",
        "hi": "Home Image",
        "ev": "External Video",
        "pv": "Plan Viewer",
        "vir": "Virtual Tour",
        "ele": "Elevation",
        "flp": "FloorPlan",
        "int": "Interior",
        "ext": "Exterior",
        "lm": "Community Lot Map"
    };

    NHS.Scripts.MediaPlayerVideo.GetPageSize = function () {
    var de = document.documentElement;
    var w = window.innerWidth || self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
    var h = window.innerHeight || self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
    arrayPageSize = [w, h];
    return arrayPageSize;
};

NHS.Scripts.MediaPlayerVideo.Zoom = function (divID, objID) {

    //get index to check if image or video
    //if video then get position 
    NHS.Scripts.MediaPlayerVideo._prevWidth = $jq(objID).width();
    NHS.Scripts.MediaPlayerVideo._prevHeight = $jq(objID).height();
    //  mp_timetoSeek = bcVP.getVideoPosition();
    //   var currentVideoID = bcVP.getCurrentVideo().id;
    var newWidth = $jq(objID).width() * 1.5;
    var newHeight = $jq(objID).height() * 1.5;
    var pageSize = NHS.Scripts.MediaPlayerVideo.GetPageSize();
    var x = pageSize[0];
    var y = pageSize[1];
    var dialogHeight;
    if (y > 640) {
        dialogHeight = 640;
    } else {
        dialogHeight = y - 50;
    }

    $jq(divID).dialog('destroy');
    $jq(divID).dialog({
        modal: true,
        autoStart: false,
        height: dialogHeight,
        width: newWidth + 40,
        resizable: false,
        hide: 'fold',
        show: 'blind',
        close: function (event, ui) {
            $jq(divID).dialog('destroy');
            $jq(divID).removeAttr('style').removeAttr('class');
            $jq(objID).width(NHS.Scripts.MediaPlayerVideo._prevWidth).height(NHS.Scripts.MediaPlayerVideo._prevHeight);
            // bcVP.cueVideo(currentVideoID);
            $jq('#nhsplayerContainer').append($jq(divID));
        }
    });

    $jq(objID).width(newWidth);
    $jq(objID).height(newHeight);

    //    bcVP.cueVideo(currentVideoID);
    if (mp_timetoSeek > 0) {
        // bcVP.play();
    }

    $jq(divID).dialog('open');
    bcVP.pause(false);



};

NHS.Scripts.MediaPlayerVideo.onVideoLoad = function (args) {

    if (typeof mp_timetoSeek !== 'undefined')
        bcVP.seek(mp_timetoSeek);
}

Array.prototype.groupBy = function (func) {
    for (var i = 0, l = this.length, arr = {}, key; i < l; i++) {
        if (!arr[(key = "k:" + func(this[i], i, this))])
            arr[key] = [];
        arr[key].push(this[i]);
    }
    return arr;
};

Array.prototype.groupNSort = function (func, sortFunc) {
    var grps = this.groupBy(func);
    var grpNsrt = new Array();
    for (grp in grps) {
        grps[grp].sort(sortFunc);
        grpNsrt = grpNsrt.concat(grps[grp]);
    }
    return grpNsrt;
};
 
