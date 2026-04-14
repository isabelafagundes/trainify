import { useState } from "react";
import { HomePage } from "@/interface/page/area-logada/HomePage";
import { HistoricoPage } from "@/interface/page/area-logada/HistoricoPage";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior, type AbaNavegacao } from "@/interface/widget/menu-lateral/NavegacaoInferior";
import {
  programasFicticios,
  fichasFicticias,
  historicoFicticio,
} from "@/infrastructure/repo/mock/dados-mock.repo";

const titulosPorAba: Record<AbaNavegacao, string> = {
  treinos: "Meus Treinos",
  historico: "Histórico",
  estatisticas: "Estatísticas",
  gerenciar: "Gerenciar",
};

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>("treinos");
  const [telaAtual, setTelaAtual] = useState<string | null>(null);

  const aoNavegar = (destino: string, _params?: Record<string, string>) => {
    setTelaAtual(destino);
  };

  const aoVoltar = () => {
    setTelaAtual(null);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pt-4">
      <CabecalhoApp
        tituloTela={
          telaAtual === "historico"
            ? "Histórico de Treinos"
            : titulosPorAba[abaAtiva]
        }
        nomeUsuario={abaAtiva === "treinos" && !telaAtual ? "Fulano" : undefined}
      />

      <main className="flex-1 pb-[72px]">
        {telaAtual === "historico" ? (
          <HistoricoPage
            fichas={fichasFicticias}
            historico={historicoFicticio}
            aoNavegar={aoNavegar}
            aoVoltar={aoVoltar}
          />
        ) : abaAtiva === "historico" ? (
          <HistoricoPage
            fichas={fichasFicticias}
            historico={historicoFicticio}
            aoNavegar={aoNavegar}
            aoVoltar={aoVoltar}
          />
        ) : abaAtiva === "treinos" ? (
          <HomePage
            programas={programasFicticios}
            fichas={fichasFicticias}
            historico={historicoFicticio}
            aoNavegar={aoNavegar}
          />
        ) : abaAtiva === "estatisticas" ? (
          <div className="px-5 py-8 text-center text-texto-sutil text-sm">
            Estatísticas — em breve.
          </div>
        ) : abaAtiva === "gerenciar" ? (
          <div className="px-5 py-8 text-center text-texto-sutil text-sm">
            Gerenciamento — em breve.
          </div>
        ) : null}
      </main>

      <NavegacaoInferior
        abaAtiva={abaAtiva}
        aoMudarAba={setAbaAtiva}
        aoCriarPrograma={() => {
          setAbaAtiva("gerenciar");
          setTelaAtual("criarPrograma");
        }}
      />
    </div>
  );
}

export default App;
