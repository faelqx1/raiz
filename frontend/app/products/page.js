"use client";
import CrudPage from "../../components/CrudPage";

export default function ProdutosPage() {
  return (
    <CrudPage
      title="Produtos"
      singular="produto"
      resource="products"
      fields={[
        { name: "name", label: "Nome do produto", type: "text", required: true },
        {
          name: "unit",
          label: "Unidade de medida",
          type: "text",
          required: true,
          placeholder: "Ex.: kg, litros, unidades",
          suggestions: ["kg", "litros", "unidades", "sacas", "dúzias", "caixas"],
        },
        {
          name: "property_id",
          label: "Propriedade",
          type: "select",
          optionsFrom: "properties",
          required: true,
        },
      ]}
      columns={[
        { label: "Produto", key: "name" },
        { label: "Unidade", key: "unit" },
        { label: "Propriedade", key: "property_name" },
      ]}
    />
  );
}