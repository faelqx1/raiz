const express = require("express");
const db = require("../db");
const { dataValida } = require("../validators");
const router = express.Router();

const BASE = `SELECT expenses.*, properties.name AS property_name
              FROM expenses JOIN properties ON properties.id = expenses.property_id`;

function validar({ description, category, value, date, property_id }) {
  if (!description || !String(description).trim()) return "A descrição é obrigatória";
  if (!category || !String(category).trim()) return "A categoria é obrigatória";
  if (!(Number(value) > 0)) return "O valor da despesa deve ser maior que zero";
  if (!dataValida(date)) return "Data inválida (use o formato AAAA-MM-DD)";
  if (!property_id) return "A propriedade é obrigatória";
  if (!db.prepare("SELECT id FROM properties WHERE id = ?").get(property_id))
    return "A propriedade informada não existe";
  return null;
}

// Aceita ?category=Insumos para filtrar por categoria
router.get("/", (req, res) => {
  if (req.query.category) {
    return res.json(
      db.prepare(BASE + " WHERE expenses.category = ? ORDER BY expenses.date DESC").all(req.query.category)
    );
  }
  res.json(db.prepare(BASE + " ORDER BY expenses.date DESC").all());
});

router.get("/:id", (req, res) => {
  const item = db.prepare(BASE + " WHERE expenses.id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Despesa não encontrada" });
  res.json(item);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { description, category, value, date, property_id } = req.body;
  const r = db
    .prepare("INSERT INTO expenses (description, category, value, date, property_id) VALUES (?, ?, ?, ?, ?)")
    .run(String(description).trim(), String(category).trim(), Number(value), date, property_id);
  res.status(201).json(db.prepare(BASE + " WHERE expenses.id = ?").get(r.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM expenses WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Despesa não encontrada" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { description, category, value, date, property_id } = req.body;
  db.prepare(
    "UPDATE expenses SET description = ?, category = ?, value = ?, date = ?, property_id = ? WHERE id = ?"
  ).run(String(description).trim(), String(category).trim(), Number(value), date, property_id, req.params.id);
  res.json(db.prepare(BASE + " WHERE expenses.id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM expenses WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Despesa não encontrada" });
  db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Despesa excluída" });
});

module.exports = router;