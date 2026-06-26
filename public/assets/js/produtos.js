let produtos = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarProdutos();
});

async function carregarCategorias() {
    const select = document.getElementById("categoria");

    if (!select) return;

    select.innerHTML = "<option value=''>Selecione</option>";

    try {
        const resposta = await fetch("/api/categorias");
        const categorias = await resposta.json();

        categorias.forEach((categoria) => {
            select.innerHTML += `
                <option value="${categoria.nome}">
                    ${categoria.nome}
                </option>
            `;
        });
    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
    }
}

async function carregarProdutos() {
    const resposta = await fetch("/api/produtos");
    produtos = await resposta.json();

    atualizarTabela(produtos);
}

async function salvarProduto() {
    const produto = {
        codigo_barras: document.getElementById("codigo").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value,
        marca: document.getElementById("marca").value.trim(),
        custo: document.getElementById("custo").value,
        preco: document.getElementById("preco").value,
        estoque: document.getElementById("estoque").value,
        estoque_minimo: document.getElementById("estoqueMinimo").value
    };

    if (!produto.nome) {
        alert("Digite o nome do produto");
        return;
    }

    if (!produto.preco) {
        alert("Digite o preço de venda");
        return;
    }

    const resposta = await fetch("/api/produtos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(produto)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao salvar produto");
        return;
    }

    limparFormulario();
    carregarProdutos();
}

function atualizarTabela(lista) {
    const tabela = document.getElementById("listaProdutos");

    tabela.innerHTML = "";

    lista.forEach((produto) => {
        tabela.innerHTML += `
            <tr>
                <td>${produto.codigo_interno || "-"}</td>
                <td>${produto.nome || "-"}</td>
                <td>${produto.categoria || "-"}</td>
                <td>R$ ${Number(produto.preco || 0).toFixed(2)}</td>
                <td>${produto.estoque || 0}</td>
                <td>
                    <button onclick="editarProduto(${produto.id})">Editar</button>
                    <button onclick="excluirProduto(${produto.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function filtrarProdutos() {
    const termo = document.getElementById("pesquisaProduto").value.toLowerCase();

    const filtrados = produtos.filter((produto) => {
        return (
            String(produto.codigo_interno || "").toLowerCase().includes(termo) ||
            String(produto.codigo_barras || "").toLowerCase().includes(termo) ||
            String(produto.nome || "").toLowerCase().includes(termo) ||
            String(produto.categoria || "").toLowerCase().includes(termo)
        );
    });

    atualizarTabela(filtrados);
}

function limparFormulario() {
    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("custo").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("estoque").value = "";
    document.getElementById("estoqueMinimo").value = "";
}

async function excluirProduto(id) {
    if (!confirm("Deseja excluir este produto?")) return;

    await fetch("/api/produtos/" + id, {
        method: "DELETE"
    });

    carregarProdutos();
}

function editarProduto(id) {
    alert("Edição será criada no próximo passo.");
}