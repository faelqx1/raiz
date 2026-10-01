"use client";
import CrudPage from "../../components/CrudPage";
import { dataBR, moeda } from "../../lib/api";

export default function VendasPage() {
  return (
    <CrudPage
      title="Vendas"
      singular="venda"
      resource="sales"
      fields={[
        {
          name: "product_id",
          label: "Produto",
          type: "select",
          optionsFrom: "products",
          required: true,
        },
        {
          name: "quantity",
          label: "Quantidade",
          type: "number",
          step: "0.01",
          required: true,
          positive: true,
        },
        {
          name: "unit_price",
          label: "Valor unitário (R$)",
          type: "number",
          step: "0.01",
          required: true,
          positive: true,
        },
        { name: "date", label: "Data", type: "date", required: true },
        { name: "customer", label: "Cliente", type: "text", col: "col-12" },
      ]}
      columns={[
        { label: "Data", render: (i) => dataBR(i.date) },
        { label: "Produto", key: "product_name" },
        { label: "Quantidade", render: (i) => `${i.quantity} ${i.unit}` },
        { label: "Valor unit.", render: (i) => moeda(i.unit_price) },
        { label: "Cliente", key: "customer" },
        { label: "Total", render: (i) => moeda(i.total) },
      ]}
      filter={{
        label: "Produto",
        param: "product_id",
        optionsFrom: "products",
      }}
    />
  );
}