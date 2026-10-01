const express = require("express");
const db = require("../db");
const { dataValida } = require("../validators");
const router = express.Router();

const BASE = `SELECT sales.*, products.name AS product_name, products.unit
              FROM sales JOIN products ON products.id = sales.product_id`;

function validar({ product_id, quantity, unit_price, date }) {
  if (!product_id) return "O produto é obrigatório";
  if (!(Number(quantity) > 0)) return "A quantidade vendida deve ser maior que zero";
  if (!(Number(unit_price) > 0)) return "O valor unitário deve ser maior que zero";
  if (!dataValida(date)) return "Data inválida (use o formato AAAA-MM-DD)";
  return null;
}

// O total é SEMPRE calculado aqui no back-end
function calcularTotal(quantity, unit_price) {
  return Math.round(Number(quantity) * Number(unit_price) * 100) / 100;
}

// Aceita ?product_id=1 para filtrar vendas por produto
router.get("/", (req, res) => {
  if (req.query.product_id) {
    return res.json(
      db.prepare(BASE + " WHERE sales.product_id = ? ORDER BY sales.date DESC").all(req.query.product_id)
    );
  }
  res.json(db.prepare(BASE + " ORDER BY sales.date DESC").all());
});

router.get("/:id", (req, res) => {
  const item = db.prepare(BASE + " WHERE sales.id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Venda não encontrada" });
  res.json(item);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { product_id, quantity, unit_price, date, customer } = req.body;

  const produto = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);
  if (!produto) return res.status(400).json({ error: "O produto informado não existe" });

  const total = calcularTotal(quantity, unit_price);
  // A propriedade da venda vem do próprio produto
  const r = db
    .prepare(
      "INSERT INTO sales (product_id, quantity, unit_price, total, date, customer, property_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(product_id, Number(quantity), Number(unit_price), total, date, customer || null, produto.property_id);
  res.status(201).json(db.prepare(BASE + " WHERE sales.id = ?").get(r.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM sales WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Venda não encontrada" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { product_id, quantity, unit_price, date, customer } = req.body;

  const produto = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);
  if (!produto) return res.status(400).json({ error: "O produto informado não existe" });

  const total = calcularTotal(quantity, unit_price);
  db.prepare(
    "UPDATE sales SET product_id = ?, quantity = ?, unit_price = ?, total = ?, date = ?, customer = ?, property_id = ? WHERE id = ?"
  ).run(product_id, Number(quantity), Number(unit_price), total, date, customer || null, produto.property_id, req.params.id);
  res.json(db.prepare(BASE + " WHERE sales.id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM sales WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Venda não encontrada" });
  db.prepare("DELETE FROM sales WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Venda excluída" });
});

module.exports = router;