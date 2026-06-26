document.addEventListener("DOMContentLoaded", carregarRelatorios);

async function carregarRelatorios() {
    const resposta = await fetch("/api/vendas");
    const vendas = await resposta.json();

    const tabela = document.getElementById("listaRelatorios");
    tabela.innerHTML = "";

    let valorTotal = 0;

    vendas.forEach((venda) => {
        valorTotal += Number(venda.total || 0);

        tabela.innerHTML += `
            <tr>
                <td>${venda.id}</td>
                <td>${formatarDinheiroRelatorio(venda.total)}</td>
                <td>${formatarDinheiroRelatorio(venda.valor_recebido)}</td>
                <td>${formatarDinheiroRelatorio(venda.troco)}</td>
                <td>${venda.forma_pagamento || "DINHEIRO"}</td>
                <td>${formatarData(venda.criado_em)}</td>
            </tr>
        `;
    });

    document.getElementById("totalVendas").innerText = vendas.length;
    document.getElementById("valorVendido").innerText = formatarDinheiroRelatorio(valorTotal);
}

function formatarDinheiroRelatorio(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
}