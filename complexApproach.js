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

  navBtns.forEach((btn, btnIndex) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      setActive(btnIndex);
    });
  });
  accordionBtns.forEach((btn, btnIndex) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      setActive(btnIndex);
    });
  });
});
