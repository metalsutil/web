document.addEventListener("DOMContentLoaded", function () {
  const allSlides = document.querySelectorAll(".slide");

  // Filtrar solo los elementos cuyo archivo se llame exactamente "1" (sin importar carpeta o extensión)
  const slides = Array.from(allSlides).filter(slide => {
    const src = slide.getAttribute("src");
    if (!src) return false;

    const fileName = src.split("/").pop().split(".")[0]; // Extrae "1" de "carpeta/1.jpg"
    return fileName === "1";
  });

  if (slides.length === 0) return; // si no hay elementos válidos, no hace nada

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
  first.classList.add("active");

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
