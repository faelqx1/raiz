import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import BootstrapClient from "../components/BootstrapClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Raiz - Gestão Agrícola",
  description: "Ferramenta de gestão para pequenos produtores rurais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar />
        <main className="container py-4">{children}</main>
        <BootstrapClient />
      </body>
    </html>
  );
}