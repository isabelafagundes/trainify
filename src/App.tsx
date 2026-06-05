import { useCallback, useState, useEffect } from "react";
import { HomePage } from "@/interface/page/area-logada/HomePage";
import { HistoricoPage } from "@/interface/page/area-logada/HistoricoPage";
import { DetalheHistoricoPage } from "@/interface/page/area-logada/historico/DetalheHistoricoPage";
import { GraficoProgressaoPage } from "@/interface/page/area-logada/historico/GraficoProgressaoPage";
import { GerenciarPage } from "@/interface/page/area-logada/gerenciar/GerenciarPage";
import { EditorProgramaPage } from "@/interface/page/area-logada/gerenciar/EditorProgramaPage";
import { EditorFichaPage } from "@/interface/page/area-logada/gerenciar/EditorFichaPage";
import { ExecucaoTreinoPage } from "@/interface/page/area-logada/execucao/ExecucaoTreinoPage";
import { EstatisticasPage } from "@/interface/page/area-logada/estatisticas/EstatisticasPage";
import { OnboardingUsuarioPage } from "@/interface/page/onboarding/OnboardingUsuarioPage";
import { CabecalhoApp } from "@/interface/widget/cabecalho/CabecalhoApp";
import { NavegacaoInferior, type AbaNavegacao } from "@/interface/widget/menu-lateral/NavegacaoInferior";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { usuarioManager } from "@/application/state/usuario.state";
import { ToastProvider } from "@/interface/widget/toast";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

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
  criarFicha: "Nova Ficha",
  editarFicha: "Editar Ficha",
  historico: "Histórico de Treinos",
  detalheHistorico: "Detalhe do Treino",
  graficoProgressao: "Progressão",
};

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>("treinos");
  const [telaAtual, setTelaAtual] = useState<string | null>(null);
  const [paramsTela, setParamsTela] = useState<Record<string, string> | null>(null);
  const [carregando, setCarregando] = useState(
    () => !stateManagerRepository.estaInicializado() || !usuarioManager.estaInicializado()
  );
  const [usuario, setUsuario] = useState(() => usuarioManager.obterUsuario());

  // Carregar dados iniciais
  const [programas, setProgramas] = useState(stateManagerRepository.listarProgramas());
  const [fichas, setFichas] = useState(stateManagerRepository.listarFichas());
  const [historico, setHistorico] = useState(stateManagerRepository.listarTreinos());
  const [exercicios, setExercicios] = useState(stateManagerRepository.listarTodosExercicios());

  // Inscrever para mudanças no estado
  useEffect(() => {
    let ativo = true;

    Promise.all([
      stateManagerRepository.inicializar(),
      usuarioManager.inicializar(),
    ]).then(() => {
      if (!ativo) return;
      setProgramas(stateManagerRepository.listarProgramas());
      setFichas(stateManagerRepository.listarFichas());
      setHistorico(stateManagerRepository.listarTreinos());
      setExercicios(stateManagerRepository.listarTodosExercicios());
      setUsuario(usuarioManager.obterUsuario());
      setCarregando(false);
    });

    const cancelar = stateManagerRepository.inscrever(() => {
      setProgramas(stateManagerRepository.listarProgramas());
      setFichas(stateManagerRepository.listarFichas());
      setHistorico(stateManagerRepository.listarTreinos());
      setExercicios(stateManagerRepository.listarTodosExercicios());
    });

    const cancelarUsuario = usuarioManager.inscrever(() => {
      setUsuario(usuarioManager.obterUsuario());
    });

    return () => {
      ativo = false;
      cancelar();
      cancelarUsuario();
    };
  }, []);

  const aoNavegar = (destino: string, params?: Record<string, string>) => {
    setTelaAtual(destino);
    setParamsTela(params || null);
  };

  const irParaTreinos = () => {
    setAbaAtiva("treinos");
    setTelaAtual(null);
    setParamsTela(null);
  };

  const aoVoltar = useCallback(() => {
    // Se há um parâmetro voltarPara, navega para a tela apropriada
    if (paramsTela?.voltarPara === "editarPrograma" && paramsTela?.programaIdVoltar) {
      setTelaAtual("editarPrograma");
      setParamsTela({ id: paramsTela.programaIdVoltar });
    } else if (paramsTela?.voltarPara === "detalheHistorico" && paramsTela?.registroId) {
      setTelaAtual("detalheHistorico");
      setParamsTela({ registroId: paramsTela.registroId });
    } else {
      setTelaAtual(null);
      setParamsTela(null);
    }
  }, [paramsTela]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const registro = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (telaAtual) {
        aoVoltar();
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      void registro.then((listener) => listener.remove());
    };
  }, [aoVoltar, telaAtual]);

  // Obter título da tela atual
  const getTituloTela = () => {
    if (telaAtual && titulosPorTela[telaAtual]) {
      return titulosPorTela[telaAtual];
    }
    return titulosPorAba[abaAtiva];
  };

  if (!carregando && !usuario) {
    return <OnboardingUsuarioPage aoConcluir={() => setUsuario(usuarioManager.obterUsuario())} />;
  }

  if (telaAtual === "execucao") {
    const fichaExecucao = paramsTela?.fichaId
      ? fichas.find((ficha) => ficha.id === paramsTela.fichaId)
      : null;

    return (
      <ToastProvider>
        {fichaExecucao ? (
          <ExecucaoTreinoPage
            ficha={fichaExecucao}
            historico={historico}
            aoVoltar={aoVoltar}
          />
        ) : (
          <div className="min-h-[100dvh] bg-fundo px-4 py-8 text-center text-sm text-texto-secundario">
            Ficha nao encontrada.
          </div>
        )}
      </ToastProvider>
    );
  }

  if (carregando) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-fundo px-6 text-center">
        <div>
          <p className="font-display text-lg font-semibold text-texto-primario">Trainify</p>
          <p className="mt-2 text-sm text-texto-secundario">Carregando seus treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] flex-col">
          <CabecalhoApp
            tituloTela={getTituloTela()}
            nomeUsuario={usuario?.nome}
            avatarEmoji={usuario?.avatarEmoji}
            onBack={telaAtual ? aoVoltar : undefined}
          />

          <main className={`flex-1 ${telaAtual && ["criarPrograma", "editarPrograma", "criarFicha", "editarFicha", "graficoProgressao"].includes(telaAtual) ? "" : "pb-[72px]"}`}>
            {/* Tela de histórico (acessada por navegação) */}
            {telaAtual === "historico" ? (
              <HistoricoPage
                fichas={fichas}
                programas={programas}
                historico={historico}
                aoNavegar={aoNavegar}
                aoIrParaTreinos={irParaTreinos}
              />
            ) : telaAtual === "detalheHistorico" && paramsTela?.registroId ? (
              <DetalheHistoricoPage
                registroId={paramsTela.registroId}
                fichas={fichas}
                historico={historico}
                exercicios={exercicios}
                aoNavegar={aoNavegar}
                aoVoltar={aoVoltar}
              />
            ) : telaAtual === "graficoProgressao" && paramsTela?.exercicioId ? (
              <GraficoProgressaoPage
                exercicioId={paramsTela.exercicioId}
                exercicios={exercicios}
                historico={historico}
              />
            ) : abaAtiva === "historico" ? (
              <HistoricoPage
                fichas={fichas}
                programas={programas}
                historico={historico}
                aoNavegar={aoNavegar}
                aoIrParaTreinos={irParaTreinos}
              />
            ) : abaAtiva === "treinos" && !telaAtual ? (
              <HomePage
                programas={programas}
                fichas={fichas}
                historico={historico}
                aoNavegar={aoNavegar}
              />
            ) : abaAtiva === "estatisticas" ? (
              <EstatisticasPage
                historico={historico}
                exercicios={exercicios}
                aoNavegar={aoNavegar}
              />
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
            ) : telaAtual === "criarFicha" ? (
              <EditorFichaPage
                aoVoltar={aoVoltar}
                programaId={paramsTela?.programaId}
              />
            ) : telaAtual === "editarFicha" ? (
              <EditorFichaPage
                fichaId={paramsTela?.id}
                aoVoltar={aoVoltar}
                programaId={paramsTela?.programaId}
              />
            ) : null}
          </main>

          {/* Esconder navegação em telas de edição/criação */}
          {!telaAtual || !["criarPrograma", "editarPrograma", "criarFicha", "editarFicha", "graficoProgressao"].includes(telaAtual) ? (
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
          ) : null}
        </div>
    </ToastProvider>
  );
}

export default App;
