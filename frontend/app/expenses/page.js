"use client";
import CrudPage from "../../components/CrudPage";
import { dataBR, moeda } from "../../lib/api";

const CATEGORIAS = [
  "Insumos",
  "Ração",
  "Sementes",
  "Fertilizantes",
  "Energia elétrica",
  "Transporte",
  "Manutenção",
  "Combustível",
  "Pessoal",
];

export default function DespesasPage() {
  return (
    <CrudPage
      title="Despesas"
      singular="despesa"
      resource="expenses"
      fields={[
        { name: "description", label: "Descrição", type: "text", required: true },
        {
          name: "category",
          label: "Categoria",
          type: "text",
          required: true,
          placeholder: "Escolha ou digite uma categoria",
          suggestions: CATEGORIAS,
        },
        {
          name: "value",
          label: "Valor (R$)",
          type: "number",
          step: "0.01",
          required: true,
          positive: true,
        },
        { name: "date", label: "Data", type: "date", required: true },
        {
          name: "property_id",
          label: "Propriedade",
          type: "select",
          optionsFrom: "properties",
          required: true,
        },
      ]}
      columns={[
        { label: "Data", render: (i) => dataBR(i.date) },
        { label: "Descrição", key: "description" },
        { label: "Categoria", key: "category" },
        { label: "Propriedade", key: "property_name" },
        { label: "Valor", render: (i) => moeda(i.value) },
      ]}
      filter={{
        label: "Categoria",
        param: "category",
        options: CATEGORIAS,
      }}
    />
  );
}