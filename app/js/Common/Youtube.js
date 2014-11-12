var player;

$jq(document).ready(function() {

    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

});

function onYouTubeIframeAPIReady() {

}

function createPlayer(videoDivId, videoId, width, height) {
    player = new YT.Player(videoDivId, {
        height: height,
        width: width,
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}


function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
}