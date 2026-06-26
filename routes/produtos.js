const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT * FROM produtos ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json(linhas);
    });
});

router.post("/", (req, res) => {
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
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

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
                if (erro) {
                    return res.status(500).json({ erro: erro.message });
                }

                res.json({
                    sucesso: true,
                    id: this.lastID,
                    codigo_interno: proximoCodigo
                });
            }
        );
    });
});

router.delete("/:id", (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function (erro) {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json({ sucesso: true });
    });
});

router.put("/:id/estoque", (req, res) => {
    const { id } = req.params;
    const { tipo, quantidade } = req.body;

    const qtd = Number(quantidade);

    if (!tipo || isNaN(qtd)) {
        return res.status(400).json({ erro: "Informe tipo e quantidade" });
    }

    db.get("SELECT * FROM produtos WHERE id = ?", [id], (erro, produto) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

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
                if (erro2) {
                    return res.status(500).json({ erro: erro2.message });
                }

                res.json({
                    sucesso: true,
                    estoque: novoEstoque
                });
            }
        );
    });
});

module.exports = router;