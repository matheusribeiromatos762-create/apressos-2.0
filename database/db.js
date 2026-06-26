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

});

module.exports = db;