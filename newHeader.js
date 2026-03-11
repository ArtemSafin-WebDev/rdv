const DESKTOP_MEDIA_QUERY = "(min-width: 641px)";
const TOP_HIDDEN_CLASS = "new-header--top-hidden";
const SUBMENU_OPEN_CLASS = "new-header__nav-list-item--submenu-open";
const SCROLL_DELTA = 4;

const header = document.querySelector(".new-header");

if (header) {
  const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  let lastScrollY = window.scrollY;
  let isTicking = false;

  const updateHeaderState = () => {
    const currentScrollY = window.scrollY;

    if (!desktopMediaQuery.matches) {
      header.classList.remove(TOP_HIDDEN_CLASS);
      lastScrollY = currentScrollY;
      isTicking = false;
      return;
    }

    if (currentScrollY <= 0) {
      header.classList.remove(TOP_HIDDEN_CLASS);
    } else if (currentScrollY > lastScrollY + SCROLL_DELTA) {
      header.classList.add(TOP_HIDDEN_CLASS);
    } else if (currentScrollY < lastScrollY - SCROLL_DELTA) {
      header.classList.remove(TOP_HIDDEN_CLASS);
    }

    lastScrollY = currentScrollY;
    isTicking = false;
  };

  const onScroll = () => {
    if (isTicking) return;

    isTicking = true;
    window.requestAnimationFrame(updateHeaderState);
  };

  const onBreakpointChange = () => {
    header.classList.remove(TOP_HIDDEN_CLASS);
    lastScrollY = window.scrollY;
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

  const closeAllSubmenus = (exceptItem) => {
    submenuItems.forEach((item) => {
      if (item !== exceptItem) {
        item.classList.remove(SUBMENU_OPEN_CLASS);
      }
    });
  };

  if (nav && submenuItems.length) {
    nav.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-submenu-close]");
      if (closeTrigger && nav.contains(closeTrigger)) {
        const openItem = closeTrigger.closest(".new-header__nav-list-item");
        if (openItem) {
          openItem.classList.remove(SUBMENU_OPEN_CLASS);
        }
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
        closeAllSubmenus();
      }
    });
  }

  updateHeaderState();
}
