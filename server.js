const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

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

app.get("/api/dashboard", async (req, res) => {
  res.json({
    vendasHoje: 0,
    totalHoje: 0,
    produtos: 0,
    estoqueBaixo: 0
  });
});

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