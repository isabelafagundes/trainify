# Plano — Tela de Estatísticas

## Contexto

A especificação funcional **não define uma tela "Estatísticas" dedicada**. A aba existe hoje como placeholder "em breve" em `src/App.tsx` (linha ~128). Os elementos relacionados a métricas que a spec cobre são:

- **RN22:** histórico na Home (10 mais recentes)
- **RN23:** progressão na execução (últimos 5 registros do exercício atual)
- **RN24:** gráfico de progressão por exercício (até 10 sessões, carga máxima e reps máximas por sessão)

Este plano deriva a tela das primitivas já presentes na spec, **sem inventar funcionalidades fora do escopo**, reutilizando widgets já existentes (`TrackerFrequencia`, `StreakCounter`, `OverlayGraficoProgressao`).

## Estado atual

- `src/interface/widget/calendario/TrackerFrequencia.tsx` — visualização de frequência (estilo GitHub heatmap) já implementada.
- `src/interface/widget/calendario/StripSemanal.tsx` — strip de dias da semana.
- `src/interface/widget/streak/StreakCounter.tsx` — contador de streak.
- `src/interface/page/area-logada/execucao/OverlayGraficoProgressao.tsx` — gráfico de progressão por exercício (atualmente acoplado à execução).
- `dadosFrequencia` / `DadosFrequencia` já modelados em `src/domain/tipos.ts`.

## Escopo proposto

### 1. Nova `EstatisticasPage`
Arquivo: `src/interface/page/area-logada/estatisticas/EstatisticasPage.tsx`

**Estrutura (mobile-first, max-w 480):**

```
┌─────────────────────────────────────┐
│ Resumo                              │
│ ┌─────────────┐ ┌─────────────┐    │
│ │   Treinos   │ │   Streak    │    │
│ │   este mês  │ │   atual     │    │
│ │     12      │ │   5 dias    │    │
│ └─────────────┘ └─────────────┘    │
│                                     │
│ Frequência                          │
│ [ TrackerFrequencia — últimos 90d ] │
│                                     │
│ Progressão por Exercício            │
│ ┌─────────────────────────────────┐ │
│ │ Supino Reto          [Ver]     │ │
│ │ Última carga: 42,5 kg          │ │
│ │ 8 sessões registradas           │ │
│ ├─────────────────────────────────┤ │
│ │ Agachamento         [Ver]      │ │
│ │ Última carga: 60 kg            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Seções:**

1. **Resumo (2 cards)**
   - Treinos no mês atual (derivado de `historico` filtrado por mês corrente)
   - Streak atual (dias consecutivos com treino) — reaproveitar `StreakCounter`

2. **Frequência**
   - `TrackerFrequencia` mostrando últimos 90 dias
   - Construir `DadosFrequencia` a partir de `historico` agrupado por `data`

3. **Progressão por Exercício**
   - Lista de exercícios que aparecem no histórico, ordenada por mais recente
   - Cada item: nome do exercício, última carga máx registrada, nº de sessões
   - Clique → navega para `graficoProgressao` (mesma rota usada pelo Detalhe do Histórico — ver `docs/plano-tela-historico.md`)
   - **Conforme RN24**, o gráfico exibe até 10 sessões com carga máx e reps máx.

**Props:**

```ts
{
  historico: RegistroTreino[];
  exercicios: Exercicio[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}
```

**Estado vazio:**
- Se `historico.length === 0`: usar `EstadoVazio` com CTA "Começar a Treinar" (volta para aba Treinos)

### 2. Componentes auxiliares novos

- `CardMetricaResumo` — bloco visual com label + valor grande + (opcional) ícone
- `ItemProgressaoExercicio` — linha clicável com nome, última carga, contagem de sessões
- (Reutilizar) `TrackerFrequencia`, `StreakCounter`, `EstadoVazio`

### 3. Helpers (`src/interface/page/area-logada/estatisticas/utils.ts`)

- `calcularTreinosNoMes(historico, dataReferencia)` → number
- `calcularStreakAtual(historico, hoje)` → number
- `construirDadosFrequencia(historico, diasJanela)` → `DadosFrequencia`
- `agregarProgressaoPorExercicio(historico, exercicios)` → `Array<{ exercicioId, nome, ultimaCarga, totalSessoes, ultimaData }>`
- `obterCargaMaximaPorSessao(historico, exercicioId)` → série usada no gráfico (até 10 sessões)

### 4. Wiring em `App.tsx`

Substituir o placeholder atual:

```tsx
) : abaAtiva === "estatisticas" ? (
  <div className="px-5 py-8 text-center text-texto-sutil text-sm">
    Estatísticas — em breve.
  </div>
)
```

Por:

```tsx
) : abaAtiva === "estatisticas" ? (
  <EstatisticasPage
    historico={historico}
    exercicios={/* obter via stateManagerRepository */}
    aoNavegar={aoNavegar}
  />
)
```

E adicionar a rota `graficoProgressao` (compartilhada com o detalhe do histórico — ver plano de histórico).

## O que **não** entra neste plano (fora da spec)

- Volume total (kg×reps) por semana/mês — não está na spec.
- Records pessoais (PRs) destacados — não está na spec.
- Comparação entre programas — não está na spec.
- Métricas de cardio (km, calorias) — a spec só registra duração e nota.

Se a usuária quiser qualquer um desses, vira escopo adicional explícito.

## Ordem de execução sugerida

1. Criar helpers em `utils.ts` + testes manuais com dados mock
2. Criar `CardMetricaResumo` e `ItemProgressaoExercicio`
3. Montar `EstatisticasPage` integrando widgets existentes
4. Wiring no `App.tsx` (substituir placeholder)
5. Conectar navegação ao `graficoProgressao` (depende do plano de histórico)

## Perguntas antes de implementar

1. **Janela do heatmap de frequência:** 90 dias, 6 meses ou 1 ano?
2. **Ordenação da lista de progressão:** por exercício mais recente, ou por nº de sessões (mais frequente primeiro)?
3. **Streak:** conta dias com qualquer treino, ou exige cumprir a frequência do programa ativo?
4. Manter o escopo enxuto (só o que a spec embasa) ou já incluir alguma métrica extra (ex: volume total)?
