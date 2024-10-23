const buttonsWrapper = document.querySelector(".map");
const slides = document.querySelector(".box-cards");

buttonsWrapper.addEventListener("click", e => {
    if (e.target.nodeName === "BUTTON") {
      Array.from(buttonsWrapper.children).forEach(item =>
        item.classList.remove("active")
      );
      if (e.target.classList.contains("first")) {
        slides.style.transform = "translateX(-0%)";
        e.target.classList.add("active");
      } else if (e.target.classList.contains("second")) {
        slides.style.transform = "translateX(-33.33333333333333%)";
        e.target.classList.add("active");
      } else if (e.target.classList.contains('third')){
        slides.style.transform = 'translatex(-66.6666666667%)';
        e.target.classList.add('active');
      }
    }
  });

// Seleciona o elemento que contém a lista de pedidos disponíveis e o aviso de "Aguardar"
const availableOrdersList = document.getElementById('available-orders-list');
const noAvailableOrders = document.getElementById('no-available-orders');

// Seleciona o elemento que contém a lista de pedidos aceitos e o aviso de "Nenhum pedido aceito"
const acceptedOrdersList = document.getElementById('accepted-orders-list');
const noAcceptedOrders = document.getElementById('no-accepted-orders');

// Adiciona evento de clique ao botão "Aceitar" em pedidos disponíveis
document.querySelectorAll('.aceitar').forEach(button => {
    button.addEventListener('click', function() {
        // Remove o pedido da lista de pedidos disponíveis
        const pedido = this.closest('.pedidoNum');
        pedido.remove();

        // Verifica se ainda existem pedidos disponíveis
        if (availableOrdersList.children.length === 0) {
            noAvailableOrders.style.display = 'block'; // Exibe mensagem de aguardar
        }

        // Cria uma cópia do pedido aceito para mover para a lista de pedidos aceitos
        const acceptedPedido = pedido.cloneNode(true);
        acceptedPedido.classList.remove('pedidoNum'); // Ajusta a classe para diferenciar dos pedidos disponíveis
        acceptedPedido.classList.add('pedidoAct'); // Classe para pedidos aceitos

        acceptedPedido.querySelector('.aceitar').remove(); // Remove o botão "Aceitar" do pedido aceito
        acceptedPedido.querySelector('.rejeitar').remove(); // Remove o botão "Rejeitar" do pedido aceito

        // Adiciona botão de "Marcar como entregue" no pedido aceito
        const deliveredButton = document.createElement('button');
        deliveredButton.classList.add('entregue');
        deliveredButton.textContent = 'Marcar como entregue';
        acceptedPedido.querySelector('.botoes').appendChild(deliveredButton);

        // Adiciona o pedido aceito à lista de pedidos aceitos
        acceptedOrdersList.appendChild(acceptedPedido);

        // Remove o aviso de "Nenhum pedido aceito" quando um pedido é adicionado
        noAcceptedOrders.style.display = 'none';

        // Evento para remover o pedido aceito quando for "Marcar como entregue"
        deliveredButton.addEventListener('click', function() {
            this.closest('.pedidoAct').remove(); // Remove o pedido da lista de aceitos

            // Se não houver mais pedidos aceitos, exibe o aviso novamente
            if (acceptedOrdersList.children.length === 0) {
                noAcceptedOrders.style.display = 'block';
            }
        });
    });
});

// Verifica se não há pedidos disponíveis ao carregar a página
if (availableOrdersList.children.length === 0) {
    noAvailableOrders.style.display = 'block'; // Exibe mensagem de aguardar
} else {
    noAvailableOrders.style.display = 'none'; // Oculta a mensagem se houver pedidos
}

// Verifica se não há pedidos aceitos ao carregar a página
if (acceptedOrdersList.children.length === 0) {
    noAcceptedOrders.style.display = 'block'; // Exibe mensagem de nenhum pedido aceito
} else {
    noAcceptedOrders.style.display = 'none'; // Oculta a mensagem se houver pedidos aceitos
}
