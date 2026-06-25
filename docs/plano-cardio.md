# Plano — Modalidade de treino + registro de cardio por tipo

> Especificação para tornar o Trainify **não muscle-only**: escolher a modalidade
> (musculação · cardio · ambos) ao criar a ficha, e registrar métricas de cardio
> que variam conforme o tipo (km, tempo, passos, níveis, etc.) para alimentar progresso.
> **Este documento é só especificação — não implementa nada.**

## Por que

Hoje toda `Ficha` é estruturalmente "mista": tem `exercicios[]` e `cardio[]`, sem campo de
modalidade (`src/domain/tipos.ts:40`). A execução abre na musculação e o cardio é uma aba
secundária com "Voltar à musculação" (`src/interface/page/area-logada/execucao/PainelCardio.tsx:85`).
O app não é muscle-only por acaso — é **muscle-first por arquitetura**. Para quem só faz
cardio, isso é fricção em todo treino.

Além disso, o registro de cardio guarda apenas `duracaoMinutos` + `nota`
(`src/domain/tipos.ts:74`). Não há como visualizar progresso de distância, passos ou níveis —
justamente o que motiva quem treina cardio.

## Princípios que regem este plano

1. **Reaproveitar as telas existentes.** A modalidade **não cria telas novas**: ela controla
   a visibilidade/fluxo das telas que já existem (o wizard de `EditorFichaPage` e a
   `ExecucaoTreinoPage`, que já alterna modo musculação/cardio). Evita retrabalho de
   manutenção e múltiplas telas paralelas.
2. **Retrocompatível.** Campos novos são opcionais; fichas e registros antigos continuam
   válidos. Sem migração destrutiva — normalizar no carregamento do state.
3. **Config como fonte única.** Quais métricas cada tipo de cardio mostra vem da **definição
   do tipo** (built-in ou personalizado), lida tanto pelo editor quanto pela execução. Os
   tipos embutidos são apenas *seed*; o usuário pode criar os seus (ver C-6).
4. **Métrica derivada não se armazena.** Pace (min/km) e velocidade média (km/h) são
   calculados na exibição a partir de distância + tempo. Só se guarda o que o usuário mede.

---

## Modelo de dados (mudanças em `src/domain/tipos.ts`)

### Modalidade na ficha

```ts
export type ModalidadeTreino = "musculacao" | "cardio" | "ambos";

export interface Ficha {
  id: string;
  nome: string;
  descricao: string;
  icone: NomeIcone;
  emoji?: string;
  modalidade: ModalidadeTreino; // NOVO — dirige editor e execução
  exercicios: ExercicioFicha[];
  cardio: EntradaCardio[];
}
```

> **Migração (não destrutiva)**: tratar `modalidade` como opcional no tipo persistido e
> normalizar ao carregar (`trainify.state.ts`): só `cardio` preenchido → `"cardio"`; só
> `exercicios` → `"musculacao"`; senão → `"ambos"`. Fichas sem o campo recebem o valor
> derivado on-the-fly e passam a gravá-lo na próxima edição.

### Métricas de cardio por tipo (granularidade "rica")

```ts
export type ChaveMetricaCardio =
  | "duracaoMinutos"
  | "distanciaKm"      // remo: exibir em metros (× 1000); demais em km
  | "passos"
  | "niveis"           // andares/lances na Escada
  | "pulos"            // Pular Corda
  | "inclinacaoPct"    // Esteira
  | "resistencia"      // Bike / Elíptico (nível de carga)
  | "rpm"              // Bike / Elíptico
  | "ritmo500m"        // Remo (mm:ss por 500m) — guardar em segundos
  | "spm";             // Remo (remadas por minuto)

// SEED dos tipos embutidos (não mais a fonte única — ver "catálogo editável" abaixo).
// Campos PRINCIPAIS sempre visíveis; SECUNDÁRIOS sob "+ mais detalhes" (registro rápido)
export const CAMPOS_CARDIO: Record<
  TipoCardio,
  { principais: ChaveMetricaCardio[]; secundarios: ChaveMetricaCardio[] }
> = {
  Esteira:       { principais: ["duracaoMinutos", "distanciaKm"], secundarios: ["passos", "inclinacaoPct"] },
  Bike:          { principais: ["duracaoMinutos", "distanciaKm"], secundarios: ["resistencia", "rpm"] },
  "Elíptico":    { principais: ["duracaoMinutos", "distanciaKm"], secundarios: ["resistencia", "rpm"] },
  Remo:          { principais: ["duracaoMinutos", "distanciaKm"], secundarios: ["ritmo500m", "spm"] },
  Escada:        { principais: ["duracaoMinutos", "niveis"],      secundarios: ["passos"] },
  "Pular Corda": { principais: ["duracaoMinutos", "pulos"],       secundarios: [] },
};

// Metadados de exibição/entrada por métrica (rótulo, unidade, passo do stepper)
export const META_METRICA_CARDIO: Record<
  ChaveMetricaCardio,
  { rotulo: string; unidade: string; passo: number; derivada?: boolean }
> = {
  duracaoMinutos: { rotulo: "Duração",    unidade: "min",   passo: 1 },
  distanciaKm:    { rotulo: "Distância",  unidade: "km",    passo: 0.1 },
  passos:         { rotulo: "Passos",     unidade: "",      passo: 100 },
  niveis:         { rotulo: "Andares",    unidade: "",      passo: 1 },
  pulos:          { rotulo: "Pulos",      unidade: "",      passo: 10 },
  inclinacaoPct:  { rotulo: "Inclinação", unidade: "%",     passo: 0.5 },
  resistencia:    { rotulo: "Resistência",unidade: "nível", passo: 1 },
  rpm:            { rotulo: "RPM",         unidade: "rpm",   passo: 1 },
  ritmo500m:      { rotulo: "Ritmo /500m",unidade: "/500m", passo: 1 },
  spm:            { rotulo: "Remadas",    unidade: "spm",   passo: 1 },
};
```

### Tipos de cardio como catálogo editável (built-in + personalizado)

Espelha o que o app já faz com musculação (`exerciciosCustom: Exercicio[]` no state). Um
**tipo de cardio** passa a ser uma entrada de catálogo com nome, emoji e o conjunto de
métricas que exibe. Os embutidos são seedados a partir de `CAMPOS_CARDIO`; o usuário cria os
seus (C-6).

```ts
export interface TipoCardioDef {
  id: string;                     // built-in: "Esteira" (= valor atual); custom: uuid
  nome: string;                   // "Esteira", "Caminhada na praia"
  emoji?: string;                 // opcional — alinhado ao padrão de ícones das fichas
  metricas: ChaveMetricaCardio[]; // quais inputs exibir (escolhidos do conjunto FIXO)
  builtin: boolean;               // true = seedado; usuário pode customizar, não excluir
}
```

- **`DadosTreino` ganha `cardioCustom: TipoCardioDef[]`** (paralelo a `exerciciosCustom`).
- **`EntradaCardio.tipo` e `RegistroCardio.tipo` deixam de ser a union fechada `TipoCardio`
  e passam a `string`** (o `id` do tipo). **Retrocompatível**: os `id` dos built-ins são
  iguais aos valores atuais (`"Esteira"`, `"Bike"`…), então registros antigos resolvem sem
  migração. Custom recebem `uuid`.
- **Resolução**: painel/histórico resolvem `tipo` → `TipoCardioDef` (built-in seed + custom).
  Se um tipo custom for excluído, o log fica órfão — mesmo comportamento que já ocorre com
  `exercicioId` na musculação; resolver com fallback para o nome e **não** apagar histórico.
- **Decisão travada**: as métricas vêm do conjunto **fixo** `ChaveMetricaCardio` (switchers).
  Métrica de label/unidade 100% livre fica **fora de escopo** — quebraria os campos achatados
  tipados e a facilidade de gráfico; reavaliar como extensão futura com saco genérico.

`EntradaCardio` (pré-config na ficha) e `RegistroCardio` (log) ganham os mesmos campos
**opcionais**:

```ts
export interface EntradaCardio {
  id: string;
  tipo: TipoCardio;
  duracaoMinutos: number;
  nota: string;
  // NOVOS (opcionais) — valores-alvo/sugeridos
  distanciaKm?: number;
  passos?: number;
  niveis?: number;
  pulos?: number;
  inclinacaoPct?: number;
  resistencia?: number;
  rpm?: number;
  ritmo500m?: number; // segundos
  spm?: number;
}

export interface RegistroCardio {
  cardioId: string;
  tipo: TipoCardio;
  duracaoMinutos: number;
  nota: string;
  // NOVOS (opcionais) — o que foi efetivamente medido
  distanciaKm?: number;
  passos?: number;
  niveis?: number;
  pulos?: number;
  inclinacaoPct?: number;
  resistencia?: number;
  rpm?: number;
  ritmo500m?: number;
  spm?: number;
}
```

---

## Plano C-1 — Modalidade na criação da ficha (reaproveitando o wizard)

**Objetivo**: ao criar/editar ficha, escolher a modalidade primeiro; o wizard mostra só os
passos relevantes. Nenhuma tela nova.

### Mudanças (`src/interface/page/area-logada/gerenciar/EditorFichaPage.tsx`)

1. **Passo 0 — Info básica**: adicionar o seletor de modalidade (`BigSwitcher` já existente:
   `src/interface/widget/formulario/BigSwitcher.tsx`) com 3 opções: Musculação · Cardio · Ambos.
2. **Passos condicionais** a partir da modalidade:
   - `musculacao` → exibir só o passo de Exercícios; pular o de Cardio.
   - `cardio` → exibir só o passo de Cardio; pular o de Exercícios.
   - `ambos` → os dois passos (comportamento atual).
   - Ajustar a contagem/indicador de etapas do wizard dinamicamente.
3. **Persistir `modalidade`** no `adicionarFicha`/`atualizarFicha` (via
   `state-manager.repo.ts`). Ao trocar modalidade numa ficha que já tem dados, **não apagar**
   os arrays — apenas ocultar o passo (preservar para não destruir trabalho do usuário).

### Aceite C-1
- [ ] Modalidade é o primeiro campo ao criar ficha; default sensato (sugerir "ambos" ou último usado).
- [ ] Ficha "musculação" não mostra passo de cardio; "cardio" não mostra passo de exercícios.
- [ ] Editar ficha antiga (sem `modalidade`) abre com o valor derivado correto e grava ao salvar.
- [ ] Trocar modalidade não apaga `exercicios`/`cardio` já preenchidos.

---

## Plano C-2 — Execução guiada pela modalidade (mesma `ExecucaoTreinoPage`)

**Objetivo**: a execução abre no modo certo e esconde o que não se aplica — sem tela nova.

### Mudanças (`ExecucaoTreinoPage.tsx` + `hooks/useSessaoTreino.ts` + `PainelCardio.tsx`)

1. **Modo inicial pela modalidade**:
   - `musculacao` → abre na musculação, **sem** botão/aba de ir para cardio.
   - `cardio` → **abre direto no `PainelCardio`**, sem botão "Voltar à musculação"
     (`PainelCardio.tsx:85`); "Finalizar treino" continua.
   - `ambos` → comportamento atual (alterna os dois).
2. **`useSessaoTreino`**: ao montar, definir `modoInicial` a partir de `ficha.modalidade`;
   esconder ações de troca de modo quando a modalidade for única.
3. **`finalizar()`**: já filtra só o concluído — manter; garantir que registros de cardio
   carreguem os campos novos preenchidos.

### Aceite C-2
- [ ] Ficha "cardio" abre direto no painel de cardio, sem referência a musculação.
- [ ] Ficha "musculação" não oferece troca para cardio.
- [ ] Ficha "ambos" mantém a alternância atual.
- [ ] Recuperação de sessão ativa (segundo plano) continua funcionando nos 3 modos.

---

## Plano C-3 — Painel de cardio dinâmico por tipo

**Objetivo**: cada entrada de cardio mostra os campos do seu tipo, lidos de `CAMPOS_CARDIO`.

### Mudanças (`PainelCardio.tsx` + `useSessaoTreino.ts`)

1. **Renderização dinâmica**: por entrada, resolver `item.tipo` → `TipoCardioDef` (seed
   built-in + `cardioCustom`) e renderizar suas `metricas`. Para os built-ins, `CAMPOS_CARDIO`
   ainda separa `principais` (sempre visíveis) de `secundarios` (sob **"+ mais detalhes"**);
   tipos custom mostram as métricas escolhidas como principais (sem secundários, ou os
   primeiros N como principais). Mantém o registro rápido — alinha com "Respeito ao tempo".
   Usar `CampoNumerico` existente
   (`src/interface/widget/formulario/CampoNumerico.tsx`) com `passo`/`unidade` de
   `META_METRICA_CARDIO`.
2. **Ampliar o callback** `aoAtualizarCardio` para aceitar qualquer `ChaveMetricaCardio`
   (hoje só `duracaoMinutos | nota` — `PainelCardio.tsx:8-11`). Tipar como
   `Partial<Pick<RegistroCardio, ChaveMetricaCardio | "nota">>`.
3. **Pré-preencher campos `secundarios` numéricos** com o valor da `EntradaCardio` da ficha
   (alvo configurado) quando houver — ver C-5 para defaults do histórico.
4. **Formatação especial**: Remo exibe distância em metros; `ritmo500m` entra/exibe como
   `mm:ss` (guardar em segundos).

### Aceite C-3
- [ ] Esteira mostra Duração+Distância (principais) e Passos+Inclinação (secundários).
- [ ] Escada mostra Duração+Andares; Pular Corda mostra Duração+Pulos. Cada tipo só seus campos.
- [ ] "+ mais detalhes" expande/recolhe os secundários; registro rápido só com os principais.
- [ ] Campos numéricos respeitam `passo`/`unidade`; valores opcionais vazios não quebram o save.

---

## Plano C-4 — Histórico e progresso de cardio

**Objetivo**: aproveitar os dados salvos para visualização — o motivo de salvá-los.

### Mudanças
1. **Detalhe do histórico** (`historico/DetalheHistoricoPage.tsx`): exibir os campos novos de
   cada `RegistroCardio` (só os preenchidos), com unidades de `META_METRICA_CARDIO`. Mostrar
   **derivadas** (pace min/km, velocidade km/h) calculadas a partir de distância+tempo.
2. **Gráfico de progressão** (`historico/GraficoProgressaoPage.tsx`): hoje é por exercício de
   musculação; estender para cardio — escolher tipo + métrica (ex.: km na Esteira ao longo do
   tempo; pace caindo; total de andares na Escada por semana).
3. **Estatísticas** (`estatisticas/EstatisticasPage.tsx`): somatórios de cardio (km na semana,
   minutos de cardio, andares) e **recordes pessoais leves** (maior distância, semana com mais km).

### Aceite C-4
- [ ] Detalhe da sessão lista métricas de cardio com unidades e derivadas (pace/velocidade).
- [ ] Gráfico permite acompanhar uma métrica de cardio por tipo ao longo do tempo.
- [ ] Estatísticas incluem ao menos um agregado e um recorde de cardio.

---

## Plano C-5 — Registro rápido: defaults da última sessão (UX)

**Objetivo**: ao executar cardio, pré-preencher com os valores do último treino do mesmo
tipo/ficha. Registrar vira "ajustar", não "digitar do zero" — maior ganho de UX percebido.

### Mudanças (`useSessaoTreino.ts`)
1. Ao iniciar sessão, para cada `EntradaCardio`, buscar no `historico` o `RegistroCardio` mais
   recente do mesmo `tipo` (ou mesma ficha) e pré-preencher os campos numéricos.
2. Prioridade do default: valor-alvo da `EntradaCardio` (se definido na ficha) > último
   histórico > vazio.

### Aceite C-5
- [ ] Segunda execução de uma ficha de Esteira já vem com km/tempo da vez anterior.
- [ ] Usuário consegue ajustar livremente; campos sem histórico ficam vazios.

---

## Plano C-6 — Tipos de cardio personalizados (catálogo editável)

**Objetivo**: permitir que o usuário crie um "exercício de cardio" próprio — nome, emoji e
**quais métricas exibir** (lista de switchers sobre `ChaveMetricaCardio`) — e também
customize as métricas dos tipos embutidos. Espelha o catálogo de exercícios custom de
musculação.

### Mudanças

1. **Catálogo no state** (`trainify.state.ts` + `state-manager.repo.ts`): adicionar
   `cardioCustom: TipoCardioDef[]` a `DadosTreino`, com CRUD análogo a `exerciciosCustom`
   (`adicionarCardioCustom`/`atualizarCardioCustom`/`removerCardioCustom`). Built-ins ficam
   num seed constante (`CATALOGO_CARDIO_BUILTIN`) montado a partir de `CAMPOS_CARDIO`.
2. **Resolução central**: um helper `resolverTipoCardio(id)` que une seed + custom e devolve
   o `TipoCardioDef` (com fallback de nome para logs órfãos). Painel (C-3), editor de ficha
   (C-1) e histórico (C-4) passam a usar esse helper em vez de ler `CAMPOS_CARDIO` direto.
3. **UI de criação/edição** (na aba Exercícios de `GerenciarPage.tsx`, ao lado de
   `LinhaExercicioCustom`): formulário com **nome + emoji + lista de métricas com switchers**
   (rótulo/unidade de `META_METRICA_CARDIO`). Editar um built-in **clona-o como customização**
   (built-ins não são excluíveis; a customização sobrepõe o seed por `id`).
4. **Seleção do tipo no editor de ficha** (C-1, passo de cardio): o dropdown de `tipo` passa a
   listar built-ins **+** os tipos custom do usuário.
5. **Restrição travada**: switchers escolhem apenas chaves do conjunto fixo `ChaveMetricaCardio`
   (sem label/unidade livres).

### Aceite C-6
- [ ] Usuário cria um tipo de cardio com nome, emoji e um subconjunto de métricas; ele aparece no editor de ficha.
- [ ] Painel de execução renderiza exatamente as métricas escolhidas para aquele tipo.
- [ ] Customizar um built-in (ex.: ligar "inclinação" na Esteira) reflete na execução; built-in não pode ser excluído.
- [ ] Excluir um tipo custom não apaga histórico antigo (resolve com fallback de nome).
- [ ] Dados antigos (`tipo` = "Esteira"…) continuam resolvendo sem migração.

## Fora de escopo (fase 2)

- Redesenho de Home/Navegação para experiência "cardio-only" não muscle-centric. Decisão desta
  rodada: **reaproveitar as telas existentes** (modalidade controla visibilidade), não criar
  telas paralelas. Reavaliar só depois de validar o modelo com uso real.
- **Métrica de cardio totalmente livre** (label + unidade arbitrários pelo usuário). Exigiria
  abandonar os campos achatados tipados por um saco genérico `{chave,valor}[]`, prejudicando
  gráficos/agregados. C-6 cobre o caso comum (escolher do conjunto fixo); reavaliar livre depois.
- GPS/integração com wearables (Health Connect / Apple Health). Anotado como possibilidade.

## Ordem sugerida

1. **Modelo de dados** (`tipos.ts` + normalizador no `trainify.state.ts`) — base de tudo.
2. **C-6** (catálogo de tipos + `resolverTipoCardio`) **antes** de C-3, porque painel/editor
   passam a ler do catálogo. Pode-se entregar só com built-ins seedados e adicionar a UI de
   criação custom logo em seguida.
3. **C-1** (modalidade no editor) → **C-2** (execução guiada) → **C-3** (painel dinâmico).
4. **C-5** (defaults) — pequeno e alto impacto de UX; pode vir junto do C-3.
5. **C-4** (histórico/progresso) por último — consome os dados já sendo gravados.

## Verificação (todas as fases)

- `npm run build` / typecheck sem novos erros; testes de `trainify.state` passando
  (`src/application/state/trainify.state.test.ts`).
- Testar nos **dois temas** (claro/escuro) e em **mobile** (max-width 480px).
- **Retrocompatibilidade**: carregar dados antigos (sem `modalidade`, cardio só com
  `duracaoMinutos`) não quebra; ficha antiga abre e salva com modalidade derivada.
- Sem regressão: criar/editar/executar/finalizar e recuperação de sessão ativa intactos nos 3 modos.
