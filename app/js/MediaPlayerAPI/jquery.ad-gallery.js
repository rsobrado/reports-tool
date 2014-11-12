/**
* Copyright (c) 2010 Anders Ekdahl (http://coffeescripter.com/)
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*
* Version: 1.2.4
*
* Demo and documentation: http://coffeescripter.com/code/ad-gallery/
*/



(function ($) {
    $.fn.adGallery = function (options) {
        var defaults = { loader_image: options.resource_root + '/GlobalResourcesMvc/Default/images/imgs-player/loader.gif',
            listingType: options.listingType,
            start_at_index: 0,
            description_wrapper: false,
            thumb_opacity: 0.8,
            animate_first_image: true,
            animation_speed: 400,
            width: false,
            height: false,
            display_next_and_prev: true,
            display_back_and_forward: false,
            scroll_jump: 0, // If 0, it jumps the width of the container
            slideshow: {
                enable: true,
                autostart: false,
                speed: 4000,
                start_label: 'Start',
                stop_label: 'Stop',
                stop_on_scroll: false,
                countdown_prefix: '(',
                countdown_sufix: ')',
                onStart: false,
                onStop: false
            },
            effect: 'fade', // or 'slide-vert', 'fade', or 'resize', 'none'
            mp_type: false,
            noimg: false,
            nocdmain: options.resource_root + '/GlobalResourcesMvc/Default/images/blank.gif',
            wrapperW: false,
            wrapperH: false,
            enable_keyboard_move: true,
            cycle: true,
            callbacks: {
                init: false,
                afterImageVisible: false,
                beforeImageVisible: false
            }
        };
        var settings = $.extend(false, defaults, options);
        if (options && options.slideshow) {
            settings.slideshow = $.extend(false, defaults.slideshow, options.slideshow);
        };
        if (!settings.slideshow.enable) {
            settings.slideshow.autostart = false;
        };
        var galleries = [];
        $(this).each(function () {
            var gallery = new AdGallery(this, settings);
            galleries[galleries.length] = gallery;
        });
        // Sorry, breaking the jQuery chain because the gallery instances
        // are returned so you can fiddle with them
        return galleries;
    };

    function VerticalSlideAnimation(img_container, direction, desc) {
        var current_top = parseInt(img_container.css('top'), 10);
        if (direction == 'left') {
            var old_image_top = '-' + this.image_wrapper_height + 'px';
            img_container.css('top', this.image_wrapper_height + 'px');
        } else {
            var old_image_top = this.image_wrapper_height + 'px';
            img_container.css('top', '-' + this.image_wrapper_height + 'px');
        };
        if (desc) {
            desc.css('bottom', '-' + desc[0].offsetHeight + 'px');
            desc.animate({ bottom: 0 }, this.settings.animation_speed * 2);
        };
        if (this.current_description) {
            this.current_description.animate({ bottom: '-' + this.current_description[0].offsetHeight + 'px' }, this.settings.animation_speed * 2);
        };
        return { old_image: { top: old_image_top },
            new_image: { top: current_top }
        };
    };

    function HorizontalSlideAnimation(img_container, direction, desc) {
        var current_left = parseInt(img_container.css('left'), 10);
        if (direction == 'left') {
            var old_image_left = '-' + this.image_wrapper_width + 'px';
            img_container.css('left', this.image_wrapper_width + 'px');
        } else {
            var old_image_left = this.image_wrapper_width + 'px';
            img_container.css('left', '-' + this.image_wrapper_width + 'px');
        };
        if (desc) {
            desc.css('bottom', '-' + desc[0].offsetHeight + 'px');
            desc.animate({ bottom: 0 }, this.settings.animation_speed * 2);
        };
        if (this.current_description) {
            this.current_description.animate({ bottom: '-' + this.current_description[0].offsetHeight + 'px' }, this.settings.animation_speed * 2);
        };
        return { old_image: { left: old_image_left },
            new_image: { left: current_left }
        };
    };

    function ResizeAnimation(img_container, direction, desc) {
        var image_width = img_container.width();
        var image_height = img_container.height();
        var current_left = parseInt(img_container.css('left'), 10);
        var current_top = parseInt(img_container.css('top'), 10);
        img_container.css({ width: 0, height: 0, top: this.image_wrapper_height / 2, left: this.image_wrapper_width / 2 });
        return { old_image: { width: 0,
            height: 0,
            top: this.image_wrapper_height / 2,
            left: this.image_wrapper_width / 2
        },
            new_image: { width: image_width,
                height: image_height,
                top: current_top,
                left: current_left
            }
        };
    };

    function FadeAnimation(img_container, direction, desc) {
        img_container.css('opacity', 0);
        return { old_image: { opacity: 0 },
            new_image: { opacity: 1 }
        };
    };

    // Sort of a hack, will clean this up... eventually
    function NoneAnimation(img_container, direction, desc) {
        img_container.css('opacity', 0);
        return { old_image: { opacity: 0 },
            new_image: { opacity: 1 },
            speed: 0
        };
    };

    function AdGallery(wrapper, settings) {
        this.init(wrapper, settings);
    };
    AdGallery.prototype = {
        // Elements
        pageClick: 1,
        numclicks: 1,
        maxclicks: 0,
        wrapper: false,
        image_wrapper: false,
        gallery_info: false,
        nav: false,
        loader: false,
        preloads: false,
        thumbs_wrapper: false,
        scroll_back: false,
        scroll_forward: false,
        next_link: false,
        prev_link: false,
        thumb_next_link: false,
        thumb_prev_link: false,
        slideshow: false,
        image_wrapper_width: 0,
        image_wrapper_height: 0,
        current_index: 0,
        current_image: false,
        current_description: false,
        nav_display_width: 0,
        settings: false,
        images: false,
        in_transition: false,
        animations: false,
        init: function (wrapper, settings) {
            var context = this;
            this.wrapper = $(wrapper);
            this.settings = settings;
            this.setupElements();
            this.setupAnimations();
            if (this.settings.width) {
                this.image_wrapper_width = this.settings.width;
                this.image_wrapper.width(this.settings.width);
                this.wrapper.width(this.settings.width);
            } else {
                if (_wrapperW > 0) {
                    this.image_wrapper_width = _wrapperW;
                    this.image_wrapper.width(_wrapperW);
                    this.wrapper.width(_wrapperW);
                }
                else
                    this.image_wrapper_width = this.image_wrapper.width();
            };
            if (this.settings.height) {
                this.image_wrapper_height = this.settings.height;
                this.image_wrapper.height(this.settings.height);
            } else {
                if (_wrapperH > 0) {
                    this.image_wrapper_height = _wrapperH;
                    this.image_wrapper.height(_wrapperH);
                }
                else
                    this.image_wrapper_height = this.image_wrapper.height();
            };

            this.nav_display_width = this.nav.width();
            this.current_index = 0;
            this.current_image = false;
            this.current_description = false;
            this.in_transition = false;
            this.findImages();
            if (this.settings.display_next_and_prev) {
                this.initNextAndPrev();
            };
            // The slideshow needs a callback to trigger the next image to be shown
            // but we don't want to give it access to the whole gallery instance
            var nextimage_callback = function (callback) {
                return context.nextImage(callback);
            };
            this.slideshow = new AdGallerySlideshow(nextimage_callback, this.settings.slideshow);
            this.controls.append(this.slideshow.create());
            if (this.settings.slideshow.enable) {
                this.slideshow.enable();
            } else {
                this.slideshow.disable();
            };
            if (this.settings.display_back_and_forward) {
                this.initBackAndForward();
            };
            if (this.settings.enable_keyboard_move) {
                this.initKeyEvents();
            };
            var start_at = parseInt(this.settings.start_at_index, 10);
            if (window.location.hash && window.location.hash.indexOf('#ad-image') === 0) {
                start_at = window.location.hash.replace(/[^0-9]+/g, '');
                // Check if it's a number
                if ((start_at * 1) != start_at) {
                    start_at = this.settings.start_at_index;
                };
            };


            this.loading(true);

            this.showImage(start_at,
        function () {
            // We don't want to start the slideshow before the image has been
            // displayed

            if (context.settings.slideshow.autostart) {
                context.preloadImage(start_at + 1);
                context.slideshow.start();
            };
        }
      );
            this.fireCallback(this.settings.callbacks.init);
        },
        setupAnimations: function () {
            this.animations = {
                'slide-vert': VerticalSlideAnimation,
                'slide-hori': HorizontalSlideAnimation,
                'resize': ResizeAnimation,
                'fade': FadeAnimation,
                'none': NoneAnimation
            };
        },
        setupElements: function () {
            this.controls = this.wrapper.find('.ad-controls');           
            this.image_wrapper = this.wrapper.find('.ad-image-wrapper');
            jQuery(this.image_wrapper).empty();
            this.image_wrapper.html('');
            //console.error(this.image_wrapper);
            //this.nav = this.wrapper.find('.ad-nav');
            this.nav = $('.ad-nav');
            this.thumbs_wrapper = this.nav.find('.ad-thumbs');
            this.preloads = $('<div class="ad-preloads"></div>');
            //this.loader = $('<img class="ad-loader" src="' + String(this.settings.loader_image).replace('//','/') + '" />');
            //this.image_wrapper.append(this.loader);
            var listing = this.settings.listingType;
            if (listing == "spec" || listing == "plan") {
                this.thumb_next_link = $('<div class="ad-next-thumb" onclick="$jq.googlepush(\'Images\',\'Home - Gallery\',\'Forward Button\');"><div class="ad-next-imageThumb"></div></div>');
                this.thumb_prev_link = $('<div class="ad-prev-thumb" onclick="$jq.googlepush(\'Images\',\'Home - Gallery\',\'Back Button\');"><div class="ad-prev-imageThumb"></div></div>');
            }
            else {
                this.thumb_next_link = $('<div class="ad-next-thumb"><div class="ad-next-imageThumb"></div></div>');
                this.thumb_prev_link = $('<div class="ad-prev-thumb"><div class="ad-prev-imageThumb"></div></div>');
            }

            this.nav.append(this.thumb_prev_link);
            this.nav.append(this.thumb_next_link);


            //this.loader.hide();
            $(document.body).append(this.preloads);
        },
        loading: function (bool) {
            if (bool) {

                //this.loader.show();
            } else {

                //this.loader.hide();
            };
        },
        addAnimation: function (name, fn) {
            if ($.isFunction(fn)) {
                this.animations[name] = fn;
            };
        },
        findImages: function () {
            var context = this;
            this.images = [];
            var thumb_wrapper_width = 0;
            var thumbs_loaded = 0;
            var thumbs = this.thumbs_wrapper.find('a');
            var thumb_count = thumbs.length;
            if (this.settings.thumb_opacity < 1) {
                thumbs.find('img').css('opacity', this.settings.thumb_opacity);
            };
            var rem = thumb_count % 3;
            if (rem == 0)
                this.maxclicks = (thumb_count - rem) / 3;
            else
                this.maxclicks = ((thumb_count - rem) / 3) + 1;

            thumbs.each(
        function (i) {
            var link = $(this);
            var image_src = link.attr('href');
            var thumb = link.find('img');
            // Check if the thumb has already loaded
            if (!context.isImageLoaded(thumb[0])) {
                thumb.load(
              function () {
                  thumb_wrapper_width += this.parentNode.parentNode.offsetWidth;
                  thumbs_loaded++;
              }
            );
            } else {
                thumb_wrapper_width += thumb[0].parentNode.parentNode.offsetWidth;
                thumbs_loaded++;
            };
            link.addClass('ad-thumb' + i);
            if (image_src.indexOf("logredirect") > -1) {

                var listing = context.settings.listingType;

                if ((listing == 'spec' || listing == 'plan')) {

                    if (image_src.indexOf("tour") > -1 || image_src.indexOf("virtual") > -1 || image_src.indexOf("video") > -1 || image_src.indexOf("HDVTCT") > -1) {

                        link.click(function () {
                            $jq.googlepush('Outbound Links', 'Home - Gallery', 'Home Tour');
                        });
                    }
                    else if (image_src.indexOf("floor") > -1 || image_src.indexOf("plan") > -1 || image_src.indexOf("HDPVCT") > -1) {

                        link.click(function () {
                            $jq.googlepush('Outbound Links', 'Home - Gallery', 'Plan Viewer');
                        });
                    }
                }

                link.hover(
                    function () {
                        if (!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                            $(this).find('img').fadeTo(300, 1);
                        };
                        context.preloadImage(i);
                    },
                    function () {
                        if (!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                            $(this).find('img').fadeTo(300, context.settings.thumb_opacity);
                        };
                    }
                  );
            } else
                link.click(
            function () {
                context.showImage(i);
                context.slideshow.stop();
                var rem = i % 3;
                var Indexclick = ((i - rem) / 3) + 1;
                context.numclicks = Indexclick;
                return false;
            }
          ).hover(
            function () {
                if (!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                    $(this).find('img').fadeTo(300, 1);
                };
                context.preloadImage(i);
            },
            function () {
                if (!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                    $(this).find('img').fadeTo(300, context.settings.thumb_opacity);
                };
            }
          );
            var link = false;
            if (thumb.data('ad-link')) {
                link = thumb.data('ad-link');
            } else if (thumb.attr('longdesc') && thumb.attr('longdesc').length) {
                link = thumb.attr('longdesc');
            };
            var desc = false;
            if (thumb.data('ad-desc')) {
                desc = thumb.data('ad-desc');
            } else if (thumb.attr('alt') && thumb.attr('alt').length) {
                desc = thumb.attr('alt');
            };
            var title = false;
            if (thumb.data('ad-title')) {
                title = thumb.data('ad-title');
            } else if (thumb.attr('title') && thumb.attr('title').length) {
                title = thumb.attr('title');
            };


            context.images[i] = { thumb: thumb.attr('src'), image: image_src, error: false,
                preloaded: false, desc: desc, title: title, size: false,
                link: link
            };
        }

      );

            // Wait until all thumbs are loaded, and then set the width of the ul
            var inter = setInterval(
        function () {
            if (thumb_count == thumbs_loaded) {
                thumb_wrapper_width -= 80;
                var list = context.nav.find('.ad-thumb-list');
                //list.css('width', thumb_wrapper_width + 'px');
                var i = 1;
                var last_height = list.height();
                while (i < 201) {
                    //list.css('width', (thumb_wrapper_width + i) + 'px');
                    if (last_height != list.height()) {
                        break;
                    }
                    last_height = list.height();
                    i++;
                }
                clearInterval(inter);
            };
        },
        100
      );
        },
        initKeyEvents: function () {
            var context = this;
            $(document).keydown(
        function (e) {
            if (e.keyCode == 39) {
                // right arrow
                context.nextImage();
                context.slideshow.stop();
            } else if (e.keyCode == 37) {
                // left arrow
                context.prevImage();
                context.slideshow.stop();
            };
        }
      );
        },
        initNextAndPrev: function () {
            this.thumb_next_link.click(
            function () {


                if (context.numclicks < context.maxclicks) {
                    if (context.numclicks < (context.maxclicks)) {
                        context.numclicks += 1;

                        if (context.numclicks <= context.maxclicks) {
                            var width = context.nav_display_width - 50;
                            if (context.settings.scroll_jump > 0) {
                                var width = context.settings.scroll_jump;
                            };

                            var left = context.thumbs_wrapper.scrollLeft() + width;
                            left += 27;
                            if (context.settings.slideshow.stop_on_scroll) {
                                context.slideshow.stop();
                            };
                            context.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
                        }
                    }
                }
                else {
                    var thumb = context.nav.find('.ad-thumb' + 0)
                    var left = thumb[0].parentNode.offsetLeft;
                    left -= (context.nav_display_width / 2) - (thumb[0].offsetWidth / 2);
                    left -= 14;
                    context.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
                    context.numclicks = 1;
                }
                return false;

            });

            this.thumb_prev_link.click(
            function () {

                var currPage = context.numclicks;

                var ci = context.current_index;
                context.numclicks -= 1;
                var GoLeft = context.numclicks;
                if (context.numclicks < 1)
                    context.numclicks = 1;

                var width = context.nav_display_width - 50;
                if (context.settings.scroll_jump > 0) {
                    var width = context.settings.scroll_jump;
                };

                var left = context.thumbs_wrapper.scrollLeft() - width;
                left -= 27;
                if (context.settings.slideshow.stop_on_scroll) {
                    context.slideshow.stop();
                };
                context.thumbs_wrapper.animate({ scrollLeft: left + 'px' });


                if (GoLeft == 0 && currPage == 1) {
                    var thumbs = context.thumbs_wrapper.find('a');
                    var thumb_count = thumbs.length;
                    var thumb = context.nav.find('.ad-thumb' + (thumb_count - 1))
                    var left = thumb[0].parentNode.offsetLeft;
                    left -= (context.nav_display_width / 2) - (thumb[0].offsetWidth / 2);
                    left -= 14;
                    context.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
                    //var prev = context.prevIndex();
                    //var rem = prev % 3;
                    //var Indexclick = ((prev - rem) / 3) + 1;
                    //context.numclicks = Indexclick;
                    context.numclicks = context.maxclicks;
                }


                return false;

            });

            $jq('#nextVid').click(function () {
                context.nextImage();
                context.slideshow.stop();

                var cth = context.nav.find('.ad-thumb' + context.current_index);
                if (cth[0].href.indexOf("brightcove") > -1) {
                    bcVP.stop();
                }
                if (cth[0].href.indexOf("youtu") > -1) {
                    if (player != undefined)
                        player.stopVideo();
                }

                _toggleVideo = 0;
                $jq('#vidP').hide();
                $jq('#medP').show();
            });
            $jq('#prevVid').click(function () {
                context.prevImage();
                context.slideshow.stop();
                var cth = context.nav.find('.ad-thumb' + context.current_index);
                if (cth[0].href.indexOf("brightcove") > -1) {
                    bcVP.stop();
                }
                if (cth[0].href.indexOf("youtu") > -1) {
                    if (player != undefined)
                        player.stopVideo();
                }

                _toggleVideo = 0;
                $jq('#vidP').hide();
                $jq('#medP').show();
            });

            $jq('#prevParent').mouseover(function () {
                $jq('#prevVid').show();
            });
            $jq('#prevParent').mouseout(function () {
                $jq('#prevVid').hide();
            });

            $jq('#nextParent').mouseover(function () {
                $jq('#nextVid').show();
            });
            $jq('#nextParent').mouseout(function () {
                $jq('#nextVid').hide();
            });

            var listing = this.settings.listingType;
            if (listing == "spec" || listing == "plan") {
                this.next_link = $('<div class="ad-next" onclick="$jq.googlepush(\'Images\',\'Home - Gallery\',\'Forward Button\');"><div class="ad-next-image" title="Next"></div></div>');
                this.prev_link = $('<div class="ad-prev" onclick="$jq.googlepush(\'Images\',\'Home - Gallery\',\'Back Button\');"><div class="ad-prev-image" title="Previous"></div></div>');
            }
            else {
                this.next_link = $('<div class="ad-next"><div class="ad-next-image" title="Next"></div></div>');
                this.prev_link = $('<div class="ad-prev"><div class="ad-prev-image" title="Previous"></div></div>');
            }


            this.image_wrapper.append(this.next_link);
            this.image_wrapper.append(this.prev_link);

            var context = this;
            this.prev_link.add(this.next_link).mouseover(
        function (e) {
            // IE 6 hides the wrapper div, so we have to set it's width
            $(this).css('height', context.image_wrapper_height);
            $(this).find('div').show();
        }
      ).mouseout(
        function (e) {
            $(this).find('div').hide();
        }
      ).click(
        function () {
            if ($(this).is('.ad-next')) {
                context.nextImage();
                context.slideshow.stop();
            } else {
                context.prevImage();
                context.slideshow.stop();
            };
        }
      ).find('div'); //.css('opacity', 1);
        },
        initBackAndForward: function () {
            var context = this;
            //this.scroll_forward = $('<div class="ad-forward"></div>');
            this.scroll_forward = $('<a class="ad-forward">Next</a>');
            //this.scroll_back = $('<div class="ad-back"></div>');
            this.scroll_back = $('<a class="ad-back">Previous</a>');
            this.nav.append(this.scroll_forward);
            this.nav.prepend(this.scroll_back);
            var has_scrolled = 0;
            var thumbs_scroll_interval = false;
            $(this.scroll_back).add(this.scroll_forward).click(
        function () {
            // We don't want to jump the whole width, since an image
            // might be cut at the edge
            var width = context.nav_display_width - 50;
            if (context.settings.scroll_jump > 0) {
                var width = context.settings.scroll_jump;
            };
            if ($(this).is('.ad-forward')) {
                var left = context.thumbs_wrapper.scrollLeft() + width;
            } else {
                var left = context.thumbs_wrapper.scrollLeft() - width;
            };
            if (context.settings.slideshow.stop_on_scroll) {
                context.slideshow.stop();
            };
            context.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
            context.slideshow.start();
            return false;
        }
      ).css('opacity', 0.6).hover(
        function () {
            var direction = 'left';
            if ($(this).is('.ad-forward')) {
                direction = 'right';
            };
            thumbs_scroll_interval = setInterval(
            function () {
                has_scrolled++;
                // Don't want to stop the slideshow just because we scrolled a pixel or two
                if (has_scrolled > 30 && context.settings.slideshow.stop_on_scroll) {
                    context.slideshow.stop();
                };
                var left = context.thumbs_wrapper.scrollLeft() + 1;
                if (direction == 'left') {
                    left = context.thumbs_wrapper.scrollLeft() - 1;
                };
                context.thumbs_wrapper.scrollLeft(left);
            },
            10
          );
            $(this).css('opacity', 1);
        },
        function () {
            has_scrolled = 0;
            clearInterval(thumbs_scroll_interval);
            $(this).css('opacity', 0.6);
        }
      );
        },
        _afterShow: function () {
            //this.gallery_info.html((this.current_index + 1) +' / '+ this.images.length);
            $jq('#nhs_ImagePlayerItemCounts').html((this.current_index + 1) + ' of ' + this.images.length);
            $jq('#nhs_VideoPlayerItemCounts').html($jq('#nhs_ImagePlayerItemCounts').html())

            if (!this.settings.cycle) {
                // Needed for IE
                this.prev_link.show().css('height', this.image_wrapper_height);
                this.next_link.show().css('height', this.image_wrapper_height);
                if (this.current_index == (this.images.length - 1)) {
                    this.next_link.hide();
                };
                if (this.current_index == 0) {
                    this.prev_link.hide();
                };
            };

            this.fireCallback(this.settings.callbacks.afterImageVisible);
        },
        /**
        * Checks if the image is small enough to fit inside the container
        * If it's not, shrink it proportionally
        */
        _getContainedImageSize: function (image_width, image_height) {
            if (image_height > this.image_wrapper_height) {
                var ratio = image_width / image_height;
                image_height = this.image_wrapper_height;
                image_width = this.image_wrapper_height * ratio;
            };
            if (image_width > this.image_wrapper_width) {
                var ratio = image_height / image_width;
                image_width = this.image_wrapper_width;
                image_height = this.image_wrapper_width * ratio;
            };
            return { width: image_width, height: image_height };
        },
        /**
        * If the image dimensions are smaller than the wrapper, we position
        * it in the middle anyway
        */
        _centerImage: function (img_container, image_width, image_height) {
            img_container.css('top', '32px');
            if (image_height < this.image_wrapper_height) {
                var dif = this.image_wrapper_height - image_height;
                img_container.css('top', ((dif / 2) + 32) + 'px');
            };
            img_container.css('left', '0px');
            if (image_width < this.image_wrapper_width) {
                var dif = this.image_wrapper_width - image_width;
                img_container.css('left', (dif / 2) + 'px');
            };
        },
        _getDescription: function (image) {
            var desc = false;
            if (image.desc.length || image.title.length) {
                var title = '';
                if (image.title.length) {
                    title = '<strong class="ad-description-title">' + image.title + '</strong>';
                };
                var desc = '';
                if (image.desc.length) {
                    desc = '<span>' + image.desc + '</span>';
                };
                desc = $('<p class="ad-image-description">' + title + desc + '</p>');
            };
            return desc;
        },
        /**
        * 
        * 
        */
        showImageThumb: function (index, callback) {

            this._showWhenLoadedThumb(index, callback);
        },
        /**
        * @param function callback Gets fired when the image has loaded, is displaying
        *                          and it's animation has finished
        */
        showImage: function (index, callback) {

            var imageE;
            if (this.images[index] == undefined || this.images.length == 0) {
                this.findImages();
            }

            imageE = this.images[index];

            if (imageE.error) {
                this.images[index].image = this.settings.nocdmain;
                this.images[index].error = false;
                this.in_transition = false;
            }

            var imgE = $(new Image());
            imgE.attr('src', this.images[index].image);
            if (!this.isImageLoaded(imgE[0])) {
                var context = this;
                imgE.load(
              function () {
              }
            ).error(
              function () {
                  context.loading(false);
                  context.images[index].image = context.settings.nocdmain;
                  context.images[index].error = false;
                  context.in_transition = false;
                  context.showImage(index, callback);
              }
            );
            }
            if (this.images[index] && !this.in_transition) {

                var context = this;
                var image = this.images[index];
                if (image.error) {
                    image.image = this.settings.nocdmain;
                    image.error = false;
                }
                this.in_transition = true;
                if (!image.preloaded) {
                    this.loading(true);
                    this.preloadImage(index, function () {
                        context.loading(false);
                        context._showWhenLoaded(index, callback);
                    });
                } else {
                    this._showWhenLoaded(index, callback);
                };
            };
        },
        /**
        * 
        * 
        */
        _showWhenLoadedThumb: function (index, callback) {
            if (this.images[index]) {
                var image = this.images[index];
                var img_container = $('.ad-image');
                var desc = this._getDescription(image, img_container);

                this.highLightThumb(this.nav.find('.ad-thumb' + index), index);

                var direction = 'right';
                if (this.current_index < index) {
                    direction = 'left';
                };
                this.fireCallback(this.settings.callbacks.beforeImageVisible);
                if (this.current_image || this.settings.animate_first_image) {
                    var animation_speed = this.settings.animation_speed;
                    var easing = 'swing';
                    var animation = this.animations[this.settings.effect].call(this, img_container, direction, desc);
                    if (typeof animation.speed != 'undefined') {
                        animation_speed = animation.speed;
                    };
                    if (typeof animation.easing != 'undefined') {
                        easing = animation.easing;
                    };
                    if (this.current_image) {
                        var old_image = this.current_image;
                        var old_description = this.current_description;
                        old_image.animate(animation.old_image, animation_speed, easing,
              function () {
                  old_image.remove();
                  if (old_description) old_description.remove();
              }
            );
                    };
                    img_container.animate(animation.new_image, animation_speed, easing,
            function () {
                context.current_index = context.current_index;
                context.current_image = img_container;
                context.current_description = desc;
                context.in_transition = false;
                context._afterShow();
                context.fireCallback(callback);
            }
          );
                } else {
                    this.current_index = index;
                    this.current_image = img_container;
                    context.current_description = desc;
                    this.in_transition = false;
                    context._afterShow();
                    this.fireCallback(callback);
                };
            };
        },
        /**
        * @param function callback Gets fired when the image has loaded, is displaying
        *                          and it's animation has finished
        */
        _showWhenLoaded: function (index, callback) {
            if (this.images[index]) {
                var context = this;
                $jq('#nhs_ImagePlayerCaption').text(_globalCaption[index]);
                $jq('#nhs_MediaPlayerCaption').text(_globalCaption[index]);
                var image = this.images[index];
                var img_container = $(document.createElement('div')).addClass('ad-image');
                img_container.attr('z-index', '10');
                var img = $(new Image()).attr('src', image.image);
                if (image.link) {
                    var link = $('<a href="' + image.link + '" target="_blank" ></a>');
                    link.append(img);
                    img_container.append(link);
                } else {
                    img_container.append(img);
                }
                this.image_wrapper.prepend(img_container);
                //var size = this._getContainedImageSize(image.size.width, image.size.height);
                size = { width: 460, height: 307 }; //force size for details
                //img.attr('width', size.width);
                //img.attr('height', size.height);
                //img_container.css({ width: size.width + 'px', height: size.height + 'px' });
                //this._centerImage(img_container, size.width, size.height);
                var desc = this._getDescription(image, img_container);
                if (desc) {
                    if (!this.settings.description_wrapper) {
                        img_container.append(desc);
                        var width = size.width - parseInt(desc.css('padding-left'), 10) - parseInt(desc.css('padding-right'), 10);
                        //desc.css('width', width + 'px');
                    } else {
                        this.settings.description_wrapper.append(desc);
                    }
                };
                if (image.image.indexOf("brightcove") > -1 || image.image.indexOf("youtu") > -1) {
                    var play_container = $(document.createElement('span'));
                    img_container.append(play_container);
                    var contW = img_container.css('width').replace("px", "");
                    play_container.css('left', '0px');
                    var thumb = this.nav.find('.ad-thumb' + index)[0];
                    if ($(thumb).attr('tmpclick') != null) {
                        play_container.attr('onclick', $(thumb).attr('tmpclick'));
                    }
                }
                else {
                    updatePinterest(image.image, false);
                }
                this.highLightThumb(this.nav.find('.ad-thumb' + index), index);

                var direction = 'right';
                if (this.current_index < index) {
                    direction = 'left';
                };
                this.fireCallback(this.settings.callbacks.beforeImageVisible);
                if (this.current_image || this.settings.animate_first_image) {
                    var animation_speed = this.settings.animation_speed;
                    var easing = 'swing';
                    var animation = this.animations[this.settings.effect].call(this, img_container, direction, desc);
                    if (typeof animation.speed != 'undefined') {
                        animation_speed = animation.speed;
                    };
                    if (typeof animation.easing != 'undefined') {
                        easing = animation.easing;
                    };
                    if (this.current_image) {
                        var old_image = this.current_image;
                        var old_description = this.current_description;
                        old_image.animate(animation.old_image, animation_speed, easing,
              function () {
                  old_image.remove();
                  if (old_description) old_description.remove();
              }
            );
                    };
                    img_container.animate(animation.new_image, animation_speed, easing,
            function () {
                context.current_index = index;
                context.current_image = img_container;
                context.current_description = desc;
                context.in_transition = false;
                context._afterShow();
                context.fireCallback(callback);
            }
          );
                } else {
                    this.current_index = index;
                    this.current_image = img_container;
                    context.current_description = desc;
                    this.in_transition = false;
                    context._afterShow();
                    this.fireCallback(callback);
                };
            };
        },
        nextIndex: function () {
            if (this.current_index == (this.images.length - 1)) {
                if (!this.settings.cycle) {
                    return false;
                };
                var next = 0;
            } else {
                var next = this.current_index + 1;
            };
            return next;
        },
        nextImageThumb: function (callback) {
            var next = this.nextIndex();
            if (next === false) return false;
            //this.preloadImage(next + 1);
            this.showImageThumb(next, callback);
            return true;
        },
        nextImage: function (callback) {
            var next = this.nextIndex();
            if (next === false) return false;
            this.preloadImage(next + 1);
            this.showImage(next, callback);
            var rem = next % 3;
            var Indexclick = ((next - rem) / 3) + 1;
            this.numclicks = Indexclick;
            return true;
        },
        prevIndex: function () {
            if (this.current_index == 0) {
                if (!this.settings.cycle) {
                    return false;
                };
                var prev = this.images.length - 1;
            } else {
                var prev = this.current_index - 1;
            };
            return prev;
        },
        prevImage: function (callback) {
            var prev = this.prevIndex();
            if (prev === false) return false;
            this.preloadImage(prev - 1);
            this.showImage(prev, callback);
            var rem = prev % 3;
            var Indexclick = ((prev - rem) / 3) + 1;
            this.numclicks = Indexclick;
            return true;
        },
        preloadAll: function () {
            var context = this;
            var i = 0;
            function preloadNext() {
                if (i < context.images.length) {
                    i++;
                    context.preloadImage(i, preloadNext);
                };
            };
            context.preloadImage(i, preloadNext);
        },
        preloadImage: function (index, callback) {
            if (this.images[index]) {
                var image = this.images[index];
                if (!this.images[index].preloaded) {
                    var img = $(new Image());
                    img.attr('src', image.image);
                    if (!this.isImageLoaded(img[0])) {
                        this.preloads.append(img);
                        var context = this;
                        img.load(
              function () {
                  image.preloaded = true;
                  image.size = { width: this.width, height: this.height };
                  context.fireCallback(callback);
              }
            ).error(
              function () {
                  image.error = true;
                  image.preloaded = false;
                  image.size = false;
                  //image.image = context.settings.nocdmain;
                  //image.error = false;
                  //image.preloaded = true;
                  //image.size = { width: this.width, height: this.height };
                  //this.in_transition = false;
              }
            );
                    } else {
                        image.preloaded = true;
                        image.size = { width: img[0].width, height: img[0].height };
                        this.fireCallback(callback);
                    };
                } else {
                    this.fireCallback(callback);
                };
            };
        },
        isImageLoaded: function (img) {
            if (typeof img.complete != 'undefined' && !img.complete) {
                return false;
            };
            if (typeof img.naturalWidth != 'undefined' && img.naturalWidth == 0) {
                return false;
            };
            return true;
        },
        highLightThumb: function (thumb, index) {
            this.thumbs_wrapper.find('.ad-active').removeClass('ad-active');
            thumb.addClass('ad-active');

            if (player != undefined)
                player.stopVideo();

            $jq('#vidP').hide();
            $jq('#medP').show();
            _toggleVideo = 0;
            
            if (this.settings.thumb_opacity < 1) {
                this.thumbs_wrapper.find('a:not(.ad-active) img').fadeTo(300, this.settings.thumb_opacity);
                thumb.find('img').fadeTo(300, 1);
            };
            var left = thumb[0].parentNode.offsetLeft;
            left -= (this.nav_display_width / 2) - (thumb[0].offsetWidth / 2);
            left -= 14;

            if (this.current_index > index) {
                this.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
            }
            else if (index != 1) {
                this.thumbs_wrapper.animate({ scrollLeft: left + 'px' });
            }
        },
        fireCallback: function (fn) {
            if ($.isFunction(fn)) {
                fn.call(this);
            };
        }
    };

    function AdGallerySlideshow(nextimage_callback, settings) {
        this.init(nextimage_callback, settings);
    };
    AdGallerySlideshow.prototype = {
        start_link: false,
        stop_link: false,
        countdown: false,
        controls: false,

        settings: false,
        nextimage_callback: false,
        enabled: false,
        running: false,
        countdown_interval: false,
        init: function (nextimage_callback, settings) {
            var context = this;
            this.nextimage_callback = nextimage_callback;
            this.settings = settings;
        },
        create: function () {
            this.start_link = $('<span class="ad-slideshow-start">' + this.settings.start_label + '</span>');
            this.stop_link = $('<span class="ad-slideshow-stop">' + this.settings.stop_label + '</span>');
            this.countdown = $('<span class="ad-slideshow-countdown"></span>');
            //this.controls = $('<div class="ad-slideshow-controls"></div>');
            //this.controls.append(this.start_link).append(this.stop_link).append(this.countdown);
            //$jq('#ssControls').append(this.start_link).append(this.stop_link).append(this.countdown);
            this.countdown.hide();

            var context = this;
            this.start_link.click(
        function () {
            context.start();
        }
      );
            this.stop_link.click(
        function () {
            context.stop();
        }
      );
            $(document).keydown(
        function (e) {
            if (e.keyCode == 83) {
                // 's'
                if (context.running) {
                    context.stop();
                } else {
                    context.start();
                };
            };
        }
      );
            return this.controls;
        },
        disable: function () {
            this.enabled = false;
            this.stop();
            this.controls.hide();
        },
        enable: function () {
            this.enabled = true;
            //this.controls.show();
        },
        toggle: function () {
            if (this.enabled) {
                this.disable();
            } else {
                this.enable();
            };
        },
        start: function () {
            if (this.running || !this.enabled) return false;
            var context = this;
            this.running = true;
            //this.controls.addClass('ad-slideshow-running');
            //$jq('#ssControls').addClass('ad-slideshow-running');
            this._next();
            this.fireCallback(this.settings.onStart);
            return true;
        },
        stop: function () {
            if (!this.running) return false;
            this.running = false;
            this.countdown.hide();
            //this.controls.removeClass('ad-slideshow-running');
            //$jq('#ssControls').removeClass('ad-slideshow-running');
            clearInterval(this.countdown_interval);
            this.fireCallback(this.settings.onStop);
            return true;
        },
        _next: function () {
            var context = this;
            var pre = this.settings.countdown_prefix;
            var su = this.settings.countdown_sufix;
            clearInterval(context.countdown_interval);
            this.countdown.show().html(pre + (this.settings.speed / 1000) + su);
            var slide_timer = 0;
            this.countdown_interval = setInterval(
        function () {
            slide_timer += 1000;
            if (slide_timer >= context.settings.speed) {
                var whenNextIsShown = function () {
                    // A check so the user hasn't stoped the slideshow during the
                    // animation
                    if (context.running) {
                        context._next();
                    };
                    slide_timer = 0;
                };
                if (!context.nextimage_callback(whenNextIsShown)) {
                    context.stop();
                };
                slide_timer = 0;
            };
            var sec = parseInt(context.countdown.text().replace(/[^0-9]/g, ''), 10);
            sec--;
            if (sec > 0) {
                context.countdown.html(pre + sec + su);
            };
        },
        1000
      );
        },
        fireCallback: function (fn) {
            if ($.isFunction(fn)) {
                fn.call(this);
            };
        }
    };
})(jQuery);
