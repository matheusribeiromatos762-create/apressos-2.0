let fornecedores = [];

document.addEventListener("DOMContentLoaded", carregarFornecedores);

async function carregarFornecedores() {
    const resposta = await fetch("/api/fornecedores");
    fornecedores = await resposta.json();

    atualizarTabelaFornecedores(fornecedores);
}

async function salvarFornecedor() {
    const id = document.getElementById("fornecedorId").value;

    const fornecedor = {
        nome: document.getElementById("nome").value.trim(),
        cnpj: document.getElementById("cnpj").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        whatsapp: document.getElementById("whatsapp").value.trim(),
        email: document.getElementById("email").value.trim(),
        representante: document.getElementById("representante").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        observacoes: document.getElementById("observacoes").value.trim()
    };

    if (!fornecedor.nome) {
        alert("Digite o nome do fornecedor");
        return;
    }

    let url = "/api/fornecedores";
    let metodo = "POST";

    if (id) {
        url = "/api/fornecedores/" + id;
        metodo = "PUT";
    }

    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fornecedor)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao salvar fornecedor");
        return;
    }

    limparFormulario();
    carregarFornecedores();
}

function atualizarTabelaFornecedores(lista) {
    const tabela = document.getElementById("listaFornecedores");
    tabela.innerHTML = "";

    lista.forEach((fornecedor) => {
        tabela.innerHTML += `
            <tr>
                <td>${fornecedor.nome || "-"}</td>
                <td>${fornecedor.cnpj || "-"}</td>
                <td>${fornecedor.telefone || "-"}</td>
                <td>${fornecedor.whatsapp || "-"}</td>
                <td>${fornecedor.representante || "-"}</td>
                <td>${fornecedor.cidade || "-"}</td>
                <td>
                    <button class="btn-editar" onclick="editarFornecedor(${fornecedor.id})">Editar</button>
                    <button class="btn-excluir" onclick="excluirFornecedor(${fornecedor.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function editarFornecedor(id) {
    const fornecedor = fornecedores.find((item) => item.id === id);

    if (!fornecedor) return;

    document.getElementById("fornecedorId").value = fornecedor.id;
    document.getElementById("nome").value = fornecedor.nome || "";
    document.getElementById("cnpj").value = fornecedor.cnpj || "";
    document.getElementById("telefone").value = fornecedor.telefone || "";
    document.getElementById("whatsapp").value = fornecedor.whatsapp || "";
    document.getElementById("email").value = fornecedor.email || "";
    document.getElementById("representante").value = fornecedor.representante || "";
    document.getElementById("endereco").value = fornecedor.endereco || "";
    document.getElementById("cidade").value = fornecedor.cidade || "";
    document.getElementById("observacoes").value = fornecedor.observacoes || "";

    document.getElementById("tituloFormulario").innerText = "Editar Fornecedor";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirFornecedor(id) {
    if (!confirm("Deseja excluir este fornecedor?")) return;

    await fetch("/api/fornecedores/" + id, {
        method: "DELETE"
    });

    carregarFornecedores();
}

function filtrarFornecedores() {
    const termo = document.getElementById("pesquisaFornecedor").value.toLowerCase();

    const filtrados = fornecedores.filter((fornecedor) => {
        return (
            String(fornecedor.nome || "").toLowerCase().includes(termo) ||
            String(fornecedor.cnpj || "").toLowerCase().includes(termo) ||
            String(fornecedor.telefone || "").toLowerCase().includes(termo) ||
            String(fornecedor.whatsapp || "").toLowerCase().includes(termo) ||
            String(fornecedor.representante || "").toLowerCase().includes(termo) ||
            String(fornecedor.cidade || "").toLowerCase().includes(termo)
        );
    });

    atualizarTabelaFornecedores(filtrados);
}

function limparFormulario() {
    document.getElementById("fornecedorId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("cnpj").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("whatsapp").value = "";
    document.getElementById("email").value = "";
    document.getElementById("representante").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("observacoes").value = "";

    document.getElementById("tituloFormulario").innerText = "Novo Fornecedor";
}