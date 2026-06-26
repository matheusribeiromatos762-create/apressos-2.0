const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./apressos.db", (err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Banco SQLite conectado.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_interno TEXT,
            codigo_barras TEXT,
            nome TEXT,
            categoria TEXT,
            marca TEXT,
            custo REAL,
            preco REAL,
            estoque INTEGER,
            estoque_minimo INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total REAL,
            valor_recebido REAL,
            troco REAL,
            forma_pagamento TEXT DEFAULT 'DINHEIRO',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS venda_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venda_id INTEGER,
            produto_id INTEGER,
            codigo TEXT,
            nome TEXT,
            quantidade INTEGER,
            preco REAL,
            total REAL
        )
    `);

    db.run(`
        ALTER TABLE vendas ADD COLUMN forma_pagamento TEXT DEFAULT 'DINHEIRO'
    `, () => {});
});

module.exports = db;