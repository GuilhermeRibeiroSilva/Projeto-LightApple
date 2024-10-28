document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("editar-perfil-btn");
    const formInputs = document.querySelectorAll("#profile-info-form input, #profile-info-form select");
    const userId = document.getElementById("user-id").value;
    console.log("User ID JavaScript:", userId);


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

    buttonContainer.style.display = "none";
    const formElement = document.getElementById("profile-info-form");
    formElement.parentNode.insertBefore(buttonContainer, formElement.nextSibling);

    // Função para carregar os dados do perfil do usuário
    function loadProfileData(userId) {
        fetch(`http://localhost/LightApple/carregar_perfil.php?id=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const usuario = data.usuario;
                    formInputs.forEach(input => {
                        if (input.name && usuario.hasOwnProperty(input.name)) {
                            input.value = usuario[input.name];
                        }
                    });
                } else {
                    alert("Erro ao carregar dados do perfil.");
                }
            })
            .catch(error => console.error("Erro:", error));
    }

    // Carregar os dados do perfil ao inicializar a página
    loadProfileData(userId);

    // Função para habilitar a edição do perfil
    function enableProfileEditing() {
        editProfileBtn.style.display = "none";
        formInputs.forEach(input => {
            input.readOnly = false;
            if (input.tagName === "SELECT") {
                input.disabled = false;
            }
        });
        buttonContainer.style.display = "flex";
    }

    // Função para salvar o perfil no banco de dados
    function saveProfile() {
        const formData = {};
        formInputs.forEach(input => {
            formData[input.name] = input.value;
        });

        // Verificando o userId e os dados do formulário antes de enviar a requisição
        console.log("User ID no fetch:", userId);
        console.log("Dados do Formulário:", formData);

        fetch(`http://localhost/LightApple/salvar_perfil.php?id=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Resposta do servidor:", data); // Exibindo a resposta do servidor no console
                if (data.success) {
                    formInputs.forEach(input => {
                        input.readOnly = true;
                        if (input.tagName === "SELECT") {
                            input.disabled = true;
                        }
                    });
                    buttonContainer.style.display = "none"; // Esconde o botão "Salvar" automaticamente
                    editProfileBtn.style.display = "inline-block"; // Exibe o botão "Editar Perfil" novamente
                } else {
                    alert("Erro ao salvar perfil: " + data.error);
                }
            })
            .catch(error => console.error("Erro:", error));
    }



    // Função para cancelar a edição
    function cancelEditing() {
        formInputs.forEach(input => {
            input.readOnly = true;
            if (input.tagName === "SELECT") {
                input.disabled = true;
            }
        });
        buttonContainer.style.display = "none";
        editProfileBtn.style.display = "inline-block";
    }

    // Evento de clique no botão "Editar Perfil"
    editProfileBtn.addEventListener("click", enableProfileEditing);

    // Evento de clique no botão "Salvar"
    salvarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        saveProfile();
    });

    // Evento de clique no botão "Cancelar"
    cancelarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        cancelEditing();
    });

    // Código para troca de senha
    const trocarSenhaBtn = document.querySelector(".trocar-senha-btn");
    const overlay = document.querySelector(".overlay");
    const salvarSenhaBtn = document.querySelector(".salvar-senha-btn");
    const cancelarSenhaBtn = document.querySelector(".cancelar-senha-btn");
    const senhaInput = document.getElementById("senha");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

    // Função para mostrar o card de troca de senha
    function showPasswordCard() {
        novaSenhaInput.value = "";
        confirmarSenhaInput.value = "";
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    // Função para esconder o card de troca de senha
    function hidePasswordCard() {
        overlay.style.display = "none";
        document.body.style.overflow = "";
    }

    // Evento de clique no botão "Trocar Senha"
    trocarSenhaBtn.addEventListener("click", showPasswordCard);

    // Evento de clique no botão "Salvar Senha"
    salvarSenhaBtn.addEventListener("click", function () {
        const novaSenha = novaSenhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();

        if (novaSenha === confirmarSenha && novaSenha !== "") {
            senhaInput.value = novaSenha;
            // Aqui você deve adicionar lógica para atualizar a senha no banco de dados
            hidePasswordCard();
        } else {
            alert("As senhas não coincidem ou estão vazias.");
        }
    });

    // Evento de clique no botão "Cancelar" no card de senha
    cancelarSenhaBtn.addEventListener("click", hidePasswordCard);
});
