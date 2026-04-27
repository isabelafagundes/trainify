/* ═══════════════════════════════════════════
   Editor de Programa — Criar/Editar Programas
   ═══════════════════════════════════════════ */

import { useEffect, useState } from "react";
import type { Programa, Ficha, CorBanner } from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Input } from "@/interface/widget/formulario/Input";
import { SelectCorBanner } from "@/interface/widget/formulario/SelectCorBanner";
import { SeletorFichas } from "@/interface/widget/formulario/SeletorFichas";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { exerciciosPadrao } from "@/infrastructure/repo/mock/exercicio-mock.repo";

interface PropriedadesEditorProgramaPage {
  programaId?: string;
  aoVoltar: () => void;
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

export function EditorProgramaPage({
  programaId,
  aoVoltar,
  aoNavegar,
}: PropriedadesEditorProgramaPage) {
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [corBanner, setCorBanner] = useState<CorBanner | null>(null);
  const [ativo, setAtivo] = useState(false);
  const [fichaIds, setFichaIds] = useState<string[]>([]);
  const [programaTempId, setProgramaTempId] = useState<string | null>(null);

  const editando = Boolean(programaId);
  const titulo = editando ? "Editar Programa" : "Novo Programa";
  const idParaUsar = programaId || programaTempId;

  // Carregar dados
  useEffect(() => {
    const carregarDados = () => {
      const todasFichas = stateManagerRepository.listarFichas();
      setFichas(todasFichas);

      if (programaId) {
        const prog = stateManagerRepository.obterProgramaPorId(programaId);
        if (prog) {
          setPrograma(prog);
          setNome(prog.nome);
          setDescricao(prog.descricao);
          setCorBanner(prog.corBanner);
          setAtivo(prog.ativo);
          setFichaIds(prog.fichaIds);
        }
      } else {
        // Novo programa - começar como ativo se não houver outros
        const programaAtivo = stateManagerRepository.obterProgramaAtivo();
        setAtivo(!programaAtivo);
      }
    };

    carregarDados();

    const cancelarInscricao = stateManagerRepository.inscrever(carregarDados);
    return cancelarInscricao;
  }, [programaId]);

  // Calcular grupos por ficha
  const gruposPorFicha: Record<string, string[]> = {};
  fichas.forEach((ficha) => {
    const grupos = new Set<string>();
    ficha.exercicios.forEach((exFicha) => {
      const exercicio = exerciciosPadrao.find((e) => e.id === exFicha.exercicioId);
      if (exercicio) {
        grupos.add(exercicio.grupoMuscular);
      }
    });
    gruposPorFicha[ficha.id] = Array.from(grupos);
  });

  // Handlers
  const handleSalvar = () => {
    if (!nome.trim()) {
      alert("Digite um nome para o programa.");
      return;
    }

    if (fichaIds.length === 0) {
      alert("Selecione pelo menos uma ficha para o programa.");
      return;
    }

    const dadosPrograma = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      corBanner,
      ativo,
      fichaIds,
    };

    if (editando && programa) {
      stateManagerRepository.atualizarPrograma(programa.id, dadosPrograma);
    } else {
      stateManagerRepository.adicionarPrograma(dadosPrograma);
    }

    aoVoltar();
  };

  const handleCopiar = () => {
    if (!editando) return; // Só permite copiar quando editando

    if (confirm("Deseja criar uma cópia deste programa?")) {
      const copia = stateManagerRepository.copiarPrograma(programaId!);
      if (copia) {
        aoVoltar();
      }
    }
  };

  return (
    <div className="px-5 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display tracking-tight text-texto-primario">
          {titulo}
        </h1>
        <button
          type="button"
          onClick={aoVoltar}
          className="p-2 -mr-2 text-texto-secundario hover:text-texto-primario hover:bg-superficie-suave rounded-lg transition-colors"
        >
          <Icone nome="fechar" tamanho={24} />
        </button>
      </div>

      {/* Formulário */}
      <div className="space-y-6">
        {/* Nome */}
        <Input
          label="Nome"
          tipo="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Rotina Janeiro"
          ajuda="Nome para identificar o programa"
        />

        {/* Descrição */}
        <Input
          label="Descrição (opcional)"
          tipo="textarea"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Rotina de volume, 4x por semana"
          linhas={2}
          ajuda="Descreva o objetivo ou características do programa"
        />

        {/* Cor do banner */}
        <SelectCorBanner valor={corBanner} aoAlterar={setCorBanner} />

        {/* Programa ativo */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="
              w-5 h-5 rounded-md border-2 border-borda
              transition-all duration-150
              checked:bg-acento checked:border-acento
              focus:ring-2 focus:ring-acento/20
            "
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-texto-primario">
              Programa ativo
            </p>
            <p className="text-xs text-texto-secundario">
              Apenas um programa pode estar ativo por vez
            </p>
          </div>
        </label>

        {/* Seleção de fichas */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-texto-primario">
              Fichas do programa
            </h3>
            <Botao
              variante="fantasma"
              tamanho="compacto"
              icone={<Icone nome="mais" tamanho={16} />}
              onClick={() => {
                // Se for programa novo, salvar primeiro
                if (!idParaUsar) {
                  if (!nome.trim()) {
                    alert("Digite um nome para o programa antes de criar fichas.");
                    return;
                  }
                  const novoPrograma = stateManagerRepository.adicionarPrograma({
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    corBanner,
                    ativo,
                    fichaIds: [],
                  });
                  setProgramaTempId(novoPrograma.id);
                  aoNavegar("criarFicha", { programaId: novoPrograma.id });
                } else {
                  aoNavegar("criarFicha", { programaId: idParaUsar });
                }
              }}
            >
              Nova Ficha
            </Botao>
          </div>

          <SeletorFichas
            fichas={fichas}
            fichaIdsSelecionadas={fichaIds}
            aoAlterarSelecao={(fichaId) => {
              if (fichaIds.includes(fichaId)) {
                setFichaIds(fichaIds.filter((id) => id !== fichaId));
              } else {
                setFichaIds([...fichaIds, fichaId]);
              }
            }}
            gruposPorFicha={gruposPorFicha}
            semTitulo
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-4">
        {editando && (
          <Botao
            variante="secundario"
            onClick={handleCopiar}
            className="flex-1"
          >
            Copiar
          </Botao>
        )}

        <Botao
          variante="secundario"
          onClick={aoVoltar}
          className={editando ? "" : "flex-1"}
        >
          Cancelar
        </Botao>

        <Botao
          variante="primario"
          onClick={handleSalvar}
          className="flex-1"
        >
          {editando ? "Salvar" : "Criar Programa"}
        </Botao>
      </div>
    </div>
  );
}
