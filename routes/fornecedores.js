const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT * FROM fornecedores ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json(linhas);
    });
});

router.post("/", (req, res) => {
    const {
        nome,
        cnpj,
        telefone,
        whatsapp,
        email,
        representante,
        endereco,
        cidade,
        observacoes
    } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome do fornecedor é obrigatório" });
    }

    db.run(
        `
        INSERT INTO fornecedores
        (nome, cnpj, telefone, whatsapp, email, representante, endereco, cidade, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            nome || "",
            cnpj || "",
            telefone || "",
            whatsapp || "",
            email || "",
            representante || "",
            endereco || "",
            cidade || "",
            observacoes || ""
        ],
        function (erro) {
            if (erro) {
                return res.status(500).json({ erro: erro.message });
            }

            res.json({
                sucesso: true,
                id: this.lastID
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        nome,
        cnpj,
        telefone,
        whatsapp,
        email,
        representante,
        endereco,
        cidade,
        observacoes
    } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome do fornecedor é obrigatório" });
    }

    db.run(
        `
        UPDATE fornecedores
        SET nome = ?,
            cnpj = ?,
            telefone = ?,
            whatsapp = ?,
            email = ?,
            representante = ?,
            endereco = ?,
            cidade = ?,
            observacoes = ?
        WHERE id = ?
        `,
        [
            nome || "",
            cnpj || "",
            telefone || "",
            whatsapp || "",
            email || "",
            representante || "",
            endereco || "",
            cidade || "",
            observacoes || "",
            id
        ],
        function (erro) {
            if (erro) {
                return res.status(500).json({ erro: erro.message });
            }

            res.json({ sucesso: true });
        }
    );
});

router.delete("/:id", (req, res) => {
    db.run("DELETE FROM fornecedores WHERE id = ?", [req.params.id], function (erro) {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json({ sucesso: true });
    });
});

module.exports = router;