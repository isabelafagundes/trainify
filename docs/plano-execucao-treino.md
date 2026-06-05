# Plano — Tela de Execução de Treino

## 1. Direção de Design

**Conceito**: **"Foco cirúrgico"** — quando o usuário está executando, tudo que não é a série atual desaparece. Inspiração: cronômetro analógico de relojoaria, app de meditação, dashboards de cockpit minimalista. Não é "fitness hype" — é uma sala silenciosa onde só existe o trabalho.

**Princípio central**: A tela de execução é **fullscreen, sem cabeçalho global e sem barra de navegação inferior**. Isso é proposital: o usuário não pode acidentalmente sair do treino. Sair exige intenção (botão Cancelar explícito).

**Detalhe memorável**: A barra de progresso segmentada não é só visual — é o **mapa do treino**. Cada segmento muda de estado conforme o usuário avança (vazio → ativo pulsante → preenchido). Combinado com o nome do exercício em tipografia grande no topo, isso cria a sensação "estou na estação X de Y".

---

## 2. Estrutura da tela

A sessão tem dois **modos** alternáveis a qualquer instante:

- **Modo Musculação** — fluxo de exercícios (séries, timer, etc.)
- **Modo Cardio** — tela cheia dedicada às atividades cardio da ficha

O usuário troca de modo via toggle persistente no header. Ao voltar para musculação, retorna **exatamente no exercício e série em que parou**. Atende RN20.

### 2.1. Modo Musculação

```
┌─────────────────────────────────────┐
│ ←  Treino A          [🏃 Cardio] [✕]│  ← header fino, sticky
│ ▰▰▰▰▱▱▱▱  3 / 6                   │  ← progresso segmentado
├─────────────────────────────────────┤
│                                     │
│  Supino Reto                        │  ← H1 display, grande
│  Peito · 3×12 · 60s descanso       │  ← meta, sutil
│                                     │
│  ┌─ Séries ──────────────────────┐ │
│  │  1   12 reps    40 kg    ✓   │ │  ← série concluída
│  │  2   12 reps    40 kg    ✓   │ │
│  │  3  [12]       [42.5]    ▶   │ │  ← série ativa (highlight)
│  │  + adicionar série            │ │
│  └────────────────────────────────┘ │
│                                     │
│  [📝 nota deste exercício...]      │
│                                     │
│  ⌃ Progressão (últimas 5)          │  ← collapsable
│                                     │
├─────────────────────────────────────┤
│         ⏱  0:45                    │  ← timer footer sticky
├─────────────────────────────────────┤
│  [← anterior]   [próximo →]         │
│  ────────────────────────────────   │
│         ✓ finalizar treino          │  ← sempre presente, discreto
└─────────────────────────────────────┘
```

### 2.2. Modo Cardio

Se a ficha **não tem cardio configurado**, o toggle do header não aparece e o modo cardio nunca é acessível.

```
┌─────────────────────────────────────┐
│ ←  Treino A    [💪 Musculação] [✕] │
├─────────────────────────────────────┤
│                                     │
│  Cardio                             │
│  Atividades dessa ficha             │
│                                     │
│  ┌─ Esteira ─────────────────────┐ │
│  │  Duração     [25]  min        │ │
│  │  Nota  [6.5 km/h, incl. 3%  ] │ │
│  └────────────────────────────────┘ │
│  ┌─ Bike ────────────────────────┐ │
│  │  Duração     [15]  min        │ │
│  │  Nota  [zona 2              ] │ │
│  └────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│   [💪 Voltar à musculação]          │
│   [✓ Finalizar treino       ]       │
└─────────────────────────────────────┘
```

### 2.3. Decisões deliberadas

- **Sem card de progressão como tabela** — vira accordion fechado por padrão (RN23). Quando o usuário está executando, não precisa olhar histórico; quando precisa (decidir carga), expande.
- **Timer no footer sticky** — não compete com o card de séries. Aparece em destaque quando ativo, discreto quando parado.
- **Série ativa em destaque visual** — fundo levemente tingido (creme mais escuro), inputs prontos para foco. Séries concluídas ficam checadas, séries futuras translúcidas.
- **Cardio via header (toggle)** — não polui a UI principal. Substitui a tela em modo dedicado, não overlay.

---

## 3. Finalizar a qualquer momento

Distinção semântica:

- **✕ Cancelar (header)** = descarta sessão. Confirmação: "Descartar treino? Os dados serão perdidos."
- **✓ Finalizar treino** = **salva** o `RegistroTreino` com o que foi registrado até o momento

### 3.1. Onde "Finalizar" aparece

1. **Persistente no rodapé**, ao lado de Anterior/Próximo, em ambos os modos.
2. Em **modo cardio**, vira ação primária junto com "Voltar à musculação".
3. **No último exercício** de musculação, "próximo →" some e "finalizar treino" sobe para primário (preto quente, cheio). Antes disso, fica em estilo fantasma/secundário.

### 3.2. Confirmação inteligente

- **Sem lacunas** (séries registradas em todos exercícios visitados) → finaliza direto sem perguntar.
- **Com lacunas** (exercícios não visitados ou séries vazias) → bottom-sheet resumindo: *"3 de 6 exercícios registrados. Finalizar mesmo assim?"* com ações `Continuar treinando` / `Finalizar agora`.

---

## 4. Arquivos a criar

Pasta: `src/interface/page/area-logada/execucao/`

| Arquivo | Responsabilidade |
|---|---|
| `ExecucaoTreinoPage.tsx` | Container: estado da sessão, modos, navegação, finalização |
| `HeaderExecucao.tsx` | Header sticky: voltar, nome, toggle modo, cancelar |
| `BarraProgressoExercicios.tsx` | Barra segmentada clicável "X de Y" |
| `CardSeries.tsx` | Tabela de séries com inputs reps/carga, ✓, +série, remover série |
| `LinhaSerie.tsx` | Uma linha (controla estado pendente/ativa/concluída) |
| `NotaExercicio.tsx` | Textarea de nota |
| `AccordionProgressao.tsx` | Últimas 5 execuções deste exercício |
| `TimerDescanso.tsx` | Footer sticky com cronômetro regressivo |
| `NavegacaoExercicios.tsx` | Anterior/Próximo + slot Finalizar sempre visível |
| `PainelCardio.tsx` | Tela dedicada do modo cardio |
| `OverlayHistoricoSerie.tsx` | Bottom-sheet com séries anteriores clicáveis (RN25) |
| `OverlayConfirmarFinalizar.tsx` | Bottom-sheet de confirmação quando há lacunas |
| `OverlayConfirmarCancelar.tsx` | "Tem certeza?" antes de descartar |
| `OverlayGraficoProgressao.tsx` | Bottom-sheet com gráfico (stub no MVP) |
| `hooks/useSessaoTreino.ts` | Estado da sessão (modos, séries, cardio, navegação, finalização) |
| `hooks/useTimerDescanso.ts` | Cronômetro regressivo com play/pause/reset |

---

## 5. Estado da sessão (`useSessaoTreino`)

```ts
{
  ficha: Ficha,
  iniciadoEm: string,                      // ISO ao montar
  modo: "musculacao" | "cardio",
  indiceAtual: number,
  exercicios: Array<{
    exercicioId: string,
    series: RegistroSerie[],               // pre-populadas (RN15)
    nota: string,
    concluidas: Set<number>,
  }>,
  cardio: RegistroCardio[],                // pré-preenchido com cardio[] da ficha
  temCardio: boolean,

  // ações
  atualizarSerie, adicionarSerie, removerSerie,
  marcarConcluida, atualizarNota,
  irPara, anterior, proximo,
  preencherDoHistorico(indiceSerieAlvo),   // RN25
  alternarModo(),
  atualizarCardio(id, { duracaoMinutos?, nota? }),
  finalizar(): RegistroTreino,
  cancelar(),
  resumoFinalizacao(): {
    exerciciosRegistrados: number,
    exerciciosTotal: number,
    cardioPreenchido: number,
    cardioTotal: number,
    completo: boolean,
  }
}
```

---

## 6. Padrões visuais (alinhados com `.impeccable.md`)

- **Tipografia**: `Bricolage Grotesque` para o nome do exercício (clamp 28–40px, peso 600). `Figree` para reps/carga e meta. Números grandes em peso médio, não bold — leitura calma.
- **Cores**: superfície creme dominante; série ativa com fundo `oklch(95% 0.02 65)` (tingimento âmbar do brand); ✓ em preto quente; descanso ativo usa o âmbar como acento raro (10% rule).
- **Inputs numéricos**: sem spinners do browser, `inputMode="decimal"` em mobile. Largura ajustada ao conteúdo.
- **Sem bordas-laterais coloridas**, sem cards-dentro-de-cards, sem gradientes — apenas separadores horizontais finos onde necessário.
- **Movimento**: ✓ em série tem um pequeno fade+scale (200ms ease-out). Mudança de exercício faz slide horizontal sutil (transform, não width). Timer em descanso pulsa o número levemente a cada segundo.

---

## 7. Regras de negócio cobertas

| Regra | Cobertura |
|---|---|
| RN15 | Séries pré-preenchidas com reps da ficha e carga 0 |
| RN16 | `adicionarSerie` / `removerSerie` durante execução |
| RN17 | Coluna de carga só renderiza se `usaCarga` |
| RN18 | Timer usa `descansoSegundos` do exercício, play/pause/reset |
| RN19 | Nota salva em `ExerciseLog.nota` |
| RN20 | Modo cardio alternável a qualquer momento, sem perder estado de musculação |
| RN21 | Log com `iniciadoEm`/`finalizadoEm`, séries e cardio |
| RN23 | Accordion exibe últimos 5 registros do exercício atual |
| RN25 | Overlay com séries anteriores, preenche apenas a série alvo |

---

## 8. Religação no App

Restaurar em `src/App.tsx` o ramo fullscreen para `telaAtual === "execucao"` (sem `CabecalhoApp`, sem `NavegacaoInferior`).

---

## 9. Ordem de implementação

1. Hook `useSessaoTreino` (com `modo` e `cardio`) + `useTimerDescanso`
2. `ExecucaoTreinoPage` esqueleto com roteamento musculação ↔ cardio + religação no App
3. `HeaderExecucao` com toggle de modo
4. `CardSeries` + `LinhaSerie`
5. `NavegacaoExercicios` com slot Finalizar (sempre visível) + `OverlayConfirmarFinalizar`
6. `PainelCardio` (modo cardio completo)
7. `TimerDescanso` footer
8. `NotaExercicio`, `AccordionProgressao`
9. `OverlayConfirmarCancelar`
10. `OverlayHistoricoSerie`
11. `OverlayGraficoProgressao` (stub no MVP)
