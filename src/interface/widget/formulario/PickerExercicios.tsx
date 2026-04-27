/* ═══════════════════════════════════════════
   Picker de Exercícios — Fichas
   ═══════════════════════════════════════════ */

import { useState, useMemo } from "react";
import type { Exercicio } from "@/domain/tipos";
import { Chip } from "@/interface/widget/chip/Chip";

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

  // Obter grupos únicos
  const gruposUnicos = useMemo(() => {
    const grupos = new Set(exercicios.map((e) => e.grupoMuscular));
    return Array.from(grupos).sort();
  }, [exercicios]);

  // Limpar seleção de grupo se não existir mais nos filtros
  if (grupoSelecionado && !gruposUnicos.includes(grupoSelecionado)) {
    setGrupoSelecionado(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-texto-primario">
        Adicionar exercícios
      </label>

      {/* Campo de busca */}
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

      {/* Filtro de grupo muscular */}
      {gruposUnicos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip
            rotulo="Todos"
            tamanho="pequeno"
            ativo={grupoSelecionado === null}
            aoClicar={() => setGrupoSelecionado(null)}
          />
          {gruposUnicos.map((grupo) => (
            <Chip
              key={grupo}
              rotulo={grupo}
              tamanho="pequeno"
              ativo={grupoSelecionado === grupo}
              aoClicar={() => setGrupoSelecionado(grupo)}
            />
          ))}
        </div>
      )}

      {/* Lista de exercícios */}
      <div className="max-h-64 overflow-y-auto">
        {exerciciosFiltrados.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-texto-secundario mb-3">
              {busca || grupoSelecionado
                ? "Nenhum exercício encontrado."
                : "Todos os exercícios já foram adicionados."}
            </p>
            {aoCriarExercicioCustom && (busca || grupoSelecionado) && (
              <button
                type="button"
                onClick={aoCriarExercicioCustom}
                className="text-sm text-acento hover:underline font-medium"
              >
                Não encontrou? Criar exercício
              </button>
            )}
          </div>
        ) : (
          <div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
            {exerciciosFiltrados.map((exercicio, index) => (
              <button
                key={exercicio.id}
                type="button"
                onClick={() => aoAdicionar(exercicio.id)}
                className={`
                  w-full px-4 py-3
                  flex items-center justify-between
                  text-left
                  transition-colors duration-150
                  hover:bg-superficie-suave
                  ${index < exerciciosFiltrados.length - 1 ? "border-b border-borda-suave" : ""}
                `}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-texto-primario truncate">
                    {exercicio.nome}
                  </p>
                  <p className="text-xs text-texto-secundario">
                    {exercicio.grupoMuscular}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-texto-sutil flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Link para criar exercício (sempre visível) */}
      {aoCriarExercicioCustom && (
        <div className="px-4 py-2 text-center border-t border-borda-suave mt-2">
          <button
            type="button"
            onClick={aoCriarExercicioCustom}
            className="text-sm text-texto-sutil hover:text-acento transition-colors"
          >
            + Criar exercício customizado
          </button>
        </div>
      )}
    </div>
  );
}
