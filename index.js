var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var vevet = new Vevet.Application({
    tablet: 1199,
    phone: 899,
    prefix: 'v-',
    viewportResizeTimeout: 100,
    easing: [0.25, 0.1, 0.25, 1]
});
vevet.pageLoad.onLoaded(function () {
    //scrollBarInit
    var scrollBarInit = function () {
        var scrollBar;
        if (!vevet.isMobile) {
            scrollBar = new Vevet.ScrollBar({ container: window });
        }
        return scrollBar;
    };
    scrollBarInit();
    var useObserver = function (_a) {
        var target = _a.target, callbackIn = _a.callbackIn, callbackOut = _a.callbackOut, _b = _a.isCallOnce, isCallOnce = _b === void 0 ? false : _b;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var element = entry.target;
                if (entry.isIntersecting) {
                    // console.log(entry, element);
                    if (!callbackIn) {
                        return;
                    }
                    callbackIn(element);
                    if (isCallOnce) {
                        observer.unobserve(element);
                    }
                }
                else {
                    if (!callbackOut) {
                        return;
                    }
                    callbackOut(element);
                }
            }, {
                root: null,
                threshold: 0,
                rootMargin: '0px 0px 0px 0px'
            });
        });
        if (!target) {
            return undefined;
        }
        observer.observe(target);
        return observer;
    };
    var useOutsideClick = function (element, callback) {
        var listener = function (event) {
            if (!element.contains(event === null || event === void 0 ? void 0 : event.target) && event.which === 1) {
                callback();
            }
        };
        document.addEventListener('mousedown', listener);
    };
    var useOnEscape = function (callback) {
        window.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) {
                callback();
            }
        });
    };
    var renderModalAnimation = function (_a) {
        var progress = _a.progress, easing = _a.easing, parent = _a.parent, overlay = _a.overlay, scroll = _a.scroll, additional = _a.additional;
        if (parent) {
            var element = parent;
            element.style.display = "".concat(progress > 0 ? 'flex' : 'none');
            element.style.opacity = "".concat(progress > 0 ? 1 : 0);
        }
        if (overlay) {
            var element = overlay;
            element.style.opacity = "".concat(easing);
        }
        if (scroll) {
            var element = scroll;
            element.style.opacity = "".concat(easing);
            if (parent.classList.contains('popup-menu')) {
                element.style.transform = "translateX(".concat((1 - easing) * 100, "%)");
            }
            else {
                element.style.transform = "translateY(".concat((1 - easing) * 2, "rem)");
            }
        }
        if (additional) {
            var element = additional;
            element.style.opacity = "".concat(easing);
            if (parent.classList.contains('popup-menu')) {
                element.style.transform = "translateX(".concat((1 - easing) * 100, "%)");
            }
            else {
                element.style.transform = "translateY(".concat((1 - easing) * 2, "rem)");
            }
        }
    };
    var makeTimeline = function (parent, scroll, overlay, additional, video) {
        if (!parent || !scroll || !overlay) {
            return undefined;
        }
        var timeline = new Vevet.Timeline({
            duration: 600,
            easing: [0.25, 0.1, 0.25, 1]
        });
        timeline.addCallback('start', function () {
            var _a, _b;
            if (!timeline.isReversed) {
                (_a = document.querySelector('html')) === null || _a === void 0 ? void 0 : _a.classList.add('lock');
                (_b = document.querySelector('body')) === null || _b === void 0 ? void 0 : _b.classList.add('lock');
                parent.classList.add('_opened');
                if (video) {
                    video.play();
                }
            }
        });
        timeline.addCallback('progress', function (_a) {
            var progress = _a.progress, easing = _a.easing;
            renderModalAnimation({
                parent: parent,
                scroll: scroll,
                overlay: overlay,
                progress: progress,
                easing: easing,
                additional: additional
            });
        });
        timeline.addCallback('end', function () {
            var _a, _b;
            if (timeline.isReversed) {
                (_a = document.querySelector('html')) === null || _a === void 0 ? void 0 : _a.classList.remove('lock');
                (_b = document.querySelector('body')) === null || _b === void 0 ? void 0 : _b.classList.remove('lock');
                parent.classList.remove('_opened');
                if (video) {
                    video.pause();
                }
            }
        });
        return timeline;
    };
    //popup class
    var Popup = /** @class */ (function () {
        function Popup(domElement) {
            var _this = this;
            this._isThanks = false;
            this._isError = false;
            this._closeButtons = [];
            this._openButtons = [];
            this._parent = domElement;
            this._name = domElement.dataset.popupname;
            this._scroll = this._parent.querySelector('.popup__scroll');
            this._overlay = this._parent.querySelector('.popup__overlay');
            this._wrapper = this._parent.querySelector('.popup__wrapper');
            this._additional = this._parent.querySelector('.popup__additional');
            this._video = this._parent.querySelector('.video');
            if (!this._name || !this._scroll || !this._overlay || !this._wrapper) {
                return;
            }
            this._isThanks = this._name === '_popup-thanks';
            this._isError = this._name === '_popup-error';
            this._timeline = makeTimeline(this._parent, this._scroll, this._overlay, this._additional, this._video);
            this._openButtons = Array.from(document.querySelectorAll("[data-popup=\"".concat(this._name, "\"]")));
            this._closeButtons = Array.from(this._parent.querySelectorAll('.popup__close, .popup__button'));
            if (this._closeButtons.length !== 0) {
                this._closeButtons.forEach(function (button) {
                    if (!button) {
                        return;
                    }
                    button.addEventListener('click', function () {
                        var _a;
                        (_a = _this._timeline) === null || _a === void 0 ? void 0 : _a.reverse();
                    });
                });
            }
            useOutsideClick(this._wrapper, function () {
                var _a, _b, _c, _d;
                if (_this._parent.classList.contains('_opened')) {
                    (_a = _this._timeline) === null || _a === void 0 ? void 0 : _a.reverse();
                    (_b = document.querySelector('html')) === null || _b === void 0 ? void 0 : _b.classList.remove('lock');
                    (_c = document.querySelector('body')) === null || _c === void 0 ? void 0 : _c.classList.remove('lock');
                    (_d = _this._video) === null || _d === void 0 ? void 0 : _d.pause();
                }
            });
            useOnEscape(function () {
                var _a, _b, _c, _d;
                if (_this._parent.classList.contains('_opened')) {
                    (_a = _this._timeline) === null || _a === void 0 ? void 0 : _a.reverse();
                    (_b = document.querySelector('html')) === null || _b === void 0 ? void 0 : _b.classList.remove('lock');
                    (_c = document.querySelector('body')) === null || _c === void 0 ? void 0 : _c.classList.remove('lock');
                    (_d = _this._video) === null || _d === void 0 ? void 0 : _d.pause();
                }
            });
        }
        Object.defineProperty(Popup.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "isThanks", {
            get: function () {
                return this._isThanks;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "isError", {
            get: function () {
                return this._isError;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "scroll", {
            get: function () {
                return this._scroll;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "overlay", {
            get: function () {
                return this._overlay;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "additional", {
            get: function () {
                return this._additional;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "wrapper", {
            get: function () {
                return this._wrapper;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "video", {
            get: function () {
                return this._video;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "timeline", {
            get: function () {
                return this._timeline;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "closeButtons", {
            get: function () {
                return this._closeButtons;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "openButtons", {
            get: function () {
                return this._openButtons;
            },
            enumerable: false,
            configurable: true
        });
        Popup.prototype.initOpen = function (popupArr) {
            var _this = this;
            if (popupArr.length === 0 || !this._openButtons) {
                return;
            }
            this._openButtons.forEach(function (openBtn) {
                openBtn.addEventListener('click', function (evt) {
                    var _a;
                    evt.preventDefault();
                    popupArr.forEach(function (popup) {
                        var _a;
                        if (popup.parent.classList.contains('_opened') &&
                            popup.name !== _this._name) {
                            (_a = popup.timeline) === null || _a === void 0 ? void 0 : _a.reverse();
                        }
                    });
                    (_a = _this._timeline) === null || _a === void 0 ? void 0 : _a.play();
                });
            });
        };
        return Popup;
    }());
    //initPopup
    var initPopups = function () {
        var popupDomArr = document.querySelectorAll('.popup');
        if (popupDomArr.length === 0) {
            return [];
        }
        var popupArr = [];
        popupDomArr.forEach(function (element) {
            var popup = new Popup(element);
            popupArr.push(popup);
        });
        popupArr.forEach(function (popup) {
            popup.initOpen(popupArr);
        });
        return popupArr;
    };
    var makeSlider = function (_a) {
        var container = _a.container, className = _a.className, _b = _a.isThumb, isThumb = _b === void 0 ? false : _b, _c = _a.thumb, thumb = _c === void 0 ? undefined : _c, config = _a.config, renderBullets = _a.renderBullets;
        if (!container || !className) {
            return undefined;
        }
        var slider = container.querySelector(".".concat(className, "-slider").concat(isThumb ? '-thumb' : '', ".swiper")) || null;
        if (!slider) {
            return undefined;
        }
        var pagination = container.querySelector(".".concat(className, "-slider-pagination"));
        var arrowPrev = container.querySelector(".".concat(className, "-slider").concat(isThumb ? '-thumb' : '', "-controls .").concat(className, "-slider-prev"));
        var arrowNext = container.querySelector(".".concat(className, "-slider").concat(isThumb ? '-thumb' : '', "-controls .").concat(className, "-slider-next"));
        var sliderInit = new Swiper(slider, __assign({ 
            //modules: [Navigation, Thumbs, Pagination, EffectFade, Autoplay],
            thumbs: {
                swiper: thumb
            }, pagination: {
                el: pagination,
                clickable: true,
                renderBullet: renderBullets
            }, navigation: {
                nextEl: arrowNext,
                prevEl: arrowPrev
            }, slidesPerView: 1, spaceBetween: 30 }, config));
        return sliderInit;
    };
    var sliderBannerInit = function (sliders) {
        var containerArray = document.querySelectorAll('.banner');
        if (containerArray.length === 0) {
            return;
        }
        containerArray.forEach(function (item, sliderIndex) {
            var slider = makeSlider({
                container: item,
                className: 'banner',
                renderBullets: function (index, className) {
                    return "\n            <button class=\"".concat(className, "\">\n              <svg class=\"pagination-star\" width=\"28\" height=\"26\" viewBox=\"0 0 28 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M14 1.61804L16.6677 9.82827L16.7799 10.1738H17.1432H25.776L18.7919 15.248L18.498 15.4615L18.6103 15.807L21.2779 24.0172L14.2939 18.943L14 18.7295L13.7061 18.943L6.72206 24.0172L9.38973 15.807L9.50199 15.4615L9.20809 15.248L2.22405 10.1738H10.8568H11.2201L11.3323 9.82827L14 1.61804Z\" fill=\"white\" stroke=\"#066dca\"/>\n              </svg>\n            </button>\n          ");
                },
                config: {
                    effect: 'fade',
                    allowTouchMove: false,
                    autoplay: {
                        delay: 6000,
                        disableOnInteraction: false
                    }
                }
            });
            if (slider) {
                sliders.push({ name: "banner-".concat(sliderIndex), slider: slider });
            }
        });
    };
    var sliderInfoInit = function (sliders) {
        var containerArray = document.querySelectorAll('.about-info');
        if (containerArray.length === 0) {
            return;
        }
        containerArray.forEach(function (item, sliderIndex) {
            var slider = makeSlider({
                container: item,
                className: 'about-info',
                renderBullets: function (index, className) {
                    return "\n            <button class=\"".concat(className, "\">\n              <svg class=\"pagination-star\" width=\"28\" height=\"26\" viewBox=\"0 0 28 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M14 1.61804L16.6677 9.82827L16.7799 10.1738H17.1432H25.776L18.7919 15.248L18.498 15.4615L18.6103 15.807L21.2779 24.0172L14.2939 18.943L14 18.7295L13.7061 18.943L6.72206 24.0172L9.38973 15.807L9.50199 15.4615L9.20809 15.248L2.22405 10.1738H10.8568H11.2201L11.3323 9.82827L14 1.61804Z\" fill=\"transparent\" stroke=\"#066dca\"/>\n              </svg>\n            </button>\n          ");
                },
                config: {
                    effect: 'fade',
                    allowTouchMove: false,
                    autoplay: {
                        delay: 6000,
                        disableOnInteraction: false
                    }
                }
            });
            if (slider) {
                sliders.push({ name: "about-info-".concat(sliderIndex), slider: slider });
            }
        });
    };
    var sliderServicesInit = function (sliders) {
        var containerArray = document.querySelectorAll('.services');
        if (containerArray.length === 0) {
            return;
        }
        containerArray.forEach(function (item, sliderIndex) {
            var slider = makeSlider({
                container: item,
                className: 'services',
                renderBullets: function (index, className) {
                    return "\n            <button class=\"".concat(className, "\"></button>\n          ");
                },
                config: {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    breakpoints: {
                        660: {
                            slidesPerView: 2,
                            slidesPerGroup: 2
                        },
                        1199: {
                            slidesPerView: 3,
                            slidesPerGroup: 3
                        }
                    }
                }
            });
            if (slider) {
                sliders.push({ name: "services-".concat(sliderIndex), slider: slider });
            }
        });
    };
    var slidersInit = function () {
        var sliders = [];
        sliderBannerInit(sliders);
        sliderInfoInit(sliders);
        sliderServicesInit(sliders);
        return sliders;
    };
    slidersInit();
    //languageToggle
    var languageToggle = function () {
        var elements = document.querySelectorAll('.menu__lang');
        if (elements.length === 0) {
            return;
        }
        elements.forEach(function (element) {
            if (vevet.isMobile) {
                element.addEventListener('click', function () {
                    element.classList.add('viewed');
                });
                useOutsideClick(element, function () {
                    element.classList.remove('viewed');
                });
                return;
            }
            element.addEventListener('mouseenter', function () {
                element.classList.add('viewed');
            });
            element.addEventListener('mouseleave', function () {
                element.classList.remove('viewed');
            });
        });
    };
    languageToggle();
    var makeTimelineCounter = function (_a) {
        var itemProp = _a.item;
        var item = itemProp;
        var value = +(item.dataset.value || 0);
        if (Number.isNaN(value)) {
            return undefined;
        }
        var timeline = new Vevet.Timeline({ duration: 4000, destroyOnEnd: true });
        timeline.addCallback('progress', function (_a) {
            var easing = _a.easing;
            item.innerHTML = "".concat(Math.floor(value * easing));
        });
        timeline.addCallback('end', function () {
            item.classList.add('finished');
        });
        return timeline;
    };
    var makeCounter = function (_a) {
        var item = _a.item, container = _a.container;
        var timeline = makeTimelineCounter({ item: item });
        if (!timeline) {
            return;
        }
        useObserver({
            target: container,
            isCallOnce: true,
            callbackIn: function () {
                timeline.play();
            }
        });
    };
    var counterInit = function () {
        var containerArray = document.querySelectorAll('.counter-container');
        if (containerArray.length === 0) {
            return;
        }
        containerArray.forEach(function (container) {
            var counterArray = container.querySelectorAll('.counter');
            if (counterArray.length === 0) {
                return;
            }
            counterArray.forEach(function (item) {
                makeCounter({ item: item, container: container });
            });
        });
    };
    counterInit();
    //initFadeSection
    var initFadeSection = function (section, activeKey) {
        if (activeKey === void 0) { activeKey = '1'; }
        var useParentHeight = function (element) {
            var currentHeight = 0;
            var save = function () {
                var parent = element;
                if (!parent) {
                    return;
                }
                currentHeight = parent.clientHeight;
                parent.style.height = "".concat(currentHeight, "px");
            };
            var reset = function () {
                var parent = element;
                if (!parent) {
                    return;
                }
                currentHeight = 0;
                parent.style.height = '';
            };
            var interpolate = function (targetHeight, progress) {
                var parent = element;
                if (!parent) {
                    return;
                }
                var startHeight = currentHeight;
                var difference = targetHeight - startHeight;
                var height = startHeight + difference * progress;
                parent.style.height = "".concat(height, "px");
            };
            return { save: save, reset: reset, interpolate: interpolate };
        };
        var makeTimeline = function (_a) {
            var showItemProp = _a.showItem, hideItemProp = _a.hideItem, parentHeight = _a.parentHeight, sectionProp = _a.section, activeHeight = _a.activeHeight, _b = _a.duration, duration = _b === void 0 ? 600 : _b;
            var showItem = showItemProp;
            var hideItem = hideItemProp;
            var section = sectionProp;
            var timeline = new Vevet.Timeline({
                duration: duration,
                easing: [0.25, 0.1, 0.25, 1]
            });
            timeline.addCallback('start', function () {
                parentHeight.save();
                hideItem.classList.add('unactive');
                showItem.classList.remove('unactive');
            });
            timeline.addCallback('progress', function (_a) {
                var progress = _a.progress;
                section.style.pointerEvents = 'none';
                parentHeight.interpolate(activeHeight, progress);
                showItem.style.opacity = "".concat(progress);
                hideItem.style.opacity = "".concat(1 - progress);
            });
            timeline.addCallback('end', function () {
                section.style.pointerEvents = '';
                timeline.destroy();
                parentHeight.reset();
            });
            timeline.play();
        };
        var parent = section.querySelector('.fade-section-content');
        if (!parent) {
            return;
        }
        var state = {
            active: {
                key: activeKey,
                item: undefined,
                button: undefined
            },
            prev: {
                key: activeKey,
                item: undefined,
                button: undefined
            },
            parent: {
                item: parent,
                parentHeight: useParentHeight(parent),
                activeHeight: parent.clientHeight
            }
        };
        var buttons = Array.from(section.querySelectorAll('.fade-section__button'));
        var items = Array.from(section.querySelectorAll('.fade-section-content__item'));
        if (items.length === 0) {
            return;
        }
        state.active.button = section.querySelector('.fade-section__button.active');
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var data = button.dataset.item;
                state.prev.key = state.active.key;
                state.active.key = data || '1';
                state.prev.button = state.active.button;
                state.active.button = button;
                var showItem;
                var hideItem;
                if (state.prev.key === state.active.key) {
                    return;
                }
                if (state.prev.button) {
                    state.prev.button.classList.remove('active');
                }
                state.active.button.classList.add('active');
                items.forEach(function (item) {
                    if (item.dataset.item === state.active.key) {
                        showItem = item;
                    }
                    if (item.dataset.item === state.prev.key) {
                        hideItem = item;
                    }
                });
                if (!showItem || !hideItem) {
                    return;
                }
                state.parent.activeHeight = showItem.clientHeight;
                state.parent.parentHeight.save();
                makeTimeline({
                    showItem: showItem,
                    hideItem: hideItem,
                    parentHeight: state.parent.parentHeight,
                    section: section,
                    activeHeight: state.parent.activeHeight
                });
            });
        });
    };
    //fadeContentInit
    var fadeContentInit = function () {
        var sectionArr = document.querySelectorAll('.fade-section');
        if (sectionArr.length === 0) {
            return;
        }
        sectionArr.forEach(function (section) {
            initFadeSection(section);
        });
    };
    fadeContentInit();
    var popups = initPopups();
    var formArr = document.querySelectorAll('form');
    var hasError = false;
    if (formArr.length !== 0) {
        // formArr.forEach((form) => {
        //   form.addEventListener('submit', (evt) => {
        //     evt.preventDefault();
        //     const inputs = Array.from(
        //       form.querySelectorAll('input, textarea') as NodeListOf<
        //         HTMLInputElement | HTMLTextAreaElement
        //       >
        //     );
        //     popups.forEach(({ timeline, isThanks, isError }) => {
        //       if (isThanks && !hasError) {
        //         timeline?.play();
        //         if (inputs.length !== 0) {
        //           inputs.forEach((inputProp) => {
        //             const input = inputProp;
        //             input.value = '';
        //           });
        //         }
        //       } else if (isError && hasError) {
        //         timeline?.play();
        //       } else {
        //         timeline?.reverse();
        //       }
        //     });
        //   });
        // });
        document.addEventListener('wpcf7mailsent', function () {
            popups.forEach(function (_a) {
                var timeline = _a.timeline, isThanks = _a.isThanks, isError = _a.isError;
                if (isThanks && !hasError) {
                    timeline === null || timeline === void 0 ? void 0 : timeline.play();
                    // if (inputs.length !== 0) {
                    //   inputs.forEach((inputProp) => {
                    //     const input = inputProp;
                    //     input.value = '';
                    //   });
                    // }
                }
                else if (isError && hasError) {
                    timeline === null || timeline === void 0 ? void 0 : timeline.play();
                }
                else {
                    timeline === null || timeline === void 0 ? void 0 : timeline.reverse();
                }
            });
        }, false);
    }
});
