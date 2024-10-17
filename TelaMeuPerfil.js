document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("editar-perfil-btn");
    const formInputs = document.querySelectorAll("#profile-info-form input, #profile-info-form select");

    // Criação dos botões de salvar e cancelar
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const salvarPerfilBtn = document.createElement("button");
    salvarPerfilBtn.classList.add("salvar-btn");
    salvarPerfilBtn.textContent = "Salvar";

    const cancelarPerfilBtn = document.createElement("button");
    cancelarPerfilBtn.classList.add("cancelar-btn");
    cancelarPerfilBtn.textContent = "Cancelar";

    buttonContainer.appendChild(salvarPerfilBtn);
    buttonContainer.appendChild(cancelarPerfilBtn);

    // Inicialmente, os botões estão ocultos
    buttonContainer.style.display = "none";

    // Adiciona os botões após o formulário
    const formElement = document.getElementById("profile-info-form");
    formElement.parentNode.insertBefore(buttonContainer, formElement.nextSibling);

    // Função para habilitar a edição do perfil
    function enableProfileEditing() {
        // Esconder o botão "Editar Perfil"
        editProfileBtn.style.display = "none";

        // Habilitar inputs do formulário, incluindo o campo de seleção
        formInputs.forEach(input => {
            input.readOnly = false; // Remove readonly para editar
            if (input.tagName === "SELECT") {
                input.disabled = false; // Remove disabled para permitir seleção
            }
        });

        // Exibir os botões de salvar e cancelar
        buttonContainer.style.display = "flex";
    }

    // Função para salvar o perfil
    function saveProfile() {
        // Desabilitar inputs do formulário após salvar
        formInputs.forEach(input => {
            input.readOnly = true; // Reativa o readonly
            if (input.tagName === "SELECT") {
                input.disabled = true; // Reativa disabled no campo de seleção
            }
        });

        // Ocultar os botões de salvar e cancelar
        buttonContainer.style.display = "none";

        // Reexibir o botão "Editar Perfil"
        editProfileBtn.style.display = "inline-block";
    }

    // Função para cancelar a edição
    function cancelEditing() {
        // Reverter os valores do formulário para os valores originais, se necessário
        formInputs.forEach(input => {
            input.readOnly = true; // Reativa o readonly
            if (input.tagName === "SELECT") {
                input.disabled = true; // Reativa disabled no campo de seleção
            }
        });

        // Ocultar os botões de salvar e cancelar
        buttonContainer.style.display = "none";

        // Reexibir o botão "Editar Perfil"
        editProfileBtn.style.display = "inline-block";
    }

    // Evento de clique no botão "Editar Perfil"
    editProfileBtn.addEventListener("click", enableProfileEditing);

    // Evento de clique no botão "Salvar"
    salvarPerfilBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Evita o envio do formulário
        saveProfile();
    });

    // Evento de clique no botão "Cancelar"
    cancelarPerfilBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Evita o envio do formulário
        cancelEditing();
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const trocarSenhaBtn = document.querySelector(".trocar-senha-btn");
    const overlay = document.querySelector(".overlay");
    const salvarSenhaBtn = document.querySelector(".salvar-senha-btn");
    const cancelarSenhaBtn = document.querySelector(".cancelar-senha-btn");
    const senhaInput = document.getElementById("senha");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

    // Função para mostrar o card de troca de senha
    function showPasswordCard() {
        // Limpa os campos de senha antes de exibir o card
        novaSenhaInput.value = "";
        confirmarSenhaInput.value = "";

        overlay.style.display = "flex"; // Exibe o overlay e o card
        document.body.style.overflow = "hidden"; // Desabilita a rolagem
    }

    // Função para esconder o card de troca de senha
    function hidePasswordCard() {
        overlay.style.display = "none"; // Esconde o overlay e o card
        document.body.style.overflow = ""; // Reabilita a rolagem
    }

    // Evento de clique no botão "Trocar Senha"
    trocarSenhaBtn.addEventListener("click", showPasswordCard);

    // Evento de clique no botão "Salvar Senha"
    salvarSenhaBtn.addEventListener("click", function () {
        const novaSenha = novaSenhaInput.value.trim(); // Remove espaços em branco
        const confirmarSenha = confirmarSenhaInput.value.trim(); // Remove espaços em branco

        if (novaSenha === confirmarSenha && novaSenha !== "") {
            senhaInput.value = novaSenha; // Atualiza o campo de senha no perfil
            hidePasswordCard(); // Esconde o card após salvar
        } else {
            alert("As senhas não coincidem ou estão vazias.");
        }
    });

    // Evento de clique no botão "Cancelar"
    cancelarSenhaBtn.addEventListener("click", hidePasswordCard);
});




