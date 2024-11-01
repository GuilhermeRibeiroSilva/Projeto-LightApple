const buttonsWrapper = document.querySelector(".map");
const slides = document.querySelector(".box-cards");

// Obtém o userId da sessão através do campo oculto
const userId = document.getElementById("user-id").value;

buttonsWrapper.addEventListener("click", e => {
    if (e.target.nodeName === "BUTTON") {
        Array.from(buttonsWrapper.children).forEach(item =>
            item.classList.remove("active")
        );

        // Transições de slides baseadas nos botões clicados
        if (e.target.classList.contains("first")) {
            slides.style.transform = "translateX(-0%)";
            e.target.classList.add("active");
        } else if (e.target.classList.contains("second")) {
            slides.style.transform = "translateX(-33.33333333333333%)";
            e.target.classList.add("active");
        } else if (e.target.classList.contains('third')) {
            slides.style.transform = 'translateX(-66.6666666667%)';
            e.target.classList.add('active');
        }
    }
});
