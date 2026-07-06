import { useMemo, useState } from "react";
import type {
  Exercicio,
  Ficha,
  Programa,
  RegistroTreino,
} from "@/domain/tipos";
import { stateManagerRepository } from "@/infrastructure/repo/state/state-manager.repo";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { BarraProgressoSemanal } from "@/interface/widget/programa/BarraProgressoSemanal";
import { CartaoEstatistica } from "@/interface/widget/programa/CartaoEstatistica";
import { FichaExpansivel } from "@/interface/widget/ficha/FichaExpansivel";
import {
  contarTreinosDoPrograma,
  formatarDataRelativa,
  obterFichasDoPrograma,
  obterFichasTreinadasNaSemana,
  obterProximaFichaId,
  obterUltimoTreinoDoPrograma,
  ordenarFichasComProximaPrimeiro,
} from "@/interface/page/area-logada/programa/utils";

interface PropriedadesResumoProgramaPage {
  programaId: string;
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

export function ResumoProgramaPage({
  programaId,
  programas,
  fichas,
  historico,
  exercicios,
  aoNavegar,
}: PropriedadesResumoProgramaPage) {
  const [fichaExpandidaId, setFichaExpandidaId] = useState<string | null>(null);

  const programa = programas.find((p) => p.id === programaId) ?? null;

  const dados = useMemo(() => {
    if (!programa) return null;
    const fichasDoPrograma = obterFichasDoPrograma(programa, fichas);
    const proximaFichaId = obterProximaFichaId(fichasDoPrograma, historico);
    return {
      fichasDoPrograma,
      fichasOrdenadas: ordenarFichasComProximaPrimeiro(fichasDoPrograma, proximaFichaId),
      proximaFichaId,
      treinadasSemana: obterFichasTreinadasNaSemana(fichasDoPrograma, historico),
      totalTreinos: contarTreinosDoPrograma(fichasDoPrograma, historico),
      ultimoTreino: obterUltimoTreinoDoPrograma(fichasDoPrograma, historico),
    };
  }, [programa, fichas, historico]);

  if (!programa || !dados) {
    return (
      <div className="px-4 py-8 text-center text-sm text-texto-secundario">
        Programa não encontrado.
      </div>
    );
  }

  const {
    fichasDoPrograma,
    fichasOrdenadas,
    proximaFichaId,
    treinadasSemana,
    totalTreinos,
    ultimoTreino,
  } = dados;

  function tornarAtivo() {
    stateManagerRepository.atualizarPrograma(programa!.id, { ativo: true });
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* ── Cabeçalho do programa ── */}
      <section className="reveal-up">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-texto-primario font-display leading-tight truncate">
              {programa.nome}
            </h2>
          </div>

          {programa.ativo ? (
            <span className="flex-shrink-0 mt-1 rounded-full bg-acento-suave px-2.5 py-1 text-xs font-semibold text-texto-secundario">
              Ativo
            </span>
          ) : (
            <Botao
              variante="secundario"
              tamanho="compacto"
              onClick={tornarAtivo}
              className="flex-shrink-0"
            >
              Tornar ativo
            </Botao>
          )}
        </div>

        {programa.descricao && (
          <p className="mt-2 text-sm text-texto-secundario leading-snug">
            {programa.descricao}
          </p>
        )}
      </section>

      {/* ── Ações ── */}
      <section
        className="flex items-stretch gap-2 reveal-up"
        style={{ animationDelay: "60ms" }}
      >
        {proximaFichaId && (
          <Botao
            variante="primario"
            icone={<Icone nome="reproduzir" tamanho={15} />}
            onClick={() => aoNavegar("execucao", { fichaId: proximaFichaId })}
            className="flex-1 min-w-0"
          >
            Iniciar treino
          </Botao>
        )}
        <Botao
          variante="secundario"
          icone={<Icone nome="editar" tamanho={15} />}
          onClick={() => aoNavegar("editarPrograma", { id: programa.id })}
          className={proximaFichaId ? "flex-shrink-0" : "flex-1"}
        >
          Editar
        </Botao>
      </section>

      {/* ── Estatísticas ── */}
      <section
        className="grid grid-cols-2 gap-3 reveal-up"
        style={{ animationDelay: "120ms" }}
      >
        <CartaoEstatistica
          valor={fichasDoPrograma.length}
          rotulo={`ficha${fichasDoPrograma.length !== 1 ? "s" : ""} no programa`}
        />
        <CartaoEstatistica valor={totalTreinos} rotulo="treinos realizados" />
        <CartaoEstatistica
          valor={`${treinadasSemana.size}/${fichasDoPrograma.length || 0}`}
          rotulo="fichas esta semana"
        />
        <CartaoEstatistica
          valor={ultimoTreino ? formatarDataRelativa(ultimoTreino) : "—"}
          rotulo="último treino"
        />
      </section>

      {/* ── Progresso semanal ── */}
      {fichasDoPrograma.length > 0 && (
        <section
          className="rounded-2xl bg-superficie border border-borda px-4 py-4 reveal-up"
          style={{ animationDelay: "180ms" }}
        >
          <BarraProgressoSemanal
            concluidas={treinadasSemana.size}
            total={fichasDoPrograma.length}
            comRotulo
          />
        </section>
      )}

      {/* ── Fichas ── */}
      <section
        className="reveal-up"
        style={{ animationDelay: "240ms" }}
      >
        <h3 className="px-1 mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
          Fichas
        </h3>

        {fichasOrdenadas.length > 0 ? (
          <div className="rounded-2xl overflow-hidden bg-superficie border border-borda divide-y divide-borda-suave">
            {fichasOrdenadas.map((ficha) => (
              <FichaExpansivel
                key={ficha.id}
                ficha={ficha}
                exerciciosCatalogo={exercicios}
                expandida={fichaExpandidaId === ficha.id}
                aoAlternar={() =>
                  setFichaExpandidaId((atual) => (atual === ficha.id ? null : ficha.id))
                }
                aoIniciarTreino={(fichaId) => aoNavegar("execucao", { fichaId })}
                aoEditar={(fichaId) =>
                  aoNavegar("editarFicha", { id: fichaId, programaId: programa.id })
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-superficie border border-borda px-4 py-8 text-center">
            <p className="text-sm text-texto-sutil">
              Nenhuma ficha adicionada ao programa ainda.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
