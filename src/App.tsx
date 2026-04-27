import { useState, useEffect } from "react";
import { HomePage } from "@/interface/page/area-logada/HomePage";
import { HistoricoPage } from "@/interface/page/area-logada/HistoricoPage";
import { GerenciarPage } from "@/interface/page/area-logada/gerenciar/GerenciarPage";
import { EditorProgramaPage } from "@/interface/page/area-logada/gerenciar/EditorProgramaPage";
import { EditorFichaPage } from "@/interface/page/area-logada/gerenciar/EditorFichaPage";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior, type AbaNavegacao } from "@/interface/widget/menu-lateral/NavegacaoInferior";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";

const titulosPorAba: Record<AbaNavegacao, string> = {
  treinos: "Meus Treinos",
  historico: "Histórico",
  estatisticas: "Estatísticas",
  gerenciar: "Gerenciar",
};

// Mapeamento de tela → título
const titulosPorTela: Record<string, string> = {
  criarPrograma: "Novo Programa",
  editarPrograma: "Editar Programa",
  editarFicha: "Editar Ficha",
  historico: "Histórico de Treinos",
};

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>("treinos");
  const [telaAtual, setTelaAtual] = useState<string | null>(null);
  const [paramsTela, setParamsTela] = useState<Record<string, string> | null>(null);

  // Carregar dados iniciais
  const [programas, setProgramas] = useState(stateManagerRepository.listarProgramas());
  const [fichas, setFichas] = useState(stateManagerRepository.listarFichas());
  const [historico, setHistorico] = useState(stateManagerRepository.listarTreinos());

  // Inscrever para mudanças no estado
  useEffect(() => {
    const cancelar = stateManagerRepository.inscrever(() => {
      setProgramas(stateManagerRepository.listarProgramas());
      setFichas(stateManagerRepository.listarFichas());
      setHistorico(stateManagerRepository.listarTreinos());
    });
    return cancelar;
  }, []);

  const aoNavegar = (destino: string, params?: Record<string, string>) => {
    setTelaAtual(destino);
    setParamsTela(params || null);
  };

  const aoVoltar = () => {
    setTelaAtual(null);
    setParamsTela(null);
  };

  // Obter título da tela atual
  const getTituloTela = () => {
    if (telaAtual && titulosPorTela[telaAtual]) {
      return titulosPorTela[telaAtual];
    }
    return titulosPorAba[abaAtiva];
  };

  // Buscar o programaId de uma ficha (para edição)
  const getProgramaIdDaFicha = (fichaId?: string): string => {
    if (!fichaId) return "";
    const ficha = stateManagerRepository.obterFichaPorId(fichaId);
    return ficha?.programaId || "";
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pt-4">
      <CabecalhoApp
        tituloTela={getTituloTela()}
        nomeUsuario={abaAtiva === "treinos" && !telaAtual ? "Fulano" : undefined}
      />

      <main className="flex-1 pb-[72px]">
        {/* Tela de histórico (acessada por navegação) */}
        {telaAtual === "historico" ? (
          <HistoricoPage
            fichas={fichas}
            historico={historico}
            aoNavegar={aoNavegar}
            aoVoltar={aoVoltar}
          />
        ) : abaAtiva === "historico" ? (
          <HistoricoPage
            fichas={fichas}
            historico={historico}
            aoNavegar={aoNavegar}
            aoVoltar={aoVoltar}
          />
        ) : abaAtiva === "treinos" && !telaAtual ? (
          <HomePage
            programas={programas}
            fichas={fichas}
            historico={historico}
            aoNavegar={aoNavegar}
          />
        ) : abaAtiva === "estatisticas" ? (
          <div className="px-5 py-8 text-center text-texto-sutil text-sm">
            Estatísticas — em breve.
          </div>
        ) : abaAtiva === "gerenciar" && !telaAtual ? (
          <GerenciarPage aoNavegar={aoNavegar} />
        ) : /* Telas de edição */ telaAtual === "criarPrograma" ? (
          <EditorProgramaPage aoVoltar={aoVoltar} aoNavegar={aoNavegar} />
        ) : telaAtual === "editarPrograma" ? (
          <EditorProgramaPage
            programaId={paramsTela?.id}
            aoVoltar={aoVoltar}
            aoNavegar={aoNavegar}
          />
        ) : telaAtual === "editarFicha" ? (
          <EditorFichaPage
            fichaId={paramsTela?.id}
            aoVoltar={aoVoltar}
            programaId={paramsTela?.programaId || getProgramaIdDaFicha(paramsTela?.id)}
          />
        ) : null}
      </main>

      <NavegacaoInferior
        abaAtiva={abaAtiva}
        aoMudarAba={(aba) => {
          setAbaAtiva(aba);
          setTelaAtual(null);
          setParamsTela(null);
        }}
        aoCriarPrograma={() => {
          setAbaAtiva("gerenciar");
          setTelaAtual("criarPrograma");
        }}
      />
    </div>
  );
}

export default App;
