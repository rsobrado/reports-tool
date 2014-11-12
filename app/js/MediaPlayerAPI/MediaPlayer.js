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
    _currentObjCache;


NHS.Scripts.MediaPlayer = function (mpParams) {

    if (mpParams.mediaObjs.length == 0) {
        mp_mediaItems = null;
    }
    else
        mp_mediaItems = mpParams.mediaObjs;  //mediaobjects jsonised

    /*eg: images is a coll of image => {Type:i|v|l , 
    SubType:cv|ci|hi|ev|pv|vt|ele|flp|int|com, //see NHS.Scripts.MediaPlayer.lookUpTable
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
    _bcExperienceID = mpParams.bcExperienceID;
    _imgBaseUrl = mpParams.imgBaseUrl;
    this._titlebarID = mpParams.titleBarID; (_mp_listingType == "com") ? $jq('#' + this._titlebarID).text("Community Gallery") : $jq('#' + this._titlebarID).text("Home Gallery");
    mp_captionBarID = mpParams.captionBarID;
    _mp_imgtitleBar = mpParams.imgtitleBar;
    _logger = mpParams.logger;
};


NHS.Scripts.MediaPlayer.prototype =
    {

        _initialize: function (callback) {

            BCMAPI.token = 'HYWld5USmeg7f3O0xaq2UgSaQBVyuw72JRRcM_k4sRX7yIGlb-lcuQ..';
            BCMAPI.callback = callback;
            bcExp = brightcove.getExperience(_bcExperienceID);
            bcVP = bcExp.getModule(APIModules.VIDEO_PLAYER);
            bcExp = bcExp.getModule(APIModules.EXPERIENCE);     
            bcImg = bcExp.getElementByID("bcImage");
            bcVw = bcExp.getElementByID("bcView");
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
                NHS.Scripts.MediaPlayer._bindTmpl(_imgNLinks, true);
                NHS.Scripts.MediaPlayer._buildCarousel(_imgNLinks.length, 3);
                NHS.Scripts.MediaPlayer.loadImage(_imgNLinks[0].Url, _imgNLinks[0].SubType, _imgNLinks[0].Title, 1, true);
            }
            if (!hasVideos && !hasImages) {
                NHS.Scripts.MediaPlayer._noMedia();
            }
        },

        //commIDs:an array of community id's
        //containerID: ID of the div where mediaplayer will be inserted
        loadShowCasePlayer: function () {
            $jq("#videoList").empty();
            this._initialize('NHS.Scripts.MediaPlayer._popShowcaseVideos');
            //Fix for ticket: 44616. this assignation was changing the if on the line 387 ( NHS.Scripts.MediaPlayer._logVideo )
            //_mp_listingType = "com";
            var tags = NHS.Scripts.MediaPlayer._getTags();
            var hasVideos = (tags != '');
            tags += (tags !== '') ? ",showcasevideo" : "showcasevideo";

            BCMAPI.find('find_videos_by_tags',
            {
            or_tags: tags,
            fields: "name,id,referenceId,thumbnailURL,tags"
            });
            
        },

        loadComDetailsMediaPlayer: function () {
            this._loadDetailsMediaPlayer('NHS.Scripts.MediaPlayer._popComVideos');
        },

        loadHomDetailsMediaPlayer: function () {
            this._loadDetailsMediaPlayer('NHS.Scripts.MediaPlayer._popHomVideos');
        },

        //listingID:json object 
        //if community then {communityID:12343}, 
        //if plan then {planID: 12345}
        // if spec then {specID: 1235}
        //images: array of image paths
        //containerID: ID of the div where mediaplayer will be inserted
        _loadDetailsMediaPlayer: function (BCcallback) {
            this._initialize(BCcallback);
            var tags = NHS.Scripts.MediaPlayer._getTags();
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

    NHS.Scripts.MediaPlayer._getTags = function () {
        var tags='';
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

    NHS.Scripts.MediaPlayer._popComVideos = function(response){
        NHS.Scripts.MediaPlayer._popVideos(response, "cv");
    };
    
    NHS.Scripts.MediaPlayer._popHomVideos = function(response){
        NHS.Scripts.MediaPlayer._popVideos(response, "hv");
    };
        
    NHS.Scripts.MediaPlayer._popShowcaseVideos = function(response){
        NHS.Scripts.MediaPlayer._popVideos(response, 'sv');        
    };

    NHS.Scripts.MediaPlayer._popVideos = function (response, subtype) {

        _currentObjCache._popImgnLnksFromMediaItems((response.items.length != 0));
        var videos = new Array();
        var showcaseVideos = new Array();
        var lkup = NHS.Scripts.MediaPlayer.lookUpTable;
        var videoType = subtype;
        var videoTitle = '';
        //add refid check to remove deleted videos
        jQuery.each(response.items, function (index, video) {
            var nhsid = 0;
            var sort = 0;
            var videoid = 0;
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
            videos = newVideo.groupNSort(function (v) { return v.ID; }, function (v1, v2) { return v1.Sort - v2.Sort; });
            if (showcaseVideos.length > 1) {
                videos = videos.concat(showcaseVideos);
            }

            NHS.Scripts.MediaPlayer._bindTmpl(videos, true);

            var noOfItems = videos.length;


            if (!!_imgNLinks && _imgNLinks.length != 0) {
                NHS.Scripts.MediaPlayer._bindTmpl(_imgNLinks, false);
                noOfItems = noOfItems + _imgNLinks.length
            }
            var itemScrollLength = subtype == "sv" ? 2 : 3;

            NHS.Scripts.MediaPlayer._buildCarousel(noOfItems, itemScrollLength);
            if (videos.length != 0)
                NHS.Scripts.MediaPlayer.loadVideo(videos[0].Url, videos[0].SubType, videos[0].Title, 1, true, videos[0].ID);
            else
                NHS.Scripts.MediaPlayer.loadVideo(showcaseVideos[0].Url, showcaseVideos[0].SubType, showcaseVideos[0].Title, 1, true, showcaseVideos[0].ID);
        }
    };

    NHS.Scripts.MediaPlayer._bindTmpl = function(list, clear) {
        if (typeof list !== 'undefined') {

            if (list.length > 0) {
                if (clear)
                    $jq('#videoList').empty();
                $jq.tmpl('mpTmpl', list).appendTo("#videoList");
            }
        }

    };        
    
    NHS.Scripts.MediaPlayer._buildCarousel = function(itemLength, scrollLength){
        if(itemLength == 0){
            NHS.Scripts.MediaPlayer._noMedia();
        }     
        else{
            
            $jq("#nhs_VideoWrapper").jCarouselLite({
                circular : (itemLength > 3),
                btnNext : "#nhs_VideoPlaylistNext",
                btnPrev : "#nhs_VideoPlaylistPrev",
                auto : 3700,
                speed : 1800,
                easing : 'swing',
                visible : Math.min(3, itemLength),
                scroll : 2
            });
            NHS.Scripts.MediaPlayer._animate();
        }
        NHS.Scripts.MediaPlayer._noOfCarouselItems = itemLength;
        // add tooltip
        $jq('a.video img,a.image img').aToolTip({
            inSpeed : 10,
            outSpeed : 1
        });
        
    };

  

    NHS.Scripts.MediaPlayer._logMedia = function () {

        if (_mp_listingType == 'com') {
            _logger.logEvent('CDVM', _mp_ComID, _mp_builderID)
        }
        else {
            _logger.logEvent('HDVM', _mp_ComID, _mp_builderID, _mp_PlanID, _mp_SpecID)
        }

    };


    NHS.Scripts.MediaPlayer._logVideo = function (nhsid) {
        
        if (_mp_listingType == 'commres') {
            _logger.logEvent('CRVID', nhsid, 0)
        }
        else if (_mp_listingType == 'com') {
            _logger.logEvent('CDVID', _mp_ComID, _mp_builderID)
        }
        else {
            _logger.logEvent('HDVID', _mp_ComID, _mp_builderID, _mp_PlanID, _mp_SpecID)
        }

    };

    NHS.Scripts.MediaPlayer._animate = function() {

        $jq('#nhsplayer').fadeIn(100);
        $jq('#nhsplayerloading').fadeOut();
        $jq('#nhsplayerloading').hide();
    };

    NHS.Scripts.MediaPlayer._noMedia = function() {
        $jq('#nhsplayer').hide();
        $jq('#noImage').fadeIn(100);
        $jq('#nhsplayerloading').fadeOut();
        $jq('#nhsplayerloading').hide();
    };


    NHS.Scripts.MediaPlayer.loadImage = function(url, subType, title, index, initialLoad){
        
        bcVP.stop();
        bcVP.setVisible(false);
        bcImg.setSource(_imgBaseUrl + url);
        bcImg.setScaleMode("scaleDown");
        
        bcVw.setSelectedIndex(1);
        var caption;
        if(_mp_listingType == "com"){
            caption = (subType == "ci" || subType == "lm") ? "Community Image" : "Home Image";
        }
        else{
            caption = NHS.Scripts.MediaPlayer.lookUpTable[subType];
        }
        var pager = index + ' of ' + NHS.Scripts.MediaPlayer._noOfCarouselItems;
        caption = " Now Showing: " + caption;
        NHS.Scripts.MediaPlayer._displayTitle(title, caption, pager)
        $jq('#nhs_MediaMaximize').show();
        
        if(initialLoad == false)
            NHS.Scripts.MediaPlayer._logMedia();
        
    };

    NHS.Scripts.MediaPlayer.loadVideoByTag = function (videoTag, subType, title, index, cue, nhsid) {
        if (videoTag != null) {
            var videoId = null;
            jQuery.each(_videos, function (index, video) { if ((video.tags.length > 1 && video.tags[1] == videoTag) || video.name == title) videoId = video.id; });
            if(videoId != null) NHS.Scripts.MediaPlayer.loadVideo(videoId, subType, title, index, cue, nhsid);
        }
    };

    NHS.Scripts.MediaPlayer.loadVideo = function (videoId, subType, title, index, cue, nhsid) {
        
        bcVw.setSelectedIndex(0);
        var caption = (_mp_listingType == "com") ? "Community Video" : "Home Video";
        var pager = index + ' of ' + NHS.Scripts.MediaPlayer._noOfCarouselItems;
        caption = "Now Showing: " + caption;
        NHS.Scripts.MediaPlayer._displayTitle(title, caption, pager)
        $jq('#nhs_MediaMaximize').hide();
        cue ? bcVP.cueVideo(videoId) : bcVP.loadVideo(videoId);
        //not from initial load on actual user click & showcase video
        if (cue == false) {
            NHS.Scripts.MediaPlayer._logVideo(nhsid);
        }

    };

    NHS.Scripts.MediaPlayer._displayTitle = function (title, caption, pager) {
       
        $jq('#' + mp_captionBarID).text(caption);
        $jq('#nhs_MediaItemCounts').text(pager);
     
        if ($jq.trim(title) != '') {
            $jq('#' + _mp_imgtitleBar).show().text(title);
            $jq('div.nhs_MediaImageTitle').show()
        }
        else {
            $jq('div.nhs_MediaImageTitle').hide()
        }
    }
    
    NHS.Scripts.MediaPlayer._carouselTmpl = $jq.template("mpTmpl", "<li>\
                        {{if Type === 'v'}}\
                        <a href='javascript:;'   onclick=\"NHS.Scripts.MediaPlayer.loadVideo(\'${Url}\',\'${SubType}\',\'${Title}\',${$index+1}, false, ${ID});\" class=\"video\" >\
                         <img src=\"${Thumbnail}\" title=\"${Title} \" />  \
                         <span></span>\
                         </a>\
                         {{else Type === 'i'}}\
                         <a href='javascript:;' onclick=\"NHS.Scripts.MediaPlayer.loadImage(\'${Url}\',\'${SubType}\',\'${Title}\','${$index+1}', false);\" class=\"image\">\
                         <img src=\"${_imgBaseUrl+Thumbnail}\" title=\"${Title}\" />\
                         </a>\
                         {{else Type === 'l'}}\
                         {{html Url}}\
                         {{/if}}\
                        </li>");
    
    NHS.Scripts.MediaPlayer.lookUpTable = 
    {
        "cv" : "Community Video",
        "sv" : "Community Video",
        "hv" : "Home Video",
        "ci" : "Community Image",
        "hi" : "Home Image",
        "ev" : "External Video",
        "pv" : "Plan Viewer",
        "vir" : "Virtual Tour",
        "ele" : "Elevation",
        "flp" : "FloorPlan",
        "int" : "Interior",
        "ext" : "Exterior",
        "lm" : "Community Lot Map"
    };

    NHS.Scripts.MediaPlayer.GetPageSize = function () {
        var de = document.documentElement;
        var w = window.innerWidth || self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
        var h = window.innerHeight || self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
        arrayPageSize = [w, h];
        return arrayPageSize;
    };

    NHS.Scripts.MediaPlayer.Zoom = function (divID, objID) {

        //get index to check if image or video
        //if video then get position 
        NHS.Scripts.MediaPlayer._prevWidth = $jq(objID).width();
        NHS.Scripts.MediaPlayer._prevHeight = $jq(objID).height();
        //  mp_timetoSeek = bcVP.getVideoPosition();
        //   var currentVideoID = bcVP.getCurrentVideo().id;
        var newWidth = $jq(objID).width() * 1.5;
        var newHeight = $jq(objID).height() * 1.5;
        var pageSize = NHS.Scripts.MediaPlayer.GetPageSize();
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
                $jq(objID).width(NHS.Scripts.MediaPlayer._prevWidth).height(NHS.Scripts.MediaPlayer._prevHeight);
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
    
    NHS.Scripts.MediaPlayer.onVideoLoad = function(args){
        
        if(typeof mp_timetoSeek !== 'undefined')
            bcVP.seek(mp_timetoSeek);
    }

    Array.prototype.groupBy = function (func) {
        for (var i = 0, l = this.length, arr = {}, key; i < l; i++) {
            if (!arr[(key = "k:"+func(this[i], i, this))])
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
 
