let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");
let cartDropdown = document.getElementById("cartDropdown");

function toggleMenu() {
    // Fecha os outros menus se estiverem abertos
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }
    if (cartDropdown.classList.contains("open-cart")) {
        cartDropdown.classList.remove("open-cart");
    }
    // Alterna o menu atual
    subMenu.classList.toggle("open-menu");
}

function toggleMenuPed() {
    // Fecha os outros menus se estiverem abertos
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    if (cartDropdown.classList.contains("open-cart")) {
        cartDropdown.classList.remove("open-cart");
    }
    // Alterna o menu atual
    criarPed.classList.toggle("open-menu-ped");
}

function toggleCart() {
    // Fecha os outros menus se estiverem abertos
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }
    // Alterna o menu atual
    cartDropdown.classList.toggle("open-cart");
}

// Função para remover item do carrinho
document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
        this.parentElement.remove(); // Remove o item clicado
    });
});

