# Especificação Funcional — Workout Tracker

## 1. Visão Geral do Sistema

Aplicação de registro e acompanhamento de treinos de musculação e cardio. Permite ao usuário criar programas de treino compostos por fichas, executar treinos registrando séries, repetições e cargas, e acompanhar a progressão ao longo do tempo.

### Entidades Principais

| Entidade | Descrição |
|----------|-----------|
| **Programa** | Agrupamento de fichas que compõem uma rotina semanal (ex: "Rotina Janeiro") |
| **Ficha** | Conjunto de exercícios de musculação + cardio opcional (ex: "Treino A — Peito/Tríceps") |
| **Exercício** | Movimento catalogado com nome e grupo muscular. Biblioteca padrão + customizados |
| **Cardio** | Atividade aeróbica vinculada a uma ficha (esteira, bike, etc.) |
| **WorkoutLog** | Registro completo de uma sessão de treino com data/hora, séries e cardio |

---

## 2. Lista Completa de Telas

### 2.1. Home

**Descrição:** Tela principal que exibe o programa ativo com suas fichas e o histórico de treinos recentes.

**Estados:**
- **Com programa ativo:** Exibe banner colorido (se configurado), nome, descrição e cards das fichas vinculadas
- **Sem programa ativo:** Exibe placeholder com ação para criar programa
- **Com histórico:** Lista os 10 últimos treinos realizados (clicáveis)
- **Sem histórico:** Seção omitida

**Elementos:**
- Header com título e acesso à tela de gerenciamento
- Banner colorido do programa
- Cards de ficha contendo: ícone + nome, descrição, chips de grupos musculares, lista de exercícios, data do último treino, ação para iniciar treino
- Lista de histórico com nome da ficha, data/hora e quantidade de exercícios

```
┌─────────────────────────────────────┐
│  Meus Treinos            [Gerenciar]│
├─────────────────────────────────────┤
│ ██████████████████████████████ (cor)│
│  Rotina Janeiro                     │
│  Rotina de volume, 4x semana       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💪 Treino A                     │ │
│ │ Foco em hipertrofia             │ │
│ │ [Peito] [Tríceps] [Ombros]     │ │
│ │ Supino Reto, Crucifixo, ...    │ │
│ │ Último: 05/04/26 14:30         │ │
│ │ [      Iniciar Treino       ]  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🦵 Treino B                     │ │
│ │ [Pernas] [Glúteos]             │ │
│ │ Agachamento, Leg Press, ...    │ │
│ │ [      Iniciar Treino       ]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Histórico                          │
│ ┌─────────────────────────────────┐ │
│ │ Treino A          05/04/26 14:30│ │
│ │ 6 exercício(s)                  │ │
│ ├─────────────────────────────────┤ │
│ │ Treino B          03/04/26 10:15│ │
│ │ 5 exercício(s)                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 2.2. Gerenciar

**Descrição:** Tela administrativa para criar, editar e excluir programas, fichas e exercícios customizados.

**Seções:**
1. **Programas** — Lista com nome, indicador de ativo, quantidade de fichas. Ações: Ativar, Editar, Excluir. Banner colorido no topo do card.
2. **Fichas** — Lista com ícone + nome, chips de grupos musculares, quantidade de exercícios, programas vinculados. Ações: Editar, Excluir.
3. **Exercícios** — Cadastro de exercícios customizados. Formulário com nome e grupo muscular (com autocomplete dos grupos existentes). Lista de exercícios customizados com opção de excluir.

**Estados:**
- Listas vazias exibem mensagens de placeholder
- Formulário de exercício toggle (abrir/fechar)

```
┌─────────────────────────────────────┐
│  Gerenciar                  [Voltar]│
├─────────────────────────────────────┤
│  Programas                  [+ Novo]│
│ ┌─────────────────────────────────┐ │
│ │ ██████████████████████ (banner) │ │
│ │ Rotina Janeiro        [ATIVO]  │ │
│ │ 4 ficha(s)                     │ │
│ │ [Editar]  Excluir              │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Fichas                    [+ Nova] │
│ ┌─────────────────────────────────┐ │
│ │ 💪 Treino A                     │ │
│ │ [Peito] [Tríceps]              │ │
│ │ 6 exercício(s) · em: Rotina... │ │
│ │ [Editar]  Excluir              │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Exercícios                [+ Novo] │
│  Exercícios customizados            │
│ ┌─────────────────────────────────┐ │
│ │ Elevação Pélvica  [Glúteos]    │ │
│ │                        Excluir │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 2.3. Editor de Ficha

**Descrição:** Criação e edição de fichas de treino com seleção de exercícios, configuração de séries/reps/descanso e seção opcional de cardio.

**Campos:**
- Ícone (seletor com opções pré-definidas)
- Nome (auto-gerado: "Treino A", "Treino B", etc.)
- Descrição (opcional)
- Exercícios (lista ordenada com configuração individual)
- Cardio (seção opcional com tipos pré-definidos)

**Funcionalidades:**
- **Copiar de existente** (overlay, apenas ao criar nova ficha)
- **Picker de exercícios** com busca por nome/grupo, agrupado por grupo muscular
- **Criar exercício inline** ("Não encontrou? Criar exercício") — salva na biblioteca e adiciona à ficha
- **Configuração por exercício:** séries, reps, indicador de uso de carga, tempo de descanso (seg)
- **Seção cardio:** toggle para adicionar, tipos via botões (Esteira, Bike, Elíptico, etc.), duração e nota por entrada

**Estados:**
- Modo criação vs. edição
- Picker de exercícios aberto/fechado
- Picker de ícone aberto/fechado
- Formulário de novo exercício aberto/fechado
- Overlay de cópia aberto/fechado
- Seção cardio visível/oculta

```
┌─────────────────────────────────────┐
│  Nova Ficha                 [Voltar]│
├─────────────────────────────────────┤
│  Nome da Ficha    Copiar de existente│
│  [💪] [Treino A                   ] │
│                                     │
│  Descrição                          │
│  [Opcional — ex: Foco em hiper... ] │
│                                     │
│  Exercícios              [+ Adicionar]│
│ ┌─────────────────────────────────┐ │
│ │ 1. Supino Reto          Remover │ │
│ │ Séries [3]     Reps [12]       │ │
│ │ [x] Usa carga   Descanso [60]s │ │
│ ├─────────────────────────────────┤ │
│ │ 2. Crucifixo             Remover│ │
│ │ Séries [3]     Reps [12]       │ │
│ │ [x] Usa carga   Descanso [60]s │ │
│ └─────────────────────────────────┘ │
│                                     │
│  + Adicionar seção de cardio        │
│                                     │
│  (quando aberta:)                   │
│  Cardio                Remover seção│
│ ┌─────────────────────────────────┐ │
│ │ 1. Esteira               Remover│ │
│ │ Duração [20] min   Nota [zona2]│ │
│ └─────────────────────────────────┘ │
│ [+Esteira][+Bike][+Elíptico]...    │
│                                     │
│  [         Salvar Ficha          ]  │
└─────────────────────────────────────┘
```

---

### 2.4. Editor de Programa

**Descrição:** Criação e edição de programas de treino com seleção de fichas e personalização visual.

**Campos:**
- Nome
- Descrição (opcional)
- Cor do banner (opções de cor + "nenhum")
- Indicador de programa ativo
- Fichas vinculadas (toggle de seleção)

**Funcionalidades:**
- **Copiar de existente** (overlay, apenas ao criar)
- **Seleção de fichas:** toggle por ficha, fichas selecionadas são visualmente diferenciadas
- **Ativação:** ao marcar como ativo, desativa todos os outros programas

```
┌─────────────────────────────────────┐
│  Novo Programa              [Voltar]│
├─────────────────────────────────────┤
│  Nome             Copiar de existente│
│  [Rotina Janeiro                  ] │
│                                     │
│  Descrição                          │
│  [Opcional — ex: Rotina volume...] │
│                                     │
│  Cor do banner                      │
│  [■][■][■][■][■][■][■][■][■][✕]   │
│                                     │
│  [x] Programa ativo                 │
│                                     │
│  Fichas do programa                 │
│ ┌─────────────────────────────────┐ │
│ │████ Treino A  6 exercício(s) ███│ │ ← selecionada
│ ├─────────────────────────────────┤ │
│ │     Treino B  5 exercício(s)    │ │ ← não selecionada
│ └─────────────────────────────────┘ │
│                                     │
│  [        Salvar Programa        ]  │
└─────────────────────────────────────┘
```

---

### 2.5. Execução de Treino

**Descrição:** Tela de registro de treino em tempo real. Navega entre exercícios um a um, registrando séries, repetições e carga. Timer de descanso integrado. Seção de cardio acessível a qualquer momento.

**Áreas funcionais:**

1. **Header:** Nome da ficha, acesso ao cardio (se a ficha tiver), cancelar
2. **Indicador de progresso:** "Exercício X de Y" + barra segmentada clicável
3. **Card do exercício atual:**
   - Nome e padrão (3x12, descanso 1:00)
   - Grid de séries com inputs de reps e carga (carga só se usa carga)
   - Ação por série para preencher do histórico
   - Adicionar série
   - Nota por exercício
4. **Seção Progressão:** Tabela com últimos 5 treinos deste exercício (data, séries, reps, carga, notas). Acesso a gráfico de progressão
5. **Timer de descanso:** Display de contagem regressiva, controles de iniciar/pausar/resetar
6. **Navegação:** Anterior / Próximo / Finalizar Treino

**Overlays:**
- **Histórico por série:** Ao acionar preenchimento, abre overlay com séries anteriores deste exercício, cada série individualmente clicável para preencher a série alvo
- **Gráfico de progressão:** Gráficos de linha de carga máxima e reps máximas ao longo do tempo + tabela detalhada
- **Fase cardio:** Tela separada acessível via header, com campos de duração e nota por atividade

**Estados:**
- Índice do exercício atual
- Timer rodando / pausado / zerado
- Overlay de histórico aberto (com índice da série alvo)
- Overlay de gráfico aberto
- Fase cardio ativa/inativa

```
┌─────────────────────────────────────┐
│  Treino A      [Cardio] [Cancelar] │
├─────────────────────────────────────┤
│  Exercício 1 de 6                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Supino Reto                     │ │
│ │ Padrão: 3x12 · 1:00 descanso   │ │
│ │                                 │ │
│ │ #  Reps    Carga(kg)   ↩  ×   │ │
│ │ 1  [12]    [40    ]    ↩  ×   │ │
│ │ 2  [12]    [40    ]    ↩  ×   │ │
│ │ 3  [10]    [42.5  ]    ↩  ×   │ │
│ │                                 │ │
│ │ [+ Série]                       │ │
│ │                                 │ │
│ │ [Nota: aumentar carga próx... ] │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Progressão            Ver gráfico  │
│ ┌─────────────────────────────────┐ │
│ │ Data    Séries  Reps  Carga    │ │
│ │ 03/04   3x      12    40kg    │ │
│ │ 01/04   3x      12    37.5kg  │ │
│ │   aumentar carga na próxima    │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Descanso                    1:00   │
│            0:45                     │
│       [  Pausar  ] [Resetar]        │
│                                     │
│  [Anterior]        [Próximo]        │
│                                     │
│  [████████░░░░░░░░░░░░░░] (1 de 6) │
└─────────────────────────────────────┘
```

**Fase Cardio (tela alternativa):**

```
┌─────────────────────────────────────┐
│  Treino A     [Voltar aos exercícios]│
├─────────────────────────────────────┤
│  Cardio                             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1. Esteira                      │ │
│ │ Duração (min) [25]              │ │
│ │ Nota [6.5 km/h, incl. 3%    ]  │ │
│ ├─────────────────────────────────┤ │
│ │ 2. Bike                         │ │
│ │ Duração (min) [15]              │ │
│ │ Nota [zona 2                 ]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [     Voltar aos exercícios     ]  │
└─────────────────────────────────────┘
```

---

### 2.6. Detalhe do Histórico

**Descrição:** Visualização completa de um treino registrado.

**Informações:**
- Nome da ficha (ou "Ficha removida")
- Horário de início e fim
- Duração em minutos
- Para cada exercício: tabela de séries (série, reps, carga), nota, acesso a gráfico de progressão
- Seção de cardio (se houver): tipo, duração, nota

```
┌─────────────────────────────────────┐
│  Treino A                   [Voltar]│
├─────────────────────────────────────┤
│  Início: 05/04/26 14:30             │
│  Fim: 05/04/26 15:45                │
│  Duração: 75 min                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Supino Reto          Ver gráfico│ │
│ │ Série   Reps   Carga(kg)       │ │
│ │ 1       12     40              │ │
│ │ 2       12     40              │ │
│ │ 3       10     42.5            │ │
│ │ aumentar carga na próxima      │ │
│ ├─────────────────────────────────┤ │
│ │ Crucifixo            Ver gráfico│ │
│ │ Série   Reps   Carga(kg)       │ │
│ │ 1       12     14              │ │
│ │ 2       12     14              │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Cardio                             │
│ ┌─────────────────────────────────┐ │
│ │ Esteira              25 min     │ │
│ │ 6.5 km/h, incl. 3%             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 3. Fluxos de Navegação

```
                    ┌──────────┐
                    │   Home   │
                    └────┬─────┘
                         │
              ┌──────────┼──────────────┐
              │          │              │
              ▼          ▼              ▼
        ┌──────────┐  ┌────────┐  ┌──────────────┐
        │ Gerenciar│  │Execução│  │  Detalhe do  │
        │          │  │Treino  │  │  Histórico   │
        └────┬─────┘  └────┬───┘  └──────────────┘
             │             │
     ┌───────┼───────┐     │
     │       │       │     │ (acesso ao Cardio)
     ▼       ▼       ▼     ▼
┌────────┐┌──────┐┌───────────┐
│Editor  ││Editor││Fase Cardio│
│Programa││Ficha ││(inline)   │
└────────┘└──────┘└───────────┘
```

**Fluxos principais:**

1. **Criar programa completo:** Home → Gerenciar → Nova Ficha → salvar → Novo Programa → selecionar fichas → salvar → Home (programa ativo aparece)
2. **Executar treino:** Home → Iniciar Treino → navegar exercícios → (opcionalmente) Cardio → Finalizar → Home
3. **Consultar histórico:** Home → clicar item do histórico → ver detalhes → ver gráfico de um exercício
4. **Copiar estrutura anterior:** Gerenciar → Novo Programa → Copiar de existente → ajustar → salvar

---

## 4. Regras de Negócio

### Programas
- RN01: Apenas um programa pode estar ativo por vez. Ao ativar um, todos os outros são desativados.
- RN02: Excluir um programa **não** exclui as fichas vinculadas; elas continuam existindo independentemente.
- RN03: Um programa requer nome não-vazio e pelo menos uma ficha vinculada para ser salvo.
- RN04: O banner é opcional (cor ou nenhum).

### Fichas
- RN05: Uma ficha requer pelo menos um exercício para ser salva.
- RN06: O nome da ficha é auto-gerado sequencialmente (Treino A, B, C, D) ao criar, mas pode ser editado.
- RN07: Cada exercício na ficha define: séries, reps, se usa carga (boolean) e tempo de descanso em segundos (padrão: 60s).
- RN08: A carga **não** é definida na ficha — é registrada apenas durante a execução, pois é progressiva e variável.
- RN09: A seção de cardio é totalmente opcional. Ao remover a seção, todas as entradas de cardio são descartadas.
- RN10: O ícone tem valor padrão ao criar uma ficha.

### Exercícios
- RN11: A biblioteca combina exercícios padrão (40+) com exercícios customizados do usuário.
- RN12: Exercícios customizados podem ser criados tanto na tela Gerenciar quanto inline no editor de ficha.
- RN13: O grupo muscular aceita valores livres, com autocomplete dos grupos já existentes.
- RN14: Não é possível adicionar o mesmo exercício duas vezes na mesma ficha.

### Execução de Treino
- RN15: Ao iniciar, as séries são pré-preenchidas com as reps da ficha e carga 0.
- RN16: O usuário pode adicionar ou remover séries durante a execução.
- RN17: O campo de carga só aparece se o exercício estiver configurado como "usa carga".
- RN18: O timer de descanso usa o tempo configurado no exercício. Conta regressivamente e pode ser pausado/resetado.
- RN19: A nota por exercício é salva no log e exibida na progressão de execuções futuras.
- RN20: O cardio pode ser preenchido a qualquer momento durante a sessão (antes, durante ou depois dos exercícios de musculação).
- RN21: Ao finalizar, o log é salvo com data/hora de início e fim, todas as séries e o cardio.

### Histórico e Progressão
- RN22: O histórico na Home exibe os 10 treinos mais recentes.
- RN23: A progressão na tela de execução exibe os últimos 5 registros do exercício atual.
- RN24: O gráfico de progressão exibe até 10 sessões, mostrando carga máxima e reps máximas por sessão.
- RN25: O preenchimento do histórico é por série individual — ao selecionar uma série anterior, apenas a série alvo é sobrescrita.

### Cópia
- RN26: Ao copiar uma ficha, todos os campos são copiados (nome + " (cópia)", descrição, ícone, exercícios com config, cardio) com novo ID.
- RN27: Ao copiar um programa, são copiados nome + " (cópia)", descrição, banner e fichas vinculadas (mesmos IDs de fichas).

---

## 5. Modelo de Dados

### Entidades

| Entidade | Campos |
|----------|--------|
| **Exercise** | id, name, muscleGroup |
| **FichaExercise** | exerciseId, sets, reps, hasWeight, restSeconds |
| **CardioEntry** | id, type, durationMinutes, note |
| **Ficha** | id, name, description, icon, exercises[], cardio[] |
| **Program** | id, name, description, banner, fichaIds[], active |
| **WorkoutSetLog** | set, reps, weight |
| **ExerciseLog** | exerciseId, sets[], note |
| **CardioLog** | cardioId, type, durationMinutes, note |
| **WorkoutLog** | id, fichaId, date, startedAt, finishedAt, exercises[], cardio[] |

### Diagrama de Relacionamento

```
Program ──────────┐
  id               │ fichaIds[]
  name             │
  description      │
  banner           │
  active           ▼
                 Ficha ──────────────────┐
                   id                     │
                   name                   │ exercises[]
                   description            │
                   icon                   │
                   cardio[] ◄─────────┐   ▼
                     id               │ FichaExercise
                     type             │   exerciseId ──► Exercise
                     durationMinutes  │   sets            id
                     note             │   reps            name
                                      │   hasWeight       muscleGroup
                                      │   restSeconds
                                      │
WorkoutLog ───────────────────────────┤
  id                                  │
  fichaId ──────────────────────────► │
  date                                │
  startedAt                           │
  finishedAt                          │
  exercises[] ──► ExerciseLog         │
    exerciseId    sets[]              │
    note          WorkoutSetLog       │
                    set               │
                    reps              │
                    weight            │
  cardio[] ──► CardioLog              │
    cardioId ─────────────────────────┘
    type
    durationMinutes
    note
```
