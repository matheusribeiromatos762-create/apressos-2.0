const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/api/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "123456") {
        return res.json({
            sucesso: true,
            usuario: {
                nome: "Matheus",
                usuario: "admin",
                cargo: "ADMIN"
            }
        });
    }

    res.status(401).json({ erro: "Usuário ou senha inválidos" });
});

app.get("/api/dashboard", (req, res) => {
    db.get("SELECT COUNT(*) AS total FROM produtos", [], (erro, produtos) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        db.get(
            "SELECT COUNT(*) AS total FROM produtos WHERE estoque <= estoque_minimo",
            [],
            (erro2, estoqueBaixo) => {
                if (erro2) return res.status(500).json({ erro: erro2.message });

                db.get(
                    "SELECT COUNT(*) AS totalVendas, COALESCE(SUM(total), 0) AS totalHoje FROM vendas WHERE DATE(criado_em) = DATE('now')",
                    [],
                    (erro3, vendas) => {
                        if (erro3) return res.status(500).json({ erro: erro3.message });

                        res.json({
                            vendasHoje: vendas.totalVendas || 0,
                            totalHoje: vendas.totalHoje || 0,
                            produtos: produtos.total || 0,
                            estoqueBaixo: estoqueBaixo.total || 0
                        });
                    }
                );
            }
        );
    });
});

/* PRODUTOS */
app.get("/api/produtos", (req, res) => {
    db.all("SELECT * FROM produtos ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(linhas);
    });
});

app.post("/api/produtos", (req, res) => {
    const {
        codigo_barras,
        nome,
        categoria,
        marca,
        custo,
        preco,
        estoque,
        estoque_minimo
    } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome do produto é obrigatório" });
    }

    db.get("SELECT COUNT(*) AS total FROM produtos", [], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        const proximoCodigo = String(resultado.total + 1).padStart(6, "0");

        db.run(
            `
            INSERT INTO produtos
            (codigo_interno, codigo_barras, nome, categoria, marca, custo, preco, estoque, estoque_minimo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                proximoCodigo,
                codigo_barras || "",
                nome || "",
                categoria || "",
                marca || "",
                Number(custo || 0),
                Number(preco || 0),
                Number(estoque || 0),
                Number(estoque_minimo || 0)
            ],
            function (erro) {
                if (erro) return res.status(500).json({ erro: erro.message });

                res.json({
                    sucesso: true,
                    id: this.lastID,
                    codigo_interno: proximoCodigo
                });
            }
        );
    });
});

app.delete("/api/produtos/:id", (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function (erro) {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({ sucesso: true });
    });
});

app.put("/api/produtos/:id/estoque", (req, res) => {
    const { id } = req.params;
    const { tipo, quantidade } = req.body;

    const qtd = Number(quantidade);

    if (!tipo || isNaN(qtd)) {
        return res.status(400).json({ erro: "Informe tipo e quantidade" });
    }

    db.get("SELECT * FROM produtos WHERE id = ?", [id], (erro, produto) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        if (!produto) {
            return res.status(404).json({ erro: "Produto não encontrado" });
        }

        let novoEstoque = Number(produto.estoque || 0);

        if (tipo === "entrada") novoEstoque += qtd;
        if (tipo === "saida") novoEstoque -= qtd;
        if (tipo === "ajuste") novoEstoque = qtd;

        if (novoEstoque < 0) novoEstoque = 0;

        db.run(
            "UPDATE produtos SET estoque = ? WHERE id = ?",
            [novoEstoque, id],
            function (erro2) {
                if (erro2) return res.status(500).json({ erro: erro2.message });

                res.json({
                    sucesso: true,
                    estoque: novoEstoque
                });
            }
        );
    });
});

/* CATEGORIAS */
app.get("/api/categorias", (req, res) => {
    db.all("SELECT * FROM categorias ORDER BY nome ASC", [], (erro, linhas) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(linhas);
    });
});

app.post("/api/categorias", (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
    }

    db.run(
        "INSERT INTO categorias (nome) VALUES (?)",
        [nome.toUpperCase()],
        function (erro) {
            if (erro) {
                return res.status(500).json({
                    erro: "Categoria já existe ou erro ao salvar"
                });
            }

            res.json({
                sucesso: true,
                id: this.lastID
            });
        }
    );
});

app.delete("/api/categorias/:id", (req, res) => {
    db.run("DELETE FROM categorias WHERE id = ?", [req.params.id], function (erro) {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({ sucesso: true });
    });
});

/* VENDAS */
app.post("/api/vendas", (req, res) => {
    const { itens, total, valor_recebido, troco, forma_pagamento } = req.body;

    if (!itens || itens.length === 0) {
        return res.status(400).json({ erro: "Nenhum item na venda" });
    }

    db.run(
        "INSERT INTO vendas (total, valor_recebido, troco, forma_pagamento) VALUES (?, ?, ?, ?)",
        [
            Number(total || 0),
            Number(valor_recebido || 0),
            Number(troco || 0),
            forma_pagamento || "DINHEIRO"
        ],
        function (erro) {
            if (erro) return res.status(500).json({ erro: erro.message });

            const vendaId = this.lastID;

            const inserirItem = db.prepare(`
                INSERT INTO venda_itens
                (venda_id, produto_id, codigo, nome, quantidade, preco, total)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const atualizarEstoque = db.prepare(`
                UPDATE produtos
                SET estoque = estoque - ?
                WHERE id = ?
            `);

            itens.forEach((item) => {
                inserirItem.run([
                    vendaId,
                    item.id,
                    item.codigo,
                    item.nome,
                    item.quantidade,
                    item.preco,
                    item.total
                ]);

                atualizarEstoque.run([
                    item.quantidade,
                    item.id
                ]);
            });

            inserirItem.finalize();
            atualizarEstoque.finalize();

            res.json({
                sucesso: true,
                venda_id: vendaId
            });
        }
    );
});

app.get("/api/vendas", (req, res) => {
    db.all("SELECT * FROM vendas ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(linhas);
    });
});

app.get("/api/vendas/:id/itens", (req, res) => {
    db.all(
        "SELECT * FROM venda_itens WHERE venda_id = ? ORDER BY id ASC",
        [req.params.id],
        (erro, linhas) => {
            if (erro) return res.status(500).json({ erro: erro.message });
            res.json(linhas);
        }
    );
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("APRESSOS 2.0 ONLINE");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("====================================");
});