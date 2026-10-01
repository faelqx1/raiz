const express = require("express");
const db = require("../db");
const { dataValida } = require("../validators");
const router = express.Router();

// Monta o WHERE de período para uma coluna de data
function filtroPeriodo(coluna, start, end) {
  const condicoes = [];
  const params = [];
  if (start) {
    condicoes.push(`${coluna} >= ?`);
    params.push(start);
  }
  if (end) {
    condicoes.push(`${coluna} <= ?`);
    params.push(end);
  }
  return { where: condicoes.length ? "WHERE " + condicoes.join(" AND ") : "", params };
}

router.get("/", (req, res) => {
  const { start_date, end_date } = req.query;

  if (start_date && !dataValida(start_date))
    return res.status(400).json({ error: "start_date inválida (use AAAA-MM-DD)" });
  if (end_date && !dataValida(end_date))
    return res.status(400).json({ error: "end_date inválida (use AAAA-MM-DD)" });
  if (start_date && end_date && start_date > end_date)
    return res.status(400).json({ error: "A data inicial não pode ser maior que a final" });

  const vendas = filtroPeriodo("date", start_date, end_date);
  const vendasS = filtroPeriodo("s.date", start_date, end_date);
  const despesas = filtroPeriodo("date", start_date, end_date);
  const producao = filtroPeriodo("date", start_date, end_date);

  const revenue = db.prepare(`SELECT COALESCE(SUM(total), 0) AS v FROM sales ${vendas.where}`).get(...vendas.params).v;
  const expenses = db.prepare(`SELECT COALESCE(SUM(value), 0) AS v FROM expenses ${despesas.where}`).get(...despesas.params).v;
  const production_quantity = db
    .prepare(`SELECT COALESCE(SUM(quantity), 0) AS v FROM production ${producao.where}`)
    .get(...producao.params).v;

  const top_products = db
    .prepare(
      `SELECT p.name, p.unit, SUM(s.quantity) AS total_quantity, SUM(s.total) AS total_revenue
       FROM sales s JOIN products p ON p.id = s.product_id
       ${vendasS.where}
       GROUP BY p.id
       ORDER BY total_quantity DESC
       LIMIT 5`
    )
    .all(...vendasS.params);

  const expenses_by_category = db
    .prepare(
      `SELECT category, SUM(value) AS total
       FROM expenses ${despesas.where}
       GROUP BY category
       ORDER BY total DESC`
    )
    .all(...despesas.params);

  res.json({
    revenue,
    expenses,
    result: revenue - expenses,
    production_quantity,
    top_product: top_products.length ? top_products[0].name : null,
    top_products,
    expenses_by_category,
  });
});

module.exports = router;