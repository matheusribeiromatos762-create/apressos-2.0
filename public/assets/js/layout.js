function carregarLayout(paginaAtual) {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    sidebar.innerHTML = `
        <div class="logo">🛒 APRESSOS</div>

        <a class="${paginaAtual === "dashboard" ? "ativo" : ""}" href="dashboard.html">🏠 Dashboard</a>
        <a class="${paginaAtual === "caixa" ? "ativo" : ""}" href="#">🧾 Caixa</a>
        <a class="${paginaAtual === "produtos" ? "ativo" : ""}" href="produtos.html">📦 Produtos</a>
        <a class="${paginaAtual === "categorias" ? "ativo" : ""}" href="categorias.html">🏷️ Categorias</a>
        <a class="${paginaAtual === "estoque" ? "ativo" : ""}" href="#">📊 Estoque</a>
        <a class="${paginaAtual === "clientes" ? "ativo" : ""}" href="#">👥 Clientes</a>
        <a class="${paginaAtual === "fornecedores" ? "ativo" : ""}" href="#">🚚 Fornecedores</a>
        <a class="${paginaAtual === "relatorios" ? "ativo" : ""}" href="#">📄 Relatórios</a>
        <a class="${paginaAtual === "usuarios" ? "ativo" : ""}" href="#">👤 Usuários</a>
        <a class="${paginaAtual === "configuracoes" ? "ativo" : ""}" href="#">⚙️ Configurações</a>

        <button class="btn-sair" onclick="sair()">Sair</button>
    `;
}