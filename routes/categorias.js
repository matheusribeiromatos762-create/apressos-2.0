const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT * FROM categorias ORDER BY nome ASC", [], (erro, linhas) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json(linhas);
    });
});

router.post("/", (req, res) => {
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

router.delete("/:id", (req, res) => {
    db.run("DELETE FROM categorias WHERE id = ?", [req.params.id], function (erro) {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json({ sucesso: true });
    });
});

module.exports = router;