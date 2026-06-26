let produtosEstoque = [];

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(carregarEstoque, 300);
});

async function carregarEstoque() {
    try {
        const resposta = await fetch("/api/produtos");
        produtosEstoque = await resposta.json();

        atualizarResumo();
        atualizarTabelaEstoque(produtosEstoque);
    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
    }
}

function atualizarResumo() {
    const totalProdutos = produtosEstoque.length;

    const estoqueBaixo = produtosEstoque.filter((produto) =>
        Number(produto.estoque || 0) > 0 &&
        Number(produto.estoque || 0) <= Number(produto.estoque_minimo || 0)
    ).length;

    const semEstoque = produtosEstoque.filter((produto) =>
        Number(produto.estoque || 0) <= 0
    ).length;

    const valorEstoque = produtosEstoque.reduce((total, produto) => {
        return total + (Number(produto.preco || 0) * Number(produto.estoque || 0));
    }, 0);

    document.getElementById("totalProdutos").innerText = totalProdutos;
    document.getElementById("estoqueBaixo").innerText = estoqueBaixo;
    document.getElementById("semEstoque").innerText = semEstoque;
    document.getElementById("valorEstoque").innerText = valorEstoque.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function atualizarTabelaEstoque(lista) {
    const tabela = document.getElementById("listaEstoque");

    tabela.innerHTML = "";

    lista.forEach((produto) => {
        const estoque = Number(produto.estoque || 0);
        const minimo = Number(produto.estoque_minimo || 0);

        let situacao = `<span class="status-ok">OK</span>`;

        if (estoque <= 0) {
            situacao = `<span class="status-zero">SEM ESTOQUE</span>`;
        } else if (estoque <= minimo) {
            situacao = `<span class="status-baixo">BAIXO</span>`;
        }

        tabela.innerHTML += `
            <tr>
                <td>${produto.codigo_interno || "-"}</td>
                <td>${produto.nome || "-"}</td>
                <td>${produto.categoria || "-"}</td>
                <td>${estoque}</td>
                <td>${minimo}</td>
                <td>${situacao}</td>
                <td>
                    <button onclick="movimentarEstoque(${produto.id}, 'entrada')">Entrada</button>
                    <button onclick="movimentarEstoque(${produto.id}, 'saida')">Saída</button>
                    <button onclick="movimentarEstoque(${produto.id}, 'ajuste')">Ajustar</button>
                </td>
            </tr>
        `;
    });
}

async function movimentarEstoque(id, tipo) {
    let texto = "Informe a quantidade";

    if (tipo === "entrada") texto = "Quantidade de ENTRADA";
    if (tipo === "saida") texto = "Quantidade de SAÍDA";
    if (tipo === "ajuste") texto = "Novo estoque total";

    const quantidade = prompt(texto);

    if (quantidade === null || quantidade === "") return;

    const resposta = await fetch(`/api/produtos/${id}/estoque`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tipo,
            quantidade: Number(quantidade)
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao alterar estoque");
        return;
    }

    carregarEstoque();
}

function filtrarEstoque() {
    const termo = document.getElementById("pesquisaEstoque").value.toLowerCase();

    const filtrados = produtosEstoque.filter((produto) => {
        return (
            String(produto.codigo_interno || "").toLowerCase().includes(termo) ||
            String(produto.codigo_barras || "").toLowerCase().includes(termo) ||
            String(produto.nome || "").toLowerCase().includes(termo) ||
            String(produto.categoria || "").toLowerCase().includes(termo)
        );
    });

    atualizarTabelaEstoque(filtrados);
}