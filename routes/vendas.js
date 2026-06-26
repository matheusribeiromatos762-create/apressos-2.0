const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.post("/", (req, res) => {
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
            if (erro) {
                return res.status(500).json({ erro: erro.message });
            }

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

router.get("/", (req, res) => {
    db.all("SELECT * FROM vendas ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json(linhas);
    });
});

router.get("/:id/itens", (req, res) => {
    db.all(
        "SELECT * FROM venda_itens WHERE venda_id = ? ORDER BY id ASC",
        [req.params.id],
        (erro, linhas) => {
            if (erro) {
                return res.status(500).json({ erro: erro.message });
            }

            res.json(linhas);
        }
    );
});

module.exports = router;