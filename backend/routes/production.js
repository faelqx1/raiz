const express = require("express");
const db = require("../db");
const { dataValida } = require("../validators");
const router = express.Router();

const BASE = `SELECT production.*, products.name AS product_name, products.unit
              FROM production JOIN products ON products.id = production.product_id`;

function validar({ product_id, date, quantity }) {
  if (!product_id) return "O produto é obrigatório";
  if (!db.prepare("SELECT id FROM products WHERE id = ?").get(product_id))
    return "O produto informado não existe";
  if (!dataValida(date)) return "Data inválida (use o formato AAAA-MM-DD)";
  if (!(Number(quantity) > 0)) return "A quantidade produzida deve ser maior que zero";
  return null;
}

// Aceita ?product_id=1 para consultar o histórico de um produto
router.get("/", (req, res) => {
  if (req.query.product_id) {
    return res.json(
      db
        .prepare(BASE + " WHERE production.product_id = ? ORDER BY production.date DESC")
        .all(req.query.product_id)
    );
  }
  res.json(db.prepare(BASE + " ORDER BY production.date DESC").all());
});

router.get("/:id", (req, res) => {
  const item = db.prepare(BASE + " WHERE production.id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Registro de produção não encontrado" });
  res.json(item);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { product_id, date, quantity, notes } = req.body;
  const r = db
    .prepare("INSERT INTO production (product_id, date, quantity, notes) VALUES (?, ?, ?, ?)")
    .run(product_id, date, Number(quantity), notes || null);
  res.status(201).json(db.prepare(BASE + " WHERE production.id = ?").get(r.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM production WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Registro de produção não encontrado" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { product_id, date, quantity, notes } = req.body;
  db.prepare("UPDATE production SET product_id = ?, date = ?, quantity = ?, notes = ? WHERE id = ?").run(
    product_id,
    date,
    Number(quantity),
    notes || null,
    req.params.id
  );
  res.json(db.prepare(BASE + " WHERE production.id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM production WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Registro de produção não encontrado" });
  db.prepare("DELETE FROM production WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Registro de produção excluído" });
});

module.exports = router;