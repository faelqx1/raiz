# 🌱 Raiz - Ferramenta de Gestão para Pequenos Produtores Rurais

Aplicação web full-stack para o pequeno produtor rural registrar produção, controlar receitas e despesas e acompanhar o resultado da propriedade por meio de um dashboard.

Projeto da disciplina **Desenvolvimento de Sistemas Web** (Técnico em Desenvolvimento Web).

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | Next.js, JavaScript, Bootstrap, HTML, CSS |
| Back-end | Node.js, Express |
| Banco de dados | SQLite (better-sqlite3) |
| Comunicação | API REST (JSON) |

```
Next.js + Bootstrap  →  API REST  →  Node.js + Express  →  SQLite
```

## Como instalar e executar

Pré-requisitos: [Node.js](https://nodejs.org) 18.18 ou superior e Git.

### 1. Clonar o repositório

```bash
git clone https://github.com/faelqx1/raiz.git
cd raiz
```

### 2. Back-end (porta 3001)

```bash
cd backend
npm install
npm run seed
npm start
```

- `npm run seed` recria as tabelas com dados de exemplo (opcional; o `raiz.db` já acompanha o projeto).
- A API fica em `http://localhost:3001`.

### 3. Front-end (porta 3000)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`. O back-end precisa estar ligado.

## Estrutura do projeto

```
raiz/
├── backend/
│   ├── routes/          # uma rota por módulo (properties, products, ...)
│   ├── db.js            # criação do banco e das tabelas
│   ├── seed.js          # script de população com dados de exemplo
│   ├── validators.js    # validações compartilhadas
│   ├── server.js        # servidor Express
│   └── raiz.db          # banco SQLite
└── frontend/
    ├── app/             # páginas (dashboard, properties, products, production, expenses, sales)
    ├── components/      # Navbar, CrudPage (CRUD reutilizável), BootstrapClient
    └── lib/api.js       # camada de acesso à API
```

## Banco de dados

```
properties (id, name, location, area)
products   (id, name, unit, property_id)
production (id, product_id, date, quantity, notes)
expenses   (id, description, category, value, date, property_id)
sales      (id, product_id, quantity, unit_price, total, date, customer, property_id)
```

Relacionamentos:

```
properties 1 ── N products
products   1 ── N production
products   1 ── N sales
properties 1 ── N expenses
properties 1 ── N sales
```

## Rotas da API

Base: `http://localhost:3001/api`

| Recurso | Rotas |
|---|---|
| Propriedades | `GET /properties`, `GET /properties/:id`, `POST /properties`, `PUT /properties/:id`, `DELETE /properties/:id` |
| Produtos | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` |
| Produção | `GET /production`, `GET /production/:id`, `POST /production`, `PUT /production/:id`, `DELETE /production/:id` |
| Despesas | `GET /expenses`, `GET /expenses/:id`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id` |
| Vendas | `GET /sales`, `GET /sales/:id`, `POST /sales`, `PUT /sales/:id`, `DELETE /sales/:id` |
| Dashboard | `GET /dashboard` e `GET /dashboard?start_date=AAAA-MM-DD&end_date=AAAA-MM-DD` |

Filtros extras: `GET /production?product_id=1`, `GET /sales?product_id=1`, `GET /expenses?category=Insumos`.

Exemplo de resposta do dashboard:

```json
{
  "revenue": 8820,
  "expenses": 4870.5,
  "result": 3949.5,
  "production_quantity": 1310,
  "top_product": "Mandioca",
  "top_products": [],
  "expenses_by_category": []
}
```

## Regras de negócio implementadas

- Nome da propriedade e do produto são obrigatórios.
- Unidade de medida é obrigatória.
- Área, quantidades, valores e preços devem ser maiores que zero.
- O produto informado na venda deve existir.
- O total da venda é calculado pelo back-end (`quantity × unit_price`).
- O dashboard permite filtro por período.
- Não é possível excluir propriedade com registros vinculados.
- Não é possível excluir produto com vendas ou produção registradas.
- Mensagens de erro claras, tanto no back-end quanto no front-end.

## Testes realizados

### API (PowerShell / navegador)

| # | Teste | Resultado esperado | Resultado obtido |
|---|---|---|---|
| 1 | `GET /api/dashboard` | revenue 8820, expenses 4870.5, result 3949.5 | ✅ |
| 2 | `GET /api/dashboard?start_date=2026-09-01&end_date=2026-09-30` | revenue 8400, expenses 2120.5, production 920 | ✅ |
| 3 | `POST /api/sales` válida (30 × 2) | 201, total = 60 | ✅ |
| 4 | `POST /api/sales` com quantity 0 | 400 "A quantidade vendida deve ser maior que zero" | ✅ |
| 5 | `POST /api/sales` com produto inexistente | 400 "O produto informado não existe" | ✅ |
| 6 | `DELETE /api/properties/1` (com vínculos) | 409 "Não é possível excluir..." | ✅ |
| 7 | `PUT /api/sales/4` (40 × 2,5) | total recalculado = 100 | ✅ |
| 8 | `DELETE /api/sales/4` | "Venda excluída" | ✅ |

### Front-end

| # | Teste | Resultado |
|---|---|---|
| 9 | Dashboard exibe os indicadores vindos da API | ✅ |
| 10 | Filtro por período no dashboard altera os valores | ✅ |
| 11 | Propriedades: listar, validar, cadastrar, editar, excluir | ✅ |
| 12 | Propriedades: bloqueio de exclusão com vínculos (mensagem do back-end) | ✅ |
| 13 | Produtos: listar, cadastrar, editar, excluir | ✅ |
| 14 | Produtos: bloqueio de exclusão com vendas | ✅ |
| 15 | Produção: CRUD e filtro por produto | ✅ |
| 16 | Despesas: CRUD e filtro por categoria | ✅ |
| 17 | Vendas: CRUD, filtro por produto e total calculado pelo back-end | ✅ |
| 18 | Indicadores do dashboard mudam ao cadastrar/excluir registros | ✅ |

## Autor

Projeto desenvolvido por **Rafael Lima e Pedro Henrique**.