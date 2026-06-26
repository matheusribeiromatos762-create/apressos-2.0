document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();

    const botao = document.getElementById("btnSalvarCategoria");

    if (botao) {
        botao.addEventListener("click", salvarCategoria);
    }
});

async function carregarCategorias() {
    const resposta = await fetch("/api/categorias");
    const categorias = await resposta.json();

    const tabela = document.getElementById("listaCategorias");
    tabela.innerHTML = "";

    categorias.forEach((categoria) => {
        tabela.innerHTML += `
            <tr>
                <td>${categoria.id}</td>
                <td>${categoria.nome}</td>
                <td>
                    <button onclick="excluirCategoria(${categoria.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

async function salvarCategoria() {
    const nome = document.getElementById("nomeCategoria").value.trim();

    if (!nome) {
        alert("Digite o nome da categoria");
        return;
    }

    const resposta = await fetch("/api/categorias", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao salvar categoria");
        return;
    }

    document.getElementById("nomeCategoria").value = "";
    carregarCategorias();
}

async function excluirCategoria(id) {
    if (!confirm("Deseja excluir esta categoria?")) return;

    await fetch("/api/categorias/" + id, {
        method: "DELETE"
    });

    carregarCategorias();
}