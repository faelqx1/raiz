"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CrudPage({ title, singular, resource, fields, columns, filter }) {
  const vazio = () => Object.fromEntries(fields.map((f) => [f.name, ""]));

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(vazio());
  const [editandoId, setEditandoId] = useState(null);
  const [opcoes, setOpcoes] = useState({});
  const [filtroValor, setFiltroValor] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregarItens(valorFiltro = filtroValor) {
    setCarregando(true);
    try {
      const query =
        filter && valorFiltro ? `?${filter.param}=${encodeURIComponent(valorFiltro)}` : "";
      setItens(await api.list(resource, query));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Carrega as opções dos campos "select" que dependem de outra tabela
  async function carregarOpcoes() {
    const fontes = [...fields, ...(filter ? [filter] : [])].filter((f) => f.optionsFrom);
    const resultado = {};
    try {
      for (const f of fontes) {
        resultado[f.optionsFrom] = await api.list(f.optionsFrom);
      }
      setOpcoes(resultado);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarItens("");
    carregarOpcoes();
  }, []);

  function validar() {
    for (const f of fields) {
      const v = String(form[f.name] ?? "").trim();
      if (f.required && !v) return `${f.label} é obrigatório(a)`;
      if (f.positive && v && !(Number(v) > 0)) return `${f.label} deve ser maior que zero`;
    }
    return null;
  }

  function montarCorpo() {
    const corpo = {};
    for (const f of fields) {
      const v = form[f.name];
      if (v === "" || v === null) corpo[f.name] = null;
      else if (f.type === "number" || f.type === "select") corpo[f.name] = Number(v);
      else corpo[f.name] = String(v).trim();
    }
    return corpo;
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }

    setSalvando(true);
    try {
      if (editandoId) {
        await api.update(resource, editandoId, montarCorpo());
        setSucesso(`${singular} atualizado(a) com sucesso`);
      } else {
        await api.create(resource, montarCorpo());
        setSucesso(`${singular} cadastrado(a) com sucesso`);
      }
      cancelar(false);
      await carregarItens();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function editar(item) {
    setErro("");
    setSucesso("");
    setEditandoId(item.id);
    const preenchido = {};
    for (const f of fields) preenchido[f.name] = item[f.name] ?? "";
    setForm(preenchido);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar(limparMensagens = true) {
    setEditandoId(null);
    setForm(vazio());
    if (limparMensagens) {
      setErro("");
      setSucesso("");
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Deseja realmente excluir este(a) ${singular}?`)) return;
    setErro("");
    setSucesso("");
    try {
      await api.remove(resource, item.id);
      setSucesso(`${singular} excluído(a) com sucesso`);
      await carregarItens();
    } catch (e) {
      setErro(e.message);
    }
  }

  function renderCampo(f) {
    const props = {
      className: "form-control",
      value: form[f.name],
      onChange: (e) => setForm({ ...form, [f.name]: e.target.value }),
    };

    if (f.type === "select") {
      const lista = f.optionsFrom ? opcoes[f.optionsFrom] || [] : f.options || [];
      return (
        <select {...props} className="form-select">
          <option value="">Selecione...</option>
          {lista.map((o) => (
            <option key={o.id ?? o} value={o.id ?? o}>
              {o.name ?? o}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        {...props}
        type={f.type || "text"}
        step={f.step}
        list={f.suggestions ? `lista-${f.name}` : undefined}
        placeholder={f.placeholder}
      />
    );
  }

  return (
    <div>
      <h1 className="h3 mb-3">{title}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">
            {editandoId ? `Editar ${singular}` : `Cadastrar ${singular}`}
          </h2>
          <form onSubmit={salvar} noValidate>
            <div className="row g-3">
              {fields.map((f) => (
                <div className={f.col || "col-12 col-md-6"} key={f.name}>
                  <label className="form-label">
                    {f.label}
                    {f.required && <span className="text-danger"> *</span>}
                  </label>
                  {renderCampo(f)}
                  {f.suggestions && (
                    <datalist id={`lista-${f.name}`}>
                      {f.suggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 d-flex gap-2">
              <button className="btn btn-success" type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Cadastrar"}
              </button>
              {editandoId && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => cancelar()}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h5 mb-0">Registros</h2>
            {filter && (
              <div className="d-flex align-items-center gap-2">
                <label className="small text-muted mb-0">{filter.label}:</label>
                <select
                  className="form-select form-select-sm"
                  value={filtroValor}
                  onChange={(e) => {
                    setFiltroValor(e.target.value);
                    carregarItens(e.target.value);
                  }}
                >
                  <option value="">Todos</option>
                  {(filter.optionsFrom ? opcoes[filter.optionsFrom] || [] : filter.options || []).map(
                    (o) => (
                      <option key={o.id ?? o} value={o.id ?? o}>
                        {o.name ?? o}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          {carregando ? (
            <p className="mb-0">Carregando...</p>
          ) : itens.length === 0 ? (
            <p className="text-muted mb-0">Nenhum registro encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c.label}>{c.label}</th>
                    ))}
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id}>
                      {columns.map((c) => (
                        <td key={c.label}>{c.render ? c.render(item) : item[c.key] ?? "-"}</td>
                      ))}
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => editar(item)}
                        >
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(item)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}