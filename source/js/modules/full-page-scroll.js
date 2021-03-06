import throttle from 'lodash/throttle';
import {TitleAccentTypography, DateAccentTypography} from './intro';
import {HistoryTitleAccentTypography} from './history';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);
    this.fillScreen = document.querySelector(`.overlay-animation-screen`);

    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    this.onUrlHashChanged();
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay();
    }
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    this.handleAnimations();
    this.changePageDisplay();
  }

  changePageDisplay() {
    this.changeVisibilityDisplay();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay() {
    const isPrizesScreenActive = this.activeScreen === 2;

    if (isPrizesScreenActive) {
      this.screenElements.forEach((screen) => {
        this.fillScreen.classList.add(`active`);
        setTimeout(() => this.hideScreen(screen), 650);
      });

      this.fillScreen.classList.add(`active`);
      setTimeout(() => this.showScreen(this.screenElements[this.activeScreen]), 650);
    } else {
      this.screenElements.forEach((screen) => {
        this.fillScreen.classList.remove(`active`);
        this.hideScreen(screen);
      });

      this.fillScreen.classList.remove(`active`);
      this.showScreen(this.screenElements[this.activeScreen]);
    }
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }

  hideScreen(screen) {
    screen.classList.add(`screen--hidden`);
    screen.classList.remove(`active`);
  }

  showScreen(screen) {
    screen.classList.remove(`screen--hidden`);
    screen.classList.add(`active`);
  }

  handleAnimations() {
    const isIntroPage = this.activeScreen === 0;
    const isHistoryPage = this.activeScreen === 1;

    if (isIntroPage) {
      setTimeout(() => TitleAccentTypography.runAnimation(), 500);
      setTimeout(() => DateAccentTypography.runAnimation(), 1300);
    } else {
      TitleAccentTypography.destroyAnimation();
      DateAccentTypography.destroyAnimation();
    }

    if (isHistoryPage) {
      setTimeout(() => HistoryTitleAccentTypography.runAnimation(), 100);
    } else {
      HistoryTitleAccentTypography.destroyAnimation();
    }
  }
}
