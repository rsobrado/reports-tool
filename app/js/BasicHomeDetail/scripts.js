if(typeof NHS=="undefined"){NHS={};NHS.Scripts={}}NHS.Scripts.GoogleMapApi=function(b){var a={};jQuery.extend(true,a,this.defaultOptios);this.options=jQuery.extend(true,a,b);this.markersArray=[];this.infowindow=new google.maps.InfoWindow(this.options.InfoWindowOptions);this.infowindowTooltip=new google.maps.InfoWindow(this.options.InfoWindowOptions);this.map=null;this.bounds=new google.maps.LatLngBounds;this.isMapCreate=false};NHS.Scripts.GoogleMapApi.prototype={defaultOptios:{MapOptions:{Latitude:null,Longitude:null,Zoom:8,ContainerName:"map-canvas",zoomControl:true,ZoomControlStyle:"LARGE",zoomControlPosition:null,disableDefaultUI:false,Draggable:true,Scrollwheel:true,DisableDoubleClickZoom:false,panControl:false,overviewControl:false,streetViewControl:false},CreateMapWrap:true,DirectionsDisplayPanel:null,MarkerPointOptions:{optimized:true},Loader:"",MinZoom:3,MaxZoom:null,MarkerClustererOptions:{gridSize:50,maxZoom:15,cssName:null,imagePath:null,zoomOnClick:true,minimumClusterSize:null},UseClusterer:false,InfoWindowOptions:{disableAutoPan:false},MarkerPointAsynOptions:{Listener:"idle",UrlServer:null},ProcessResultOptions:{Latitude:"",Longitude:"",Name:""},Events:{OnMapCreate:null,OnMarkersCreate:null,OnMarkersRemove:function(){},OnGetMarkerPointAsyn:function(){},MarkerClickCallBack:null,IdleCallBack:null,MarkerMouseOverCallBack:null,MarkerMouseOutCallBack:null,ZoomChangesCallBack:null,DragChangesCallBack:null,ClickCallBack:null,InfowindowTooltipReadyCallBack:null,InfowindowReadyCallBack:null,tInfowindowOffsetCallBack:null},Autocomplete:{CreateControl:false,BindToBound:false,Autocompletecontrol:"pac-input"}},createMap:function(){var a=this,b=a.options.MapOptions,d=a.options.MarkerClustererOptions,c={zoom:b.Zoom,center:new google.maps.LatLng(b.Latitude,b.Longitude),zoomControl:b.zoomControl,zoomControlOptions:{style:google.maps.ZoomControlStyle[b.ZoomControlStyle],position:google.maps.ControlPosition[b.zoomControlPosition]},disableDefaultUI:b.disableDefaultUI,draggable:b.Draggable,scrollwheel:b.Scrollwheel,disableDoubleClickZoom:b.DisableDoubleClickZoom,panControl:b.panControl,streetViewControl:b.streetViewControl,overviewMapControl:b.overviewMapControl,maxZoom:a.options.MaxZoom,minZoom:a.options.MinZoom};a.options.CreateMapWrap&&a.createMapWrap();a.map=new google.maps.Map(document.getElementById(b.ContainerName),c);google.maps.Map.prototype.clearOverlays=function(){a.clearOverlays()};jQuery.isFunction(a.options.Events.ClickCallBack)&&google.maps.event.addListener(a.map,"click",function(){a.options.Events.ClickCallBack.call(a)});google.maps.event.addListener(a.map,"dragend",function(){jQuery.isFunction(a.options.Events.DragChangesCallBack)&&a.options.Events.DragChangesCallBack.call(a)});if(window["MarkerClusterer"])a.markerCluster=new MarkerClusterer(a.map,[],d);a.getMarkerPointAsyn();a.CreateOverlay();jQuery.isFunction(a.options.Events.InfowindowTooltipReadyCallBack)&&google.maps.event.addListener(a.infowindowTooltip,"domready",function(){a.options.Events.InfowindowTooltipReadyCallBack.call(a)});jQuery.isFunction(a.options.Events.InfowindowReadyCallBack)&&google.maps.event.addListener(a.infowindow,"domready",function(){a.options.Events.InfowindowReadyCallBack.call(a)});jQuery.isFunction(a.options.Events.ZoomChangesCallBack)&&google.maps.event.addListener(a.map,"zoom_changed",function(){a.options.Events.ZoomChangesCallBack.call(a,a.map.getZoom())});google.maps.event.addListener(a.map,"idle",function(){a.RemoveGoogleInfo();jQuery.isFunction(a.options.Events.IdleCallBack)&&a.options.Events.IdleCallBack.call(a);jQuery.isFunction(a.options.Events.OnMapCreate)&&!a.isMapCreate&&a.options.Events.OnMapCreate();a.isMapCreate=true});google.maps.event.addListenerOnce(a.map,"tilesloaded",a.RemoveGoogleInfo)},createMapWrap:function(){var a=this,b=a.options.MapOptions;jQuery("#"+b.ContainerName).wrap('<div id="nhs_mapwrap" style="position:relative;" />');jQuery("#nhs_mapwrap").append('<div id="nhs_OverlayMap" style="position: absolute;z-index:99999;top: 0px;left: 0px;height:100%;width:100%;background-color: #000;filter: alpha(opacity=35);-moz-opacity: 0.35;opacity: 0.35;"></div>');jQuery("#nhs_mapwrap").append('<div id="nhs_LoadingMap" class="nhs_Loading" style="position:absolute;"><p>Updating</p></div>');a.showLoading()},hideLoading:function(){jQuery("#nhs_LoadingMap, #nhs_OverlayMap").hide();jQuery(".gm-style > div > a").attr("href")&&setTimeout(function(){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")},800)},showLoading:function(){jQuery("#nhs_LoadingMap, #nhs_OverlayMap").show()},clearOverlays:function(){for(var a=this,b=0;b<a.markersArray.length;b++)a.markersArray[b].setMap(null);a.markersArray=[];a.bounds=new google.maps.LatLngBounds;a.markerCluster&&a.markerCluster.clearMarkers();a.options.Events.OnMarkersRemove()},getMarkerPointAsyn:function(){var a=this,b=a.options.MarkerPointAsynOptions;if(b.Listener&&b.UrlServer){a.options.Events.OnGetMarkerPointAsyn(b);google.maps.event.addListener(a.map,b.Listener,function(){a.showLoading();var c=a.getBoundsFromMap();a.map.clearOverlays();jQuery.getJSON(b.UrlServer,c,function(b){a.processResult(b)})})}else a.hideLoading()},getBoundsFromMap:function(){var e=this,a=e.map.getBounds(),b=a.getNorthEast(),c=a.getSouthWest(),d={minLat:c.lat(),minLng:c.lng(),maxLat:b.lat(),maxLng:b.lng()};return d},processResult:function(a){var c=this;c.showLoading();var d=c.options.ProcessResultOptions;if(a!==null)for(var b=0;b<a.length;b++){var e=c.getHtmlInfowindow(a,a[b]),f=c.getIconMarkerPoint(a,a[b]),g=c.getNameMarkerPoint(a,a[b]);c.createMarkerPoint(a[b][d.Latitude],a[b][d.Longitude],g,e,f,a[b])}c.hideLoading()},getHtmlInfowindow:function(){return null},getIconMarkerPoint:function(){return null},getNameMarkerPoint:function(d,b){var c=this,a=c.options.ProcessResultOptions;return b[a.Name]},createMarkerPoint:function(g,h,f,c,d,e){var a=this,b=a._createMarkerPoint(g,h,f,c,d,e);if(a.options.UseClusterer==false)b.setMap(a.map);else a.markerCluster&&a.markerCluster.addMarker(b);a.markersArray.push(b)},_createMarkerPoint:function(j,k,i,d,h,c){var a=this,e=new google.maps.LatLng(j,k),f=a.options.MarkerPointOptions,g={position:e,icon:h,title:i,optimized:f.optimized,zIndex:99};a.bounds.extend(e);var b=new google.maps.Marker(g);jQuery.isFunction(a.options.Events.OnMarkersCreate)&&a.options.Events.OnMarkersCreate(c,a.infowindow,b);typeof d=="string"&&google.maps.event.addListener(b,"click",function(){a.infowindow.setContent(d);a.infowindow.open(a.map,b);jQuery.isFunction(a.options.Events.MarkerClickCallBack)&&a.options.Events.MarkerClickCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});typeof d!="string"&&jQuery.isFunction(a.options.Events.MarkerClickCallBack)&&google.maps.event.addListener(b,"click",function(){a.options.Events.MarkerClickCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});jQuery.isFunction(a.options.Events.MarkerMouseOverCallBack)&&google.maps.event.addListener(b,"mouseover",function(){a.options.Events.MarkerMouseOverCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});jQuery.isFunction(a.options.Events.MarkerMouseOutCallBack)&&google.maps.event.addListener(b,"mouseout",function(){a.options.Events.MarkerMouseOutCallBack.call(a,c,a.infowindow,a.infowindowTooltip,b)});return b},AutoFit:function(){var a=this;a.map.fitBounds(a.bounds)},CreateOverlay:function(){this.ourOverlay=new google.maps.OverlayView;this.ourOverlay.draw=function(){};this.ourOverlay.setMap(this.map)},GetInfowindowOffset:function(b,f,g,h){var d=0,e=0,a=this.ourOverlay.getProjection().fromLatLngToContainerPixel(h.getPosition()),i=this.ourOverlay.getProjection().fromLatLngToContainerPixel(g.getBounds().getSouthWest()),c=this.ourOverlay.getProjection().fromLatLngToContainerPixel(g.getBounds().getNorthEast());if(a.x<b/2)d=b/2-a.x;else if(a.x>c.x-b/2)d=c.x-b/2-a.x;if(a.y<f)e=a.y+f-(a.y-c.y);else e=a.y+20-(a.y-c.y);return new google.maps.Size(d,e)},GetPixelFromLatLng:function(b){var a=this.map.getProjection(),c=a.fromLatLngToPoint(b);return c},RemoveGoogleInfo:function(){if(jQuery(".gm-style > div > a").attr("href")){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")}}};NHS.Scripts.GoogleMapApi.prototype.initializeAutoComplete=function(){var a=this,b;if(a.options.Autocomplete.CreateControl)b=a.createControles();else b=document.getElementById(a.options.Autocomplete.Autocompletecontrol);jQuery(b).on("paste",function(){return setTimeout(function(){var a,c;a=jQuery(b);c=a.val();a.focus();a.val(c);return a.focus()},1)});var c=new google.maps.places.Autocomplete(b);a.options.Autocomplete.CreateControl&&a.initializeAutoCompleteControles(c);a.options.Autocomplete.BindToBound&&c.bindTo("bounds",a.map);var d=new google.maps.Marker({map:a.map});google.maps.event.addListener(c,"place_changed",function(){a.placeChangedProcess(d,c)})};NHS.Scripts.GoogleMapApi.prototype.placeChangedProcess=function(c,e){var b=this;b.infowindow.close();c.setVisible(false);var a=e.getPlace();if(!a.geometry)return;if(a.geometry.viewport)b.map.fitBounds(a.geometry.viewport);else{b.map.setCenter(a.geometry.location);b.map.setZoom(17)}var f=b.iconAutoComplite(a);c.setIcon(f);c.setPosition(a.geometry.location);c.setVisible(true);var d="";if(a.address_components)d=[a.address_components[0]&&a.address_components[0].short_name||"",a.address_components[1]&&a.address_components[1].short_name||"",a.address_components[2]&&a.address_components[2].short_name||""].join(" ");b.infowindow.setContent("<div><strong>"+a.name+"</strong><br>"+d);b.infowindow.open(b.map,c)};NHS.Scripts.GoogleMapApi.prototype.iconAutoComplite=function(a){var b={url:a.icon,size:new google.maps.Size(71,71),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(17,34),scaledSize:new google.maps.Size(35,35)};return b};NHS.Scripts.GoogleMapApi.prototype.createControles=function(){var c=this,a=document.getElementById(c.options.MapOptions.ContainerName),b=jQuery('<div><input id="pac-input" class="controls" type="text" placeholder="Enter a location" / ><div id="type-selector" class="controls"><input type="radio" name="type" id="changetype-all" checked="checked"><label for="changetype-all">All</label><input type="radio" name="type" id="changetype-establishment"><label for="changetype-establishment">Establishments</label><input type="radio" name="type" id="changetype-geocode"><label for="changetype-geocode">Geocodes</label></div></div>')[0];a.parentNode.insertBefore(b,a.nextSibling);return document.getElementById("pac-input")};NHS.Scripts.GoogleMapApi.prototype.initializeAutoCompleteControles=function(a){var b=this;jQuery("#changetype-all").change(function(){a.setTypes([])});jQuery("#changetype-establishment").change(function(){a.setTypes(["establishment"])});jQuery("#changetype-geocode").change(function(){a.setTypes(["geocode"])});var c=document.getElementById("pac-input"),d=document.getElementById("type-selector");b.map.controls[google.maps.ControlPosition.TOP_LEFT].push(c);b.map.controls[google.maps.ControlPosition.TOP_LEFT].push(d)};NHS.Scripts.GooglePropertyMap=function(a){this.parameters=a;this.isMapCreate=false;this.log=new NHS.Scripts.Globals.EventLogger({siteRoot:a.siteRoot,fromPage:a.fromPage,partnerId:a.partnerId,marketId:a.marketId})};NHS.Scripts.GooglePropertyMap.prototype={init:function(){jQuery("#dd-collapsible").hide();jQuery("#nhs_propertyMapCollapsibleClose").hide();var a=this,c=a.parameters,d=this.parameters.OptionsForMap,b=new NHS.Scripts.GoogleMapApi(d);b.initializeAutoComplete();b.getIconMarkerPoint=function(b,a){if(a.MarketPoints.length>1)return c.iconNearByCommMulti;return c.iconNearByComm};b.options.Events.MarkerClickCallBack=function(a,e,h,g){if(a){for(var f=[],d=0;d<a.MarketPoints.length;d++)f.push(a.MarketPoints[d]["CommunityId"]+"|"+0);jQuery.ajax({url:c.getCommunityMapCards,type:"GET",data:{commIds:f.join(),basicIds:""},success:function(a){if(a){e.setContent(a);e.open(b.map,g);tb_initLive("a.thickbox")}}})}};b.placeChangedProcess=function(d,b){var c=b.getPlace();a.location=c.geometry.location};jQuery("#nhs_PropertyMap").width(c.mapWidth).height(c.mapHeight);jQuery("#nhs_propertyMapCollapsibleOpen, #nhs_mapTab").click(function(c){jQuery.NhsCancelEvent(c);jQuery("#dd-collapsible").css("display")=="none"&&jQuery("#dd-collapsible").toggle("fast");jQuery("#nhs_propertyMapCollapsibleOpen").hide();jQuery("#nhs_propertyMapCollapsibleClose").show();a.isMapCreate&&a.log.logMultiEvent("BLMAPV",a.parameters.communityId,a.parameters.builderId,0,0);if(!a.isMapCreate){a.isMapCreate=true;b.createMap();a.parameters.NearbyComms&&b.processResult(a.parameters.NearbyComms);google.maps.event.addListener(b.map,"idle",a.RemoveGoogleInfo);b.createMarkerPoint(d.MapOptions.Latitude,d.MapOptions.Longitude,null,null,a.parameters.icon,null);a.logClickEvent_propertyMapExpand()}});jQuery("#nhs_propertyMapCollapsibleClose").click(function(a){jQuery.NhsCancelEvent(a);jQuery("#dd-collapsible").toggle("fast");jQuery("#nhs_propertyMapCollapsibleClose").hide();jQuery("#nhs_propertyMapCollapsibleOpen").show()});a.InitDrivingDirection()},logClickEvent_propertyMapExpand:function(){var a=this,b=NHS.Scripts.Helper.readCookie("drivingDirectionsClicked");if(!parseInt(b)){if(a.parameters.isBasicCommunity){a.log.logMultiEvent("bcMapSectionReveal",a.parameters.communityId,a.parameters.builderId,0,0);jQuery.googlepush("Basic Listing","Driving Directions",a.parameters.communityId,2,false)}else if(!a.parameters.isBasicListing)if(a.parameters.specId>0||a.parameters.planId>0)a.log.logMultiEvent("HDSDD",a.parameters.communityId,a.parameters.builderId,a.parameters.planId,a.parameters.specId);else a.log.logMultiEvent("CDSDD",a.parameters.communityId,a.parameters.builderId,0,0);NHS.Scripts.Helper.createCookie("drivingDirectionsClicked",1,0)}},InitDrivingDirection:function(){var a=this,b=new Date,c=b.getMonth(),d=b.getDate(),e=b.getFullYear();jQuery("#nhs_drivingDirections").show();jQuery("#tabMQMap a").click(function(){if(!jQuery("#nhs_PropertyMap").is(":visible")){jQuery("#nhs_PropertyMap").toggle();jQuery(this).toggleClass("On");jQuery(jQuery("#tabBuilderMap").find("a")[0]).toggleClass("On");jQuery("#nhs_BuilderPropertyMap").toggle();jQuery("#nhs_drivingDirections").hide();jQuery("#nhs_GetDirections").show();jQuery("#nhs_drivingDirections").show()}return false});jQuery("#tabBuilderMap a").click(function(){if(!jQuery("#nhs_BuilderPropertyMap").is(":visible")){jQuery("#nhs_BuilderPropertyMap").toggle();jQuery(this).toggleClass("On");jQuery(jQuery("#tabMQMap").find("a")[0]).toggleClass("On");jQuery("#nhs_PropertyMap").toggle();jQuery("#nhs_drivingDirections").show();jQuery("#nhs_GetDirections").hide();jQuery("#nhs_drivingDirections").show()}var b=NHS.Scripts.Helper.readCookie("drivingDirectionsBuilderMapClicked");if(!b){if(!a.parameters.isBasicListing||!a.parameters.isBasicCommunity)if(a.parameters.specId>0||a.parameters.planId>0)a.log.logMultiEvent("HDSDD",a.parameters.communityId,a.parameters.builderId,a.parameters.planId,a.parameters.specId);else a.log.logMultiEvent("CDSDD",a.parameters.communityId,a.parameters.builderId,0,0);NHS.Scripts.Helper.createCookie("drivingDirectionsBuilderMapClicked",1,0)}return false});jQuery("#nhsTxtDate").kendoDatePicker({min:new Date,change:function(){var d=kendo.toString(this.value(),"d"),b=jQuery(".btn_NhsMapSend"),a=b.attr("href");if(typeof a!="undefined"){var c=a.substring(a.indexOf("=")+1,a.indexOf("&"));b.attr("href",encodeURI(a.replace(c,d)))}},month:{empty:'<div class="kdp-outofdayarray">#= data.value #</div>'}});jQuery("#nhsTxtDate").attr("disabled","disabled");jQuery("#btnUpdate").click(function(){if(a.parameters.isBasicCommunity){a.log.logMultiEvent("bcRoute",a.parameters.communityId,a.parameters.builderId,a.parameters.planId,a.parameters.specId);jQuery.googlepush("Basic Listing","Driving Route",a.parameters.communityId,4,false)}else if(!a.parameters.isBasicListing)if(a.parameters.specId>0||a.parameters.planId>0){a.log.logMultiEvent("HDSHWRT",a.parameters.communityId,a.parameters.builderId,a.parameters.planId,a.parameters.specId);a.log.logMultiEvent("HDSDD",a.parameters.communityId,a.parameters.builderId,a.parameters.planId,a.parameters.specId)}else{a.log.logMultiEvent("CDSHWRT",a.parameters.communityId,a.parameters.builderId,0,0);a.log.logMultiEvent("CDSDD",a.parameters.communityId,a.parameters.builderId,0,0)}if(a.location){var c=(screen.width-840)/2,d=(screen.height-600)/2,b=jQuery("#nhsTxtStreeAddress").val();jQuery("#nhsWrongAddress").hide();var f=a.parameters.drivingDirectionAction+"?communityId="+a.parameters.communityId+"&lat="+a.location.lat()+"&lng="+a.location.lng()+"&check=false&isBasicListing="+a.parameters.isBasicListing+"&startingPoint="+b;jQuery.SetDataLayerPair("siteDrivingRoute");window.open(f,"_blank","width=840,height=600,top="+d+",left="+c+",menubar=yes,status=no,location=no,toolbar=no,scrollbars=yes")}else{var b=jQuery("#nhsTxtStreeAddress").val(),e=new google.maps.Geocoder;e.geocode({address:b},function(e,f){if(f==google.maps.GeocoderStatus.OK){var g=a.parameters.drivingDirectionAction+"?communityId="+a.parameters.communityId+"&lat="+e[0].geometry.location.lat()+"&lng="+e[0].geometry.location.lng()+"&check=false&isBasicListing="+a.parameters.isBasicListing+"&startingPoint="+b;jQuery.SetDataLayerPair("siteDrivingRoute");window.open(g,"_blank","width=840,height=600,top="+d+",left="+c+",menubar=yes,status=no,location=no,toolbar=no,scrollbars=yes")}else jQuery("#nhsWrongAddress").show()})}return false})},RemoveGoogleInfo:function(){if(jQuery(".gm-style > div > a").attr("href")){for(var b=jQuery(".gm-style-cc").length,a=1;a<b;a+=1)jQuery(".gm-style-cc").eq("-1").remove();jQuery(".gm-style > div > a").removeAttr("href").removeAttr("title")}}};NHS.Scripts.PropertyMap.NearbyComms=function(a){this._communityId=a.communityId;this._builderId=a.builderId;this._planId=a.specId>0?0:a.planId;this._specId=a.specId;this._log=new NHS.Scripts.Globals.EventLogger({siteRoot:a.siteRoot,fromPage:a.fromPage,partnerId:a.partnerId,marketId:a.marketId})};NHS.Scripts.PropertyMap.NearbyComms.prototype={get_log:function(){return this._log},attachClickEventsToCommLinks:function(){$jq(".nhs_NearbyImgBox a").click(function(){attachLogEventToHomesNearby(this)}.bind(this));$jq(".nhs_selector a").click(function(){attachLogEventToHomesNearby(this)}.bind(this))}};Encoder={EncodeType:"entity",isEmpty:function(a){if(a)return a===null||a.length==0||/^\s+$/.test(a);else return true},HTML2Numerical:function(c){var a=["&nbsp;","&iexcl;","&cent;","&pound;","&curren;","&yen;","&brvbar;","&sect;","&uml;","&copy;","&ordf;","&laquo;","&not;","&shy;","&reg;","&macr;","&deg;","&plusmn;","&sup2;","&sup3;","&acute;","&micro;","&para;","&middot;","&cedil;","&sup1;","&ordm;","&raquo;","&frac14;","&frac12;","&frac34;","&iquest;","&agrave;","&aacute;","&acirc;","&atilde;","&Auml;","&aring;","&aelig;","&ccedil;","&egrave;","&eacute;","&ecirc;","&euml;","&igrave;","&iacute;","&icirc;","&iuml;","&eth;","&ntilde;","&ograve;","&oacute;","&ocirc;","&otilde;","&Ouml;","&times;","&oslash;","&ugrave;","&uacute;","&ucirc;","&Uuml;","&yacute;","&thorn;","&szlig;","&agrave;","&aacute;","&acirc;","&atilde;","&auml;","&aring;","&aelig;","&ccedil;","&egrave;","&eacute;","&ecirc;","&euml;","&igrave;","&iacute;","&icirc;","&iuml;","&eth;","&ntilde;","&ograve;","&oacute;","&ocirc;","&otilde;","&ouml;","&divide;","&Oslash;","&ugrave;","&uacute;","&ucirc;","&uuml;","&yacute;","&thorn;","&yuml;","&quot;","&amp;","&lt;","&gt;","&oelig;","&oelig;","&scaron;","&scaron;","&yuml;","&circ;","&tilde;","&ensp;","&emsp;","&thinsp;","&zwnj;","&zwj;","&lrm;","&rlm;","&ndash;","&mdash;","&lsquo;","&rsquo;","&sbquo;","&ldquo;","&rdquo;","&bdquo;","&dagger;","&dagger;","&permil;","&lsaquo;","&rsaquo;","&euro;","&fnof;","&alpha;","&beta;","&gamma;","&delta;","&epsilon;","&zeta;","&eta;","&theta;","&iota;","&kappa;","&lambda;","&mu;","&nu;","&xi;","&omicron;","&pi;","&rho;","&sigma;","&tau;","&upsilon;","&phi;","&chi;","&psi;","&omega;","&alpha;","&beta;","&gamma;","&delta;","&epsilon;","&zeta;","&eta;","&theta;","&iota;","&kappa;","&lambda;","&mu;","&nu;","&xi;","&omicron;","&pi;","&rho;","&sigmaf;","&sigma;","&tau;","&upsilon;","&phi;","&chi;","&psi;","&omega;","&thetasym;","&upsih;","&piv;","&bull;","&hellip;","&prime;","&prime;","&oline;","&frasl;","&weierp;","&image;","&real;","&trade;","&alefsym;","&larr;","&uarr;","&rarr;","&darr;","&harr;","&crarr;","&larr;","&uarr;","&rarr;","&darr;","&harr;","&forall;","&part;","&exist;","&empty;","&nabla;","&isin;","&notin;","&ni;","&prod;","&sum;","&minus;","&lowast;","&radic;","&prop;","&infin;","&ang;","&and;","&or;","&cap;","&cup;","&int;","&there4;","&sim;","&cong;","&asymp;","&ne;","&equiv;","&le;","&ge;","&sub;","&sup;","&nsub;","&sube;","&supe;","&oplus;","&otimes;","&perp;","&sdot;","&lceil;","&rceil;","&lfloor;","&rfloor;","&lang;","&rang;","&loz;","&spades;","&clubs;","&hearts;","&diams;"],b=["&#160;","&#161;","&#162;","&#163;","&#164;","&#165;","&#166;","&#167;","&#168;","&#169;","&#170;","&#171;","&#172;","&#173;","&#174;","&#175;","&#176;","&#177;","&#178;","&#179;","&#180;","&#181;","&#182;","&#183;","&#184;","&#185;","&#186;","&#187;","&#188;","&#189;","&#190;","&#191;","&#192;","&#193;","&#194;","&#195;","&#196;","&#197;","&#198;","&#199;","&#200;","&#201;","&#202;","&#203;","&#204;","&#205;","&#206;","&#207;","&#208;","&#209;","&#210;","&#211;","&#212;","&#213;","&#214;","&#215;","&#216;","&#217;","&#218;","&#219;","&#220;","&#221;","&#222;","&#223;","&#224;","&#225;","&#226;","&#227;","&#228;","&#229;","&#230;","&#231;","&#232;","&#233;","&#234;","&#235;","&#236;","&#237;","&#238;","&#239;","&#240;","&#241;","&#242;","&#243;","&#244;","&#245;","&#246;","&#247;","&#248;","&#249;","&#250;","&#251;","&#252;","&#253;","&#254;","&#255;","&#34;","&#38;","&#60;","&#62;","&#338;","&#339;","&#352;","&#353;","&#376;","&#710;","&#732;","&#8194;","&#8195;","&#8201;","&#8204;","&#8205;","&#8206;","&#8207;","&#8211;","&#8212;","&#8216;","&#8217;","&#8218;","&#8220;","&#8221;","&#8222;","&#8224;","&#8225;","&#8240;","&#8249;","&#8250;","&#8364;","&#402;","&#913;","&#914;","&#915;","&#916;","&#917;","&#918;","&#919;","&#920;","&#921;","&#922;","&#923;","&#924;","&#925;","&#926;","&#927;","&#928;","&#929;","&#931;","&#932;","&#933;","&#934;","&#935;","&#936;","&#937;","&#945;","&#946;","&#947;","&#948;","&#949;","&#950;","&#951;","&#952;","&#953;","&#954;","&#955;","&#956;","&#957;","&#958;","&#959;","&#960;","&#961;","&#962;","&#963;","&#964;","&#965;","&#966;","&#967;","&#968;","&#969;","&#977;","&#978;","&#982;","&#8226;","&#8230;","&#8242;","&#8243;","&#8254;","&#8260;","&#8472;","&#8465;","&#8476;","&#8482;","&#8501;","&#8592;","&#8593;","&#8594;","&#8595;","&#8596;","&#8629;","&#8656;","&#8657;","&#8658;","&#8659;","&#8660;","&#8704;","&#8706;","&#8707;","&#8709;","&#8711;","&#8712;","&#8713;","&#8715;","&#8719;","&#8721;","&#8722;","&#8727;","&#8730;","&#8733;","&#8734;","&#8736;","&#8743;","&#8744;","&#8745;","&#8746;","&#8747;","&#8756;","&#8764;","&#8773;","&#8776;","&#8800;","&#8801;","&#8804;","&#8805;","&#8834;","&#8835;","&#8836;","&#8838;","&#8839;","&#8853;","&#8855;","&#8869;","&#8901;","&#8968;","&#8969;","&#8970;","&#8971;","&#9001;","&#9002;","&#9674;","&#9824;","&#9827;","&#9829;","&#9830;"];return this.swapArrayVals(c,a,b)},NumericalToHTML:function(c){var a=["&#160;","&#161;","&#162;","&#163;","&#164;","&#165;","&#166;","&#167;","&#168;","&#169;","&#170;","&#171;","&#172;","&#173;","&#174;","&#175;","&#176;","&#177;","&#178;","&#179;","&#180;","&#181;","&#182;","&#183;","&#184;","&#185;","&#186;","&#187;","&#188;","&#189;","&#190;","&#191;","&#192;","&#193;","&#194;","&#195;","&#196;","&#197;","&#198;","&#199;","&#200;","&#201;","&#202;","&#203;","&#204;","&#205;","&#206;","&#207;","&#208;","&#209;","&#210;","&#211;","&#212;","&#213;","&#214;","&#215;","&#216;","&#217;","&#218;","&#219;","&#220;","&#221;","&#222;","&#223;","&#224;","&#225;","&#226;","&#227;","&#228;","&#229;","&#230;","&#231;","&#232;","&#233;","&#234;","&#235;","&#236;","&#237;","&#238;","&#239;","&#240;","&#241;","&#242;","&#243;","&#244;","&#245;","&#246;","&#247;","&#248;","&#249;","&#250;","&#251;","&#252;","&#253;","&#254;","&#255;","&#34;","&#38;","&#60;","&#62;","&#338;","&#339;","&#352;","&#353;","&#376;","&#710;","&#732;","&#8194;","&#8195;","&#8201;","&#8204;","&#8205;","&#8206;","&#8207;","&#8211;","&#8212;","&#8216;","&#8217;","&#8218;","&#8220;","&#8221;","&#8222;","&#8224;","&#8225;","&#8240;","&#8249;","&#8250;","&#8364;","&#402;","&#913;","&#914;","&#915;","&#916;","&#917;","&#918;","&#919;","&#920;","&#921;","&#922;","&#923;","&#924;","&#925;","&#926;","&#927;","&#928;","&#929;","&#931;","&#932;","&#933;","&#934;","&#935;","&#936;","&#937;","&#945;","&#946;","&#947;","&#948;","&#949;","&#950;","&#951;","&#952;","&#953;","&#954;","&#955;","&#956;","&#957;","&#958;","&#959;","&#960;","&#961;","&#962;","&#963;","&#964;","&#965;","&#966;","&#967;","&#968;","&#969;","&#977;","&#978;","&#982;","&#8226;","&#8230;","&#8242;","&#8243;","&#8254;","&#8260;","&#8472;","&#8465;","&#8476;","&#8482;","&#8501;","&#8592;","&#8593;","&#8594;","&#8595;","&#8596;","&#8629;","&#8656;","&#8657;","&#8658;","&#8659;","&#8660;","&#8704;","&#8706;","&#8707;","&#8709;","&#8711;","&#8712;","&#8713;","&#8715;","&#8719;","&#8721;","&#8722;","&#8727;","&#8730;","&#8733;","&#8734;","&#8736;","&#8743;","&#8744;","&#8745;","&#8746;","&#8747;","&#8756;","&#8764;","&#8773;","&#8776;","&#8800;","&#8801;","&#8804;","&#8805;","&#8834;","&#8835;","&#8836;","&#8838;","&#8839;","&#8853;","&#8855;","&#8869;","&#8901;","&#8968;","&#8969;","&#8970;","&#8971;","&#9001;","&#9002;","&#9674;","&#9824;","&#9827;","&#9829;","&#9830;"],b=["&nbsp;","&iexcl;","&cent;","&pound;","&curren;","&yen;","&brvbar;","&sect;","&uml;","&copy;","&ordf;","&laquo;","&not;","&shy;","&reg;","&macr;","&deg;","&plusmn;","&sup2;","&sup3;","&acute;","&micro;","&para;","&middot;","&cedil;","&sup1;","&ordm;","&raquo;","&frac14;","&frac12;","&frac34;","&iquest;","&agrave;","&aacute;","&acirc;","&atilde;","&Auml;","&aring;","&aelig;","&ccedil;","&egrave;","&eacute;","&ecirc;","&euml;","&igrave;","&iacute;","&icirc;","&iuml;","&eth;","&ntilde;","&ograve;","&oacute;","&ocirc;","&otilde;","&Ouml;","&times;","&oslash;","&ugrave;","&uacute;","&ucirc;","&Uuml;","&yacute;","&thorn;","&szlig;","&agrave;","&aacute;","&acirc;","&atilde;","&auml;","&aring;","&aelig;","&ccedil;","&egrave;","&eacute;","&ecirc;","&euml;","&igrave;","&iacute;","&icirc;","&iuml;","&eth;","&ntilde;","&ograve;","&oacute;","&ocirc;","&otilde;","&ouml;","&divide;","&Oslash;","&ugrave;","&uacute;","&ucirc;","&uuml;","&yacute;","&thorn;","&yuml;","&quot;","&amp;","&lt;","&gt;","&oelig;","&oelig;","&scaron;","&scaron;","&yuml;","&circ;","&tilde;","&ensp;","&emsp;","&thinsp;","&zwnj;","&zwj;","&lrm;","&rlm;","&ndash;","&mdash;","&lsquo;","&rsquo;","&sbquo;","&ldquo;","&rdquo;","&bdquo;","&dagger;","&dagger;","&permil;","&lsaquo;","&rsaquo;","&euro;","&fnof;","&alpha;","&beta;","&gamma;","&delta;","&epsilon;","&zeta;","&eta;","&theta;","&iota;","&kappa;","&lambda;","&mu;","&nu;","&xi;","&omicron;","&pi;","&rho;","&sigma;","&tau;","&upsilon;","&phi;","&chi;","&psi;","&omega;","&alpha;","&beta;","&gamma;","&delta;","&epsilon;","&zeta;","&eta;","&theta;","&iota;","&kappa;","&lambda;","&mu;","&nu;","&xi;","&omicron;","&pi;","&rho;","&sigmaf;","&sigma;","&tau;","&upsilon;","&phi;","&chi;","&psi;","&omega;","&thetasym;","&upsih;","&piv;","&bull;","&hellip;","&prime;","&prime;","&oline;","&frasl;","&weierp;","&image;","&real;","&trade;","&alefsym;","&larr;","&uarr;","&rarr;","&darr;","&harr;","&crarr;","&larr;","&uarr;","&rarr;","&darr;","&harr;","&forall;","&part;","&exist;","&empty;","&nabla;","&isin;","&notin;","&ni;","&prod;","&sum;","&minus;","&lowast;","&radic;","&prop;","&infin;","&ang;","&and;","&or;","&cap;","&cup;","&int;","&there4;","&sim;","&cong;","&asymp;","&ne;","&equiv;","&le;","&ge;","&sub;","&sup;","&nsub;","&sube;","&supe;","&oplus;","&otimes;","&perp;","&sdot;","&lceil;","&rceil;","&lfloor;","&rfloor;","&lang;","&rang;","&loz;","&spades;","&clubs;","&hearts;","&diams;"];return this.swapArrayVals(c,a,b)},numEncode:function(c){if(this.isEmpty(c))return "";for(var d="",b=0;b<c.length;b++){var a=c.charAt(b);if(a<" "||a>"~")a="&#"+a.charCodeAt()+";";d+=a}return d},htmlDecode:function(e){var c,b,a=e;if(this.isEmpty(a))return "";a=this.HTML2Numerical(a);arr=a.match(/&#[0-9]{1,5};/g);if(arr!=null)for(var d=0;d<arr.length;d++){b=arr[d];c=b.substring(2,b.length-1);if(c>=-32768&&c<=65535)a=a.replace(b,String.fromCharCode(c));else a=a.replace(b,"")}return a},htmlEncode:function(a,b){if(this.isEmpty(a))return "";b=b|false;if(b)if(this.EncodeType=="numerical")a=a.replace(/&/g,"&#38;");else a=a.replace(/&/g,"&amp;");a=this.XSSEncode(a,false);if(this.EncodeType=="numerical"||!b)a=this.HTML2Numerical(a);a=this.numEncode(a);if(!b){a=a.replace(/&#/g,"##AMPHASH##");if(this.EncodeType=="numerical")a=a.replace(/&/g,"&#38;");else a=a.replace(/&/g,"&amp;");a=a.replace(/##AMPHASH##/g,"&#")}a=a.replace(/&#\d*([^\d;]|$)/g,"$1");if(!b)a=this.correctEncoding(a);if(this.EncodeType=="entity")a=this.NumericalToHTML(a);return a},XSSEncode:function(a,b){if(!this.isEmpty(a)){b=b||true;if(b){a=a.replace(/\'/g,"&#39;");a=a.replace(/\"/g,"&quot;");a=a.replace(/</g,"&lt;");a=a.replace(/>/g,"&gt;")}else{a=a.replace(/\'/g,"&#39;");a=a.replace(/\"/g,"&#34;");a=a.replace(/</g,"&#60;");a=a.replace(/>/g,"&#62;")}return a}else return ""},hasEncoded:function(a){if(/&#[0-9]{1,5};/g.test(a))return true;else if(/&[A-Z]{2,6};/gi.test(a))return true;else return false},stripUnicode:function(a){return a.replace(/[^\x20-\x7E]/g,"")},correctEncoding:function(a){return a.replace(/(&amp;)(amp;)+/,"$1")},swapArrayVals:function(b,a,d){if(this.isEmpty(b))return "";var e;if(a&&d)if(a.length==d.length)for(var c=0,f=a.length;c<f;c++){e=new RegExp(a[c],"g");b=b.replace(e,d[c])}return b},inArray:function(c,b){for(var a=0,d=b.length;a<d;a++)if(b[a]===c)return a;return -1}};NHS.Scripts.CommunityDetail.BasicHome=function(a){this._parameter=a;this._log=new NHS.Scripts.Globals.EventLogger({siteRoot:a.siteRoot,partnerId:a.partnerId,marketId:a.marketId})};NHS.Scripts.CommunityDetail.BasicHome.prototype={get_log:function(){return this._log},initialize:function(){var a=this;this._parameter.feedProviderId==1&&a.get_log().logListHubEvent(this._parameter.listHubProviderId,this._parameter.listHubTestLogging,this._parameter.desckey,this._parameter.basicListingNumber);this.get_log().logBasicListingEvent("BLDetail",this._parameter.communityId);var b=new NHS.Scripts.GooglePropertyMap(this._parameter.mapParametes);b.init();var c={brandPartnerId:this._parameter.brandPartnerId,marketId:this._parameter.marketId,siteRoot:this._parameter.siteRoot,partnerId:this._parameter.partnerId,specId:this._parameter.specId,planId:this._parameter.planId,communityId:this._parameter.communityId,builderId:this._parameter.builderId};nearbyHomes=new NHS.Scripts.PropertyMap.NearbyComms(c);nearbyHomes.attachClickEventsToCommLinks();$jq("#nhs_propertyMapCollapsibleOpen").click();$jq("#nhs_PhoneLink").click(function(){var b=$jq("#nhs_LnkPhoneNum");if(b===null)return;b.hide();$jq("#nhs_FormPhone").show();jQuery.SetDataLayerPair("sitePhoneNumV");a.get_log().logBasicListingEvent(a._parameter.logevent,a._parameter.builderId);a._parameter.feedProviderId==1&&a.get_log().logListHubEvent(a._parameter.listHubProviderId,a._parameter.listHubTestLogging,a._parameter.AgentPhoneClicked,a._parameter.basicListingNumber)});$jq("#btnUpdate").click(function(){a.get_log().logBasicListingEvent(a._parameter.logeventShowRoute,a._parameter.builderId)});$jq("#nhs_detailDescriptionToggle").click(function(){if($jq("#nhs_detailDescriptionToggle").text().trim()=="...more"){$jq("#nhs_detailDescriptionToggle").text("less");$jq("#nhsDetailDescriptionArea").html("");$jq("#nhsDetailDescriptionArea").html(Encoder.htmlDecode(description));return false}else{$jq("#nhs_detailDescriptionToggle").text("...more");$jq("#nhsDetailDescriptionArea").html("");$jq("#nhsDetailDescriptionArea").html(Encoder.htmlDecode(chunkedDescription));return false}});this._updateAdsPosition()},_updateAdsPosition:function(){if(jQuery(".nhs_Content").length>0&jQuery("#nhs_AdColumn").length>0){var a=jQuery(".nhs_Content").height();this._adsHeight=jQuery("#nhs_AdColumn").height();var d=a+jQuery("#nhs_AdColumn").offset().top,f=a-this._adsHeight-10,c=this._adsHeight+jQuery("#nhs_AdColumn").offset().top,b=jQuery(window).height(),e;jQuery(window).scroll(function(){var g=jQuery(document).scrollTop();a=jQuery(".nhs_Content").height();d=a+jQuery("#nhs_AdColumn").offset().top;f=a-this._adsHeight-10;c=this._adsHeight+jQuery("#nhs_AdColumn").offset().top;b=jQuery(window).height();e=g+b;if(d>c)if(g>=c-b)if(e>d){jQuery("#nhs_AdColumn > div").removeClass("fixedBottom");jQuery("#nhs_AdColumn > div").addClass("absolute");jQuery("#nhs_AdColumn > div").css("top",f+"px");jQuery("#nhs_AdColumn > div").css("bottom","auto")}else{jQuery("#nhs_AdColumn > div").removeClass("absolute");jQuery("#nhs_AdColumn > div").addClass("fixedBottom");jQuery("#nhs_AdColumn > div").css("top","auto");jQuery("#nhs_AdColumn > div").css("bottom",0)}else{jQuery("#nhs_AdColumn > div").removeClass("fixedBottom");jQuery("#nhs_AdColumn > div").removeClass("absolute");jQuery("#nhs_AdColumn > div").css("top","auto");jQuery("#nhs_AdColumn > div").css("bottom","auto")}}.bind(this))}}};NHS.Scripts.SendToPhone=function(){};NHS.Scripts.SendToPhone.prototype={initialize:function(a){if(a===undefined)a="Phone";$jq("#"+a).mask("(999) 999-9999");$jq("#"+a).focus();$jq("#Cancel").click(tb_remove)}};var player;$jq(document).ready(function(){var b=document.createElement("script");b.src="https://www.youtube.com/iframe_api";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(b,a)});function onYouTubeIframeAPIReady(){}function createPlayer(a,b,d,c){player=new YT.Player(a,{height:c,width:d,videoId:b,events:{onReady:onPlayerReady,onStateChange:onPlayerStateChange}})}function onPlayerReady(a){a.target.playVideo()}function onPlayerStateChange(){}