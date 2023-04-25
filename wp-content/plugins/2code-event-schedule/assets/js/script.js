// v1.2.6
(function($) {
    moment.locale(settings.locale);

    $('.artist-row').magnificPopup({
        removalDelay: 500, //delay removal by X to allow out-animation
        callbacks: {
            beforeOpen: function() {
                this.st.mainClass = this.st.el.attr('data-effect');
            }
        },
        midClick: true, // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
        items: {
            src: '#tcode-popup-container',
            type: 'inline'
        },
        closeMarkup: '<button title="%title%" type="button" class="mfp-close"></button>',
        prependTo: '.tcode-event-schedule'
    });

    $('.tcode-event-schedule .dayTitle').each(function() {
        var time = moment($(this).text().trim(), 'YYYY-MM-DD');
        if ($(this).hasClass('mobile')) {
            var format = 'dddd';
        } else {
            var format = settings.dayFormat;
        }
        $(this).html(time.format(format));
    });

    $('.tcode-event-schedule .row-date').each(function() {
        var time = moment($(this).text().trim(), 'YYYY-MM-DD');
        $(this).html(time.format(settings.dateFormat));
    });

    $('.tcode-event-schedule .time-starts, .tcode-event-schedule .time-ends').each(function() {
        var time = moment($(this).text().trim(), 'HH:mm');
        $(this).html(time.format(settings.timeFormat));
    });

    $('.tcode-social-icon').off('click').on('click', function(e) {
        console.log('test');
        e.stopPropagation();
    });

    function replaceImgWithSvg() {
        $('img.svg').each(function () {
            var $img = $(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            if (!imgURL.match('.svg')) {
                return;
            }

            $.get(imgURL, function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = $(data).find('svg');

                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    imgClass = imgClass.replace('img-responsive ', '').replace('center-block', '');
                    $svg = $svg.attr('class', imgClass + ' replaced-svg');
                }

                $svg = $svg.removeAttr('height').removeAttr('width');

                var parent = $img.parent();
                var parentClass = parent.attr('class');

                if (typeof parentClass !== 'undefined') {
                    parentClass = parentClass + ' svgContainer';
                } else {
                    parentClass = 'svgContainer';
                }

                parent.attr('class', parentClass);

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Replace image with new SVG
                $img.replaceWith($svg);

            }, 'xml');
        });
    }

    $.widget('2code.schedule', {
        widgetEventPrefix: 'schedule:',
        schedule: [],
        mobileSchedule: [],

        locations: [],
        mobileLocations: [],
        locationElement: {},
        locationGrpElement: {},

        dayElement: {},

        dates: [],

        date: '',
        location: '',

        options: {
            showLocations: true,
            keepAccordionsOpen: false,
            openFirstAccordion: false
        },
        expanding: false,

        // Construct
        _create: function () {
            this.schedule = this.element.find('.scheduled-events.desktop');
            this.mobileSchedule = this.element.find('.scheduled-events.mobile');
            this.locations = this.element.find('.scheduled-locations.desktop');
            this.mobileLocations = this.element.find('.scheduled-locations.mobile');
            this.dates = this.element.find('.scheduled-days');
            this.date = this.element.find('.scheduled-day.active').data('date');
            this.location = this.element.find('.scheduled-location.active').data('location');
            this.artists = this.schedule.find('.artist-row');
            this.mobileArtists = this.mobileSchedule.find('.artist-row.mobile');
        },
        // Startup functions
        _init: function() {
            // Setup dates
            this._initDays();
            // Setup locations
            this._initLocations();
            // Setup excerpt
            this._initExcerpts();
            // Setup author popups
            this._initPopups();
            // After setup filter
            this._filter(true);

            //this._trigger('initialized', true);
            if (settings.imageType === 'svg') {
                //$('body').on('schedule:initialized', function() {
                    //console.log('test');
                    replaceImgWithSvg();
                //});
            }
        },
        _initDays: function() {
            var _self = this;

            $('.scheduled-day').on('click', function() {
                if ($(this).hasClass('active')) {
                    if ($(this).hasClass('mobile')) {
                        _self.date = 'unset';
                        _self._filter(true);
                    }
                    return;
                }

                _self.date = $(this).data('date');
                _self._filter(true);
            });
        },
        _initLocations: function() {
            var _self = this;

            $('.scheduled-location').on('click', function() {
                if ($(this).hasClass('active')) {
                    if ($(this).parent().hasClass('mobile')) {
                        _self.location = '#noloc#';
                        _self._showLocation();
                        _self._filter();
                    }
                    return;
                }

                _self.location = $(this).data('location');
                _self._showLocation();

                _self._filter();
            });
        },
        _showLocation: function() {
            var _self = this;
            $('.scheduled-location.active').removeClass('active');

            this.locations.find('.scheduled-location').each(function() {
                if ($(this).data('location') === _self.location) {
                    $(this).addClass('active');
                }
            });

            this.mobileLocations.find('.scheduled-location').each(function() {
                if ($(this).data('location') === _self.location) {
                    $(this).addClass('active');
                    if ($(this).parent().data('date') === _self.date) {
                        _self.locationElement = $(this);
                    }
                }
            });
        },
        _initExcerpts: function() {
            var _self = this;

            $('body').on('click', '.scheduled-event', function() {
                if ($(this).hasClass('hideExcerpt')) {
                    return;
                }
                _self._switchExcerptState($(this));
            });

            $('body').on('click', '.scheduled-event a', function(e) {
                e.stopPropagation();
            });

            // Expand first accordion
            this._expandFirstExcerpt();
        },
        _initPopups: function() {
            var self = this;

            $('body').on('click', '.tcode-artist-popover-close', function(event) {
                event.stopPropagation();
                event.preventDefault();

                $('#tcode-popup-container .scheduled-event').html();
                $.magnificPopup.close();
            });

            self.artists.each(function() {
                var trigger = $(this);
                var popup = trigger.find('.tcode-artist-popover');

                trigger.on('click', function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    $('#tcode-popup-container .scheduled-event').html(popup.clone(true,true).removeClass('hidden'));
                });
            });

            self.mobileArtists.each(function() {
                var trigger = $(this);
                var popup = trigger.find('.tcode-artist-popover');

                trigger.live('click', function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    $('#tcode-popup-container .scheduled-event').html(popup.clone(true,true).removeClass('hidden'));
                });
            });
        },
        _expandFirstExcerpt: function() {
            if (!this.options.openFirstAccordion) {
                return;
            }

            var event = this.schedule.find('.scheduled-event.event-visible').first();
            var mobileEvent = this.mobileSchedule.find('.scheduled-event.event-visible').first();

            if (
                (event.hasClass('hideExcerpt') || !event.hasClass('event-collapsed'))
                    ||
                (mobileEvent.length > 0 && (mobileEvent.hasClass('hideExcerpt') || !mobileEvent.hasClass('event-collapsed')))
            ) {
                return;
            }

            this._collapseExcerpts();

            if (event.hasClass('event-collapsed')) {
                this._expandExcerpt(event);
            }
            if (mobileEvent.hasClass('event-collapsed')) {
                this._expandExcerpt(mobileEvent);
            }
        },
        _switchExcerptState: function(element) {
            var isCollapsed = element.hasClass('event-collapsed');
            this._collapseExcerpts();

            if (isCollapsed) {
                this._expandExcerpt(element);
            } else {
                this._collapseExcerpt(element);
            }
        },
        _collapseExcerpts: function() {
            var _self = this;

            if (this.options.keepAccordionsOpen) {
                return;
            }

            this.element.find('.event-expanded').each(function() {
                _self._collapseExcerpt($(this));
            });
        },
        _expandExcerpt: function(element) {
            element.find('.event-icon i')
                .switchClass('tcode-ico-grot-down', 'tcode-ico-grot-up')
                .data('state', 'expanded');
            element.find('.event-excerpt').slideDown(400, function() {
                console.log('test');
                this.expanding = false;
            });
            element.switchClass('event-collapsed', 'event-expanded');
        },
        _collapseExcerpt: function(element) {
            element.find('.event-icon i')
                .switchClass('tcode-ico-grot-up', 'tcode-ico-grot-down')
                .data('state', 'collapsed');
            element.find('.event-excerpt').slideUp();
            element.switchClass('event-expanded', 'event-collapsed');
        },
        _filter: function(redraw) {
            var _self = this;

            if (redraw) {
                _self.dates.find('.scheduled-day').each(function() {
                    if ($(this).data('date') === _self.date && !$(this).hasClass('active')) {
                        $(this).addClass('active');
                    } else if ($(this).data('date') !== _self.date && $(this).hasClass('active'))  {
                        $(this).removeClass('active');
                    }

                    if ($(this).hasClass('mobile') && $(this).hasClass('active')) {
                        _self.dayElement = $(this);
                    }
                });

                if (_self.options.showLocations) {
                    _self._locationsFilter(_self.locations);
                    _self._locationsFilter(_self.mobileLocations);
                }
            }

            _self.schedule.find('.scheduled-event').each(function() {
                if ($(this).data('date') !== _self.date || (_self.options.showLocations && $(this).data('location').match(_self.location) === null)) {
                    $(this).slideUp().removeClass('event-visible').addClass('event-hidden');
                } else {
                    $(this).slideDown().removeClass('event-hidden').addClass('event-visible');
                }
            });

            _self.mobileSchedule.find('.scheduled-event').each(function() {
                if ($(this).data('date') !== _self.date || (_self.options.showLocations && $(this).data('location').match(_self.location) === null)) {
                    var clone = _self.mobileLocations.find('.' + $(this).data('event'));
                    if (clone.length <= 0) {
                        clone = _self.element.find('.scheduled-days .days-mobile .' + $(this).data('event'));
                    }
                    var cloneParent = clone.parent();
                    clone.slideUp(400, function() {
                        $(this).remove();

                        if (cloneParent.hasClass('location-events') && cloneParent.find('.scheduled-event').length === 0) {
                            cloneParent.remove();
                        }
                    });
                } else {
                    var clone = $(this).clone(true, true);
                    if (_self.options.showLocations) {
                        if (_self.locationElement.next().hasClass('location-events')) {
                            var div = _self.locationElement.next();
                        } else {
                            var div = $('<div/>').addClass('location-events');
                            div.insertAfter(_self.locationElement);
                        }

                        if (_self.locationElement.length > 0) {
                            clone.appendTo(div);
                        } else {
                            clone.appendTo(_self.locationGrpElement);
                        }

                        var timer = setInterval(function() {
                            if (_self.mobileLocations.filter(':animated').length === 0) {
                                clone.slideDown(400);
                                clone.removeClass('event-hidden').addClass('event-visible');
                                clearInterval(timer);
                            }
                        }, 100);
                    } else {
                        if (_self.dayElement.next().hasClass('location-events')) {
                            var div = _self.dayElement.next();
                        } else {
                            var div = $('<div/>').addClass('location-events col-xs-12');
                            div.insertAfter(_self.dayElement);
                        }

                        clone.appendTo(div);
                        var timer = setInterval(function() {
                            if (_self.mobileLocations.filter(':animated').length === 0) {
                                clone.slideDown(400);//
                                clone.removeClass('event-hidden').addClass('event-visible');
                                clearInterval(timer);
                            }
                        }, 100);
                    }
                }
            });

            this._checkVisibleEvents();

            var timer = setInterval(function() {
                if ($(':animated').length === 0) {
                    _self._expandFirstExcerpt();
                    clearInterval(timer);
                }
            }, 100);
        },
        _locationsFilter: function(locations) {
            var _self = this;

            locations.each(function() {
                if ($(this).data('date') !== _self.date) {
                    $(this).slideUp().removeClass('locations-visible').addClass('locations-hidden');
                } else {
                    $(this).slideDown().removeClass('locations-hidden').addClass('locations-visible');
                }
            });

            locations.each(function() {
                var locationGrp = $(this);

                if (locationGrp.hasClass('locations-visible')) {
                    var location = locationGrp.find('.scheduled-location').first();
                    locationGrp.find('.scheduled-location.active').removeClass('active')
                    location.addClass('active');

                    _self.location = location.data('location');
                    if (locationGrp.hasClass('mobile')) {
                        _self.locationElement = location;
                        _self.locationGrpElement = locationGrp;
                    }
                }
            });
        },
        _checkVisibleEvents: function() {
            if (this.schedule.find('.event-visible').length === 0) {
                this.element.find('.no-events').slideDown();
            } else {
                this.element.find('.no-events').slideUp();
            }
        }
    });
})(jQuery);