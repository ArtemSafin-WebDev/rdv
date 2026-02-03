// Import GSAP from CDN via unpkg
import gsap from "https://unpkg.com/gsap@3.12.5/index.js";
import ScrollTrigger from "https://unpkg.com/gsap@3.12.5/ScrollTrigger.js";
import ScrollToPlugin from "https://unpkg.com/gsap@3.12.5/ScrollToPlugin.js";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const complexApproach = Array.from(
  document.querySelectorAll(".complex-approach"),
);

complexApproach.forEach((element) => {
  const navBtns = Array.from(
    element.querySelectorAll(".complex-approach__tabs-nav-btn"),
  );
  const accordionBtns = Array.from(
    element.querySelectorAll(".complex-approach__tabs-item-btn"),
  );
  const tabItems = Array.from(
    element.querySelectorAll(".complex-approach__tabs-item"),
  );

  const clearActive = () => {
    navBtns.forEach((btn) => btn.classList.remove("active"));
    accordionBtns.forEach((btn) => btn.classList.remove("active"));
    tabItems.forEach((item) => item.classList.remove("active"));
  };

  const setActive = (index) => {
    clearActive();
    navBtns[index]?.classList.add("active");
    accordionBtns[index]?.classList.add("active");
    tabItems[index]?.classList.add("active");
  };

  // Use matchMedia to separate desktop and mobile behavior
  const mm = gsap.matchMedia();

  // Desktop behavior (scroll-triggered tabs with sticky positioning)
  mm.add("(min-width: 641px)", () => {
    const tabCount = tabItems.length;
    const container = element.querySelector(".container");
    if (!container || tabCount === 0) {
      return () => {};
    }

    // Create a scroll spacer to add height for scrolling
    const scrollSpacer = document.createElement("div");
    scrollSpacer.className = "complex-approach__scroll-spacer";

    // Create a sticky wrapper
    const stickyWrapper = document.createElement("div");
    stickyWrapper.className = "complex-approach__sticky-wrapper";

    // Move container into sticky wrapper
    container.parentNode.insertBefore(stickyWrapper, container);
    stickyWrapper.appendChild(container);

    // Insert spacer before the sticky wrapper
    stickyWrapper.parentNode.insertBefore(scrollSpacer, stickyWrapper);

    const speedMultiplier = 0.4;

    // Set CSS variables for spacer height calculation
    scrollSpacer.style.setProperty("--tabs-count", tabCount);
    scrollSpacer.style.setProperty("--speed-multiplier", speedMultiplier);

    const getIndexFromProgress = (progress) =>
      Math.min(Math.floor(progress * tabCount), tabCount - 1);
    const syncActive = (progress) => {
      const currentIndex = getIndexFromProgress(progress);
      const storedRaw = parseInt(scrollSpacer.dataset.currentTab, 10);
      const stored = Number.isNaN(storedRaw) ? -1 : storedRaw;
      if (currentIndex !== stored) {
        scrollSpacer.dataset.currentTab = currentIndex;
        setActive(currentIndex);
      }
    };

    // Create ScrollTrigger to track scroll progress and switch tabs
    const scrollTrigger = ScrollTrigger.create({
      trigger: stickyWrapper,
      start: "bottom bottom",
      end: () => `bottom+=${scrollSpacer.offsetHeight} bottom`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        syncActive(self.progress);
      },
    });

    ScrollTrigger.refresh();
    syncActive(scrollTrigger.progress);

    // Optional: Allow clicking on desktop nav buttons to scroll to that tab
    const navHandlers = [];
    const getTargetScroll = (index) => {
      const start = scrollTrigger.start;
      const end = scrollTrigger.end;
      const total = end - start;
      const segment = (index + 0.5) / tabCount;
      const target = start + total * segment;
      return Math.min(end, Math.max(start, target));
    };

    navBtns.forEach((btn, btnIndex) => {
      const handler = (event) => {
        event.preventDefault();
        if (!scrollTrigger) {
          return;
        }

        ScrollTrigger.refresh();
        const targetScroll = getTargetScroll(btnIndex);
        gsap.to(window, {
          scrollTo: targetScroll,
          duration: 0.8,
          ease: "power2.inOut",
        });
      };

      btn.addEventListener("click", handler);
      navHandlers.push({ btn, handler });
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
      syncActive(scrollTrigger.progress);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup function when leaving desktop breakpoint
      scrollTrigger.kill();
      navHandlers.forEach(({ btn, handler }) => {
        btn.removeEventListener("click", handler);
      });
      window.removeEventListener("resize", handleResize);
      // Unwrap: move container back and remove wrappers
      if (stickyWrapper.parentNode) {
        stickyWrapper.parentNode.insertBefore(container, stickyWrapper);
        stickyWrapper.remove();
      }
      if (scrollSpacer.parentNode) {
        scrollSpacer.remove();
      }
    };
  });

  // Mobile behavior (accordion with click and toggle)
  mm.add("(max-width: 640px)", () => {
    const handlers = [];

    accordionBtns.forEach((btn, btnIndex) => {
      const handler = (event) => {
        event.preventDefault();

        // Toggle: if clicking on active tab, close it
        if (btn.classList.contains("active")) {
          clearActive();
        } else {
          setActive(btnIndex);
        }
      };

      btn.addEventListener("click", handler);
      handlers.push({ btn, handler });
    });

    return () => {
      // Cleanup: remove all event listeners
      handlers.forEach(({ btn, handler }) => {
        btn.removeEventListener("click", handler);
      });
    };
  });
});
