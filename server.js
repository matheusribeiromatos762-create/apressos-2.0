const express = require("express");
const cors = require("cors");
const path = require("path");

const dashboardRoutes = require("./routes/dashboard");
const produtosRoutes = require("./routes/produtos");
const categoriasRoutes = require("./routes/categorias");
const vendasRoutes = require("./routes/vendas");
const clientesRoutes = require("./routes/clientes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/api/login", (req, res) => {
    const { usuario, senha } = req.body;

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

    res.status(401).json({ erro: "Usuário ou senha inválidos" });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/vendas", vendasRoutes);
app.use("/api/clientes", clientesRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    console.log("APRESSOS 2.0 ONLINE");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("====================================");
});