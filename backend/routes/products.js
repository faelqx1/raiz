const express = require("express");
const db = require("../db");
const router = express.Router();

const BASE = `SELECT products.*, properties.name AS property_name
              FROM products JOIN properties ON properties.id = products.property_id`;

function validar({ name, unit, property_id }) {
  if (!name || !String(name).trim()) return "O nome do produto é obrigatório";
  if (!unit || !String(unit).trim()) return "A unidade de medida é obrigatória";
  if (!property_id) return "A propriedade é obrigatória";
  const prop = db.prepare("SELECT id FROM properties WHERE id = ?").get(property_id);
  if (!prop) return "A propriedade informada não existe";
  return null;
}

router.get("/", (req, res) => {
  res.json(db.prepare(BASE + " ORDER BY products.id").all());
});

router.get("/:id", (req, res) => {
  const item = db.prepare(BASE + " WHERE products.id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Produto não encontrado" });
  res.json(item);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { name, unit, property_id } = req.body;
  const r = db
    .prepare("INSERT INTO products (name, unit, property_id) VALUES (?, ?, ?)")
    .run(String(name).trim(), String(unit).trim(), property_id);
  res.status(201).json(db.prepare(BASE + " WHERE products.id = ?").get(r.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Produto não encontrado" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { name, unit, property_id } = req.body;
  db.prepare("UPDATE products SET name = ?, unit = ?, property_id = ? WHERE id = ?").run(
    String(name).trim(),
    String(unit).trim(),
    property_id,
    req.params.id
  );
  res.json(db.prepare(BASE + " WHERE products.id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM products WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Produto não encontrado" });

  const vendas = db.prepare("SELECT COUNT(*) AS n FROM sales WHERE product_id = ?").get(req.params.id).n;
  if (vendas > 0)
    return res.status(409).json({ error: "Não é possível excluir: o produto possui vendas registradas" });

  const producao = db.prepare("SELECT COUNT(*) AS n FROM production WHERE product_id = ?").get(req.params.id).n;
  if (producao > 0)
    return res.status(409).json({ error: "Não é possível excluir: o produto possui produção registrada" });

  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Produto excluído" });
});

module.exports = router;