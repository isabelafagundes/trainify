/* ═══════════════════════════════════════════
   Provedor de dados da área logada
   ───────────────────────────────────────────
   Concentra a subscrição do estado global
   (programas, fichas, histórico, exercícios,
   usuário) que antes vivia no App.tsx. Expõe
   useDados() para os wrappers de rota.

   Também cuida da retomada automática de uma
   sessão de treino em andamento na carga inicial.
   ═══════════════════════════════════════════ */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { usuarioManager } from "@/application/state/usuario.state";
import { carregarSessaoAtiva } from "@/application/state/sessao-ativa";

interface DadosTrainify {
  programas: ReturnType<typeof stateManagerRepository.listarProgramas>;
  fichas: ReturnType<typeof stateManagerRepository.listarFichas>;
  historico: ReturnType<typeof stateManagerRepository.listarTreinos>;
  exercicios: ReturnType<typeof stateManagerRepository.listarTodosExercicios>;
  usuario: ReturnType<typeof usuarioManager.obterUsuario>;
  carregando: boolean;
}

const ContextoDados = createContext<DadosTrainify | null>(null);

export function useDados(): DadosTrainify {
  const ctx = useContext(ContextoDados);
  if (!ctx) {
    throw new Error("useDados deve ser usado dentro de <DadosProvider>");
  }
  return ctx;
}

export function DadosProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(
    () => !stateManagerRepository.estaInicializado() || !usuarioManager.estaInicializado()
  );
  const [programas, setProgramas] = useState(stateManagerRepository.listarProgramas());
  const [fichas, setFichas] = useState(stateManagerRepository.listarFichas());
  const [historico, setHistorico] = useState(stateManagerRepository.listarTreinos());
  const [exercicios, setExercicios] = useState(stateManagerRepository.listarTodosExercicios());
  const [usuario, setUsuario] = useState(() => usuarioManager.obterUsuario());

  useEffect(() => {
    let ativo = true;

    const sincronizar = () => {
      setProgramas(stateManagerRepository.listarProgramas());
      setFichas(stateManagerRepository.listarFichas());
      setHistorico(stateManagerRepository.listarTreinos());
      setExercicios(stateManagerRepository.listarTodosExercicios());
    };

    Promise.all([
      stateManagerRepository.inicializar(),
      usuarioManager.inicializar(),
      carregarSessaoAtiva(),
    ]).then(([, , sessaoAtiva]) => {
      if (!ativo) return;
      sincronizar();
      setUsuario(usuarioManager.obterUsuario());
      setCarregando(false);

      // Retoma um treino em andamento — só quando a URL está na
      // home, para não atropelar um deep link aberto pelo usuário.
      const fichaEmAndamento =
        sessaoAtiva &&
        stateManagerRepository
          .listarFichas()
          .some((ficha) => ficha.id === sessaoAtiva.fichaId);
      if (fichaEmAndamento) {
        const hash = window.location.hash;
        if (hash === "" || hash === "#/" || hash === "#/treinos") {
          navigate(`/execucao/${sessaoAtiva.fichaId}`, { replace: true });
        }
      }
    });

    const cancelar = stateManagerRepository.inscrever(sincronizar);
    const cancelarUsuario = usuarioManager.inscrever(() => {
      setUsuario(usuarioManager.obterUsuario());
    });

    return () => {
      ativo = false;
      cancelar();
      cancelarUsuario();
    };
  }, [navigate]);

  return (
    <ContextoDados.Provider
      value={{ programas, fichas, historico, exercicios, usuario, carregando }}
    >
      {children}
    </ContextoDados.Provider>
  );
}
