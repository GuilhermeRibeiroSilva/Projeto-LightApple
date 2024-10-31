let subMenu = document.getElementById("subMenu");
let criarPed = document.getElementById("criarPed");
let cartDropdown = document.getElementById("cartDropdown");

function toggleMenu() {
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }
    if (cartDropdown.classList.contains("open-cart")) {
        cartDropdown.classList.remove("open-cart");
    }
    subMenu.classList.toggle("open-menu");
}

function toggleMenuPed() {
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    if (cartDropdown.classList.contains("open-cart")) {
        cartDropdown.classList.remove("open-cart");
    }
    criarPed.classList.toggle("open-menu-ped");
}

function toggleCart() {
    if (subMenu.classList.contains("open-menu")) {
        subMenu.classList.remove("open-menu");
    }
    if (criarPed.classList.contains("open-menu-ped")) {
        criarPed.classList.remove("open-menu-ped");
    }
    cartDropdown.classList.toggle("open-cart");
}

// Função para remover item do carrinho
document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
        this.parentElement.remove(); // Remove o item clicado
    });
});

// Elementos da imagem de perfil
const userImageCircle = document.getElementById("userImageCircle");
const userPerf = document.querySelector(".user-perf");

// Função para definir a imagem de perfil ou deixar o círculo cinza
function atualizarImagemPerfil(urlImagem) {
    if (urlImagem) {
        userImageCircle.style.backgroundImage = `url('${urlImagem}')`;
        userPerf.style.backgroundImage = `url('${urlImagem}')`;
    } else {
        userImageCircle.style.backgroundImage = ""; // Mantém a cor de fundo cinza
        userPerf.style.backgroundImage = ""; // Mantém a cor de fundo cinza
    }
}

// Recupera o ID do usuário da sessionStorage
const userId = sessionStorage.getItem('user_id');

if (userId) {
    fetch(`http://localhost/LightApple/carregar_perfil.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                atualizarImagemPerfil(data.usuario.profile_image_path);
            } else {
                console.error(data.error); // Loga o erro caso não tenha sucesso
                atualizarImagemPerfil(null);
            }
        })
        .catch(error => console.error("Erro ao carregar imagem de perfil:", error));
} else {
    console.error("ID do usuário não encontrado na sessionStorage.");
}
