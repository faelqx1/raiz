"use client";
import CrudPage from "../../components/CrudPage";

export default function PropriedadesPage() {
  return (
    <CrudPage
      title="Propriedades"
      singular="propriedade"
      resource="properties"
      fields={[
        { name: "name", label: "Nome", type: "text", required: true },
        { name: "location", label: "Localização", type: "text" },
        {
          name: "area",
          label: "Área (hectares)",
          type: "number",
          step: "0.01",
          required: true,
          positive: true,
        },
      ]}
      columns={[
        { label: "Nome", key: "name" },
        { label: "Localização", key: "location" },
        { label: "Área (ha)", key: "area" },
      ]}
    />
  );
}