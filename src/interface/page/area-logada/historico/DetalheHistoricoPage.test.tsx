import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Ficha, RegistroTreino } from "@/domain/tipos";
import { DetalheHistoricoPage } from "./DetalheHistoricoPage";

vi.mock("@/interface/page/area-logada/execucao/OverlayFinalizado", () => ({
  OverlayCompartilharTreino: ({ aberto, registro }: { aberto: boolean; registro: RegistroTreino }) =>
    aberto ? <div data-testid="editor-compartilhamento">{registro.id}</div> : null,
}));

const registro: RegistroTreino = {
  id: "registro-1",
  fichaId: "ficha-1",
  data: "2026-07-20T10:00:00Z",
  iniciadoEm: "2026-07-20T10:00:00Z",
  finalizadoEm: "2026-07-20T11:00:00Z",
  exercicios: [],
  cardio: [],
};

const ficha: Ficha = {
  id: "ficha-1",
  nome: "Treino A",
  descricao: "",
  icone: "halter",
  itens: [],
};

describe("DetalheHistoricoPage", () => {
  it("abre o compartilhamento para o registro exibido", async () => {
    const user = userEvent.setup();
    render(
      <DetalheHistoricoPage
        registroId={registro.id}
        fichas={[ficha]}
        historico={[registro]}
        exercicios={[]}
        aoNavegar={vi.fn()}
        aoVoltar={vi.fn()}
      />
    );

    expect(screen.queryByTestId("editor-compartilhamento")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Compartilhar resultado" }));

    expect(screen.getByTestId("editor-compartilhamento")).toHaveTextContent(registro.id);
  });
});
