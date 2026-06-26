const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function iniciarBanco() {
  if (!pool) {
    console.log("Rodando sem banco externo");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      usuario TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cargo TEXT NOT NULL DEFAULT 'ADMIN',
      ativo BOOLEAN DEFAULT true,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    INSERT INTO usuarios (nome, usuario, senha, cargo)
    VALUES ('Matheus', 'admin', '123456', 'ADMIN')
    ON CONFLICT (usuario) DO NOTHING
  `);

  console.log("Banco PostgreSQL conectado");
}

/* PÁGINA INICIAL */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* LOGIN */
app.post("/api/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ erro: "Informe usuário e senha" });
    }

    if (!pool) {
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

      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const resultado = await pool.query(
      `
      SELECT id, nome, usuario, cargo
      FROM usuarios
      WHERE usuario = $1 AND senha = $2 AND ativo = true
      `,
      [usuario, senha]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    res.json({
      sucesso: true,
      usuario: resultado.rows[0]
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

/* DASHBOARD */
app.get("/api/dashboard", (req, res) => {
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

        res.json({
          vendasHoje: 0,
          totalHoje: 0,
          produtos: produtos.total || 0,
          estoqueBaixo: estoqueBaixo.total || 0
        });
      }
    );
  });
});

/* PRODUTOS - LISTAR */
app.get("/api/produtos", (req, res) => {
  db.all("SELECT * FROM produtos ORDER BY id DESC", [], (erro, linhas) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.json(linhas);
  });
});

/* PRODUTOS - CADASTRAR */
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

/* PRODUTOS - EXCLUIR */
app.delete("/api/produtos/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM produtos WHERE id = ?", [id], function (erro) {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.json({ sucesso: true });
  });
});

/* CATEGORIAS - LISTAR */
app.get("/api/categorias", (req, res) => {
  db.all("SELECT * FROM categorias ORDER BY nome ASC", [], (erro, linhas) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.json(linhas);
  });
});

/* CATEGORIAS - CADASTRAR */
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

/* CATEGORIAS - EXCLUIR */
app.delete("/api/categorias/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM categorias WHERE id = ?", [id], function (erro) {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.json({ sucesso: true });
  });
});

/* INICIAR SERVIDOR */
iniciarBanco()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log("====================================");
      console.log("APRESSOS 2.0 ONLINE");
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log("====================================");
    });
  })
  .catch((erro) => {
    console.error("Erro ao iniciar:", erro);
    process.exit(1);
  });