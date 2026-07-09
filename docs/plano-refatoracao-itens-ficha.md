# Plano — Ficha como sequência ordenada de itens (cardio deixa de ser modo)

> Pré-requisito do redesign da tela de execução (aprovado em canvas, sessão de
> 07/07/2026). **Esta sessão NÃO mexe no visual da tela de execução** — só no
> modelo de dados, wizard e no mínimo necessário pra tudo continuar funcionando.
> O redesign da execução acontece numa sessão seguinte, sobre este resultado.

## Decisão de produto

Hoje o treino tem três modalidades (`musculacao` | `cardio` | `ambos`) e a
execução alterna entre "modo musculação" e "modo cardio". Decidimos **eliminar
o conceito de modo**: a ficha passa a ser uma **lista única e ordenada de
itens**, onde cada item é um exercício de força OU uma atividade de cardio
(Esteira e Bike viram dois itens independentes, não um bloco "cardio"). O
usuário define a ordem no wizard — cardio como aquecimento, no meio ou como
finalizador.

## Modelo atual (onde está)

- `src/domain/tipos.ts:138` — `Ficha { modalidade, exercicios: ExercicioFicha[], cardio: EntradaCardio[] }`
- `src/domain/tipos.ts:33` — `ModalidadeTreino = "musculacao" | "cardio" | "ambos"`
- `src/domain/tipos.ts:14` — `ExercicioFicha` (exercicioId, series, repeticoes, usaCarga, descansoSegundos)
- `src/domain/tipos.ts:121` — `EntradaCardio` (id, tipo, duracaoMinutos, nota, métricas opcionais)
- Usam `modalidade` (grep): `EditorFichaPage.tsx`, `trainify.state.ts` (+test),
  `useSessaoTreino.ts`, `snapshot.service.test.ts`, `dados-mock.repo.ts`
- Wizard: `src/interface/page/area-logada/gerenciar/EditorFichaPage.tsx` —
  4 etapas (`modalidade | info | exercicios | cardio`), drag-and-drop já existe
  pra reordenar exercícios (dnd-kit)
- Persistência: state manager (`src/application/state/trainify.state.ts` +
  `src/infrastructure/repo/state/state-manager.repo.ts`), snapshot
  (`src/application/snapshot/snapshot.service.ts` + test), sessão ativa
  (`src/application/state/sessao-ativa.ts`)

## Modelo alvo

Lista única com união discriminada:

```ts
// domain/tipos.ts
export type ItemFicha =
  | ({ tipo: "exercicio" } & ExercicioFicha)
  | ({ tipo: "cardio" } & EntradaCardio);

export interface Ficha {
  id: string;
  nome: string;
  descricao: string;
  icone: NomeIcone;
  emoji?: string;
  itens: ItemFicha[];   // substitui exercicios + cardio + modalidade
}
```

- **Remover** `modalidade` e `ModalidadeTreino` (a "modalidade" passa a ser
  derivada da composição dos itens, se alguma tela precisar de badge).
- Criar helpers de derivação em `domain/` pra suavizar call-sites:
  `exerciciosDaFicha(ficha)`, `cardioDaFicha(ficha)`, `temCardio(ficha)`,
  `temMusculacao(ficha)`.
- `RegistroTreino` (histórico) **não muda** — continua com `exercicios` e
  `cardio` separados no registro.

## Etapas

1. **Domínio** (`src/domain/tipos.ts`): tipo `ItemFicha`, `Ficha.itens`,
   remoção de `modalidade`/`ModalidadeTreino`, helpers de derivação.
2. **Migração de dados persistidos**: fichas salvas no formato antigo precisam
   virar `itens = [...exercicios, ...cardio]` (exercícios primeiro, cardio no
   fim — espelha o fluxo atual, que fazia musculação → cardio). Verificar como
   o snapshot versiona (`snapshot.service.ts`) e onde o estado é hidratado
   (`trainify.state.ts` / `state-manager.repo.ts`); aplicar a conversão na
   leitura de dados antigos. A sessão ativa salva (`sessao-ativa.ts`) pode ser
   simplesmente descartada se incompatível (é um snapshot transitório).
3. **Repos e estado**: `dados-mock.repo.ts` (dados de exemplo no formato novo),
   `trainify.state.ts` + `trainify.state.test.ts`, snapshot + test.
4. **Wizard/editor** (`EditorFichaPage.tsx`): remover a etapa de modalidade;
   etapas viram `info → itens`. A etapa de itens é UMA lista reordenável
   (dnd-kit já está lá) misturando exercícios e cardio, com duas ações de
   adicionar ("+ exercício" abre o seletor atual; "+ cardio" abre o form de
   cardio atual). Validação: ficha precisa de ≥ 1 item.
5. **Telas que leem `exercicios`/`cardio`/`modalidade` da ficha** (home,
   GerenciarPage, estatísticas, etc. — mapear por grep): trocar por helpers.
6. **Execução (mínimo, sem redesign)**: `useSessaoTreino.ts` e
   `ExecucaoTreinoPage.tsx` devem continuar funcionando derivando
   `exercicios`/`cardio` dos itens via helpers, mantendo o comportamento atual
   de modo. Não redesenhar nada visual aqui.
7. **Testes**: atualizar os existentes, rodar a suíte completa e o build
   (scripts do `package.json`).

## Critérios de aceite

- [ ] `Ficha` não tem mais `modalidade`, `exercicios`, `cardio` — só `itens` ordenados.
- [ ] Wizard cria/edita ficha com itens de força e cardio intercalados em qualquer ordem.
- [ ] Fichas antigas (persistidas) abrem sem erro, com cardio no fim da sequência.
- [ ] Execução de treino continua funcionando como hoje (sem mudança visual).
- [ ] Histórico/registros antigos continuam legíveis.
- [ ] Suíte de testes e build passando.

## Depois desta sessão

Voltar à sessão do redesign da execução: implementar a tela nova (canvas em
`tmp/repensar-tela/execucao-treino`, artboards "3+ · Página de exercício",
"3+ · Página de cardio (ficha mista)" e "3+ · Ficha só de cardio"), que pagina
diretamente sobre `ficha.itens`.
