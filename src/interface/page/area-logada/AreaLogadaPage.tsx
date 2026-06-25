/* ═══════════════════════════════════════════
   Layout da Área Logada — Trainify
   ═══════════════════════════════════════════ */

import type { ReactNode } from "react";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior, type AbaNavegacao } from "@/interface/widget/menu-lateral/NavegacaoInferior";

interface AreaLogadaPageProps {
  children: ReactNode;
  titulo: string;
  nomeUsuario?: string;
  abaAtiva?: AbaNavegacao;
  aoMudarAba?: (aba: AbaNavegacao) => void;
}

export function AreaLogadaPage({
  children,
  titulo,
  nomeUsuario,
  abaAtiva = "treinos",
  aoMudarAba,
}: AreaLogadaPageProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] pt-4">
      <CabecalhoApp tituloTela={titulo} nomeUsuario={nomeUsuario} />

      <main className="flex-1 pb-[72px]">{children}</main>

      {aoMudarAba && (
        <NavegacaoInferior
          abaAtiva={abaAtiva}
          aoMudarAba={aoMudarAba}
        />
      )}
    </div>
  );
}
