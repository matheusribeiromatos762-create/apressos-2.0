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
        limparCampoCodigo();
        return;
    }

    if (Number(produto.estoque || 0) <= 0) {
        alert("Produto sem estoque");
        limparCampoCodigo();
        return;
    }

    adicionarProdutoNaVenda(produto);
    limparCampoCodigo();
}

function adicionarProdutoNaVenda(produto) {
    const itemExistente = itensVenda.find((item) => item.id === produto.id);

    const estoqueDisponivel = Number(produto.estoque || 0);

    if (itemExistente) {
        if (itemExistente.quantidade + 1 > estoqueDisponivel) {
            alert("Quantidade maior que o estoque disponível");
            return;
        }

        itemExistente.quantidade += 1;
        itemExistente.total = itemExistente.quantidade * itemExistente.preco;
    } else {
        itensVenda.push({
            id: produto.id,
            codigo: produto.codigo_interno,
            nome: produto.nome,
            preco: Number(produto.preco || 0),
            quantidade: 1,
            total: Number(produto.preco || 0),
            estoque: estoqueDisponivel
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
                <td>
                    <button onclick="diminuirQuantidade(${index})">-</button>
                    ${item.quantidade}
                    <button onclick="aumentarQuantidade(${index})">+</button>
                </td>
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

function aumentarQuantidade(index) {
    const item = itensVenda[index];

    if (item.quantidade + 1 > item.estoque) {
        alert("Quantidade maior que o estoque disponível");
        return;
    }

    item.quantidade += 1;
    item.total = item.quantidade * item.preco;

    atualizarTabelaVenda();
}

function diminuirQuantidade(index) {
    const item = itensVenda[index];

    if (item.quantidade <= 1) {
        removerItem(index);
        return;
    }

    item.quantidade -= 1;
    item.total = item.quantidade * item.preco;

    atualizarTabelaVenda();
}

function removerItem(index) {
    itensVenda.splice(index, 1);
    atualizarTabelaVenda();
}

function atualizarTotalVenda() {
    const total = calcularTotal();

    document.getElementById("totalVenda").innerText = formatarDinheiroCaixa(total);

    calcularTroco();
}

function calcularTotal() {
    return itensVenda.reduce((soma, item) => soma + item.total, 0);
}

function calcularTroco() {
    const total = calcularTotal();
    const recebido = Number(document.getElementById("valorRecebido").value || 0);
    const troco = recebido - total;

    document.getElementById("trocoVenda").innerText = formatarDinheiroCaixa(troco > 0 ? troco : 0);
}

async function finalizarVenda() {
    if (itensVenda.length === 0) {
        alert("Nenhum produto na venda");
        return;
    }

    const total = calcularTotal();
    const recebido = Number(document.getElementById("valorRecebido").value || 0);

    if (recebido < total) {
        alert("Valor recebido menor que o total da venda");
        return;
    }

    const troco = recebido - total;

    const resposta = await fetch("/api/vendas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            itens: itensVenda,
            total,
            valor_recebido: recebido,
            troco
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao finalizar venda");
        return;
    }

    alert("Venda finalizada com sucesso!");

    cancelarVenda();
    carregarProdutosCaixa();
}

function cancelarVenda() {
    itensVenda = [];

    document.getElementById("valorRecebido").value = "";
    document.getElementById("codigoVenda").value = "";

    atualizarTabelaVenda();

    document.getElementById("codigoVenda").focus();
}

function limparCampoCodigo() {
    document.getElementById("codigoVenda").value = "";
    document.getElementById("codigoVenda").focus();
}

function formatarDinheiroCaixa(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}