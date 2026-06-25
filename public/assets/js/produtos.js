let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function gerarCodigoInterno() {
    return String(produtos.length + 1).padStart(6, "0");
}

function salvarProduto() {
    const produto = {
        codigo: gerarCodigoInterno(),
        codigoBarras: document.getElementById("codigo").value,
        nome: document.getElementById("nome").value,
        categoria: document.getElementById("categoria").value,
        marca: document.getElementById("marca").value,
        custo: document.getElementById("custo").value,
        preco: document.getElementById("preco").value,
        estoque: document.getElementById("estoque").value,
        estoqueMinimo: document.getElementById("estoqueMinimo").value
    };

    produtos.push(produto);
    localStorage.setItem("produtos", JSON.stringify(produtos));

    atualizarTabela();
    limparFormulario();
}

function atualizarTabela() {
    const tabela = document.getElementById("listaProdutos");
    tabela.innerHTML = "";

    produtos.forEach((produto, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${produto.codigo}</td>
                <td>${produto.nome}</td>
                <td>${produto.categoria}</td>
                <td>R$ ${produto.preco}</td>
                <td>${produto.estoque}</td>
                <td>
                    <button onclick="editarProduto(${index})">Editar</button>
                    <button onclick="excluirProduto(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("codigo").value = "";
    document.getElementById("categoria").value = "Selecione";
    document.getElementById("marca").value = "";
    document.getElementById("custo").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("estoque").value = "";
    document.getElementById("estoqueMinimo").value = "";
}

function excluirProduto(index) {
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarTabela();
}

function editarProduto(index) {
    alert("Edição será feita no próximo passo.");
}

atualizarTabela();