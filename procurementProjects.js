import Swiper from "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs";

const mobileQuery = window.matchMedia("(max-width: 640px)");
const LAST_TAB_INDEX = 4;
const sections = Array.from(document.querySelectorAll(".procurement-projects"));

sections.forEach((section) => {
  const tabsContainer = section.querySelector(".procurement-projects__tabs");
  const tabs = Array.from(
    section.querySelectorAll(".procurement-projects__tab"),
  );
  const panels = Array.from(
    section.querySelectorAll(".procurement-projects__panel"),
  );
  const tabList = section.querySelector(".procurement-projects__tabs-nav");
  const panelsContainer = section.querySelector(
    ".procurement-projects__panels",
  );

  if (!tabsContainer || !panelsContainer || !tabs.length || !panels.length) {
    return;
  }

  let swiperInstance = null;
  let paginationElement = null;
  const tagSyncHandlers = [];

  const getCurrentTargetId = () => {
    const activeTab = tabs.find((tab) => tab.classList.contains("active"));
    if (activeTab?.dataset.tabTarget) {
      return activeTab.dataset.tabTarget;
    }

    const activePanel = panels.find((panel) =>
      panel.classList.contains("active"),
    );
    if (activePanel?.dataset.tabPanel) {
      return activePanel.dataset.tabPanel;
    }

    return tabs[0]?.dataset.tabTarget;
  };

  const setActiveTab = (
    targetId,
    { keepPanelsVisible = mobileQuery.matches } = {},
  ) => {
    const activeIndex = tabs.findIndex((tab) => tab.dataset.tabTarget === targetId);
    const isFirstActive = activeIndex === 0;
    const isLastActive = activeIndex === LAST_TAB_INDEX;
    const isMiddleActive = activeIndex > 0 && activeIndex !== LAST_TAB_INDEX;

    section.classList.toggle("procurement-projects--active-first", isFirstActive);
    section.classList.toggle("procurement-projects--active-last", isLastActive);
    section.classList.toggle("procurement-projects--active-middle", isMiddleActive);

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tabTarget === targetId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === targetId;
      panel.classList.toggle("active", isActive);
      panel.hidden = keepPanelsVisible ? false : !isActive;
    });
  };

  const syncPanelLogos = () => {
    const tabByTarget = new Map(
      tabs.map((tab) => [tab.dataset.tabTarget, tab]),
    );

    panels.forEach((panel) => {
      const targetId = panel.dataset.tabPanel;
      const matchingTab = tabByTarget.get(targetId);
      const logo = matchingTab?.querySelector(
        ".procurement-projects__tab-logo",
      );
      const logoSrc = logo?.getAttribute("src");
      const logoAlt = logo?.getAttribute("alt") || "";
      const topRow = panel.querySelector(
        ".procurement-projects__panel-top-row",
      );

      if (!topRow || !logoSrc) {
        return;
      }

      let panelLogo = topRow.querySelector(".procurement-projects__panel-logo");
      if (!panelLogo) {
        panelLogo = document.createElement("img");
        panelLogo.className = "procurement-projects__panel-logo";
        panelLogo.decoding = "async";
        topRow.prepend(panelLogo);
      }

      panelLogo.src = logoSrc;
      panelLogo.alt = logoAlt;
    });
  };

  const syncTagsButtons = () => {
    tagSyncHandlers.forEach((syncHandler) => syncHandler());
  };

  const enableMobileSlider = () => {
    if (swiperInstance) {
      return;
    }

    const targetId = getCurrentTargetId();
    const initialIndex = Math.max(
      panels.findIndex((panel) => panel.dataset.tabPanel === targetId),
      0,
    );

    section.classList.add("procurement-projects--mobile-slider");
    tabList?.setAttribute("aria-hidden", "true");

    tabsContainer.classList.add("swiper");
    panelsContainer.classList.add("swiper-wrapper");

    panels.forEach((panel) => {
      panel.classList.add("swiper-slide", "active");
      panel.hidden = false;
    });

    paginationElement = document.createElement("div");
    paginationElement.className = "procurement-projects__slider-pagination";
    tabsContainer.append(paginationElement);

    swiperInstance = new Swiper(tabsContainer, {
      speed: 500,
      slidesPerView: 1,
      spaceBetween: 12,
      initialSlide: initialIndex,
      pagination: {
        el: paginationElement,
        type: "bullets",
        clickable: true,
      },
      on: {
        slideChange(swiper) {
          const activePanel = panels[swiper.realIndex];
          if (!activePanel) {
            return;
          }
          setActiveTab(activePanel.dataset.tabPanel, {
            keepPanelsVisible: true,
          });
        },
      },
    });

    const activePanel = panels[initialIndex] || panels[0];
    if (activePanel) {
      setActiveTab(activePanel.dataset.tabPanel, { keepPanelsVisible: true });
    }
  };

  const disableMobileSlider = () => {
    if (!swiperInstance) {
      return;
    }

    const activeTargetId =
      panels[swiperInstance.realIndex]?.dataset.tabPanel ||
      getCurrentTargetId();

    swiperInstance.destroy(true, true);
    swiperInstance = null;

    tabsContainer.classList.remove("swiper");
    panelsContainer.classList.remove("swiper-wrapper");

    tabsContainer.removeAttribute("style");
    panelsContainer.removeAttribute("style");
    panels.forEach((panel) => {
      panel.classList.remove("swiper-slide");
      panel.style.removeProperty("width");
      panel.style.removeProperty("margin-right");
      panel.style.removeProperty("transform");
    });

    paginationElement?.remove();
    paginationElement = null;

    section.classList.remove("procurement-projects--mobile-slider");
    tabList?.removeAttribute("aria-hidden");

    setActiveTab(activeTargetId, { keepPanelsVisible: false });
    syncPanelLogos();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tabTarget;

      if (swiperInstance) {
        const targetIndex = panels.findIndex(
          (panel) => panel.dataset.tabPanel === targetId,
        );
        if (targetIndex >= 0) {
          swiperInstance.slideTo(targetIndex);
        }
      }

      setActiveTab(targetId, { keepPanelsVisible: Boolean(swiperInstance) });
    });
  });

  tabList?.addEventListener("keydown", (event) => {
    if (swiperInstance) {
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
    setActiveTab(nextTab.dataset.tabTarget);
    nextTab.focus();
  });

  const initialActiveTab = tabs.find((tab) => tab.classList.contains("active"));
  if (initialActiveTab?.dataset.tabTarget) {
    setActiveTab(initialActiveTab.dataset.tabTarget, {
      keepPanelsVisible: false,
    });
  } else if (tabs[0]?.dataset.tabTarget) {
    setActiveTab(tabs[0].dataset.tabTarget, { keepPanelsVisible: false });
  }

  panels.forEach((panel) => {
    const showMoreButton = panel.querySelector(
      ".procurement-projects__tags-more",
    );
    const tagsList = panel.querySelector(".procurement-projects__tags-list");
    if (!showMoreButton || !tagsList) {
      return;
    }

    const tagsCount = tagsList.querySelectorAll(
      ".procurement-projects__tag",
    ).length;

    const syncShowMoreVisibility = () => {
      const initiallyVisibleTagsCount = mobileQuery.matches ? 2 : 3;
      const hiddenTagsCount = Math.max(
        tagsCount - initiallyVisibleTagsCount,
        0,
      );
      const isExpanded = tagsList.classList.contains("is-expanded");
      const buttonLabel = mobileQuery.matches ? "еще" : "Еще";

      showMoreButton.textContent = `${buttonLabel} ${hiddenTagsCount}`;
      showMoreButton.hidden = hiddenTagsCount <= 0 || isExpanded;
    };

    tagSyncHandlers.push(syncShowMoreVisibility);
    syncShowMoreVisibility();

    showMoreButton.addEventListener("click", () => {
      tagsList.classList.add("is-expanded");
      syncShowMoreVisibility();
    });
  });

  const handleViewportChange = () => {
    if (mobileQuery.matches) {
      enableMobileSlider();
    } else {
      disableMobileSlider();
    }
    syncPanelLogos();
    syncTagsButtons();
  };

  syncPanelLogos();
  handleViewportChange();

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }
});
