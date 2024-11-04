document.addEventListener("DOMContentLoaded", function () {
    // Importar funções de cálculo de distância
    async function obterLocalizacaoUsuario() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    error => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error("Geolocalização não disponível"));
            }
        });
    }

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

    // Remova o segundo DOMContentLoaded (linhas 213-287) e adicione o código da troca de senha aqui
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

    // Função para verificar permissão e mostrar/esconder botão de cadastro
    function verificarPermissaoCadastro() {
        const tipoConta = document.getElementById("tipoConta").value;
        // Ajustar os tipos para corresponder exatamente aos valores do select no PHP
        const tiposPermitidos = ['estabelecimentos', 'condominios', 'empresa de coleta'];
        
        if (btnCadastrar) {
            console.log("Tipo de conta atual:", tipoConta); // Debug
            if (tiposPermitidos.includes(tipoConta.toLowerCase())) {
                btnCadastrar.style.display = 'block';
                btnCadastrar.addEventListener('click', mostrarFormularioCadastro);
            } else {
                btnCadastrar.style.display = 'none';
            }
        }
    }

    // Função para mostrar formulário de cadastro
    function mostrarFormularioCadastro() {
        const overlayForm = document.createElement('div');
        overlayForm.className = 'overlay';
        overlayForm.innerHTML = `
            <div class="ad-card">
                <h2>Cadastrar Local</h2>
                <form id="ad-form" enctype="multipart/form-data">
                    <label for="ad-name">Nome do Local:</label>
                    <input type="text" id="ad-name" name="nome" required>

                    <label for="ad-image">Imagem do Local:</label>
                    <div class="image-upload-container">
                        <input type="file" id="ad-image" name="imagem" accept="image/*" required>
                        <div id="image-preview" class="image-preview"></div>
                    </div>

                    <label for="ad-address">Endereço:</label>
                    <input type="text" id="ad-address" name="endereco" required>

                    <label for="ad-category">Categoria:</label>
                    <select id="ad-category" name="categoria" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="empresa de coleta">Empresa de Coleta</option>
                        <option value="estabelecimentos">Estabelecimento</option>
                        <option value="condominios">Condomínio</option>
                    </select>

                    <div id="limite-coleta-container" style="display: none;">
                        <label for="ad-limite-coleta">Limite de Coleta Diário (kg):</label>
                        <input type="number" id="ad-limite-coleta" name="limite_coleta" min="1">
                    </div>

                    <div class="button-container">
                        <button type="submit" class="salvar-btn">Cadastrar</button>
                        <button type="button" class="cancelar-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlayForm);

        // Configurar preview da imagem
        const imageInput = overlayForm.querySelector('#ad-image');
        const imagePreview = overlayForm.querySelector('#image-preview');
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.style.backgroundImage = `url(${e.target.result})`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Mostrar/esconder campo de limite de coleta
        const categorySelect = overlayForm.querySelector('#ad-category');
        const limiteColetaContainer = overlayForm.querySelector('#limite-coleta-container');
        categorySelect.addEventListener('change', function () {
            limiteColetaContainer.style.display =
                this.value === 'empresa de coleta' ? 'block' : 'none';
            document.getElementById("ad-limite-coleta").required =
                this.value === 'empresa de coleta';
        });

        // Submit do formulário
        const form = overlayForm.querySelector('#ad-form');
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                // Geocodificar o endereço
                const address = formData.get('endereco');
                const geocoder = new google.maps.Geocoder();
                
                geocoder.geocode({ 'address': address }, async function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        const location = results[0].geometry.location;
                        
                        // Adiciona latitude e longitude ao FormData
                        formData.append('latitude', location.lat());
                        formData.append('longitude', location.lng());

                        try {
                            const response = await fetch('cadastrar_local.php', {
                                method: 'POST',
                                body: formData
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (data.success) {
                                // Após cadastrar com sucesso, calcular a distância
                                try {
                                    const posicaoUsuario = await obterLocalizacaoUsuario();
                                    const distancias = await fetch('calcular_distancias.php', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            latitude: posicaoUsuario.latitude,
                                            longitude: posicaoUsuario.longitude
                                        })
                                    });

                                    if (!distancias.ok) {
                                        throw new Error('Erro ao calcular distâncias');
                                    }

                                    alert('Local cadastrado com sucesso!');
                                    document.body.removeChild(overlayForm);
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Erro ao calcular distâncias:', error);
                                    // Ainda recarrega a página mesmo se houver erro no cálculo da distância
                                    alert('Local cadastrado com sucesso, mas houve um erro ao calcular distâncias');
                                    document.body.removeChild(overlayForm);
                                    window.location.reload();
                                }
                            } else {
                                alert('Erro ao cadastrar local: ' + (data.message || 'Erro desconhecido'));
                            }
                        } catch (error) {
                            console.error('Erro:', error);
                            alert('Erro ao cadastrar local: ' + error.message);
                        }
                    } else {
                        alert('Erro ao geocodificar o endereço: ' + status);
                    }
                });
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao processar o cadastro: ' + error.message);
            }
        });

        // Fechar formulário
        overlayForm.querySelector('.cancelar-btn').addEventListener('click', function () {
            document.body.removeChild(overlayForm);
        });
    }

    // Adicionar evento de clique ao botão de cadastro
    const btnCadastrar = document.querySelector('.btn-cadastrar');
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', mostrarFormularioCadastro);
    }

    // Modificar a função loadProfileData para incluir a verificação de permissão
    const originalLoadProfileData = loadProfileData;
    loadProfileData = function() {
        originalLoadProfileData();
        verificarPermissaoCadastro();
    };
});