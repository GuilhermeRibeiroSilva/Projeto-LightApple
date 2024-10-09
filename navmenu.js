let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");

function toggleMenu() {
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }
    subMenu.classList.toggle("open-menu");
}

function toggleMenuPed() {
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    criarPed.classList.toggle("open-menu-ped");
}