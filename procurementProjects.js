const sections = Array.from(document.querySelectorAll(".procurement-projects"));

sections.forEach((section) => {
  const tabs = Array.from(section.querySelectorAll(".procurement-projects__tab"));
  const panels = Array.from(
    section.querySelectorAll(".procurement-projects__panel"),
  );
  const tabList = section.querySelector(".procurement-projects__tabs-nav");

  const setActiveTab = (targetId) => {
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
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.tabTarget);
    });
  });

  tabList?.addEventListener("keydown", (event) => {
    const activeIndex = tabs.findIndex((tab) => tab.classList.contains("active"));

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

  const activeTab = tabs.find((tab) => tab.classList.contains("active"));
  if (activeTab) {
    setActiveTab(activeTab.dataset.tabTarget);
  } else if (tabs[0]) {
    setActiveTab(tabs[0].dataset.tabTarget);
  }

  panels.forEach((panel) => {
    const showMoreButton = panel.querySelector(".procurement-projects__tags-more");
    if (!showMoreButton) {
      return;
    }

    const getHiddenTags = () =>
      Array.from(panel.querySelectorAll(".procurement-projects__tag--hidden"));

    const syncShowMoreVisibility = () => {
      showMoreButton.hidden = getHiddenTags().length === 0;
    };

    syncShowMoreVisibility();

    showMoreButton.addEventListener("click", () => {
      getHiddenTags()
        .forEach((tag) => tag.classList.remove("procurement-projects__tag--hidden"));

      showMoreButton.hidden = true;
    });
  });
});
