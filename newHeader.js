const DESKTOP_MEDIA_QUERY = "(min-width: 641px)";
const TOP_HIDDEN_CLASS = "new-header--top-hidden";
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

  updateHeaderState();
}
