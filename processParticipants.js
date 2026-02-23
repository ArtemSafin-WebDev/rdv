import Swiper from "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs";

const sections = Array.from(document.querySelectorAll(".process-participants"));

sections.forEach((section) => {
  const tabs = Array.from(
    section.querySelectorAll(".process-participants__tab"),
  );
  const panels = Array.from(
    section.querySelectorAll(".process-participants__panel"),
  );
  const tabList = section.querySelector(".process-participants__tabs-nav");
  const swipers = new Map();
  const mobileQuery = window.matchMedia("(max-width: 640px)");

  if (!tabs.length || !panels.length) {
    return;
  }

  const initSwiper = (panel) => {
    const panelId = panel.dataset.tabPanel;

    if (!panelId) {
      return null;
    }

    if (swipers.has(panelId)) {
      return swipers.get(panelId);
    }

    const sliderElement = panel.querySelector(".process-participants__slider");
    const paginationElement = panel.querySelector(
      ".process-participants__pagination",
    );

    if (!sliderElement || !paginationElement) {
      return null;
    }

    const swiper = new Swiper(sliderElement, {
      speed: 800,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 32,
      watchOverflow: true,
      breakpoints: {
        641: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 48,
        },
      },
      pagination: {
        el: paginationElement,
        clickable: true,
      },
    });

    swipers.set(panelId, swiper);

    return swiper;
  };

  const setActiveTab = (targetId) => {
    if (mobileQuery.matches) {
      panels.forEach((panel) => {
        panel.classList.add("active");
        panel.hidden = false;
        const swiper = initSwiper(panel);
        swiper?.update();
      });
      return;
    }

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tabTarget === targetId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === targetId;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;

      if (isActive) {
        const swiper = initSwiper(panel);
        swiper?.update();
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (mobileQuery.matches) {
        return;
      }

      const targetId = tab.dataset.tabTarget;
      if (!targetId) {
        return;
      }

      setActiveTab(targetId);
    });
  });

  tabList?.addEventListener("keydown", (event) => {
    if (mobileQuery.matches) {
      return;
    }

    const activeIndex = tabs.findIndex((tab) =>
      tab.classList.contains("active"),
    );

    if (activeIndex < 0) {
      return;
    }

    let nextIndex = activeIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = tabs[nextIndex];
    const targetId = nextTab?.dataset.tabTarget;

    if (!targetId) {
      return;
    }

    setActiveTab(targetId);
    nextTab.focus();
  });

  const initialTab =
    tabs.find((tab) => tab.classList.contains("active")) ?? tabs[0];
  const initialTarget = initialTab?.dataset.tabTarget;

  if (initialTarget) {
    setActiveTab(initialTarget);
  }

  const handleViewportChange = () => {
    if (mobileQuery.matches) {
      panels.forEach((panel) => {
        panel.classList.add("active");
        panel.hidden = false;
        const swiper = initSwiper(panel);
        swiper?.update();
      });
      return;
    }

    const activeTab = tabs.find((tab) => tab.classList.contains("active"));
    const targetId = activeTab?.dataset.tabTarget ?? initialTarget;

    if (targetId) {
      setActiveTab(targetId);
    }
  };

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }
});
