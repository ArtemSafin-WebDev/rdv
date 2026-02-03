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

  const setActive = (index) => {
    navBtns.forEach((btn) => btn.classList.remove("active"));
    accordionBtns.forEach((btn) => btn.classList.remove("active"));
    tabItems.forEach((item) => item.classList.remove("active"));
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

    // Calculate heights
    const containerHeight = container.offsetHeight;
    const speedMultiplier = 0.4;
    const scrollHeight = window.innerHeight * tabCount * speedMultiplier;

    // Set CSS variables for spacer height calculation
    scrollSpacer.style.setProperty("--tabs-count", tabCount);
    scrollSpacer.style.setProperty("--speed-multiplier", speedMultiplier);

    // Create ScrollTrigger to track scroll progress and switch tabs
    ScrollTrigger.create({
      trigger: stickyWrapper,
      start: "bottom bottom",
      end: () => `bottom+=${scrollHeight} bottom`,
      onUpdate: (self) => {
        // Calculate which tab should be active based on progress
        const progress = self.progress;
        const currentIndex = Math.min(
          Math.floor(progress * tabCount),
          tabCount - 1,
        );

        // Only update if the index changed
        const stored = parseInt(scrollSpacer.dataset.currentTab) || 0;
        if (currentIndex !== stored) {
          scrollSpacer.dataset.currentTab = currentIndex;
          setActive(currentIndex);
        }
      },
    });

    // Optional: Allow clicking on desktop nav buttons to scroll to that tab
    navBtns.forEach((btn, btnIndex) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionTop = element.getBoundingClientRect().top + window.scrollY;
        const sectionBottom = sectionTop + containerHeight;
        const targetScroll =
          sectionBottom -
          window.innerHeight +
          (btnIndex / tabCount) * scrollHeight;

        gsap.to(window, {
          scrollTo: targetScroll,
          duration: 0.8,
          ease: "power2.inOut",
        });
      });
    });

    return () => {
      // Cleanup function when leaving desktop breakpoint
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
          navBtns.forEach((btn) => btn.classList.remove("active"));
          accordionBtns.forEach((btn) => btn.classList.remove("active"));
          tabItems.forEach((item) => item.classList.remove("active"));
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
