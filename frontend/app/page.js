"use client";
import { useEffect, useState } from "react";
import { api, moeda } from "../lib/api";

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar(start = "", end = "") {
    setErro("");
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append("start_date", start);
      if (end) params.append("end_date", end);
      const query = params.toString() ? `?${params}` : "";
      setDados(await api.dashboard(query));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function filtrar(e) {
    e.preventDefault();
    if (inicio && fim && inicio > fim) {
      setErro("A data inicial não pode ser maior que a final");
      return;
    }
    carregar(inicio, fim);
  }

  function limpar() {
    setInicio("");
    setFim("");
    carregar();
  }

  const maiorCategoria = dados
    ? Math.max(...dados.expenses_by_category.map((c) => c.total), 1)
    : 1;

  return (
    <div>
      <h1 className="h3 mb-3">Dashboard</h1>

      <div className="banner-raiz mb-4">
        <h2 className="h4 mb-1">Como está o desempenho da propriedade?</h2>
        <p className="mb-0">Acompanhe produção, vendas e despesas em um só lugar.</p>
      </div>

      <form className="row g-2 align-items-end mb-4" onSubmit={filtrar}>
        <div className="col-6 col-md-3">
          <label className="form-label mb-1">Data inicial</label>
          <input
            type="date"
            className="form-control"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label mb-1">Data final</label>
          <input
            type="date"
            className="form-control"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto d-flex gap-2">
          <button className="btn btn-success" type="submit">
            Filtrar
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={limpar}>
            Limpar
          </button>
        </div>
      </form>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {carregando && !dados && <p>Carregando...</p>}

      {dados && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Receita total</div>
                  <div className="fs-4 fw-bold text-success">{moeda(dados.revenue)}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Despesas totais</div>
                  <div className="fs-4 fw-bold text-danger">{moeda(dados.expenses)}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Resultado registrado</div>
                  <div
                    className={
                      "fs-4 fw-bold " + (dados.result >= 0 ? "text-primary" : "text-danger")
                    }
                  >
                    {moeda(dados.result)}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Quantidade produzida</div>
                  <div className="fs-4 fw-bold" style={{ color: "#6f42c1" }}>
                    {dados.production_quantity.toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5">Produtos mais vendidos</h2>
                  {dados.top_products.length === 0 ? (
                    <p className="text-muted mb-0">Nenhuma venda no período.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Receita</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dados.top_products.map((p) => (
                            <tr key={p.name}>
                              <td>{p.name}</td>
                              <td>
                                {p.total_quantity} {p.unit}
                              </td>
                              <td>{moeda(p.total_revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5">Despesas por categoria</h2>
                  {dados.expenses_by_category.length === 0 ? (
                    <p className="text-muted mb-0">Nenhuma despesa no período.</p>
                  ) : (
                    dados.expenses_by_category.map((c) => (
                      <div className="mb-3" key={c.category}>
                        <div className="d-flex justify-content-between small">
                          <span>{c.category}</span>
                          <span>{moeda(c.total)}</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(c.total / maiorCategoria) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}