const vevet = new Vevet.Application({
  tablet: 1199,
  phone: 899,
  prefix: 'v-',
  viewportResizeTimeout: 100,
  easing: [0.25, 0.1, 0.25, 1],
});

vevet.pageLoad.onLoaded(() => {
  //scrollBarInit
  const scrollBarInit = () => {
    let scrollBar;
    if (!vevet.isMobile) {
      scrollBar = new Vevet.ScrollBar({ container: window });
    }

    return scrollBar;
  };
  scrollBarInit();

  //config
  //useOutsideClick
  type TCallback = (element: Element) => void;

  interface IUseObserverProps {
    target: HTMLElement | null;
    callbackIn?: TCallback;
    callbackOut?: TCallback;
    isCallOnce?: boolean;
  }

  const useObserver: (
    props: IUseObserverProps
  ) => IntersectionObserver | undefined = ({
    target,
    callbackIn,
    callbackOut,
    isCallOnce = false,
  }) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          const element = entry.target;

          if (entry.isIntersecting) {
            // console.log(entry, element);
            if (!callbackIn) {
              return;
            }
            callbackIn(element);

            if (isCallOnce) {
              observer.unobserve(element);
            }
          } else {
            if (!callbackOut) {
              return;
            }
            callbackOut(element);
          }
        },
        {
          root: null,
          threshold: 0,
          rootMargin: '0px 0px 0px 0px',
        }
      );
    });

    if (!target) {
      return undefined;
    }

    observer.observe(target);
    return observer;
  };

  //popup
  //utils
  type TClickOutsideEvent = MouseEvent | TouchEvent;

  const useOutsideClick = (element: HTMLElement, callback: () => void) => {
    const listener = (event: TClickOutsideEvent) => {
      if (!element.contains(event?.target as Node) && event.which === 1) {
        callback();
      }
    };

    document.addEventListener('mousedown', listener);
  };

  const useOnEscape = (callback: () => void) => {
    window.addEventListener('keydown', (evt) => {
      if (evt.keyCode === 27) {
        callback();
      }
    });
  };

  //makeTimeline
  interface IRenderModalAnimationProps {
    progress: number;
    easing: number;
    parent: HTMLElement;
    scroll: HTMLElement;
    overlay: HTMLElement;
    additional: HTMLElement | null;
  }

  const renderModalAnimation = ({
    progress,
    easing,
    parent,
    overlay,
    scroll,
    additional,
  }: IRenderModalAnimationProps) => {
    if (parent) {
      const element = parent;
      element.style.display = `${progress > 0 ? 'flex' : 'none'}`;
      element.style.opacity = `${progress > 0 ? 1 : 0}`;
    }

    if (overlay) {
      const element = overlay;
      element.style.opacity = `${easing}`;
    }

    if (scroll) {
      const element = scroll;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(1 - easing) * 100}%)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }

    if (additional) {
      const element = additional;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(1 - easing) * 100}%)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }
  };

  const makeTimeline = (
    parent: HTMLElement,
    scroll: HTMLElement | null,
    overlay: HTMLElement | null,
    additional: HTMLElement | null,
    video?: HTMLVideoElement | null
  ) => {
    if (!parent || !scroll || !overlay) {
      return undefined;
    }

    const timeline = new Vevet.Timeline({
      duration: 600,
      easing: [0.25, 0.1, 0.25, 1],
    });
    timeline.addCallback('start', () => {
      if (!timeline.isReversed) {
        document.querySelector('html')?.classList.add('lock');
        document.querySelector('body')?.classList.add('lock');
        parent.classList.add('_opened');

        if (video) {
          video.play();
        }
      }
    });

    timeline.addCallback('progress', ({ progress, easing }) => {
      renderModalAnimation({
        parent,
        scroll,
        overlay,
        progress,
        easing,
        additional,
      });
    });

    timeline.addCallback('end', () => {
      if (timeline.isReversed) {
        document.querySelector('html')?.classList.remove('lock');
        document.querySelector('body')?.classList.remove('lock');
        parent.classList.remove('_opened');

        if (video) {
          video.pause();
        }
      }
    });

    return timeline;
  };

  //popup class
  class Popup {
    get parent() {
      return this._parent;
    }

    private _parent: HTMLElement;

    get name() {
      return this._name;
    }

    private _name: string | undefined;

    get isThanks() {
      return this._isThanks;
    }

    private _isThanks: boolean = false;

    get isError() {
      return this._isError;
    }

    private _isError: boolean = false;

    get scroll() {
      return this._scroll;
    }

    private _scroll: HTMLElement | null;

    get overlay() {
      return this._overlay;
    }

    private _overlay: HTMLElement | null;

    get additional() {
      return this._additional;
    }

    private _additional: HTMLElement | null;

    get wrapper() {
      return this._wrapper;
    }

    private _wrapper: HTMLElement | null;

    get video() {
      return this._video;
    }

    private _video: HTMLVideoElement | null;

    get timeline() {
      return this._timeline;
    }

    private _timeline: Vevet.Timeline | undefined;

    get closeButtons() {
      return this._closeButtons;
    }

    private _closeButtons: Array<HTMLElement | null> = [];

    get openButtons() {
      return this._openButtons;
    }

    private _openButtons: HTMLElement[] = [];

    constructor(domElement: HTMLElement) {
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

      this._timeline = makeTimeline(
        this._parent,
        this._scroll,
        this._overlay,
        this._additional,
        this._video
      );

      this._openButtons = Array.from(
        document.querySelectorAll(`[data-popup="${this._name}"]`)
      );
      this._closeButtons = Array.from(
        this._parent.querySelectorAll(
          '.popup__close, .popup__button'
        ) as NodeListOf<HTMLElement>
      );

      if (this._closeButtons.length !== 0) {
        this._closeButtons.forEach((button) => {
          if (!button) {
            return;
          }

          button.addEventListener('click', () => {
            this._timeline?.reverse();
          });
        });
      }

      useOutsideClick(this._wrapper, () => {
        if (this._parent.classList.contains('_opened')) {
          this._timeline?.reverse();
          document.querySelector('html')?.classList.remove('lock');
          document.querySelector('body')?.classList.remove('lock');

          this._video?.pause();
        }
      });

      useOnEscape(() => {
        if (this._parent.classList.contains('_opened')) {
          this._timeline?.reverse();

          document.querySelector('html')?.classList.remove('lock');
          document.querySelector('body')?.classList.remove('lock');

          this._video?.pause();
        }
      });
    }

    initOpen(popupArr: Popup[]) {
      if (popupArr.length === 0 || !this._openButtons) {
        return;
      }
      this._openButtons.forEach((openBtn) => {
        openBtn.addEventListener('click', (evt) => {
          evt.preventDefault();

          popupArr.forEach((popup) => {
            if (
              popup.parent.classList.contains('_opened') &&
              popup.name !== this._name
            ) {
              popup.timeline?.reverse();
            }
          });

          this._timeline?.play();
        });
      });
    }
  }

  //initPopup
  const initPopups = (): Popup[] => {
    const popupDomArr = document.querySelectorAll('.popup');

    if (popupDomArr.length === 0) {
      return [];
    }

    const popupArr: Popup[] = [];

    popupDomArr.forEach((element) => {
      const popup = new Popup(element as HTMLElement);
      popupArr.push(popup);
    });

    popupArr.forEach((popup) => {
      popup.initOpen(popupArr);
    });

    return popupArr;
  };

  //make skider
  interface IMakeSlider {
    container: HTMLElement | null;
    className: string;
    isThumb?: boolean;
    thumb?: Swiper | undefined;
    config?: SwiperOptions | undefined;
    renderBullets?: (index: number, className: string) => string;
  }

  const makeSlider = ({
    container,
    className,
    isThumb = false,
    thumb = undefined,
    config,
    renderBullets,
  }: IMakeSlider) => {
    if (!container || !className) {
      return undefined;
    }

    const slider =
      (container.querySelector(
        `.${className}-slider${isThumb ? '-thumb' : ''}.swiper`
      ) as HTMLElement) || null;

    if (!slider) {
      return undefined;
    }

    const pagination: HTMLElement | null = container.querySelector(
      `.${className}-slider-pagination`
    );

    const arrowPrev = container.querySelector(
      `.${className}-slider${
        isThumb ? '-thumb' : ''
      }-controls .${className}-slider-prev`
    ) as HTMLElement | null;

    const arrowNext = container.querySelector(
      `.${className}-slider${
        isThumb ? '-thumb' : ''
      }-controls .${className}-slider-next`
    ) as HTMLElement | null;

    const sliderInit = new Swiper(slider, {
      //modules: [Navigation, Thumbs, Pagination, EffectFade, Autoplay],
      thumbs: {
        swiper: thumb,
      },
      pagination: {
        el: pagination,
        clickable: true,
        renderBullet: renderBullets,
      },
      navigation: {
        nextEl: arrowNext,
        prevEl: arrowPrev,
      },

      slidesPerView: 1,
      spaceBetween: 30,

      ...config,
    });

    return sliderInit;
  };

  //slidersInit
  interface IInitializedSlider {
    name: string;
    slider: Swiper | undefined;
  }

  const sliderBannerInit = (sliders: Array<IInitializedSlider>) => {
    const containerArray = document.querySelectorAll(
      '.banner'
    ) as NodeListOf<HTMLElement>;

    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((item, sliderIndex) => {
      const slider = makeSlider({
        container: item,
        className: 'banner',
        renderBullets: (index, className) => {
          return `
            <button class="${className}">
              <svg class="pagination-star" width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.61804L16.6677 9.82827L16.7799 10.1738H17.1432H25.776L18.7919 15.248L18.498 15.4615L18.6103 15.807L21.2779 24.0172L14.2939 18.943L14 18.7295L13.7061 18.943L6.72206 24.0172L9.38973 15.807L9.50199 15.4615L9.20809 15.248L2.22405 10.1738H10.8568H11.2201L11.3323 9.82827L14 1.61804Z" fill="white" stroke="#066dca"/>
              </svg>
            </button>
          `;
        },
        config: {
          effect: 'fade',
          allowTouchMove: false,
          autoplay: {
            delay: 6000,
            disableOnInteraction: false,
          },
        },
      });

      if (slider) {
        sliders.push({ name: `banner-${sliderIndex}`, slider });
      }
    });
  };
  const sliderInfoInit = (sliders: Array<IInitializedSlider>) => {
    const containerArray = document.querySelectorAll(
      '.about-info'
    ) as NodeListOf<HTMLElement>;

    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((item, sliderIndex) => {
      const slider = makeSlider({
        container: item,
        className: 'about-info',
        renderBullets: (index, className) => {
          return `
            <button class="${className}">
              <svg class="pagination-star" width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.61804L16.6677 9.82827L16.7799 10.1738H17.1432H25.776L18.7919 15.248L18.498 15.4615L18.6103 15.807L21.2779 24.0172L14.2939 18.943L14 18.7295L13.7061 18.943L6.72206 24.0172L9.38973 15.807L9.50199 15.4615L9.20809 15.248L2.22405 10.1738H10.8568H11.2201L11.3323 9.82827L14 1.61804Z" fill="transparent" stroke="#066dca"/>
              </svg>
            </button>
          `;
        },
        config: {
          effect: 'fade',
          allowTouchMove: false,
          autoplay: {
            delay: 6000,
            disableOnInteraction: false,
          },
        },
      });

      if (slider) {
        sliders.push({ name: `about-info-${sliderIndex}`, slider });
      }
    });
  };

  const sliderServicesInit = (sliders: Array<IInitializedSlider>) => {
    const containerArray = document.querySelectorAll(
      '.services'
    ) as NodeListOf<HTMLElement>;

    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((item, sliderIndex) => {
      const slider = makeSlider({
        container: item,
        className: 'services',
        renderBullets: (index, className) => {
          return `
            <button class="${className}"></button>
          `;
        },
        config: {
          slidesPerView: 1,
          spaceBetween: 30,

          breakpoints: {
            660: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },

            1199: {
              slidesPerView: 3,
              slidesPerGroup: 3,
            },
          },
          // autoplay: {
          //   delay: 6000,
          //   disableOnInteraction: false
          // }
        },
      });

      if (slider) {
        sliders.push({ name: `services-${sliderIndex}`, slider });
      }
    });
  };

  const slidersInit = () => {
    const sliders: Array<IInitializedSlider> = [];

    sliderBannerInit(sliders);
    sliderInfoInit(sliders);
    sliderServicesInit(sliders);

    return sliders;
  };

  slidersInit();

  //languageToggle
  const languageToggle = () => {
    const elements: NodeListOf<HTMLElement> =
      document.querySelectorAll('.menu__lang');

    if (elements.length === 0) {
      return;
    }

    elements.forEach((element) => {
      if (vevet.isMobile) {
        element.addEventListener('click', () => {
          element.classList.add('viewed');
        });

        useOutsideClick(element, () => {
          element.classList.remove('viewed');
        });

        return;
      }

      element.addEventListener('mouseenter', () => {
        element.classList.add('viewed');
      });

      element.addEventListener('mouseleave', () => {
        element.classList.remove('viewed');
      });
    });
  };
  languageToggle();

  //counterInit
  interface IMakeCounter {
    item: HTMLElement;
    container: HTMLElement;
  }

  interface IMakeTimeline {
    item: HTMLElement;
  }

  const makeTimelineCounter: (
    props: IMakeTimeline
  ) => Vevet.Timeline | undefined = ({ item: itemProp }) => {
    const item = itemProp;

    const value = +(item.dataset.value || 0);
    if (Number.isNaN(value)) {
      return undefined;
    }

    const timeline = new Vevet.Timeline({ duration: 4000, destroyOnEnd: true });

    timeline.addCallback('progress', ({ easing }) => {
      item.innerHTML = `${Math.floor(value * easing)}`;
    });

    timeline.addCallback('end', () => {
      item.classList.add('finished');
    });

    return timeline;
  };

  const makeCounter: (props: IMakeCounter) => void = ({ item, container }) => {
    const timeline = makeTimelineCounter({ item });

    if (!timeline) {
      return;
    }

    useObserver({
      target: container,
      isCallOnce: true,
      callbackIn: () => {
        timeline.play();
      },
    });
  };

  const counterInit = () => {
    const containerArray: NodeListOf<HTMLElement> =
      document.querySelectorAll('.counter-container');
    if (containerArray.length === 0) {
      return;
    }

    containerArray.forEach((container) => {
      const counterArray: NodeListOf<HTMLElement> =
        container.querySelectorAll('.counter');

      if (counterArray.length === 0) {
        return;
      }

      counterArray.forEach((item) => {
        makeCounter({ item, container });
      });
    });
  };

  counterInit();

  //initFadeSection
  const initFadeSection = (section: HTMLElement, activeKey: string = '1') => {
    interface IParentHeight {
      save: () => void;
      reset: () => void;
      interpolate: (targetHeight: number, progress: number) => void;
    }

    interface IStateItem {
      key: string;
      item: HTMLElement | undefined;
      button: HTMLElement | undefined;
    }

    interface IState {
      active: IStateItem;
      prev: IStateItem;
      parent: {
        item: HTMLElement;
        parentHeight: IParentHeight;
        activeHeight: number;
      };
    }

    interface IMakeTimeline {
      showItem: HTMLElement;
      hideItem: HTMLElement;
      parentHeight: IParentHeight;
      section: HTMLElement;
      activeHeight: number;
      duration?: number;
    }

    const useParentHeight = (element: HTMLElement) => {
      let currentHeight = 0;

      const save = () => {
        const parent = element;

        if (!parent) {
          return;
        }

        currentHeight = parent.clientHeight;
        parent.style.height = `${currentHeight}px`;
      };

      const reset = () => {
        const parent = element;

        if (!parent) {
          return;
        }

        currentHeight = 0;
        parent.style.height = '';
      };

      const interpolate = (targetHeight: number, progress: number) => {
        const parent = element;

        if (!parent) {
          return;
        }

        const startHeight = currentHeight;
        const difference = targetHeight - startHeight;
        const height = startHeight + difference * progress;

        parent.style.height = `${height}px`;
      };

      return { save, reset, interpolate };
    };

    const makeTimeline = ({
      showItem: showItemProp,
      hideItem: hideItemProp,
      parentHeight,
      section: sectionProp,
      activeHeight,
      duration = 600,
    }: IMakeTimeline) => {
      const showItem = showItemProp;
      const hideItem = hideItemProp;
      const section = sectionProp;

      const timeline = new Vevet.Timeline({
        duration,
        easing: [0.25, 0.1, 0.25, 1],
      });

      timeline.addCallback('start', () => {
        parentHeight.save();
        hideItem.classList.add('unactive');
        showItem.classList.remove('unactive');
      });

      timeline.addCallback('progress', ({ progress }) => {
        section.style.pointerEvents = 'none';
        parentHeight.interpolate(activeHeight, progress);

        showItem.style.opacity = `${progress}`;
        hideItem.style.opacity = `${1 - progress}`;
      });

      timeline.addCallback('end', () => {
        section.style.pointerEvents = '';

        timeline.destroy();
        parentHeight.reset();
      });

      timeline.play();
    };

    const parent = section.querySelector(
      '.fade-section-content'
    ) as HTMLElement;
    if (!parent) {
      return;
    }

    const state: IState = {
      active: {
        key: activeKey,
        item: undefined,
        button: undefined,
      },
      prev: {
        key: activeKey,
        item: undefined,
        button: undefined,
      },
      parent: {
        item: parent,
        parentHeight: useParentHeight(parent),
        activeHeight: parent.clientHeight,
      },
    };

    const buttons = Array.from(
      section.querySelectorAll('.fade-section__button')
    ) as HTMLElement[];

    const items = Array.from(
      section.querySelectorAll('.fade-section-content__item')
    ) as HTMLElement[];

    if (items.length === 0) {
      return;
    }

    state.active.button = section.querySelector(
      '.fade-section__button.active'
    ) as HTMLElement;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const data = button.dataset.item;
        state.prev.key = state.active.key;
        state.active.key = data || '1';

        state.prev.button = state.active.button;
        state.active.button = button;

        let showItem: HTMLElement | undefined;
        let hideItem: HTMLElement | undefined;

        if (state.prev.key === state.active.key) {
          return;
        }

        if (state.prev.button) {
          state.prev.button.classList.remove('active');
        }
        state.active.button.classList.add('active');

        items.forEach((item) => {
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
          showItem,
          hideItem,
          parentHeight: state.parent.parentHeight,
          section,
          activeHeight: state.parent.activeHeight,
        });
      });
    });
  };

  //fadeContentInit
  const fadeContentInit = () => {
    const sectionArr = document.querySelectorAll('.fade-section');

    if (sectionArr.length === 0) {
      return;
    }

    sectionArr.forEach((section) => {
      initFadeSection(section as HTMLElement);
    });
  };

  fadeContentInit();

  const popups = initPopups();

  const formArr = document.querySelectorAll('form');
  const hasError = false;

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

    document.addEventListener(
      'wpcf7mailsent',
      function () {
        popups.forEach(({ timeline, isThanks, isError }) => {
          if (isThanks && !hasError) {
            timeline?.play();

            // if (inputs.length !== 0) {
            //   inputs.forEach((inputProp) => {
            //     const input = inputProp;
            //     input.value = '';
            //   });
            // }
          } else if (isError && hasError) {
            timeline?.play();
          } else {
            timeline?.reverse();
          }
        });
      },
      false
    );
  }
});
