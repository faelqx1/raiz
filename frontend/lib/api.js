const API_URL = "http://localhost:3001/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });
  } catch {
    throw new Error("Não foi possível conectar à API. O servidor está ligado?");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.error) || "Erro ao processar a requisição");
  }
  return data;
}

export const api = {
  list: (resource, query = "") => request(`/${resource}${query}`),
  get: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, body) =>
    request(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),
  update: (resource, id, body) =>
    request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: "DELETE" }),
  dashboard: (query = "") => request(`/dashboard${query}`),
};

export const moeda = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataBR = (d) => (d ? d.split("-").reverse().join("/") : "-");