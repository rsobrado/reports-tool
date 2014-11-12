var bcExp,
    bcVP,
    bcImg,
    bcVw,
    _imageBaseUrl,
    _imgNLinks,
    _youtubeLinks,
    _mp_listingType,
    _isBasicCommunity,
    _bcExperienceID,
    mp_captionBarIDNew,
    _videos,
    _currentObjCache,
    _imgList,
    _myW,
    _toggleVideo,
    _youtubeCreated,
    _globalParams,
    _globalCaption,
    _ended,
    gnocdmain,
    gnoimgMed,
    gnoimgLarge,
    glistingType;



GallerylookUpTable =
    {
        "cv": "Community Video",
        "sv": "Community Video",
        "hv": "Home Video",
        "ci": "Community Image",
        "hi": "Home Image",
        "ev": "External Video",
        "pv": "Plan Viewer",
        "vir": "Virtual Tour",
        "vt": "Virtual Tour",
        "ele": "Elevation",
        "flp": "FloorPlan",
        "int": "Interior",
        "ext": "Exterior",
        "lm": "Community Lot Map"
    };

function UpdateResPlayer() {
    $jq('.ad-gallery').css('width', '300px');
    $jq('.ad-gallery').css('height', '240px');

    $jq('.nhs_ImagePlayerBox').css('width', '300px');
    $jq('.nhs_ImagePlayerBox').css('height', '240px');

    $jq('.nhs_ImagePlayerBox object').css('width', '300px');

    $jq('.nhs_ImagePlayerTitleBar').css('width', '300px');

    //$jq('.nhs_MediaImageTitleNew').css('width', '268px');

    $jq('.ad-gallery .ad-image-wrapper').css('height', '194px');

    $jq('.ad-gallery .ad-nav').css('width', '265px');

    $jq('.ad-gallery .ad-nav .ad-thumbs').css('width', '234px');

    $jq('.ad-nav .ad-thumbs').css('width', '256px');
}

DisplayNoMedia = function (baseurl) {
    //var img = $jq('<img src=\"' + baseurl + "globalresourcesmvc/default/images/nophoto_media.jpg" + '\" alt=\"No photo or video available\" ' + '/>');
    //$jq('#nhsplayerVideo').hide();
    //$jq('#nhs_ImagePlayer').hide();
    //$jq('.ad-nav').hide();
    //$jq('#nhs_ImagePlayerNoImage').append(img);
    //$jq('#nhs_ImagePlayerNoImage').fadeIn(100);
    //Change for Pro 7 CSS Styling
    var img = $jq('<img src=\"' + baseurl + "globalresourcesmvc/default/images/nophoto_460x307.jpg" + '\" alt=\"No photo or video available\" ' + '/>');
    $jq('.ad-gallery .ad-image-wrapper').append(img);
}


function InitGallery(params) {

    _ended = false;
    _youtubeCreated = false;

    if (params.hasOwnProperty('titleBarText')) {
        $jq('#nhs_ImagePlayerTitle').text(params.titleBarText);
    }

    _globalParams = params;
    //_globalParams.description = params.description;
    //_globalParams.firstImgUrl = params.firstImgUrl;

    if (params.mediaObjs.length == 0 && params.externalLinks != undefined && params.externalLinks.length == 0 && params.type != 'results') {
        DisplayNoMedia(params.imgStaticUrl);
    }
    else {

        var listingType = params.hasOwnProperty('specID') ? "spec" : params.hasOwnProperty('planID') ? "plan" : params.hasOwnProperty('communityID') ? "com" : "commres";
        glistingType = listingType;
        var noimgLarge = params.imgStaticUrl + "globalresourcesmvc/default/images/nophoto_460x307.jpg";
        var noimgMed = params.imgStaticUrl + "globalresourcesmvc/default/images/nophoto_med.png";
        var nocdmain = params.imgStaticUrl + "globalresourcesmvc/default/images/imgs-player/blank.gif";
        if (listingType == 'commres') {
            _wrapperW = 300;
            _wrapperH = 194;
        }
        else {
            _wrapperW = 0;
            _wrapperH = 0;
        }

        glistingType = listingType;
        gnocdmain = nocdmain;
        gnoimgLarge = noimgLarge;
        gnoimgMed = noimgMed;
        ProcessParams(params);



    }
}


function AfterProcess() {

    $jq(function () {
        var options = { resource_root: _globalParams.imgBaseUrl, listingType: glistingType };
        var galleries = $jq('.ad-gallery').adGallery(options);
        galleries[0].settings.effect = "fade";
        galleries[0].settings.mp_type = glistingType;
        galleries[0].settings.nocdmain = gnocdmain;

        if (glistingType == 'com') {
            galleries[0].settings.noimg = gnoimgLarge;
        }
        else {
            galleries[0].settings.noimg = gnoimgMed;
            galleries[0].settings.wrapperW = 300;
            galleries[0].settings.wrapperH = 124;
        }

    });

}

function HideImgTitle() {
    $jq('div.nhs_MediaImageTitle').hide();
}

function SetCaption(url, subType, title, index, initialLoad) {
    var caption;
    if (_mp_listingType == "com") {
        caption = (subType == "ci" || subType == "lm") ? "Community Image" : "Home Image";
    }
    else {
        caption = GallerylookUpTable[subType];
    }

    if (_globalParams.hasOwnProperty('captionBarText')) {
        caption = _globalParams.captionBarText + caption;
    } else {
        caption = " Now Showing: " + caption;
    }

    $jq('#' + mp_captionBarID).text(caption);

    if ($jq.trim(title) != '') {
        //$jq('#' + _mp_imgtitleBar).show().text(title);
        //$jq('div.nhs_MediaImageTitle').show()
    }
    else {
        $jq('div.nhs_MediaImageTitle').hide();
    }
}

function GoBack() {
    //bcVP.stop();
    $jq('#vidP').hide();
    $jq('#medP').show();
}

function GetCaption(asset) {
    var caption;
    if (_mp_listingType == "com") {
        if (asset.Type == "v") {
            caption = (asset.SubType == "cv" || asset.SubType == "sv" || asset.SubType == null) ? "Community Video" : "Home Video";
        }
        else if (asset.Type == "i") {
            caption = (asset.SubType == "ci" || asset.SubType == "lm") ? "Community Image" : "Home Image";
        } else
            caption = GallerylookUpTable[asset.SubType];
    }
    else {
        caption = GallerylookUpTable[asset.SubType];
        if (caption == null)
            caption = "Home Video";
    }

    if (_globalParams.hasOwnProperty('captionBarText')) {
        caption = _globalParams.captionBarText + caption;
    } else {
        caption = " Now showing: " + caption;
    }

    return caption;
}

function GalleryloadImage(url, subType, title, index, initialLoad, isvideo, nhsid, videoid, videoStillUrl) {

    var caption;
    if (_mp_listingType == "com") {
        if (isvideo)
            caption = (subType == "cv" || subType == "sv") ? "Community Video" : "Home Video";
        else
            caption = (subType == "ci" || subType == "lm") ? "Community Image" : "Home Image";
    }
    else {
        caption = GallerylookUpTable[subType];
        //        if (isvideo && (_mp_listingType == "commres")) {
        //            $jq('.nhs_VideoPlayerBox').css('height', '240px');
        //        }
    }

    caption = " Now Showing: " + caption;
    $jq('#' + mp_captionBarIDNew).text(caption);
    if (_mp_listingType == "commres")
        $jq.googlepush('Videos', 'Search Results', 'Community');

    //hack to fix url issue for pinterest


    var newImgUrl = "";
    var isyoutube = url.indexOf('youtu') != -1;
    $jq('#medP').show();
    $jq('#vidP').hide();

    if (isvideo) {
        if (_toggleVideo != 1) {

            $jq('#medP').hide();
            $jq('#vidP').show();
            if (isyoutube) {
                $jq('#nhsplayerloading').hide();
                $jq('#brightcoveP').hide();
                $jq('#youtubeP').show();
            } else {
                $jq('#nhsplayerloading').show();
                if (player != undefined)
                    player.stopVideo();
                $jq('#youtubeP').hide();
                $jq('#brightcoveP').show();
            }

        } else {
            //bcVP.stop();
        }
        this.myvidid = videoid;
        this.mysubtype = subType;
        this.mytitle = title;
        this.myindex = index;
        this.mycue = initialLoad;
        this.myid = nhsid;

        if (isyoutube) {
            if (!_youtubeCreated) {
                createPlayer('youtubeP', videoid, 460, 307);
                _youtubeCreated = true;
            } else {
                player.loadVideoById(videoid);
            }

            NHS.Scripts.MediaPlayerVideo._logVideo(nhsid);
        }
        else {
            if (this.allLoaded) {
                NHS.Scripts.MediaPlayerVideo.loadVideo(videoid, subType, title, index, initialLoad, nhsid);
            }
        }
        _toggleVideo = 1;
        newImgUrl = videoStillUrl;
    } else {
        if (_toggleVideo == 1) {
            if (player != undefined)
                player.stopVideo();

            $jq('#vidP').hide();
            $jq('#medP').show();
        }
        _toggleVideo = 0;
        newImgUrl = _imgBaseUrl + url;
        if (!_isBasicCommunity) {
            if (_mp_listingType == "spec" || _mp_listingType == "plan")
                $jq.googlepush('Images', 'Home - Gallery', 'Select Images');
            else
                $jq.googlepush('Images', 'Community - Gallery', 'Select Images');
        }
    }
    updatePinterest(newImgUrl, isvideo);


}

function updatePinterest(imgUrl, isVideo) {
    var pinInstance = $jq(".nhs_MediaPlayerContainer .pin-it-button");
    if (pinInstance.length > 0) {
        var currentHref = "http://pinterest.com/pin/create/button/?url=" + encodeURIComponent(_globalParams.url) + "&media=" + encodeURIComponent(imgUrl) + "&description=" + encodeURIComponent(isVideo ? "Video!: " + _globalParams.description : _globalParams.description);
        pinInstance.attr("href", currentHref);
        _globalParams.firstImgUrl = imgUrl;
    }
}


function ProcessParams(mpParams) {

    if (mpParams.mediaObjs.length == 0) {
        mp_mediaItems = null;
    }
    else {
        mp_mediaItems = mpParams.mediaObjs;  //mediaobjects jsonised
    }

    _imgBaseUrl = mpParams.imgBaseUrl;
    _isBasicCommunity = mpParams.isBasicCommunity;

    _mp_listingType = mpParams.hasOwnProperty('specID') ? "spec" : mpParams.hasOwnProperty('planID') ? "plan" : mpParams.hasOwnProperty('communityID') ? "com" : "commres";
    this._externalLinks = mpParams.externalLinks;
    _bcExperienceID = mpParams.bcExperienceID;
    this._titlebarID = mpParams.titleBarID;

    var useAlterText = _globalParams.hasOwnProperty('captionBarText');

    (_mp_listingType == "com")
        ? $jq('#' + this._titlebarID).text(useAlterText ? _globalParams.titleBarText : "Community Gallery")
        : ((_mp_listingType == "commres")
            ? $jq('#' + this._titlebarID).text(useAlterText ? "Tour video gallery" : "Community video gallery")
            : $jq('#' + this._titlebarID).text(useAlterText ? _globalParams.titleBarText : "Home Gallery"));

    mp_captionBarIDNew = mpParams.captionBarID;
    _mp_imgtitleBar = mpParams.imgtitleBar;
    var caption;

    if (mpParams.type == 'community' || mpParams.type == 'home')
        _loadDetailsMediaPlayer('_popComVideos');
    else if (mpParams.type == 'results')
        _loadShowCasePlayer('_popShowcaseVideos');

}

_loadDetailsMediaPlayer = function (BCcallback) {
    this._initialize(BCcallback);
    var tags = this._getTags();
    var hasVideos = (tags != '');

    if (hasVideos) {
        BCMAPI.find('find_videos_by_tags',
                {
                    or_tags: tags,
                    fields: "id,referenceId,thumbnailURL,tags,videoStillURL"
                });
    }
    else {
        _popImgnLnksFromMediaItems(false);
    }
}


_loadShowCasePlayer = function (BCcallback) {
    this._initialize(BCcallback);
    var tags = this._getTags();
    var hasVideos = (tags != '');
    var marketTagName = _globalParams.marketName + "_" + _globalParams.marketID;
    tags += (tags !== '') ? ",showcasevideo," : "showcasevideo";
    tags = marketTagName + "," + "allmarkets-" + _globalParams.brightCoveSuffix + "," + tags;

    BCMAPI.find('find_videos_by_tags',
            {
                or_tags: tags,
                fields: "name,id,referenceId,thumbnailURL,tags,videoStillURL"
            });
}

_getTags = function () {
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
}

_popComVideos = function (response) {
    _popVideos(response, "cv");
}

_popShowcaseVideos = function (response) {
    _popVideos(response, 'sv');
}

function initializePinterest(bcresponse) {
    updatePinterest(bcresponse.items[0].videoStillURL, true);
}
_popVideos = function (response, subtype) {

    _currentObjCache._popImgnLnksFromMediaItems((response.items.length != 0));
    if (response.items.length > 0) {
        initializePinterest(response);
    }

    var videos = new Array();
    var showcaseVideos = new Array();
    var marketVideos = new Array();
    var lkup = GallerylookUpTable;
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
                    VideoStillURL: video.videoStillURL,
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
                    VideoStillURL: video.videoStillURL,
                    IsYouTubeVideo: false
                };
        }


        if ($jq.inArray(_globalParams.marketName + "_" + _globalParams.marketID, video.tags) != -1 || $jq.inArray("allmarkets-" + _globalParams.brightCoveSuffix, video.tags) != -1) {
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
                    Ref: video.referenceId,
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

        if (showcaseVideos.length > 0) {
            videos = videos.concat(showcaseVideos);
        }

        if (marketVideos.length > 0) {
            marketVideos = marketVideos.sort(function (a, b) { var ref1 = a.Sort; var ref2 = b.Sort; if (ref1 < ref2) return -1; if (ref1 > ref2) return 1; ref1 = a.Ref.indexOf('allmarkets') != -1 ? 'z' : a.Ref; ref2 = b.Ref.indexOf('allmarkets') != -1 ? 'z' : b.Ref; return ref1.localeCompare(ref2); });

            videos = marketVideos.concat(videos);
        }


        //NHS.Scripts.MediaPlayer._bindTmpl(videos, true);

        var noOfItems = videos.length;


        if (!!_imgNLinks && _imgNLinks.length != 0) {
            //NHS.Scripts.MediaPlayer._bindTmpl(_imgNLinks, false);
            noOfItems = noOfItems + _imgNLinks.length;
        }
        var itemScrollLength = subtype == "sv" ? 2 : 3;

        //NHS.Scripts.MediaPlayer._buildCarousel(noOfItems, itemScrollLength);
        //if (videos.length != 0)
        //NHS.Scripts.MediaPlayer.loadVideo(videos[0].Url, videos[0].SubType, videos[0].Title, 1, true, videos[0].ID);
        //else
        //NHS.Scripts.MediaPlayer.loadVideo(showcaseVideos[0].Url, showcaseVideos[0].SubType, showcaseVideos[0].Title, 1, true, showcaseVideos[0].ID);

        var hasImages = _imgNLinks.length > 0;
        var hasVideos = videos.length > 0;
        _globalCaption = new Array();
        jQuery.each(videos, function (index, asset) {
            _globalCaption.push(GetCaption(asset));
        });
        jQuery.each(_imgNLinks, function (index, asset) {
            _globalCaption.push(GetCaption(asset));
        });



        if (hasVideos) {
            if (_mp_listingType == "com") {
                caption = (videos[0].SubType == "cv") ? "Community Video" : "Home Video";
            }
            else {
                caption = GallerylookUpTable[videos[0].SubType];
            }
            caption = "Now Showing: " + caption;
            $jq('#' + mp_captionBarIDNew).text(caption);
        }
        else
            if (hasImages) {
                if (_mp_listingType == "com") {
                    caption = (_imgNLinks[0].SubType == "ci" || _imgNLinks[0].SubType == "lm") ? "Community Image" : "Home Image";
                }
                else {
                    caption = GallerylookUpTable[_imgNLinks[0].SubType];
                }
                caption = "Now Showing: " + caption;
                $jq('#' + mp_captionBarIDNew).text(caption);
            }

        mytemp = $jq.template("mpTmpl", "<li>\
                        {{if IsYouTubeVideo }} \
                        <a href=\"${Thumbnail}\"   tmpclick=\"GalleryloadImage(\'${Thumbnail}\',\'${SubType}\',\'${Title}\','${$index+1}', false, true, 0, \'${OnlineVideoID}\',\'${Thumbnail}\');\" >\
                         <img src=\"${Thumbnail}\" title=\"${Title} \" class=\"image0\" />  \
                         <span></span>\
                         </a>\
                        {{/if}} \
                        {{if Type === 'v' && !IsYouTubeVideo}} \
                        <a href=\"${VideoStillURL}\"   tmpclick=\"GalleryloadImage(\'${Thumbnail}\',\'${SubType}\',\'${Title}\','${$index+1}', false, true, ${ID}, \'${Url}\',\'${VideoStillURL}\');\" >\
                         <img src=\"${Thumbnail}\" title=\"${Title} \" class=\"image0\" />  \
                         <span></span>\
                         </a>\
                         {{/if}} \
                         {{if Type === 'i'}}\
                         <a href=\"${_imgBaseUrl+Url}\" tmpclick=\"GalleryloadImage(\'${Url}\',\'${SubType}\',\'${Title}\','${$index+1}', false, false);\"  >\
                         <img src=\"${_imgBaseUrl+Thumbnail}\" title=\"${Title}\" class=\"image0\"  />\
                         </a>\
                         {{else Type === 'l'}}\
                         {{html Url}}\
                         {{/if}}\
                        </li>");

        $jq('#galleryList').empty();
        $jq.tmpl('mpTmpl', videos).appendTo("#galleryList");
        $jq.tmpl('mpTmpl', _imgNLinks).appendTo("#galleryList");
        AfterProcess();

    }

}

Array.prototype.groupBy = function (func) {
    for (var i = 0, l = this.length, arr = {}, key; i < l; i++) {
        if (!arr[(key = "k:" + func(this[i], i, this))])
            arr[key] = [];
        arr[key].push(this[i]);
    }
    return arr;
}

Array.prototype.groupNSort = function (func, sortFunc) {
    var grps = this.groupBy(func);
    var grpNsrt = new Array();
    for (grp in grps) {
        grps[grp].sort(sortFunc);
        grpNsrt = grpNsrt.concat(grps[grp]);
    }
    return grpNsrt;
}

_initialize = function (callback) {

    BCMAPI.token = 'HYWld5USmeg7f3O0xaq2UgSaQBVyuw72JRRcM_k4sRX7yIGlb-lcuQ..';
    BCMAPI.callback = callback;
    //bcExp = brightcove.getExperience(_bcExperienceID);
    //bcVP = bcExp.getModule(APIModules.VIDEO_PLAYER);
    //bcExp = bcExp.getModule(APIModules.EXPERIENCE);
    /*bcExp.addEventListener(BCExperienceEvent.TEMPLATE_READY, onTemplateReady);
    bcExp.addEventListener(BCExperienceEvent.CONTENT_LOAD, onContentLoad);
    bcExp.addEventListener(BCContentEvent.VIDEO_LOAD, onVideoLoad);*/
    //bcImg = bcExp.getElementByID("bcImage");
    //bcVw = bcExp.getElementByID("bcView");
    _currentObjCache = this;

}

_popImgnLnksFromMediaItems = function (hasVideos) {

    _imgNLinks = new Array();
    _youtubeLinks = new Array();

    var hasImages = false;
    var hasYTVideos = false;

    if (mp_mediaItems != null) {
        var mediaObjs = mp_mediaItems;
        jQuery.each(mediaObjs, function (index, asset) {
            if (asset.Type === 'i') {
                _imgNLinks.push(asset);
                hasImages = true;
            }
            else if (asset.Type == 'v' && asset.IsYouTubeVideo) {
                _youtubeLinks.push(asset);
                hasYTVideos = true;
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


    if (!hasVideos) {
        hasImages = _imgNLinks.length > 0;
        if (hasImages) {
            if (_mp_listingType == "com") {
                caption = (_imgNLinks[0].SubType == "ci" || _imgNLinks[0].SubType == "lm") ? "Community Image" : "Home Image";
            } else {
                caption = GallerylookUpTable[_imgNLinks[0].SubType];
            }
            caption = "Now Showing: " + caption;
            $jq('#' + mp_captionBarIDNew).text(caption);
        }

        if (!hasVideos && !hasImages && !hasYTVideos) {
            DisplayNoMedia(_imgBaseUrl);
        } else {
            mytemp = $jq.template("mpTmpl", "<li>\
                        {{if IsYouTubeVideo }}\
                         <a href=\"${Thumbnail}\"   tmpclick=\"GalleryloadImage(\'${Url}\',\'${SubType}\',\'${Title}\','${$index+1}', false, true, 0, \'${OnlineVideoID}\',\'${Thumbnail}\');\" >\
                            <img src=\"${Thumbnail}\" title=\"${Title} \" class=\"image0\" />  \
                         <span></span>\
                         </a>\
                        {{/if}}\
                        {{if Type === 'v' && !IsYouTubeVideo}}\
                        <a href=\"${VideoStillURL}\"   tmpclick=\"GalleryloadImage(\'${Thumbnail}\',\'${SubType}\',\'${Title}\','${$index+1}', false, true, ${ID}, \'${Url}\',\'${VideoStillURL}\');\" >\
                            <img src=\"${Thumbnail}\" title=\"${Title} \" class=\"image0\" />  \
                         <span></span>\
                         </a>\
                        {{/if}}\
                        {{if Type === 'i'}}\
                         <a href=\"${_imgBaseUrl+Url}\" tmpclick=\"GalleryloadImage(\'${Url}\',\'${SubType}\',\'${Title}\','${$index+1}', false, false);\"  >\
                            <img src=\"${_imgBaseUrl+Thumbnail}\" title=\"${Title}\" class=\"image0\"  />\
                         </a>\
                         {{else Type === 'l'}}\
                            {{html Url}}\
                         {{/if}}\
                        </li>");

            _globalCaption = new Array();

            jQuery.each(_youtubeLinks, function (index, asset) {
                _globalCaption.push(GetCaption(asset));
            });

            jQuery.each(_imgNLinks, function (index, asset) {
                _globalCaption.push(GetCaption(asset));
            });

            $jq('#galleryList').empty();
            $jq.tmpl('mpTmpl', _youtubeLinks).appendTo("#galleryList");
            $jq.tmpl('mpTmpl', _imgNLinks).appendTo("#galleryList");
            AfterProcess();
        }
    }
};
