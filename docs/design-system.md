# Design System — Trainify

> Documento de referencia para construir telas consistentes no Trainify.
> Toda nova tela ou componente deve seguir os tokens, padroes e principios aqui documentados.

---

## 1. Fundamentos

### Filosofia

O Trainify e um app para **treinar**, nao para analisar dados. A interface e meio, nao fim. Cada decisao visual serve a um objetivo: o usuario abre o app, sabe qual treino fazer e comeca — em menos de 3 segundos.

### Personalidade da marca

**3 palavras:** Calma, Determinada, Foco

| Aspecto | Direcao | Evitar |
|---------|---------|--------|
| Tom | Confiante, direto | Hype, explosivo, "motivacional de academia" |
| Linguagem | "Sequencia", constancia | "Ofensiva", linguagem de batalha |
| Visual | Notion-like clean, com personalidade | Dashboards corporativos, neons, gradientes |
| Emocao | Confianca → Clareza → Determinacao | Ansiedade, pressao, gamificacao agressiva |

### Principios de design

1. **Acao acima de informacao** — O proximo passo e sempre obvio. Informacao contextualiza, nao distrai.
2. **Clareza imediata** — Em 2 segundos, o usuario sabe o que fazer. Nao faz pensar.
3. **Progresso sutil** — Streak e historico motivam sem gritar. Constancia, nao explosao.
4. **Personalidade sem distracao** — Emojis e detalhes dao carater, mas nao competem com a acao principal.
5. **Respeito ao tempo** — Cada tap e intencional. Zero modais desnecessarios para acoes criticas.

### Estetica

- **Referencia principal:** Notion (layout clean, espacamento generoso, hierarquia clara)
- **Diferencial:** Paleta quente creme/preto, emojis como icones, personalidade acolhedora
- **Anti-referencias:** Apps fitness "hype" com neons e gradientes; dashboards frios/clinicos; glassmorphism decorativo

---

## 2. Cores

O sistema de cores usa **OKLCH** (perceptualmente uniforme). Todas as cores sao tintadas com matiz quente (~55-70, amber) para coesao.

### 2.1 Tokens de superficie

| Token | Valor OKLCH | Uso |
|-------|-------------|-----|
| `--color-fundo` | `oklch(0.965 0.007 70)` | Background da pagina. Creme muito suave |
| `--color-superficie` | `oklch(0.985 0.005 70)` | Background de cards e componentes |
| `--color-superficie-elevada` | `oklch(0.985 0.005 70)` | Superficies elevadas (mesmo que superficie) |
| `--color-superficie-suave` | `oklch(0.950 0.008 68)` | Hover sutil, backgrounds de chips |
| `--color-superficie-hover` | `oklch(0.940 0.010 68)` | Hover forte, estados ativos |

**Regra:** Superficies NUNCA sao cinza puro. Sempre tintadas com matiz quente.

### 2.2 Tokens de texto

| Token | Valor OKLCH | Uso |
|-------|-------------|-----|
| `--color-texto-primario` | `oklch(0.200 0.015 55)` | Texto principal. Preto quente |
| `--color-texto-secundario` | `oklch(0.450 0.018 55)` | Texto secundario, descricoes |
| `--color-texto-sutil` | `oklch(0.550 0.015 55)` | Texto desabilitado, placeholders |
| `--color-texto-invertido` | `oklch(0.965 0.007 70)` | Texto sobre fundo escuro (botoes primarios) |

**Regra:** Nunca usar cinza (#888) para texto secundario. Usar os tokens que mantem o matiz quente.

**Contraste:** Texto primario sobre superficie = ~14.5:1 (WCAG AAA). Texto secundario = ~7.8:1 (WCAG AA).

### 2.3 Tokens de borda

| Token | Valor OKLCH | Uso |
|-------|-------------|-----|
| `--color-borda` | `oklch(0.895 0.010 65)` | Bordas de cards, separadores estruturais |
| `--color-borda-suave` | `oklch(0.930 0.008 65)` | Divisores entre itens, bordas sutis |

**Regra:** Bordas sao **sutis**. Se uma borda chama atencao, esta errada. Usar `borda-suave` por padrao; `borda` apenas para containers estruturais.

### 2.4 Tokens de acento

| Token | Valor OKLCH | Uso |
|-------|-------------|-----|
| `--color-acento` | `oklch(0.220 0.015 55)` | CTA primario, botoes de acao. Preto quente |
| `--color-acento-hover` | `oklch(0.310 0.018 55)` | Hover do acento (mais claro) |
| `--color-acento-suave` | `oklch(0.935 0.014 65)` | Background sutil de icones, badges, highlights |

**Regra:** Acento e usado com **parcimonia**. Uma tela deve ter no maximo 1-2 elementos com `bg-acento`. Se tudo e acento, nada e.

### 2.5 Cores de programa (Banner)

Cada programa pode ter uma cor tematica. Padrao consistente: texto escuro + fundo muito claro do mesmo matiz.

| Cor | Texto | Fundo |
|-----|-------|-------|
| Azure | `oklch(0.52 0.10 250)` | `oklch(0.95 0.025 250)` |
| Green | `oklch(0.52 0.10 155)` | `oklch(0.95 0.025 155)` |
| Purple | `oklch(0.50 0.10 300)` | `oklch(0.95 0.025 300)` |
| Orange | `oklch(0.55 0.12 55)` | `oklch(0.95 0.030 55)` |
| Pink | `oklch(0.52 0.10 350)` | `oklch(0.95 0.025 350)` |
| Red | `oklch(0.50 0.11 25)` | `oklch(0.95 0.025 25)` |
| Yellow | `oklch(0.55 0.11 85)` | `oklch(0.95 0.030 85)` |
| Cyan | `oklch(0.52 0.08 210)` | `oklch(0.95 0.020 210)` |
| Indigo | `oklch(0.50 0.11 280)` | `oklch(0.95 0.025 280)` |

**Padrao para novas cores:** Texto lightness ~0.50-0.55, chroma ~0.08-0.12. Fundo lightness 0.95, chroma ~0.020-0.030. Mesmo matiz entre texto e fundo.

### 2.6 Cores semanticas (confetti/celebracao)

Usadas apenas em momentos de celebracao (completar streak, etc):

- `oklch(0.65 0.18 45)` — Laranja vibrante
- `oklch(0.55 0.20 35)` — Amarelo quente
- `oklch(0.50 0.18 25)` — Dourado
- `oklch(0.60 0.15 55)` — Amber
- `oklch(0.70 0.12 65)` — Creme escuro

**Regra:** Celebracao e **contida**. Usar em micro-momentos, nao em telas inteiras.

### 2.7 Background do app

O `#root` tem um background em camadas com gradientes radiais sutis que criam uma sensacao organica e quente:

```css
background:
  radial-gradient(ellipse 80% 45% at 20% 0%, oklch(0.91 0.035 55 / 0.5), transparent 70%),
  radial-gradient(ellipse 60% 35% at 85% 8%, oklch(0.90 0.03 40 / 0.4), transparent 60%),
  radial-gradient(ellipse 70% 40% at 75% 100%, oklch(0.91 0.035 50 / 0.5), transparent 70%),
  radial-gradient(ellipse 55% 35% at 15% 95%, oklch(0.90 0.03 35 / 0.4), transparent 60%),
  linear-gradient(180deg, oklch(0.95 0.015 55), var(--color-fundo) 30%, var(--color-fundo) 70%, oklch(0.95 0.015 50));
```

Esse background e global e nao deve ser replicado em componentes individuais.

---

## 3. Tipografia

### 3.1 Familias

| Papel | Fonte | Pesos | Uso |
|-------|-------|-------|-----|
| Display | `Bricolage Grotesque` | 600, 700 | Titulos, headings, numeros destaque |
| Body | `Figtree` | 400, 500, 600 | Texto corrido, labels, botoes, descricoes |
| Fallback | `system-ui, -apple-system, 'Segoe UI', sans-serif` | — | Fallback universal |

**Tailwind:**
- Display: `font-display` (aplica Bricolage Grotesque)
- Body: `font-sans` (padrao, aplica Figtree)

**Carregamento (Google Fonts no index.html):**
- Bricolage Grotesque: wght 600, 700
- Figtree: wght 400, 500, 600

### 3.2 Escala tipografica

Escala fixa em `rem` (app UI, nao marketing). Baseline: 16px.

| Token | Tamanho | Rem | Uso tipico |
|-------|---------|-----|------------|
| `text-xs` | 12px | 0.75rem | Minimo acessivel. Labels de chip, badges, timestamps |
| `text-sm` | 14px | 0.875rem | Texto secundario, descricoes curtas, botoes |
| `text-base` | 16px | 1rem | Texto principal de corpo, labels de formulario |
| `text-lg` | 18px | 1.125rem | Subtitulos, nomes de itens em listas |
| `text-xl` | 20px | 1.25rem | Titulos de secao |
| `text-2xl` | 24px | 1.5rem | Titulo da tela (heading principal) |

**Ratio entre steps:** ~1.14-1.25x. Hierarquia clara sem saltos bruscos.

### 3.3 Pesos

| Peso | Tailwind | Uso |
|------|----------|-----|
| 400 (Regular) | `font-normal` | Corpo de texto, descricoes |
| 500 (Medium) | `font-medium` | Labels, texto de botao, informacao secundaria |
| 600 (Semibold) | `font-semibold` | Subtitulos, chips ativos, labels de destaque |
| 700 (Bold) | `font-bold` | Titulos, headings, numeros de streak |

**Regra:** Nunca usar bold em textos longos. Bold e para headings e numeros de destaque.

### 3.4 Line-height

| Contexto | Valor | Tailwind |
|----------|-------|----------|
| Headings compactos | 1.0 | `leading-none` |
| Headings normais | 1.2 | `leading-tight` |
| Descricoes | 1.4 | `leading-snug` |
| Corpo de texto | 1.5 | padrao (sem classe) |
| Texto longo | 1.6 | `leading-relaxed` |

### 3.5 Tracking

- Titulos de tela: `tracking-tight` (-0.025em) — headings grandes ficam mais coesos
- Demais: padrao (sem classe)

### 3.6 Padroes de uso

```
Titulo da tela:     text-2xl  font-bold   font-display  tracking-tight  text-texto-primario
Subtitulo/secao:    text-lg   font-bold   font-display  leading-tight   text-texto-primario
Nome de item:       text-base font-semibold              leading-snug    text-texto-primario
Descricao:          text-sm   font-normal                                text-texto-secundario
Label/chip:         text-xs   font-semibold                              text-texto-secundario
Placeholder:        text-sm   font-normal                                text-texto-sutil
Numero destaque:    text-lg   font-bold   font-display  tabular-nums    text-texto-primario
```

**Regra:** `tabular-nums` em TODOS os numeros que mudam (streak, contadores, timers) para evitar saltos de layout.

---

## 4. Espacamento e Layout

### 4.1 Escala de espacamento

Base: **4px**. Usar apenas valores da escala.

| Token | Valor | Uso tipico |
|-------|-------|------------|
| `xs` | 4px | Espaco minimo — entre icone e texto inline |
| `sm` | 8px | Gap pequeno — entre elementos proximos |
| `md` | 12px | Gap medio — padding interno de chips |
| `lg` | 16px | Padding padrao de componentes |
| `xl` | 24px | Separacao entre secoes relacionadas |
| `2xl` | 32px | Separacao entre blocos independentes |
| `3xl` | 48px | Padding vertical generoso (empty states, secoes de tela) |

### 4.2 Padroes de padding

| Componente | Padding | Tailwind |
|------------|---------|----------|
| Chip | `px-2 py-0.5` | Compacto, cabe em linha |
| Botao compacto | `px-3 py-2` | Para acoes secundarias |
| Botao normal | `px-4 py-3` | CTA padrao, min-h 44px |
| Card interno | `px-4 py-3` | Conteudo dentro de containers |
| Card espacoso | `px-5 py-5` | Secoes principais (StripSemanal) |
| Tela (content area) | `px-5` | Margem lateral de conteudo |

### 4.3 Gap entre elementos

| Contexto | Gap | Tailwind |
|----------|-----|----------|
| Icone + texto (inline) | 8px | `gap-2` |
| Chips lado a lado | 4-8px | `gap-1` a `gap-2` |
| Items em lista | 0px | Separados por borda, sem gap |
| Botoes lado a lado | 8-12px | `gap-2` a `gap-3` |
| Secoes dentro de um card | 16px | `gap-4` ou `space-y-4` |
| Blocos independentes na tela | 24-32px | `gap-6` a `gap-8` |

### 4.4 Layout global

```
Max-width:    480px (max-w-[480px])
Centering:    margin: 0 auto
Min-height:   100dvh
Orientation:  Coluna unica, mobile-first
```

**Regra:** O app e uma coluna de no maximo 480px. Nao ha grids multi-coluna no nivel de tela. Dentro de componentes, usar flexbox.

### 4.5 Hierarquia visual por espacamento

O espacamento cria hierarquia: elementos proximos sao relacionados, distantes sao independentes.

```
Strip Semanal
    24-32px de separacao
Header do Programa (integrado ao bloco abaixo)
    0px — faz parte do mesmo bloco
Lista de Fichas
    divisor border-b entre itens, sem gap
    24px apos o bloco
Proximo bloco
```

**Pesos visuais da TelaInicial:**
- Strip: 20% (contexto motivacional)
- Header: 20% (informacao do programa)
- Lista: 60% (acao principal)

---

## 5. Bordas e Raios

### 5.1 Escala de border-radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 6px | Botoes pequenos, botao voltar, focus outline |
| `--radius-md` | 10px | Icone containers, botoes normais, form inputs |
| `--radius-lg` | 14px | Cards medios, containers de secao |
| `--radius-full` | 9999px | Chips (pill), badges, indicadores circulares |

### 5.2 Padroes de uso por componente

| Componente | Radius | Tailwind |
|------------|--------|----------|
| Chip / Badge | 9999px | `rounded-full` |
| Botao compacto | 8px | `rounded-[8px]` |
| Botao normal | 10px | `rounded-[10px]` |
| Icone container | 10px | `rounded-[10px]` |
| Card / Container | 14-16px | `rounded-2xl` |
| Header / NavBar | 16px | `rounded-2xl` |
| Dia na strip (circulo) | 9999px | `rounded-full` |
| Progress bar | 9999px | `rounded-full` |
| Streak badge (circulo) | 9999px | `rounded-full` |

### 5.3 Regras

- **Elementos interativos pequenos** (botoes, inputs): `8-10px`
- **Containers** (cards, secoes): `14-16px`
- **Elementos que devem ser circulares** (chips, badges, dias): `rounded-full`
- **Nunca misturar** raios drasticamente diferentes em elementos adjacentes do mesmo nivel. Se um card tem 14px, nao colocar um card vizinho com 6px.

---

## 6. Sombras e Elevacao

### 6.1 Niveis de sombra

| Nivel | Tailwind | Uso |
|-------|----------|-----|
| Nenhuma | — | Background, divisores |
| Sutil | `shadow-sm` | Cards em repouso, containers |
| Media | `shadow-md shadow-black/[0.04]` | Header, navbar, elementos flutuantes |
| Alta | `shadow-lg` | Toast, modais, popovers |
| Acento | `shadow-md shadow-acento/20` | FAB button (sombra com cor do acento) |

### 6.2 Backdrop blur

Usado em elementos que flutuam sobre conteudo:

```
backdrop-blur-xl backdrop-saturate-150
```

Aplicado em: Header (`CabecalhoApp`) e Bottom Nav (`NavegacaoInferior`).

**Combinado com:** `bg-superficie/70` (transparencia de 70%) para efeito de vidro sutil.

### 6.3 Regras

- Sombras sao **sutis**. Se uma sombra e notavel, provavelmente esta forte demais.
- Header e NavBar: shadow-md com `shadow-black/[0.04]` — quase imperceptivel, mas cria separacao.
- Cards: `shadow-sm` apenas no hover, nao em repouso (opcional).
- **Nunca usar** sombras coloridas (exceto FAB com `shadow-acento/20`).
- **Nunca usar** `drop-shadow` com cores neon ou vibrantes.

---

## 7. Componentes

### 7.1 Botao (`Botao.tsx`)

Tres variantes, dois tamanhos. Min-height 44px para acessibilidade.

**Variantes:**

| Variante | Background | Texto | Borda | Quando usar |
|----------|-----------|-------|-------|-------------|
| `primario` | `bg-acento` | `text-texto-invertido` | nenhuma | CTA principal. 1 por secao no maximo |
| `secundario` | `bg-superficie` | `text-texto-primario` | `border border-borda` | Acoes alternativas |
| `fantasma` | transparente | `text-texto-secundario` | nenhuma | Acoes terciarias, navegacao |

**Tamanhos:**

| Tamanho | Padding | Radius | Fonte | Min-height |
|---------|---------|--------|-------|------------|
| Normal | `px-4 py-3` | `rounded-[10px]` | `text-sm` | 44px |
| Compacto | `px-3 py-2` | `rounded-[8px]` | `text-xs` | — |

**Estados interativos (todos os botoes):**

| Estado | Efeito |
|--------|--------|
| Hover | `-translate-y-px` (lift de 1px) + shadow-sm |
| Active | `scale-[0.97]` + translate-y-0 (volta ao baseline) |
| Focus | `outline-2 outline-offset-2 outline-acento` |
| Disabled | `opacity-40 cursor-not-allowed` |

**Transicao:** `transition-all duration-200 ease-out`

### 7.2 Card / Container

**Padrao base:**

```
bg-superficie rounded-2xl border border-borda overflow-hidden
```

**Com padding interno:** `px-5 py-5` (espacoso) ou `px-4 py-3` (compacto)

**Com hover:** Adicionar `hover:shadow-sm transition-shadow duration-200`

**Divisores internos:** Usar `border-b border-borda-suave` entre itens. **Nunca** usar gap entre itens de lista dentro de um card — usar divisores.

**Regra de aninhamento:** Nunca aninhar cards dentro de cards. Se um card tem sub-itens, eles sao separados por divisores, nao por sub-cards.

### 7.3 Chip (`Chip.tsx`)

Usado para tags de grupo muscular.

```
px-2 py-0.5
bg-superficie-suave/80
rounded-md (6px)
text-xs text-texto-secundario font-semibold
```

**Hover:** `hover:bg-superficie-suave hover:text-texto-primario hover:scale-105`

**Layout:** Inline, com `flex flex-wrap gap-1`

### 7.4 Icone de Ficha (`IconeFicha`)

Container de icone/emoji para fichas de treino.

```
w-10 h-10 (cartao) ou w-12 h-12 (linha)
rounded-[10px]
bg-acento-suave
flex items-center justify-center
```

- Se tem emoji: renderiza `<span>` com fontSize dinamico
- Se nao tem: renderiza icone SVG via `<Icone>`
- Emoji tem prioridade sobre SVG quando presente

### 7.5 LinhaFicha

Item de lista representando uma ficha de treino.

**Normal:**
```
flex items-center gap-4 py-3 px-4
hover:bg-superficie-suave
transition-colors duration-150
```

**Proxima ficha (destaque):**
```
bg-acento-suave/50 animate-highlight-pulse
```
- Badge indicador: `w-4 h-4 bg-acento rounded-full ring-2 ring-superficie/90 animate-pulse-subtle`
- Botao "Iniciar": variante `primario` com shimmer overlay

**Separador entre itens:** `border-b border-borda-suave` (ultimo item sem borda)

### 7.6 StripSemanal

Faixa de atividade semanal com streak.

**Container:** `bg-superficie rounded-2xl px-5 py-5 space-y-4 shadow-sm`

**Streak badge:**
- Container: `w-11 h-11 rounded-full flex items-center justify-center`
- Ativo: `bg-[oklch(0.88_0.05_45)]` (laranja quente) + icone fogo com `animate-flame`
- Inativo: `bg-superficie-suave/80`
- Numero: `text-lg font-bold tabular-nums font-display`

**Dias da semana:**
- Tamanho: `w-9 h-9 rounded-full`
- Treinou: `bg-acento text-texto-invertido`
- Hoje (nao treinou): `ring-2 ring-inset ring-acento/40`
- Passado: `bg-superficie-suave/60 text-texto-secundario`

### 7.7 BannerPrograma

Header com informacoes do programa ativo.

- Titulo: `text-lg font-bold font-display text-texto-primario leading-tight`
- Descricao: `text-sm text-texto-secundario`
- Progress bar: `h-2 rounded-full bg-borda-suave overflow-hidden`
  - Fill: altura total, `rounded-full`, transicao `duration-700 ease-out`
  - Completa: `bg-acento animate-pulse-subtle` + shimmer gradient

### 7.8 Header da tela (`CabecalhoApp`)

Barra superior fixa com blur.

```
bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
border border-borda-suave/60
px-4 py-3
rounded-2xl
shadow-md shadow-black/[0.04]
```

Safe area: `pt-[max(env(safe-area-inset-top),8px)]`

### 7.9 Navegacao inferior (`NavegacaoInferior`)

Barra de navegacao fixa na base.

```
fixed bottom-0 left-5 right-5 z-50
bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
border border-borda-suave/60
rounded-2xl
shadow-md shadow-black/[0.04]
mb-[max(env(safe-area-inset-bottom),16px)]
```

**Tabs:**
- Min-height: 52px
- Texto: `text-[11px]`
- Ativo: `font-semibold` + indicador `w-1 h-1 rounded-full bg-acento`

**FAB (botao central "Novo"):**
```
w-[52px] h-[52px] rounded-full
bg-acento text-texto-invertido
shadow-md shadow-acento/20
-mt-[26px] (eleva acima da nav)
```

Hover: `hover:shadow-lg hover:shadow-acento/25 hover:-mt-[28px]`
Active: `scale-95 mt-[26px]`

### 7.10 Toast (`ToastNotificacao`)

Notificacoes temporarias na base da tela.

```
fixed bottom-6 left-1/2 -translate-x-1/2 z-50
flex items-center gap-3 px-4 py-3
rounded-xl border
```

Variantes de estilo:
- `sucesso`: `bg-superficie-suave border-borda-suave`
- `info`: `bg-superficie border-borda`
- `celebracao`: `bg-superficie-suave border-borda-suave`

Saida: `opacity-0 translate-y-4 scale-95`

### 7.11 Empty State (`EstadoVazio`)

Estado quando nao ha dados para exibir.

```
flex flex-col items-center justify-center
py-12 px-6 text-center
```

- Icone: `mb-4 text-texto-secundario` tamanho 48
- Titulo: `text-base font-semibold text-texto-primario mb-2`
- Descricao: `text-sm text-texto-secundario mb-6 max-w-[260px]`
- CTA: Botao primario ou secundario

**Regra:** Empty states ensinam a interface. Nao sao apenas "nada aqui". Devem guiar o proximo passo.

### 7.12 Formularios (inputs)

Padroes para campos de entrada (a serem construidos):

| Propriedade | Valor |
|-------------|-------|
| Background | `bg-superficie` |
| Borda | `border border-borda` |
| Radius | `rounded-[10px]` |
| Padding | `px-4 py-3` |
| Font | `text-base` |
| Placeholder | `text-texto-sutil` |
| Focus | `border-acento outline-none ring-2 ring-acento/20` |
| Min-height | 44px (target de toque) |

---

## 8. Animacao e Movimento

### 8.1 Principio

Movimento reforça feedback e estado. Uma transicao bem feita e melhor que dez animacoes decorativas. Foco em **entradas e confirmacoes**, nao em loops infinitos.

### 8.2 Timing

| Velocidade | Duracao | Uso |
|------------|---------|-----|
| Rapido | 100ms | Micro-interacoes (hover de chip) |
| Padrao | 150-200ms | Botoes, transicoes de estado |
| Suave | 300ms | Entradas de componentes, fade-in |
| Lento | 500-700ms | Transicoes de pagina, progress bars |

### 8.3 Easing

| Tipo | Valor | Uso |
|------|-------|-----|
| Padrao | `ease-out` | Maioria das interacoes |
| Suave | `ease-in-out` | Animacoes longas, progress bars |
| Nunca | `bounce`, `elastic` | Datados, nao condizem com o tom |

### 8.4 Animacoes definidas

| Nome | Duracao | Descricao | Uso |
|------|---------|-----------|-----|
| `fade-in` | 0.3s ease-out | Opacity 0→1 | Entrada de componentes |
| `slide-in-from-top-2` | 0.3s ease-out | TranslateY(-8px)→0 + fade | Dropdowns, popups |
| `slide-in-stagger` | 0.3s ease-out | TranslateX(-8px)→0 + fade | Itens de lista (com delay) |
| `pulse-subtle` | 2s infinite | Opacity 1→0.85→1 | Streak ativo, progress completo |
| `highlight-pulse` | 3s infinite | Background opacity oscila | Proxima ficha destaque |
| `flame-subtle` | 3s infinite | Scale 1→1.05, rotate ±2deg | Icone de fogo (streak) |
| `shimmer` | 2s infinite | TranslateX(-100%→100%) | Loading, progress bar completa |
| `shimmer-btn` | 2.5s infinite | TranslateX com skew | Botao da proxima ficha |
| `checkBounce` | 0.5s ease-out | Scale 0→1.2→1 | Toast de sucesso |
| `count-up` | — | TranslateY(0.25em)→0 + fade | Numeros que mudam |
| `button-press` | — | Scale 1→0.97→1 | Feedback de clique |

### 8.5 Stagger (escalonamento)

Para listas, usar delay incremental:

```
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
```

Maximo 4 niveis. Alem disso, o escalonamento perde impacto.

### 8.6 Estados interativos padrao

Todos os elementos interativos compartilham:

```
transition-all duration-200 ease-out
```

- **Hover:** `-translate-y-px` (lift de 1px) — sensacao de "elevacao"
- **Active:** `scale-[0.97] translate-y-0` — sensacao de "pressionar"
- **Transicao de cor:** `transition-colors duration-150`

### 8.7 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ja implementado globalmente. Todas as animacoes sao desabilitadas automaticamente.

---

## 9. Padroes de Tela

### 9.1 Anatomia de uma tela

Toda tela do Trainify segue esta estrutura:

```
[CabecalhoApp]                  ← fixo no topo, com blur
    Titulo da tela + navegacao

[Content Area]                  ← scroll vertical
    padding: px-5
    padding-top: ~16px (apos header)
    padding-bottom: ~100px (espaco para nav)

    [Secao 1]                   ← card ou secao direta
    [24-32px gap]
    [Secao 2]
    [24-32px gap]
    [...]

[NavegacaoInferior]             ← fixo na base, com blur
    Tabs + FAB
```

### 9.2 Header da tela

- Sempre inclui titulo (`text-2xl font-bold font-display tracking-tight`)
- Botao voltar quando nao e a tela raiz (fantasma, com icone chevron)
- Acoes secundarias a direita (links fantasma)

### 9.3 Listas dentro de cards

Padrao para qualquer lista de itens dentro de um container:

```tsx
<div className="bg-superficie rounded-2xl border border-borda overflow-hidden">
  {items.map((item, i) => (
    <div
      key={item.id}
      className={`px-4 py-3 ${i < items.length - 1 ? 'border-b border-borda-suave' : ''}`}
    >
      {/* conteudo do item */}
    </div>
  ))}
</div>
```

**Regra:** Ultimo item nunca tem borda inferior.

### 9.4 Secoes com titulo

```tsx
<div className="space-y-3">
  <h2 className="text-lg font-bold font-display text-texto-primario">
    Titulo da Secao
  </h2>
  {/* conteudo */}
</div>
```

Gap entre titulo e conteudo: 12px (`space-y-3`).

### 9.5 Safe areas

```
Top:    pt-[max(env(safe-area-inset-top), 8px)]     ← header
Bottom: mb-[max(env(safe-area-inset-bottom), 16px)]  ← nav
```

Content area precisa de padding-bottom suficiente (~100px) para nao ficar escondida atras da nav.

### 9.6 Checklist para nova tela

Ao criar uma nova tela, verificar:

- [ ] Usa `CabecalhoApp` com titulo e navegacao adequada
- [ ] Content area com `px-5` e padding-bottom para nav
- [ ] Secoes separadas por 24-32px
- [ ] Cards com `bg-superficie rounded-2xl border border-borda`
- [ ] Listas com divisores `border-b border-borda-suave`
- [ ] Texto segue a hierarquia tipografica (secao 3.6)
- [ ] Botoes primarios limitados a 1-2 por secao
- [ ] Empty states orientam o proximo passo
- [ ] Animacao de entrada `fade-in` no conteudo principal
- [ ] Elementos interativos com min-height 44px
- [ ] Numeros variaveis com `tabular-nums`
- [ ] Focus visible em todos os interativos

---

## 10. Acessibilidade

### 10.1 Contraste

| Combinacao | Ratio | Nivel |
|-----------|-------|-------|
| texto-primario / superficie | ~14.5:1 | AAA |
| texto-secundario / superficie | ~7.8:1 | AA |
| texto-invertido / acento | ~14.5:1 | AAA |

**Regra:** Nunca usar `texto-sutil` para informacao critica. Reservado para placeholders e elementos decorativos.

### 10.2 Touch targets

Minimo 44x44px para todos os elementos interativos (`min-h-[44px]`). Botoes compactos sao excecao apenas em contextos onde ha muitos botoes proximos (chips, toolbar).

### 10.3 Focus

```css
:focus-visible {
  outline: 2px solid var(--color-acento);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

Aplicado globalmente. `:focus:not(:focus-visible)` remove outline para cliques de mouse.

### 10.4 Reduced motion

Implementado globalmente (secao 8.7). Todas as animacoes respeitam `prefers-reduced-motion`.

### 10.5 Semantica

- Usar tags HTML corretos: `<button>` para acoes, `<a>` para navegacao, `<h1>`-`<h6>` para titulos
- Emojis em icones de ficha: `aria-hidden="true"` (decorativos)
- Labels descritivas em inputs de formulario
- Texto alternativo em contextos visuais (streak, progress)

---

## Apendice: Tokens rapidos

Referencia rapida para copiar-colar ao construir componentes:

```
-- SUPERFICIE --
bg-fundo                    Fundo da pagina
bg-superficie               Cards, containers
bg-superficie-suave         Hover sutil, chips
bg-superficie-hover         Hover forte

-- TEXTO --
text-texto-primario         Texto principal
text-texto-secundario       Texto secundario
text-texto-sutil            Placeholders
text-texto-invertido        Sobre fundo escuro

-- BORDA --
border-borda                Bordas estruturais
border-borda-suave          Divisores internos

-- ACENTO --
bg-acento                   CTA primario
bg-acento-hover             Hover do CTA
bg-acento-suave             Background sutil

-- TIPOGRAFIA --
font-display                Bricolage Grotesque
font-sans                   Figtree (padrao)

-- RAIO --
rounded-[8px]               Botao compacto
rounded-[10px]              Botao, input, icone
rounded-2xl                 Card, container
rounded-full                Chip, badge, circulo

-- INTERACAO --
transition-all duration-200 ease-out
hover:-translate-y-px       Lift
active:scale-[0.97]         Press
```
