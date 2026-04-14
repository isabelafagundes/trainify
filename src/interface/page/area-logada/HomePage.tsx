import type { Ficha, Programa, RegistroTreino } from "@/domain/tipos";
import { exerciciosPadrao } from "@/infrastructure/repo/mock/exercicio-mock.repo";
import { dadosFrequencia } from "@/infrastructure/repo/mock/dados-mock.repo";
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

function ultimoTreinoDaFicha(fichaId: string, historico: RegistroTreino[]): string | null {
  const registro = historico.find((r) => r.fichaId === fichaId);
  return registro?.iniciadoEm ?? null;
}

export function HomePage({
  programas,
  fichas,
  historico,
  aoNavegar,
}: PropriedadesHomePage) {
  const programaAtivo = programas.find((p) => p.ativo) ?? null;

  // Fichas do programa ativo
  const fichasDoPrograma = programaAtivo
    ? fichas.filter((f) => programaAtivo.fichaIds.includes(f.id))
    : [];

  // Fichas treinadas esta semana
  const fichasTreinadasSemana = (() => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0=dom
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaSemana);
    inicioSemana.setHours(0, 0, 0, 0);

    const ids = new Set<string>();
    for (const reg of historico) {
      const data = new Date(reg.iniciadoEm);
      if (data >= inicioSemana && fichasDoPrograma.some((f) => f.id === reg.fichaId)) {
        ids.add(reg.fichaId);
      }
    }
    return ids;
  })();

  // Determina a próxima ficha: nunca treinada ou treinada há mais tempo
  const proximaFichaId = programaAtivo
    ? fichasDoPrograma.reduce<string | null>((melhorId, ficha) => {
        const ultimo = ultimoTreinoDaFicha(ficha.id, historico);
        if (!ultimo) return ficha.id;
        if (!melhorId) return ficha.id;
        const melhorUltimo = ultimoTreinoDaFicha(melhorId, historico);
        if (!melhorUltimo) return melhorId;
        return ultimo < melhorUltimo ? ficha.id : melhorId;
      }, null)
    : null;

  // Reordenar fichas: próxima ficha sempre no topo
  const fichasOrdenadas = programaAtivo
    ? [...fichasDoPrograma].sort((a, b) => {
        if (a.id === proximaFichaId) return -1;
        if (b.id === proximaFichaId) return 1;
        return 0;
      })
    : [];

  return (
    <div className="px-4 py-4 space-y-5">
      {/* ── Resumo semanal (sutil) ── */}
      {programaAtivo && (
        <section>
          <StripSemanal dados={dadosFrequencia} />
        </section>
      )}

      {/* ── Programa ativo (integrado) ── */}
      {programaAtivo ? (
        <section className="rounded-2xl overflow-hidden bg-superficie shadow-sm">
          {/* Banner header — integrado com borda */}
          <div className="px-4 py-5 border-b border-borda-suave">
            <BannerPrograma
              nome={programaAtivo.nome}
              descricao={programaAtivo.descricao}
              totalFichas={fichasDoPrograma.length}
              fichasConcluidas={fichasTreinadasSemana.size}
            />
          </div>

          {/* Fichas — sempre visíveis, ordenadas */}
          {fichasOrdenadas.length > 0 ? (
            fichasOrdenadas.map((ficha, i) => (
              <div
                key={ficha.id}
                className={
                  i < fichasOrdenadas.length - 1
                    ? "border-b border-borda-suave"
                    : ""
                }
              >
                <LinhaFicha
                  ficha={ficha}
                  exerciciosCatalogo={exerciciosPadrao}
                  ultimoTreino={ultimoTreinoDaFicha(ficha.id, historico)}
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
        <section>
          <EstadoVazio
            icone="halter"
            titulo="Comece sua jornada 💪"
            descricao="Organize seus treinos, acompanhe seu progresso e mantenha a constância."
            acao={
              <Botao
                variante="primario"
                icone={<Icone nome="mais" tamanho={16} />}
                onClick={() => aoNavegar("gerenciar")}
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
