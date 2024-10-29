<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple</title>
    <link rel="stylesheet" href="criarconta.css">
</head>

<body>
    <header>
        <nav class="navbar">
            <a href="Home.html"><img class="light-apple-logo" src="imagens/LightApple-Logo.png" /></a>
            <div class="lightapple-titulo"><a href="#">LightApple</a></div>
            <div class="navigation">
                <div class="possui-conta">Já Possui conta?</div>
                <div class="entrar"><a href="entar.html">Entrar</a></div>
            </div>
        </nav>
    </header>
    <main>
        <section class="section-criar-conta">
            <div class="box-criarconta">
                <div class="tt">Criar Conta</div>
                <div class="desc">
                    Preencha os dados necessários abaixo para criar sua conta.
                </div>
            </div>
            <img class="coleta-imagem" src="imagens/coleta-imagem.png" />
            <div class="form-container">
                <form action="salvar_dados.php" method="POST" novalidate>
                    <label for="nome" class="txtnome">Nome</label>
                    <input type="text" id="nome" name="nome" required>

                    <label for="tipoConta" class="txttconta">Tipo de Conta</label>
                    <select id="tipoConta" name="tipoConta" required>
                        <option value="" disabled selected>Tipo da Conta</option>
                        <option value="pessoal">Cliente</option>
                        <option value="condominios">Condomínios</option>
                        <option value="estabelecimentos">Estabelecimentos</option>
                        <option value="empresa de coleta">Empresa de Coleta</option>
                        <option value="Transportadora">Transportadora</option>
                        <option value="Motoboys">Motoboys</option>
                    </select>

                    <label for="cpf" class="txtcpf">CPF</label>
                    <input type="text" id="cpf" name="cpf" pattern="\d{11}" maxlength="11"
                        title="O CPF deve ter exatamente 11 dígitos numéricos" required>

                    <label for="cnpj" id="label-cnpj" style="display: none;">CNPJ:</label>
                    <input type="text" id="cnpj" name="cnpj" style="display: none;">

                    <label for="dataNascimento" class="txtdatanasc">Data de Nascimento</label>
                    <input type="date" id="dataNascimento" name="dataNascimento" max="9999-12-31" required>

                    <label for="telefone" class="txttel">Telefone</label>
                    <input type="tel" id="telefone" name="telefone" pattern="\d{11}" maxlength="11"
                        title="O telefone deve ter exatamente 11 dígitos, incluindo o DDD" required>

                    <label for="endereco" class="txtend">Endereço</label>
                    <input type="text" id="endereco" name="endereco" required>

                    <label for="email" class="txtemail">Email</label>
                    <input type="email" id="email" name="email" required>

                    <label for="senha" class="txtsenha">Senha</label>
                    <input type="password" id="senha" name="senha" minlength="8"
                        title="A senha deve ter no mínimo 8 caracteres" required>

                    <label for="confirmarSenha" class="txtsenha">Confirmar Senha</label>
                    <input type="password" id="confirmarSenha" name="confirmarSenha" minlength="8" required>

                    <button type="submit">Criar Conta</button>
                </form>
            </div>

        </section>
    </main>
    <script src="criarconta.js"></script>

</body>

</html>