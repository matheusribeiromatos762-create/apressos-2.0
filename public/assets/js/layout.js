function carregarLayout(paginaAtual) {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    sidebar.innerHTML = `
        <div class="logo">🛒 APRESSOS</div>

        <a class="${paginaAtual === "dashboard" ? "ativo" : ""}" href="dashboard.html">🏠 Dashboard</a>
        <a class="${paginaAtual === "caixa" ? "ativo" : ""}" href="caixa.html">🧾 Caixa</a>
        <a class="${paginaAtual === "produtos" ? "ativo" : ""}" href="produtos.html">📦 Produtos</a>
        <a class="${paginaAtual === "categorias" ? "ativo" : ""}" href="categorias.html">🏷️ Categorias</a>
        <a class="${paginaAtual === "estoque" ? "ativo" : ""}" href="estoque.html">📊 Estoque</a>
        <a class="${paginaAtual === "clientes" ? "ativo" : ""}" href="clientes.html">👥 Clientes</a>
        <a class="${paginaAtual === "fornecedores" ? "ativo" : ""}" href="fornecedores.html">🚚 Fornecedores</a>
        <a class="${paginaAtual === "relatorios" ? "ativo" : ""}" href="relatorios.html">📄 Relatórios</a>
        <a href="#">👤 Usuários</a>
        <a href="#">⚙️ Configurações</a>

        <button class="btn-sair" onclick="sair()">Sair</button>
    `;
}