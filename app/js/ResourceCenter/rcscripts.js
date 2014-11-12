(function(a){a.fn.slides=function(b){b=a.extend({},a.fn.slides.option,b);return this.each(function(){a("."+b.container,a(this)).children().wrapAll('<div class="slides_control"/>');var d=a(this),c=a(".slides_control",d),p=c.children().size(),h=c.children().outerWidth(),x=c.children().outerHeight(),g=b.start-1,k=b.effect.indexOf(",")<0?b.effect:b.effect.replace(" ","").split(",")[0],u=b.effect.indexOf(",")<0?k:b.effect.replace(" ","").split(",")[1],e=0,j=0,m=0,f=0,s,l,o,q,z,t,v,r;if(p<2){a("."+b.container,a(this)).fadeIn(b.fadeSpeed,b.fadeEasing,function(){s=true;b.slidesLoaded()});a("."+b.next+", ."+b.prev).fadeOut(0);return false}function i(g,k,i){if(!l&&s){l=true;switch(g){case "next":j=f;e=f+1;e=p===e?0:e;q=h*2;g=-h*2;f=e;break;case "prev":j=f;e=f-1;e=e===-1?p-1:e;q=0;g=0;f=e;break;case "pagination":e=parseInt(i,10);j=a("."+b.paginationClass+" li."+b.currentClass+" a",d).attr("href").match("[^#/]+$");if(e>j){q=h*2;g=-h*2}else{q=0;g=0}f=e}b.animationStart(f);if(k==="fade")if(b.crossfade)c.children(":eq("+e+")",d).css({zIndex:10}).fadeIn(b.fadeSpeed,b.fadeEasing,function(){if(b.autoHeight)c.animate({height:c.children(":eq("+e+")",d).outerHeight()},b.autoHeightSpeed,function(){c.children(":eq("+j+")",d).css({display:"none",zIndex:0});c.children(":eq("+e+")",d).css({zIndex:0});b.animationComplete(e+1);l=false});else{c.children(":eq("+j+")",d).css({display:"none",zIndex:0});c.children(":eq("+e+")",d).css({zIndex:0});b.animationComplete(e+1);l=false}});else c.children(":eq("+j+")",d).fadeOut(b.fadeSpeed,b.fadeEasing,function(){if(b.autoHeight)c.animate({height:c.children(":eq("+e+")",d).outerHeight()},b.autoHeightSpeed,function(){c.children(":eq("+e+")",d).fadeIn(b.fadeSpeed,b.fadeEasing)});else c.children(":eq("+e+")",d).fadeIn(b.fadeSpeed,b.fadeEasing,function(){a.browser.msie&&a(this).get(0).style.removeAttribute("filter")});b.animationComplete(e+1);l=false});else{c.children(":eq("+e+")").css({left:q,display:"block"});if(b.autoHeight)c.animate({left:g,height:c.children(":eq("+e+")").outerHeight()},b.slideSpeed,b.slideEasing,function(){c.css({left:-h});c.children(":eq("+e+")").css({left:h,zIndex:5});c.children(":eq("+j+")").css({left:h,display:"none",zIndex:0});b.animationComplete(e+1);l=false});else c.animate({left:g},b.slideSpeed,b.slideEasing,function(){c.css({left:-h});c.children(":eq("+e+")").css({left:h,zIndex:5});c.children(":eq("+j+")").css({left:h,display:"none",zIndex:0});b.animationComplete(e+1);l=false})}if(b.pagination){a("."+b.paginationClass+" li."+b.currentClass,d).removeClass(b.currentClass);a("."+b.paginationClass+" li:eq("+e+")",d).addClass(b.currentClass);a("#slides_count > span").html(f+1)}}}function w(){clearInterval(d.data("interval"))}function n(){if(b.pause){clearTimeout(d.data("pause"));clearInterval(d.data("interval"));v=setTimeout(function(){clearTimeout(d.data("pause"));r=setInterval(function(){i("next",k)},b.play);d.data("interval",r)},b.pause);d.data("pause",v)}else w()}if(p<2)return;if(g<0)g=0;if(g>p)g=p-1;if(b.start)f=g;b.randomize&&c.randomize();a("."+b.container,d).css({overflow:"hidden",position:"relative"});c.children().css({position:"absolute",top:0,left:c.children().outerWidth(),zIndex:0,display:"none"});c.css({position:"relative",width:h*3,height:x,left:-h});a("."+b.container,d).css({display:"block"});if(b.autoHeight){c.children().css({height:"auto"});c.animate({height:c.children(":eq("+g+")").outerHeight()},b.autoHeightSpeed)}if(b.preload&&c.find("img:eq("+g+")").length){a("."+b.container,d).css({background:"url("+b.preloadImage+") no-repeat 50% 50%"});var y=c.find("img:eq("+g+")").attr("src")+"?"+(new Date).getTime();if(a("img",d).parent().attr("class")!="slides_control")t=c.children(":eq(0)")[0].tagName.toLowerCase();else t=c.find("img:eq("+g+")");c.find("img:eq("+g+")").attr("src",y).load(function(){c.find(t+":eq("+g+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){a(this).css({zIndex:5});a("."+b.container,d).css({background:""});s=true;b.slidesLoaded()})})}else c.children(":eq("+g+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){s=true;b.slidesLoaded()});if(b.bigTarget){c.children().css({cursor:"pointer"});c.children().click(function(){i("next",k);return false})}if(b.hoverPause&&b.play){c.bind("mouseover",function(){w()});c.bind("mouseleave",function(){n()})}if(b.generateNextPrev){a("."+b.container,d).after('<a href="#" class="'+b.prev+'">Prev</a>');a("."+b.prev,d).after('<a href="#" class="'+b.next+'">Next</a>')}if(b.bigNextPrev){a("."+b.container,d).after('<a href="#" class="big'+b.prev+'">Prev</a>');a(".big"+b.prev,d).after('<a href="#" class="big'+b.next+'">Next</a>')}a("."+b.next,d).click(function(a){a.preventDefault();b.play&&n();i("next",k)});a("."+b.prev,d).click(function(a){a.preventDefault();b.play&&n();i("prev",k)});a(".big"+b.next,d).click(function(a){a.preventDefault();b.play&&n();i("next",k)});a(".big"+b.prev,d).click(function(a){a.preventDefault();b.play&&n();i("prev",k)});if(b.generateCount){c.children().each(function(){m++});d.prepend('<p id="slides_count"><span></span> of '+m+"</p>")}a("#slides_count > span").html(f+1);if(b.generatePagination){if(b.prependPagination)d.prepend("<ul class="+b.paginationClass+"></ul>");else d.append("<ul class="+b.paginationClass+"></ul>");c.children().each(function(){a("."+b.paginationClass,d).append('<li><a href="#'+m+'">'+(m+1)+"</a></li>");m++})}else a("."+b.paginationClass+" li a",d).each(function(){a(this).attr("href","#"+m);m++});a("."+b.paginationClass+" li:eq("+g+")",d).addClass(b.currentClass);a("."+b.paginationClass+" li a",d).click(function(){b.play&&n();o=a(this).attr("href").match("[^#/]+$");f!=o&&i("pagination",u,o);return false});a("a.link",d).click(function(){b.play&&n();o=a(this).attr("href").match("[^#/]+$")-1;f!=o&&i("pagination",u,o);return false});if(b.play){r=setInterval(function(){i("next",k)},b.play);d.data("interval",r)}})};a.fn.slides.option={preload:false,preloadImage:"/img/loading.gif",container:"slides_container",generateNextPrev:false,next:"next",prev:"prev",pagination:true,generatePagination:true,prependPagination:false,paginationClass:"pagination",currentClass:"current",generateCount:false,fadeSpeed:350,fadeEasing:"",slideSpeed:350,slideEasing:"",start:1,effect:"slide",crossfade:false,randomize:false,play:0,pause:0,hoverPause:false,autoHeight:false,autoHeightSpeed:350,bigTarget:false,bigNextPrev:false,animationStart:function(){},animationComplete:function(){},slidesLoaded:function(){}};a.fn.randomize=function(b){function c(){return Math.round(Math.random())-.5}return a(this).each(function(){var g=a(this),e=g.children(),f=e.length;if(f>1){e.hide();var d=[];for(i=0;i<f;i++)d[d.length]=i;d=d.sort(c);a.each(d,function(f,d){var a=e.eq(d),c=a.clone(true);c.show().appendTo(g);b!==undefined&&b(a,c);a.remove()})}})}})(jQuery);NHS.Scripts.ResourceCenterSlideshow=function(){};NHS.Scripts.ResourceCenterSlideshow.prototype={setupTwitter:function(b,e,d){var a,c=b.getElementsByTagName(e)[0];if(!b.getElementById(d)){a=b.createElement(e);a.id=d;a.src="//platform.twitter.com/widgets.js";c.parentNode.insertBefore(a,c)}}};NHS.Scripts.ResourceCenterPage=function(a,b){this._typeAheadUrl=a;this._typeAheadText=b;this._search=new NHS.Scripts.Search(a)};NHS.Scripts.ResourceCenterPage.prototype={initialize:function(){this._setUpCommonControls()},_setUpCommonControls:function(){$jq("#pinit").click(function(){$jq("#pinmarklet").remove();var a=document.createElement("script");a.setAttribute("type","text/javascript");a.setAttribute("charset","UTF-8");a.setAttribute("id","pinmarklet");a.setAttribute("src","http://assets.pinterest.com/js/pinmarklet.js?r="+Math.random()*99999999);document.body.appendChild(a)});!Modernizr.input.placeholder&&$jq("[placeholder]").focus(function(){var a=$jq(this);if(a.val()==a.attr("placeholder")){a.val("");a.removeClass("placeholder")}}).blur(function(){var a=$jq(this);if(a.val()==""||a.val()==a.attr("placeholder")){a.addClass("placeholder");a.val(a.attr("placeholder"))}}).blur();var b=$jq("#nhs_CmsNav > div > ul");b.find("> li").each(function(){if($jq(this).find("ul").length>0){$jq(this).children(":first").addClass("nhs_HasSubList");$jq(this).on("touchstart mouseenter",function(){if($jq(this).find("a").hasClass("nhs_Active")){$jq(this).find("ul").stop(true,true).slideUp("fast");$jq(this).children(":first").removeClass("nhs_Active")}else{$jq(this).children(":first").addClass("nhs_Active");$jq(this).find("ul").stop(true,true).slideDown()}return false});$jq(this).mouseleave(function(){$jq(this).children(":first").removeClass("nhs_Active");$jq(this).find("ul").stop(true,true).slideUp("fast")})}});this._typeAheadUrl!=""&&this._search.setupSearchBox("MktSearch","nhs_SearchBoxType");var a=new NHS.Scripts.Helper.FieldDefaultValue("MktSearch",this._typeAheadText,"nhs_LocationDefaultCms","Submit");a.initialize()},SetupFeatureSlideShow:function(a){$jq(a.detailsSection).click(function(){if($jq(this).attr("class")==="true"){$jq(this).text("see details");$jq(this).attr("class","false");$jq(this).parent().next("div").fadeToggle("slow")}else{$jq(this).text("close details");$jq(this).attr("class","true");$jq(this).parent().next("div").fadeToggle()}});$jq(a.nhs_CmsSlideIntroStartLink).click(function(){$jq(a.next_arrow).click()});$jq(a.previos_arrow).hide();$jq(a.next_arrow).hide();$jq(a.nhs_CMS_mainContainer).on("mouseenter",function(){$jq(".nhs_CmsSlidesFeaturePagination li:last").hasClass("nhs_CmsSlidesCurrentPage")==false&&$jq(a.next_arrow).show();$jq(".nhs_CmsSlidesFeaturePagination li:first").hasClass("nhs_CmsSlidesCurrentPage")==false&&$jq(a.previos_arrow).show()});$jq(a.nhs_CMS_mainContainer).on("mouseleave",function(){$jq(a.previos_arrow).hide();$jq(a.next_arrow).hide()})},Pagination:function(d){this.currentPage=1;var b=this,e=$jq("#"+d.id).find(".nhs_CmsArticleTeaser");e.hide();var f=$jq("."+d.navigation).find("ul");$jq(f).find("li").remove();if(e.length>0){var j=e.length/d.maxPage,c=parseInt(j,10);if(e.length-c*d.maxPage>0)c++;c>1&&f.append('<li><a page="back"><</a></li>');for(var a=0;a<c;a++){for(var h=a*d.maxPage;h<(a+1)*d.maxPage;h++)h<=e.length&&$jq(e[h]).attr("page",a+1);if(a+1==1)f.append('<li><a class="nhs_Active" page="'+(a+1)+'">'+(a+1)+"</a></li>");else f.append('<li><a page="'+(a+1)+'">'+(a+1)+"</a></li>")}$jq("div[page^='1']").show();c>1&&f.append('<li><a page="next">></a></li><li><a page="all">View All</a></li>');if(c>1)for(var g=f.find("a"),i=0;i<g.length;i++)$jq(g[i]).click(function(){$jq("a.nhs_Active").removeClass("nhs_Active");var a=$jq(this).attr("page");if(a=="back"){if(b.currentPage>1)a=b.currentPage-1}else if(a=="next")if(b.currentPage<c)a=b.currentPage+1;if(a=="all")if($jq(this).html()=="View All"){$jq("div[page]").fadeIn("normal");g.hide();$jq("a[page='all']").show().addClass("nhs_Active");$jq("a[page='all']").html("Collapse")}else{g.show();$jq("a[page^='"+b.currentPage+"']").addClass("nhs_Active");$jq("div[page]").hide();$jq("div[page^='"+b.currentPage+"']").fadeIn("normal");$jq("a[page='all']").html("View All")}else if(a!=b.currentPage&&a!="back"&&a!="next"){$jq("a[page^='"+a+"']").addClass("nhs_Active");$jq("div[page]").hide();$jq("div[page^='"+a+"']").fadeIn("normal");b.currentPage=parseInt(a,10)}document.getElementById("Pagination").scrollIntoView()})}}};(function(G){var B,J,C,K,N,M,I,E,H,A,L;J=!!document.createElement("canvas").getContext;B=(function(){var P=document.createElement("div");P.innerHTML='<v:shape id="vml_flag1" adj="1" />';var O=P.firstChild;O.style.behavior="url(#default#VML)";return O?typeof O.adj=="object":true})();if(!(J||B)){G.fn.maphilight=function(){return this};return }if(J){E=function(O){return Math.max(0,Math.min(parseInt(O,16),255))};H=function(O,P){return"rgba("+E(O.substr(0,2))+","+E(O.substr(2,2))+","+E(O.substr(4,2))+","+P+")"};C=function(O){var P=G('<canvas style="width:'+O.width+"px;height:"+O.height+'px;"></canvas>').get(0);P.getContext("2d").clearRect(0,0,P.width,P.height);return P};var F=function(Q,O,R,P,S){P=P||0;S=S||0;Q.beginPath();if(O=="rect"){Q.rect(R[0]+P,R[1]+S,R[2]-R[0],R[3]-R[1])}else{if(O=="poly"){Q.moveTo(R[0]+P,R[1]+S);for(i=2;i<R.length;i+=2){Q.lineTo(R[i]+P,R[i+1]+S)}}else{if(O=="circ"){Q.arc(R[0]+P,R[1]+S,R[2],0,Math.PI*2,false)}}}Q.closePath()};K=function(Q,T,U,X,O){var S,P=Q.getContext("2d");if(X.shadow){P.save();if(X.shadowPosition=="inside"){F(P,T,U);P.clip()}var R=Q.width*100;var W=Q.height*100;F(P,T,U,R,W);P.shadowOffsetX=X.shadowX-R;P.shadowOffsetY=X.shadowY-W;P.shadowBlur=X.shadowRadius;P.shadowColor=H(X.shadowColor,X.shadowOpacity);var V=X.shadowFrom;if(!V){if(X.shadowPosition=="outside"){V="fill"}else{V="stroke"}}if(V=="stroke"){P.strokeStyle="rgba(0,0,0,1)";P.stroke()}else{if(V=="fill"){P.fillStyle="rgba(0,0,0,1)";P.fill()}}P.restore();if(X.shadowPosition=="outside"){P.save();F(P,T,U);P.globalCompositeOperation="destination-out";P.fillStyle="rgba(0,0,0,1);";P.fill();P.restore()}}P.save();F(P,T,U);if(X.fill){P.fillStyle=H(X.fillColor,X.fillOpacity);P.fill()}if(X.stroke){P.strokeStyle=H(X.strokeColor,X.strokeOpacity);P.lineWidth=X.strokeWidth;P.stroke()}P.restore();if(X.fade){G(Q).css("opacity",0).animate({opacity:1},100)}};N=function(O){O.getContext("2d").clearRect(0,0,O.width,O.height)}}else{C=function(O){return G('<var style="zoom:1;overflow:hidden;display:block;width:'+O.width+"px;height:"+O.height+'px;"></var>').get(0)};K=function(P,T,U,X,O){var V,W,R,S;for(var Q in U){U[Q]=parseInt(U[Q],10)}V='<v:fill color="#'+X.fillColor+'" opacity="'+(X.fill?X.fillOpacity:0)+'" />';W=(X.stroke?'strokeweight="'+X.strokeWidth+'" stroked="t" strokecolor="#'+X.strokeColor+'"':'stroked="f"');R='<v:stroke opacity="'+X.strokeOpacity+'"/>';if(T=="rect"){S=G('<v:rect name="'+O+'" filled="t" '+W+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+U[0]+"px;top:"+U[1]+"px;width:"+(U[2]-U[0])+"px;height:"+(U[3]-U[1])+'px;"></v:rect>')}else{if(T=="poly"){S=G('<v:shape name="'+O+'" filled="t" '+W+' coordorigin="0,0" coordsize="'+P.width+","+P.height+'" path="m '+U[0]+","+U[1]+" l "+U.join(",")+' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:'+P.width+"px;height:"+P.height+'px;"></v:shape>')}else{if(T=="circ"){S=G('<v:oval name="'+O+'" filled="t" '+W+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+(U[0]-U[2])+"px;top:"+(U[1]-U[2])+"px;width:"+(U[2]*2)+"px;height:"+(U[2]*2)+'px;"></v:oval>')}}}S.get(0).innerHTML=V+R;G(P).append(S)};N=function(P){var O=G("<div>"+P.innerHTML+"</div>");O.children("[name=highlighted]").remove();P.innerHTML=O.html()}}M=function(P){var O,Q=P.getAttribute("coords").split(",");for(O=0;O<Q.length;O++){Q[O]=parseFloat(Q[O])}return[P.getAttribute("shape").toLowerCase().substr(0,4),Q]};L=function(Q,P){var O=G(Q);return G.extend({},P,G.metadata?O.metadata():false,O.data("maphilight"))};A=function(O){if(!O.complete){return false}if(typeof O.naturalWidth!="undefined"&&O.naturalWidth===0){return false}return true};I={position:"absolute",left:0,top:0,padding:0,border:0};var D=false;G.fn.maphilight=function(O){O=G.extend({},G.fn.maphilight.defaults,O);if(!J&&!D){G(window).ready(function(){document.namespaces.add("v","urn:schemas-microsoft-com:vml");var Q=document.createStyleSheet();var P=["shape","rect","oval","circ","fill","stroke","imagedata","group","textbox"];G.each(P,function(){Q.addRule("v\\:"+this,"behavior: url(#default#VML); antialias:true")})});D=true}return this.each(function(){var U,R,Y,Q,T,V,X,S,W;U=G(this);if(!A(this)){return window.setTimeout(function(){U.maphilight(O)},200)}Y=G.extend({},O,G.metadata?U.metadata():false,U.data("maphilight"));W=U.get(0).getAttribute("usemap");if(!W){return }Q=G('map[name="'+W.substr(1)+'"]');if(!(U.is('img,input[type="image"]')&&W&&Q.size()>0)){return }if(U.hasClass("maphilighted")){var P=U.parent();U.insertBefore(P);P.remove();G(Q).unbind(".maphilight").find("area[coords]").unbind(".maphilight")}R=G("<div></div>").css({display:"block",background:'url("'+this.src+'")',position:"relative",padding:0,width:this.width,height:this.height});if(Y.wrapClass){if(Y.wrapClass===true){R.addClass(G(this).attr("class"))}else{R.addClass(Y.wrapClass)}}U.before(R).css("opacity",0).css(I).remove();if(B){U.css("filter","Alpha(opacity=0)")}R.append(U);T=C(this);G(T).css(I);T.height=this.height;T.width=this.width;X=function(c){var a,b;b=L(this,Y);if(!b.neverOn&&!b.alwaysOn){a=M(this);K(T,a[0],a[1],b,"highlighted");if(b.groupBy){var Z;if(/^[a-zA-Z][\-a-zA-Z]+$/.test(b.groupBy)){Z=Q.find("area["+b.groupBy+'="'+G(this).attr(b.groupBy)+'"]')}else{Z=Q.find(b.groupBy)}var d=this;Z.each(function(){if(this!=d){var f=L(this,Y);if(!f.neverOn&&!f.alwaysOn){var e=M(this);K(T,e[0],e[1],f,"highlighted")}}})}if(!J){G(T).append("<v:rect></v:rect>")}}};G(Q).bind("alwaysOn.maphilight",function(){if(V){N(V)}if(!J){G(T).empty()}G(Q).find("area[coords]").each(function(){var Z,a;a=L(this,Y);if(a.alwaysOn){if(!V&&J){V=C(U[0]);G(V).css(I);V.width=U[0].width;V.height=U[0].height;U.before(V)}a.fade=a.alwaysOnFade;Z=M(this);if(J){K(V,Z[0],Z[1],a,"")}else{K(T,Z[0],Z[1],a,"")}}})});G(Q).trigger("alwaysOn.maphilight").find("area[coords]").bind("mouseover.maphilight",X).bind("mouseout.maphilight",function(Z){N(T)});U.before(T);U.addClass("maphilighted")})};G.fn.maphilight.defaults={fill:true,fillColor:"000000",fillOpacity:0.2,stroke:true,strokeColor:"ff0000",strokeOpacity:1,strokeWidth:1,fade:true,alwaysOn:false,neverOn:false,groupBy:false,wrapClass:true,shadow:false,shadowX:0,shadowY:0,shadowRadius:6,shadowColor:"000000",shadowOpacity:0.8,shadowPosition:"outside",shadowFrom:false}})(jQuery);;NHS.Scripts.DropDown=function(a){this._parameters=a};NHS.Scripts.DropDown.prototype={initialize:function(){var a=$jq(".pro_SearchDdl"),b=this;$jq(document).find("*").click(function(d){var b=$jq(this).attr("class"),c=false;if(b){c=b.indexOf("pro_SearchDdl")>-1||b.indexOf("trigger")>-1||b.indexOf("pro_SearchDdlData")>-1||b.indexOf("resultText")>-1;c===false&&$jq(".pro_SearchDdlData").hide()}else $jq(".pro_SearchDdlData").hide();var a=d?d:window.event;if(c===true&&this.nodeName!="HTML"){a.cancelBubble=true;a.returnValue=false;a.stopPropagation&&a.stopPropagation();a.preventDefault&&a.preventDefault()}if(!(b=="btn_Search"||this.nodeName=="A"))if(!($jq(this).find("btn_Search")||$jq(this).find("a[href]"))){a.cancelBubble=true;a.returnValue=false;a.stopPropagation&&a.stopPropagation();a.preventDefault&&a.preventDefault()}});$jq.each(a,function(){var c=$jq(this),g=c.find(".trigger"),e=c.find(".pro_SearchDdlData"),d=c.find(".resultText");d.removeAttr("name");var f=c.find(".resultHidden");b.CreateTrigger(e,d,f);g.click(function(){a.find(".pro_SearchDdlData").hide();e.show()})})},CreateTrigger:function(d,a,c){var b=d.find("li");b.click(function(){var e=$jq(this);b.removeClass("pro_Active");b.removeAttr("pro_Active");e.addClass("pro_Active");var g=e.attr("value"),f=e.text();if(f!="Any"){c.val(g);a.val(f);a.removeClass("placeholder")}else{c.val("");a.val(a.attr("placeholder"));a.addClass("placeholder")}d.hide()})}}