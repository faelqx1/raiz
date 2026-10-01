"use client";
import CrudPage from "../../components/CrudPage";
import { dataBR } from "../../lib/api";

export default function ProducaoPage() {
  return (
    <CrudPage
      title="Produção"
      singular="registro de produção"
      resource="production"
      fields={[
        {
          name: "product_id",
          label: "Produto",
          type: "select",
          optionsFrom: "products",
          required: true,
        },
        { name: "date", label: "Data", type: "date", required: true },
        {
          name: "quantity",
          label: "Quantidade",
          type: "number",
          step: "0.01",
          required: true,
          positive: true,
        },
        { name: "notes", label: "Observações", type: "text", col: "col-12" },
      ]}
      columns={[
        { label: "Data", render: (i) => dataBR(i.date) },
        { label: "Produto", key: "product_name" },
        { label: "Quantidade", render: (i) => `${i.quantity} ${i.unit}` },
        { label: "Observações", key: "notes" },
      ]}
      filter={{
        label: "Produto",
        param: "product_id",
        optionsFrom: "products",
      }}
    />
  );
}