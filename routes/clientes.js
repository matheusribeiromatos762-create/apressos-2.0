const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
    db.all("SELECT * FROM clientes ORDER BY id DESC", [], (erro, linhas) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json(linhas);
    });
});

router.post("/", (req, res) => {
    const {
        nome,
        cpf,
        telefone,
        whatsapp,
        email,
        endereco,
        cidade,
        observacoes,
        limite_fiado
    } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome do cliente é obrigatório" });
    }

    db.run(
        `
        INSERT INTO clientes
        (nome, cpf, telefone, whatsapp, email, endereco, cidade, observacoes, limite_fiado, saldo_devedor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            nome || "",
            cpf || "",
            telefone || "",
            whatsapp || "",
            email || "",
            endereco || "",
            cidade || "",
            observacoes || "",
            Number(limite_fiado || 0),
            0
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
        cpf,
        telefone,
        whatsapp,
        email,
        endereco,
        cidade,
        observacoes,
        limite_fiado,
        saldo_devedor
    } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: "Nome do cliente é obrigatório" });
    }

    db.run(
        `
        UPDATE clientes
        SET nome = ?,
            cpf = ?,
            telefone = ?,
            whatsapp = ?,
            email = ?,
            endereco = ?,
            cidade = ?,
            observacoes = ?,
            limite_fiado = ?,
            saldo_devedor = ?
        WHERE id = ?
        `,
        [
            nome || "",
            cpf || "",
            telefone || "",
            whatsapp || "",
            email || "",
            endereco || "",
            cidade || "",
            observacoes || "",
            Number(limite_fiado || 0),
            Number(saldo_devedor || 0),
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
    db.run("DELETE FROM clientes WHERE id = ?", [req.params.id], function (erro) {
        if (erro) {
            return res.status(500).json({ erro: erro.message });
        }

        res.json({ sucesso: true });
    });
});

module.exports = router;