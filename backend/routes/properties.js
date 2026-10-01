const express = require("express");
const db = require("../db");
const router = express.Router();

function validar({ name, area }) {
  if (!name || !String(name).trim()) return "O nome da propriedade é obrigatório";
  if (!(Number(area) > 0)) return "A área da propriedade deve ser maior que zero";
  return null;
}

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM properties ORDER BY id").all());
});

router.get("/:id", (req, res) => {
  const item = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Propriedade não encontrada" });
  res.json(item);
});

router.post("/", (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { name, location, area } = req.body;
  const r = db
    .prepare("INSERT INTO properties (name, location, area) VALUES (?, ?, ?)")
    .run(String(name).trim(), location || null, Number(area));
  res.status(201).json(db.prepare("SELECT * FROM properties WHERE id = ?").get(r.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM properties WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Propriedade não encontrada" });
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ error: erro });
  const { name, location, area } = req.body;
  db.prepare("UPDATE properties SET name = ?, location = ?, area = ? WHERE id = ?").run(
    String(name).trim(),
    location || null,
    Number(area),
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const existe = db.prepare("SELECT id FROM properties WHERE id = ?").get(req.params.id);
  if (!existe) return res.status(404).json({ error: "Propriedade não encontrada" });

  const vinculos = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM products WHERE property_id = ?) +
        (SELECT COUNT(*) FROM expenses WHERE property_id = ?) +
        (SELECT COUNT(*) FROM sales WHERE property_id = ?) AS total`
    )
    .get(req.params.id, req.params.id, req.params.id).total;
  if (vinculos > 0)
    return res
      .status(409)
      .json({ error: "Não é possível excluir: a propriedade possui registros vinculados" });

  db.prepare("DELETE FROM properties WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Propriedade excluída" });
});

module.exports = router;