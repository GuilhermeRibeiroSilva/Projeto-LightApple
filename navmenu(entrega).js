let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");

function toggleMenu() {
    // Fecha os outros menus se estiverem abertos
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }

    // Alterna o menu atual
    subMenu.classList.toggle("open-menu");
}

function toggleMenuPed() {
    // Fecha os outros menus se estiverem abertos
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    // Alterna o menu atual
    criarPed.classList.toggle("open-menu-ped");
}



function aceitarPedido(pedidoId) {
    // Lógica ao aceitar o pedido
    removerPedido(pedidoId);
}

function rejeitarPedido(pedidoId) {
    // Lógica ao rejeitar o pedido
    removerPedido(pedidoId);
}

function removerPedido(pedidoId) {
    let pedido = document.getElementById(pedidoId);
    if (pedido) {
        pedido.remove(); // Remove o pedido da lista
    }
}




