// Elementos do menu e submenus
let subMenu = null;
let criarPed = null;
let userImageCircle = null;
let userPerf = null;

// Função para inicializar os elementos após o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    subMenu = document.getElementById("subMenu");
    criarPed = document.getElementById("criarPed");
    userImageCircle = document.getElementById("userImageCircle");
    userPerf = document.querySelector(".user-perf");

    // Inicializar event listeners apenas se os elementos existirem
    if (document.querySelector('.user-pic')) {
        document.querySelector('.user-pic').onclick = toggleMenu;
    }
    if (document.querySelector('.ped-pic')) {
        document.querySelector('.ped-pic').onclick = toggleMenuPed;
    }

    // Carregamento do perfil do usuário
    const userIdElement = document.getElementById("user-id");
    if (userIdElement && userIdElement.value) {
        carregarPerfilUsuario(userIdElement.value);
    }

    // Event listener para cliques fora dos menus
    document.addEventListener('click', handleOutsideClick);
});

// Função para carregar o perfil do usuário
function carregarPerfilUsuario(userId) {
    fetch(`http://localhost/LightApple/carregar_perfil.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                atualizarImagemPerfil(data.usuario.profile_image_path);
            } else {
                console.error(data.error);
                atualizarImagemPerfil(null);
            }
        })
        .catch(error => console.error("Erro ao carregar imagem de perfil:", error));
}

// Função para fechar todos os menus
function closeAllMenus() {
    if (subMenu) subMenu.classList.remove("open-menu");
    if (criarPed) criarPed.classList.remove("open-menu-ped");
}

// Função para alternar o menu de perfil
function toggleMenu() {
    closeAllMenus();
    if (subMenu) subMenu.classList.toggle("open-menu");
}

// Função para alternar o menu de pedidos
function toggleMenuPed() {
    closeAllMenus();
    if (criarPed) criarPed.classList.toggle("open-menu-ped");
}

// Função para lidar com cliques fora dos menus
function handleOutsideClick(event) {
    const isClickInsideMenu = event.target.closest('.user-menu') || 
                            event.target.closest('.pedido-menu');
    
    if (!isClickInsideMenu) {
        closeAllMenus();
    }
}

// Função para atualizar a imagem de perfil
function atualizarImagemPerfil(urlImagem) {
    if (userImageCircle && userPerf) {
        if (urlImagem) {
            userImageCircle.style.backgroundImage = `url('${urlImagem}')`;
            userPerf.style.backgroundImage = `url('${urlImagem}')`;
        } else {
            userImageCircle.style.backgroundImage = "";
            userPerf.style.backgroundImage = "";
        }
    }
}

// Funções específicas de entrega mantidas do arquivo original
function aceitarPedido(pedidoId) {
    removerPedido(pedidoId);
}

function rejeitarPedido(pedidoId) {
    removerPedido(pedidoId);
}

function removerPedido(pedidoId) {
    let pedido = document.getElementById(pedidoId);
    if (pedido) {
        pedido.remove();
    }
}