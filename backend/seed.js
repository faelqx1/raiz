const db = require("./db");

// Limpa tudo pra poder rodar o seed mais de uma vez
db.exec(`
  DELETE FROM sales;
  DELETE FROM expenses;
  DELETE FROM production;
  DELETE FROM products;
  DELETE FROM properties;
  DELETE FROM sqlite_sequence;
`);

const insertProperty = db.prepare(
  "INSERT INTO properties (name, location, area) VALUES (?, ?, ?)"
);
const insertProduct = db.prepare(
  "INSERT INTO products (name, unit, property_id) VALUES (?, ?, ?)"
);
const insertProduction = db.prepare(
  "INSERT INTO production (product_id, date, quantity, notes) VALUES (?, ?, ?, ?)"
);
const insertExpense = db.prepare(
  "INSERT INTO expenses (description, category, value, date, property_id) VALUES (?, ?, ?, ?, ?)"
);
const insertSale = db.prepare(
  "INSERT INTO sales (product_id, quantity, unit_price, total, date, customer, property_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

const seed = db.transaction(() => {
  // Propriedades
  const sitio = insertProperty.run("Sítio Boa Vista", "Zona rural", 12.5).lastInsertRowid;
  const fazenda = insertProperty.run("Fazenda Santa Luzia", "Zona rural", 40).lastInsertRowid;

  // Produtos
  const leite = insertProduct.run("Leite", "litros", sitio).lastInsertRowid;
  const mandioca = insertProduct.run("Mandioca", "kg", sitio).lastInsertRowid;
  const milho = insertProduct.run("Milho", "sacas", fazenda).lastInsertRowid;

  // Produção
  insertProduction.run(leite, "2026-08-10", 180, "Ordenha da manhã");
  insertProduction.run(leite, "2026-08-24", 210, null);
  insertProduction.run(mandioca, "2026-09-05", 800, "Colheita do lote 1");
  insertProduction.run(milho, "2026-09-15", 120, "Safra boa");

  // Despesas
  insertExpense.run("Ração", "Insumos", 950.0, "2026-08-12", sitio);
  insertExpense.run("Adubo", "Insumos", 1800.0, "2026-08-20", fazenda);
  insertExpense.run("Diesel do trator", "Combustível", 620.5, "2026-09-02", fazenda);
  insertExpense.run("Mão de obra", "Pessoal", 1500.0, "2026-09-10", sitio);

  // Vendas (total = quantidade x preço unitário)
  insertSale.run(leite, 150, 2.8, 150 * 2.8, "2026-08-15", "Laticínio Central", sitio);
  insertSale.run(mandioca, 600, 1.5, 600 * 1.5, "2026-09-08", "Feira do Produtor", sitio);
  insertSale.run(milho, 100, 75, 100 * 75, "2026-09-18", "Cooperativa Local", fazenda);
});

seed();
console.log("Dados de exemplo inseridos!");