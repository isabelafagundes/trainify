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
import { CartaoProximoTreino } from "@/interface/widget/programa/CartaoProximoTreino";
import { FaixaMetricas } from "@/interface/widget/programa/FaixaMetricas";
import { FichaExpansivel } from "@/interface/widget/ficha/FichaExpansivel";
import {
  contarTreinosDoPrograma,
  formatarDataRelativa,
  obterFichasDoPrograma,
  obterFichasTreinadasNaSemana,
  obterProximaFichaId,
  obterUltimoTreinoDoPrograma,
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
    const proxima =
      fichasDoPrograma.find((f) => f.id === proximaFichaId) ?? fichasDoPrograma[0] ?? null;
    const outras = proxima
      ? fichasDoPrograma.filter((f) => f.id !== proxima.id)
      : fichasDoPrograma;
    return {
      fichasDoPrograma,
      proxima,
      outras,
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
    proxima,
    outras,
    treinadasSemana,
    totalTreinos,
    ultimoTreino,
  } = dados;

  function tornarAtivo() {
    stateManagerRepository.atualizarPrograma(programa!.id, { ativo: true });
  }

  const cabecalho = (
    <header className="reveal-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold leading-tight text-texto-primario">
            {programa.nome}
          </h2>
          <div className="mt-1.5 flex items-center gap-2 text-[13px] text-texto-secundario">
            {programa.ativo ? (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-grafico-forte" />
                Programa ativo
              </span>
            ) : (
              <span className="text-texto-sutil">Inativo</span>
            )}
            <span className="text-texto-sutil/50">·</span>
            <span>
              {fichasDoPrograma.length} ficha{fichasDoPrograma.length !== 1 ? "s" : ""}
            </span>
          </div>
          {programa.descricao && (
            <p className="mt-2 text-sm leading-snug text-texto-secundario">
              {programa.descricao}
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {!programa.ativo && (
            <Botao variante="secundario" tamanho="compacto" onClick={tornarAtivo}>
              Tornar ativo
            </Botao>
          )}
          <Botao
            variante="secundario"
            tamanho="compacto"
            icone={<Icone nome="editar" tamanho={14} />}
            onClick={() => aoNavegar("editarPrograma", { id: programa.id })}
          >
            Editar
          </Botao>
        </div>
      </div>
    </header>
  );

  // Sem fichas: só o cabeçalho + estado vazio.
  if (fichasDoPrograma.length === 0) {
    return (
      <div className="w-full max-w-[768px] space-y-5 px-4 py-4">
        {cabecalho}
        <div
          className="reveal-up rounded-2xl border border-borda bg-superficie px-4 py-10 text-center"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-sm text-texto-sutil">
            Nenhuma ficha adicionada ao programa ainda.
          </p>
        </div>
      </div>
    );
  }

  // Duas colunas (desktop) só fazem sentido quando há fichas além da próxima.
  const duasColunas = outras.length > 0;

  const colunaAcao = (
    <div className="space-y-5">
      {cabecalho}
      <div className="reveal-up" style={{ animationDelay: "60ms" }}>
        <FaixaMetricas
          totalTreinos={totalTreinos}
          ultimoTreinoLabel={ultimoTreino ? formatarDataRelativa(ultimoTreino) : "—"}
          treinadasSemana={treinadasSemana.size}
          meta={fichasDoPrograma.length}
        />
      </div>
      {proxima && (
        <div className="reveal-up" style={{ animationDelay: "120ms" }}>
          <CartaoProximoTreino
            ficha={proxima}
            exerciciosCatalogo={exercicios}
            aoIniciar={(fichaId) => aoNavegar("execucao", { fichaId })}
            aoEditar={(fichaId) =>
              aoNavegar("editarFicha", { id: fichaId, programaId: programa.id })
            }
          />
        </div>
      )}
    </div>
  );

  const biblioteca = duasColunas && (
    <section
      className="reveal-up mt-5 lg:mt-0"
      style={{ animationDelay: "180ms" }}
    >
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
        Outras fichas
      </h3>
      <div className="divide-y divide-borda-suave overflow-hidden rounded-2xl border border-borda bg-superficie">
        {outras.map((ficha) => (
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
    </section>
  );

  return (
    <div className="px-4 py-4">
      <div
        className={
          duasColunas
            ? "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-6"
            : "w-full max-w-[768px]"
        }
      >
        {colunaAcao}
        {biblioteca}
      </div>
    </div>
  );
}
