const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.get("SELECT COUNT(*) AS total FROM produtos", [], (erro, produtos) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        db.get(
            "SELECT COUNT(*) AS total FROM produtos WHERE estoque <= estoque_minimo",
            [],
            (erro2, estoqueBaixo) => {
                if (erro2) {
                    return res.status(500).json({ erro: erro2.message });
                }

                db.get(
                    "SELECT COUNT(*) AS totalVendas, COALESCE(SUM(total), 0) AS totalHoje FROM vendas WHERE DATE(criado_em) = DATE('now')",
                    [],
                    (erro3, vendas) => {
                        if (erro3) {
                            return res.status(500).json({ erro: erro3.message });
                        }

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

module.exports = router;