let produtosDisponiveis = [];
let itensVenda = [];
let valorRecebidoInformado = null;
let modalAberto = false;
let formaPagamento = "DINHEIRO";

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosCaixa();

    const campoCodigo = document.getElementById("codigoVenda");

    campoCodigo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" && !modalAberto) {
            buscarProdutoVenda();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (modalAberto) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                confirmarVenda();
            }

            if (evento.key === "Escape") {
                evento.preventDefault();
                fecharModalVenda();
            }

            return;
        }

        if (evento.key === "F1") {
            evento.preventDefault();
            prepararFinalizacao("DINHEIRO");
        }

        if (evento.key === "F2") {
            evento.preventDefault();
            prepararFinalizacao("CARTÃO");
        }

        if (evento.key === "F3") {
            evento.preventDefault();
            prepararFinalizacao("PIX");
        }

        if (evento.key === "F4") {
            evento.preventDefault();
            informarValorRecebido();
        }
    });

    document.getElementById("btnSim").addEventListener("click", confirmarVenda);
    document.getElementById("btnNao").addEventListener("click", fecharModalVenda);

    atualizarFormaPagamento();
});

async function carregarProdutosCaixa() {
    const resposta = await fetch("/api/produtos");
    produtosDisponiveis = await resposta.json();
}

function prepararFinalizacao(tipo) {
    if (itensVenda.length === 0) {
        alert("Nenhum produto na venda");
        return;
    }

    formaPagamento = tipo;
    atualizarFormaPagamento();
    abrirModalVenda();
}

function atualizarFormaPagamento() {
    const campo = document.getElementById("formaPagamentoAtual");

    if (campo) {
        campo.innerText = formaPagamento;
    }
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

function calcularTotal() {
    return itensVenda.reduce((soma, item) => soma + item.total, 0);
}

function atualizarTotalVenda() {
    document.getElementById("totalVenda").innerText = formatarDinheiroCaixa(calcularTotal());
    atualizarTrocoOuFalta();
}

function informarValorRecebido() {
    const total = calcularTotal();

    if (itensVenda.length === 0) {
        alert("Nenhum produto na venda");
        return;
    }

    const valor = prompt(`Total da venda: ${formatarDinheiroCaixa(total)}\nDigite o valor recebido:`);

    if (valor === null || valor.trim() === "") {
        valorRecebidoInformado = null;
        document.getElementById("valorRecebido").value = "";
        atualizarTrocoOuFalta();
        return;
    }

    valorRecebidoInformado = Number(valor.replace(",", "."));
    document.getElementById("valorRecebido").value = valorRecebidoInformado;

    atualizarTrocoOuFalta();
}

function calcularTroco() {
    const valor = document.getElementById("valorRecebido").value;
    valorRecebidoInformado = valor ? Number(valor) : null;
    atualizarTrocoOuFalta();
}

function atualizarTrocoOuFalta() {
    const total = calcularTotal();
    const campoTroco = document.getElementById("trocoVenda");

    if (valorRecebidoInformado === null) {
        campoTroco.innerText = "Pagamento exato";
        campoTroco.style.color = "#198754";
        return;
    }

    const diferenca = valorRecebidoInformado - total;

    if (diferenca >= 0) {
        campoTroco.innerText = `Troco: ${formatarDinheiroCaixa(diferenca)}`;
        campoTroco.style.color = "#198754";
    } else {
        campoTroco.innerText = `Falta: ${formatarDinheiroCaixa(Math.abs(diferenca))}`;
        campoTroco.style.color = "#dc3545";
    }
}

function abrirModalVenda() {
    modalAberto = true;

    document.getElementById("modalTextoFinalizar").innerText =
        `Deseja finalizar a venda em ${formaPagamento}?`;

    document.getElementById("modalFinalizar").style.display = "flex";
}

function fecharModalVenda() {
    modalAberto = false;
    document.getElementById("modalFinalizar").style.display = "none";
    document.getElementById("codigoVenda").focus();
}

async function confirmarVenda() {
    fecharModalVenda();
    await finalizarVenda();
}

async function finalizarVenda() {
    if (itensVenda.length === 0) {
        alert("Nenhum produto na venda");
        return;
    }

    const total = calcularTotal();

    const recebido = valorRecebidoInformado === null
        ? total
        : valorRecebidoInformado;

    const troco = recebido > total ? recebido - total : 0;

    const resposta = await fetch("/api/vendas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            itens: itensVenda,
            total,
            valor_recebido: recebido,
            troco,
            forma_pagamento: formaPagamento
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao finalizar venda");
        return;
    }

    alert(`Venda finalizada em ${formaPagamento}`);

    cancelarVenda();
    carregarProdutosCaixa();
}

function cancelarVenda() {
    itensVenda = [];
    valorRecebidoInformado = null;
    formaPagamento = "DINHEIRO";

    document.getElementById("valorRecebido").value = "";
    document.getElementById("codigoVenda").value = "";

    atualizarTabelaVenda();
    atualizarTrocoOuFalta();
    atualizarFormaPagamento();

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