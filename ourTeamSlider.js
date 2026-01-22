import Swiper from "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs";

const sliders = Array.from(document.querySelectorAll(".our-team"));

console.log("Sliders", sliders);
sliders.forEach((slider) => {
  const container = slider.querySelector(".swiper");
  if (!container) return;
  new Swiper(container, {
    speed: 600,
    slidesPerView: "auto",
    pagination: {
      el: slider.querySelector(".our-team__slider-pagination"),
      type: "bullets",
      clickable: true,
    },
  });
});
