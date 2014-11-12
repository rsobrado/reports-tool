if(typeof NHS=="undefined"){NHS={};NHS.Scripts={}}NHS.Scripts.GoogleMapApi=function(b){var a={};jQuery.extend(true,a,this.defaultOptios);this.options=jQuery.extend(true,a,b);this.markersArray=[];this.infowindow=new google.maps.InfoWindow(this.options.InfoWindowOptions);this.infowindowTooltip=new google.maps.InfoWindow(this.options.InfoWindowOptions);this.map=null;this.bounds=new google.maps.LatLngBounds;this.isMapCreate=false};NHS.Scripts.GoogleMapApi.prototype={defaultOptios:{MapOptions:{Latitude:null,Longitude:null,Zoom:8,ContainerName:"map-canvas",zoomControl:true,ZoomControlStyle:"LARGE",zoomControlPosition:null,disableDefaultUI:false,Draggable:true,Scrollwheel:true,DisableDoubleClickZoom:false,panControl:false,overviewControl:false,streetViewControl:false},CreateMapWrap:true,DirectionsDisplayPanel:null,MarkerPointOptions:{optimized:true},Loader:"",MinZoom:3,MaxZoom:null,MarkerClustererOptions:{gridSize:50,maxZoom:15,cssName:null,imagePath:null,zoomOnClick:true,minimumClusterSize:null},UseClusterer:false,InfoWindowOptions:{disableAutoPan:false},MarkerPointAsynOptions:{Listener:"idle",UrlServer:null},ProcessResultOptions:{Latitude:"",Longitude:"",Name:""},Events:{OnMapCreate:null,OnMarkersCreate:null,OnMarkersRemove:function(){},OnGetMarkerPointAsyn:function(){},MarkerClickCallBack:null,IdleCallBack:null,MarkerMouseOverCallBack:null,MarkerMouseOutCallBack:null,ZoomChangesCallBack:null,DragChangesCallBack:null,ClickCallBack:null,InfowindowTooltipReadyCallBack:null,InfowindowReadyCallBack:null,tInfowindowOffsetCallBack:null},Autocomplete:{CreateControl:false,BindToBound:false,Autocompletecontrol:"pac-input"}},createMap:function(){var a=this,b=a.options.MapOptions,d=a.options.MarkerClustererOptions,c={zoom:b.Zoom,center:new google.maps.LatLng(b.Latitude,b.Longitude),zoomControl:b.zoomControl,zoomControlOptions:{style:google.maps.ZoomControlStyle[b.ZoomControlStyle],position:google.maps.ControlPosition[b.zoomControlPosition]},disableDefaultUI:b.disableDefaultUI,draggable:b.Draggable,scrollwheel:b.Scrollwheel,disableDoubleClickZoom:b.DisableDoubleClickZoom,panControl:b.panControl,streetViewControl:b.streetViewControl,overviewMapControl:b.overviewMapControl,maxZoom:a.options.MaxZoom,minZoom:a.options.MinZoom};a.options.CreateMapWrap&&a.createMapWrap();a.map=new google.maps.Map(document.getElementById(b.ContainerName),c);google.maps.Map.prototype.clearOverlays=function(){a.clearOverlays()};jQuery.isFunction(a.options.Events.ClickCallBack)&&google.maps.event.addListener(a.map,"click",function(){a.options.Events.ClickCallBack.call(a)});google.maps.event.addListener(a.map,"dragend",function(){jQuery.isFunction(a.options.Events.DragChangesCallBack)&&a.options.Events.DragChangesCallBack.call(a)});if(window["MarkerClusterer"])a.markerCluster=new MarkerClusterer(a.map,[],d);a.getMarkerPointAsyn();a.CreateOverlay();jQuery.isFunction(a.options.Events.InfowindowTooltipReadyCallBack)&&google.maps.event.addListener(a.infowindowTooltip,"domready",function(){a.options.Events.InfowindowTooltipReadyCallBack.call(a)});jQuery.isFunction(a.options.Events.InfowindowReadyCallBack)&&google.maps.event.addListener(a.infowindow,"domready",function(){a.options.Events.InfowindowReadyCallBack.call(a)});jQuery.isFunction(a.options.Events.ZoomChangesCallBack)&&google.maps.event.addListener(a.map,"zoom_changed",function(){a.options.Events.ZoomChangesCallBack.call(a,a.map.getZoom())});google.maps.event.addListener(a.map,"idle",function(){a.RemoveGoogleInfo();jQuery.isFunction(a.options.Events.IdleCallBack)&&a.options.Events.IdleCallBack.call(a);jQuery.isFunction(a.options.Events.OnMapCreate)&&!a.isMapCreate&&a.options.Events.OnMapCreate();a.isMapCreate=true});google.maps.event.addListenerOnce(a.map,"tilesloaded",a.RemoveGoogleInfo)},createMapWrap:function(){var a=this,b=a.options.MapOptions;jQuery("#"+b.ContainerName).wrap('<div id="nhs_mapwrap" style="position:relative;" />');jQuery("#nhs_mapwrap").append('<div id="nhs_OverlayMap" style="position: absolute;z-index:99999;top: 0px;left: 0px;height:100%;width:100%;background-color: #000;filter: alpha(opacity=35);-moz-opacity: 0.35;opacity: 0.35;"></div>');jQuery("#nhs_mapwrap").append('<div id="nhs_LoadingMap" class="nhs_Loading" style="position:absolute;"><p>Updating</p></div>');a.showLoading()},hideLoading:function(){jQuery("#nhs_LoadingMap, #nhs_OverlayMap").hide();jQuery(".gm-style > div > a").attr("href")&&setTimeout(function(){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")},800)},showLoading:function(){jQuery("#nhs_LoadingMap, #nhs_OverlayMap").show()},clearOverlays:function(){for(var a=this,b=0;b<a.markersArray.length;b++)a.markersArray[b].setMap(null);a.markersArray=[];a.bounds=new google.maps.LatLngBounds;a.markerCluster&&a.markerCluster.clearMarkers();a.options.Events.OnMarkersRemove()},getMarkerPointAsyn:function(){var a=this,b=a.options.MarkerPointAsynOptions;if(b.Listener&&b.UrlServer){a.options.Events.OnGetMarkerPointAsyn(b);google.maps.event.addListener(a.map,b.Listener,function(){a.showLoading();var c=a.getBoundsFromMap();a.map.clearOverlays();jQuery.getJSON(b.UrlServer,c,function(b){a.processResult(b)})})}else a.hideLoading()},getBoundsFromMap:function(){var e=this,a=e.map.getBounds(),b=a.getNorthEast(),c=a.getSouthWest(),d={minLat:c.lat(),minLng:c.lng(),maxLat:b.lat(),maxLng:b.lng()};return d},processResult:function(a){var c=this;c.showLoading();var d=c.options.ProcessResultOptions;if(a!==null)for(var b=0;b<a.length;b++){var e=c.getHtmlInfowindow(a,a[b]),f=c.getIconMarkerPoint(a,a[b]),g=c.getNameMarkerPoint(a,a[b]);c.createMarkerPoint(a[b][d.Latitude],a[b][d.Longitude],g,e,f,a[b])}c.hideLoading()},getHtmlInfowindow:function(){return null},getIconMarkerPoint:function(){return null},getNameMarkerPoint:function(d,b){var c=this,a=c.options.ProcessResultOptions;return b[a.Name]},createMarkerPoint:function(g,h,f,c,d,e){var a=this,b=a._createMarkerPoint(g,h,f,c,d,e);if(a.options.UseClusterer==false)b.setMap(a.map);else a.markerCluster&&a.markerCluster.addMarker(b);a.markersArray.push(b)},_createMarkerPoint:function(j,k,i,d,h,c){var a=this,e=new google.maps.LatLng(j,k),f=a.options.MarkerPointOptions,g={position:e,icon:h,title:i,optimized:f.optimized,zIndex:99};a.bounds.extend(e);var b=new google.maps.Marker(g);jQuery.isFunction(a.options.Events.OnMarkersCreate)&&a.options.Events.OnMarkersCreate(c,a.infowindow,b);typeof d=="string"&&google.maps.event.addListener(b,"click",function(){a.infowindow.setContent(d);a.infowindow.open(a.map,b);jQuery.isFunction(a.options.Events.MarkerClickCallBack)&&a.options.Events.MarkerClickCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});typeof d!="string"&&jQuery.isFunction(a.options.Events.MarkerClickCallBack)&&google.maps.event.addListener(b,"click",function(){a.options.Events.MarkerClickCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});jQuery.isFunction(a.options.Events.MarkerMouseOverCallBack)&&google.maps.event.addListener(b,"mouseover",function(){a.options.Events.MarkerMouseOverCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});jQuery.isFunction(a.options.Events.MarkerMouseOutCallBack)&&google.maps.event.addListener(b,"mouseout",function(){a.options.Events.MarkerMouseOutCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});return b},AutoFit:function(){var a=this;a.map.fitBounds(a.bounds)},CreateOverlay:function(){this.ourOverlay=new google.maps.OverlayView;this.ourOverlay.draw=function(){};this.ourOverlay.setMap(this.map)},GetInfowindowOffset:function(b,f,g,h){var d=0,e=0,a=this.ourOverlay.getProjection().fromLatLngToContainerPixel(h.getPosition()),i=this.ourOverlay.getProjection().fromLatLngToContainerPixel(g.getBounds().getSouthWest()),c=this.ourOverlay.getProjection().fromLatLngToContainerPixel(g.getBounds().getNorthEast());if(a.x<b/2)d=b/2-a.x;else if(a.x>c.x-b/2)d=c.x-b/2-a.x;if(a.y<f)e=a.y+f-(a.y-c.y);else e=a.y+20-(a.y-c.y);return new google.maps.Size(d,e)},GetPixelFromLatLng:function(b){var a=this.map.getProjection(),c=a.fromLatLngToPoint(b);return c},RemoveGoogleInfo:function(){if(jQuery(".gm-style > div > a").attr("href")){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")}}};NHS.Scripts.StateIndex=function(a){this.parameters=a};NHS.Scripts.StateIndex.prototype={init:function(){var b=this,c=this.parameters.OptionsForMap,a=new NHS.Scripts.GoogleMapApi(c);a.options.Events.MarkerClickCallBack=function(a){var c="";if(!a.UserFriendlyUrls)c=b.parameters.url.replace("{market}",a.MarketId);else c=(b.parameters.url.replace("market-{market}",a.StateName)+"/"+a.MarketName+"-area").replace(" ","-").toLowerCase();window.location=c};a.options.Events.MarkerMouseOverCallBack=function(c,d,b,e){var g=c.MarketName+"("+c.TotalCommunities+")",f="<div id=\"nhs_MapCards\"><p style='margin:0;padding:0;'>"+g+"</p></div>";d.close();b.setContent(f);b.open(a.map,e)};a.options.Events.MarkerMouseOutCallBack=function(d,b,a){a.close()};a.options.Events.InfowindowTooltipReady=function(){var b=jQuery("#nhs_MapCards").parent().parent(),c=b.parent().find("> div").first().find("> div");c.first().hide();c.eq(2).hide();b.next("div").hide();var e=b.width()-75,d=b.height()+75;this.infowindowTooltip.setOptions({pixelOffset:this.GetInfowindowOffset(e,d,a.map,this.infowindowTooltip.getAnchor())})};a.getIconMarkerPoint=function(){return b.parameters.icon};a.getNameMarkerPoint=function(c,a){var b=this.options.ProcessResultOptions;return a[b.Name]+"("+a.TotalCommunities+")"};a.createMap();google.maps.event.addListener(a.map,"idle",b.RemoveGoogleInfo);b.processResult(b.parameters.MarketPoints,a);$jq("#nhs_StateBrowseDiv0").css("display","none");$jq("#nhs_StateBrowseDiv1").css("display","none");$jq("#nhs_StateBrowseDiv2").css("display","none");$jq("#nhs_StateBrowseDiv").css("height","250px");$jq("#indexTab1").click(function(){this._switchBoxDisplay("li1","nhs_StateBrowseDiv3","nhs_StateBrowseDiv2","nhs_StateBrowseDiv1","nhs_StateBrowseDiv0");return false}.bind(this));$jq("#indexTab2").click(function(){this._switchBoxDisplay("li2","nhs_StateBrowseDiv2","nhs_StateBrowseDiv1","nhs_StateBrowseDiv3","nhs_StateBrowseDiv0");return false}.bind(this));$jq("#indexTab3").click(function(){this._switchBoxDisplay("li3","nhs_StateBrowseDiv1","nhs_StateBrowseDiv2","nhs_StateBrowseDiv3","nhs_StateBrowseDiv0");return false}.bind(this));$jq("#indexTab4").click(function(){this._switchBoxDisplay("li4","nhs_StateBrowseDiv0","nhs_StateBrowseDiv1","nhs_StateBrowseDiv2","nhs_StateBrowseDiv3");return false}.bind(this));$jq("#btnSearchHomes").click(function(){if($jq("#SelectedMarketId").val()=="0"){alert("Area is required.");return false}});$jq("div#nhs_StateBrowseDiv0 ul li").length==0&&$jq("li#li4").hide();a.AutoFit()},processResult:function(a,c){c.showLoading();var d=c.options.ProcessResultOptions;if(a!==null)for(var b=0;b<a.length;b++){var e=c.getHtmlInfowindow(a,a[b]),f=c.getIconMarkerPoint(a,a[b]);c.createMarkerPoint(a[b][d.Latitude],a[b][d.Longitude],null,e,f,a[b])}c.hideLoading()},_switchBoxDisplay:function(j,k,c,d,e){var i=j,l=document.getElementById(k),f=document.getElementById("li1"),g=document.getElementById("li2"),h=document.getElementById("li3"),b=document.getElementById("li4"),a=document.getElementById("nhs_StateBrowseDiv");if(i=="li1"){f.className="nhs_Selected";g.className=h.className="";if(b)b.className="";$jq("#"+c).hide();$jq("#"+d).hide();$jq("#"+e).hide();a.style.height="auto"}if(i=="li2"){g.className="nhs_Selected";f.className=h.className="";if(b)b.className="";$jq("#"+c).hide();$jq("#"+d).hide();$jq("#"+e).hide();a.style.height="auto";a.style.maxHeight="250px"}if(i=="li3"){h.className="nhs_Selected";f.className=g.className="";if(b)b.className="";$jq("#"+c).hide();$jq("#"+d).hide();$jq("#"+e).hide();a.style.height="auto";a.style.maxHeight="250px"}if(i=="li4"){b.className="nhs_Selected";f.className=g.className=h.className="";$jq("#"+c).hide();$jq("#"+d).hide();$jq("#"+e).hide();a.style.height="auto";a.style.maxHeight="250px"}l.style.display="inline"},RemoveGoogleInfo:function(){if(jQuery(".gm-style > div > a").attr("href")){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")}}}