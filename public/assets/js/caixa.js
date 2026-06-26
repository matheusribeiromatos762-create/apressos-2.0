let produtosDisponiveis = [];
let itensVenda = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosCaixa();

    const campoCodigo = document.getElementById("codigoVenda");

    campoCodigo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            buscarProdutoVenda();
        }
    });
});

async function carregarProdutosCaixa() {
    const resposta = await fetch("/api/produtos");
    produtosDisponiveis = await resposta.json();
}

function buscarProdutoVenda() {
    const codigoDigitado = document.getElementById("codigoVenda").value.trim();

    if (!codigoDigitado) {
        alert("Digite ou escaneie um código");
        return;
    }

    const produto = produtosDisponiveis.find((item) => {
        return (
            String(item.codigo_interno) === codigoDigitado ||
            String(item.codigo_barras) === codigoDigitado
        );
    });

    if (!produto) {
        alert("Produto não encontrado");
        document.getElementById("codigoVenda").value = "";
        document.getElementById("codigoVenda").focus();
        return;
    }

    adicionarProdutoNaVenda(produto);

    document.getElementById("codigoVenda").value = "";
    document.getElementById("codigoVenda").focus();
}

function adicionarProdutoNaVenda(produto) {
    const itemExistente = itensVenda.find((item) => item.id === produto.id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
        itemExistente.total = itemExistente.quantidade * itemExistente.preco;
    } else {
        itensVenda.push({
            id: produto.id,
            codigo: produto.codigo_interno,
            nome: produto.nome,
            preco: Number(produto.preco || 0),
            quantidade: 1,
            total: Number(produto.preco || 0)
        });
    }

    atualizarTabelaVenda();
}

function atualizarTabelaVenda() {
    const tabela = document.getElementById("listaVenda");

    tabela.innerHTML = "";

    itensVenda.forEach((item, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>${formatarDinheiroCaixa(item.preco)}</td>
                <td>${formatarDinheiroCaixa(item.total)}</td>
                <td>
                    <button onclick="removerItem(${index})">Remover</button>
                </td>
            </tr>
        `;
    });

    atualizarTotalVenda();
}

function removerItem(index) {
    itensVenda.splice(index, 1);
    atualizarTabelaVenda();
}

function atualizarTotalVenda() {
    const total = itensVenda.reduce((soma, item) => soma + item.total, 0);

    document.getElementById("totalVenda").innerText = formatarDinheiroCaixa(total);

    calcularTroco();
}

function calcularTroco() {
    const total = itensVenda.reduce((soma, item) => soma + item.total, 0);
    const recebido = Number(document.getElementById("valorRecebido").value || 0);
    const troco = recebido - total;

    document.getElementById("trocoVenda").innerText = formatarDinheiroCaixa(troco > 0 ? troco : 0);
}

function finalizarVenda() {
    if (itensVenda.length === 0) {
        alert("Nenhum produto na venda");
        return;
    }

    alert("Venda finalizada com sucesso!");

    cancelarVenda();
}

function cancelarVenda() {
    itensVenda = [];

    document.getElementById("valorRecebido").value = "";
    document.getElementById("codigoVenda").value = "";

    atualizarTabelaVenda();

    document.getElementById("codigoVenda").focus();
}

function formatarDinheiroCaixa(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}