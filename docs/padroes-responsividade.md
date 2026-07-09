# Padrões de Responsividade — Trainify

Especificação dos padrões usados para adaptar o app (mobile-first) a **tablet** e
**desktop**, sem alterar a experiência mobile. Documenta o que foi aplicado nas
telas já migradas e serve de referência para as próximas.

## Princípios

1. **Mobile é a referência e não muda.** Nada abaixo do breakpoint de tablet
   (`< md`) pode mudar aparência ou comportamento. Toda adaptação é aditiva,
   via utilities responsivas (`md:`, `lg:`).
2. **Sem coluna perdida no meio.** Em telas largas o conteúdo é centralizado com
   largura de leitura confortável — nem esticado de borda a borda, nem uma
   coluna estreita no centro.
3. **Mesma identidade visual.** Tokens, cores e tipografia do `@theme` são
   mantidos; telas largas só redistribuem melhor o mesmo design system.
4. **Safe areas preservadas.** Os insets do Capacitor (`--safe-top`,
   `--safe-bottom`) continuam respeitados em todos os tamanhos.

## Breakpoints

Padrões do Tailwind (sem breakpoints customizados):

| Faixa | Largura | Apelido |
|---|---|---|
| Mobile | `< 768px` | (base) |
| Tablet | `≥ 768px` | `md` |
| Desktop | `≥ 1024px` | `lg` |

- **Tablet (`md`)**: conteúdo passa a centralizar e listas viram 2 colunas.
- **Desktop (`lg`)**: navegação vira **barra lateral** (sidebar).

## ⚠️ Gotcha do Tailwind: `max-w-*` nomeados

O `@theme` em [`src/index.css`](../src/index.css) define tokens de espaçamento
nomeados (`--spacing-3xl: 48px`, etc.). Nessa configuração do Tailwind v4 os
utilitários **`max-w-3xl` / `max-w-2xl` / ... colidem** e resolvem para valores
errados (ex.: `max-w-3xl` ⇒ `48px`, não `768px`), colapsando o layout.

**Regra:** para largura máxima de container, use **valor explícito em px** —
`max-w-[768px]`, nunca o nome (`max-w-3xl`). Utilitários numéricos de espaçamento
(`p-4`, `gap-3`, `left-60`, `w-60`) funcionam normalmente.

## Estrutura do shell ([`AppLayout`](../src/interface/rota/AppLayout.tsx))

O `#root` **não** tem mais largura travada (a antiga trava `max-width: 480px` foi
removida); o gradiente de fundo cobre a viewport inteira. O container de leitura
fica no shell.

```
┌──────────────────────────────────────────────┐
│ Desktop (lg+)                                  │
│ ┌─────────┬──────────────────────────────┐    │
│ │ Sidebar │  Título da página            │    │
│ │ (240px) │  ┌────────────────────────┐  │    │
│ │ • marca │  │ conteúdo                │  │    │
│ │ • abas  │  │ max-w-[768px], centrado │  │    │
│ │ • perfil│  └────────────────────────┘  │    │
│ └─────────┴──────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

| Elemento | Mobile (`< md`) | Tablet (`md`) | Desktop (`lg`) |
|---|---|---|---|
| **Navegação** | Pill inferior (largura cheia) | Pill inferior centralizada, capada em 480px | **Sidebar** lateral fixa (240px / `w-60`) |
| **Barra superior** ([`CabecalhoApp`](../src/interface/widget/cabecalho/CabecalhoApp.tsx)) | Visível (marca + título + avatar) | Visível | **Oculta** (`lg:hidden`) |
| **Título da página** | Na barra superior | Na barra superior | No topo do conteúdo (+ botão voltar nas subtelas) |
| **Marca + perfil** | Na barra superior | Na barra superior | Na sidebar (marca no topo, perfil no rodapé) |
| **Conteúdo** | Largura cheia + padding | Centralizado, até 768px | Centralizado em 768px, à direita da sidebar |

Detalhes de implementação:
- O container do `<Outlet/>`: `mx-auto w-full max-w-[768px]`.
- A sidebar ([`NavegacaoLateral`](../src/interface/widget/menu-lateral/NavegacaoLateral.tsx))
  é `hidden lg:flex` e **reaproveita** a config de abas (`ABAS`) e o handler de
  [`NavegacaoInferior`](../src/interface/widget/menu-lateral/NavegacaoInferior.tsx)
  — não há duplicação de lógica, só uma apresentação alternativa.
- O drawer de preferências (perfil/tema/dados) é controlado por estado subido ao
  `AppLayout` (`menuAberto`), acionável tanto pelo avatar (mobile/tablet) quanto
  pelo perfil da sidebar (desktop). As props de controle no `CabecalhoApp` são
  opcionais (fallback para estado interno) — retrocompatível.
- As barras fixas do `CabecalhoApp` usam `md:max-w-[768px]` para acompanhar o
  container; ficam ocultas em `lg`.

## Padrão de listas: grid de cards

Listas de cards adotam grid de 2 colunas a partir do tablet, mantendo 1 coluna no
mobile (visualmente idêntico a um `space-y`):

```tsx
// antes:  <div className="space-y-2"> ... </div>
// depois: <div className="grid grid-cols-1 gap-2 md:grid-cols-2"> ... </div>
```

- Use `items-start` quando os cards tiverem alturas diferentes (ex.: grupos de
  exercícios, cartões de programa/ficha).
- `gap` substitui o `space-y` anterior com o mesmo espaçamento — zero mudança no
  mobile.

Aplicado em: Histórico (lista por mês), Estatísticas (progressão por exercício),
Gerenciar (listas de "trocar para", Fichas, grupos de Exercícios).

## Padrão de navegação de seção: rodapé (mobile) / sub-itens na sidebar (desktop)

Quando uma aba raiz agrupa mais de um CRUD, a navegação entre eles **promove**
para a sidebar no desktop — mesmo princípio das abas principais. Caso concreto:
a aba **Programas** (`/gerenciar`) é a casa da seção; **Fichas**
(`/gerenciar/fichas`) e **Exercícios** (`/gerenciar/exercicios`) são telas
próprias (drill-in com voltar, via `ehTabRaiz` → falso nas sub-rotas).

| Faixa | Como se alterna entre os CRUDs |
|---|---|
| Mobile / Tablet (`< lg`) | Seção **"Bibliotecas"** no rodapé da tela de Programas leva a Fichas/Exercícios (`lg:hidden`). |
| Desktop (`lg`) | A entrada **"Programas"** na [`NavegacaoLateral`](../src/interface/widget/menu-lateral/NavegacaoLateral.tsx) expande em **Fichas / Exercícios** aninhados quando a seção está ativa. O rodapé "Bibliotecas" some. |

Nunca se reintroduz um seletor segmentado (o antigo `BigSwitcher` foi removido):
a decisão de "qual CRUD" mora no rodapé (mobile) ou na sidebar (desktop), nunca
num controle de peso igual competindo com o conteúdo.

## Padrão de editores: drawer lateral (md+) / tela cheia (mobile)

Os editores de **programa** e **ficha** abrem como **drawer lateral à direita** no
tablet/desktop, com a tela anterior visível (esmaecida) atrás, e seguem **tela
cheia no mobile**.

Peças:
1. **Rota de fundo** ([`useNavegar`](../src/interface/rota/useNavegar.ts)): ao
   navegar para um destino de editor, anexa `state.background = rota atual`
   (herdado em transições editor→editor).
2. **Camada de overlay** ([`RotasApp`](../src/interface/rota/RotasApp.tsx)): a
   `<Routes>` principal renderiza com `location={background ?? location}` (mantém
   a tela de fundo montada); uma `<Routes>` de overlay desenha o editor por cima
   quando há `background`. Sem background (ex.: link direto), o editor renderiza
   normalmente pela rota principal.
3. **Raiz responsiva do editor**: `fixed inset-0` no mobile; drawer à direita no
   md+ (`md:left-auto md:right-0 md:w-full md:max-w-[560px] md:border-l
   md:shadow-2xl`), com **backdrop** clicável `hidden md:block` (só md+).

Regras de camada (z-index) e animação:
- Editor em `z-[60]` (acima da pill inferior `z-50`, que continua renderizada na
  tela de fundo); backdrop em `z-[55]`.
- Animação de entrada do drawer (`.md-drawer-enter`) é definida **dentro de
  `@media (min-width: 768px)`** — no mobile a classe não faz nada (sem animação).

## Padrão de overlays: bottom-sheet (mobile) / modal centralizado (md+)

Overlays que no mobile são **bottom-sheets** (deslizam de baixo, encostados na
base) passam a **modais centralizados** no tablet/desktop — bottom-sheet fica
estranho numa tela larga. Aplicado nos overlays da execução
([Timer](../src/interface/page/area-logada/execucao/TimerDescanso.tsx),
Confirmar Finalizar, Confirmar Cancelar, Histórico de Série e
[Gráfico](../src/interface/widget/grafico/GraficoProgressao.tsx)).

Receita (o mesmo em todos):

```tsx
// container: âncora embaixo no mobile, centro no md+
<div className="fixed inset-0 ... flex items-end justify-center md:items-center">
  {/* sheet: cantos só no topo no mobile, todos no md+; padding simétrico */}
  <div className="w-full max-w-[480px] rounded-t-[16px] ... pb-[calc(var(--safe-bottom)+20px)]
                  md:rounded-2xl md:pb-5">
    {/* alça de arraste — só faz sentido no bottom-sheet */}
    <div className="... h-1 w-12 rounded-full bg-borda md:hidden" />
    ...
  </div>
</div>
```

- `items-end → md:items-center`; `rounded-t-[16px] → md:rounded-2xl`; alça com
  `md:hidden`; padding inferior simétrico no md (`md:pb-5/6`).
- Animação de entrada de bottom-sheet (`animate-slide-up`) é neutralizada no md+
  com `md:animate-none` (evita o "voo" de baixo num modal centralizado).
- `OverlayFinalizado` (celebração full-screen) e `ToastDesfazer` (pílula `w-fit`
  no topo) já funcionam em qualquer tamanho — sem mudança.

### Barra de ação fixa → botões à direita (md+)

A barra "Finalizar treino" do modo cardio
([PainelCardio](../src/interface/page/area-logada/execucao/PainelCardio.tsx)) é
uma barra **sticky** no rodapé (alcance do polegar) no mobile, mas no desktop uma
barra de largura total com botão esticado fica pesada. No md+ ela perde o
tratamento de barra e vira botões de largura automática alinhados à direita:

```tsx
// sticky + borda + bg no mobile → estática, sem barra, botões à direita no md+
<div className="sticky bottom-0 ... border-t bg-fundo/95 px-4 py-4 backdrop-blur
                md:static md:flex md:justify-end md:gap-3 md:border-0 md:bg-transparent
                md:p-0 md:backdrop-blur-none">
  <button className="... px-5 ...">Finalizar treino</button>  {/* px p/ largura auto no md+ */}
</div>
```

> **Verificação:** a rota de execução roda fora do shell e em telas com `dpr 2` o
> screenshot do preview pode renderizar deslocado/estreito — **artefato de
> captura**. Conferir o layout por medição de DOM (`getBoundingClientRect`):
> conteúdo centralizado em 768px e os overlays com centro = centro da viewport.

## Status por tela

| Tela | Status | Padrão aplicado |
|---|---|---|
| Shell (header/nav/container) | ✅ | Sidebar desktop + container `max-w-[768px]` |
| Home / Treinos | ✅ | Container de leitura centralizado |
| Histórico | ✅ | Grid 2 col por mês |
| Estatísticas | ✅ | Grid 2 col na progressão |
| Gerenciar / Programas | ✅ | Programas é a casa (herói + "trocar para"); Fichas/Exercícios são telas próprias, alcançadas por rodapé "Bibliotecas" (mobile/tablet) ou sub-itens da sidebar (desktop). Grid 2 col nas listas. |
| Editores (programa/ficha) | ✅ | Drawer lateral md+ / tela cheia mobile |
| Execução de Treino | ✅ | Conteúdo centralizado 768 + overlays viram modal centralizado md+ |
| Resumo do Programa | ⏳ | herda o container |
| Detalhe do Treino / Sequência | ⏳ | herda o container |
| Gráfico de Progressão (página `/grafico`) | ⏳ | herda o container |
| Onboarding | ⏳ | fora do shell (a definir) |

## Critério de aceite (por tela)

- Zero regressão no mobile (`< md` idêntico ao original).
- Sem overflow horizontal em nenhum tamanho.
- Conteúdo legível e bem distribuído em tablet/desktop.
- Alvos de toque/clique adequados.
- Safe areas do Capacitor preservadas.
