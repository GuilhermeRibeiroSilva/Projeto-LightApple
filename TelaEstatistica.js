document.addEventListener("DOMContentLoaded", function() {
    // Dados de exemplo para os gráficos
    const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const receitasMensais = [8000, 9000, 7500, 8500, 9500, 10000, 12000, 11000, 11500, 12500, 10500, 13000]; // Exemplo
    const kgLixoMensal = [400, 450, 380, 420, 470, 500, 600, 550, 580, 620, 510, 650]; // Exemplo
    const pedidosMensais = [15, 18, 14, 20, 22, 25, 30, 28, 32, 35, 29, 40]; // Exemplo

    // Calcular total de receitas, total de kg de lixo e total de pedidos
    const totalReceitas = receitasMensais.reduce((acc, valor) => acc + valor, 0);
    const totalKgLixo = kgLixoMensal.reduce((acc, valor) => acc + valor, 0);
    const totalPedidos = pedidosMensais.reduce((acc, valor) => acc + valor, 0);

    // Calcular a média de kg por pedido
    const mediaKgPorPedido = totalKgLixo / totalPedidos;

    // Atualizar os valores exibidos nos cards
    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toLocaleString()}`;
    document.getElementById('totalKgLixo').textContent = `${totalKgLixo.toLocaleString()} KG`;
    document.getElementById('mediaKgPedido').textContent = `${mediaKgPorPedido.toFixed(2)} KG`;
    document.getElementById('totalPedidos').textContent = totalPedidos.toLocaleString();

    // Gráficos

    // Gráfico de Receitas
    const graficoReceitasCtx = document.getElementById('graficoReceitas').getContext('2d');
    new Chart(graficoReceitasCtx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Receitas Mensais (R$)',
                data: receitasMensais,
                backgroundColor: '#218838',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de KG de Lixo
    const graficoKgLixoCtx = document.getElementById('graficoKgLixo').getContext('2d');
    new Chart(graficoKgLixoCtx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'KG de Lixo Coletado',
                data: kgLixoMensal,
                backgroundColor: '#218838',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de Média de KG por Pedido
    const mediaKgCtx = document.getElementById('mediaKgChart').getContext('2d');
    new Chart(mediaKgCtx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Média de KG por Pedido',
                data: kgLixoMensal.map((kg, i) => kg / pedidosMensais[i]), // Média mensal de KG por pedido
                backgroundColor: 'rgba(33, 136, 56, 0.2)',
                borderColor: '#218838',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de Total de Pedidos
    const totalPedidosCtx = document.getElementById('totalPedidosChart').getContext('2d');
    new Chart(totalPedidosCtx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Total de Pedidos',
                data: pedidosMensais,
                backgroundColor: '#218838',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
