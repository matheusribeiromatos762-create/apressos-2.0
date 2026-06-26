let clientes = [];

document.addEventListener("DOMContentLoaded", carregarClientes);

async function carregarClientes() {
    const resposta = await fetch("/api/clientes");
    clientes = await resposta.json();

    atualizarTabelaClientes(clientes);
}

async function salvarCliente() {
    const id = document.getElementById("clienteId").value;

    const cliente = {
        nome: document.getElementById("nome").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        whatsapp: document.getElementById("whatsapp").value.trim(),
        email: document.getElementById("email").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        observacoes: document.getElementById("observacoes").value.trim(),
        limite_fiado: document.getElementById("limiteFiado").value,
        saldo_devedor: document.getElementById("saldoDevedor").value
    };

    if (!cliente.nome) {
        alert("Digite o nome do cliente");
        return;
    }

    let url = "/api/clientes";
    let metodo = "POST";

    if (id) {
        url = "/api/clientes/" + id;
        metodo = "PUT";
    }

    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cliente)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao salvar cliente");
        return;
    }

    limparFormulario();
    carregarClientes();
}

function atualizarTabelaClientes(lista) {
    const tabela = document.getElementById("listaClientes");
    tabela.innerHTML = "";

    lista.forEach((cliente) => {
        const saldo = Number(cliente.saldo_devedor || 0);

        tabela.innerHTML += `
            <tr>
                <td>${cliente.nome || "-"}</td>
                <td>${cliente.cpf || "-"}</td>
                <td>${cliente.telefone || "-"}</td>
                <td>${cliente.whatsapp || "-"}</td>
                <td>${formatarDinheiroCliente(cliente.limite_fiado)}</td>
                <td class="${saldo > 0 ? "saldo-negativo" : "saldo-ok"}">
                    ${formatarDinheiroCliente(saldo)}
                </td>
                <td>
                    <button class="btn-editar" onclick="editarCliente(${cliente.id})">Editar</button>
                    <button class="btn-excluir" onclick="excluirCliente(${cliente.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function editarCliente(id) {
    const cliente = clientes.find((item) => item.id === id);

    if (!cliente) return;

    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nome").value = cliente.nome || "";
    document.getElementById("cpf").value = cliente.cpf || "";
    document.getElementById("telefone").value = cliente.telefone || "";
    document.getElementById("whatsapp").value = cliente.whatsapp || "";
    document.getElementById("email").value = cliente.email || "";
    document.getElementById("endereco").value = cliente.endereco || "";
    document.getElementById("cidade").value = cliente.cidade || "";
    document.getElementById("observacoes").value = cliente.observacoes || "";
    document.getElementById("limiteFiado").value = cliente.limite_fiado || 0;
    document.getElementById("saldoDevedor").value = cliente.saldo_devedor || 0;

    document.getElementById("tituloFormulario").innerText = "Editar Cliente";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirCliente(id) {
    if (!confirm("Deseja excluir este cliente?")) return;

    await fetch("/api/clientes/" + id, {
        method: "DELETE"
    });

    carregarClientes();
}

function filtrarClientes() {
    const termo = document.getElementById("pesquisaCliente").value.toLowerCase();

    const filtrados = clientes.filter((cliente) => {
        return (
            String(cliente.nome || "").toLowerCase().includes(termo) ||
            String(cliente.cpf || "").toLowerCase().includes(termo) ||
            String(cliente.telefone || "").toLowerCase().includes(termo) ||
            String(cliente.whatsapp || "").toLowerCase().includes(termo)
        );
    });

    atualizarTabelaClientes(filtrados);
}

function limparFormulario() {
    document.getElementById("clienteId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("whatsapp").value = "";
    document.getElementById("email").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("observacoes").value = "";
    document.getElementById("limiteFiado").value = "";
    document.getElementById("saldoDevedor").value = "";

    document.getElementById("tituloFormulario").innerText = "Novo Cliente";
}

function formatarDinheiroCliente(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}