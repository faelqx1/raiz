"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Propriedades" },
  { href: "/products", label: "Produtos" },
  { href: "/production", label: "Produção" },
  { href: "/expenses", label: "Despesas" },
  { href: "/sales", label: "Vendas" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-raiz shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" href="/">
          <img
            src="/logo.webp"
            alt="Raiz"
            height="150"
            style={{
              filter: "invert(1)",
              mixBlendMode: "screen",
              objectFit: "contain",
            }}
          />
          <span className="fw-bold fs-4">Raiz</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Abrir menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.href}>
                <Link
                  className={"nav-link" + (pathname === l.href ? " active fw-semibold" : "")}
                  href={l.href}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}