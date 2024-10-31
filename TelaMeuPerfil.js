document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("editar-perfil-btn");
    const formInputs = document.querySelectorAll("#profile-info-form input, #profile-info-form select");
    const userId = document.getElementById("user-id").value;

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
    const profilePic = document.querySelector('.profile-pic');
    const inputFile = document.getElementById('inputFile');


    if (fileInput) {
        const files = fileInput.files; // Certifique-se de que fileInput não é null
    } else {
        console.error("Elemento de entrada de arquivo não encontrado.");
    }

    // Função para carregar dados do perfil
    function loadProfileData(userId) {
        fetch(`http://localhost/LightApple/carregar_perfil.php?id=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const usuario = data.usuario;
                    // Preencher os campos do formulário
                    formInputs.forEach(input => {
                        if (input.name && usuario.hasOwnProperty(input.name)) {
                            input.value = usuario[input.name];
                            if (input.name === "tipoConta") {
                                input.disabled = true;
                            }
                        }
                    });

                    // Atualizar a imagem de perfil
                    if (usuario.profile_pic) {
                        profilePic.style.backgroundImage = `url('${usuario.profile_pic}')`;
                    }

                    // Chame a função para atualizar campos com base no tipo de conta, se necessário
                    updateFieldsBasedOnAccountType();
                } else {
                    alert("Erro ao carregar dados do perfil.");
                }
            })
            .catch(error => console.error("Erro:", error));
    }

    // Substitua `userId` pelo ID real do usuário
    loadProfileData(userId);

    function enableProfileEditing() {
        editProfileBtn.style.display = "none";
        formInputs.forEach(input => {
            if (input.name !== "tipoConta") {
                input.readOnly = false;
                if (input.tagName === "SELECT") {
                    input.disabled = false;
                }
            }
        });
        buttonContainer.style.display = "flex";
    }

    function saveProfile() {
        const formData = {};
        formInputs.forEach(input => {
            formData[input.name] = input.value;
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
                        input.readOnly = true;
                        if (input.tagName === "SELECT") {
                            input.disabled = true;
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

    updateFieldsBasedOnAccountType();

    editProfileBtn.addEventListener("click", enableProfileEditing);
    salvarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        saveProfile();
    });

    cancelarPerfilBtn.addEventListener("click", function (event) {
        event.preventDefault();
        cancelEditing();
    });

    // Código para troca de senha
    const trocarSenhaBtn = document.querySelector(".trocar-senha-btn");
    const overlay = document.querySelector(".overlay");
    const salvarSenhaBtn = document.querySelector(".salvar-senha-btn");
    const cancelarSenhaBtn = document.querySelector(".cancelar-senha-btn");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

    function showPasswordCard() {
        novaSenhaInput.value = "";
        confirmarSenhaInput.value = "";
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function hidePasswordCard() {
        overlay.style.display = "none";
        document.body.style.overflow = "";
    }

    trocarSenhaBtn.addEventListener("click", showPasswordCard);

    salvarSenhaBtn.addEventListener("click", function () {
        const novaSenha = novaSenhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();

        if (novaSenha === confirmarSenha && novaSenha !== "") {
            fetch(`http://localhost/LightApple/trocar_senha.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: userId, novaSenha: novaSenha })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Senha trocada com sucesso!");
                        hidePasswordCard();
                    } else {
                        alert("Erro ao trocar a senha: " + data.error);
                    }
                })
                .catch(error => console.error("Erro:", error));
        } else {
            alert("As senhas não coincidem ou estão vazias.");
        }
    });

    cancelarSenhaBtn.addEventListener("click", hidePasswordCard);

     // Função para pré-visualizar a imagem antes de fazer o upload
     function previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePic.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    }

     // Função para enviar a imagem para o servidor
     function enviarImagemPerfil() {
        if (inputFile.files.length === 0) {
            alert("Por favor, selecione uma imagem para enviar.");
            return;
        }

        const formData = new FormData();
        formData.append('profile_pic', inputFile.files[0]);

        fetch('trocar_imagem.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Imagem de perfil atualizada com sucesso!");
                profilePic.style.backgroundImage = `url('${data.nova_imagem}')`;
            } else {
                alert("Erro ao atualizar imagem de perfil: " + data.error);
            }
        })
        .catch(error => console.error("Erro:", error));
    }

    // Adiciona evento ao botão para trocar imagem
    const trocarImagemBtn = document.getElementById('trocar-imagem-btn');
    if (trocarImagemBtn) {
        trocarImagemBtn.addEventListener('click', function() {
            inputFile.click();
        });
    }

    // Adiciona evento de mudança ao input de arquivo
    if (inputFile) {
        inputFile.addEventListener('change', previewImage);
    }
});
