// popover script

'use strict';
class Popover {
    constructor(element, trigger, options) {
        this.options = { // defaults
            position: Popover.TOP
        };
        this.element = element;
        this.trigger = trigger;
        this._isOpen = false;
        Object.assign(this.options, options);
        this.events();
        this.initialPosition();
    }

    events() {
        this.trigger.addEventListener('click', this.toggle.bind(this));
    }

    toggle(e) {
        e.stopPropagation();
        if (this._isOpen) {
            this.close(e);
        } else {
            this.element.style.display = 'block';
            this._isOpen = true;
            this.outsideClick();
            this.position();
        }
    }

    targetIsInsideElement(e) {
        let target = e.target;
        if (target) {
            do {
                if (target === this.element) {
                    return true;
                }
            } while (target = target.parentNode);
        }
        return false;
    }

    close(e) {
        if (!this.targetIsInsideElement(e)) {
            this.element.style.display = 'none';
            this._isOpen = false;
            this.killOutSideClick();
        }
    }



    outsideClick() {
        document.addEventListener('click', this.close.bind(this));
    }

    killOutSideClick() {
        document.removeEventListener('click', this.close.bind(this));
    }

    isOpen() {
        return this._isOpen;
    }
}

Popover.TOP = 'top';
Popover.RIGHT = 'right';
Popover.BOTTOM = 'bottom';
Popover.LEFT = 'left';

document.addEventListener('DOMContentLoaded', function() {

    let btn = document.querySelector('.popoverOpener span'),
        template = document.querySelector('.popover'),
        pop = new Popover(template, btn, {
            position: Popover.Top
        });
    let btn1 = document.querySelector('.adadadsa span'),
        template1 = document.querySelector('.fsdfdfs'),
        pop1 = new Popover(template1, btn1, {
            position: Popover.Top
        });
    // links = template.querySelectorAll('.popover-content a');
    // for (let i = 0, len = links.length; i < len; ++i) {
    //     let link = links[i];
    //     console.log(link);
    //     link.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         pop.position(this.className);
    //         this.blur();
    //         return true;
    //     });
    // }
});


// <!-- Header Script -->

window.onscroll = function() {
    myFunction()
};

var header = document.getElementById("inside-header");
var sticky = header.offsetTop;

function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}


// <!-- read more / less script -->

$(document).ready(function() {
    // Configure/customize these variables.
    var showChar = 250; // How many characters are shown by default
    var ellipsestext = "...";
    var moretext = "more";
    var lesstext = "less";


    $('.more').each(function() {
        var content = $(this).html();

        if (content.length > showChar) {

            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);

            var html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span><span class="morecontent"><span>' + h + '</span><a href="" class="morelink">' + moretext + '</a></span>';

            $(this).html(html);
        }

    });

    $(".morelink").click(function() {
        if ($(this).hasClass("less")) {
            $(this).removeClass("less");
            $(this).html(moretext);
        } else {
            $(this).addClass("less");
            $(this).html(lesstext);
        }
        $(this).parent().prev().toggle();
        $(this).prev().toggle();
        return false;
    });
});



// Location Modal 



(function($) {

    var modaal_loading_spinner = '<div class="modaal-loading-spinner"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>'

    var Modaal = {
        init: function(options, elem) {
            var self = this;

            self.dom = $('body');

            self.$elem = $(elem);
            self.options = $.extend({}, $.fn.modaal.options, self.$elem.data(), options);
            self.xhr = null;

            // set up the scope
            self.scope = {
                is_open: false,
                id: 'modaal_' + (new Date().getTime()) + (Math.random().toString(16).substring(2)),
                source: self.options.content_source ? self.options.content_source : self.$elem.attr('href')
            };

            // add scope attribute to trigger element
            self.$elem.attr('data-modaal-scope', self.scope.id);

            // private options
            self.private_options = {
                active_class: 'is_active'
            };

            self.lastFocus = null;

            // if is_locked
            if (self.options.is_locked || self.options.type == 'confirm' || self.options.hide_close) {
                self.scope.close_btn = '';
            } else {
                self.scope.close_btn = '<button type="button" class="modaal-close" id="modaal-close" aria-label="' + self.options.close_aria_label + '"><span>' + self.options.close_text + '</span></button>';
            }

            // reset animation_speed
            if (self.options.animation === 'none') {
                self.options.animation_speed = 0;
                self.options.after_callback_delay = 0;
            }

            // On click to open modal
            $(elem).on('click.Modaal', function(e) {
                e.preventDefault();
                self.create_modaal(self, e);
            });

            // Define next/prev buttons
            if (self.options.outer_controls === true) {
                var mod_class = 'outer';
            } else {
                var mod_class = 'inner';
            }
            self.scope.prev_btn = '<button type="button" class="modaal-gallery-control modaal-gallery-prev modaal-gallery-prev-' + mod_class + '" id="modaal-gallery-prev" aria-label="Previous image (use left arrow to change)"><span>Previous Image</span></button>';
            self.scope.next_btn = '<button type="button" class="modaal-gallery-control modaal-gallery-next modaal-gallery-next-' + mod_class + '" id="modaal-gallery-next" aria-label="Next image (use right arrow to change)"><span>Next Image</span></button>';

            // Check for start_open
            if (self.options.start_open === true) {
                self.create_modaal(self);
            }
        },

        // Initial create to determine which content type it requires
        // ----------------------------------------------------------------
        create_modaal: function(self, e) {
            var self = this;
            var source;

            // Save last active state before modal
            self.lastFocus = self.$elem;

            if (self.options.should_open === false || (typeof self.options.should_open === 'function' && self.options.should_open() === false)) {
                return;
            }

            // CB: before_open
            self.options.before_open.call(self, e);

            switch (self.options.type) {
                case 'inline':
                    self.create_basic();
                    break;

                case 'ajax':
                    source = self.options.source(self.$elem, self.scope.source);
                    self.fetch_ajax(source);
                    break;

                case 'confirm':
                    self.options.is_locked = true;
                    self.create_confirm();
                    break;

                case 'image':
                    self.create_image();
                    break;

                    // case 'iframe':
                    //  source = self.options.source( self.$elem, self.scope.source );
                    //  self.create_iframe( source );
                    //  break;

                case 'video':
                    self.create_video(self.scope.source);
                    break;

                    // case 'instagram':
                    //  self.create_instagram();
                    //  break;
            }

            // call events to be watched (click, tab, keyup, keydown etc.)
            self.watch_events();
        },

        // Watching Modal
        // ----------------------------------------------------------------
        watch_events: function() {
            var self = this;

            self.dom.off('click.Modaal keyup.Modaal keydown.Modaal');


            // Body click/touch
            self.dom.on('click.Modaal', function(e) {
                var trigger = $(e.target);

                // General Controls: If it's not locked allow greedy close
                if (!self.options.is_locked) {
                    if ((self.options.overlay_close && trigger.is('.modaal-inner-wrapper')) || trigger.is('.modaal-close') || trigger.closest('.modaal-close').length) {
                        self.modaal_close();
                        return;
                    }
                }

                //Confirm Controls
                if (trigger.is('.modaal-confirm-btn')) {
                    // if 'OK' button is clicked, run confirm_callback()
                    if (trigger.is('.modaal-ok')) {
                        self.options.confirm_callback.call(self, self.lastFocus);
                    }

                    if (trigger.is('.modaal-cancel')) {
                        self.options.confirm_cancel_callback.call(self, self.lastFocus);
                    }
                    self.modaal_close();
                    return;
                }


            });
        },

        // Append markup into DOM
        build_modal: function(content) {
            var self = this;
            var wrap_class = (self.options.type == 'video') ? 'modaal-video-wrap' : 'modaal-content';
            var animation_class;
            switch (self.options.animation) {
                case 'fade':
                    animation_class = ' modaal-start_fade';
                    break;
                case 'slide-down':
                    animation_class = ' modaal-start_slidedown';
                    break;
                default:
                    animation_class = ' modaal-start_none'
            }

            // fullscreen check
            var fullscreen_class = '';
            if (self.options.fullscreen) {
                fullscreen_class = ' modaal-fullscreen';
            }

            // custom class check
            // if (self.options.custom_class !== '' || typeof(self.options.custom_class) !== 'undefined') {
            //     self.options.custom_class = ' ' + self.options.custom_class;
            // }

            // if width and heights exists and is typeof number
            var dimensionsStyle = '';
            if (self.options.width && self.options.height && typeof self.options.width == 'number' && typeof self.options.height == 'number') {
                // if width and height exist, and they are both numbers
                dimensionsStyle = ' style="max-width:' + self.options.width + 'px;height:' + self.options.height + 'px;overflow:auto;"';
            } else if (self.options.width && typeof self.options.width == 'number') {
                // if only width
                dimensionsStyle = ' style="max-width:' + self.options.width + 'px;"';
            } else if (self.options.height && typeof self.options.height == 'number') {
                // if only height
                dimensionsStyle = ' style="height:' + self.options.height + 'px;overflow:auto;"';
            }



            // if is touch
            // this is a bug fix for iOS to allow regular click events on div elements.
            var touchTrigger = '';
            if (self.is_touch()) {
                touchTrigger = ' style="cursor:pointer;"'
            }

            var build_markup = '<div class="modaal-wrapper modaal-' + self.options.type + animation_class /*+ igClass */ + fullscreen_class + self.options.custom_class + '" id="' + self.scope.id + '"><div class="modaal-outer-wrapper"><div class="modaal-inner-wrapper"' + touchTrigger + '>';

            // hide if video
            if (self.options.type != 'video') {
                build_markup += '<div class="modaal-container"' + dimensionsStyle + '>';
            }

            // add the guts of the content
            build_markup += '<div class="' + wrap_class + ' modaal-focus" aria-hidden="false" aria-label="' + self.options.accessible_title + ' - ' + self.options.close_aria_label + '" role="dialog">';

            // If it's inline type, we want to clone content instead of dropping it straight in
            if (self.options.type == 'inline') {
                build_markup += '<div class="modaal-content-container" role="document"></div>';
            } else {
                // Drop in the content if it's not inline
                build_markup += content;
            }

            // close wrap_class
            build_markup += '</div>' + self.scope.close_btn;

            // hide if video
            if (self.options.type != 'video') {
                build_markup += '</div>';
            }

            // close off modaal-inner-wrapper
            build_markup += '</div>';

            // If type is image AND outer_controls is true: add gallery next and previous controls.
            if (self.options.type == 'image' && self.options.outer_controls === true) {
                build_markup += self.scope.prev_btn + self.scope.next_btn;
            }

            // close off modaal-wrapper
            build_markup += '</div></div>';

            // append ajax modal markup to dom
            if ($('#' + self.scope.id + '_overlay').length < 1) {
                self.dom.append(build_markup);
            }

            // if inline, clone content into space
            if (self.options.type == 'inline') {
                content.appendTo('#' + self.scope.id + ' .modaal-content-container');
            }

            // Trigger overlay show (which triggers modal show)
            self.modaal_overlay('show');
        },

        // Create Basic Inline Modal
        // ----------------------------------------------------------------
        create_basic: function() {
            var self = this;
            var target = $(self.scope.source);
            var content = '';

            if (target.length) {
                content = target.contents().detach();
                target.empty();
            } else {
                content = 'Content could not be loaded. Please check the source and try again.';
            }

            // now push content into markup
            self.build_modal(content);
        },




        // Open Modaal
        // ----------------------------------------------------------------
        modaal_open: function() {
            var self = this;
            var modal_wrapper = $('#' + self.scope.id);
            var animation_type = self.options.animation;

            if (animation_type === 'none') {
                modal_wrapper.removeClass('modaal-start_none');
                self.options.after_open.call(self, modal_wrapper);
            }

            // Open with fade
            if (animation_type === 'fade') {
                modal_wrapper.removeClass('modaal-start_fade');
            }

            // Open with slide down
            if (animation_type === 'slide-down') {
                modal_wrapper.removeClass('modaal-start_slide_down');
            }

            var focusTarget = modal_wrapper;


            if (self.options.type == 'image') {
                focusTarget = $('#' + self.scope.id).find('.modaal-gallery-item.' + self.private_options.active_class);

                // } else if ( modal_wrapper.find('.modaal-iframe-elem').length ) {
                // focusTarget = modal_wrapper.find('.modaal-iframe-elem');

            } else if (modal_wrapper.find('.modaal-video-wrap').length) {
                focusTarget = modal_wrapper.find('.modaal-video-wrap');

            } else {
                focusTarget = modal_wrapper.find('.modaal-focus');

            }

            // now set the focus
            focusTarget.attr('tabindex', '0').focus();

            // Run after_open
            if (animation_type !== 'none') {
                // CB: after_open
                setTimeout(function() {
                    self.options.after_open.call(self, modal_wrapper)
                }, self.options.after_callback_delay);
            }
        },

        // Close Modal
        // ----------------------------------------------------------------
        modaal_close: function() {
            var self = this;
            var modal_wrapper = $('#' + self.scope.id);

            // CB: before_close
            self.options.before_close.call(self, modal_wrapper);

            if (self.xhr !== null) {
                self.xhr.abort();
                self.xhr = null;
            }

            // Now we close the modal
            if (self.options.animation === 'none') {
                modal_wrapper.addClass('modaal-start_none');
            }

            // Close with fade
            if (self.options.animation === 'fade') {
                modal_wrapper.addClass('modaal-start_fade');
            }

            // Close with slide up (using initial slide down)
            if (self.options.animation === 'slide-down') {
                modal_wrapper.addClass('modaal-start_slide_down');
            }

            // CB: after_close and remove
            setTimeout(function() {
                // clone inline content back to origin place
                if (self.options.type == 'inline') {
                    $('#' + self.scope.id + ' .modaal-content-container').contents().detach().appendTo(self.scope.source)
                }
                // remove markup from dom
                modal_wrapper.remove();
                // CB: after_close
                self.options.after_close.call(self);
                // scope is now closed
                self.scope.is_open = false;

            }, self.options.after_callback_delay);

            // Call overlay hide
            self.modaal_overlay('hide');

            // Roll back to last focus state before modal open. If was closed programmatically, this might not be set
            if (self.lastFocus != null) {
                self.lastFocus.focus();
            }
        },

        // Overlay control (accepts action for show or hide)
        // ----------------------------------------------------------------
        modaal_overlay: function(action) {
            var self = this;

            if (action == 'show') {
                // Modal is open so update scope
                self.scope.is_open = true;

                // set body to overflow hidden if background_scroll is false
                if (!self.options.background_scroll) {
                    self.dom.addClass('modaal-noscroll');
                }

                // append modaal overlay
                if ($('#' + self.scope.id + '_overlay').length < 1) {
                    self.dom.append('<div class="modaal-overlay" id="' + self.scope.id + '_overlay"></div>');
                }

                // now show
                $('#' + self.scope.id + '_overlay').css('background', self.options.background).stop().animate({
                    opacity: self.options.overlay_opacity
                }, self.options.animation_speed, function() {
                    // now open the modal
                    self.modaal_open();
                });

            } else if (action == 'hide') {

                // now hide the overlay
                $('#' + self.scope.id + '_overlay').stop().animate({
                    opacity: 0
                }, self.options.animation_speed, function() {
                    // remove overlay from dom
                    $(this).remove();

                    // remove body overflow lock
                    self.dom.removeClass('modaal-noscroll');
                });
            }
        },

        // Check if is touch
        // ----------------------------------------------------------------
        is_touch: function() {
            return 'ontouchstart' in window || navigator.maxTouchPoints;
        }
    };

    // Define default object to store
    var modaal_existing_selectors = [];

    // Declare the modaal jQuery method
    // ------------------------------------------------------------
    $.fn.modaal = function(options) {
        return this.each(function(i) {
            var existing_modaal = $(this).data('modaal');

            if (existing_modaal) {
                // Checking for string value, used for methods
                if (typeof(options) == 'string') {
                    switch (options) {
                        case 'open':
                            // create the modal
                            existing_modaal.create_modaal(existing_modaal);
                            break;
                        case 'close':
                            existing_modaal.modaal_close();
                            break;
                    }
                }
            } else {
                // Not a string, so let's setup the modal ready to use
                var modaal = Object.create(Modaal);
                modaal.init(options, this);
                $.data(this, "modaal", modaal);

                // push this select into existing selectors array which is referenced during modaal_dom_observer
                modaal_existing_selectors.push({
                    'element': $(this).attr('class'),
                    'options': options
                });
            }
        });
    };

    // Default options
    // ------------------------------------------------------------
    $.fn.modaal.options = {

        //General
        type: 'inline',
        content_source: null,
        animation: 'fade',
        animation_speed: 300,
        after_callback_delay: 350,
        is_locked: false,
        hide_close: false,
        background: '#000',
        overlay_opacity: '0.8',
        overlay_close: true,
        accessible_title: 'Dialog Window',
        start_open: false,
        fullscreen: false,
        custom_class: '',
        background_scroll: false,
        should_open: true,
        close_text: 'Close',
        close_aria_label: 'Close (Press escape to close)',
        width: null,
        height: null,

        //Events
        before_open: function() {},
        after_open: function() {},
        before_close: function() {},
        after_close: function() {},
        source: function(element, src) {
            return src;
        },

        //Confirm Modal
        confirm_button_text: 'Confirm', // text on confirm button
        confirm_cancel_button_text: 'Cancel',
        confirm_title: 'Confirm Title', // title for confirm modal
        confirm_content: '<p>This is the default confirm dialog content. Replace me through the options</p>', // html for confirm message
        confirm_callback: function() {},
        confirm_cancel_callback: function() {},



    };

    // Check and Set Inline Options
    // ------------------------------------------------------------
    function modaal_inline_options(self) {

        // new empty options
        var options = {};
        var inline_options = false;

        // option: type
        if (self.attr('data-modaal-type')) {
            inline_options = true;
            options.type = self.attr('data-modaal-type');
        }

        // option: type
        if (self.attr('data-modaal-content-source')) {
            inline_options = true;
            options.content_source = self.attr('data-modaal-content-source');
        }

        // option: animation
        if (self.attr('data-modaal-animation')) {
            inline_options = true;
            options.animation = self.attr('data-modaal-animation');
        }

        // option: animation_speed
        if (self.attr('data-modaal-animation-speed')) {
            inline_options = true;
            options.animation_speed = self.attr('data-modaal-animation-speed');
        }

        // option: after_callback_delay
        if (self.attr('data-modaal-after-callback-delay')) {
            inline_options = true;
            options.after_callback_delay = self.attr('data-modaal-after-callback-delay');
        }

        // option: is_locked
        if (self.attr('data-modaal-is-locked')) {
            inline_options = true;
            options.is_locked = (self.attr('data-modaal-is-locked') === 'true' ? true : false);
        }

        // option: hide_close
        if (self.attr('data-modaal-hide-close')) {
            inline_options = true;
            options.hide_close = (self.attr('data-modaal-hide-close') === 'true' ? true : false);
        }

        // option: background
        if (self.attr('data-modaal-background')) {
            inline_options = true;
            options.background = self.attr('data-modaal-background');
        }

        // option: overlay_opacity
        if (self.attr('data-modaal-overlay-opacity')) {
            inline_options = true;
            options.overlay_opacity = self.attr('data-modaal-overlay-opacity');
        }

        // option: overlay_close
        if (self.attr('data-modaal-overlay-close')) {
            inline_options = true;
            options.overlay_close = (self.attr('data-modaal-overlay-close') === 'false' ? false : true);
        }

        // option: accessible_title
        if (self.attr('data-modaal-accessible-title')) {
            inline_options = true;
            options.accessible_title = self.attr('data-modaal-accessible-title');
        }

        // option: start_open
        if (self.attr('data-modaal-start-open')) {
            inline_options = true;
            options.start_open = (self.attr('data-modaal-start-open') === 'true' ? true : false);
        }

        // option: fullscreen
        if (self.attr('data-modaal-fullscreen')) {
            inline_options = true;
            options.fullscreen = (self.attr('data-modaal-fullscreen') === 'true' ? true : false);
        }

        // option: custom_class
        if (self.attr('data-modaal-custom-class')) {
            inline_options = true;
            options.custom_class = self.attr('data-modaal-custom-class');
        }

        // option: close_text
        if (self.attr('data-modaal-close-text')) {
            inline_options = true;
            options.close_text = self.attr('data-modaal-close-text');
        }

        // option: close_aria_label
        if (self.attr('data-modaal-close-aria-label')) {
            inline_options = true;
            options.close_aria_label = self.attr('data-modaal-close-aria-label');
        }

        // option: background_scroll
        if (self.attr('data-modaal-background-scroll')) {
            inline_options = true;
            options.background_scroll = (self.attr('data-modaal-background-scroll') === 'true' ? true : false);
        }

        // option: width
        if (self.attr('data-modaal-width')) {
            inline_options = true;
            options.width = parseInt(self.attr('data-modaal-width'));
        }

        // option: height
        if (self.attr('data-modaal-height')) {
            inline_options = true;
            options.height = parseInt(self.attr('data-modaal-height'));
        }

        // option: confirm_button_text
        if (self.attr('data-modaal-confirm-button-text')) {
            inline_options = true;
            options.confirm_button_text = self.attr('data-modaal-confirm-button-text');
        }

        // option: confirm_cancel_button_text
        if (self.attr('data-modaal-confirm-cancel-button-text')) {
            inline_options = true;
            options.confirm_cancel_button_text = self.attr('data-modaal-confirm-cancel-button-text');
        }

        // option: confirm_title
        if (self.attr('data-modaal-confirm-title')) {
            inline_options = true;
            options.confirm_title = self.attr('data-modaal-confirm-title');
        }

        // option: confirm_content
        if (self.attr('data-modaal-confirm-content')) {
            inline_options = true;
            options.confirm_content = self.attr('data-modaal-confirm-content');
        }

        // option: gallery_active_class
        if (self.attr('data-modaal-gallery-active-class')) {
            inline_options = true;
            options.gallery_active_class = self.attr('data-modaal-gallery-active-class');
        }

        // option: loading_content
        if (self.attr('data-modaal-loading-content')) {
            inline_options = true;
            options.loading_content = self.attr('data-modaal-loading-content');
        }

        // option: loading_class
        if (self.attr('data-modaal-loading-class')) {
            inline_options = true;
            options.loading_class = self.attr('data-modaal-loading-class');
        }

        // option: ajax_error_class
        if (self.attr('data-modaal-ajax-error-class')) {
            inline_options = true;
            options.ajax_error_class = self.attr('data-modaal-ajax-error-class');
        }

        // option: start_open
        // if ( self.attr('data-modaal-instagram-id') ) {
        //  inline_options = true;
        //  options.instagram_id = self.attr('data-modaal-instagram-id');
        // }

        // now set it up for the trigger, but only if inline_options is true
        if (inline_options) {
            self.modaal(options);
        }
    };

    // On body load (or now, if already loaded), init any modaals defined inline
    // Ensure this is done after $.fn.modaal and default options are declared
    // ----------------------------------------------------------------
    $(function() {

        var single_modaal = $('.modaal');

        // Check for existing modaal elements
        if (single_modaal.length) {
            single_modaal.each(function() {
                var self = $(this);
                modaal_inline_options(self);
            });
        }

        // Obvserve DOM mutations for newly added triggers
        var modaal_dom_observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // element added to DOM
                    var findElement = [].some.call(mutation.addedNodes, function(el) {
                        var elm = $(el);
                        if (elm.is('a') || elm.is('button')) {

                            if (elm.hasClass('modaal')) {
                                // is inline Modaal, initialise options
                                modaal_inline_options(elm);
                            } else {
                                // is not inline modaal. Check for existing selector
                                modaal_existing_selectors.forEach(function(modaalSelector) {
                                    if (modaalSelector.element == elm.attr('class')) {
                                        $(elm).modaal(modaalSelector.options);
                                        return false;
                                    }
                                });
                            }

                        }
                    });
                }
            });
        });
        var observer_config = {
            subtree: true,
            attributes: true,
            childList: true,
            characterData: true
        };

        // pass in the target node, as well as the observer options
        setTimeout(function() {
            modaal_dom_observer.observe(document.body, observer_config);
        }, 500);

    });

}(jQuery, window, document));

/*
 * trigger the modal, this can be put in with the HTML
 */
$(".inline-content").modaal({
    content_source: '#inline-content'
});