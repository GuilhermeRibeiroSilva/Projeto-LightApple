document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("editar-perfil-btn");
    const formInputs = document.querySelectorAll("#profile-info-form input, #profile-info-form select");
    const userId = document.getElementById("user-id").value; // Obtido do PHP
    const profilePic = document.querySelector('.profile-pic'); // Seção de perfil
    const userImageCircle = document.getElementById("userImageCircle"); // Imagem do navmenu
    const userImageDropdown = document.getElementById("userImageDropdown"); // Imagem do dropdown
    const inputFile = document.getElementById('inputFile');

    // Criação de botões de salvar/cancelar perfil
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

    // Função para carregar dados do perfil
    function loadProfileData() {
        fetch('http://localhost/LightApple/carregar_perfil.php')
            .then(response => {
                // Verifica se a resposta é válida
                if (!response.ok) {
                    throw new Error(`Erro na resposta: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const usuario = data.usuario;

                    // Atualiza os campos de formulário
                    formInputs.forEach(input => {
                        if (input.name && usuario.hasOwnProperty(input.name)) {
                            input.value = usuario[input.name];
                            if (input.name === "tipoConta") {
                                input.disabled = true;
                            }
                        }
                    });

                    // Atualiza a imagem de perfil em todas as áreas
                    const profileImageUrl = usuario.profile_image_path || 'imagens/default_image.png';
                    profilePic.style.backgroundImage = `url('${profileImageUrl}')`;
                    userImageCircle.style.backgroundImage = `url('${profileImageUrl}')`;
                    userImageDropdown.style.backgroundImage = `url('${profileImageUrl}')`;

                    // Chama a função para atualizar os campos com base no tipo de conta
                    updateFieldsBasedOnAccountType();
                } else {
                    alert("Erro ao carregar dados do perfil.");
                }
            })
            .catch(error => console.error("Erro:", error));
    }

    // Carrega os dados de perfil na inicialização
    loadProfileData();

    // Função para habilitar edição do perfil
    function enableProfileEditing() {
        editProfileBtn.style.display = "none";
        formInputs.forEach(input => {
            // Adicione uma condição para não permitir a edição do campo de senha
            if (input.name !== "tipoConta" && input.name !== "senha") {
                input.readOnly = false;
                if (input.tagName === "SELECT") {
                    input.disabled = false;
                }
            }
        });
        buttonContainer.style.display = "flex";
    }

    // Função para salvar perfil
    function saveProfile() {
        const formData = {};
        formInputs.forEach(input => {
            // Não inclua o campo de senha nos dados enviados
            if (input.name !== "senha") {
                formData[input.name] = input.value;
            }
        });

        fetch(`http://localhost/LightApple/salvar_perfil.php?id=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    formInputs.forEach(input => {
                        // Não altere o estado do campo de senha
                        if (input.name !== "senha") {
                            input.readOnly = true;
                            if (input.tagName === "SELECT") {
                                input.disabled = true;
                            }
                        }
                    });
                    buttonContainer.style.display = "none";
                    editProfileBtn.style.display = "inline-block";
                } else {
                    alert("Erro ao salvar perfil: " + data.error);
                }
            })
            .catch(error => console.error("Erro:", error));
    }

    // Função para cancelar edição
    function cancelEditing() {
        loadProfileData();
        formInputs.forEach(input => {
            // Adicione uma condição para não permitir a edição do campo de senha
            if (input.name !== "senha") {
                input.readOnly = true;
                if (input.tagName === "SELECT") {
                    input.disabled = true;
                }
            }
        });
        buttonContainer.style.display = "none";
        editProfileBtn.style.display = "inline-block";
    }

    // Atualizar campos com base no tipo de conta
    function updateFieldsBasedOnAccountType() {
        const tipoConta = document.getElementById("tipoConta").value;
        const cpfField = document.getElementById("cpf");
        const dataNascimentoField = document.getElementById("dataNascimento");
        const cnpjField = document.getElementById("cnpj");

        if (cpfField) cpfField.classList.remove("exibir");
        if (dataNascimentoField) dataNascimentoField.classList.remove("exibir");
        if (cnpjField) cnpjField.classList.remove("exibir");

        if (tipoConta === "cliente") {
            if (cpfField) cpfField.classList.add("exibir");
            if (dataNascimentoField) dataNascimentoField.classList.add("exibir");
        } else {
            if (cnpjField) cnpjField.classList.add("exibir");
        }
    }

    // Eventos de edição e salvar/cancelar perfil
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", enableProfileEditing);
    }
    salvarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        saveProfile();
    });
    cancelarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        cancelEditing();
    });

    // Função para enviar a nova imagem para o servidor
    function enviarImagemPerfil() {
        if (inputFile.files.length === 0) {
            alert("Por favor, selecione uma imagem para enviar.");
            return;
        }

        const formData = new FormData();
        formData.append('imagem', inputFile.files[0]);
        formData.append('user_id', userId);

        fetch('trocar_imagem.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const profileImageUrl = data.profile_image_path;

                    // Atualiza a imagem de perfil em todas as áreas
                    profilePic.style.backgroundImage = `url('${profileImageUrl}')`;
                    userImageCircle.style.backgroundImage = `url('${profileImageUrl}')`;
                    userImageDropdown.style.backgroundImage = `url('${profileImageUrl}')`;

                    alert("Imagem de perfil atualizada com sucesso!");
                } else {
                    alert("Erro ao atualizar imagem de perfil: " + data.error);
                }
            })
            .catch(error => console.error("Erro:", error));
    }

    // Evento para abrir o seletor de arquivo ao clicar no botão de troca de imagem
    const trocarImagemBtn = document.getElementById('trocar-imagem-btn');
    if (trocarImagemBtn) {
        trocarImagemBtn.addEventListener('click', function () {
            inputFile.click();
        });
    }

    // Envia a imagem quando o input de arquivo for alterado
    inputFile.addEventListener('change', enviarImagemPerfil);
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

    // Função para salvar a nova senha
    function saveNewPassword() {
        const novaSenha = novaSenhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();

        // Verifica se as senhas correspondem
        if (novaSenha !== confirmarSenha) {
            alert("As senhas não correspondem.");
            return;
        }

        // Verifica se a nova senha tem um comprimento mínimo
        if (novaSenha.length < 8) {
            alert("A senha deve ter no mínimo 8 caracteres.");
            return;
        }

        fetch('trocar_senha.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ novaSenha: novaSenha })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Senha atualizada com sucesso!");
                    hidePasswordCard();
                } else {
                    alert(data.error || "Erro ao atualizar a senha.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar atualizar a senha.");
            });
    }

    // Evento de clique no botão "Trocar Senha"
    trocarSenhaBtn.addEventListener("click", showPasswordCard);

    // Evento de clique no botão "Salvar Senha" - Usando a função saveNewPassword
    salvarSenhaBtn.addEventListener("click", function () {
        saveNewPassword(); // Chama a função para salvar a nova senha
    });

    // Evento de clique no botão "Cancelar"
    cancelarSenhaBtn.addEventListener("click", hidePasswordCard);
});