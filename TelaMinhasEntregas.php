<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightApple</title>
    <link rel="stylesheet" href="TelaMinhasEntregas.css">
    <link rel="stylesheet" href="navmenu(entrega).css">
    <link rel="stylesheet" href="footer.css">
</head>

<body>
    <header>
        <div class="hero">
            <nav>
                <a href="#"><img src="imagens/LightApple-Logo.png" class="logo-lightapple"></a>
                <a href="#">
                    <h2 class="lightapple-titulo">LightApple</h2>
                </a>
                <ul>
                    <li><a href="#" class="inicio">Inicio</a></li>
                    <li><a href="#" class="empresa-coleta">Estabelecimentos</a></li>
                    <li><a href="#" class="trocar-pontos">Minhas Entregas</a></li>
                    <li><a href="#" class="pedidos">Histórico</a></li>
                </ul>
                <input type="search" name="pesquisar" id="pesquisar" placeholder="Pesquisar...">
                <div class="pedido-menu">
                    <img src="imagens/Clipboard.png" class="ped-pic" onclick="toggleMenuPed()">
                    <div class="sub-menu-ped-wrap" id="criarPed">
                        <div class="sub-menu-ped">
                            <div class="ped-info">
                                <img src="imagens/LightApple-Logo.png">
                                <h3>Pedidos Disponíveis</h3>
                            </div>
                            <div class="lista-pedidos" id="lista-pedidos">
                                <div class="pedido-box" id="pedido-1">
                                    <div class="pedido-detalhes">
                                        <h4>Empresa X</h4>
                                        <p><strong>Partida:</strong> Rua A</p>
                                        <p><strong>Chegada:</strong> Rua B</p>
                                        <p><strong>Peso:</strong> 10kg</p>
                                        <p><strong>Valor:</strong> R$ 50,00</p>
                                    </div>
                                    <div class="pedido-acoes">
                                        <button class="btn-aceitar" onclick="aceitarPedido('pedido-1')">Aceitar</button>
                                        <button class="btn-rejeitar"
                                            onclick="rejeitarPedido('pedido-1')">Rejeitar</button>
                                    </div>
                                </div>
                                <div class="pedido-box" id="pedido-2">
                                    <div class="pedido-detalhes">
                                        <h4>Empresa Y</h4>
                                        <p><strong>Partida:</strong> Rua C</p>
                                        <p><strong>Chegada:</strong> Rua D</p>
                                        <p><strong>Peso:</strong> 15kg</p>
                                        <p><strong>Valor:</strong> R$ 70,00</p>
                                    </div>
                                    <div class="pedido-acoes">
                                        <button class="btn-aceitar" onclick="aceitarPedido('pedido-2')">Aceitar</button>
                                        <button class="btn-rejeitar"
                                            onclick="rejeitarPedido('pedido-2')">Rejeitar</button>
                                    </div>
                                </div>
                                <div class="pedido-box" id="pedido-2">
                                    <div class="pedido-detalhes">
                                        <h4>Empresa Y</h4>
                                        <p><strong>Partida:</strong> Rua C</p>
                                        <p><strong>Chegada:</strong> Rua D</p>
                                        <p><strong>Peso:</strong> 15kg</p>
                                        <p><strong>Valor:</strong> R$ 70,00</p>
                                    </div>
                                    <div class="pedido-acoes">
                                        <button class="btn-aceitar" onclick="aceitarPedido('pedido-2')">Aceitar</button>
                                        <button class="btn-rejeitar"
                                            onclick="rejeitarPedido('pedido-2')">Rejeitar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="user-menu">
                    <img src="imagens/Avatar.png" class="user-pic" onclick="toggleMenu()">
                    <div class="sub-menu-wrap" id="subMenu">
                        <div class="sub-menu">
                            <div class="user-info">
                                <img src="imagens/Avatar.png">
                                <h3>Joana</h3>
                            </div>
                            <a href="#" class="sub-menu-link">
                                <p>Meu Perfil</p>
                                <span></span>
                            </a>
                            <hr>
                            <a href="#" class="sub-menu-link">
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
                            <a href="#" class="sub-menu-link">
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
        <h1 class="Minhas_Entregas">Minhas Entregas</h1>
    </section>
    <main>

        <div class="map-dst">
            <div id="map"></div>
            <div id="route-details" class="route-details-panel"></div>
        </div>
        <div class="products-grid">
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}'  data-route='{"start": {"lat": -12.962968179147097, "lng": -38.49832109059965}, "end": {"lat": -12.948315422878128, "lng": -38.413367775255864}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route"  >Mostrar Rota</button>
                <span class="info">&#8505;</span>
            </div>
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}' data-route='{"start": {"lat": -12.9714, "lng": -38.5014}, "end": {"lat": -12.9833, "lng": -38.5167}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route">Mostrar Rota</button>
                <span class="info">&#8505;</span>
            </div>
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}' data-route='{"start": {"lat": -12.9714, "lng": -38.5014}, "end": {"lat": -12.9833, "lng": -38.5167}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route">Mostrar Rota</button>
                <span class="info">&#8505;</span>
            </div>
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}' data-route='{"start": {"lat": -12.9714, "lng": -38.5014}, "end": {"lat": -12.9833, "lng": -38.5167}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route">Mostrar Rota</button>
                <span class="info">&#8505;</span>
            </div>
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}' data-route='{"start": {"lat": -12.9714, "lng": -38.5014}, "end": {"lat": -12.9833, "lng": -38.5167}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route">Mostrar Rota</button>
                <span class="info">&#8505;</span>
            </div>
            <div class="product"
                data-info='{"id": "#001", "estabelecimento": "ROOP", "localPartida": "XY", "localChegada": "Rua B" , "quantidade": "15 kg", "data": "15/05/2024", "status": "PENDENTE"}' data-route='{"start": {"lat": -12.9714, "lng": -38.5014}, "end": {"lat": -12.9833, "lng": -38.5167}}' >
                <h3>Pedido #001</h3>
                <p>ROOP</p>
                <p>Qtd: 15 kg</p>
                <P>15/05/2024</P>
                <p>PENDENTE</p>
                <button class="show-route" >Mostrar Rota</button>
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
    <script src="TelaMinhasEntregas.js"></script>
    <script src="navmenu(entrega).js"></script>
    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAppxfGYLdYhP8lVimrq43dP6Gso9Y-si4&callback=initMap">
        </script>

</body>

</html>