const btns = Array.from(
  document.querySelectorAll(".our-specialization__show-all"),
);

btns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const grid = btn.parentElement.querySelector(".our-specialization__grid");
    grid?.classList.toggle("show-all");
  });
});
