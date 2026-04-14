import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { ItemHistorico } from "@/interface/widget/historico/ItemHistorico";
import { EstadoVazio } from "@/interface/widget/EstadoVazio";
import { Icone } from "@/interface/widget/svg/Icone";

interface PropriedadesHistoricoPage {
  fichas: Ficha[];
  historico: RegistroTreino[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
  aoVoltar: () => void;
}

export function HistoricoPage({
  fichas,
  historico,
  aoNavegar,
  aoVoltar,
}: PropriedadesHistoricoPage) {
  // Ordenar histórico por data (mais recente primeiro)
  const historicoOrdenado = [...historico].sort(
    (a, b) => new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime()
  );

  return (
    <div className="px-5 py-4">
      {/* Info section - header do CabecalhoApp já tem o botão voltar */}
      <div className="mb-6">
        <p className="text-sm text-texto-sutil">
          {historico.length} {historico.length === 1 ? "treino registrado" : "treinos registrados"}
        </p>
      </div>

      {/* Lista de histórico */}
      {historicoOrdenado.length > 0 ? (
        <div className="space-y-2">
          {historicoOrdenado.map((registro) => {
            const ficha = fichas.find((f) => f.id === registro.fichaId);
            return (
              <ItemHistorico
                key={registro.id}
                registro={registro}
                ficha={ficha}
                aoClicar={(registroId) => aoNavegar("detalheHistorico", { registroId })}
              />
            );
          })}
        </div>
      ) : (
        <EstadoVazio
          icone="listaVerificacao"
          titulo="Nenhum treino registrado"
          descricao="Seus treinos concluídos aparecerão aqui."
          acao={
            <button
              onClick={aoVoltar}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-acento text-texto-invertido text-sm font-medium hover:bg-acento-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento transition-all duration-150"
            >
              <Icone nome="reproduzir" tamanho={16} />
              Começar a Treinar
            </button>
          }
        />
      )}
    </div>
  );
}
