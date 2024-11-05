<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple</title>
    <link rel="stylesheet" href="TelaHistorico(entrega).css">
    <link rel="stylesheet" href="navmenu(entrega).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
<input type="hidden" id="user-id" value="<?php echo htmlspecialchars($userId); ?>">
    <header>
        <div class="hero">
            <nav>
                <a href="TelaInicialEntrega.php"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="TelaInicialEntrega.php" class="inicio">Inicio</a></li>
                    <li><a href="TelaEstabelecimentos.php" class="empresa-coleta">Estabelecimentos</a></li>
                    <li><a href="#" class="trocar-pontos">Minhas Entregas</a></li>
                    <li><a href="#" class="pedidos">Histórico</a></li>
                </ul>
                <input type="search" name="pesquisar" id="pesquisar" placeholder="Pesquisar...">
                <!-- Drop-down de Pedidos Disponíveis -->
                <div class="pedidos-menu">
                    <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
                    <div class="sub-menu-ped-wrap" id="pedidosDisponiveis">
                        <div class="sub-menu-ped">
                            <div class="ped-info">
                                <img src="imagens/LightApple-Logo.png" alt="Ícone de pedidos">
                                <h3>Pedidos Disponíveis</h3>
                            </div>
                            <div class="pedidos-lista">
                                <!-- Pedidos serão carregados aqui via JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="user-menu">
                    <img src="<?php echo $profileImagePath; ?>" class="user-perf" id="userImageCircle" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="<?php echo $profileImagePath; ?>" class="user-image-circle" id="userImageDropdown">
                                <h3>Olá, <?php echo explode(' ', $usuario['nome'])[0]; ?></h3>
                            </div>
                            <a href="TelaMeuperfil(entrega).php" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="TelaFavoritos(entrega).php" class="sub-menu-link">
                                <p>Favoritos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Receitas/Pagamentos</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
                                <p>Ajuda</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="logout.php" class="sub-menu-link">
                                <p>Sair</p>
                                <span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>
    <section class="section-txt">
        <h1 class="historico">Historico</h1>
    </section>
    <main>
        <div class="accordion" id="accordionPanelsStayOpenExample">

            <input type="search" name="" id="flitersearch">

            <!-- Filtro de Status Pedidos -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingStatus">Status do Pedido</h2>
                <div id="collapseStatus" class="accordion-collapse collapse show" aria-labelledby="headingStatus">
                    <div class="accordion-body">
                        <ul class="list-unstyled">
                            <li><a href="#" class="status-link text-dark">Todos</a></li>
                            <li><a href="#" class="status-link text-dark">Abertos</a></li>
                            <li><a href="#" class="status-link text-dark">Pendentes</a></li>
                            <li><a href="#" class="status-link text-dark">Fechados</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Filtro de Data de Pedido -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingData">Data de Pedido</h2>
                <div id="collapseData" class="accordion-collapse collapse show" aria-labelledby="headingData">
                    <div class="accordion-body">
                        <label for="orderDate">Data do Pedido:</label>
                        <input type="date" id="orderDate" class="form-control">
                    </div>
                </div>
            </div>

        </div>

        <div class="products-grid">
            <div class="product" data-status="Pendentes" data-data="2024-05-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <span class="info">&#8505;</span>
            </div>
            <div class="product" data-status="Abertos" data-data="2024-05-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }'>
                <h3>Pedido #002</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>ABERTO</p>
                <span class="info">&#8505;</span>
            </div>
            <div class="product" data-status="Fechados" data-data="2022-08-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }'>
                <h3>Pedido #003</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/08/2022</P>
                <p>FECHADO</p>
                <span class="info">&#8505;</span>
            </div>
            <div class="product" data-status="Abertos" data-data="2022-08-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }'>
                <h3>Pedido #004</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/08/2022</P>
                <p>ABERTO</p>
                <span class="info">&#8505;</span>
            </div>
            <div class="product" data-status="Pendentes" data-data="2020-12-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }'>
                <h3>Pedido #005</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/12/2020</P>
                <p>PENDENTE</p>
                <span class="info">&#8505;</span>
            </div>
            <div class="product" data-status="Fechados" data-data="2020-12-15" data-info='{
            "id": "#001",
            "produto": "ROOP",
            "localPartida": "XY",
            "localChegada": "X",
            "quantidade": "15 kg",
            "data": "15/05/2024",
            "status": "PENDENTE"
        }'>
                <h3>Pedido #006</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/12/2020</P>
                <p>FECHADO</p>
                <span class="info">&#8505;</span>
            </div>

        </div>
        <!-- Modal que aparecerá ao clicar no ícone de info -->
        <div id="modal" class="modal hidden">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Informações do Pedido</h3>
                <p id="modal-info"></p>
            </div>
        </div>
    </main>
    <div class="pagination">
        <button class="prev" disabled>Previous</button>
        <button class="page-number active">1</button>
        <span>...</span>
        <button class="page-number">2</button>
        <button class="page-number">3</button>
        <button class="next">Next</button>
    </div>
    <footer class="footer">
        <img class="light-apple-logo" src="imagens/LightApple-Logo.png" />
        <div class="copy-2024-light-apple">&copy; 2024 LightApple</div>
        <div class="box-social">
            <a href="#"><img class="twitter" src="imagens/Twitter.png" /></a>
            <a href="#"><img class="instagram" src="imagens/Instagram.png" /></a>
            <a href="#"><img class="facebook" src="imagens/Facebook.png" /></a>
            <a href="#"><img class="linkedin" src="imagens/Linkedin.png" /></a>
        </div>
        <div class="box-info">
            <div class="titulo-lightapple">
                <div class="titulo-txt">
                    <div class="tt3">LightApple</div>
                </div>
            </div>
            <div class="sobre">
                <a href="#">
                    <div class="txt-sobre">Sobre</div>
                </a>
            </div>
            <div class="fale-conosco">
                <a href="#">
                    <div class="txt-fale-conosco">Fale Conosco</div>
                </a>
            </div>
            <div class="termos-de-uso">
                <a href="#">
                    <div class="txt-termos">Termos de Uso</div>
                </a>
            </div>
        </div>
    </footer>
    <script src="TelaHistorico(entrega).js"></script>
    <script src="navmenu(entrega).js"></script>
</body>

</html>