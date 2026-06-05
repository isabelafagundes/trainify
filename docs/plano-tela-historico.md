# Plano — Tela de Histórico

## Estado atual
- `src/interface/page/area-logada/HistoricoPage.tsx` — listagem funcional, ordenada por data desc, com empty state. Já clicável.
- `src/interface/widget/historico/ItemHistorico.tsx` — card com ícone da ficha, nome, data, duração, nº exercícios, badge cardio.
- Clique em item dispara `aoNavegar("detalheHistorico", { registroId })` — **mas a rota não está implementada em `src/App.tsx` (linhas 104-152)**.
- `OverlayGraficoProgressao` existe dentro de `src/interface/page/area-logada/execucao/` (atualmente usado só durante o treino).

## Escopo proposto (3 entregas)

### 1. Melhorias na listagem `HistoricoPage` (pequeno)
Conforme `docs/especificacao-funcional.md` §2.6 a lista já atende. Sugestões opcionais:
- **Agrupar por mês** (cabeçalho sticky "Maio 2026", "Abril 2026") — visual Notion-like.
- **Resumo no topo:** total de treinos no mês atual + streak (se já existe `StreakCounter`).
- *Sem* filtros por ficha nesta iteração (manter simples).

### 2. Nova tela `DetalheHistoricoPage` (principal)
Arquivo: `src/interface/page/area-logada/historico/DetalheHistoricoPage.tsx`

**Conteúdo (conforme spec §2.6):**
- Cabeçalho com ícone/emoji da ficha + nome (ou "Ficha removida")
- Bloco de metadados: data, início → fim, duração total
- Para cada exercício: nome, link "Ver gráfico", tabela série/reps/carga, nota (se houver)
- Seção cardio (condicional): tipo, duração, nota
- Estado vazio se exercícios sem séries registradas

**Props:**
```ts
{
  registroId: string;
  fichas: Ficha[];
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
  aoVoltar: () => void;
}
```

**Componentes auxiliares novos:**
- `BlocoExercicioHistorico` (cabeçalho + tabela de séries + nota)
- `TabelaSeries` reutilizável (série/reps/carga, `tabular-nums`)
- `BlocoCardioHistorico`

### 3. Conectar gráfico de progressão
- Extrair `OverlayGraficoProgressao` para componente reutilizável fora de `execucao/`, ou criar nova `GraficoProgressaoPage` que o envolve.
- Acessível via "Ver gráfico" no detalhe → `aoNavegar("graficoProgressao", { exercicioId, voltarPara: "detalheHistorico", registroId })`
- Reaproveitar lógica de `voltarPara` já presente em `src/App.tsx` (linhas 56-63).

### 4. Wiring em `App.tsx`
- Adicionar `telaAtual === "detalheHistorico"` → renderiza `DetalheHistoricoPage`
- Adicionar `telaAtual === "graficoProgressao"` → renderiza tela de gráfico
- Esconder `NavegacaoInferior` nessas telas? **Sugiro manter visível** no detalhe (é navegação consultiva), e esconder só no gráfico (overlay-like).

## Ordem de execução sugerida
1. Criar `DetalheHistoricoPage` + componentes auxiliares + wiring no App
2. Refatorar `OverlayGraficoProgressao` para componente compartilhado + criar rota `graficoProgressao`
3. (Opcional) Agrupamento por mês em `HistoricoPage`

## Perguntas antes de implementar
1. Quer agrupamento por mês na listagem agora, ou deixa para depois?
2. No detalhe, "Ver gráfico" deve ser uma **página dedicada** ou um **overlay/modal** sobre o detalhe (como já é na execução)?
3. Permitir **excluir** um registro do histórico a partir do detalhe? (não está na spec, mas é útil)
