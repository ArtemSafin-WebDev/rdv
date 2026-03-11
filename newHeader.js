const DESKTOP_MEDIA_QUERY = "(min-width: 641px)";
const TOP_HIDDEN_CLASS = "new-header--top-hidden";
const SUBMENU_OPEN_CLASS = "new-header__nav-list-item--submenu-open";
const BODY_LOCK_CLASS = "new-header--mega-scroll-lock";
const MENU_OPEN_CLASS = "new-header-menu-open";
const TOP_OFFSET_THRESHOLD = 4;
const SEARCH_FORM_SHOWN_CLASS = "is-shown";

const header = document.querySelector(".new-header");

if (header) {
  const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  const body = document.body;
  const menuOpenButton = header.querySelector(".new-header__burger-btn");
  const menuCloseButtons = Array.from(header.querySelectorAll(".new-header__menu-close"));
  const searchButton = header.querySelector(".new-header__search-btn");
  const searchCloseButton = header.querySelector(".new-header__search-close");
  const searchForm = header.querySelector(".new-header__search-form");
  const searchInput = header.querySelector(".new-header__search-form-search-input");
  let isTicking = false;
  let syncMegaScrollLock = () => {};

  const openSearch = () => {
    if (!searchForm) return;
    searchForm.classList.add(SEARCH_FORM_SHOWN_CLASS);
    if (searchInput) {
      searchInput.focus();
    }
  };

  const closeSearch = () => {
    if (!searchForm) return;
    searchForm.classList.remove(SEARCH_FORM_SHOWN_CLASS);
  };

  const updateHeaderState = () => {
    const currentScrollY = window.scrollY;
    header.classList.toggle(TOP_HIDDEN_CLASS, currentScrollY > TOP_OFFSET_THRESHOLD);
    isTicking = false;
  };

  const onScroll = () => {
    if (isTicking) return;

    isTicking = true;
    window.requestAnimationFrame(updateHeaderState);
  };

  const onBreakpointChange = () => {
    if (desktopMediaQuery.matches && body) {
      body.classList.remove(MENU_OPEN_CLASS);
    }

    syncMegaScrollLock();
    updateHeaderState();
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  if (typeof desktopMediaQuery.addEventListener === "function") {
    desktopMediaQuery.addEventListener("change", onBreakpointChange);
  } else if (typeof desktopMediaQuery.addListener === "function") {
    desktopMediaQuery.addListener(onBreakpointChange);
  }

  const nav = header.querySelector(".new-header__nav");
  const submenuItems = nav
    ? Array.from(nav.querySelectorAll(".new-header__nav-list-item")).filter((item) =>
        item.querySelector(":scope > .new-header__nav-submenu")
      )
    : [];
  const megaSubmenuItems = submenuItems.filter((item) =>
    item.classList.contains("new-header__nav-list-item--mega")
  );

  syncMegaScrollLock = () => {
    if (!body) return;

    const shouldLock =
      desktopMediaQuery.matches &&
      megaSubmenuItems.some((item) => item.classList.contains(SUBMENU_OPEN_CLASS));

    body.classList.toggle(BODY_LOCK_CLASS, Boolean(shouldLock));
  };

  const closeAllSubmenus = (exceptItem) => {
    submenuItems.forEach((item) => {
      if (item !== exceptItem) {
        item.classList.remove(SUBMENU_OPEN_CLASS);
      }
    });
    syncMegaScrollLock();
  };

  const openMobileMenu = () => {
    if (!body) return;
    body.classList.add(MENU_OPEN_CLASS);
  };

  const closeMobileMenu = () => {
    if (!body) return;
    body.classList.remove(MENU_OPEN_CLASS);
    closeAllSubmenus();
  };

  if (menuOpenButton) {
    menuOpenButton.addEventListener("click", openMobileMenu);
  }

  if (menuCloseButtons.length) {
    menuCloseButtons.forEach((button) => {
      button.addEventListener("click", closeMobileMenu);
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", openSearch);
  }

  if (searchCloseButton) {
    searchCloseButton.addEventListener("click", closeSearch);
  }

  if (nav && submenuItems.length) {
    nav.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-submenu-close]");
      if (closeTrigger && nav.contains(closeTrigger)) {
        const openItem = closeTrigger.closest(".new-header__nav-list-item");
        if (openItem) {
          openItem.classList.remove(SUBMENU_OPEN_CLASS);
        }
        syncMegaScrollLock();
        return;
      }

      const navLink = event.target.closest(".new-header__nav-link");

      if (!navLink || !nav.contains(navLink)) {
        return;
      }

      const navItem = navLink.closest(".new-header__nav-list-item");
      if (!navItem || !navItem.querySelector(":scope > .new-header__nav-submenu")) {
        closeAllSubmenus();
        return;
      }

      event.preventDefault();

      const isOpen = navItem.classList.contains(SUBMENU_OPEN_CLASS);
      closeAllSubmenus(navItem);
      navItem.classList.toggle(SUBMENU_OPEN_CLASS, !isOpen);
      syncMegaScrollLock();
    });

    document.addEventListener("click", (event) => {
      const clickedInsideOpenItem = event.target.closest(
        `.new-header__nav-list-item.${SUBMENU_OPEN_CLASS}`
      );

      if (!clickedInsideOpenItem) {
        closeAllSubmenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  updateHeaderState();
  syncMegaScrollLock();
}
