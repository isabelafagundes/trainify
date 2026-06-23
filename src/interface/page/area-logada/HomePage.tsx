import { useMemo } from "react";
import type { Ficha, Programa, RegistroTreino } from "@/domain/tipos";
import { exerciciosPadrao } from "@/infrastructure/repo/mock/exercicio-mock.repo";
import { construirDadosFrequencia } from "@/interface/page/area-logada/estatisticas/utils";
import {
  obterFichasDoPrograma,
  obterFichasTreinadasNaSemana,
  obterProximaFichaId,
  obterUltimoTreinoDaFicha,
  ordenarFichasComProximaPrimeiro,
} from "@/interface/page/area-logada/programa/utils";
import { BannerPrograma } from "@/interface/widget/programa/BannerPrograma";
import { LinhaFicha } from "@/interface/widget/ficha/LinhaFicha";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { Botao } from "@/interface/widget/botao/Botao";
import { Icone } from "@/interface/widget/svg/Icone";
import { StripSemanal } from "@/interface/widget/calendario/StripSemanal";

interface PropriedadesHomePage {
  programas: Programa[];
  fichas: Ficha[];
  historico: RegistroTreino[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}

export function HomePage({
  programas,
  fichas,
  historico,
  aoNavegar,
}: PropriedadesHomePage) {
  const programaAtivo = programas.find((p) => p.ativo) ?? null;

  // Frequência derivada do histórico real (mesma fonte da tela de Estatísticas),
  // para que o streak da home fique consistente com as estatísticas.
  const dadosFrequencia = useMemo(
    () => construirDadosFrequencia(historico),
    [historico],
  );

  const fichasDoPrograma = programaAtivo
    ? obterFichasDoPrograma(programaAtivo, fichas)
    : [];

  const fichasTreinadasSemana = obterFichasTreinadasNaSemana(fichasDoPrograma, historico);
  const proximaFichaId = obterProximaFichaId(fichasDoPrograma, historico);
  const fichasOrdenadas = ordenarFichasComProximaPrimeiro(fichasDoPrograma, proximaFichaId);

  return (
    <div className="px-4 py-4 space-y-5">
      {/* ── Resumo semanal (sutil) ── */}
      {programaAtivo && (
        <section className="reveal-up">
          <StripSemanal
            dados={dadosFrequencia}
            aoAbrirDetalhe={() => aoNavegar("detalheSequencia")}
          />
        </section>
      )}

      {/* ── Programa ativo (integrado) ── */}
      {programaAtivo ? (
        <section className="rounded-2xl overflow-hidden bg-superficie shadow-sm">
          {/* Banner header — abre o resumo do programa em tela cheia */}
          <button
            type="button"
            onClick={() => aoNavegar("resumoPrograma", { id: programaAtivo.id })}
            aria-label={`Ver resumo de ${programaAtivo.nome}`}
            className="w-full flex items-center gap-3 px-4 py-5 border-b border-borda-suave text-left transition-colors duration-200 hover:bg-superficie-suave active:bg-superficie-suave/70 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acento reveal-up"
            style={{ animationDelay: "90ms" }}
          >
            <BannerPrograma
              nome={programaAtivo.nome}
              descricao={programaAtivo.descricao}
              totalFichas={fichasDoPrograma.length}
              fichasConcluidas={fichasTreinadasSemana.size}
            />
            <span className="flex-shrink-0 self-center text-texto-sutil" aria-hidden="true">
              <Icone nome="setaDireita" tamanho={18} />
            </span>
          </button>

          {/* Fichas — sempre visíveis, ordenadas */}
          {fichasOrdenadas.length > 0 ? (
            fichasOrdenadas.map((ficha, i) => (
              <div
                key={ficha.id}
                className={`reveal-up ${
                  i < fichasOrdenadas.length - 1
                    ? "border-b border-borda-suave"
                    : ""
                }`}
                style={{ animationDelay: `${150 + i * 70}ms` }}
              >
                <LinhaFicha
                  ficha={ficha}
                  exerciciosCatalogo={exerciciosPadrao}
                  ultimoTreino={obterUltimoTreinoDaFicha(ficha.id, historico)}
                  proximoTreino={ficha.id === proximaFichaId}
                  aoIniciarTreino={(fichaId) =>
                    aoNavegar("execucao", { fichaId })
                  }
                />
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-texto-sutil">
                Nenhuma ficha adicionada ao programa ainda.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="reveal-up">
          <EstadoVazio
            icone="halter"
            titulo="Comece sua jornada 💪"
            descricao="Organize seus treinos, acompanhe seu progresso e mantenha a constância."
            acao={
              <Botao
                variante="primario"
                icone={<Icone nome="mais" tamanho={16} />}
                onClick={() => aoNavegar("criarPrograma")}
              >
                Criar primeiro programa
              </Botao>
            }
          />
        </section>
      )}
    </div>
  );
}
