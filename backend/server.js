const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Raiz funcionando!" });
});

app.use("/api/properties", require("./routes/properties"));
app.use("/api/products", require("./routes/products"));
app.use("/api/production", require("./routes/production"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento de erros (JSON malformado e erros inesperados)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});