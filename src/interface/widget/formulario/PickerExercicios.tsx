/* ═══════════════════════════════════════════
   Picker de Exercícios — Fichas
   ═══════════════════════════════════════════ */

import { useState, useMemo } from "react";
import type { Exercicio } from "@/domain/tipos";
import { Chip } from "@/interface/widget/chip/Chip";
import { Icone } from "@/interface/widget/svg/Icone";

interface PickerExerciciosProps {
  exercicios: Exercicio[];
  exercicioIdsSelecionados: string[];
  aoAdicionar: (exercicioId: string) => void;
  gruposFiltrados?: string[];
  aoCriarExercicioCustom?: () => void;
}

export function PickerExercicios({
  exercicios,
  exercicioIdsSelecionados,
  aoAdicionar,
  gruposFiltrados,
  aoCriarExercicioCustom,
}: PickerExerciciosProps) {
  const [busca, setBusca] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);

  // Filtrar exercícios
  const exerciciosFiltrados = useMemo(() => {
    let filtrados = exercicios;

    // Aplicar filtro de grupo se selecionado
    if (grupoSelecionado) {
      filtrados = filtrados.filter((e) => e.grupoMuscular === grupoSelecionado);
    }

    // Aplicar filtro de grupos filtrados (quando exercício já está na ficha)
    if (gruposFiltrados && gruposFiltrados.length > 0) {
      filtrados = filtrados.filter((e) =>
        gruposFiltrados.includes(e.grupoMuscular)
      );
    }

    // Aplicar busca por texto
    if (busca) {
      const buscaLower = busca.toLowerCase();
      filtrados = filtrados.filter(
        (e) =>
          e.nome.toLowerCase().includes(buscaLower) ||
          e.grupoMuscular.toLowerCase().includes(buscaLower)
      );
    }

    // Remover já selecionados
    filtrados = filtrados.filter((e) => !exercicioIdsSelecionados.includes(e.id));

    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [exercicios, grupoSelecionado, busca, gruposFiltrados, exercicioIdsSelecionados]);

  // Agrupar resultados por grupo muscular
  const gruposDeResultados = useMemo(() => {
    const mapa = new Map<string, Exercicio[]>();
    for (const exercicio of exerciciosFiltrados) {
      const lista = mapa.get(exercicio.grupoMuscular) ?? [];
      lista.push(exercicio);
      mapa.set(exercicio.grupoMuscular, lista);
    }
    return [...mapa.entries()]
      .map(([grupo, lista]) => ({ grupo, lista }))
      .sort((a, b) => a.grupo.localeCompare(b.grupo));
  }, [exerciciosFiltrados]);

  // Obter grupos únicos
  const gruposUnicos = useMemo(() => {
    const grupos = new Set(exercicios.map((e) => e.grupoMuscular));
    return Array.from(grupos).sort();
  }, [exercicios]);

  // Limpar seleção de grupo se não existir mais nos filtros
  if (grupoSelecionado && !gruposUnicos.includes(grupoSelecionado)) {
    setGrupoSelecionado(null);
  }

  const totalDisponivel = exerciciosFiltrados.length;
  const buscaAtivaSemResultado = totalDisponivel === 0 && (busca || grupoSelecionado);

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de busca + filtros — fixa ao rolar */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-2 bg-superficie/95 backdrop-blur-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar exercício..."
            className="
              w-full px-4 py-3 pl-10
              bg-superficie
              border border-borda
              rounded-[10px]
              text-sm text-texto-primario placeholder:text-texto-sutil
              focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20
              transition-all duration-200
            "
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto-sutil"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filtro de grupo muscular — rolagem horizontal */}
        {gruposUnicos.length > 0 && (
          <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Chip
              rotulo="Todos"
              tamanho="pequeno"
              ativo={grupoSelecionado === null}
              aoClicar={() => setGrupoSelecionado(null)}
              className="shrink-0 min-h-[36px] px-3.5 text-[13px]"
            />
            {gruposUnicos.map((grupo) => (
              <Chip
                key={grupo}
                rotulo={grupo}
                tamanho="pequeno"
                ativo={grupoSelecionado === grupo}
                aoClicar={() => setGrupoSelecionado(grupo)}
                className="shrink-0 min-h-[36px] px-3.5 text-[13px]"
              />
            ))}
          </div>
        )}

        {aoCriarExercicioCustom && (
          <button
            type="button"
            onClick={aoCriarExercicioCustom}
            className="
              flex w-full items-center justify-center gap-2
              rounded-[10px] border border-dashed border-borda
              px-4 py-2.5 min-h-[44px]
              text-sm font-medium text-texto-secundario
              hover:border-acento hover:text-acento hover:bg-acento/5
              active:scale-[0.99]
              transition-all duration-150
            "
          >
            <Icone nome="mais" tamanho={16} />
            Criar exercício customizado
          </button>
        )}
      </div>

      {/* Lista de exercícios agrupada */}
      {buscaAtivaSemResultado ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-texto-secundario mb-3">
            Nenhum exercício encontrado.
          </p>
          {aoCriarExercicioCustom && (
            <button
              type="button"
              onClick={aoCriarExercicioCustom}
              className="text-sm text-acento hover:underline font-medium"
            >
              Não encontrou? Criar exercício
            </button>
          )}
        </div>
      ) : totalDisponivel === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-texto-secundario">
            Todos os exercícios já foram adicionados.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {gruposDeResultados.map(({ grupo, lista }) => (
            <section key={grupo} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
                  {grupo}
                </h3>
                <span className="text-xs tabular-nums text-texto-sutil/60">
                  {lista.length}
                </span>
              </div>
              <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
                {lista.map((exercicio, index) => (
                  <button
                    key={exercicio.id}
                    type="button"
                    onClick={() => aoAdicionar(exercicio.id)}
                    className={`
                      group w-full px-4 py-3.5 min-h-[56px]
                      flex items-center justify-between gap-3
                      text-left
                      transition-colors duration-150
                      hover:bg-superficie-suave active:bg-superficie-hover
                      ${index < lista.length - 1 ? "border-b border-borda-suave" : ""}
                    `}
                  >
                    <span className="text-sm font-medium text-texto-primario truncate">
                      {exercicio.nome}
                    </span>
                    <span
                      className="
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full bg-superficie-suave text-texto-sutil
                        transition-colors duration-150
                        group-hover:bg-acento group-hover:text-texto-invertido
                      "
                      aria-hidden="true"
                    >
                      <Icone nome="mais" tamanho={16} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
