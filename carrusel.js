document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".slide");
  let index = 0;

  function showNextSlide() {
    slides[index].classList.remove("active");

    index = (index + 1) % slides.length;
    const nextSlide = slides[index];
    nextSlide.classList.add("active");

    if (nextSlide.tagName === "VIDEO") {
      nextSlide.currentTime = 0;
      nextSlide.play();

      nextSlide.onended = () => {
        nextSlide.classList.remove("active");
        showNextSlide();
      };
    } else {
      setTimeout(() => {
        nextSlide.classList.remove("active");
        showNextSlide();
      }, 2000); // duración fija para imágenes
    }
  }

  const first = slides[index];
  if (first.tagName === "VIDEO") {
    first.play();
    first.onended = () => {
      first.classList.remove("active");
      showNextSlide();
    };
  } else {
    setTimeout(() => {
      first.classList.remove("active");
      showNextSlide();
    }, 2000);
  }
});
